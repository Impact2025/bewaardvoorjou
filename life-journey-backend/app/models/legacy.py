from datetime import datetime, timezone

def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String

from app.models.base import Base


class LegacyPolicy(Base):
  id = Column(String, primary_key=True)
  journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, unique=True)
  mode = Column(String(32), nullable=False)
  unlock_date = Column(DateTime, nullable=True)
  grace_period_days = Column(Integer, nullable=True)
  trustees = Column(JSON, nullable=False, default=list)
  updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
