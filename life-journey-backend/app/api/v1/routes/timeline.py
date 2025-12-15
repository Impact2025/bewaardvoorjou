"""
Timeline API routes.

Provides endpoints for the visual journey timeline feature.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.journey import Journey
from app.models.user import User
from app.schemas.common import ChapterId
from app.schemas.timeline import (
    PHASE_METADATA,
    PhaseMetadata,
    TimelineChapterDetail,
    TimelineResponse,
)
from app.services.timeline import build_timeline, get_chapter_detail


router = APIRouter()


def _ensure_journey_access(journey_id: str, db: Session, user: User) -> Journey:
    """Verify user has access to the journey."""
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if journey is None or journey.user_id != user.id:
        raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")
    return journey


@router.get("/phases", response_model=list[PhaseMetadata])
@limiter.limit(RateLimits.READ_STANDARD)
def get_phases(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> list[PhaseMetadata]:
    """Get all available life phases with their metadata."""
    return sorted(PHASE_METADATA.values(), key=lambda p: p.order)


@router.get("/{journey_id}", response_model=TimelineResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def get_timeline(
    request: Request,
    journey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TimelineResponse:
    """
    Get complete timeline data for a journey.

    Returns all phases and chapters with their progress, media counts,
    and unlock status for rendering the visual timeline.
    """
    _ensure_journey_access(journey_id, db, current_user)

    try:
        return build_timeline(db, journey_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{journey_id}/chapter/{chapter_id}", response_model=TimelineChapterDetail)
@limiter.limit(RateLimits.READ_STANDARD)
def get_chapter_timeline_detail(
    request: Request,
    journey_id: str,
    chapter_id: ChapterId,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TimelineChapterDetail:
    """
    Get detailed information for a specific chapter.

    Used for the chapter detail modal/panel in the timeline view.
    """
    _ensure_journey_access(journey_id, db, current_user)

    try:
        return get_chapter_detail(db, journey_id, chapter_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
