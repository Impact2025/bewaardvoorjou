"""
AI Memory Service - Maintains context across recording sessions.

Provides persistent memory of user's responses, themes, and emotional patterns
to enable more personalized and context-aware interview experiences.
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Any

from loguru import logger
from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.media import MediaAsset, TranscriptSegment, PromptRun
from app.models.journey import Journey


_CACHE_TTL_HOURS = 6


class JourneyMemory:
    """Accumulated cross-chapter memory for a journey."""

    def __init__(
        self,
        journey_id: str,
        themes: list[str],
        key_people: list[str],
        key_places: list[str],
        key_events: list[str],
        emotional_tone: str,
        completed_chapters: list[str],
        chapter_summaries: dict[str, str],
    ):
        self.journey_id = journey_id
        self.themes = themes
        self.key_people = key_people
        self.key_places = key_places
        self.key_events = key_events
        self.emotional_tone = emotional_tone
        self.completed_chapters = completed_chapters
        self.chapter_summaries = chapter_summaries

    def to_context_string(self, current_chapter: str | None = None) -> str:
        parts = []

        if self.completed_chapters:
            completed = [c for c in self.completed_chapters if c != current_chapter]
            if completed:
                parts.append(f"De gebruiker heeft al gesproken over: {', '.join(self._format_chapters(completed[:5]))}")

        if self.key_people:
            parts.append(f"Belangrijke mensen in het verhaal: {', '.join(self.key_people[:5])}")

        if self.key_places:
            parts.append(f"Genoemde plaatsen: {', '.join(self.key_places[:5])}")

        if self.key_events:
            parts.append(f"Sleutelmomenten: {', '.join(self.key_events[:3])}")

        if self.themes:
            parts.append(f"Terugkerende thema's: {', '.join(self.themes[:3])}")

        if self.emotional_tone:
            parts.append(f"Algemene emotionele toon: {self.emotional_tone}")

        relevant_summaries = self._get_relevant_summaries(current_chapter)
        for chapter_id, summary in relevant_summaries[:2]:
            chapter_name = self._format_chapter(chapter_id)
            parts.append(f"Over {chapter_name}: {summary}")

        return "\n".join(parts) if parts else ""

    def _format_chapters(self, chapter_ids: list[str]) -> list[str]:
        return [self._format_chapter(c) for c in chapter_ids]

    def _format_chapter(self, chapter_id: str) -> str:
        from app.services.email.chapter_names import get_chapter_name
        return get_chapter_name(chapter_id)

    def _get_relevant_summaries(self, current_chapter: str | None) -> list[tuple[str, str]]:
        if not self.chapter_summaries:
            return []
        return [(k, v) for k, v in self.chapter_summaries.items() if k != current_chapter][:2]


def _call_claude(system: str, user: str, max_tokens: int = 256) -> str | None:
    """Call Claude via OpenRouter. Returns response text or None on failure."""
    if not settings.openai_api_key:
        return None
    try:
        client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_api_base)
        resp = client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            max_tokens=max_tokens,
            temperature=0.2,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as exc:
        logger.warning(f"Claude call failed in memory service: {exc}")
        return None


def _ai_extract_people(text: str) -> list[str]:
    """Use Claude to extract named persons with their relation."""
    result = _call_claude(
        system="Je bent een Nederlandse NLP-assistent. Extraheer personen uit de tekst.",
        user=(
            f"Tekst:\n{text[:2000]}\n\n"
            "Noem alle personen die worden genoemd (naam of relatie, bijv. 'oma Riet', 'vader Jan', 'mijn beste vriend'). "
            "Geef maximaal 8 entries. Antwoord als JSON array van strings, niets anders."
        ),
        max_tokens=200,
    )
    if result:
        try:
            parsed = json.loads(result)
            if isinstance(parsed, list):
                return [str(p) for p in parsed[:8]]
        except (json.JSONDecodeError, ValueError):
            pass
    # keyword fallback
    keywords = ["mama", "papa", "opa", "oma", "partner", "vriend", "vriendin", "broer", "zus", "man", "vrouw"]
    found = set()
    lower = text.lower()
    for kw in keywords:
        if kw in lower:
            found.add(kw.capitalize())
    return list(found)[:5]


def _ai_extract_places(text: str) -> list[str]:
    """Use Claude to extract locations from text."""
    result = _call_claude(
        system="Je bent een Nederlandse NLP-assistent. Extraheer plaatsnamen uit de tekst.",
        user=(
            f"Tekst:\n{text[:2000]}\n\n"
            "Noem alle geografische plaatsen (steden, dorpen, gebouwen, straten, landen) die worden vermeld. "
            "Maximaal 8 entries. Antwoord als JSON array van strings, niets anders."
        ),
        max_tokens=200,
    )
    if result:
        try:
            parsed = json.loads(result)
            if isinstance(parsed, list):
                return [str(p) for p in parsed[:8]]
        except (json.JSONDecodeError, ValueError):
            pass
    return []


def _ai_extract_events(text: str) -> list[str]:
    """Use Claude to extract key life events from text."""
    result = _call_claude(
        system="Je bent een Nederlandse NLP-assistent die levensverhalen analyseert.",
        user=(
            f"Tekst:\n{text[:2000]}\n\n"
            "Noem de belangrijkste levensgebeurtenissen (huwelijk, geboorte kind, verhuizing, verlies, eerste baan etc.) "
            "die worden beschreven. Maximaal 5 entries in 1-5 woorden elk. "
            "Antwoord als JSON array van strings, niets anders."
        ),
        max_tokens=200,
    )
    if result:
        try:
            parsed = json.loads(result)
            if isinstance(parsed, list):
                return [str(e) for e in parsed[:5]]
        except (json.JSONDecodeError, ValueError):
            pass
    return []


def _ai_summarize_chapter(chapter_id: str, text: str) -> str:
    """Use Claude to produce a 2-3 sentence summary of a chapter transcript."""
    result = _call_claude(
        system=(
            "Je bent een empathische assistent die levensverhalen samenvat. "
            "Schrijf beknopte, warme samenvattingen in het Nederlands."
        ),
        user=(
            f"Hoofdstuk: {chapter_id}\n\nTranscript:\n{text[:3000]}\n\n"
            "Vat dit verhaalfragment samen in 2-3 zinnen. "
            "Focus op: genoemde namen, plaatsen, emoties en kernthema's. "
            "Maximaal 120 woorden. Schrijf in de derde persoon ('De verteller...')."
        ),
        max_tokens=160,
    )
    if result:
        return result
    # fallback: first 120 chars
    if len(text) > 120:
        return text[:120].rsplit(" ", 1)[0] + "…"
    return text


def build_journey_memory(db: Session, journey_id: str) -> JourneyMemory:
    """Build a JourneyMemory from all ready recordings. Uses DB cache to avoid redundant AI calls."""
    from app.models.memory_cache import JourneyMemoryCache

    # Check cache
    cached: JourneyMemoryCache | None = (
        db.query(JourneyMemoryCache).filter(JourneyMemoryCache.journey_id == journey_id).first()
    )
    if cached:
        age = datetime.now(timezone.utc) - (
            cached.built_at.replace(tzinfo=timezone.utc) if cached.built_at.tzinfo is None else cached.built_at
        )
        current_count = db.query(MediaAsset).filter(
            MediaAsset.journey_id == journey_id,
            MediaAsset.storage_state == "ready",
        ).count()
        if age < timedelta(hours=_CACHE_TTL_HOURS) and current_count == cached.chapters_included:
            try:
                data: dict[str, Any] = json.loads(cached.memory_json)
                return JourneyMemory(
                    journey_id=journey_id,
                    themes=data.get("themes", []),
                    key_people=data.get("key_people", []),
                    key_places=data.get("key_places", []),
                    key_events=data.get("key_events", []),
                    emotional_tone=data.get("emotional_tone", "reflectief"),
                    completed_chapters=data.get("completed_chapters", []),
                    chapter_summaries=data.get("chapter_summaries", {}),
                )
            except Exception:
                pass  # Rebuild on corrupt cache

    # Fetch assets and transcripts
    assets = (
        db.query(MediaAsset)
        .filter(MediaAsset.journey_id == journey_id, MediaAsset.storage_state == "ready")
        .order_by(MediaAsset.recorded_at.asc())
        .all()
    )

    transcripts: list[dict[str, Any]] = []
    for asset in assets:
        segs = (
            db.query(TranscriptSegment)
            .filter(TranscriptSegment.media_asset_id == asset.id)
            .order_by(TranscriptSegment.start_ms.asc())
            .all()
        )
        if segs:
            full_text = " ".join(s.text for s in segs)
            transcripts.append({
                "chapter_id": asset.chapter_id,
                "text": full_text,
                "sentiment": segs[0].sentiment,
            })

    completed_chapters = list(dict.fromkeys(a.chapter_id for a in assets))
    all_text = " ".join(t["text"] for t in transcripts)

    themes = _extract_themes(transcripts)
    key_people = _ai_extract_people(all_text) if all_text else []
    key_places = _ai_extract_places(all_text) if all_text else []
    key_events = _ai_extract_events(all_text) if all_text else []
    emotional_tone = _determine_emotional_tone(transcripts)
    chapter_summaries = {
        t["chapter_id"]: _ai_summarize_chapter(t["chapter_id"], t["text"])
        for t in transcripts
    }

    memory = JourneyMemory(
        journey_id=journey_id,
        themes=themes,
        key_people=key_people,
        key_places=key_places,
        key_events=key_events,
        emotional_tone=emotional_tone,
        completed_chapters=completed_chapters,
        chapter_summaries=chapter_summaries,
    )

    # Persist to cache
    memory_dict: dict[str, Any] = {
        "themes": themes,
        "key_people": key_people,
        "key_places": key_places,
        "key_events": key_events,
        "emotional_tone": emotional_tone,
        "completed_chapters": completed_chapters,
        "chapter_summaries": chapter_summaries,
    }
    try:
        if cached:
            cached.memory_json = json.dumps(memory_dict, ensure_ascii=False)
            cached.built_at = datetime.now(timezone.utc)
            cached.chapters_included = len(assets)
        else:
            db.add(JourneyMemoryCache(
                journey_id=journey_id,
                memory_json=json.dumps(memory_dict, ensure_ascii=False),
                built_at=datetime.now(timezone.utc),
                chapters_included=len(assets),
            ))
        db.commit()
    except Exception as exc:
        logger.warning(f"Failed to persist memory cache for journey {journey_id}: {exc}")

    logger.info(f"Built memory for journey {journey_id}: {len(completed_chapters)} chapters, {len(key_people)} people, {len(key_places)} places")
    return memory


def _extract_themes(transcripts: list[dict]) -> list[str]:
    theme_keywords = {
        "familie": ["familie", "ouders", "kinderen", "broer", "zus", "opa", "oma"],
        "liefde": ["liefde", "verliefd", "partner", "huwelijk", "relatie"],
        "werk": ["werk", "baan", "carrière", "collega", "kantoor"],
        "jeugd": ["jeugd", "kindertijd", "school", "spelen", "opgroeien"],
        "verlies": ["verlies", "afscheid", "missen", "verdriet", "dood"],
        "groei": ["geleerd", "groeien", "veranderen", "ontwikkeling"],
        "dromen": ["droom", "hopen", "toekomst", "wens", "ambitie"],
    }
    theme_counts: dict[str, int] = {}
    for t in transcripts:
        text = t["text"].lower()
        for theme, keywords in theme_keywords.items():
            if any(k in text for k in keywords):
                theme_counts[theme] = theme_counts.get(theme, 0) + 1
    return [t for t, _ in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]]


def _determine_emotional_tone(transcripts: list[dict]) -> str:
    counts: dict[str, int] = {"positive": 0, "neutral": 0, "somber": 0, "mixed": 0}
    for t in transcripts:
        s = t.get("sentiment", "neutral")
        if s in counts:
            counts[s] += 1
    if not any(counts.values()):
        return "reflectief"
    dominant = max(counts.items(), key=lambda x: x[1])[0]
    return {"positive": "positief en dankbaar", "neutral": "reflectief en beschouwend",
            "somber": "emotioneel en diepgaand", "mixed": "gevarieerd en rijk"}.get(dominant, "reflectief")


def get_personalized_prompt_context(db: Session, journey_id: str, chapter_id: str) -> str:
    memory = build_journey_memory(db, journey_id)
    return memory.to_context_string(current_chapter=chapter_id)
