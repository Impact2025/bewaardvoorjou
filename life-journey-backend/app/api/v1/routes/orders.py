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
    OrderPublic,
)
from loguru import logger

router = APIRouter()


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
    total_cents = package_price + addon_total

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

    # Maak order aan in DB
    order = Order(
        user_id=current_user.id if current_user else None,
        guest_email=None if current_user else contact_email,
        package_type=payload.package_type,
        price_paid=package_price,
        addons=list(set(payload.addons)),
        addons_price=addon_total,
        recipient_name=payload.recipient_name,
        personal_message=payload.personal_message,
        shipping_address=payload.shipping_address.model_dump() if payload.shipping_address else None,
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
            payment_method_types=["ideal", "card", "klarna"],
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
