"""
AI Highlight Detection Service - Detects emotional highlights in transcripts
Uses Claude via OpenRouter to identify key moments worth highlighting
"""
from typing import List
from openai import OpenAI
from loguru import logger

from app.core.config import settings
from app.schemas.common import HighlightLabel


def detect_highlights(transcript_text: str, chapter_id: str) -> List[dict]:
    """
    Detect emotional highlights in transcript text using Claude

    Args:
        transcript_text: Full transcript text to analyze
        chapter_id: The chapter context for better detection

    Returns:
        List of highlight suggestions with labels and approximate positions
    """
    if not settings.openai_api_key:
        logger.warning("OpenAI/OpenRouter API key not configured, skipping highlight detection")
        return []

    if len(transcript_text) < 50:
        logger.info("Transcript too short for highlight detection")
        return []

    try:
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        system_prompt = """Je bent een empathische AI die belangrijke emotionele momenten detecteert in levensverhalen.

Analyseer de transcriptie en identificeer maximaal 3-5 bijzondere momenten die de volgende labels kunnen krijgen:
- "laugh" (lachen): Grappige, vrolijke, luchtige momenten
- "insight" (inzicht): Wijsheid, levenslessen, belangrijke realisaties
- "love" (liefde): Warme, liefdevolle, dankbare momenten over mensen
- "wisdom" (wijsheid): Diepgaande reflecties, advies voor anderen

Geef je antwoord als een JSON array met objecten in dit formaat:
[
  {
    "label": "laugh",
    "text": "de exacte tekst uit de transcriptie die dit moment weergeeft",
    "reason": "waarom dit moment bijzonder is"
  }
]

Focus op authentieke, betekenisvolle momenten. Niet elk verhaal heeft alle labels nodig."""

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyseer deze transcriptie en vind de emotionele highlights:\n\n{transcript_text}"}
            ],
            temperature=0.7,
            max_tokens=1000,
            response_format={"type": "json_object"},
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        content = response.choices[0].message.content

        # Parse JSON response
        import json
        try:
            result = json.loads(content)
            # Handle both {"highlights": [...]} and direct array formats
            highlights = result.get("highlights", result) if isinstance(result, dict) else result

            if not isinstance(highlights, list):
                logger.warning(f"Unexpected highlight format: {type(highlights)}")
                return []

            logger.info(f"Detected {len(highlights)} highlights in transcript")
            return highlights

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse highlight detection response: {e}")
            logger.debug(f"Response content: {content}")
            return []

    except Exception as e:
        logger.error(f"Failed to detect highlights: {e}")
        return []


def find_text_position(full_text: str, highlight_text: str, words_per_second: float = 2.5) -> tuple[int, int]:
    """
    Find approximate start and end position (in ms) of highlight text in full transcript

    Args:
        full_text: Full transcript text
        highlight_text: Text snippet to find
        words_per_second: Average speaking rate for time estimation

    Returns:
        tuple: (start_ms, end_ms)
    """
    # Try to find the text
    pos = full_text.lower().find(highlight_text.lower())

    if pos == -1:
        # If exact match not found, return estimate based on text length
        logger.warning(f"Could not find exact position for highlight text")
        words_before = len(full_text.split()) // 2
        highlight_words = len(highlight_text.split())
        start_ms = int((words_before / words_per_second) * 1000)
        end_ms = int(((words_before + highlight_words) / words_per_second) * 1000)
        return start_ms, end_ms

    # Calculate position based on words before the highlight
    text_before = full_text[:pos]
    words_before = len(text_before.split())
    highlight_words = len(highlight_text.split())

    start_ms = int((words_before / words_per_second) * 1000)
    end_ms = int(((words_before + highlight_words) / words_per_second) * 1000)

    return start_ms, end_ms


def validate_highlight_label(label: str) -> HighlightLabel | None:
    """Validate and convert string label to HighlightLabel enum"""
    try:
        return HighlightLabel(label)
    except ValueError:
        logger.warning(f"Invalid highlight label: {label}")
        return None
