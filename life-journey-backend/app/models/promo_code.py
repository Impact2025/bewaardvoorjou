from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Text

from app.models.base import Base
from app.models.user import generate_uuid


def utc_now():
    return datetime.now(timezone.utc)


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String(32), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)

    # "PERCENTAGE" (0-100) or "FIXED" (eurocenten)
    discount_type = Column(String(16), nullable=False)
    discount_value = Column(Integer, nullable=False)

    # JSON list of PackageType strings, or null = alle pakketten
    applicable_packages = Column(JSON, nullable=True)

    max_uses = Column(Integer, nullable=True)  # null = onbeperkt
    used_count = Column(Integer, nullable=False, default=0)

    # Indien ingesteld: activeert dit pakket gratis op het account (geen betaling nodig)
    grants_package = Column(String(32), nullable=True)

    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, default=utc_now, nullable=False)
    created_by = Column(String, nullable=True)  # admin user ID
