from datetime import datetime

from pydantic import BaseModel, EmailStr


class AccessibilitySettings(BaseModel):
  captions: bool
  high_contrast: bool
  large_text: bool


class DeadlineEntry(BaseModel):
  label: str
  due_date: datetime


class UserProfile(BaseModel):
  id: str
  display_name: str
  email: EmailStr
  locale: str
  country: str
  birth_year: int | None = None
  accessibility: AccessibilitySettings
  privacy_level: str
  target_recipients: list[str]
  deadlines: list[DeadlineEntry] = []
