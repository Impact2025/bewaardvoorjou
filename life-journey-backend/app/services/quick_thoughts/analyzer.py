"""
AI Analyzer for Quick Thoughts - Auto-tagging, categorization, and chapter suggestions.

Uses Claude via OpenRouter to analyze quick thoughts and extract:
- Category (jeugd, familie, liefde, etc.)
- Tags (nostalgisch, emotioneel, grappig, etc.)
- Emotion score (0.0 = negative, 1.0 = positive)
- AI summary
- Suggested chapters
"""
import json
from typing import Any

from openai import OpenAI
from loguru import logger

from app.core.config import settings
from app.models.quick_thought import QUICK_THOUGHT_CATEGORIES, CHAPTER_MAPPING


# System prompt for quick thought analysis
ANALYSIS_SYSTEM_PROMPT = """Je bent een empathische AI-assistent die helpt bij het vastleggen van levensverhalen.

Analyseer de volgende korte gedachte of herinnering en geef een JSON response.

**Categorieën** (kies één):
- jeugd: Herinneringen uit de kindertijd
- familie: Familie, ouders, kinderen, verwanten
- liefde: Romantische relaties, partner
- vriendschap: Vrienden, sociale kring
- werk: Carrière, beroep, collega's
- school: Opleiding, studie, leraren
- reizen: Plekken, vakanties, avonturen
- verlies: Afscheid, rouw, gemis
- trots: Prestaties, overwinningen
- wijsheid: Levenslessen, inzichten
- humor: Grappige momenten
- traditie: Gewoontes, rituelen, feestdagen

**Tags** (max 5, vrije keuze):
- Korte, beschrijvende woorden in het Nederlands
- Personen (relatie, niet naam): "opa", "beste vriend"
- Emoties: "nostalgisch", "dankbaar", "verdrietig"
- Thema's: "oorlog", "verhuizing", "vakantie"

**Hoofdstukken** (suggereer max 2 met confidence > 0.6):
Beschikbare hoofdstukken:
- intro-reflection: Kernwoorden van je leven
- intro-intention: Je intentie
- intro-uniqueness: Wat maakt jou uniek
- youth-favorite-place: Je favoriete plek (jeugd)
- youth-sounds: Het geluid van toen
- youth-hero: Je held
- love-connection: Het moment van verbinding
- love-lessons: Lessen over liefde
- love-symbol: Een symbolisch voorwerp
- work-dream-job: Droom versus realiteit
- work-passion: Je grootste passie
- work-challenge: Een overwonnen uitdaging
- future-message: Een boodschap voor later
- future-dream: Een onvervulde droom
- future-gratitude: Dankbaarheid
- bonus-funny: Het grappigste moment
- bonus-relive: Een dag opnieuw
- bonus-culture: Culturele invloeden

**Output formaat (alleen valide JSON, geen markdown):**
{
    "category": "string",
    "tags": ["string", "string"],
    "emotion_score": 0.75,
    "summary": "Eén zin samenvatting (max 100 karakters)",
    "suggested_chapters": [
        {
            "chapter_id": "string",
            "confidence": 0.85,
            "reason": "Korte uitleg waarom dit hoofdstuk past"
        }
    ]
}

**Belangrijk:**
- Wees voorzichtig met emotie-score; neutraal = 0.5, positief > 0.5, negatief < 0.5
- Suggereer alleen hoofdstukken met confidence > 0.6
- De samenvatting moet de essentie vangen zonder namen te noemen
- Respecteer privacy: geen echte namen, alleen relaties (opa, nicht, vriend)
- Geef ALLEEN de JSON terug, geen andere tekst of markdown"""


def analyze_quick_thought_content(content: str) -> dict[str, Any]:
    """
    Analyze a quick thought's content using Claude AI.

    Args:
        content: The text content or transcript to analyze

    Returns:
        Dictionary with analysis results:
        - category: str
        - tags: list[str]
        - emotion_score: float (0.0-1.0)
        - summary: str
        - suggested_chapters: list[dict]
    """
    # Default fallback result
    fallback_result = {
        "category": None,
        "tags": [],
        "emotion_score": 0.5,
        "summary": None,
        "suggested_chapters": [],
    }

    if not content or len(content.strip()) < 5:
        logger.warning("Content too short for analysis")
        return fallback_result

    # Check if API is configured
    if not settings.openai_api_key:
        logger.warning("OpenAI/OpenRouter API key not configured, using fallback analysis")
        return _analyze_fallback(content)

    try:
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyseer deze gedachte:\n\n{content}"}
            ],
            temperature=0.3,  # Lower temperature for more consistent JSON
            max_tokens=300,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        raw_response = response.choices[0].message.content.strip()

        # Parse JSON response
        result = _parse_analysis_response(raw_response)

        logger.info(
            f"Quick thought analysis complete: "
            f"category={result.get('category')}, "
            f"tags={result.get('tags')}, "
            f"emotion={result.get('emotion_score')}"
        )

        return result

    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        return _analyze_fallback(content)


