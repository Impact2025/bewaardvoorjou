"""Webhook handlers: Resend (email events) en Stripe (betalingen)."""

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
from app.models.order import Order as OrderModel
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


# ---------------------------------------------------------------------------
# Stripe webhook
# ---------------------------------------------------------------------------

# Pakket-tier instellingen die op de user worden gezet na betaling
_PACKAGE_SETTINGS = {
    "BEGIN": {"package_tier": "BEGIN", "max_family_members": 2, "max_chapters": 3, "storage_years": 3},
    "ERFGOED": {"package_tier": "ERFGOED", "max_family_members": 5, "max_chapters": None, "storage_years": 10},
    "VOOR_ALTIJD": {"package_tier": "VOOR_ALTIJD", "max_family_members": 10, "max_chapters": None, "storage_years": 999},
}


@router.post("/stripe", tags=["webhooks"])
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
    stripe_signature: str = Header(None, alias="stripe-signature"),
) -> dict:
    import stripe as stripe_lib

    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe niet geconfigureerd")

    stripe_lib.api_key = settings.stripe_secret_key
    body = await request.body()

    # Verifieer webhook-handtekening
    if settings.stripe_webhook_secret:
        try:
            event = stripe_lib.Webhook.construct_event(
                body, stripe_signature, settings.stripe_webhook_secret
            )
        except stripe_lib.error.SignatureVerificationError:
            logger.warning("Stripe webhook handtekening verificatie mislukt")
            raise HTTPException(status_code=400, detail="Ongeldige handtekening")
    else:
        logger.warning("STRIPE_WEBHOOK_SECRET niet ingesteld — handtekening overgeslagen")
        try:
            event = json.loads(body)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Ongeldige JSON")

    event_type = event.get("type") if isinstance(event, dict) else event["type"]
    logger.info(f"Stripe webhook ontvangen: {event_type}")

    if event_type == "payment_intent.succeeded":
        data = event["data"]["object"] if isinstance(event, dict) else event.data.object
        _handle_payment_succeeded(db, data)
    elif event_type == "payment_intent.payment_failed":
        data = event["data"]["object"] if isinstance(event, dict) else event.data.object
        _handle_payment_failed(db, data)

    return {"ok": True}


def _handle_payment_succeeded(db: Session, payment_intent: dict) -> None:
    now = datetime.now(timezone.utc)
    intent_id = payment_intent.get("id") if isinstance(payment_intent, dict) else payment_intent.id
    metadata = payment_intent.get("metadata", {}) if isinstance(payment_intent, dict) else payment_intent.metadata

    order = db.query(OrderModel).filter(OrderModel.stripe_payment_intent_id == intent_id).first()
    if not order:
        logger.error(f"Geen order gevonden voor PaymentIntent {intent_id}")
        return

    if order.status == "PAID":
        logger.info(f"Order {order.id} al verwerkt, overgeslagen")
        return

    order.status = "PAID"
    order.paid_at = now
    payment_method = payment_intent.get("payment_method_types", ["card"])[0] if isinstance(payment_intent, dict) else None
    order.stripe_payment_method = payment_method

    # Activeer digitale toegang voor bekende gebruiker
    user_id = metadata.get("user_id") or order.user_id
    if user_id:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if user:
            pkg_settings = _PACKAGE_SETTINGS.get(order.package_type, {})
            user.package_tier = pkg_settings.get("package_tier", "BEGIN")
            user.package_activated_at = now
            user.max_family_members = pkg_settings.get("max_family_members", 0)
            user.max_chapters = pkg_settings.get("max_chapters")
            user.storage_years = pkg_settings.get("storage_years", 0)
            logger.info(f"Pakket {order.package_type} geactiveerd voor gebruiker {user.id}")

    db.commit()
    logger.info(f"Order {order.id} succesvol verwerkt (€{order.price_paid / 100:.2f})")


def _handle_payment_failed(db: Session, payment_intent: dict) -> None:
    intent_id = payment_intent.get("id") if isinstance(payment_intent, dict) else payment_intent.id
    order = db.query(OrderModel).filter(OrderModel.stripe_payment_intent_id == intent_id).first()
    if order and order.status == "PENDING":
        order.status = "CANCELLED"
        db.commit()
        logger.info(f"Order {order.id} geannuleerd na mislukte betaling")
