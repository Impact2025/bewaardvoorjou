from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.models.base import Base


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class JourneyMemoryCache(Base):
    """Cached AI-built JourneyMemory for a journey. Rebuilt when stale or new recordings arrive."""
    journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), primary_key=True)
    memory_json = Column(Text, nullable=False)
    built_at = Column(DateTime, nullable=False, default=_utc_now)
    chapters_included = Column(Integer, nullable=False, default=0)
