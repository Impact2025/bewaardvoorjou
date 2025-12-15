import os
from typing import Optional
from loguru import logger

from app.core.config import settings


def _is_celery_available() -> bool:
    """Check if Celery broker is configured and available."""
    return bool(settings.redis_url) and settings.redis_url != "redis://localhost:6379/0"


def enqueue_transcode_job(asset_id: str) -> Optional[str]:
    """
    Enqueue transcode job for media asset.

    In production with Redis, this queues the job for async processing.
    In development without Redis, transcoding is skipped (original files used).

    Args:
        asset_id: ID of the MediaAsset to transcode

    Returns:
        Task ID if queued, "sync" if processed synchronously, None if skipped
    """
    if not _is_celery_available():
        logger.info(f"Transcoding skipped for asset {asset_id} (Celery not configured)")
        return None

    try:
        from app.services.media.tasks import celery_app
        result = celery_app.send_task("media.transcode", args=[asset_id])
        logger.info(f"Queued transcode job for asset {asset_id}, task_id={result.id}")
        return result.id
    except Exception as e:
        logger.warning(f"Failed to queue transcode job for {asset_id}: {e}")
        # Fallback: skip transcoding in dev
        return None


def enqueue_transcript_job(asset_id: str) -> Optional[str]:
    """
    Enqueue transcript generation job for media asset.

    In production with Redis, this queues the job for async processing.
    In development without Redis, processes synchronously.

    Args:
        asset_id: ID of the MediaAsset to transcribe

    Returns:
        Task ID if queued, "sync" if processed synchronously
    """
    if not _is_celery_available():
        logger.info(f"Celery not available, processing transcript synchronously for asset {asset_id}")
        # Process synchronously in development
        try:
            from app.services.media.tasks import generate_transcript
            generate_transcript(asset_id)
            return "sync"
        except Exception as e:
            logger.error(f"Synchronous transcript generation failed for {asset_id}: {e}")
            return None

    try:
        from app.services.media.tasks import celery_app
        result = celery_app.send_task("media.transcript", args=[asset_id])
        logger.info(f"Queued transcript job for asset {asset_id}, task_id={result.id}")
        return result.id
    except Exception as e:
        logger.warning(f"Failed to queue transcript job for {asset_id}, falling back to sync: {e}")
        # Fallback: process synchronously
        try:
            from app.services.media.tasks import generate_transcript
            generate_transcript(asset_id)
            return "sync"
        except Exception as e2:
            logger.error(f"Synchronous fallback also failed for {asset_id}: {e2}")
            return None


def get_processing_status(task_id: str) -> dict:
    """
    Get the status of a processing job.

    Args:
        task_id: The Celery task ID

    Returns:
        Dict with status info: {"state": str, "progress": Optional[int], "error": Optional[str]}
    """
    if task_id == "sync":
        return {"state": "SUCCESS", "progress": 100, "error": None}

    if not _is_celery_available():
        return {"state": "UNKNOWN", "progress": None, "error": "Celery not configured"}

    try:
        from app.services.media.tasks import celery_app
        result = celery_app.AsyncResult(task_id)
        return {
            "state": result.state,
            "progress": result.info.get("progress") if isinstance(result.info, dict) else None,
            "error": str(result.result) if result.failed() else None,
        }
    except Exception as e:
        logger.error(f"Failed to get task status for {task_id}: {e}")
        return {"state": "ERROR", "progress": None, "error": str(e)}
