"""
Journey Progress Service
Handles chapter unlock logic and progress tracking

PERFORMANCE OPTIMIZED: Uses bulk queries instead of per-chapter queries
"""

from typing import Dict, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.journey import Journey as JourneyModel
from app.models.media import MediaAsset as MediaAssetModel


# Chapter order defines the linear progression
CHAPTER_ORDER = [
    # Fase 1: Voorbereiding & Introductie
    "intro-reflection",
    "intro-intention",
    "intro-uniqueness",
    # Fase 2: De Vroege Jaren & Jeugd
    "youth-favorite-place",
    "youth-sounds",
    "youth-hero",
    # Fase 3: Liefde, Relaties & Vriendschappen
    "love-connection",
    "love-lessons",
    "love-symbol",
    # Fase 4: Werk, Carrière & Passies
    "work-dream-job",
    "work-passion",
    "work-challenge",
    # Fase 5: Levenslessen & Toekomstdromen
    "future-message",
    "future-dream",
    "future-gratitude",
    # Bonus: Aanvullende Vragen (altijd unlocked after fase 5)
    "bonus-funny",
    "bonus-relive",
    "bonus-culture",
    # De Verborgen Dimensies (unlocked after bonus phase)
    "deep-daily-ritual",
    "deep-favorite-time",
    "deep-ugly-object",
    "deep-near-death",
    "deep-misconception",
    "deep-recurring-dream",
    "deep-life-chapters",
    "deep-intuition-choice",
    "deep-money-impact",
    "deep-shadow-side",
    "deep-life-meal",
    "deep-statue",
]

# Chapter categories for unlock logic
BONUS_CHAPTERS = {"bonus-funny", "bonus-relive", "bonus-culture"}
DEEP_CHAPTERS = {
    "deep-daily-ritual", "deep-favorite-time", "deep-ugly-object",
    "deep-near-death", "deep-misconception", "deep-recurring-dream",
    "deep-life-chapters", "deep-intuition-choice", "deep-money-impact",
    "deep-shadow-side", "deep-life-meal", "deep-statue"
}


def _is_chapter_unlocked_fast(chapter_id: str, media_counts: Dict[str, int]) -> bool:
    """
    Check if chapter is unlocked using preloaded media counts.
    No additional database queries needed!
    """
    # First chapter is always unlocked
    if chapter_id == CHAPTER_ORDER[0]:
        return True

    # Bonus chapters unlock after completing fase 5
    if chapter_id in BONUS_CHAPTERS:
        return media_counts.get("future-gratitude", 0) > 0

    # Deep chapters unlock after completing bonus phase
    if chapter_id in DEEP_CHAPTERS:
        return media_counts.get("bonus-culture", 0) > 0

    # Regular chapters: check if previous chapter has media
    try:
        idx = CHAPTER_ORDER.index(chapter_id)
        if idx > 0:
            prev_chapter = CHAPTER_ORDER[idx - 1]
            return media_counts.get(prev_chapter, 0) > 0
    except ValueError:
        return True

    return False


def get_all_chapter_statuses(db: Session, journey_id: str) -> Dict[str, Dict]:
    """
    Get status for all chapters in the journey.
    
    PERFORMANCE OPTIMIZED: Uses a single GROUP BY query instead of
    60-90 individual queries. Reduces load time from seconds to milliseconds.
    
    Returns: { "chapter-id": { status, mediaCount, isUnlocked }, ... }
    """
    # OPTIMIZATION: Single query to get all media counts by chapter
    media_counts_query = (
        db.query(
            MediaAssetModel.chapter_id,
            func.count(MediaAssetModel.id).label('count')
        )
        .filter(MediaAssetModel.journey_id == journey_id)
        .group_by(MediaAssetModel.chapter_id)
        .all()
    )

    # Convert to dict for O(1) lookup
    media_counts = {row.chapter_id: row.count for row in media_counts_query}

    # Build statuses using the preloaded media counts - NO MORE QUERIES!
    statuses = {}
    for chapter_id in CHAPTER_ORDER:
        media_count = media_counts.get(chapter_id, 0)
        is_unlocked = _is_chapter_unlocked_fast(chapter_id, media_counts)

        if media_count > 0:
            status = "completed"
        elif is_unlocked:
            status = "available"
        else:
            status = "locked"

        statuses[chapter_id] = {
            "status": status,
            "mediaCount": media_count,
            "isUnlocked": is_unlocked
        }

    return statuses


def get_chapter_status(db: Session, journey_id: str, chapter_id: str) -> Dict[str, any]:
    """
    Get the status of a specific chapter.
    For single chapter lookups - uses the optimized bulk function internally.
    """
    statuses = get_all_chapter_statuses(db, journey_id)
    return statuses.get(chapter_id, {
        "status": "locked",
        "mediaCount": 0,
        "isUnlocked": False
    })


def is_chapter_unlocked(db: Session, journey_id: str, chapter_id: str) -> bool:
    """
    Check if a chapter is unlocked based on linear progression rules.
    Uses the optimized bulk query internally.
    """
    statuses = get_all_chapter_statuses(db, journey_id)
    return statuses.get(chapter_id, {}).get("isUnlocked", False)


def get_journey_progress(db: Session, journey_id: str) -> Dict[str, any]:
    """
    Get overall journey progress statistics.
    """
    statuses = get_all_chapter_statuses(db, journey_id)

    total = len(CHAPTER_ORDER)
    completed = sum(1 for s in statuses.values() if s["status"] == "completed")
    available = sum(1 for s in statuses.values() if s["status"] == "available")

    return {
        "totalChapters": total,
        "completedChapters": completed,
        "availableChapters": available,
        "percentComplete": round((completed / total) * 100, 1) if total > 0 else 0
    }


def get_next_available_chapter(db: Session, journey_id: str) -> str | None:
    """
    Get the ID of the next available (unlocked but not completed) chapter.
    """
    statuses = get_all_chapter_statuses(db, journey_id)

    for chapter_id in CHAPTER_ORDER:
        status = statuses.get(chapter_id, {}).get("status")
        if status == "available":
            return chapter_id

    return None


def get_previous_chapters_summary(db: Session, journey_id: str, current_chapter_id: str) -> str | None:
    """
    Get a summary of completed chapters before the current one.
    This provides context to the AI for better prompt generation.
    """
    try:
        current_index = CHAPTER_ORDER.index(current_chapter_id)
    except ValueError:
        return None

    if current_index == 0:
        return None

    # Use optimized bulk query
    statuses = get_all_chapter_statuses(db, journey_id)
    
    completed_chapters = []
    for i in range(current_index):
        chapter_id = CHAPTER_ORDER[i]
        if statuses.get(chapter_id, {}).get("status") == "completed":
            completed_chapters.append(chapter_id)

    if not completed_chapters:
        return None

    chapter_names = [ch.replace("-", " ").title() for ch in completed_chapters]
    return f"De deelnemer heeft al content gedeeld over: {', '.join(chapter_names)}."
