from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, UniqueConstraint

from app.models.base import Base
from app.models.order import utc_now
from app.models.user import generate_uuid


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"
    __table_args__ = (UniqueConstraint("email", "package_type", name="uq_waitlist_email_package"),)

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), nullable=False, index=True)
    # ERFGOED | VOOR_ALTIJD
    package_type = Column(String(32), nullable=False)
    # Garantiekorting bij lancering (0 = geen, 3000 = €30 early bird garantie)
    guaranteed_discount_cents = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=utc_now, nullable=False)
