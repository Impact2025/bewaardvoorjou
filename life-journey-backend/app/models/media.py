from datetime import datetime, timezone

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String
import sqlalchemy as sa
from sqlalchemy.orm import relationship

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
  # Text content lives IN the database (plain text, <=5000 chars). Object storage
  # (R2/local disk) is ephemeral on Railway and wiped on redeploy, which lost text.
  # For text assets this column is the source of truth; object_key is a legacy path.
  text_content = Column(sa.Text, nullable=True)
  # Versioning for text: only the latest save per (journey, chapter) is current.
  # Superseded saves point replaced_by at the newer asset id and is_current=False.
  is_current = Column(Boolean, nullable=False, default=True, index=False)
  replaced_by = Column(String, nullable=True)

  __table_args__ = (
    sa.Index(
      "ix_mediaasset_current",
      "journey_id", "chapter_id", "modality", "is_current",
    ),
  )

  # Relationships for eager loading
  transcripts = relationship("TranscriptSegment", backref="media_asset", lazy="select", cascade="all, delete-orphan")


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
