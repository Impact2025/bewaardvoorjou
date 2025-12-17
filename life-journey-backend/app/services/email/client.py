"""Resend email client."""

from __future__ import annotations

import httpx
from loguru import logger

from app.core.config import settings


class ResendError(Exception):
    """Resend API error."""
    pass


def send_email(
    to: str,
    subject: str,
    html: str,
    text: str | None = None,
) -> str:
    """
    Send an email via Resend API.

    Args:
        to: Recipient email address
        subject: Email subject line
        html: HTML email content
        text: Plain text fallback (optional)

    Returns:
        Resend message ID

    Raises:
        ResendError: If email sending fails
    """
    if not settings.resend_enabled:
        logger.info(f"Email sending disabled. Would send to {to}: {subject}")
        return "disabled"

    if not settings.resend_api_key:
        logger.warning("Resend API key not configured. Email not sent.")
        raise ResendError("Resend API key not configured")

    # Prepare email payload
    payload = {
        "from": settings.resend_from_email,
        "to": [to],
        "subject": subject,
        "html": html,
    }

    if text:
        payload["text"] = text

    # Send via Resend API
    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()

        data = response.json()
        message_id = data.get("id")

        if not message_id:
            raise ResendError("No message ID returned from Resend")

        logger.info(f"Email sent successfully. Resend ID: {message_id}")
        return message_id

    except httpx.HTTPStatusError as e:
        error_msg = f"Resend API error: {e.response.status_code} - {e.response.text}"
        logger.error(error_msg)
        raise ResendError(error_msg) from e

    except httpx.RequestError as e:
        error_msg = f"Resend request error: {str(e)}"
        logger.error(error_msg)
        raise ResendError(error_msg) from e

    except Exception as e:
        error_msg = f"Unexpected error sending email: {str(e)}"
        logger.error(error_msg)
        raise ResendError(error_msg) from e
