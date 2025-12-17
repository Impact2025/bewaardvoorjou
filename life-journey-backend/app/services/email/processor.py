"""Email queue processor with Celery and sync fallback."""

from __future__ import annotations

from typing import Optional

from loguru import logger

from app.core.config import settings


def _is_celery_available() -> bool:
    """Check if Celery broker is configured and available."""
    return bool(settings.redis_url) and settings.redis_url != "redis://localhost:6379/0"


def enqueue_email_job(email_event_id: str) -> Optional[str]:
    """
    Enqueue email sending job.

    In production with Redis, this queues the job for async processing.
    In development without Redis, processes synchronously.

    Args:
        email_event_id: ID of the EmailEvent to send

    Returns:
        Task ID if queued, "sync" if processed synchronously, None if failed
    """
    if not _is_celery_available():
        logger.info(f"Celery not available, processing email synchronously for event {email_event_id}")
        # Process synchronously in development
        try:
            from app.services.email.tasks import send_email_task
            send_email_task(email_event_id)
            return "sync"
        except Exception as e:
            logger.error(f"Synchronous email send failed for event {email_event_id}: {e}")
            return None

    try:
        from app.services.email.tasks import celery_app
        result = celery_app.send_task("email.send", args=[email_event_id])
        logger.info(f"Queued email job for event {email_event_id}, task_id={result.id}")
        return result.id
    except Exception as e:
        logger.warning(f"Failed to queue email job for event {email_event_id}, falling back to sync: {e}")
        # Fallback: process synchronously
        try:
            from app.services.email.tasks import send_email_task
            send_email_task(email_event_id)
            return "sync"
        except Exception as e2:
            logger.error(f"Synchronous fallback also failed for event {email_event_id}: {e2}")
            return None
