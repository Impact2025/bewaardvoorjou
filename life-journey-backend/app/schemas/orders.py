from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


PackageType = Literal["BEGIN", "ERFGOED", "VOOR_ALTIJD"]

AddonCode = Literal[
    "GIFT_BOX",       # Luxe cadeauverpakking +€15
    "EXTRA_USB",      # Extra USB-stick +€19
    "PHOTO_BOOK",     # Gedrukt fotoboek +€39
    "EXTRA_STORAGE",  # Verlengde opslag +€49
    "VIDEO_INTRO",    # Professionele video-intro +€99
]

PACKAGE_PRICES: dict[str, int] = {
    "BEGIN": 8900,       # €89
    "ERFGOED": 24900,    # €249
    "VOOR_ALTIJD": 39900,  # €399 (launch prijs)
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
    recipient_name: str | None = Field(default=None, max_length=255)
    recipient_email: EmailStr | None = None  # e-mailadres van de begiftigde storyteller
    personal_message: str | None = Field(default=None, max_length=500)
    shipping_address: ShippingAddress | None = None  # optioneel bij digitale start
    guest_email: EmailStr | None = None  # voor niet-ingelogde gebruikers (koper)


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
    addons: list[str]
    addons_price: int
    recipient_name: str | None
    created_at: datetime
    paid_at: datetime | None

    model_config = {"from_attributes": True}


class EarlyBirdStatus(BaseModel):
    active: bool
    discount_cents: int
    deadline_iso: str
    waitlist_discount_cents: int
