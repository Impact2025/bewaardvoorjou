from datetime import datetime, timezone

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String

from app.models.base import Base


class MediaAsset(Base):
  id = Column(String, primary_key=True)
  journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
  chapter_id = Column(String(32), nullable=False)
  modality = Column(String(16), nullable=False)
  object_key = Column(String, nullable=False)
  original_filename = Column(String(255), nullable=False)
  duration_seconds = Column(Integer, nullable=False, default=0)
  size_bytes = Column(Integer, nullable=False, default=0)
  storage_state = Column(String(32), nullable=False, default="pending")
  recorded_at = Column(DateTime, default=utc_now, nullable=False)


class TranscriptSegment(Base):
  id = Column(String, primary_key=True)
  media_asset_id = Column(String, ForeignKey("mediaasset.id", ondelete="CASCADE"), nullable=False, index=True)
  start_ms = Column(Integer, nullable=False)
  end_ms = Column(Integer, nullable=False)
  text = Column(String, nullable=False)
  sentiment = Column(String(32), nullable=True)
  emotion_hint = Column(String(32), nullable=True)


class PromptRun(Base):
  id = Column(String, primary_key=True)
  journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
  chapter_id = Column(String(32), nullable=False)
  prompt = Column(String, nullable=False)
  follow_ups = Column(JSON, nullable=False, default=list)
  consent_to_deepen = Column(Boolean, nullable=False, default=True)
  created_at = Column(DateTime, default=utc_now, nullable=False)
