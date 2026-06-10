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
    OrderPublic,
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
            recipient_name=payload.recipient_name,
            recipient_email=str(payload.recipient_email) if payload.recipient_email else None,
            personal_message=payload.personal_message,
            shipping_address=payload.shipping_address.model_dump() if payload.shipping_address else None,
            gift_card_code=gift_card_code,
            status="PAID",
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        logger.info(f"Gratis order aangemaakt: {order.id} ({payload.package_type}, promo={promo_code_used})")

        # Email versturen (zelfde logica als in de Stripe webhook)
        _trigger_order_email_free(
            db=db,
            order=order,
            contact_email=contact_email,
            recipient_name=str(payload.recipient_name) if payload.recipient_name else None,
            recipient_email=str(payload.recipient_email) if payload.recipient_email else None,
        )

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
        recipient_name=payload.recipient_name,
        recipient_email=str(payload.recipient_email) if payload.recipient_email else None,
        personal_message=payload.personal_message,
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
        intent = stripe.PaymentIntent.create(
            amount=total_cents,
            currency="eur",
            automatic_payment_methods={"enabled": True},
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
            from app.services.email.renderer import build_gift_card_buyer_email
            from app.services.email.client import send_email
            gift_card_url = f"{settings.app_base_url}/cadeau/{order.gift_card_code}"
            subject, html, text = build_gift_card_buyer_email(
                buyer_email=contact_email,
                recipient_name=recipient_name or "je geliefde",
                gift_card_url=gift_card_url,
                voucher_code="UPGRADE30",
            )
            send_email(to=contact_email, subject=subject, html=html, text=text)
            logger.info(f"Gift card email verstuurd naar {contact_email} voor gratis order {order.id}")
        elif recipient_email and recipient_name:
            from app.services.auth import get_or_create_storyteller, create_magic_link_token
            from app.services.email.events import trigger_magic_link_email
            user = get_or_create_storyteller(db, email=recipient_email, display_name=recipient_name)
            token = create_magic_link_token(db, user=user)
            magic_link_url = f"{settings.app_base_url}/uitnodiging/{token}"
            gifter_name = contact_email.split("@")[0] if contact_email else "iemand die van je houdt"
            trigger_magic_link_email(db, user.id, magic_link_url, gifter_name=gifter_name)
            logger.info(f"Magic link verstuurd naar begiftigde {recipient_email} voor gratis order {order.id}")
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
