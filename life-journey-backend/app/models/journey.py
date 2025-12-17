from datetime import datetime, timezone

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Column, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base


class Journey(Base):
  id = Column(String, primary_key=True)
  title = Column(String(200), nullable=False, default="Mijn levensverhaal")
  user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
  progress = Column(JSON, nullable=False, default=lambda: {})
  created_at = Column(DateTime, default=utc_now, nullable=False)
  updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

  # Relationships for eager loading (performance optimization)
  user = relationship("User", backref="journeys")
  media_assets = relationship("MediaAsset", backref="journey", lazy="select", cascade="all, delete-orphan")
  prompt_runs = relationship("PromptRun", backref="journey", lazy="select", cascade="all, delete-orphan")
  highlights = relationship("Highlight", backref="journey", lazy="select", cascade="all, delete-orphan")
  share_grants = relationship("ShareGrant", backref="journey", lazy="select", cascade="all, delete-orphan")
  chapter_preferences = relationship("ChapterPreference", backref="journey", lazy="select", cascade="all, delete-orphan")
  consent_logs = relationship("ConsentLog", backref="journey", lazy="select", cascade="all, delete-orphan")
  legacy_policy = relationship("LegacyPolicy", backref="journey", uselist=False, lazy="select", cascade="all, delete-orphan")
