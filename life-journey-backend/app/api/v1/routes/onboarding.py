from datetime import datetime, timezone
from uuid import uuid4
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from loguru import logger

from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.journey import Journey
from app.models.user import User
from app.schemas.onboarding import (
  IntakeRequest,
  IntakeResponse,
  SaveProgressRequest,
  SaveProgressResponse,
  GetProgressResponse,
  OnboardingProgress,
  CompleteOnboardingRequest,
  CompleteOnboardingResponse,
)
from app.api.deps import get_current_user


router = APIRouter()


# Step order for validation
STEP_ORDER = [
  "welcome",
  "personal_info",
  "story_purpose",
  "recording_preferences",
  "privacy_settings",
  "chapter_selection",
  "accessibility",
  "complete",
]


def get_completed_steps(current_step: str) -> list[str]:
  """Get list of completed steps based on current step."""
  if current_step not in STEP_ORDER:
    return []
  current_index = STEP_ORDER.index(current_step)
  return STEP_ORDER[:current_index]


@router.post("/intake", response_model=IntakeResponse, status_code=201)
@limiter.limit(RateLimits.WRITE_HEAVY)
def submit_intake(
  request: Request,
  payload: IntakeRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> IntakeResponse:
  user = db.query(User).filter(User.id == current_user.id).first()
  if user is None:
    raise HTTPException(status_code=404, detail="Gebruiker niet gevonden")

  if payload.email.lower() != current_user.email.lower():
    existing = (
      db.query(User)
      .filter(User.email == payload.email.lower(), User.id != current_user.id)
      .first()
    )
    if existing:
      raise HTTPException(status_code=400, detail="E-mailadres bestaat al")
    user.email = payload.email.lower()

  user.display_name = payload.display_name
  user.country = payload.country
  user.locale = payload.locale
  user.birth_year = payload.birth_year
  user.privacy_level = payload.privacy_level
  user.target_recipients = list(payload.target_recipients)
  user.deadline_label = payload.deadline.label if payload.deadline else None
  user.deadline_at = payload.deadline.due_date if payload.deadline else None
  user.captions = payload.accessibility.captions
  user.high_contrast = payload.accessibility.high_contrast
  user.large_text = payload.accessibility.large_text

  journey = (
    db.query(Journey)
    .filter(Journey.user_id == user.id)
    .order_by(Journey.created_at.asc())
    .first()
  )

  if journey is None:
    journey = Journey(
      id=str(uuid4()),
      title=f"Verhaal van {payload.display_name}",
      user=user,
      progress={
        "intro-reflection": 0.0,
        "intro-intention": 0.0,
        "intro-uniqueness": 0.0,
        "youth-favorite-place": 0.0,
        "youth-sounds": 0.0,
        "youth-hero": 0.0,
        "love-connection": 0.0,
        "love-lessons": 0.0,
        "love-symbol": 0.0,
        "work-dream-job": 0.0,
        "work-passion": 0.0,
        "work-challenge": 0.0,
        "future-message": 0.0,
        "future-dream": 0.0,
        "future-gratitude": 0.0,
        "bonus-funny": 0.0,
        "bonus-relive": 0.0,
        "bonus-culture": 0.0,
      },
    )
    db.add(journey)
  else:
    journey.title = f"Verhaal van {payload.display_name}"

  db.add(user)
  db.commit()
  db.refresh(journey)

  return IntakeResponse(
    user_id=user.id,
    journey_id=journey.id,
    created_at=datetime.now(timezone.utc),
    summary="Intake opgeslagen. Je instellingen zijn bijgewerkt.",
  )


# =============================================================================
# Onboarding 2.0 - Progress Persistence
# =============================================================================


@router.get("/progress", response_model=GetProgressResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def get_onboarding_progress(
  request: Request,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> GetProgressResponse:
  """
  Get the user's current onboarding progress.

  Returns saved progress if the user has started but not completed onboarding.
  """
  user = db.query(User).filter(User.id == current_user.id).first()
  if not user:
    raise HTTPException(status_code=404, detail="Gebruiker niet gevonden")

  # Check if user has onboarding progress stored
  if not user.onboarding_progress:
    return GetProgressResponse(has_progress=False)

  try:
    progress_data = json.loads(user.onboarding_progress)
    progress = OnboardingProgress(**progress_data)
    return GetProgressResponse(has_progress=True, progress=progress)
  except (json.JSONDecodeError, TypeError) as e:
    logger.warning(f"Failed to parse onboarding progress for user {user.id}: {e}")
    return GetProgressResponse(has_progress=False)


@router.post("/progress", response_model=SaveProgressResponse)
@limiter.limit(RateLimits.WRITE_HEAVY)
def save_onboarding_progress(
  request: Request,
  payload: SaveProgressRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> SaveProgressResponse:
  """
  Save onboarding progress.

  This allows users to save their progress and continue later.
  Progress is persisted server-side so it works across devices.
  """
  user = db.query(User).filter(User.id == current_user.id).first()
  if not user:
    raise HTTPException(status_code=404, detail="Gebruiker niet gevonden")

  # Build progress object
  now = datetime.now(timezone.utc)
  completed_steps = get_completed_steps(payload.current_step)

  # Get existing progress for started_at
  started_at = now
  if user.onboarding_progress:
    try:
      existing = json.loads(user.onboarding_progress)
      if existing.get("started_at"):
        started_at = datetime.fromisoformat(existing["started_at"].replace("Z", "+00:00"))
    except (json.JSONDecodeError, TypeError):
      pass

  progress = OnboardingProgress(
    current_step=payload.current_step,
    completed_steps=completed_steps,
    personal_info=payload.personal_info,
    story_purpose=payload.story_purpose,
    recording_prefs=payload.recording_prefs,
    privacy_settings=payload.privacy_settings,
    chapter_selection=payload.chapter_selection,
    accessibility=payload.accessibility,
    started_at=started_at,
    last_updated_at=now,
  )

  # Serialize and save
  user.onboarding_progress = progress.model_dump_json()
  db.add(user)
  db.commit()

  logger.info(f"Saved onboarding progress for user {user.id}: step {payload.current_step}")

  return SaveProgressResponse(
    success=True,
    current_step=payload.current_step,
    completed_steps=completed_steps,
    message="Voortgang opgeslagen",
  )


@router.post("/complete", response_model=CompleteOnboardingResponse, status_code=201)
@limiter.limit(RateLimits.WRITE_HEAVY)
def complete_onboarding(
  request: Request,
  payload: CompleteOnboardingRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> CompleteOnboardingResponse:
  """
  Complete the onboarding wizard and create the user's journey.

  This endpoint:
  1. Updates user profile with collected data
  2. Creates or updates the user's journey
  3. Applies selected settings
  4. Clears onboarding progress (completed)
  """
  user = db.query(User).filter(User.id == current_user.id).first()
  if not user:
    raise HTTPException(status_code=404, detail="Gebruiker niet gevonden")

  # Update user profile
  user.display_name = payload.personal_info.display_name
  user.birth_year = payload.personal_info.birth_year
  user.privacy_level = payload.privacy_settings.privacy_level
  user.target_recipients = payload.story_purpose.recipients

  # Accessibility settings
  user.captions = payload.accessibility.captions
  user.high_contrast = payload.accessibility.high_contrast
  user.large_text = payload.accessibility.large_text

  # Recording preferences (store as JSON in a field we might need to add)
  user.preferred_recording_method = payload.recording_prefs.preferred_method
  user.ai_assistance_level = payload.recording_prefs.ai_assistance

  # Clear onboarding progress (completed)
  user.onboarding_progress = None
  user.onboarding_completed_at = datetime.now(timezone.utc)

  # Create or update journey
  journey = (
    db.query(Journey)
    .filter(Journey.user_id == user.id)
    .order_by(Journey.created_at.asc())
    .first()
  )

  # Build initial progress based on selected phases
  initial_progress = {}
  phase_chapters = {
    "intro": ["intro-reflection", "intro-intention", "intro-uniqueness"],
    "youth": ["youth-favorite-place", "youth-sounds", "youth-hero"],
    "love": ["love-connection", "love-lessons", "love-symbol"],
    "work": ["work-dream-job", "work-passion", "work-challenge"],
    "future": ["future-message", "future-dream", "future-gratitude"],
    "bonus": ["bonus-funny", "bonus-relive", "bonus-culture"],
    "deep": [
      "deep-daily-ritual", "deep-favorite-time", "deep-ugly-object",
      "deep-near-death", "deep-misconception", "deep-recurring-dream",
      "deep-life-chapters", "deep-intuition-choice", "deep-money-impact",
      "deep-shadow-side", "deep-life-meal", "deep-statue",
    ],
  }

  for phase in payload.chapter_selection.selected_phases:
    if phase in phase_chapters:
      for chapter in phase_chapters[phase]:
        initial_progress[chapter] = 0.0

  if journey is None:
    journey = Journey(
      id=str(uuid4()),
      title=f"Verhaal van {payload.personal_info.display_name}",
      user=user,
      progress=initial_progress,
    )
    db.add(journey)
  else:
    journey.title = f"Verhaal van {payload.personal_info.display_name}"
    # Merge new chapters into existing progress
    for chapter, progress in initial_progress.items():
      if chapter not in journey.progress:
        journey.progress[chapter] = progress

  db.add(user)
  db.commit()
  db.refresh(journey)

  logger.info(f"Completed onboarding for user {user.id}, journey {journey.id}")

  return CompleteOnboardingResponse(
    user_id=user.id,
    journey_id=journey.id,
    display_name=payload.personal_info.display_name,
    starting_chapter=payload.chapter_selection.starting_chapter,
    message="Welkom! Je levensverhaal is klaar om te beginnen.",
  )


@router.delete("/progress", status_code=204)
@limiter.limit(RateLimits.WRITE_HEAVY)
def reset_onboarding_progress(
  request: Request,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
  """
  Reset onboarding progress (for starting over).

  This clears all saved onboarding data so the user can restart.
  """
  user = db.query(User).filter(User.id == current_user.id).first()
  if not user:
    raise HTTPException(status_code=404, detail="Gebruiker niet gevonden")

  user.onboarding_progress = None
  db.add(user)
  db.commit()

  logger.info(f"Reset onboarding progress for user {user.id}")
