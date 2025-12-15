from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.common import ChapterId, Highlight, ShareGrant, LegacyPolicy, ConsentLog
from app.schemas.media import MediaAsset as MediaAssetSchema
from app.schemas.user import UserProfile


class PromptRun(BaseModel):
  id: str
  chapter_id: ChapterId
  prompt: str
  follow_ups: list[str] = []
  created_at: datetime
  consent_to_deepen: bool


class TranscriptSegment(BaseModel):
  id: str
  media_asset_id: str
  start_ms: int
  end_ms: int
  text: str
  sentiment: str | None = None
  emotion_hint: str | None = None


class ChapterStatus(BaseModel):
  """Status of a chapter in the journey"""
  status: Literal["locked", "available", "completed"]
  mediaCount: int
  isUnlocked: bool


class JourneyProgress(BaseModel):
  """Overall journey progress statistics"""
  totalChapters: int
  completedChapters: int
  availableChapters: int
  percentComplete: float
  nextAvailableChapter: ChapterId | None = None


class JourneyDetail(BaseModel):
  id: str
  title: str
  created_at: datetime
  updated_at: datetime
  progress: dict[ChapterId, float]
  active_chapters: list[ChapterId]
  media: list[MediaAssetSchema]
  prompt_runs: list[PromptRun]
  transcripts: list[TranscriptSegment]
  highlights: list[Highlight]
  share_grants: list[ShareGrant]
  legacy_policy: LegacyPolicy | None = None
  consent_log: list[ConsentLog]
  owner: UserProfile
  # New fields for linear journey progression
  chapter_statuses: dict[str, ChapterStatus]
  journey_progress: JourneyProgress
