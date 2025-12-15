from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, EmailStr


class ChapterId(str, Enum):
  intro_reflection = "intro-reflection"
  intro_intention = "intro-intention"
  intro_uniqueness = "intro-uniqueness"
  youth_favorite_place = "youth-favorite-place"
  youth_sounds = "youth-sounds"
  youth_hero = "youth-hero"
  love_connection = "love-connection"
  love_lessons = "love-lessons"
  love_symbol = "love-symbol"
  work_dream_job = "work-dream-job"
  work_passion = "work-passion"
  work_challenge = "work-challenge"
  future_message = "future-message"
  future_dream = "future-dream"
  future_gratitude = "future-gratitude"
  bonus_funny = "bonus-funny"
  bonus_relive = "bonus-relive"
  bonus_culture = "bonus-culture"
  # De Verborgen Dimensies
  deep_daily_ritual = "deep-daily-ritual"
  deep_favorite_time = "deep-favorite-time"
  deep_ugly_object = "deep-ugly-object"
  deep_near_death = "deep-near-death"
  deep_misconception = "deep-misconception"
  deep_recurring_dream = "deep-recurring-dream"
  deep_life_chapters = "deep-life-chapters"
  deep_intuition_choice = "deep-intuition-choice"
  deep_money_impact = "deep-money-impact"
  deep_shadow_side = "deep-shadow-side"
  deep_life_meal = "deep-life-meal"
  deep_statue = "deep-statue"


class ConsentType(str, Enum):
  recording = "recording"
  ai = "ai"
  sharing = "sharing"
  legacy = "legacy"


class Modalities(str, Enum):
  text = "text"
  audio = "audio"
  video = "video"


class HighlightLabel(str, Enum):
  laugh = "laugh"
  insight = "insight"
  love = "love"
  wisdom = "wisdom"


class ShareStatus(str, Enum):
  active = "active"
  revoked = "revoked"
  pending = "pending"


class TrusteeStatus(str, Enum):
  pending = "pending"
  verified = "verified"


class LegacyMode(str, Enum):
  manual = "manual"
  dead_mans_switch = "dead-mans-switch"
  time_capsule = "time-capsule"


class ConsentLog(BaseModel):
  id: str
  type: ConsentType
  granted_at: datetime
  revoked_at: datetime | None = None
  scope: str


class Trustee(BaseModel):
  name: str
  email: EmailStr
  status: TrusteeStatus = TrusteeStatus.pending


class LegacyPolicy(BaseModel):
  mode: LegacyMode
  unlock_date: datetime | None = None
  grace_period_days: int | None = None
  trustees: list[Trustee] = []


class ShareGrant(BaseModel):
  id: str
  issued_to: str
  email: EmailStr
  granted_by: str
  chapter_ids: list[ChapterId]
  expires_at: datetime | None = None
  status: ShareStatus = ShareStatus.active


class Highlight(BaseModel):
  id: str
  chapter_id: ChapterId
  media_asset_id: str | None = None
  label: HighlightLabel
  start_ms: int
  end_ms: int
  created_by: Literal["ai", "user"]
