from datetime import datetime, timezone

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String

from app.models.base import Base


class Highlight(Base):
  id = Column(String, primary_key=True)
  journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
  media_asset_id = Column(String, ForeignKey("mediaasset.id", ondelete="CASCADE"), nullable=False)
  chapter_id = Column(String(32), nullable=False)
  label = Column(String(32), nullable=False)
  start_ms = Column(Integer, nullable=False)
  end_ms = Column(Integer, nullable=False)
  created_by = Column(String(8), nullable=False, default="ai")


class ShareGrant(Base):
  id = Column(String, primary_key=True)
  journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
  issued_to = Column(String(120), nullable=False)
  email = Column(String(255), nullable=False)
  chapter_ids = Column(JSON, nullable=False, default=list)
  expires_at = Column(DateTime, nullable=True)
  status = Column(String(16), nullable=False, default="active")
  created_at = Column(DateTime, default=utc_now, nullable=False)
