"""Resend email client with retry, bounce-guard, and deliverability headers."""

from __future__ import annotations

import time

import httpx
from loguru import logger

from app.core.config import settings


class ResendError(Exception):
    """Resend API error."""
    pass


class EmailBouncedError(ResendError):
    """Attempted to send to a hard-bounced address."""
    pass


_RETRY_STATUS_CODES = {429, 500, 502, 503, 504}
_MAX_RETRIES = 3
_RETRY_BACKOFF = [2, 5, 10]  # seconds between attempts


def send_email(
    to: str,
    subject: str,
    html: str,
    text: str | None = None,
    unsubscribe_url: str | None = None,
    email_bounced: bool = False,
) -> str:
    """
    Send an email via Resend API.

    Args:
        to: Recipient email address
        subject: Email subject line
        html: HTML email content (CSS already inlined)
        text: Plain text fallback
        unsubscribe_url: One-click unsubscribe URL for List-Unsubscribe header
        email_bounced: Skip send if True (hard-bounced address)

    Returns:
        Resend message ID

    Raises:
        EmailBouncedError: Address is hard-bounced, send skipped
        ResendError: API error after all retries exhausted
    """
    if email_bounced:
        logger.warning(f"Skipping email to hard-bounced address: {to}")
        raise EmailBouncedError(f"Address {to} has hard-bounced, send suppressed")

    if not settings.resend_enabled:
        logger.info(f"Email sending disabled. Would send '{subject}' to {to}")
        return "disabled"

    if not settings.resend_api_key:
        logger.warning("Resend API key not configured. Email not sent.")
        raise ResendError("Resend API key not configured")

    headers: dict[str, str] = {
        "Authorization": f"Bearer {settings.resend_api_key}",
        "Content-Type": "application/json",
    }

    payload: dict = {
        "from": settings.resend_from_email,
        "to": [to],
        "subject": subject,
        "html": html,
        "reply_to": settings.resend_reply_to_email,
    }

    if text:
        payload["text"] = text

    if unsubscribe_url:
        payload["headers"] = {
            "List-Unsubscribe": f"<{unsubscribe_url}>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }

    last_error: Exception | None = None

    for attempt in range(_MAX_RETRIES):
        try:
            response = httpx.post(
                "https://api.resend.com/emails",
                headers=headers,
                json=payload,
                timeout=30.0,
            )

            if response.status_code in _RETRY_STATUS_CODES:
                wait = _RETRY_BACKOFF[min(attempt, len(_RETRY_BACKOFF) - 1)]
                logger.warning(
                    f"Resend returned {response.status_code} (attempt {attempt + 1}/{_MAX_RETRIES}), "
                    f"retrying in {wait}s"
                )
                last_error = ResendError(f"HTTP {response.status_code}: {response.text[:200]}")
                time.sleep(wait)
                continue

            response.raise_for_status()
            data = response.json()
            message_id = data.get("id")

            if not message_id:
                raise ResendError("No message ID returned from Resend")

            logger.info(f"Email sent to {to} | subject='{subject}' | resend_id={message_id}")
            return message_id

        except httpx.HTTPStatusError as e:
            if e.response.status_code not in _RETRY_STATUS_CODES:
                # Non-retryable (e.g. 400 bad request, 401 auth)
                error_msg = f"Resend API error {e.response.status_code}: {e.response.text[:200]}"
                logger.error(error_msg)
                raise ResendError(error_msg) from e
            last_error = ResendError(str(e))
            wait = _RETRY_BACKOFF[min(attempt, len(_RETRY_BACKOFF) - 1)]
            time.sleep(wait)

        except httpx.RequestError as e:
            last_error = ResendError(f"Network error: {e}")
            wait = _RETRY_BACKOFF[min(attempt, len(_RETRY_BACKOFF) - 1)]
            logger.warning(f"Resend network error (attempt {attempt + 1}/{_MAX_RETRIES}): {e}")
            time.sleep(wait)

    raise ResendError(f"Failed after {_MAX_RETRIES} attempts: {last_error}")
