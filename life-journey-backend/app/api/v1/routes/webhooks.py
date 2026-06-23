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

    # Globally unsubscribe the user immediately — alleen voor events met een account
    # (transactionele mails naar eigenaar/gast hebben geen user_id).
    if event.user_id:
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
    "VERHAAL":     {"package_tier": "VERHAAL",     "max_family_members": 0, "max_chapters": None, "storage_years": 5},
    "ERFGOED":     {"package_tier": "ERFGOED",     "max_family_members": 5, "max_chapters": None, "storage_years": 5},
    "NALATENSCHAP":{"package_tier": "NALATENSCHAP","max_family_members": 5, "max_chapters": None, "storage_years": 999},
    "BABY_GIFT":   {"package_tier": "BABY_GIFT",   "max_family_members": 5, "max_chapters": None, "storage_years": 5},
    # Legacy (backward compat)
    "BEGIN":       {"package_tier": "BEGIN",       "max_family_members": 2, "max_chapters": 3,    "storage_years": 3},
    "VOOR_ALTIJD": {"package_tier": "VOOR_ALTIJD", "max_family_members": 10,"max_chapters": None, "storage_years": 999},
    "DIGITAAL":    {"package_tier": "BEGIN",       "max_family_members": 2, "max_chapters": 3,    "storage_years": 3},
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

    # Verhoog promo code gebruiksteller
    if order.promo_code_used:
        from app.api.v1.routes.promo_codes import increment_promo_usage
        increment_promo_usage(db, order.promo_code_used)

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

    # Founding member: eerste 100 betalende klanten krijgen de badge
    if user_id and order.package_type in ("VERHAAL", "ERFGOED", "NALATENSCHAP"):
        _maybe_assign_founding_member(db, user_id)

    db.commit()
    logger.info(f"Order {order.id} succesvol verwerkt (€{order.price_paid / 100:.2f})")

    # Transcribeer een eventueel audio/video cadeaubericht (meeleesversie). Best-effort.
    if order.message_media_url and order.message_media_type in ("audio", "video"):
        try:
            from app.services.media.processor import enqueue_gift_message_transcript_job
            enqueue_gift_message_transcript_job(order.id)
        except Exception as exc:
            logger.warning(f"Kon cadeaubericht-transcriptie niet starten voor order {order.id}: {exc}")

    contact_email = metadata.get("contact_email") or order.guest_email or ""

    # Interne verkoopmelding naar de eigenaar (faalt nooit hard)
    from app.services.email.admin import send_owner_sale_notification
    send_owner_sale_notification(db, order, contact_email)

    if order.package_type == "DIGITAAL":
        # Legacy digitale cadeaukaart: stuur koper een email met de kaartlink
        _send_gift_card_buyer_email(db, order, contact_email)
    else:
        # Alle pakketten (VERHAAL/ERFGOED/NALATENSCHAP): universele cadeau-ruggengraat
        _dispatch_gift_emails(db, order, contact_email)


def _send_gift_card_buyer_email(db: Session, order: "OrderModel", buyer_email: str) -> None:
    """Stuur de koper een e-mail met de cadeaukaart link en upgradevoucher."""
    from app.services.email.renderer import build_gift_card_buyer_email
    from app.services.email.audit import log_and_send
    from app.core.config import settings as _settings

    if not buyer_email or not order.gift_card_code:
        logger.warning(f"Gift card email overgeslagen voor order {order.id}: geen email of code")
        return

    try:
        gift_card_url = f"{_settings.app_base_url}/cadeau/{order.gift_card_code}"
        subject, html, text = build_gift_card_buyer_email(
            buyer_email=buyer_email,
            recipient_name=order.recipient_name or "je geliefde",
            gift_card_url=gift_card_url,
            voucher_code="UPGRADE30",
        )
    except Exception as exc:
        logger.error(f"Kon gift card email niet opbouwen voor order {order.id}: {exc}")
        return

    log_and_send(
        db,
        email_type="gift_card_buyer",
        to=buyer_email,
        subject=subject,
        html=html,
        text=text,
        user_id=order.user_id,
        order_id=order.id,
    )


