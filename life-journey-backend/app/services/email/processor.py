"""Email queue processor — Celery with non-blocking synchronous fallback."""

from __future__ import annotations

import threading
import time
from typing import Optional

from loguru import logger

from app.core.config import settings


# Cache the broker health-check so we don't ping Redis on every single email.
_CELERY_CHECK_TTL = 30.0  # seconds
_celery_check_cache: dict[str, float | bool] = {"ts": 0.0, "ok": False}


def _is_celery_available() -> bool:
    """Ping Redis to confirm the Celery broker is reachable, cached for a short TTL."""
    if not settings.redis_url:
        return False

    now = time.monotonic()
    last_ts = float(_celery_check_cache["ts"])
    if now - last_ts < _CELERY_CHECK_TTL:
        return bool(_celery_check_cache["ok"])

    ok = False
    try:
        import redis as redis_lib

        client = redis_lib.from_url(settings.redis_url, socket_connect_timeout=1)
        client.ping()
        ok = True
    except Exception:
        ok = False

    _celery_check_cache["ts"] = now
    _celery_check_cache["ok"] = ok
    return ok


def _send_sync(email_event_id: str) -> Optional[str]:
    """
    Send an email without Celery.

    When sending is actually enabled, the Resend call can block for up to ~17s
    (3 retries with backoff). We offload that to a daemon thread so the web
    request returns immediately. When sending is disabled (dev/test) the call is
    instant, so we run it inline to keep behaviour deterministic.
    """
    from app.services.email.tasks import send_email_task

    if not settings.resend_enabled:
        send_email_task(email_event_id)
        return "sync"

    def _run() -> None:
        try:
            send_email_task(email_event_id)
        except Exception as e:  # pragma: no cover - defensive, errors logged in task
            logger.error(f"Background email send failed for event {email_event_id}: {e}")

    thread = threading.Thread(
        target=_run,
        name=f"email-send-{email_event_id[:8]}",
        daemon=True,
    )
    thread.start()
    logger.info(f"Processing email in background thread for event {email_event_id}")
    return "sync-thread"


def enqueue_email_job(email_event_id: str) -> Optional[str]:
    """
    Enqueue email sending job.

    Uses Celery when Redis is available; falls back to a non-blocking background
    send in development or when the broker is unreachable.

    Returns:
        Task ID, "sync"/"sync-thread" if processed without Celery, or None on failure.
    """
    if _is_celery_available():
        try:
            from app.services.email.tasks import celery_app
            result = celery_app.send_task("email.send", args=[email_event_id])
            logger.info(f"Queued email job for event {email_event_id}, task_id={result.id}")
            return result.id
        except Exception as e:
            logger.warning(f"Celery enqueue failed for event {email_event_id}: {e}, falling back to sync")

    logger.info(f"Processing email without Celery for event {email_event_id}")
    try:
        return _send_sync(email_event_id)
    except Exception as e:
        logger.error(f"Synchronous email send failed for event {email_event_id}: {e}")
        return None
