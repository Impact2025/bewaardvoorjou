from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class AccessibilityPrefs(BaseModel):
  captions: bool = False
  high_contrast: bool = False
  large_text: bool = False


class Deadline(BaseModel):
  label: str
  due_date: datetime


class IntakeRequest(BaseModel):
  display_name: str
  email: EmailStr
  country: str
  locale: Literal["nl", "en"]
  birth_year: int | None = None
  privacy_level: Literal["private", "trusted", "legacy"]
  target_recipients: list[str]
  deadline: Deadline | None = None
  accessibility: AccessibilityPrefs = AccessibilityPrefs()


class IntakeResponse(BaseModel):
  user_id: str
  journey_id: str
  created_at: datetime
  summary: str


# =============================================================================
# Onboarding 2.0 - Wizard-style with progress persistence
# =============================================================================


OnboardingStep = Literal[
  "welcome",
  "personal_info",
  "story_purpose",
  "recording_preferences",
  "privacy_settings",
  "chapter_selection",
  "accessibility",
  "complete",
]


class PersonalInfoData(BaseModel):
  """Step: Personal information."""
  display_name: str = Field(..., min_length=2, max_length=100)
  birth_year: int | None = None


class StoryPurposeData(BaseModel):
  """Step: Why are you creating this story?"""
  purpose: Literal["legacy", "healing", "preservation", "gift", "other"]
  recipients: list[str] = []  # Who is this for?
  custom_purpose: str | None = None


class RecordingPrefsData(BaseModel):
  """Step: Recording preferences."""
  preferred_method: Literal["video", "audio", "text", "mixed"]
  session_reminder: bool = True  # Weekly reminder
  ai_assistance: Literal["full", "minimal", "none"] = "full"


class PrivacySettingsData(BaseModel):
  """Step: Privacy and sharing settings."""
  privacy_level: Literal["private", "trusted", "legacy"]
  auto_backup: bool = True
  analytics_consent: bool = False


class ChapterSelectionData(BaseModel):
  """Step: Choose which chapters to work on."""
  selected_phases: list[Literal["intro", "youth", "love", "work", "future", "bonus", "deep"]]
  starting_chapter: str | None = None


class OnboardingProgress(BaseModel):
  """Full onboarding progress state."""
  current_step: OnboardingStep = "welcome"
  completed_steps: list[OnboardingStep] = []
  personal_info: PersonalInfoData | None = None
  story_purpose: StoryPurposeData | None = None
  recording_prefs: RecordingPrefsData | None = None
  privacy_settings: PrivacySettingsData | None = None
  chapter_selection: ChapterSelectionData | None = None
  accessibility: AccessibilityPrefs | None = None
  started_at: datetime | None = None
  last_updated_at: datetime | None = None


class SaveProgressRequest(BaseModel):
  """Request to save onboarding progress."""
  current_step: OnboardingStep
  personal_info: PersonalInfoData | None = None
  story_purpose: StoryPurposeData | None = None
  recording_prefs: RecordingPrefsData | None = None
  privacy_settings: PrivacySettingsData | None = None
  chapter_selection: ChapterSelectionData | None = None
  accessibility: AccessibilityPrefs | None = None


class SaveProgressResponse(BaseModel):
  """Response after saving progress."""
  success: bool
  current_step: OnboardingStep
  completed_steps: list[OnboardingStep]
  message: str


class GetProgressResponse(BaseModel):
  """Response with current onboarding progress."""
  has_progress: bool
  progress: OnboardingProgress | None = None


class CompleteOnboardingRequest(BaseModel):
  """Request to complete onboarding and create journey."""
  personal_info: PersonalInfoData
  story_purpose: StoryPurposeData
  recording_prefs: RecordingPrefsData
  privacy_settings: PrivacySettingsData
  chapter_selection: ChapterSelectionData
  accessibility: AccessibilityPrefs


class CompleteOnboardingResponse(BaseModel):
  """Response after completing onboarding."""
  user_id: str
  journey_id: str
  display_name: str
  starting_chapter: str | None = None
  message: str
