"""
QuickThought model - Het kladblok voor je levensverhaal.

Snelle gedachten, flarden en herinneringen die later
kunnen worden gebruikt in het AI interview proces.
"""
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base


def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


def generate_uuid():
    """Generate a new UUID string."""
    return str(uuid4())


class QuickThought(Base):
    """
    Snelle gedachten/voice memos - het kladblok voor herinneringen.

    Kenmerken:
    - Korter dan reguliere opnames (10s - 3min)
    - Optioneel gekoppeld aan hoofdstuk
    - Automatisch getranscribeerd en getagd
    - Gebruikt door AI voor context bij interview
    """
    __tablename__ = "quickthought"

    # Identity
    id = Column(String(36), primary_key=True, default=generate_uuid)
    journey_id = Column(
        String(36),
        ForeignKey("journey.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    chapter_id = Column(String(32), nullable=True, index=True)

    # Content
    modality = Column(String(16), nullable=False)  # "text" | "audio" | "video"
    object_key = Column(String(512), nullable=True)  # S3/local storage path
    text_content = Column(Text, nullable=True)  # Voor text mode
    original_filename = Column(String(255), nullable=True)

    # Metadata
    title = Column(String(200), nullable=True)  # Optionele titel
    duration_seconds = Column(Integer, nullable=True)
    size_bytes = Column(Integer, nullable=True)

    # Transcriptie
    transcript = Column(Text, nullable=True)
    transcript_status = Column(String(32), default="pending")  # pending | processing | ready | failed

    # AI Analyse
    auto_category = Column(String(32), nullable=True)
    auto_tags = Column(JSON, default=list)
    emotion_score = Column(Float, nullable=True)  # 0.0 (negatief) - 1.0 (positief)
    ai_summary = Column(String(500), nullable=True)  # Korte AI-samenvatting
    suggested_chapters = Column(JSON, default=list)  # [{chapter_id, confidence, reason}]

    # Status
    processing_status = Column(String(32), default="pending")  # pending | processing | ready | failed
    is_used_in_interview = Column(Boolean, default=False)  # Marker dat AI dit heeft gebruikt
    used_in_interview_at = Column(DateTime, nullable=True)

    # Lifecycle
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    archived_at = Column(DateTime, nullable=True)

    # Relationships
    journey = relationship("Journey", backref="quick_thoughts")

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "journey_id": self.journey_id,
            "chapter_id": self.chapter_id,
            "modality": self.modality,
            "text_content": self.text_content,
            "title": self.title,
            "duration_seconds": self.duration_seconds,
            "transcript": self.transcript,
            "transcript_status": self.transcript_status,
            "auto_category": self.auto_category,
            "auto_tags": self.auto_tags or [],
            "emotion_score": self.emotion_score,
            "ai_summary": self.ai_summary,
            "suggested_chapters": self.suggested_chapters or [],
            "processing_status": self.processing_status,
            "is_used_in_interview": self.is_used_in_interview,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# Categories for auto-tagging
QUICK_THOUGHT_CATEGORIES = {
    "jeugd": "Herinneringen uit de kindertijd",
    "familie": "Familie, ouders, kinderen, verwanten",
    "liefde": "Romantische relaties, partner",
    "vriendschap": "Vrienden, sociale kring",
    "werk": "Carrière, beroep, collega's",
    "school": "Opleiding, studie, leraren",
    "reizen": "Plekken, vakanties, avonturen",
    "verlies": "Afscheid, rouw, gemis",
    "trots": "Prestaties, overwinningen",
    "wijsheid": "Levenslessen, inzichten",
    "humor": "Grappige momenten",
    "traditie": "Gewoontes, rituelen, feestdagen",
}

# Chapter mapping for suggestions
CHAPTER_MAPPING = {
    "intro-reflection": "De Eerste Jaren",
    "intro-intention": "Je Intentie",
    "intro-uniqueness": "Wat Maakt Jou Uniek",
    "youth-favorite-place": "Je Favoriete Plek",
    "youth-sounds": "Geluiden van je Jeugd",
    "youth-hero": "Je Held",
    "love-connection": "Verbinding",
    "love-lessons": "Lessen in Liefde",
    "love-symbol": "Een Symbool van Liefde",
    "work-dream-job": "Je Droombaan",
    "work-passion": "Je Passie",
    "work-challenge": "Je Grootste Uitdaging",
    "future-message": "Boodschap aan de Toekomst",
    "future-dream": "Je Droom",
    "future-gratitude": "Dankbaarheid",
    "bonus-funny": "Een Grappig Moment",
    "bonus-relive": "Opnieuw Beleven",
    "bonus-culture": "Cultuur & Tradities",
}
