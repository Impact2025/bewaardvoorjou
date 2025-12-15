from datetime import datetime, timezone
from uuid import uuid4

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Text

from app.models.base import Base


def generate_uuid() -> str:
  return str(uuid4())


class User(Base):
  id = Column(String, primary_key=True, default=generate_uuid)
  display_name = Column(String(120), nullable=False)
  email = Column(String(255), unique=True, nullable=False, index=True)
  country = Column(String(64), nullable=False)
  locale = Column(String(8), nullable=False, default="nl")
  birth_year = Column(Integer, nullable=True)
  privacy_level = Column(String(32), nullable=False, default="private")
  target_recipients = Column(JSON, nullable=False, default=list)
  deadline_label = Column(String(120), nullable=True)
  deadline_at = Column(DateTime, nullable=True)
  captions = Column(Boolean, nullable=False, default=False)
  high_contrast = Column(Boolean, nullable=False, default=False)
  large_text = Column(Boolean, nullable=False, default=False)
  password_hash = Column(String(255), nullable=True)
  is_active = Column(Boolean, nullable=False, default=True)
  is_admin = Column(Boolean, nullable=False, default=False)
  last_login_at = Column(DateTime, nullable=True)
  created_at = Column(DateTime, default=utc_now, nullable=False)
  updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

  # Onboarding 2.0 fields
  onboarding_progress = Column(Text, nullable=True)  # JSON string of progress
  onboarding_completed_at = Column(DateTime, nullable=True)
  preferred_recording_method = Column(String(32), nullable=True)  # video, audio, text, mixed
  ai_assistance_level = Column(String(32), nullable=True, default="full")  # full, minimal, none
