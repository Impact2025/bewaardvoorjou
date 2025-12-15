"""
Timeline service for generating visual journey timeline data.

Aggregates journey, chapter, and media data into a structured format
optimized for rendering an interactive timeline visualization.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.journey import Journey
from app.models.media import MediaAsset
from app.models.preferences import ChapterPreference
from app.schemas.common import ChapterId
from app.schemas.timeline import (
    CHAPTER_LABELS,
    CHAPTER_TO_PHASE,
    PHASE_METADATA,
    LifePhase,
    PhaseMetadata,
    TimelineChapter,
    TimelineChapterDetail,
    TimelinePhase,
    TimelineResponse,
)


def get_chapter_media_stats(db: Session, journey_id: str, chapter_id: str) -> dict:
    """Get media statistics for a specific chapter."""
    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.journey_id == journey_id,
            MediaAsset.chapter_id == chapter_id,
            MediaAsset.storage_state.in_(["ready", "processing"]),
        )
        .all()
    )

    stats = {
        "count": len(assets),
        "has_video": False,
        "has_audio": False,
        "has_text": False,
        "total_duration": 0,
        "last_recorded_at": None,
    }

    for asset in assets:
        if asset.modality == "video":
            stats["has_video"] = True
        elif asset.modality == "audio":
            stats["has_audio"] = True
        elif asset.modality == "text":
            stats["has_text"] = True

        stats["total_duration"] += asset.duration_seconds or 0

        if asset.recorded_at:
            if stats["last_recorded_at"] is None or asset.recorded_at > stats["last_recorded_at"]:
                stats["last_recorded_at"] = asset.recorded_at

    return stats


def get_active_chapters(db: Session, journey_id: str) -> set[str]:
    """Get set of activated chapter IDs for a journey."""
    prefs = (
        db.query(ChapterPreference.chapter_id)
        .filter(ChapterPreference.journey_id == journey_id)
        .all()
    )
    if not prefs:
        # Default to intro-reflection if no preferences set
        return {ChapterId.intro_reflection.value}
    return {p.chapter_id for p in prefs}


def is_chapter_unlocked(
    chapter_id: ChapterId,
    active_chapters: set[str],
    chapter_progress: dict[str, float],
) -> bool:
    """
    Determine if a chapter is unlocked based on progression rules.

    A chapter is unlocked if:
    - It's in the active chapters list, OR
    - The previous chapter in the same phase is completed (>= 0.8 progress)
    """
    if chapter_id.value in active_chapters:
        return True

    # Get phase and find previous chapter
    phase = CHAPTER_TO_PHASE.get(chapter_id)
    if not phase:
        return False

    phase_chapters = [
        cid for cid, p in CHAPTER_TO_PHASE.items() if p == phase
    ]

    # Find index of current chapter
    try:
        idx = phase_chapters.index(chapter_id)
    except ValueError:
        return False

    # First chapter in phase - check if phase is unlocked
    if idx == 0:
        # Intro phase is always unlocked
        if phase == LifePhase.intro:
            return True
        # Other phases require previous phase to have progress
        return True  # For now, all phases are accessible

    # Check if previous chapter has sufficient progress
    prev_chapter = phase_chapters[idx - 1]
    prev_progress = chapter_progress.get(prev_chapter.value, 0.0)
    return prev_progress >= 0.8


def build_timeline(db: Session, journey_id: str) -> TimelineResponse:
    """Build complete timeline data for a journey."""
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise ValueError(f"Journey {journey_id} not found")

    # Get active chapters
    active_chapters = get_active_chapters(db, journey_id)

    # Get progress data
    chapter_progress = journey.progress or {}

    # Get all media for aggregation
    all_media = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.journey_id == journey_id,
            MediaAsset.storage_state.in_(["ready", "processing"]),
        )
        .all()
    )

    total_media = len(all_media)
    total_duration = sum(m.duration_seconds or 0 for m in all_media)
    last_activity = max((m.recorded_at for m in all_media if m.recorded_at), default=None)

    # Build phases
    phases: list[TimelinePhase] = []
    total_chapters = 0
    completed_chapters = 0

    for phase in LifePhase:
        phase_meta = PHASE_METADATA[phase]
        phase_chapters: list[TimelineChapter] = []

        for chapter_id, ch_phase in CHAPTER_TO_PHASE.items():
            if ch_phase != phase:
                continue

            total_chapters += 1

            # Get chapter stats
            stats = get_chapter_media_stats(db, journey_id, chapter_id.value)
            progress = chapter_progress.get(chapter_id.value, 0.0)

            if progress >= 1.0:
                completed_chapters += 1

            is_active = chapter_id.value in active_chapters
            is_unlocked = is_chapter_unlocked(chapter_id, active_chapters, chapter_progress)

            chapter = TimelineChapter(
                id=chapter_id,
                label=CHAPTER_LABELS.get(chapter_id, chapter_id.value),
                phase=phase,
                is_active=is_active,
                is_unlocked=is_unlocked,
                progress=progress,
                media_count=stats["count"],
                has_video=stats["has_video"],
                has_audio=stats["has_audio"],
                has_text=stats["has_text"],
                last_recorded_at=stats["last_recorded_at"],
                duration_total_seconds=stats["total_duration"],
            )
            phase_chapters.append(chapter)

        # Calculate phase progress (average of chapters)
        phase_progress = 0.0
        if phase_chapters:
            phase_progress = sum(c.progress for c in phase_chapters) / len(phase_chapters)

        # Determine if phase should be expanded
        # Expand if any chapter is active or has progress but not complete
        is_expanded = any(
            c.is_active or (0 < c.progress < 1.0) for c in phase_chapters
        )

        phases.append(
            TimelinePhase(
                metadata=phase_meta,
                chapters=phase_chapters,
                is_expanded=is_expanded,
                progress=phase_progress,
            )
        )

    # Sort phases by order
    phases.sort(key=lambda p: p.metadata.order)

    return TimelineResponse(
        journey_id=journey_id,
        journey_title=journey.title,
        phases=phases,
        total_chapters=total_chapters,
        completed_chapters=completed_chapters,
        total_media=total_media,
        total_duration_seconds=total_duration,
        last_activity_at=last_activity,
    )


def get_chapter_detail(
    db: Session, journey_id: str, chapter_id: ChapterId
) -> TimelineChapterDetail:
    """Get detailed information for a specific chapter."""
    from app.services.ai.interviewer import CHAPTER_CONFIGS

    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if not journey:
        raise ValueError(f"Journey {journey_id} not found")

    # Get chapter stats
    active_chapters = get_active_chapters(db, journey_id)
    chapter_progress = journey.progress or {}
    stats = get_chapter_media_stats(db, journey_id, chapter_id.value)

    # Build chapter info
    phase = CHAPTER_TO_PHASE.get(chapter_id, LifePhase.intro)
    is_active = chapter_id.value in active_chapters
    is_unlocked = is_chapter_unlocked(chapter_id, active_chapters, chapter_progress)

    chapter = TimelineChapter(
        id=chapter_id,
        label=CHAPTER_LABELS.get(chapter_id, chapter_id.value),
        phase=phase,
        is_active=is_active,
        is_unlocked=is_unlocked,
        progress=chapter_progress.get(chapter_id.value, 0.0),
        media_count=stats["count"],
        has_video=stats["has_video"],
        has_audio=stats["has_audio"],
        has_text=stats["has_text"],
        last_recorded_at=stats["last_recorded_at"],
        duration_total_seconds=stats["total_duration"],
    )

    # Get prompt hint from chapter config
    config = CHAPTER_CONFIGS.get(chapter_id, {})
    prompt_hint = config.get("opening_prompt", "Vertel je verhaal...")

    # Get media assets (simplified)
    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.journey_id == journey_id,
            MediaAsset.chapter_id == chapter_id.value,
        )
        .order_by(MediaAsset.recorded_at.desc())
        .limit(10)
        .all()
    )

    media_assets = [
        {
            "id": a.id,
            "modality": a.modality,
            "filename": a.original_filename,
            "duration_seconds": a.duration_seconds,
            "recorded_at": a.recorded_at.isoformat() if a.recorded_at else None,
        }
        for a in assets
    ]

    return TimelineChapterDetail(
        chapter=chapter,
        phase=PHASE_METADATA[phase],
        prompt_hint=prompt_hint,
        media_assets=media_assets,
        transcripts_preview=None,  # TODO: Add transcript preview
    )
