from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.consent import ConsentLog as ConsentLogModel
from app.models.journey import Journey as JourneyModel
from app.models.legacy import LegacyPolicy as LegacyPolicyModel
from app.models.media import MediaAsset as MediaAssetModel, PromptRun as PromptRunModel, TranscriptSegment as TranscriptSegmentModel
from app.models.sharing import Highlight as HighlightModel, ShareGrant as ShareGrantModel
from app.models.preferences import ChapterPreference as ChapterPreferenceModel
from app.schemas.journey import JourneyDetail, PromptRun, TranscriptSegment, ChapterStatus, JourneyProgress
from app.schemas.common import Highlight as HighlightSchema, ShareGrant as ShareGrantSchema, ConsentLog as ConsentLogSchema, ChapterId
from app.schemas.media import MediaAsset as MediaAssetSchema
from app.schemas.user import UserProfile as UserProfileSchema, AccessibilitySettings, DeadlineEntry
from app.api.deps import get_current_user
from app.models.user import User
from app.services.journey_progress import get_all_chapter_statuses, get_journey_progress, get_next_available_chapter


router = APIRouter()


class ActivateChaptersRequest(BaseModel):
  chapter_ids: list[ChapterId]


@router.post("/{journey_id}/activate-chapters")
@limiter.limit(RateLimits.WRITE_STANDARD)
def activate_chapters(
  request: Request,
  journey_id: str,
  payload: ActivateChaptersRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> list[str]:
  """Update the list of activated chapters for a journey"""
  journey = db.query(JourneyModel).filter(JourneyModel.id == journey_id).first()
  if not journey:
    raise HTTPException(status_code=404, detail="Journey niet gevonden")

  if journey.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")

  # Delete existing chapter preferences
  db.query(ChapterPreferenceModel).filter(
    ChapterPreferenceModel.journey_id == journey_id
  ).delete()

  # Create new chapter preferences
  for chapter_id in payload.chapter_ids:
    pref = ChapterPreferenceModel(
      journey_id=journey_id,
      chapter_id=chapter_id.value,
    )
    db.add(pref)

  db.commit()

  # Return the activated chapter IDs
  return [chapter_id.value for chapter_id in payload.chapter_ids]


@router.get("/{journey_id}", response_model=JourneyDetail)
@limiter.limit(RateLimits.READ_HEAVY)
def get_journey_detail(
  request: Request,
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> JourneyDetail:
  journey = db.query(JourneyModel).filter(JourneyModel.id == journey_id).first()
  if not journey:
    raise HTTPException(status_code=404, detail="Journey niet gevonden")

  if journey.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")

  media_records = (
    db.query(MediaAssetModel)
    .filter(MediaAssetModel.journey_id == journey_id)
    .order_by(MediaAssetModel.recorded_at.desc())
    .all()
  )
  media_assets = [
    MediaAssetSchema(
      id=item.id,
      chapter_id=item.chapter_id,
      modality=item.modality,
      filename=item.original_filename,
      duration_seconds=item.duration_seconds,
      size_bytes=item.size_bytes,
      storage_state=item.storage_state,
      recorded_at=item.recorded_at,
    )
    for item in media_records
  ]

  prompt_runs = [
    PromptRun(
      id=item.id,
      chapter_id=item.chapter_id,
      prompt=item.prompt,
      follow_ups=item.follow_ups or [],
      created_at=item.created_at,
      consent_to_deepen=item.consent_to_deepen,
    )
    for item in db.query(PromptRunModel).filter(PromptRunModel.journey_id == journey_id)
  ]

  transcripts = [
    TranscriptSegment(
      id=item.id,
      media_asset_id=item.media_asset_id,
      start_ms=item.start_ms,
      end_ms=item.end_ms,
      text=item.text,
      sentiment=item.sentiment,
      emotion_hint=item.emotion_hint,
    )
    for item in db.query(TranscriptSegmentModel).join(MediaAssetModel).filter(MediaAssetModel.journey_id == journey_id)
  ]

  highlights = [
    HighlightSchema(
      id=item.id,
      chapter_id=item.chapter_id,
      media_asset_id=item.media_asset_id,
      label=item.label,
      start_ms=item.start_ms,
      end_ms=item.end_ms,
      created_by=item.created_by,
    )
    for item in db.query(HighlightModel).filter(HighlightModel.journey_id == journey_id)
  ]

  share_grants = [
    ShareGrantSchema(
      id=item.id,
      issued_to=item.issued_to,
      email=item.email,
      granted_by=journey.user_id,
      chapter_ids=item.chapter_ids,
      expires_at=item.expires_at,
      status=item.status,
    )
    for item in db.query(ShareGrantModel).filter(ShareGrantModel.journey_id == journey_id)
  ]

  consent_log = [
    ConsentLogSchema(
      id=item.id,
      type=item.type,
      granted_at=item.granted_at,
      revoked_at=item.revoked_at,
      scope=item.scope,
    )
    for item in db.query(ConsentLogModel).filter(ConsentLogModel.journey_id == journey_id)
  ]

  active_chapters = [
    ChapterId(pref.chapter_id)
    for pref in (
      db.query(ChapterPreferenceModel)
      .filter(ChapterPreferenceModel.journey_id == journey_id)
      .order_by(ChapterPreferenceModel.created_at.asc())
      .all()
    )
  ] or [ChapterId.intro_reflection]

  legacy_policy_model = (
    db.query(LegacyPolicyModel)
    .filter(LegacyPolicyModel.journey_id == journey_id)
    .first()
  )

  legacy_policy = None
  if legacy_policy_model:
    legacy_policy = {
      "mode": legacy_policy_model.mode,
      "unlock_date": legacy_policy_model.unlock_date,
      "grace_period_days": legacy_policy_model.grace_period_days,
      "trustees": legacy_policy_model.trustees,
    }

  # Get chapter statuses and progress
  chapter_statuses_data = get_all_chapter_statuses(db, journey_id)
  progress_data = get_journey_progress(db, journey_id)
  next_chapter = get_next_available_chapter(db, journey_id)

  # Convert chapter statuses to proper schema objects
  chapter_statuses = {
    chapter_id: ChapterStatus(
      status=status_data["status"],
      mediaCount=status_data["mediaCount"],
      isUnlocked=status_data["isUnlocked"]
    )
    for chapter_id, status_data in chapter_statuses_data.items()
  }

  # Create journey progress object
  journey_progress = JourneyProgress(
    totalChapters=progress_data["totalChapters"],
    completedChapters=progress_data["completedChapters"],
    availableChapters=progress_data["availableChapters"],
    percentComplete=progress_data["percentComplete"],
    nextAvailableChapter=ChapterId(next_chapter) if next_chapter else None
  )

  return JourneyDetail(
    id=journey.id,
    title=journey.title,
    created_at=journey.created_at,
    updated_at=journey.updated_at,
    media=media_assets,
    active_chapters=active_chapters,
    progress=journey.progress,
    prompt_runs=prompt_runs,
    transcripts=transcripts,
    highlights=highlights,
    share_grants=share_grants,
    legacy_policy=legacy_policy,
    consent_log=consent_log,
    owner=UserProfileSchema(
      id=journey.user.id,
      display_name=journey.user.display_name,
      email=journey.user.email,
      locale=journey.user.locale,
      country=journey.user.country,
      birth_year=journey.user.birth_year,
      accessibility=AccessibilitySettings(
        captions=journey.user.captions,
        high_contrast=journey.user.high_contrast,
        large_text=journey.user.large_text,
      ),
      privacy_level=journey.user.privacy_level,
      target_recipients=journey.user.target_recipients or [],
      deadlines=(
        [
          DeadlineEntry(
            label=journey.user.deadline_label,
            due_date=journey.user.deadline_at,
          )
        ]
        if journey.user.deadline_label and journey.user.deadline_at
        else []
      ),
    ),
    chapter_statuses=chapter_statuses,
    journey_progress=journey_progress,
  )
