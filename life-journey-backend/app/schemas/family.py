"""
Family ecosystem schemas for API requests and responses.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.schemas.common import ChapterId


class FamilyRole(str, Enum):
    """Roles a family member can have."""
    owner = "owner"
    spouse = "spouse"
    child = "child"
    parent = "parent"
    sibling = "sibling"
    grandchild = "grandchild"
    extended = "extended"
    friend = "friend"


class AccessLevel(str, Enum):
    """Access levels for family members."""
    full = "full"
    selected = "selected"
    highlights = "highlights"
    none = "none"


class InviteStatus(str, Enum):
    """Status of a family invitation."""
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"


# Request schemas

class FamilyMemberCreateRequest(BaseModel):
    """Request to add a new family member."""
    name: str
    email: EmailStr
    role: FamilyRole
    access_level: AccessLevel = AccessLevel.selected
    allowed_chapters: Optional[list[ChapterId]] = None
    send_invite: bool = True


class FamilyMemberUpdateRequest(BaseModel):
    """Request to update a family member."""
    name: Optional[str] = None
    role: Optional[FamilyRole] = None
    access_level: Optional[AccessLevel] = None
    allowed_chapters: Optional[list[ChapterId]] = None


class ResendInviteRequest(BaseModel):
    """Request to resend an invitation."""
    custom_message: Optional[str] = None


# Response schemas

class FamilyMemberResponse(BaseModel):
    """Family member details."""
    id: str
    name: str
    email: str
    role: FamilyRole
    access_level: AccessLevel
    allowed_chapters: Optional[list[str]] = None
    invite_status: InviteStatus
    invite_sent_at: Optional[datetime] = None
    invite_accepted_at: Optional[datetime] = None
    has_account: bool
    created_at: datetime


class FamilyMemberListResponse(BaseModel):
    """List of family members."""
    members: list[FamilyMemberResponse]
    total: int


class FamilyInviteResponse(BaseModel):
    """Response after sending an invite."""
    member_id: str
    invite_sent: bool
    invite_url: str
    expires_at: datetime


class FamilyStatsResponse(BaseModel):
    """Statistics about family sharing."""
    total_members: int
    pending_invites: int
    active_members: int
    members_by_role: dict[str, int]


class AcceptInviteRequest(BaseModel):
    """Request to accept an invitation (public endpoint)."""
    token: str


class AcceptInviteResponse(BaseModel):
    """Response after accepting an invitation."""
    success: bool
    journey_title: str
    inviter_name: str
    access_level: AccessLevel
    requires_login: bool
    login_url: Optional[str] = None


# Role metadata for UI

class RoleMetadata(BaseModel):
    """Metadata about a family role."""
    id: FamilyRole
    label: str
    description: str
    suggested_access: AccessLevel
    icon: str


ROLE_METADATA: dict[FamilyRole, RoleMetadata] = {
    FamilyRole.spouse: RoleMetadata(
        id=FamilyRole.spouse,
        label="Partner",
        description="Je levenspartner",
        suggested_access=AccessLevel.full,
        icon="heart",
    ),
    FamilyRole.child: RoleMetadata(
        id=FamilyRole.child,
        label="Kind",
        description="Je zoon of dochter",
        suggested_access=AccessLevel.selected,
        icon="baby",
    ),
    FamilyRole.parent: RoleMetadata(
        id=FamilyRole.parent,
        label="Ouder",
        description="Je vader of moeder",
        suggested_access=AccessLevel.selected,
        icon="users",
    ),
    FamilyRole.sibling: RoleMetadata(
        id=FamilyRole.sibling,
        label="Broer/Zus",
        description="Je broer of zus",
        suggested_access=AccessLevel.selected,
        icon="users",
    ),
    FamilyRole.grandchild: RoleMetadata(
        id=FamilyRole.grandchild,
        label="Kleinkind",
        description="Je kleinkind",
        suggested_access=AccessLevel.highlights,
        icon="sparkles",
    ),
    FamilyRole.extended: RoleMetadata(
        id=FamilyRole.extended,
        label="Familie",
        description="Overige familie (oom, tante, neef, nicht)",
        suggested_access=AccessLevel.highlights,
        icon="home",
    ),
    FamilyRole.friend: RoleMetadata(
        id=FamilyRole.friend,
        label="Vriend(in)",
        description="Een goede vriend of vriendin",
        suggested_access=AccessLevel.highlights,
        icon="smile",
    ),
}
