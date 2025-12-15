"""
Family member models for the Familie Ecosysteem.

Tracks family relationships, roles, and access permissions.
"""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid4())


class FamilyRole(str, enum.Enum):
    """Roles a family member can have."""
    owner = "owner"  # The journey creator
    spouse = "spouse"  # Partner/spouse - full access
    child = "child"  # Children - configurable access
    parent = "parent"  # Parents - configurable access
    sibling = "sibling"  # Brothers/sisters
    grandchild = "grandchild"  # Grandchildren
    extended = "extended"  # Extended family (aunts, uncles, cousins)
    friend = "friend"  # Close friends


class AccessLevel(str, enum.Enum):
    """Access levels for family members."""
    full = "full"  # Can view everything
    selected = "selected"  # Can view selected chapters only
    highlights = "highlights"  # Can only view highlights/clips
    none = "none"  # No access (invitation pending or revoked)


class FamilyMember(Base):
    """
    Represents a family member linked to a journey.

    Family members can be invited via email and granted different
    access levels to the journey content.
    """
    __tablename__ = "familymember"

    id = Column(String, primary_key=True, default=generate_uuid)
    journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)

    # Member info
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    role = Column(SQLEnum(FamilyRole), nullable=False, default=FamilyRole.extended)

    # Access control
    access_level = Column(SQLEnum(AccessLevel), nullable=False, default=AccessLevel.none)
    allowed_chapters = Column(String, nullable=True)  # JSON list of chapter IDs, null = all

    # Invitation status
    invite_token = Column(String(64), nullable=True, unique=True, index=True)
    invite_sent_at = Column(DateTime, nullable=True)
    invite_accepted_at = Column(DateTime, nullable=True)

    # User link (if they have an account)
    linked_user_id = Column(String, ForeignKey("user.id", ondelete="SET NULL"), nullable=True)

    # Audit
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    created_by = Column(String, ForeignKey("user.id"), nullable=False)

    # Relationships
    journey = relationship("Journey", backref="family_members")
    linked_user = relationship("User", foreign_keys=[linked_user_id])
    creator = relationship("User", foreign_keys=[created_by])


class FamilyInvite(Base):
    """
    Tracks family invitation history and status.
    """
    __tablename__ = "familyinvite"

    id = Column(String, primary_key=True, default=generate_uuid)
    family_member_id = Column(String, ForeignKey("familymember.id", ondelete="CASCADE"), nullable=False, index=True)

    # Invite details
    token = Column(String(64), nullable=False, unique=True, index=True)
    email_sent_to = Column(String(255), nullable=False)

    # Status tracking
    sent_at = Column(DateTime, default=utc_now, nullable=False)
    opened_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    declined_at = Column(DateTime, nullable=True)
    expired_at = Column(DateTime, nullable=True)

    # Expiry (invites expire after 7 days by default)
    expires_at = Column(DateTime, nullable=False)

    # Relationships
    family_member = relationship("FamilyMember", backref="invites")
