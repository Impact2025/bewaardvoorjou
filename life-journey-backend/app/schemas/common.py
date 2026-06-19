from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, EmailStr


class ChapterId(str, Enum):
  # Fase 1: Intro
  intro_reflection = "intro-reflection"
  intro_intention = "intro-intention"
  intro_uniqueness = "intro-uniqueness"
  # Fase 2: Wortels & Familie
  roots_first_memory = "roots-first-memory"
  roots_father = "roots-father"
  roots_mother = "roots-mother"
  roots_grandparents = "roots-grandparents"
  roots_siblings = "roots-siblings"
  roots_home = "roots-home"
  roots_neighborhood = "roots-neighborhood"
  roots_faith = "roots-faith"
  roots_finances = "roots-finances"
  roots_hardship = "roots-hardship"
  # Fase 3: Jeugd & School
  youth_favorite_place = "youth-favorite-place"
  youth_sounds = "youth-sounds"
  youth_hero = "youth-hero"
  youth_primary_school = "youth-primary-school"
  youth_friends = "youth-friends"
  youth_secondary_school = "youth-secondary-school"
  youth_history = "youth-history"
  youth_ambition = "youth-ambition"
  # Fase 4: Jong Volwassen
  work_dream_job = "work-dream-job"
  work_passion = "work-passion"
  work_challenge = "work-challenge"
  young_adult_first_job = "young-adult-first-job"
  young_adult_independence = "young-adult-independence"
  young_adult_first_home = "young-adult-first-home"
  young_adult_career_path = "young-adult-career-path"
  young_adult_pivotal_choice = "young-adult-pivotal-choice"
  young_adult_finances = "young-adult-finances"
  young_adult_world_events = "young-adult-world-events"
  # Fase 5: Liefde & Gezin
  love_connection = "love-connection"
  love_lessons = "love-lessons"
  love_symbol = "love-symbol"
  family_partner_story = "family-partner-story"
  family_early_years = "family-early-years"
  family_wedding = "family-wedding"
  family_children = "family-children"
  family_typical_week = "family-typical-week"
  family_hardship = "family-hardship"
  family_pride = "family-pride"
  # Fase 6: Midden Leven & Verlies
  midlife_grief = "midlife-grief"
  midlife_aging = "midlife-aging"
  midlife_regret = "midlife-regret"
  midlife_resilience = "midlife-resilience"
  midlife_parents_retrospect = "midlife-parents-retrospect"
  midlife_formative_decade = "midlife-formative-decade"
  midlife_social_change = "midlife-social-change"
  midlife_faith_evolution = "midlife-faith-evolution"
  # Fase 7: Nu & Nalatenschap
  future_message = "future-message"
  future_dream = "future-dream"
  future_gratitude = "future-gratitude"
  legacy_daily_joy = "legacy-daily-joy"
  legacy_faith_now = "legacy-faith-now"
  legacy_remembered = "legacy-remembered"
  legacy_verdict = "legacy-verdict"
  legacy_unsaid = "legacy-unsaid"
  legacy_letter = "legacy-letter"
  # Optioneel
  bonus_funny = "bonus-funny"
  bonus_relive = "bonus-relive"
  bonus_culture = "bonus-culture"
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
  optional_childhood_game = "optional-childhood-game"
  optional_alter_ego = "optional-alter-ego"
  optional_superpower = "optional-superpower"
  optional_bucket_list = "optional-bucket-list"
  optional_final_chapter = "optional-final-chapter"

  # ── BewaardVoorBaby ───────────────────────────────────────────────────────
  # Fase 0: Onboarding interview (geboortedag)
  baby_birth_story     = "baby-birth-story"       # De geboortedag — rol-bewust
  baby_week_one        = "baby-week-one"           # Eerste week thuis

  # Maandelijkse diepe interviews (0–12)
  baby_month_1         = "baby-month-1"
  baby_month_2         = "baby-month-2"
  baby_month_3         = "baby-month-3"
  baby_month_4         = "baby-month-4"
  baby_month_5         = "baby-month-5"
  baby_month_6         = "baby-month-6"
  baby_month_7         = "baby-month-7"
  baby_month_8         = "baby-month-8"
  baby_month_9         = "baby-month-9"
  baby_month_10        = "baby-month-10"
  baby_month_11        = "baby-month-11"
  baby_month_12        = "baby-month-12"

  # Bijzondere hoofdstukken
  baby_chaos_and_laughs = "baby-chaos-and-laughs"  # Blowouts, maffe momenten
  baby_parent_reflection = "baby-parent-reflection" # Ouder over zichzelf
  baby_first_birthday   = "baby-first-birthday"    # Terugblik jaar 1
  baby_letter_to_child  = "baby-letter-to-child"   # Tijdcapsule brief (open op 18e)


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
