"""Orders API — Stripe payment intents voor pakket-aankopen."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_user
from app.core.config import settings
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.orders import (
    ADDON_PRICES,
    PACKAGE_PRICES,
    CreatePaymentIntentRequest,
    CreatePaymentIntentResponse,
    EarlyBirdStatus,
    GiftMessagePresignRequest,
    GiftMessagePresignResponse,
    GiftRedemptionPublic,
    OrderPublic,
    OrderStatusPublic,
    StartRedemptionRequest,
)
from loguru import logger

router = APIRouter()


def _early_bird_discount_cents(package_type: str) -> int:
    """Geeft de actieve early bird korting terug in eurocenten, of 0 als niet actief."""
    from datetime import datetime, timezone
    from dateutil.parser import parse as parse_dt
    if not settings.early_bird_active:
        return 0
    try:
        deadline = parse_dt(settings.early_bird_deadline)
        if datetime.now(timezone.utc) <= deadline:
            if package_type == "VERHAAL":
                return settings.early_bird_verhaal_discount_cents
            if package_type == "ERFGOED":
                return settings.early_bird_erfgoed_discount_cents
            if package_type == "BEGIN":
                return settings.early_bird_begin_discount_cents
            if package_type == "DIGITAAL":
                return settings.early_bird_digitaal_discount_cents
    except Exception:
        pass
    return 0


@router.get("/founding-member-spots")
def get_founding_member_spots(db: Session = Depends(get_db)) -> dict:
    """Geeft aan hoeveel founding member plekken er nog beschikbaar zijn."""
    count = (
        db.query(Order)
        .filter(
            Order.status == "PAID",
            Order.package_type.in_(["VERHAAL", "ERFGOED", "NALATENSCHAP"]),
        )
        .count()
    )
    remaining = max(0, settings.founding_member_max_count - count)
    return {"remaining": remaining, "total": settings.founding_member_max_count, "filled": count}


@router.get("/early-bird", response_model=EarlyBirdStatus)
def get_early_bird_status() -> EarlyBirdStatus:
    """Publiek endpoint — geeft de huidige early bird status terug."""
    from datetime import datetime, timezone
    from dateutil.parser import parse as parse_dt
    try:
        deadline = parse_dt(settings.early_bird_deadline)
        active = settings.early_bird_active and datetime.now(timezone.utc) <= deadline
    except Exception:
        active = False
    return EarlyBirdStatus(
        active=active,
        discount_cents=settings.early_bird_begin_discount_cents if active else 0,
        deadline_iso=settings.early_bird_deadline,
        waitlist_discount_cents=settings.early_bird_waitlist_discount_cents if active else 0,
        digitaal_discount_cents=settings.early_bird_digitaal_discount_cents if active else 0,
        verhaal_discount_cents=settings.early_bird_verhaal_discount_cents if active else 0,
        erfgoed_discount_cents=settings.early_bird_erfgoed_discount_cents if active else 0,
    )


_GIFT_MESSAGE_MAX_BYTES = {
    "audio": 25 * 1024 * 1024,   # ~3 min spraak ruim binnen bereik
    "video": 50 * 1024 * 1024,   # ~90 sec
}
_GIFT_MESSAGE_EXTS = {
    "audio": {".webm", ".m4a", ".mp3", ".wav", ".ogg"},
    "video": {".webm", ".mp4", ".mov"},
}


@router.post("/gift-message/presign", response_model=GiftMessagePresignResponse, status_code=201)
@limiter.limit(RateLimits.WRITE_STANDARD)
def presign_gift_message(
    request: Request,
    payload: GiftMessagePresignRequest,
) -> GiftMessagePresignResponse:
    """Mint een upload-URL voor een audio/video cadeaubericht (opgenomen in de browser).

    Geen account vereist (gastcheckout). Het bestand wordt via de bestaande media-proxy
    geüpload onder de key `gift-messages/{draft}/{asset}/{filename}`; die key gaat daarna
    als `message_media_url` mee in create-payment-intent.
    """
    import uuid as _uuid
    from app.services.media.validators import sanitize_filename, validate_file_extension

    ext = validate_file_extension(payload.filename)  # blokkeert gevaarlijke/onbekende extensies
    if ext not in _GIFT_MESSAGE_EXTS[payload.modality]:
        raise HTTPException(
            status_code=400,
            detail=f"Bestandstype '{ext}' niet toegestaan voor een {payload.modality}-bericht",
        )

    max_bytes = _GIFT_MESSAGE_MAX_BYTES[payload.modality]
    if payload.size_bytes > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Bericht te groot ({payload.size_bytes // (1024*1024)}MB). Maximum: {max_bytes // (1024*1024)}MB",
        )

    draft_id = _uuid.uuid4().hex
    asset_id = _uuid.uuid4().hex
    safe_filename = sanitize_filename(payload.filename)
    object_key = f"gift-messages/{draft_id}/{asset_id}/{safe_filename}"
    upload_url = f"{settings.api_base_url}/api/v1/media/local-upload/{object_key}"

    logger.info(f"Gift-message upload-URL aangemaakt: {object_key} ({payload.modality})")
    return GiftMessagePresignResponse(upload_url=upload_url, object_key=object_key)


def _gift_personalization_kwargs(payload: CreatePaymentIntentRequest) -> dict:
    """Bouwt de cadeau-personalisatievelden + universele redemption-token.

    Een redemption-token wordt aangemaakt voor élke cadeau-order (niet voor 'voor mezelf'),
    zodat het cadeau ontgrendeld kan worden via QR op de (start)kaart én via e-mail — ook
    als het e-mailadres van de ontvanger niet bekend is. Dat geeft VERHAAL (digitaal),
    ERFGOED (doos) en NALATENSCHAP hetzelfde overhandig-ritueel.
    """
    import secrets as _secrets_token
    is_gift = (not payload.for_self) and bool(payload.recipient_name or payload.recipient_email)
    message_type = payload.message_media_type or ("text" if payload.personal_message else None)
    return {
        "recipient_name": payload.recipient_name,
        "recipient_email": str(payload.recipient_email) if payload.recipient_email else None,
        "recipient_relation": payload.recipient_relation,
        "personal_message": payload.personal_message,
        "card_message": payload.card_message,
        "message_media_url": payload.message_media_url,
        "message_media_type": message_type,
        # Heeft de koper media geüpload? Dan staat de transcriptie nog op de rol.
        "message_status": "pending" if payload.message_media_url else None,
        "gift_reveal": payload.gift_reveal,
        "delivery_date": payload.delivery_date,
        "redemption_token": _secrets_token.token_urlsafe(16) if is_gift else None,
    }


def _get_stripe():
    import stripe
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Betalingssysteem tijdelijk niet beschikbaar",
        )
    stripe.api_key = settings.stripe_secret_key
    return stripe


@router.post(
    "/create-payment-intent",
    response_model=CreatePaymentIntentResponse,
    status_code=201,
)
@limiter.limit(RateLimits.WRITE_STANDARD)
def create_payment_intent(
    request: Request,
    payload: CreatePaymentIntentRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> CreatePaymentIntentResponse:
    stripe = _get_stripe()

    if not settings.stripe_publishable_key:
        raise HTTPException(status_code=503, detail="Stripe niet geconfigureerd")

    # Bereken totaalprijs
    package_price = PACKAGE_PRICES.get(payload.package_type)
    if package_price is None:
        raise HTTPException(status_code=400, detail="Ongeldig pakket")

    addon_total = sum(ADDON_PRICES.get(a, 0) for a in set(payload.addons))
    early_bird_discount = _early_bird_discount_cents(payload.package_type)

    # Promo code validatie
    promo_discount = 0
    promo_code_used = None
    if payload.promo_code:
        from app.api.v1.routes.promo_codes import apply_promo_code
        promo_discount, promo_error = apply_promo_code(db, payload.promo_code, payload.package_type)
        if promo_error:
            raise HTTPException(status_code=400, detail=promo_error)
        promo_code_used = payload.promo_code.upper().strip()

    discount = early_bird_discount + promo_discount
    total_cents = package_price + addon_total - discount

    # Gratis order — promo maakt het volledig gratis, geen Stripe nodig
    if total_cents <= 0:
        contact_email = (
            current_user.email if current_user
            else (str(payload.guest_email) if payload.guest_email else None)
        )
        if not contact_email:
            raise HTTPException(
                status_code=400,
                detail="E-mailadres vereist voor niet-ingelogde gebruikers",
            )
        import secrets as _secrets_free
        gift_card_code = (
            _secrets_free.token_urlsafe(8)[:10].upper()
            if payload.package_type == "DIGITAAL"
            else None
        )
        order = Order(
            user_id=current_user.id if current_user else None,
            guest_email=None if current_user else contact_email,
            package_type=payload.package_type,
            price_paid=0,
            discount_cents=discount,
            promo_code_used=promo_code_used,
            addons=list(set(payload.addons)),
            addons_price=addon_total,
            **_gift_personalization_kwargs(payload),
            shipping_address=payload.shipping_address.model_dump() if payload.shipping_address else None,
            gift_card_code=gift_card_code,
            status="PAID",
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        logger.info(f"Gratis order aangemaakt: {order.id} ({payload.package_type}, promo={promo_code_used})")

        # Transcribeer een eventueel audio/video cadeaubericht (meeleesversie). Best-effort.
        if order.message_media_url and order.message_media_type in ("audio", "video"):
            try:
                from app.services.media.processor import enqueue_gift_message_transcript_job
                enqueue_gift_message_transcript_job(order.id)
            except Exception as exc:
                logger.warning(f"Kon cadeaubericht-transcriptie niet starten voor order {order.id}: {exc}")

        # Email versturen (zelfde logica als in de Stripe webhook)
        _trigger_order_email_free(
            db=db,
            order=order,
            contact_email=contact_email,
            recipient_name=str(payload.recipient_name) if payload.recipient_name else None,
            recipient_email=str(payload.recipient_email) if payload.recipient_email else None,
        )

        # Interne verkoopmelding naar de eigenaar
        from app.services.email.admin import send_owner_sale_notification
        send_owner_sale_notification(db, order, contact_email)

        return CreatePaymentIntentResponse(
            client_secret="",
            payment_intent_id="",
            order_id=order.id,
            amount_cents=0,
            publishable_key=settings.stripe_publishable_key or "",
        )

    # Stripe minimum €0.50
    if total_cents < 50:
        total_cents = 50

    # Contactemail: ingelogde gebruiker of gast-email
    contact_email = (
        current_user.email if current_user
        else (str(payload.guest_email) if payload.guest_email else None)
    )
    if not contact_email:
        raise HTTPException(
            status_code=400,
            detail="E-mailadres vereist voor niet-ingelogde gebruikers",
        )

    # Genereer cadeaukaartcode voor digitaal pakket
    import secrets as _secrets
    gift_card_code = (
        _secrets.token_urlsafe(8)[:10].upper()
        if payload.package_type == "DIGITAAL"
        else None
    )

    # Maak order aan in DB
    order = Order(
        user_id=current_user.id if current_user else None,
        guest_email=None if current_user else contact_email,
        package_type=payload.package_type,
        price_paid=total_cents,
        discount_cents=discount,
        promo_code_used=promo_code_used,
        addons=list(set(payload.addons)),
        addons_price=addon_total,
        **_gift_personalization_kwargs(payload),
        shipping_address=payload.shipping_address.model_dump() if payload.shipping_address else None,
        gift_card_code=gift_card_code,
        status="PENDING",
    )
    db.add(order)
    db.flush()

    metadata: dict = {
        "order_id": order.id,
        "package_type": payload.package_type,
        "addons": ",".join(sorted(payload.addons)) if payload.addons else "",
        "contact_email": contact_email,
    }
    if current_user:
        metadata["user_id"] = current_user.id
    if payload.recipient_name:
        metadata["recipient_name"] = payload.recipient_name
    if payload.recipient_email:
        metadata["recipient_email"] = str(payload.recipient_email)
    if payload.personal_message:
        metadata["personal_message"] = payload.personal_message[:200]

    try:
        # Expliciete betaalmethodes i.p.v. automatic_payment_methods:
        # voorkomt dat Link (met opgeslagen kaart) de PaymentElement overneemt
        # en zorgt dat iDEAL altijd als eerste optie zichtbaar is (NL-markt).
        intent = stripe.PaymentIntent.create(
            amount=total_cents,
            currency="eur",
            payment_method_types=["ideal", "card", "bancontact"],
            metadata=metadata,
            receipt_email=contact_email,
            description=f"Bewaardvoorjou — {payload.package_type} pakket",
        )
    except Exception as exc:
        db.rollback()
        logger.error(f"Stripe PaymentIntent aanmaken mislukt: {exc}")
        raise HTTPException(
            status_code=502, detail="Betaling kon niet worden gestart"
        ) from exc

    order.stripe_payment_intent_id = intent.id
    db.commit()

    return CreatePaymentIntentResponse(
        client_secret=intent.client_secret,
        payment_intent_id=intent.id,
        order_id=order.id,
        amount_cents=total_cents,
        publishable_key=settings.stripe_publishable_key,
    )


def _map_stripe_status(stripe_status: str) -> str:
    """Vertaalt een Stripe PaymentIntent-status naar onze hoog-niveau status."""
    if stripe_status == "succeeded":
        return "paid"
    if stripe_status == "processing":
        return "processing"
    if stripe_status in ("canceled", "requires_payment_method"):
        # Geannuleerd of laatste poging mislukt/afgebroken.
        return "failed"
    # requires_action | requires_confirmation | requires_capture → nog niet afgerond
    return "pending"


@router.get("/{order_id}/status", response_model=OrderStatusPublic)
@limiter.limit(RateLimits.READ_STANDARD)
def get_order_status(
    request: Request,
    order_id: str,
    db: Session = Depends(get_db),
) -> OrderStatusPublic:
    """Gezaghebbende betaalstatus voor de bevestigingspagina na een Stripe-redirect.

    Vertrouwt NIET op de `redirect_status` uit de URL (die zegt niets over de
    werkelijke betaling en mag nooit een geslaagde bevestiging tonen). De order-id
    is een niet-raadbare UUID en fungeert als toegangssleutel voor gastbestellingen.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Bestelling niet gevonden")

    # Bepaal hoog-niveau status. De DB is leidend zodra de webhook is verwerkt;
    # daarvoor vragen we de live status bij Stripe op (webhook-race).
    if order.status in ("PAID", "FULFILLED"):
        high_level = "paid"
    elif order.status in ("CANCELLED", "REFUNDED"):
        high_level = "failed"
    elif order.stripe_payment_intent_id:
        try:
            stripe = _get_stripe()
            intent = stripe.PaymentIntent.retrieve(order.stripe_payment_intent_id)
            high_level = _map_stripe_status(intent.status)
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning(f"Kon PaymentIntent-status niet ophalen voor order {order_id}: {exc}")
            # Veilige fallback: behandel als nog-niet-betaald i.p.v. valse success.
            high_level = "pending"
    else:
        high_level = "pending"

    shipping = order.shipping_address or {}
    # Toon de redemption-token alleen zodra betaald — vóór betaling heeft de
    # bevestigingspagina de startkaart toch niet nodig.
    redemption_token = order.redemption_token if high_level == "paid" else None
    return OrderStatusPublic(
        order_id=order.id,
        status=high_level,
        package_type=order.package_type,
        recipient_name=order.recipient_name,
        recipient_email=order.recipient_email,
        has_shipping=bool(shipping.get("city")),
        shipping_city=shipping.get("city"),
        redemption_token=redemption_token,
        gift_reveal=order.gift_reveal,
        delivery_date=order.delivery_date,
    )


