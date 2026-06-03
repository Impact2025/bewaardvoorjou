from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String

from app.models.base import Base


class ConversationSessionRecord(Base):
    """Persistent storage for multi-turn conversation sessions.

    Survives page refreshes, server restarts, and network interruptions.
    The turns field stores the full conversation history as JSON so the
    session can be fully reconstructed on resume.
    """
    id = Column(String, primary_key=True)
    journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(String(32), nullable=False)
    asset_id = Column(String, nullable=False)
    turns = Column(JSON, nullable=False, default=list)
    is_complete = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
