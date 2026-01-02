"""
Processing pipeline for quick thoughts.

Handles:
1. Transcription of audio/video
2. AI analysis (categorization, tagging, suggestions)
"""
from typing import Optional

from loguru import logger

from app.core.config import settings


def _is_celery_available() -> bool:
    """Check if Celery broker is configured and available."""
    return bool(settings.redis_url) and settings.redis_url != "redis://localhost:6379/0"


def enqueue_quick_thought_transcript(thought_id: str) -> Optional[str]:
    """
    Enqueue transcription job for a quick thought.

    In production with Redis, this queues for async processing.
    In development without Redis, processes synchronously.

    Args:
        thought_id: ID of the QuickThought to transcribe

    Returns:
        Task ID if queued, "sync" if processed synchronously, None if skipped
    """
    if not _is_celery_available():
        logger.info(f"Celery not available, processing quick thought {thought_id} synchronously")
        try:
            _process_quick_thought_sync(thought_id)
            return "sync"
        except Exception as e:
            logger.error(f"Sync processing failed for quick thought {thought_id}: {e}")
            return None

    try:
        from app.services.media.tasks import celery_app
        result = celery_app.send_task(
            "quick_thoughts.transcribe",
            args=[thought_id]
        )
        logger.info(f"Queued transcript job for quick thought {thought_id}, task_id={result.id}")
        return result.id
    except Exception as e:
        logger.warning(f"Failed to queue, falling back to sync for {thought_id}: {e}")
        try:
            _process_quick_thought_sync(thought_id)
            return "sync"
        except Exception as e2:
            logger.error(f"Sync fallback also failed for {thought_id}: {e2}")
            return None


def enqueue_quick_thought_analysis(thought_id: str) -> Optional[str]:
    """
    Enqueue AI analysis job for a quick thought.

    Analysis includes:
    - Category detection
    - Auto-tagging
    - Emotion scoring
    - Chapter suggestions

    Args:
        thought_id: ID of the QuickThought to analyze

    Returns:
        Task ID if queued, "sync" if processed synchronously
    """
    if not _is_celery_available():
        logger.info(f"Celery not available, analyzing quick thought {thought_id} synchronously")
        try:
            _analyze_quick_thought_sync(thought_id)
            return "sync"
        except Exception as e:
            logger.error(f"Sync analysis failed for quick thought {thought_id}: {e}")
            return None

    try:
        from app.services.media.tasks import celery_app
        result = celery_app.send_task(
            "quick_thoughts.analyze",
            args=[thought_id]
        )
        logger.info(f"Queued analysis job for quick thought {thought_id}, task_id={result.id}")
        return result.id
    except Exception as e:
        logger.warning(f"Failed to queue analysis, falling back to sync for {thought_id}: {e}")
        try:
            _analyze_quick_thought_sync(thought_id)
            return "sync"
        except Exception as e2:
            logger.error(f"Sync analysis fallback failed for {thought_id}: {e2}")
            return None


def _process_quick_thought_sync(thought_id: str) -> None:
    """
    Synchronously process a quick thought (transcribe + analyze).

    Used in development without Celery/Redis.
    """
    from app.db.session import SessionLocal
    from app.models.quick_thought import QuickThought
    from app.services.ai.transcriber import transcribe_audio
    from app.services.media.local_storage import local_storage
    from app.services.quick_thoughts.analyzer import analyze_quick_thought_content
    from datetime import datetime, timezone

    db = SessionLocal()
    try:
        thought = db.query(QuickThought).filter(QuickThought.id == thought_id).first()
        if not thought:
            logger.error(f"Quick thought {thought_id} not found")
            return

        # Skip transcription for text mode
        if thought.modality == "text":
            thought.transcript = thought.text_content
            thought.transcript_status = "ready"
        else:
            # Transcribe audio/video
            try:
                thought.transcript_status = "processing"
                db.commit()

                # Get file from storage
                file_path = local_storage.get_file_path(thought.object_key)
                if not file_path.exists():
                    raise FileNotFoundError(f"File not found: {thought.object_key}")

                # Read and transcribe
                with open(file_path, "rb") as f:
                    transcript = transcribe_audio(f, thought.original_filename or "recording.webm")

                thought.transcript = transcript
                thought.transcript_status = "ready"

                # Try to get duration
                try:
                    from mutagen import File as MutagenFile
                    audio = MutagenFile(str(file_path))
                    if audio and audio.info:
                        thought.duration_seconds = int(audio.info.length)
                except Exception:
                    pass  # Duration is optional

            except Exception as e:
                logger.error(f"Transcription failed for {thought_id}: {e}")
                thought.transcript_status = "failed"
                thought.processing_status = "failed"
                db.commit()
                return

        db.commit()

        # Now analyze
        _analyze_quick_thought_sync(thought_id, db=db)

    finally:
        db.close()


def _analyze_quick_thought_sync(thought_id: str, db=None) -> None:
    """
    Synchronously analyze a quick thought with AI.
    """
    from app.db.session import SessionLocal
    from app.models.quick_thought import QuickThought
    from app.services.quick_thoughts.analyzer import analyze_quick_thought_content
    from datetime import datetime, timezone

    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        thought = db.query(QuickThought).filter(QuickThought.id == thought_id).first()
        if not thought:
            logger.error(f"Quick thought {thought_id} not found for analysis")
            return

        content = thought.transcript or thought.text_content
        if not content:
            logger.warning(f"No content to analyze for quick thought {thought_id}")
            thought.processing_status = "ready"
            db.commit()
            return

        # Run AI analysis
        analysis = analyze_quick_thought_content(content)

        # Update thought with analysis results
        thought.auto_category = analysis.get("category")
        thought.auto_tags = analysis.get("tags", [])
        thought.emotion_score = analysis.get("emotion_score")
        thought.ai_summary = analysis.get("summary")
        thought.suggested_chapters = analysis.get("suggested_chapters", [])
        thought.processing_status = "ready"
        thought.updated_at = datetime.now(timezone.utc)

        db.commit()

        logger.info(
            f"Analyzed quick thought {thought_id}: "
            f"category={thought.auto_category}, "
            f"tags={thought.auto_tags}, "
            f"emotion={thought.emotion_score}"
        )

    except Exception as e:
        logger.error(f"Analysis failed for quick thought {thought_id}: {e}")
        if db:
            thought = db.query(QuickThought).filter(QuickThought.id == thought_id).first()
            if thought:
                thought.processing_status = "failed"
                db.commit()
    finally:
        if close_db:
            db.close()
