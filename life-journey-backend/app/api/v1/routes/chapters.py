from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.journey import Journey
from app.models.preferences import ChapterPreference
from app.models.user import User
from app.schemas.preferences import ChapterStateResponse, ChapterStateUpdateRequest
from app.schemas.common import ChapterId


router = APIRouter()


def _get_authorised_journey(journey_id: str, user: User, db: Session) -> Journey:
  journey = db.query(Journey).filter(Journey.id == journey_id).first()
  if journey is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey niet gevonden")
  if journey.user_id != user.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geen toegang tot deze journey")
  return journey


@router.get("/{journey_id}", response_model=ChapterStateResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def get_chapter_state(
  request: Request,
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> ChapterStateResponse:
  _get_authorised_journey(journey_id, current_user, db)
  rows = (
    db.query(ChapterPreference)
    .filter(ChapterPreference.journey_id == journey_id)
    .order_by(ChapterPreference.created_at.asc())
    .all()
  )
  if not rows:
    return ChapterStateResponse(active_chapters=[ChapterId.intro_reflection])
  return ChapterStateResponse(active_chapters=[ChapterId(row.chapter_id) for row in rows])


@router.put("/{journey_id}", response_model=ChapterStateResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
def update_chapter_state(
  request: Request,
  journey_id: str,
  payload: ChapterStateUpdateRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> ChapterStateResponse:
  _get_authorised_journey(journey_id, current_user, db)

  db.query(ChapterPreference).filter(ChapterPreference.journey_id == journey_id).delete()
  db.bulk_save_objects(
    [
      ChapterPreference(journey_id=journey_id, chapter_id=chapter.value)
      for chapter in payload.active_chapters
    ]
  )
  db.commit()

  if payload.active_chapters:
    return ChapterStateResponse(active_chapters=payload.active_chapters)
  return ChapterStateResponse(active_chapters=[ChapterId.intro_reflection])
