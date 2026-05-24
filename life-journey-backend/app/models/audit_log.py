from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, DateTime, Index, String, Text

from app.models.base import Base


def _uuid() -> str:
    return str(uuid4())


def _utc_now():
    return datetime.now(timezone.utc)


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, default=_uuid)
    admin_id = Column(String, nullable=False)
    admin_email = Column(String(255), nullable=False)
    action = Column(String(64), nullable=False)
    target_user_id = Column(String, nullable=True)
    target_email = Column(String(255), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utc_now, nullable=False)

    __table_args__ = (
        Index("ix_audit_log_admin_id", "admin_id"),
        Index("ix_audit_log_action", "action"),
        Index("ix_audit_log_created_at", "created_at"),
    )
