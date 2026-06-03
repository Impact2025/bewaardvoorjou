from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


DiscountType = Literal["PERCENTAGE", "FIXED"]


class PromoCodeCreate(BaseModel):
    code: str = Field(min_length=2, max_length=32, pattern=r"^[A-Z0-9_\-]+$")
    description: Optional[str] = Field(default=None, max_length=500)
    discount_type: DiscountType = "PERCENTAGE"
    discount_value: int = Field(default=0, ge=0)  # percentage 0-100, or fixed cents; 0 als grants_package gebruikt wordt
    applicable_packages: Optional[list[str]] = None  # null = alle pakketten
    max_uses: Optional[int] = Field(default=None, ge=1)
    expires_at: Optional[datetime] = None
    # Indien ingesteld: code activeert dit pakket gratis (geen betaling nodig)
    grants_package: Optional[str] = Field(default=None, max_length=32)

    def model_post_init(self, __context):  # type: ignore[override]
        if self.discount_type == "PERCENTAGE" and self.discount_value > 100:
            raise ValueError("Percentage kan niet hoger zijn dan 100")


class PromoCodeUpdate(BaseModel):
    description: Optional[str] = Field(default=None, max_length=500)
    max_uses: Optional[int] = Field(default=None, ge=1)
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class PromoCodePublic(BaseModel):
    id: str
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: int
    applicable_packages: Optional[list[str]]
    grants_package: Optional[str]
    max_uses: Optional[int]
    used_count: int
    expires_at: Optional[datetime]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ValidatePromoCodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=32)
    package_type: str


class ValidatePromoCodeResponse(BaseModel):
    valid: bool
    discount_cents: int = 0
    discount_type: Optional[str] = None
    discount_value: Optional[int] = None
    grants_package: Optional[str] = None  # pakket dat gratis wordt geactiveerd
    error: Optional[str] = None


class RedeemPromoCodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=32)


class RedeemPromoCodeResponse(BaseModel):
    success: bool
    message: str
    grants_package: Optional[str] = None