def _parse_analysis_response(raw_response: str) -> dict[str, Any]:
    """
    Parse the AI response into a structured dictionary.

    Handles various response formats and edge cases.
    """
    fallback = {
        "category": None,
        "tags": [],
        "emotion_score": 0.5,
        "summary": None,
        "suggested_chapters": [],
    }

    try:
        # Try to find JSON in the response (in case of markdown wrapping)
        json_str = raw_response

        # Remove markdown code blocks if present
        if "```json" in json_str:
            start = json_str.find("```json") + 7
            end = json_str.find("```", start)
            json_str = json_str[start:end].strip()
        elif "```" in json_str:
            start = json_str.find("```") + 3
            end = json_str.find("```", start)
            json_str = json_str[start:end].strip()

        # Find JSON object boundaries
        if "{" in json_str and "}" in json_str:
            start = json_str.find("{")
            end = json_str.rfind("}") + 1
            json_str = json_str[start:end]

        result = json.loads(json_str)

        # Validate and sanitize
        validated = {
            "category": _validate_category(result.get("category")),
            "tags": _validate_tags(result.get("tags", [])),
            "emotion_score": _validate_emotion_score(result.get("emotion_score")),
            "summary": _validate_summary(result.get("summary")),
            "suggested_chapters": _validate_suggested_chapters(result.get("suggested_chapters", [])),
        }

        return validated

    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse AI response as JSON: {e}")
        logger.debug(f"Raw response: {raw_response[:200]}...")
        return fallback
    except Exception as e:
        logger.error(f"Error parsing analysis response: {e}")
        return fallback


def _validate_category(category: Any) -> str | None:
    """Validate and normalize category."""
    if not category:
        return None

    category = str(category).lower().strip()
    valid_categories = set(QUICK_THOUGHT_CATEGORIES.keys())

    if category in valid_categories:
        return category

    # Try to match partial names
    for valid_cat in valid_categories:
        if valid_cat in category or category in valid_cat:
            return valid_cat

    return None


def _validate_tags(tags: Any) -> list[str]:
    """Validate and normalize tags."""
    if not tags or not isinstance(tags, list):
        return []

    validated = []
    for tag in tags[:5]:  # Max 5 tags
        if isinstance(tag, str) and len(tag.strip()) > 0:
            # Normalize: lowercase, strip, max 30 chars
            normalized = tag.strip().lower()[:30]
            if normalized and normalized not in validated:
                validated.append(normalized)

    return validated


def _validate_emotion_score(score: Any) -> float:
    """Validate and normalize emotion score."""
    if score is None:
        return 0.5

    try:
        score = float(score)
        return max(0.0, min(1.0, score))  # Clamp to [0, 1]
    except (ValueError, TypeError):
        return 0.5


def _validate_summary(summary: Any) -> str | None:
    """Validate and normalize summary."""
    if not summary:
        return None

    summary = str(summary).strip()
    if len(summary) > 500:
        summary = summary[:497] + "..."

    return summary if summary else None


def _validate_suggested_chapters(chapters: Any) -> list[dict]:
    """Validate and normalize suggested chapters."""
    if not chapters or not isinstance(chapters, list):
        return []

    valid_chapter_ids = set(CHAPTER_MAPPING.keys())
    validated = []

    for chapter in chapters[:2]:  # Max 2 suggestions
        if not isinstance(chapter, dict):
            continue

        chapter_id = chapter.get("chapter_id", "")
        confidence = chapter.get("confidence", 0.0)
        reason = chapter.get("reason", "")

        # Validate chapter_id
        if chapter_id not in valid_chapter_ids:
            continue

        # Validate confidence
        try:
            confidence = float(confidence)
            if confidence < 0.6:  # Only include high-confidence suggestions
                continue
            confidence = max(0.0, min(1.0, confidence))
        except (ValueError, TypeError):
            continue

        validated.append({
            "chapter_id": chapter_id,
            "confidence": confidence,
            "reason": str(reason)[:200] if reason else ""
        })

    return validated