def _send_storyteller_magic_link(
    db: Session,
    recipient_email: str,
    recipient_name: str,
    gifter_email: str,
    package_type: str = "BEGIN",
    personal_message: str | None = None,
    baby_theme: str | None = None,
) -> bool:
    """Create (or fetch) a storyteller account, activate their package, and send a magic link.

    Returns True on success, False on failure. Never raises — callers must check
    the return value before marking redemption_email_sent_at.
    """
    from datetime import datetime, timezone
    from app.services.auth import get_or_create_storyteller, create_magic_link_token
    from app.services.email.events import trigger_magic_link_email, trigger_baby_magic_link_email
    from app.core.config import settings as _settings

    try:
        user = get_or_create_storyteller(db, email=recipient_email, display_name=recipient_name)

        # Activeer het cadeau-pakket op het account van de ontvanger
        pkg_settings = _PACKAGE_SETTINGS.get(package_type, _PACKAGE_SETTINGS["BEGIN"])
        now = datetime.now(timezone.utc)
        user.package_tier = pkg_settings["package_tier"]
        user.package_activated_at = now
        user.max_family_members = pkg_settings["max_family_members"]
        user.max_chapters = pkg_settings["max_chapters"]
        user.storage_years = pkg_settings["storage_years"]
        db.add(user)
        db.commit()
        logger.info(f"Pakket {package_type} geactiveerd voor ontvanger {recipient_email} (user {user.id})")

        token = create_magic_link_token(db, user=user)
        magic_link_url = f"{_settings.app_base_url}/uitnodiging/{token}"
        raw_name = gifter_email.split("@")[0] if gifter_email else ""
        gifter_name = raw_name.capitalize() if raw_name else "iemand die van je houdt"

        if package_type == "BABY_GIFT":
            trigger_baby_magic_link_email(
                db, user.id, magic_link_url,
                baby_theme=baby_theme or "neutraal",
                gifter_name=gifter_name,
                personal_message=personal_message,
            )
        else:
            trigger_magic_link_email(
                db, user.id, magic_link_url,
                gifter_name=gifter_name,
                personal_message=personal_message,
            )
        logger.info(f"Magic link verstuurd naar begiftigde storyteller {recipient_email}")
        return True
    except Exception as exc:
        logger.error(f"Kon magic link niet sturen naar {recipient_email}: {exc}")
        return False


_PACKAGE_NAMES = {
    "VERHAAL":     "Verhaal (Digitaal)",
    "ERFGOED":     "Erfgoed Box",
    "NALATENSCHAP":"Nalatenschap (Lifetime)",
    # Legacy
    "BEGIN":       "Het Begin",
    "VOOR_ALTIJD": "Voor Altijd",
    "DIGITAAL":    "Digitaal cadeau",
}


def _send_gift_buyer_confirmation(
    db: Session,
    order: "OrderModel",
    buyer_email: str,
    recipient_name: str,
    recipient_email: str = "",
) -> None:
    """Stuur de koper een bevestiging — met de printbare startkaart-link voor élk pakket."""
    from app.services.email.renderer import build_gift_buyer_confirmation_email
    from app.services.email.audit import log_and_send
    from app.core.config import settings as _settings

    shipping_city: str | None = None
    if order.shipping_address and isinstance(order.shipping_address, dict):
        shipping_city = order.shipping_address.get("city")

    redemption_url = (
        f"{_settings.app_base_url}/cadeau/{order.redemption_token}"
        if order.redemption_token else None
    )
    delivery_date_str = order.delivery_date.isoformat() if order.delivery_date else None

    try:
        subject, html, text = build_gift_buyer_confirmation_email(
            buyer_email=buyer_email,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            package_name=_PACKAGE_NAMES.get(order.package_type, order.package_type),
            order_id_short=order.id[:8].upper(),
            shipping_city=shipping_city,
            redemption_url=redemption_url,
            has_recipient_email=bool(recipient_email),
            delivery_date=delivery_date_str,
        )
    except Exception as exc:
        logger.error(f"Kon koper-bevestiging niet opbouwen voor order {order.id}: {exc}")
        return

    log_and_send(
        db,
        email_type="gift_buyer_confirmation",
        to=buyer_email,
        subject=subject,
        html=html,
        text=text,
        user_id=order.user_id,
        order_id=order.id,
    )


