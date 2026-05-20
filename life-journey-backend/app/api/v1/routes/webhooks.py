"""Resend webhook handler for bounce, complaint, and delivery events."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from fastapi import Depends
from app.models.email import EmailEvent as EmailEventModel
from app.models.user import User as UserModel
from app.models.email import EmailPreference as EmailPreferenceModel


router = APIRouter()

_TIMESTAMP_TOLERANCE_SECONDS = 300  # reject webhooks older than 5 minutes


def _verify_svix_signature(
    payload: bytes,
    svix_id: str,
    svix_timestamp: str,
    svix_signature: str,
    secret: str,
) -> bool:
    """
    Verify a Svix/Resend webhook signature.

    Signed content: "{svix_id}.{svix_timestamp}.{body}"
    Secret format:  "whsec_{base64_encoded_secret}"
    """
    # Reject stale webhooks
    try:
        ts = int(svix_timestamp)
        if abs(time.time() - ts) > _TIMESTAMP_TOLERANCE_SECONDS:
            logger.warning(f"Webhook timestamp too old: {svix_timestamp}")
            return False
    except ValueError:
        return False

    # Decode the secret (strip "whsec_" prefix if present)
    raw_secret = secret.removeprefix("whsec_")
    try:
        key = base64.b64decode(raw_secret)
    except Exception:
        logger.error("Invalid webhook signing secret format")
        return False

    signed_content = f"{svix_id}.{svix_timestamp}.{payload.decode()}"
    expected = base64.b64encode(
        hmac.new(key, signed_content.encode(), hashlib.sha256).digest()
    ).decode()

    # svix_signature may contain multiple "v1,{sig}" values separated by spaces
    for sig_item in svix_signature.split(" "):
        if sig_item.startswith("v1,"):
            candidate = sig_item[3:]
            if hmac.compare_digest(expected, candidate):
                return True

    return False


@router.post("/resend", tags=["webhooks"])
async def resend_webhook(
    request: Request,
    db: Session = Depends(get_db),
    svix_id: str = Header(None, alias="svix-id"),
    svix_timestamp: str = Header(None, alias="svix-timestamp"),
    svix_signature: str = Header(None, alias="svix-signature"),
) -> dict:
    body = await request.body()

    # Verify signature when secret is configured
    if settings.resend_webhook_signing_secret:
        if not all([svix_id, svix_timestamp, svix_signature]):
            raise HTTPException(status_code=400, detail="Missing Svix signature headers")

        if not _verify_svix_signature(
            payload=body,
            svix_id=svix_id,
            svix_timestamp=svix_timestamp,
            svix_signature=svix_signature,
            secret=settings.resend_webhook_signing_secret,
        ):
            logger.warning("Resend webhook signature verification failed")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
    else:
        logger.warning("RESEND_WEBHOOK_SIGNING_SECRET not set — skipping signature verification")

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type", "")
    data = event.get("data", {})
    resend_email_id = data.get("email_id") or data.get("id")

    logger.info(f"Resend webhook received: type={event_type}, email_id={resend_email_id}")

    if event_type == "email.bounced":
        _handle_bounce(db, resend_email_id, data)
    elif event_type == "email.complained":
        _handle_complaint(db, resend_email_id, data)
    elif event_type == "email.delivery_delayed":
        logger.warning(f"Delivery delayed for resend_id={resend_email_id}: {data.get('reason', 'unknown')}")
    else:
        logger.debug(f"Unhandled Resend event type: {event_type}")

    return {"ok": True}


def _handle_bounce(db: Session, resend_email_id: str | None, data: dict) -> None:
    """Mark the email event as bounced and flag the user's address."""
    now = datetime.now(timezone.utc)

    event = _find_event_by_resend_id(db, resend_email_id)
    if not event:
        logger.warning(f"No EmailEvent found for resend_id={resend_email_id} (bounce)")
        return

    event.status = "bounced"
    event.bounced_at = now

    # Mark user as hard-bounced so future sends are suppressed
    user = db.query(UserModel).filter(UserModel.id == event.user_id).first()
    if user:
        user.email_bounced = True
        user.email_bounced_at = now
        logger.info(f"Hard bounce recorded for user {user.id} ({user.email})")

    db.commit()


def _handle_complaint(db: Session, resend_email_id: str | None, data: dict) -> None:
    """Mark the event as complained and globally unsubscribe the user."""
    now = datetime.now(timezone.utc)

    event = _find_event_by_resend_id(db, resend_email_id)
    if not event:
        logger.warning(f"No EmailEvent found for resend_id={resend_email_id} (complaint)")
        return

    event.status = "complained"
    event.complained_at = now

    # Globally unsubscribe the user immediately
    prefs = db.query(EmailPreferenceModel).filter(
        EmailPreferenceModel.user_id == event.user_id
    ).first()
    if not prefs:
        prefs = EmailPreferenceModel(user_id=event.user_id)
        db.add(prefs)
    prefs.unsubscribed_all = True
    prefs.unsubscribed_at = now
    logger.info(f"Complaint received, unsubscribed user {event.user_id}")

    db.commit()


def _find_event_by_resend_id(db: Session, resend_email_id: str | None) -> EmailEventModel | None:
    if not resend_email_id:
        return None
    return db.query(EmailEventModel).filter(
        EmailEventModel.resend_id == resend_email_id
    ).first()
