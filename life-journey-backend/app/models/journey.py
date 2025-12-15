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

  user = relationship("User", backref="journeys")
