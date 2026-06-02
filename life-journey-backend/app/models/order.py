from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, JSON, String, Text

from app.models.base import Base
from app.models.user import generate_uuid


def utc_now():
    return datetime.now(timezone.utc)


class Order(Base):
    id = Column(String, primary_key=True, default=generate_uuid)

    # Koppelingen
    user_id = Column(String, nullable=True, index=True)  # NULL bij gastbestelling
    guest_email = Column(String(255), nullable=True)  # voor gastbestellingen

    # Pakket
    # BEGIN | ERFGOED | VOOR_ALTIJD
    package_type = Column(String(32), nullable=False)
    price_paid = Column(Integer, nullable=False)  # in eurocenten (bijv. 24900 = €249)

    # Add-ons (JSON lijst van codes: GIFT_BOX, EXTRA_USB, PHOTO_BOOK, EXTRA_STORAGE, VIDEO_INTRO)
    addons = Column(JSON, nullable=False, default=list)
    addons_price = Column(Integer, nullable=False, default=0)  # in eurocenten

    # Stripe
    stripe_payment_intent_id = Column(String(255), nullable=True, unique=True, index=True)
    stripe_payment_method = Column(String(64), nullable=True)  # ideal, card, klarna

    # Status: PENDING | PAID | FULFILLED | CANCELLED | REFUNDED
    status = Column(String(32), nullable=False, default="PENDING", index=True)

    # Personalisatie
    recipient_name = Column(String(255), nullable=True)
    personal_message = Column(Text, nullable=True)

    # Verzendadres (JSON)
    shipping_address = Column(JSON, nullable=True)

    # Tijdstempels
    created_at = Column(DateTime, default=utc_now, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    fulfilled_at = Column(DateTime, nullable=True)
