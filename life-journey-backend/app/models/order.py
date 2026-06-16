from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Integer, JSON, String, Text

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
    recipient_email = Column(String(255), nullable=True)  # e-mail begiftigde (optioneel)
    recipient_relation = Column(String(32), nullable=True)  # vader|moeder|opa|oma|schoonouder|partner|anders — stuurt de toon van de copy
    personal_message = Column(Text, nullable=True)  # digitaal bericht (tekst), getoond bij eerste start
    card_message = Column(Text, nullable=True)  # tekst voor op de fysieke kaart/banderol

    # Digitaal bericht — media (ontgrendelt bij eerste start)
    message_media_url = Column(String(512), nullable=True)   # object_key van het geüploade audio/video-bericht
    message_media_type = Column(String(16), nullable=True)   # text | audio | video
    message_transcript = Column(Text, nullable=True)         # Whisper-transcript (meeleesversie)
    message_status = Column(String(16), nullable=True)       # pending | ready | failed (transcriptie)

    # Cadeau-overhandiging
    gift_reveal = Column(String(16), nullable=True)          # SURPRISE | ANNOUNCED
    delivery_date = Column(Date, nullable=True)              # gewenst bezorg-/verzendmoment (of geplande digitale send)

    # Universele ontgrendel-token — werkt via QR op de (start)kaart én via e-mail,
    # ongeacht of het e-mailadres van de ontvanger bekend is. Gegenereerd voor elke cadeau-order.
    redemption_token = Column(String(64), nullable=True, unique=True, index=True)
    redeemed_at = Column(DateTime, nullable=True)            # moment van eerste ontgrendeling
    redemption_email_sent_at = Column(DateTime, nullable=True)  # ontvanger-uitnodiging verzonden (idempotentie geplande send)

    # Gift card (legacy DIGITAAL voucher-pad)
    gift_card_code = Column(String(32), nullable=True, unique=True, index=True)

    # Verzendadres (JSON)
    shipping_address = Column(JSON, nullable=True)

    # Korting (early bird of promo)
    discount_cents = Column(Integer, nullable=False, default=0)
    promo_code_used = Column(String(32), nullable=True)

    # Tijdstempels
    created_at = Column(DateTime, default=utc_now, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    fulfilled_at = Column(DateTime, nullable=True)

    # USB-export tracking
    usb_burned_at = Column(DateTime, nullable=True)       # moment van branden
    usb_burned_by = Column(String(255), nullable=True)    # e-mail van de admin
