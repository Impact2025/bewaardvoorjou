"""
Journey Progress Service
Handles chapter unlock logic and progress tracking
"""

from typing import Dict, List
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


def get_chapter_status(db: Session, journey_id: str, chapter_id: str) -> Dict[str, any]:
    """
    Get the status of a specific chapter
    Returns: {
        "status": "locked" | "available" | "completed",
        "mediaCount": int,
        "isUnlocked": bool
    }
    """
    # Get media count for this chapter
    media_count = (
        db.query(MediaAssetModel)
        .filter(
            MediaAssetModel.journey_id == journey_id,
            MediaAssetModel.chapter_id == chapter_id
        )
        .count()
    )

    # Determine if chapter is unlocked
    is_unlocked = is_chapter_unlocked(db, journey_id, chapter_id)

    # Determine status
    if media_count > 0:
        status = "completed"
    elif is_unlocked:
        status = "available"
    else:
        status = "locked"

    return {
        "status": status,
        "mediaCount": media_count,
        "isUnlocked": is_unlocked
    }


def is_chapter_unlocked(db: Session, journey_id: str, chapter_id: str) -> bool:
    """
    Check if a chapter is unlocked based on linear progression rules
    """
    # First chapter is always unlocked
    if chapter_id == CHAPTER_ORDER[0]:
        return True

    # Bonus chapters are unlocked after completing fase 5
    bonus_chapters = ["bonus-funny", "bonus-relive", "bonus-culture"]
    if chapter_id in bonus_chapters:
        # Check if last chapter of fase 5 has media
        last_fase5_chapter = "future-gratitude"
        media_count = (
            db.query(MediaAssetModel)
            .filter(
                MediaAssetModel.journey_id == journey_id,
                MediaAssetModel.chapter_id == last_fase5_chapter
            )
            .count()
        )
        return media_count > 0

    # Deep chapters (Verborgen Dimensies) are unlocked after completing bonus phase
    deep_chapters = [
        "deep-daily-ritual", "deep-favorite-time", "deep-ugly-object",
        "deep-near-death", "deep-misconception", "deep-recurring-dream",
        "deep-life-chapters", "deep-intuition-choice", "deep-money-impact",
        "deep-shadow-side", "deep-life-meal", "deep-statue"
    ]
    if chapter_id in deep_chapters:
        # Check if last bonus chapter has media
        last_bonus_chapter = "bonus-culture"
        media_count = (
            db.query(MediaAssetModel)
            .filter(
                MediaAssetModel.journey_id == journey_id,
                MediaAssetModel.chapter_id == last_bonus_chapter
            )
            .count()
        )
        return media_count > 0

    # For other chapters: check if previous chapter has media
    try:
        chapter_index = CHAPTER_ORDER.index(chapter_id)
        if chapter_index > 0:
            previous_chapter = CHAPTER_ORDER[chapter_index - 1]
            media_count = (
                db.query(MediaAssetModel)
                .filter(
                    MediaAssetModel.journey_id == journey_id,
                    MediaAssetModel.chapter_id == previous_chapter
                )
                .count()
            )
            return media_count > 0
    except ValueError:
        # Chapter not in order list - allow it
        return True

    return False


def get_all_chapter_statuses(db: Session, journey_id: str) -> Dict[str, Dict]:
    """
    Get status for all chapters in the journey
    Returns: { "chapter-id": { status, mediaCount, isUnlocked }, ... }
    """
    statuses = {}
    for chapter_id in CHAPTER_ORDER:
        statuses[chapter_id] = get_chapter_status(db, journey_id, chapter_id)
    return statuses


def get_journey_progress(db: Session, journey_id: str) -> Dict[str, any]:
    """
    Get overall journey progress statistics
    Returns: {
        "totalChapters": int,
        "completedChapters": int,
        "availableChapters": int,
        "percentComplete": float
    }
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
    Get the ID of the next available (unlocked but not completed) chapter
    """
    statuses = get_all_chapter_statuses(db, journey_id)

    for chapter_id in CHAPTER_ORDER:
        status = statuses.get(chapter_id, {}).get("status")
        if status == "available":
            return chapter_id

    return None


def get_previous_chapters_summary(db: Session, journey_id: str, current_chapter_id: str) -> str | None:
    """
    Get a summary of completed chapters before the current one
    This provides context to the AI for better prompt generation

    Returns a string describing which chapters have been completed
    """
    try:
        current_index = CHAPTER_ORDER.index(current_chapter_id)
    except ValueError:
        # Current chapter not in order - no context available
        return None

    if current_index == 0:
        # First chapter - no previous context
        return None

    # Get all previous chapters that have been completed
    completed_chapters = []
    for i in range(current_index):
        chapter_id = CHAPTER_ORDER[i]
        media_count = (
            db.query(MediaAssetModel)
            .filter(
                MediaAssetModel.journey_id == journey_id,
                MediaAssetModel.chapter_id == chapter_id
            )
            .count()
        )
        if media_count > 0:
            completed_chapters.append(chapter_id)

    if not completed_chapters:
        return None

    # Create a simple summary
    chapter_names = [ch.replace("-", " ").title() for ch in completed_chapters]
    return f"De deelnemer heeft al content gedeeld over: {', '.join(chapter_names)}."