def _gift_media_playback_url(object_key: str | None) -> str | None:
    """Bouw een afspeelbare URL voor een audio/video cadeaubericht.

    S3/R2: een presigned GET-URL (1 uur geldig). Anders: de publieke serve-endpoint.
    """
    if not object_key:
        return None
    if settings.s3_bucket and settings.aws_access_key_id and settings.aws_secret_access_key:
        try:
            import boto3
            endpoint_url = settings.s3_endpoint_url
            if not endpoint_url and settings.s3_region:
                endpoint_url = f"https://s3.{settings.s3_region}.amazonaws.com"
            s3 = boto3.client(
                "s3",
                region_name=settings.s3_region,
                endpoint_url=endpoint_url,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
            )
            return s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.s3_bucket, "Key": object_key},
                ExpiresIn=3600,
            )
        except Exception as exc:
            logger.warning(f"Kon presigned URL niet maken voor {object_key}: {exc}")
    return f"{settings.api_base_url}/api/v1/media/local-file/{object_key}"


@router.get("/redeem/{token}", response_model=GiftRedemptionPublic)
@limiter.limit(RateLimits.READ_STANDARD)
def get_gift_redemption(
    request: Request,
    token: str,
    db: Session = Depends(get_db),
) -> GiftRedemptionPublic:
    """Publieke ontgrendel-data voor de cadeaupagina (QR/startkaart).

    De token is een niet-raadbare sleutel. Markeert de eerste ontgrendeling, zodat het
    persoonlijke bericht prominent als eerste getoond kan worden.
    """
    from datetime import datetime, timezone

    order = db.query(Order).filter(Order.redemption_token == token).first()
    if not order:
        raise HTTPException(status_code=404, detail="Cadeau niet gevonden")
    if order.status not in ("PAID", "FULFILLED"):
        raise HTTPException(status_code=404, detail="Dit cadeau is nog niet beschikbaar")

    already_redeemed = order.redeemed_at is not None
    if not order.redeemed_at:
        order.redeemed_at = datetime.now(timezone.utc)
        db.commit()

    # Naam van de gever afleiden (account-naam, anders het deel vóór de @)
    gifter_name: str | None = None
    contact = order.guest_email
    if order.user_id:
        user = db.query(User).filter(User.id == order.user_id).first()
        if user:
            contact = user.email
            gifter_name = user.display_name
    if not gifter_name and contact:
        gifter_name = contact.split("@")[0].capitalize()

    playback_url = (
        _gift_media_playback_url(order.message_media_url)
        if order.message_media_type in ("audio", "video")
        else None
    )

    return GiftRedemptionPublic(
        recipient_name=order.recipient_name,
        recipient_relation=order.recipient_relation,
        package_type=order.package_type,
        gifter_name=gifter_name,
        personal_message=order.personal_message,
        message_media_type=order.message_media_type,
        message_media_url=playback_url,
        message_transcript=order.message_transcript,
        message_status=order.message_status,
        card_message=order.card_message,
        already_redeemed=already_redeemed,
    )


