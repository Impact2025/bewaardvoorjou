from datetime import datetime, timezone

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Column, DateTime, ForeignKey, String

from app.models.base import Base


class ConsentLog(Base):
  id = Column(String, primary_key=True)
  journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
  type = Column(String(32), nullable=False)
  scope = Column(String, nullable=False)
  granted_at = Column(DateTime, default=utc_now, nullable=False)
  revoked_at = Column(DateTime, nullable=True)
