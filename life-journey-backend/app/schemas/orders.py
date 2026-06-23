from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


RecipientRelation = Literal[
    "vader", "moeder", "opa", "oma", "schoonouder", "partner", "anders",
]

GiftReveal = Literal["SURPRISE", "ANNOUNCED"]

MessageMediaType = Literal["text", "audio", "video"]


PackageType = Literal[
    "VERHAAL",       # €79/jaar — digitaal
    "ERFGOED",       # €149 jaar 1 (doos inbegrepen), €99/jaar verlenging
    "NALATENSCHAP",  # €229 eenmalig — lifetime
    # BewaardVoorBaby
    "BABY_GIFT",     # €59 — digitaal kraamcadeau (incl. jaar toegang + fotoboek-voucher)
    # Legacy (backward compat bestaande orders)
    "BEGIN", "VOOR_ALTIJD", "DIGITAAL",
]

AddonCode = Literal[
    "GIFT_BOX",       # Luxe cadeauverpakking +€15
    "EXTRA_USB",      # Extra USB-stick +€19
    "PHOTO_BOOK",     # Gedrukt fotoboek +€39
    "EXTRA_STORAGE",  # Verlengde opslag +€49
    "VIDEO_INTRO",    # Professionele video-intro +€99
]

PACKAGE_PRICES: dict[str, int] = {
    "VERHAAL": 7900,       # €79/jaar
    "ERFGOED": 14900,      # €149 eerste jaar (doos inbegrepen)
    "NALATENSCHAP": 22900, # €229 eenmalig (lifetime)
    "BABY_GIFT": 5900,     # €59 — kraamcadeau (jaar toegang + fotoboek-voucher)
    # Legacy
    "BEGIN": 8900,
    "VOOR_ALTIJD": 39900,
    "DIGITAAL": 4900,
}

ADDON_PRICES: dict[str, int] = {
    "GIFT_BOX": 1500,
    "EXTRA_USB": 1900,
    "PHOTO_BOOK": 3900,
    "EXTRA_STORAGE": 4900,
    "VIDEO_INTRO": 9900,
}


