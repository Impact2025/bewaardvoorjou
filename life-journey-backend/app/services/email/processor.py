"""Email queue processor — Celery with synchronous fallback."""

from __future__ import annotations

from typing import Optional

from loguru import logger

from app.core.config import settings


def _is_celery_available() -> bool:
    """Ping Redis to confirm Celery broker is actually reachable."""
    if not settings.redis_url:
        return False
    try:
        import redis as redis_lib
        client = redis_lib.from_url(settings.redis_url, socket_connect_timeout=1)
        client.ping()
        return True
    except Exception:
        return False


def enqueue_email_job(email_event_id: str) -> Optional[str]:
    """
    Enqueue email sending job.

    Uses Celery when Redis is available; falls back to synchronous send in
    development or when the broker is unreachable.

    Returns:
        Task ID, "sync" if processed inline, or None on failure.
    """
    if _is_celery_available():
        try:
            from app.services.email.tasks import celery_app
            result = celery_app.send_task("email.send", args=[email_event_id])
            logger.info(f"Queued email job for event {email_event_id}, task_id={result.id}")
            return result.id
        except Exception as e:
            logger.warning(f"Celery enqueue failed for event {email_event_id}: {e}, falling back to sync")

    # Synchronous fallback
    logger.info(f"Processing email synchronously for event {email_event_id}")
    try:
        from app.services.email.tasks import send_email_task
        send_email_task(email_event_id)
        return "sync"
    except Exception as e:
        logger.error(f"Synchronous email send failed for event {email_event_id}: {e}")
        return None