def _analyze_fallback(content: str) -> dict[str, Any]:
    """
    Fallback analysis using simple keyword matching.

    Used when AI is not available.
    """
    text_lower = content.lower()

    # Category detection
    category = None
    category_keywords = {
        "jeugd": ["jong", "kind", "school", "spelen", "jeugd", "vroeger"],
        "familie": ["familie", "vader", "moeder", "opa", "oma", "broer", "zus"],
        "liefde": ["liefde", "verliefd", "partner", "getrouwd", "relatie"],
        "vriendschap": ["vriend", "vriendin", "vrienden", "samen"],
        "werk": ["werk", "baan", "kantoor", "collega", "carrière"],
        "reizen": ["reis", "vakantie", "land", "stad", "vliegen"],
        "verlies": ["verlies", "dood", "afscheid", "rouw", "missen"],
        "trots": ["trots", "prestatie", "gewonnen", "gehaald"],
        "humor": ["grappig", "lachen", "humor", "grap"],
    }

    for cat, keywords in category_keywords.items():
        if any(kw in text_lower for kw in keywords):
            category = cat
            break

    # Tag extraction
    tags = []
    tag_keywords = {
        "nostalgisch": ["vroeger", "toen", "herinner", "mis"],
        "emotioneel": ["huilen", "tranen", "emotie", "geraakt"],
        "dankbaar": ["dankbaar", "blij", "gelukkig"],
        "verdrietig": ["verdrietig", "droevog", "moeilijk"],
        "grappig": ["grappig", "lachen", "humor"],
    }

    for tag, keywords in tag_keywords.items():
        if any(kw in text_lower for kw in keywords):
            tags.append(tag)

    # Emotion score
    positive_words = ["blij", "gelukkig", "dankbaar", "trots", "vrolijk", "lachen"]
    negative_words = ["verdrietig", "moeilijk", "pijn", "verlies", "bang", "boos"]

    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)

    if pos_count > neg_count:
        emotion_score = 0.7
    elif neg_count > pos_count:
        emotion_score = 0.3
    else:
        emotion_score = 0.5

    # Summary
    summary = content[:97] + "..." if len(content) > 100 else content

    return {
        "category": category,
        "tags": tags[:5],
        "emotion_score": emotion_score,
        "summary": summary,
        "suggested_chapters": [],
    }


def build_interview_context_from_thoughts(
    thoughts: list[dict],
    chapter_id: str,
) -> str:
    """
    Build a context string from quick thoughts for the AI interviewer.

    This is used to make interview questions more personalized
    based on the user's previous quick thoughts.

    Args:
        thoughts: List of quick thought dictionaries
        chapter_id: The chapter being interviewed for

    Returns:
        Formatted context string for the AI interviewer
    """
    if not thoughts:
        return ""

    context_parts = []

    for i, thought in enumerate(thoughts[:5], 1):  # Max 5 thoughts
        content = thought.get("transcript") or thought.get("text_content") or ""
        summary = thought.get("ai_summary") or content[:100]
        tags = thought.get("auto_tags", [])

        context_parts.append(f"{i}. \"{summary}\"")
        if tags:
            context_parts.append(f"   (Tags: {', '.join(tags[:3])})")

    return "\n".join(context_parts)


def generate_thought_based_question(
    thoughts: list[dict],
    chapter_id: str,
) -> str | None:
    """
    Generate an interview question based on quick thoughts.

    This creates a personalized opening question that references
    the user's previous quick thoughts.

    Args:
        thoughts: List of quick thought dictionaries
        chapter_id: The chapter being interviewed for

    Returns:
        Personalized interview question or None
    """
    if not thoughts:
        return None

    if not settings.openai_api_key:
        return None

    # Get the most relevant thought
    most_relevant = None
    highest_confidence = 0.0

    for thought in thoughts:
        for suggestion in thought.get("suggested_chapters", []):
            if suggestion.get("chapter_id") == chapter_id:
                if suggestion.get("confidence", 0) > highest_confidence:
                    highest_confidence = suggestion["confidence"]
                    most_relevant = thought

    if not most_relevant:
        most_relevant = thoughts[0]

    content = most_relevant.get("transcript") or most_relevant.get("text_content") or ""
    summary = most_relevant.get("ai_summary") or content[:100]
    tags = most_relevant.get("auto_tags", [])

    try:
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        prompt = f"""De gebruiker heeft eerder deze gedachte gedeeld:
"{summary}"
Tags: {', '.join(tags) if tags else 'geen'}

Genereer ÉÉN warme, uitnodigende vraag die:
1. Refereert aan iets specifieks uit hun gedachte
2. Uitnodigt tot een dieper verhaal
3. Begint met "Je noemde..." of "Je deelde..."
4. Max 20 woorden

Alleen de vraag, geen uitleg."""

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "Je bent een warme interviewer voor levensverhalen."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=60,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        question = response.choices[0].message.content.strip()
        question = question.strip('"').strip("'")

        logger.info(f"Generated thought-based question: {question[:50]}...")
        return question

    except Exception as e:
        logger.error(f"Failed to generate thought-based question: {e}")
        return None
