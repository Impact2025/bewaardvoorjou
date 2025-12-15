"""
AI Memory Service - Maintains context across recording sessions.

Provides persistent memory of user's responses, themes, and emotional patterns
to enable more personalized and context-aware interview experiences.
"""

from datetime import datetime, timezone
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from app.models.media import MediaAsset, TranscriptSegment, PromptRun
from app.models.journey import Journey
from app.schemas.common import ChapterId


class JourneyMemory:
    """
    Represents the accumulated memory/context for a journey.

    Contains extracted themes, emotional patterns, key people,
    and important events mentioned across all recordings.
    """

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
        """
        Convert memory to a context string for AI prompts.

        Args:
            current_chapter: The chapter being recorded (to exclude from context)

        Returns:
            A formatted context string
        """
        parts = []

        # Add completed chapters context
        if self.completed_chapters:
            completed = [c for c in self.completed_chapters if c != current_chapter]
            if completed:
                parts.append(f"De gebruiker heeft al gesproken over: {', '.join(self._format_chapters(completed[:5]))}")

        # Add key people
        if self.key_people:
            parts.append(f"Belangrijke mensen in het verhaal: {', '.join(self.key_people[:5])}")

        # Add key places
        if self.key_places:
            parts.append(f"Genoemde plaatsen: {', '.join(self.key_places[:3])}")

        # Add themes
        if self.themes:
            parts.append(f"Terugkerende thema's: {', '.join(self.themes[:3])}")

        # Add emotional tone
        if self.emotional_tone:
            parts.append(f"Algemene emotionele toon: {self.emotional_tone}")

        # Add chapter summaries (max 2 most relevant)
        relevant_summaries = self._get_relevant_summaries(current_chapter)
        for chapter_id, summary in relevant_summaries[:2]:
            chapter_name = self._format_chapter(chapter_id)
            parts.append(f"Over {chapter_name}: {summary}")

        return "\n".join(parts) if parts else ""

    def _format_chapters(self, chapter_ids: list[str]) -> list[str]:
        """Format chapter IDs to readable names."""
        return [self._format_chapter(c) for c in chapter_ids]

    def _format_chapter(self, chapter_id: str) -> str:
        """Format a single chapter ID to readable name."""
        # Simple mapping - could be expanded
        parts = chapter_id.replace("-", " ").split()
        if len(parts) >= 2:
            return parts[1].capitalize()
        return chapter_id

    def _get_relevant_summaries(self, current_chapter: str | None) -> list[tuple[str, str]]:
        """Get summaries most relevant to the current chapter."""
        if not self.chapter_summaries:
            return []

        # For now, return the most recent summaries
        # Could be enhanced with semantic similarity
        return [
            (k, v) for k, v in self.chapter_summaries.items()
            if k != current_chapter
        ][:2]


def build_journey_memory(db: Session, journey_id: str) -> JourneyMemory:
    """
    Build a memory/context object from a journey's recordings.

    Args:
        db: Database session
        journey_id: ID of the journey

    Returns:
        JourneyMemory with extracted context
    """
    # Get all completed media assets
    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.journey_id == journey_id,
            MediaAsset.storage_state == "ready",
        )
        .order_by(MediaAsset.recorded_at.asc())
        .all()
    )

    # Get all transcripts
    transcripts = []
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
                "sentiment": segs[0].sentiment if segs else None,
            })

    # Get prompt runs
    prompt_runs = (
        db.query(PromptRun)
        .filter(PromptRun.journey_id == journey_id)
        .all()
    )

    # Extract completed chapters
    completed_chapters = list(set(a.chapter_id for a in assets))

    # Extract themes, people, places (simplified - could use NLP)
    themes = _extract_themes(transcripts)
    key_people = _extract_people(transcripts)
    key_places = _extract_places(transcripts)
    key_events = _extract_events(transcripts)

    # Determine emotional tone
    emotional_tone = _determine_emotional_tone(transcripts)

    # Build chapter summaries
    chapter_summaries = _build_chapter_summaries(transcripts)

    logger.info(f"Built memory for journey {journey_id}: {len(completed_chapters)} chapters, {len(themes)} themes")

    return JourneyMemory(
        journey_id=journey_id,
        themes=themes,
        key_people=key_people,
        key_places=key_places,
        key_events=key_events,
        emotional_tone=emotional_tone,
        completed_chapters=completed_chapters,
        chapter_summaries=chapter_summaries,
    )


def _extract_themes(transcripts: list[dict]) -> list[str]:
    """Extract recurring themes from transcripts."""
    # Simplified extraction - could use NLP/AI
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
    for transcript in transcripts:
        text = transcript["text"].lower()
        for theme, keywords in theme_keywords.items():
            if any(k in text for k in keywords):
                theme_counts[theme] = theme_counts.get(theme, 0) + 1

    # Return top themes
    sorted_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)
    return [t[0] for t in sorted_themes[:5]]


def _extract_people(transcripts: list[dict]) -> list[str]:
    """Extract mentioned people from transcripts."""
    # Simplified - could use NER
    people_keywords = ["mama", "papa", "opa", "oma", "partner", "vriend", "vriendin"]
    found = set()

    for transcript in transcripts:
        text = transcript["text"].lower()
        for person in people_keywords:
            if person in text:
                found.add(person.capitalize())

    return list(found)[:5]


def _extract_places(transcripts: list[dict]) -> list[str]:
    """Extract mentioned places from transcripts."""
    # Simplified - could use NER
    place_indicators = ["in ", "naar ", "uit ", "bij "]
    # This is a placeholder - real implementation would use NLP
    return []


def _extract_events(transcripts: list[dict]) -> list[str]:
    """Extract key events from transcripts."""
    # Placeholder for event extraction
    return []


def _determine_emotional_tone(transcripts: list[dict]) -> str:
    """Determine the overall emotional tone of recordings."""
    sentiment_counts = {"positive": 0, "neutral": 0, "somber": 0, "mixed": 0}

    for transcript in transcripts:
        sentiment = transcript.get("sentiment", "neutral")
        if sentiment in sentiment_counts:
            sentiment_counts[sentiment] += 1

    # Find dominant sentiment
    if not any(sentiment_counts.values()):
        return "reflectief"

    dominant = max(sentiment_counts.items(), key=lambda x: x[1])

    tone_map = {
        "positive": "positief en dankbaar",
        "neutral": "reflectief en beschouwend",
        "somber": "emotioneel en diepgaand",
        "mixed": "gevarieerd en rijk",
    }

    return tone_map.get(dominant[0], "reflectief")


def _build_chapter_summaries(transcripts: list[dict]) -> dict[str, str]:
    """Build short summaries for each chapter."""
    summaries = {}

    for transcript in transcripts:
        chapter_id = transcript["chapter_id"]
        text = transcript["text"]

        # Simple summary - first 100 chars
        # Could use AI summarization
        if len(text) > 100:
            summary = text[:100].rsplit(" ", 1)[0] + "..."
        else:
            summary = text

        summaries[chapter_id] = summary

    return summaries


def get_personalized_prompt_context(
    db: Session,
    journey_id: str,
    chapter_id: str,
) -> str:
    """
    Get personalized context for generating interview prompts.

    Args:
        db: Database session
        journey_id: ID of the journey
        chapter_id: Current chapter being recorded

    Returns:
        Context string for AI prompts
    """
    memory = build_journey_memory(db, journey_id)
    return memory.to_context_string(current_chapter=chapter_id)
