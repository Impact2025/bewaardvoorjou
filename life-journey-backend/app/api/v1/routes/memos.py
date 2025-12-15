from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.journey import Journey
from app.models.memo import Memo
from app.models.user import User
from app.schemas.memo import (
  MemoCreateRequest,
  MemoUpdateRequest,
  MemoResponse,
  MemoListResponse,
)


router = APIRouter()


def _get_authorised_journey(journey_id: str, user: User, db: Session) -> Journey:
  """Helper to verify journey exists and user has access"""
  journey = db.query(Journey).filter(Journey.id == journey_id).first()
  if journey is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey niet gevonden")
  if journey.user_id != user.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geen toegang tot deze journey")
  return journey


def _get_authorised_memo(memo_id: str, user: User, db: Session) -> Memo:
  """Helper to verify memo exists and user has access"""
  memo = db.query(Memo).filter(Memo.id == memo_id).first()
  if memo is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memo niet gevonden")

  # Check if user owns the journey that owns this memo
  journey = db.query(Journey).filter(Journey.id == memo.journey_id).first()
  if journey is None or journey.user_id != user.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geen toegang tot deze memo")

  return memo


def _memo_to_response(memo: Memo) -> MemoResponse:
  """Convert memo model to response schema"""
  return MemoResponse(
    id=memo.id,
    journey_id=memo.journey_id,
    chapter_id=memo.chapter_id,
    title=memo.title,
    content=memo.content,
    created_at=memo.created_at,
    updated_at=memo.updated_at,
  )


@router.get("/{journey_id}", response_model=MemoListResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def list_memos(
  request: Request,
  journey_id: str,
  chapter_id: str | None = None,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> MemoListResponse:
  """List all memos for a journey, optionally filtered by chapter"""
  _get_authorised_journey(journey_id, current_user, db)

  query = db.query(Memo).filter(Memo.journey_id == journey_id)

  if chapter_id:
    query = query.filter(Memo.chapter_id == chapter_id)

  memos = query.order_by(Memo.created_at.desc()).all()

  return MemoListResponse(memos=[_memo_to_response(memo) for memo in memos])


@router.post("", response_model=MemoResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(RateLimits.WRITE_STANDARD)
def create_memo(
  request: Request,
  payload: MemoCreateRequest,
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> MemoResponse:
  """Create a new memo"""
  _get_authorised_journey(journey_id, current_user, db)

  memo = Memo(
    journey_id=journey_id,
    chapter_id=payload.chapter_id.value if payload.chapter_id else None,
    title=payload.title,
    content=payload.content,
  )

  db.add(memo)
  db.commit()
  db.refresh(memo)

  return _memo_to_response(memo)


@router.get("/detail/{memo_id}", response_model=MemoResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def get_memo(
  request: Request,
  memo_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> MemoResponse:
  """Get a specific memo by ID"""
  memo = _get_authorised_memo(memo_id, current_user, db)
  return _memo_to_response(memo)


@router.put("/{memo_id}", response_model=MemoResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
def update_memo(
  request: Request,
  memo_id: str,
  payload: MemoUpdateRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> MemoResponse:
  """Update an existing memo"""
  memo = _get_authorised_memo(memo_id, current_user, db)

  # Update fields if provided
  if payload.title is not None:
    memo.title = payload.title
  if payload.content is not None:
    memo.content = payload.content
  if payload.chapter_id is not None:
    memo.chapter_id = payload.chapter_id.value

  db.commit()
  db.refresh(memo)

  return _memo_to_response(memo)


@router.delete("/{memo_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(RateLimits.WRITE_STANDARD)
def delete_memo(
  request: Request,
  memo_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> None:
  """Delete a memo"""
  memo = _get_authorised_memo(memo_id, current_user, db)
  db.delete(memo)
  db.commit()