@router.post("/redeem/{token}/start", status_code=202)
@limiter.limit(RateLimits.WRITE_STANDARD)
def start_gift_redemption(
    request: Request,
    token: str,
    payload: StartRedemptionRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Start het cadeau vanaf de QR/startkaart: stuur de ontvanger een magic link.

    Voor cadeaus zonder vooraf bekend e-mailadres. Hergebruikt dezelfde activatie- en
    magic-link-logica als het e-mailpad, zodat het pakket direct geactiveerd wordt.
    """
    from datetime import datetime, timezone

    order = db.query(Order).filter(Order.redemption_token == token).first()
    if not order or order.status not in ("PAID", "FULFILLED"):
        raise HTTPException(status_code=404, detail="Cadeau niet gevonden")

    from app.api.v1.routes.webhooks import _send_storyteller_magic_link

    contact_email = order.guest_email or ""
    if order.user_id:
        user = db.query(User).filter(User.id == order.user_id).first()
        if user:
            contact_email = user.email

    _send_storyteller_magic_link(
        db,
        str(payload.email),
        order.recipient_name or "je dierbare",
        contact_email,
        package_type=order.package_type,
        personal_message=order.personal_message,
    )

    # Onthoud het e-mailadres + markeer verzonden (voorkomt dubbele geplande send)
    if not order.recipient_email:
        order.recipient_email = str(payload.email)
    if not order.redemption_email_sent_at:
        order.redemption_email_sent_at = datetime.now(timezone.utc)
    db.commit()

    logger.info(f"Ontvanger startte cadeau via token voor order {order.id} → magic link naar {payload.email}")
    return {"ok": True}


def _trigger_order_email_free(
    db: Session,
    order: Order,
    contact_email: str,
    recipient_name: str | None,
    recipient_email: str | None,
) -> None:
    """Verstuurt de juiste email na een gratis order (spiegelt de Stripe webhook logica)."""
    try:
        if order.package_type == "DIGITAAL" and order.gift_card_code:
            # Cadeaukaart-mail (incl. EmailEvent-tracking) — gedeeld met de webhook-flow.
            from app.api.v1.routes.webhooks import _send_gift_card_buyer_email
            _send_gift_card_buyer_email(db, order, contact_email)
        else:
            # Universele cadeau-ruggengraat: ontvanger-uitnodiging (indien e-mail bekend)
            # + koper-bevestiging met startkaart-link. Hergebruikt de webhook-logica.
            from app.api.v1.routes.webhooks import _dispatch_gift_emails
            _dispatch_gift_emails(db, order, contact_email)
    except Exception as exc:
        logger.error(f"Kon email niet sturen voor gratis order {order.id}: {exc}")


@router.get("/my-orders", response_model=list[OrderPublic])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OrderPublic]:
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderPublic.model_validate(o) for o in orders]
