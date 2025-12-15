from datetime import datetime, timezone
from uuid import uuid4

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Column, DateTime, ForeignKey, String, Text

from app.models.base import Base


def generate_uuid() -> str:
  return str(uuid4())


class Memo(Base):
  """
  Model for user memos/notes that can be associated with a journey,
  and optionally linked to a specific chapter or media asset.
  """
  id = Column(String, primary_key=True, default=generate_uuid)
  journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
  chapter_id = Column(String(32), nullable=True, index=True)
  title = Column(String(200), nullable=False)
  content = Column(Text, nullable=False)
  created_at = Column(DateTime, default=utc_now, nullable=False)
  updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