class ShippingAddress(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    street: str = Field(min_length=2, max_length=255)
    house_number: str = Field(min_length=1, max_length=32)
    postal_code: str = Field(min_length=4, max_length=10)
    city: str = Field(min_length=2, max_length=100)
    country: str = Field(default="NL", max_length=2)


class CreatePaymentIntentRequest(BaseModel):
    package_type: PackageType
    addons: list[AddonCode] = Field(default_factory=list)
    for_self: bool = False  # True = koper bestelt voor zichzelf (geen cadeau-token/redemption)
    recipient_name: str | None = Field(default=None, max_length=255)
    recipient_email: EmailStr | None = None  # e-mailadres van de begiftigde storyteller (optioneel)
    recipient_relation: RecipientRelation | None = None  # stuurt de toon van alle copy
    personal_message: str | None = Field(default=None, max_length=500)  # digitaal bericht (tekst)
    card_message: str | None = Field(default=None, max_length=280)  # tekst voor op de fysieke kaart
    message_media_url: str | None = Field(default=None, max_length=512)  # object_key van audio/video-bericht
    message_media_type: MessageMediaType | None = None
    gift_reveal: GiftReveal | None = None  # verrassing of aangekondigd
    delivery_date: date | None = None  # gewenst bezorg-/verzendmoment (of geplande digitale send)
    shipping_address: ShippingAddress | None = None  # optioneel bij digitale start
    guest_email: EmailStr | None = None  # voor niet-ingelogde gebruikers (koper)
    promo_code: str | None = Field(default=None, max_length=32)  # optionele kortingscode
    baby_theme: Literal["meisje", "jongen", "neutraal"] | None = None  # BABY_GIFT thema


class GiftMessagePresignRequest(BaseModel):
    """Upload-aanvraag voor een audio/video cadeaubericht, opgenomen tijdens checkout.

    Het bericht wordt vóór de order aangemaakt (tijdens 'personaliseer'), dus de
    upload hangt aan een tijdelijke draft-id i.p.v. een order-id. De resulterende
    object_key gaat als `message_media_url` mee in create-payment-intent.
    """
    filename: str = Field(min_length=1, max_length=255)
    modality: Literal["audio", "video"]
    size_bytes: int = Field(gt=0)


class GiftMessagePresignResponse(BaseModel):
    upload_url: str
    object_key: str
    upload_method: str = "PUT"


class CreatePaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    order_id: str
    amount_cents: int
    publishable_key: str


class OrderPublic(BaseModel):
    id: str
    package_type: str
    status: str
    price_paid: int
    discount_cents: int = 0
    promo_code_used: str | None = None
    addons: list[str]
    addons_price: int
    recipient_name: str | None
    created_at: datetime
    paid_at: datetime | None

    model_config = {"from_attributes": True}


class OrderStatusPublic(BaseModel):
    """Gezaghebbende betaalstatus + minimale weergavedata voor de bevestigingspagina.

    Wordt opgehaald na de Stripe-redirect (bijv. iDEAL). De order-id (een
    niet-raadbare UUID) fungeert als toegangssleutel voor gastbestellingen.
    """

    order_id: str
    # Hoog-niveau status: paid | processing | pending | failed
    status: Literal["paid", "processing", "pending", "failed"]
    package_type: str
    recipient_name: str | None = None
    recipient_email: str | None = None
    has_shipping: bool = False
    shipping_city: str | None = None
    # Universele ontgrendel-token → bevestigingspagina kan de printbare startkaart tonen
    redemption_token: str | None = None
    gift_reveal: str | None = None
    delivery_date: date | None = None


class StartRedemptionRequest(BaseModel):
    """De ontvanger geeft zijn e-mail op de cadeaupagina (QR/startkaart) op.

    We sturen een magic link die het pakket activeert — geen wachtwoord nodig.
    """
    email: EmailStr


class GiftRedemptionPublic(BaseModel):
    """Publieke ontgrendel-data voor de cadeaupagina (QR/startkaart).

    De redemption_token (niet-raadbaar) fungeert als toegangssleutel. Het persoonlijke
    bericht (tekst of audio/video + transcript) is het eerste wat de ontvanger ziet.
    """
    recipient_name: str | None = None
    recipient_relation: str | None = None
    package_type: str
    gifter_name: str | None = None
    personal_message: str | None = None        # digitaal tekstbericht
    message_media_type: str | None = None       # text | audio | video
    message_media_url: str | None = None        # kant-en-klare playback-URL (signed/serve)
    message_transcript: str | None = None       # meeleesversie (Whisper)
    message_status: str | None = None           # pending | ready | failed (transcriptie)
    card_message: str | None = None
    already_redeemed: bool = False


class EarlyBirdStatus(BaseModel):
    active: bool
    discount_cents: int
    deadline_iso: str
    waitlist_discount_cents: int
    digitaal_discount_cents: int = 0
    verhaal_discount_cents: int = 0
    erfgoed_discount_cents: int = 0


class OrderAdmin(BaseModel):
    id: str
    user_id: str | None = None
    guest_email: str | None = None
    buyer_email: str | None = None
    buyer_name: str | None = None
    package_type: str
    price_paid: int
    discount_cents: int = 0
    addons: list[str] = []
    addons_price: int = 0
    stripe_payment_intent_id: str | None = None
    stripe_payment_method: str | None = None
    status: str
    recipient_name: str | None = None
    recipient_email: str | None = None
    recipient_relation: str | None = None
    personal_message: str | None = None
    card_message: str | None = None
    message_media_url: str | None = None
    message_media_type: str | None = None
    message_transcript: str | None = None
    message_status: str | None = None
    gift_reveal: str | None = None
    delivery_date: date | None = None
    redemption_token: str | None = None
    redeemed_at: datetime | None = None
    redemption_email_sent_at: datetime | None = None
    gift_card_code: str | None = None
    shipping_address: dict | None = None
    promo_code_used: str | None = None
    created_at: datetime
    paid_at: datetime | None = None
    fulfilled_at: datetime | None = None
    usb_burned_at: datetime | None = None
    usb_burned_by: str | None = None

    model_config = {"from_attributes": True}


class UpdateOrderStatusRequest(BaseModel):
    status: Literal["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"]


class OrderListResponse(BaseModel):
    orders: list[OrderAdmin]
    total: int
    skip: int
    limit: int
