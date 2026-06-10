from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text

from app.models.base import Base


def utc_now():
    """Returns current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid4())


class EmailEvent(Base):
    """
    Tracks alle verzonden emails.
    Voorkomt duplicaten via unique constraints en status tracking.
    """
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=True, index=True)

    # Email type: "welcome", "chapter_complete", "milestone_unlock", "email_verification", "password_reset"
    email_type = Column(String(64), nullable=False, index=True)

    # Context data (JSON met chapter_id, progress, milestone_type, verification_url, reset_url, etc.)
    context_data = Column(JSON, nullable=True)

    # Status: "pending", "sent", "failed", "bounced", "complained"
    status = Column(String(32), nullable=False, default="pending", index=True)

    # Email recipient (stored for audit trail)
    sent_to = Column(String(255), nullable=False)

    # Resend message ID voor tracking
    resend_id = Column(String(255), nullable=True, index=True)

    # Unsubscribe token — random, stored per email, used for one-click unsubscribe
    unsubscribe_token = Column(String(128), nullable=True, unique=True, index=True)

    # Error message indien gefaald
    error_message = Column(Text, nullable=True)

    # Engagement tracking (gevuld via Resend webhooks)
    open_count = Column(Integer, nullable=False, default=0, server_default="0")
    click_count = Column(Integer, nullable=False, default=0, server_default="0")

    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)   # eerste open
    clicked_at = Column(DateTime, nullable=True)  # eerste klik
    bounced_at = Column(DateTime, nullable=True)
    complained_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class EmailPreference(Base):
    """
    User email preferences per type.
    Defaults: alle emails enabled.
    """
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Per email type preferences
    welcome_emails = Column(Boolean, nullable=False, default=True)
    chapter_emails = Column(Boolean, nullable=False, default=True)
    milestone_emails = Column(Boolean, nullable=False, default=True)
    weekly_question_emails = Column(Boolean, nullable=False, default=True)
    inactivity_reminders = Column(Boolean, nullable=False, default=True)
    seasonal_emails = Column(Boolean, nullable=False, default=True)
    family_notifications = Column(Boolean, nullable=False, default=True)

    # Global unsubscribe
    unsubscribed_all = Column(Boolean, nullable=False, default=False)
    unsubscribed_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