def _delivery_is_due(order: "OrderModel") -> bool:
    """True als het bezorgmoment vandaag of in het verleden ligt (of niet ingesteld)."""
    if not order.delivery_date:
        return True
    from datetime import date as _date
    delivery = order.delivery_date
    if isinstance(delivery, datetime):
        delivery = delivery.date()
    return delivery <= _date.today()


def _dispatch_gift_emails(db: Session, order: "OrderModel", contact_email: str) -> None:
    """Stuur de cadeau-e-mails voor élk pakket via dezelfde ruggengraat.

    - Ontvanger (als e-mail bekend én bezorgmoment bereikt): redemption/magic link,
      met het persoonlijke bericht als eerste wat ze zien.
    - Koper: altijd direct een bevestiging met de printbare startkaart-link.

    Een toekomstig bezorgmoment stelt alleen de ontvanger-mail uit; de beat-taak
    `email.scheduled_gift_redemptions` verstuurt die op de dag zelf (idempotent via
    redemption_email_sent_at).
    """
    is_gift = bool(order.redemption_token or order.recipient_email or order.recipient_name)
    if not is_gift:
        # 'Voor mezelf' — stuur BABY_GIFT kopers een warme welkomstmail.
        if order.package_type == "BABY_GIFT" and contact_email:
            _send_baby_self_welcome(db, order, contact_email)
        return

    recipient_name = order.recipient_name or "je dierbare"

    if order.recipient_email and not order.redemption_email_sent_at and _delivery_is_due(order):
        sent = _send_storyteller_magic_link(
            db, order.recipient_email, recipient_name, contact_email or "",
            package_type=order.package_type,
            personal_message=order.personal_message,
            baby_theme=getattr(order, "baby_theme", None),
        )
        if sent:
            order.redemption_email_sent_at = datetime.now(timezone.utc)
            db.commit()
    elif order.recipient_email and not _delivery_is_due(order):
        logger.info(f"Ontvanger-mail uitgesteld tot {order.delivery_date} voor order {order.id}")

    if contact_email:
        _send_gift_buyer_confirmation(
            db, order, contact_email, recipient_name, order.recipient_email or "",
        )


def _send_baby_self_welcome(db: Session, order: "OrderModel", contact_email: str) -> None:
    """Warme welkomstmail voor ouders die BABY_GIFT voor zichzelf kopen."""
    from app.services.email.renderer import build_baby_self_welcome_email
    from app.services.email.audit import log_and_send
    from app.core.config import settings as _settings

    try:
        onboarding_url = f"{_settings.app_base_url}/voor-baby/onboarding"
        baby_theme = getattr(order, "baby_theme", None) or "neutraal"
        subject, html, text = build_baby_self_welcome_email(
            onboarding_url=onboarding_url,
            baby_theme=baby_theme,
        )
    except Exception as exc:
        logger.error(f"Kon baby_self_welcome niet opbouwen voor order {order.id}: {exc}")
        return

    log_and_send(
        db,
        email_type="baby_self_welcome",
        to=contact_email,
        subject=subject,
        html=html,
        text=text,
        user_id=order.user_id,
        order_id=order.id,
    )


def _maybe_assign_founding_member(db: Session, user_id: str) -> None:
    """Koppel founding member status aan de gebruiker als er nog plekken zijn."""
    from app.core.config import settings as _settings
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user or user.founding_member:
        return
    count = db.query(OrderModel).filter(
        OrderModel.status == "PAID",
        OrderModel.package_type.in_(["VERHAAL", "ERFGOED", "NALATENSCHAP"]),
    ).count()
    if count <= _settings.founding_member_max_count:
        user.founding_member = True
        user.founding_member_number = count
        logger.info(f"Founding member #{count} toegewezen aan gebruiker {user_id}")


def _handle_payment_failed(db: Session, payment_intent: dict) -> None:
    intent_id = payment_intent.get("id") if isinstance(payment_intent, dict) else payment_intent.id
    order = db.query(OrderModel).filter(OrderModel.stripe_payment_intent_id == intent_id).first()
    if order and order.status == "PENDING":
        order.status = "CANCELLED"
        db.commit()
        logger.info(f"Order {order.id} geannuleerd na mislukte betaling")
