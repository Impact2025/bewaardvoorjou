from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, UniqueConstraint

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
    created_at = Column(DateTime, default=utc_now, nullable=False)
