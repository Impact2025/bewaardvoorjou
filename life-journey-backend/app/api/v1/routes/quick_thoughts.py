"""
API routes for QuickThoughts (Gedachte Inspreken feature).

Endpoints:
- POST   /quick-thoughts              → Create text thought
- POST   /quick-thoughts/presign      → Get upload URL for audio/video
- POST   /quick-thoughts/{id}/complete → Mark upload complete
- GET    /quick-thoughts              → List all thoughts
- GET    /quick-thoughts/{id}         → Get single thought
- GET    /quick-thoughts/for-interview/{chapter_id} → Get thoughts for interview
- PATCH  /quick-thoughts/{id}         → Update thought
- DELETE /quick-thoughts/{id}         → Delete thought
- POST   /quick-thoughts/{id}/link/{chapter_id} → Link to chapter
- POST   /quick-thoughts/{id}/archive → Soft delete
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session
from loguru import logger
import io

from app.db.session import get_db
from app.models.quick_thought import QuickThought
from app.models.journey import Journey
from app.models.user import User
from app.schemas.quick_thought import (
    QuickThoughtCreateText,
    QuickThoughtPresignRequest,
    QuickThoughtPresignResponse,
    QuickThoughtResponse,
    QuickThoughtListResponse,
    QuickThoughtUpdate,
    QuickThoughtCompleteResponse,
    QuickThoughtsForInterviewResponse,
    QuickThoughtStats,
    SuggestedChapter,
)
from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.core.config import settings
from app.services.media.local_storage import local_storage
from app.services.quick_thoughts.processor import (
    enqueue_quick_thought_transcript,
    enqueue_quick_thought_analysis,
)
from app.services.quick_thoughts.presigner import build_quick_thought_presigned_upload


router = APIRouter()


# =============================================================================
# Helper Functions
# =============================================================================

def _get_user_journey(db: Session, user_id: str) -> Journey:
    """Get the user's journey or raise 404."""
    journey = db.query(Journey).filter(Journey.user_id == user_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey niet gevonden")
    return journey


def _get_thought_for_user(db: Session, thought_id: str, user_id: str) -> QuickThought:
    """Get a quick thought and verify ownership."""
    thought = db.query(QuickThought).filter(QuickThought.id == thought_id).first()
    if not thought:
        raise HTTPException(status_code=404, detail="Gedachte niet gevonden")

    journey = db.query(Journey).filter(Journey.id == thought.journey_id).first()
    if not journey or journey.user_id != user_id:
        raise HTTPException(status_code=403, detail="Geen toegang tot deze gedachte")

    return thought


def _thought_to_response(thought: QuickThought, media_url: Optional[str] = None) -> QuickThoughtResponse:
    """Convert QuickThought model to response schema."""
    suggested_chapters = []
    if thought.suggested_chapters:
        for sc in thought.suggested_chapters:
            if isinstance(sc, dict):
                suggested_chapters.append(SuggestedChapter(
                    chapter_id=sc.get("chapter_id", ""),
                    confidence=sc.get("confidence", 0.0),
                    reason=sc.get("reason", "")
                ))

    return QuickThoughtResponse(
        id=thought.id,
        journey_id=thought.journey_id,
        chapter_id=thought.chapter_id,
        modality=thought.modality,
        text_content=thought.text_content,
        media_url=media_url,
        title=thought.title,
        duration_seconds=thought.duration_seconds,
        transcript=thought.transcript,
        transcript_status=thought.transcript_status or "pending",
        auto_category=thought.auto_category,
        auto_tags=thought.auto_tags or [],
        emotion_score=thought.emotion_score,
        ai_summary=thought.ai_summary,
        suggested_chapters=suggested_chapters,
        processing_status=thought.processing_status or "pending",
        is_used_in_interview=thought.is_used_in_interview or False,
        created_at=thought.created_at,
        updated_at=thought.updated_at,
    )


async def _get_media_url(object_key: str) -> Optional[str]:
    """Generate a presigned URL for media playback."""
    if not object_key:
        return None

    # For local storage, return the local endpoint
    return f"{settings.api_base_url}/api/v1/quick-thoughts/file/{object_key}"


# =============================================================================
# Create Endpoints
# =============================================================================

@router.post("", response_model=QuickThoughtResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
async def create_text_thought(
    request: Request,
    data: QuickThoughtCreateText,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtResponse:
    """
    Maak een text-only quick thought.

    Direct klaar voor AI analyse - geen transcriptie nodig.
    """
    journey = _get_user_journey(db, current_user.id)

    thought = QuickThought(
        id=str(uuid4()),
        journey_id=journey.id,
        chapter_id=data.chapter_id,
        modality="text",
        text_content=data.text_content,
        title=data.title,
        transcript=data.text_content,  # Text IS the transcript
        transcript_status="ready",
        processing_status="processing",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(thought)
    db.commit()
    db.refresh(thought)

    logger.info(f"Created text quick thought {thought.id} for journey {journey.id}")

    # Trigger async AI analysis
    enqueue_quick_thought_analysis(thought.id)

    return _thought_to_response(thought)


@router.post("/presign", response_model=QuickThoughtPresignResponse)
@limiter.limit(RateLimits.MEDIA_UPLOAD)
async def presign_upload(
    request: Request,
    data: QuickThoughtPresignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtPresignResponse:
    """
    Vraag een presigned URL aan voor audio/video upload.

    Na upload, roep POST /quick-thoughts/{id}/complete aan.
    """
    journey = _get_user_journey(db, current_user.id)

    # Build presigned upload response
    response = build_quick_thought_presigned_upload(
        journey_id=journey.id,
        modality=data.modality,
        filename=data.filename,
    )

    # Create thought record
    thought = QuickThought(
        id=response.thought_id,
        journey_id=journey.id,
        chapter_id=data.chapter_id,
        modality=data.modality,
        object_key=response.object_key,
        original_filename=data.filename,
        size_bytes=data.size_bytes,
        processing_status="pending",
        transcript_status="pending",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(thought)
    db.commit()

    logger.info(f"Created presign for quick thought {thought.id}, modality={data.modality}")

    return response


@router.post("/{thought_id}/complete", response_model=QuickThoughtCompleteResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
async def complete_upload(
    request: Request,
    thought_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtCompleteResponse:
    """
    Markeer upload als compleet.

    Triggert transcriptie en AI analyse.
    """
    thought = _get_thought_for_user(db, thought_id, current_user.id)

    if thought.processing_status not in ("pending", "failed"):
        raise HTTPException(
            status_code=400,
            detail="Deze gedachte is al verwerkt of wordt verwerkt"
        )

    thought.processing_status = "processing"
    thought.transcript_status = "processing"
    thought.updated_at = datetime.now(timezone.utc)
    db.commit()

    logger.info(f"Marked quick thought {thought_id} as complete, starting processing")

    # Start processing chain: transcribe → analyze
    enqueue_quick_thought_transcript(thought.id)

    return QuickThoughtCompleteResponse(
        status="processing",
        thought_id=thought.id,
        message="Transcriptie en analyse gestart"
    )


# =============================================================================
# Read Endpoints
# =============================================================================

@router.get("", response_model=QuickThoughtListResponse)
@limiter.limit(RateLimits.READ_STANDARD)
async def list_thoughts(
    request: Request,
    chapter_id: Optional[str] = None,
    modality: Optional[str] = None,
    category: Optional[str] = None,
    include_archived: bool = False,
    unused_only: bool = False,
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtListResponse:
    """
    Lijst alle quick thoughts met filtering.

    Filters:
    - chapter_id: Filter op hoofdstuk
    - modality: "text" | "audio" | "video"
    - category: AI-gedetecteerde categorie
    - include_archived: Toon ook gearchiveerde
    - unused_only: Alleen niet-gebruikte in interview
    """
    journey = _get_user_journey(db, current_user.id)

    query = db.query(QuickThought).filter(QuickThought.journey_id == journey.id)

    if chapter_id:
        query = query.filter(QuickThought.chapter_id == chapter_id)
    if modality:
        query = query.filter(QuickThought.modality == modality)
    if category:
        query = query.filter(QuickThought.auto_category == category)
    if not include_archived:
        query = query.filter(QuickThought.archived_at.is_(None))
    if unused_only:
        query = query.filter(QuickThought.is_used_in_interview == False)

    # Order by most recent first
    query = query.order_by(QuickThought.created_at.desc())

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    items = query.offset(offset).limit(limit + 1).all()
    has_more = len(items) > limit
    items = items[:limit]

    # Build responses with media URLs
    responses = []
    for thought in items:
        media_url = await _get_media_url(thought.object_key) if thought.object_key else None
        responses.append(_thought_to_response(thought, media_url))

    return QuickThoughtListResponse(
        items=responses,
        total=total,
        has_more=has_more,
        offset=offset,
        limit=limit,
    )


@router.get("/stats", response_model=QuickThoughtStats)
@limiter.limit(RateLimits.READ_STANDARD)
async def get_stats(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtStats:
    """Get statistics about quick thoughts."""
    journey = _get_user_journey(db, current_user.id)

    base_query = db.query(QuickThought).filter(
        QuickThought.journey_id == journey.id,
        QuickThought.archived_at.is_(None)
    )

    total_count = base_query.count()

    # By modality
    modality_counts = db.query(
        QuickThought.modality,
        func.count(QuickThought.id)
    ).filter(
        QuickThought.journey_id == journey.id,
        QuickThought.archived_at.is_(None)
    ).group_by(QuickThought.modality).all()

    by_modality = {m: c for m, c in modality_counts}

    # By category
    category_counts = db.query(
        QuickThought.auto_category,
        func.count(QuickThought.id)
    ).filter(
        QuickThought.journey_id == journey.id,
        QuickThought.archived_at.is_(None),
        QuickThought.auto_category.isnot(None)
    ).group_by(QuickThought.auto_category).all()

    by_category = {c: cnt for c, cnt in category_counts if c}

    # Unused count
    unused_count = base_query.filter(
        QuickThought.is_used_in_interview == False
    ).count()

    # Recent count (last 7 days)
    from datetime import timedelta
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_count = base_query.filter(
        QuickThought.created_at >= seven_days_ago
    ).count()

    return QuickThoughtStats(
        total_count=total_count,
        by_modality=by_modality,
        by_category=by_category,
        unused_count=unused_count,
        recent_count=recent_count,
    )


@router.get("/for-interview/{chapter_id}", response_model=QuickThoughtsForInterviewResponse)
@limiter.limit(RateLimits.READ_STANDARD)
async def get_thoughts_for_interview(
    request: Request,
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtsForInterviewResponse:
    """
    Haal relevante quick thoughts op voor AI interview.

    Returns:
    - direct: Thoughts gekoppeld aan dit hoofdstuk
    - suggested: AI-gesuggereerde thoughts voor dit hoofdstuk
    """
    journey = _get_user_journey(db, current_user.id)

    # Direct linked thoughts
    direct_query = db.query(QuickThought).filter(
        QuickThought.journey_id == journey.id,
        QuickThought.chapter_id == chapter_id,
        QuickThought.is_used_in_interview == False,
        QuickThought.archived_at.is_(None),
        QuickThought.processing_status == "ready"
    ).order_by(QuickThought.created_at.desc())

    direct_thoughts = direct_query.all()

    # Suggested thoughts (check suggested_chapters JSON)
    # Get all unlinked thoughts and filter by suggested_chapters
    suggested_query = db.query(QuickThought).filter(
        QuickThought.journey_id == journey.id,
        QuickThought.chapter_id.is_(None),
        QuickThought.is_used_in_interview == False,
        QuickThought.archived_at.is_(None),
        QuickThought.processing_status == "ready"
    ).order_by(QuickThought.created_at.desc())

    all_unlinked = suggested_query.all()

    # Filter by suggested chapters
    suggested_thoughts = []
    for thought in all_unlinked:
        if thought.suggested_chapters:
            for suggestion in thought.suggested_chapters:
                if isinstance(suggestion, dict) and suggestion.get("chapter_id") == chapter_id:
                    if suggestion.get("confidence", 0) >= 0.6:
                        suggested_thoughts.append(thought)
                        break

    # Build responses
    direct_responses = []
    for thought in direct_thoughts:
        media_url = await _get_media_url(thought.object_key) if thought.object_key else None
        direct_responses.append(_thought_to_response(thought, media_url))

    suggested_responses = []
    for thought in suggested_thoughts:
        media_url = await _get_media_url(thought.object_key) if thought.object_key else None
        suggested_responses.append(_thought_to_response(thought, media_url))

    return QuickThoughtsForInterviewResponse(
        direct=direct_responses,
        suggested=suggested_responses,
        total_unused=len(direct_thoughts) + len(suggested_thoughts),
    )


@router.get("/{thought_id}", response_model=QuickThoughtResponse)
@limiter.limit(RateLimits.READ_STANDARD)
async def get_thought(
    request: Request,
    thought_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtResponse:
    """Get a single quick thought by ID."""
    thought = _get_thought_for_user(db, thought_id, current_user.id)
    media_url = await _get_media_url(thought.object_key) if thought.object_key else None
    return _thought_to_response(thought, media_url)


# =============================================================================
# Update Endpoints
# =============================================================================

@router.patch("/{thought_id}", response_model=QuickThoughtResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
async def update_thought(
    request: Request,
    thought_id: str,
    data: QuickThoughtUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtResponse:
    """Update a quick thought (title, chapter link, tags)."""
    thought = _get_thought_for_user(db, thought_id, current_user.id)

    if data.title is not None:
        thought.title = data.title
    if data.chapter_id is not None:
        thought.chapter_id = data.chapter_id
    if data.auto_tags is not None:
        thought.auto_tags = data.auto_tags

    thought.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(thought)

    logger.info(f"Updated quick thought {thought_id}")

    media_url = await _get_media_url(thought.object_key) if thought.object_key else None
    return _thought_to_response(thought, media_url)


@router.post("/{thought_id}/link/{chapter_id}", response_model=QuickThoughtResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
async def link_to_chapter(
    request: Request,
    thought_id: str,
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtResponse:
    """Link a quick thought to a specific chapter."""
    thought = _get_thought_for_user(db, thought_id, current_user.id)

    thought.chapter_id = chapter_id
    thought.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(thought)

    logger.info(f"Linked quick thought {thought_id} to chapter {chapter_id}")

    media_url = await _get_media_url(thought.object_key) if thought.object_key else None
    return _thought_to_response(thought, media_url)


@router.post("/{thought_id}/mark-used", response_model=QuickThoughtResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
async def mark_as_used(
    request: Request,
    thought_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtResponse:
    """Mark a quick thought as used in an interview."""
    thought = _get_thought_for_user(db, thought_id, current_user.id)

    thought.is_used_in_interview = True
    thought.used_in_interview_at = datetime.now(timezone.utc)
    thought.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(thought)

    logger.info(f"Marked quick thought {thought_id} as used in interview")

    media_url = await _get_media_url(thought.object_key) if thought.object_key else None
    return _thought_to_response(thought, media_url)


# =============================================================================
# Delete Endpoints
# =============================================================================

@router.post("/{thought_id}/archive", response_model=QuickThoughtResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
async def archive_thought(
    request: Request,
    thought_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuickThoughtResponse:
    """Soft delete (archive) a quick thought."""
    thought = _get_thought_for_user(db, thought_id, current_user.id)

    thought.archived_at = datetime.now(timezone.utc)
    thought.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(thought)

    logger.info(f"Archived quick thought {thought_id}")

    media_url = await _get_media_url(thought.object_key) if thought.object_key else None
    return _thought_to_response(thought, media_url)


@router.delete("/{thought_id}")
@limiter.limit(RateLimits.WRITE_STANDARD)
async def delete_thought(
    request: Request,
    thought_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Permanently delete a quick thought."""
    thought = _get_thought_for_user(db, thought_id, current_user.id)

    # Delete file from storage
    if thought.object_key:
        try:
            local_storage.delete_file(thought.object_key)
        except Exception as e:
            logger.warning(f"Could not delete file {thought.object_key}: {e}")

    db.delete(thought)
    db.commit()

    logger.info(f"Deleted quick thought {thought_id}")

    return {"status": "deleted", "thought_id": thought_id}


# =============================================================================
# File Serving
# =============================================================================

@router.put("/local-upload/{object_key:path}")
@limiter.limit(RateLimits.MEDIA_UPLOAD)
async def local_upload(
    request: Request,
    object_key: str,
    db: Session = Depends(get_db),
) -> dict:
    """
    Local storage upload endpoint for quick thoughts.
    """
    try:
        content_type = request.headers.get("content-type", "")

        if "multipart/form-data" in content_type:
            form = await request.form()
            file = form.get("file")
            if file and hasattr(file, "read"):
                body = await file.read()
            else:
                raise HTTPException(status_code=400, detail="No file in form data")
        else:
            body = await request.body()

        logger.info(f"Quick thought upload: {len(body)} bytes to {object_key}")

        # Save file
        file_like = io.BytesIO(body)
        stored_key = local_storage.save_file(object_key, file_like)

        # Update thought record if we can find it
        parts = object_key.split("/")
        if len(parts) >= 3:
            thought_id = parts[2]
            thought = db.query(QuickThought).filter(QuickThought.id == thought_id).first()
            if thought:
                thought.size_bytes = len(body)
                db.commit()

        return {"status": "uploaded", "object_key": stored_key}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quick thought upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/file/{object_key:path}")
@limiter.limit(RateLimits.MEDIA_READ)
async def serve_file(
    request: Request,
    object_key: str,
) -> FileResponse:
    """Serve quick thought files from local storage."""
    file_path = local_storage.get_file_path(object_key)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    suffix = file_path.suffix.lower()
    media_type_map = {
        ".webm": "video/webm",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".ogg": "audio/ogg",
    }
    media_type = media_type_map.get(suffix, "application/octet-stream")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=file_path.name,
    )
