"""
Pydantic schemas for QuickThought (Gedachte Inspreken feature).
"""
from datetime import datetime
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field


class QuickThoughtModality(str, Enum):
    """Supported modalities for quick thoughts."""
    text = "text"
    audio = "audio"
    video = "video"


class QuickThoughtCategory(str, Enum):
    """Auto-detected categories for quick thoughts."""
    jeugd = "jeugd"
    familie = "familie"
    liefde = "liefde"
    vriendschap = "vriendschap"
    werk = "werk"
    school = "school"
    reizen = "reizen"
    verlies = "verlies"
    trots = "trots"
    wijsheid = "wijsheid"
    humor = "humor"
    traditie = "traditie"


class SuggestedChapter(BaseModel):
    """A chapter suggestion from AI analysis."""
    chapter_id: str
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str


# =============================================================================
# Request Schemas
# =============================================================================

class QuickThoughtCreateText(BaseModel):
    """Create a text-only quick thought."""
    text_content: str = Field(..., min_length=1, max_length=5000)
    title: Optional[str] = Field(None, max_length=200)
    chapter_id: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "text_content": "Iets met die oude rode fiets... en de geur van gemaaid gras bij opa.",
                "title": "Rode fiets",
                "chapter_id": "youth-favorite-place"
            }
        }


class QuickThoughtPresignRequest(BaseModel):
    """Request a presigned URL for audio/video upload."""
    modality: Literal["audio", "video"]
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(default="application/octet-stream")
    chapter_id: Optional[str] = None
    size_bytes: Optional[int] = Field(None, ge=0, le=500_000_000)  # Max 500MB

    class Config:
        json_schema_extra = {
            "example": {
                "modality": "audio",
                "filename": "gedachte_001.webm",
                "content_type": "audio/webm",
                "chapter_id": None
            }
        }


class QuickThoughtUpdate(BaseModel):
    """Update a quick thought."""
    title: Optional[str] = Field(None, max_length=200)
    chapter_id: Optional[str] = None
    # Allow manual tag overrides
    auto_tags: Optional[list[str]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Herinnering aan opa",
                "chapter_id": "youth-hero"
            }
        }


class QuickThoughtLinkRequest(BaseModel):
    """Link a quick thought to a chapter."""
    chapter_id: str


# =============================================================================
# Response Schemas
# =============================================================================

class QuickThoughtPresignResponse(BaseModel):
    """Response with presigned upload URL."""
    thought_id: str
    upload_url: str
    upload_method: str = "PUT"
    object_key: str
    expires_in: int = 900  # 15 minutes

    class Config:
        json_schema_extra = {
            "example": {
                "thought_id": "550e8400-e29b-41d4-a716-446655440000",
                "upload_url": "https://api.bewaardvoorjou.nl/api/v1/quick-thoughts/local-upload/...",
                "upload_method": "PUT",
                "object_key": "quick-thoughts/journey-id/thought-id/recording.webm",
                "expires_in": 900
            }
        }


class QuickThoughtResponse(BaseModel):
    """Full quick thought response."""
    id: str
    journey_id: str
    chapter_id: Optional[str] = None
    modality: str

    # Content
    text_content: Optional[str] = None
    media_url: Optional[str] = None  # Presigned URL for playback
    title: Optional[str] = None
    duration_seconds: Optional[int] = None

    # Transcription
    transcript: Optional[str] = None
    transcript_status: str

    # AI Analysis
    auto_category: Optional[str] = None
    auto_tags: list[str] = []
    emotion_score: Optional[float] = None
    ai_summary: Optional[str] = None
    suggested_chapters: list[SuggestedChapter] = []

    # Status
    processing_status: str
    is_used_in_interview: bool

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "journey_id": "journey-123",
                "chapter_id": None,
                "modality": "audio",
                "text_content": None,
                "media_url": "https://...",
                "title": None,
                "duration_seconds": 45,
                "transcript": "Iets met die oude rode fiets...",
                "transcript_status": "ready",
                "auto_category": "jeugd",
                "auto_tags": ["nostalgisch", "opa", "fiets"],
                "emotion_score": 0.8,
                "ai_summary": "Herinnering aan rode fiets bij opa",
                "suggested_chapters": [
                    {"chapter_id": "youth-favorite-place", "confidence": 0.85, "reason": "Gaat over een plek uit de jeugd"}
                ],
                "processing_status": "ready",
                "is_used_in_interview": False,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:31:00Z"
            }
        }


class QuickThoughtListResponse(BaseModel):
    """Paginated list of quick thoughts."""
    items: list[QuickThoughtResponse]
    total: int
    has_more: bool
    offset: int = 0
    limit: int = 20


class QuickThoughtStats(BaseModel):
    """Statistics about quick thoughts."""
    total_count: int
    by_modality: dict[str, int]  # {"audio": 5, "video": 2, "text": 10}
    by_category: dict[str, int]
    unused_count: int  # Not yet used in interview
    recent_count: int  # Last 7 days


class QuickThoughtsForInterviewResponse(BaseModel):
    """Quick thoughts relevant for an interview session."""
    direct: list[QuickThoughtResponse]  # Linked to this chapter
    suggested: list[QuickThoughtResponse]  # AI-suggested for this chapter
    total_unused: int


class QuickThoughtCompleteResponse(BaseModel):
    """Response after marking upload complete."""
    status: str = "processing"
    thought_id: str
    message: str = "Transcriptie en analyse gestart"
