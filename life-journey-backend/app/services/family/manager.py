"""
Family member management service.

Handles CRUD operations for family members, invitations,
and access control.
"""

import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional


def _utcnow() -> datetime:
    """Return current UTC time as a naive datetime (matches DB storage)."""
    return datetime.utcnow()

from loguru import logger
from sqlalchemy.orm import Session

from app.models.family import (
    FamilyMember,
    FamilyInvite,
    FamilyRole as FamilyRoleModel,
    AccessLevel as AccessLevelModel,
)
from app.schemas.family import (
    FamilyMemberCreateRequest,
    FamilyMemberUpdateRequest,
    FamilyMemberResponse,
    FamilyMemberListResponse,
    FamilyStatsResponse,
    InviteStatus,
    FamilyRole,
    AccessLevel,
)


def generate_invite_token() -> str:
    """Generate a secure random invite token."""
    return secrets.token_urlsafe(32)


def get_invite_status(member: FamilyMember) -> InviteStatus:
    """Determine the current invite status for a family member."""
    if member.invite_accepted_at:
        return InviteStatus.accepted

    if not member.invite_sent_at:
        return InviteStatus.pending

    # Check if any active invites exist
    latest_invite = (
        member.invites[-1] if member.invites else None
    )

    if latest_invite:
        if latest_invite.declined_at:
            return InviteStatus.declined
        expires = latest_invite.expires_at
        if expires.tzinfo is not None:
            expires = expires.replace(tzinfo=None)
        if expires < _utcnow():
            return InviteStatus.expired

    return InviteStatus.pending


def member_to_response(member: FamilyMember) -> FamilyMemberResponse:
    """Convert a FamilyMember model to response schema."""
    allowed_chapters = None
    if member.allowed_chapters:
        try:
            allowed_chapters = json.loads(member.allowed_chapters)
        except json.JSONDecodeError:
            allowed_chapters = None

    return FamilyMemberResponse(
        id=member.id,
        name=member.name,
        email=member.email,
        role=FamilyRole(member.role.value),
        access_level=AccessLevel(member.access_level.value),
        allowed_chapters=allowed_chapters,
        invite_status=get_invite_status(member),
        invite_sent_at=member.invite_sent_at,
        invite_accepted_at=member.invite_accepted_at,
        has_account=member.linked_user_id is not None,
        created_at=member.created_at,
    )


def list_family_members(
    db: Session,
    journey_id: str,
) -> FamilyMemberListResponse:
    """List all family members for a journey."""
    members = (
        db.query(FamilyMember)
        .filter(FamilyMember.journey_id == journey_id)
        .order_by(FamilyMember.created_at.desc())
        .all()
    )

    return FamilyMemberListResponse(
        members=[member_to_response(m) for m in members],
        total=len(members),
    )


def get_family_member(
    db: Session,
    member_id: str,
) -> Optional[FamilyMember]:
    """Get a family member by ID."""
    return db.query(FamilyMember).filter(FamilyMember.id == member_id).first()


def create_family_member(
    db: Session,
    journey_id: str,
    creator_id: str,
    request: FamilyMemberCreateRequest,
) -> tuple[FamilyMember, Optional[FamilyInvite]]:
    """
    Create a new family member and optionally send an invitation.

    Returns the created member and the invite (if send_invite=True).
    """
    # Check if email already exists for this journey
    existing = (
        db.query(FamilyMember)
        .filter(
            FamilyMember.journey_id == journey_id,
            FamilyMember.email == request.email.lower(),
        )
        .first()
    )

    if existing:
        raise ValueError(f"Er is al een familielid met dit e-mailadres: {request.email}")

    # Convert allowed chapters to JSON
    allowed_chapters_json = None
    if request.allowed_chapters:
        allowed_chapters_json = json.dumps([c.value for c in request.allowed_chapters])

    # Create the family member
    member = FamilyMember(
        journey_id=journey_id,
        name=request.name,
        email=request.email.lower(),
        role=FamilyRoleModel(request.role.value),
        access_level=AccessLevelModel(request.access_level.value),
        allowed_chapters=allowed_chapters_json,
        created_by=creator_id,
    )

    db.add(member)
    db.flush()  # Get the ID

    invite = None
    if request.send_invite:
        invite = create_invite(db, member)

    db.commit()
    db.refresh(member)

    logger.info(f"Created family member {member.id} for journey {journey_id}")

    if invite and request.send_invite:
        _send_invite_email(db, member, invite, creator_id)

    return member, invite


_ROLE_LABELS: dict[str, str] = {
    "spouse": "Partner",
    "child": "Kind",
    "parent": "Ouder",
    "sibling": "Broer/Zus",
    "grandchild": "Kleinkind",
    "extended": "Familie",
    "friend": "Vriend",
    "owner": "Eigenaar",
}


def _send_invite_email(
    db: Session,
    member: "FamilyMember",
    invite: "FamilyInvite",
    creator_id: str,
) -> None:
    """Fire-and-forget: stuur uitnodigingsmail naar het familielid."""
    from app.models.user import User
    from app.services.email.events import trigger_family_invite_email

    creator = db.query(User).filter(User.id == creator_id).first()
    inviter_name = creator.display_name if creator else "Iemand"

    role_label = _ROLE_LABELS.get(member.role.value, member.role.value.capitalize())

    try:
        expires_date = invite.expires_at.strftime("%d %B %Y").lstrip("0")
    except Exception:
        expires_date = "7 dagen"

    trigger_family_invite_email(
        db=db,
        recipient_email=member.email,
        recipient_name=member.name,
        inviter_name=inviter_name,
        role_label=role_label,
        invite_url=get_invite_url(invite.token),
        expires_date=expires_date,
    )


def update_family_member(
    db: Session,
    member: FamilyMember,
    request: FamilyMemberUpdateRequest,
) -> FamilyMember:
    """Update a family member's details."""
    if request.name is not None:
        member.name = request.name

    if request.role is not None:
        member.role = FamilyRoleModel(request.role.value)

    if request.access_level is not None:
        member.access_level = AccessLevelModel(request.access_level.value)

    if request.allowed_chapters is not None:
        member.allowed_chapters = json.dumps([c.value for c in request.allowed_chapters])

    db.commit()
    db.refresh(member)

    logger.info(f"Updated family member {member.id}")

    return member


def delete_family_member(db: Session, member: FamilyMember) -> None:
    """Delete a family member and their invites."""
    member_id = member.id
    db.delete(member)
    db.commit()
    logger.info(f"Deleted family member {member_id}")


def create_invite(
    db: Session,
    member: FamilyMember,
    expires_days: int = 7,
) -> FamilyInvite:
    """Create a new invitation for a family member."""
    token = generate_invite_token()
    expires_at = _utcnow() + timedelta(days=expires_days)

    invite = FamilyInvite(
        family_member_id=member.id,
        token=token,
        email_sent_to=member.email,
        expires_at=expires_at,
    )

    # Update member's invite token
    member.invite_token = token
    member.invite_sent_at = _utcnow()

    db.add(invite)
    db.flush()

    logger.info(f"Created invite {invite.id} for family member {member.id}")

    return invite


def get_invite_url(token: str) -> str:
    """Build the full invite URL using the configured app base URL."""
    from app.core.config import settings
    return f"{settings.app_base_url}/family/accept/{token}"


def get_invite_by_token(db: Session, token: str) -> Optional[FamilyInvite]:
    """Get an invitation by its token."""
    return (
        db.query(FamilyInvite)
        .filter(FamilyInvite.token == token)
        .first()
    )


def accept_invite(
    db: Session,
    invite: FamilyInvite,
    user_id: Optional[str] = None,
) -> FamilyMember:
    """
    Accept a family invitation.

    If user_id is provided, links the family member to that user account.
    """
    now = _utcnow()

    # Check if invite is expired
    expires = invite.expires_at
    if expires.tzinfo is not None:
        expires = expires.replace(tzinfo=None)
    if expires < now:
        raise ValueError("Deze uitnodiging is verlopen")

    # Check if already accepted
    if invite.accepted_at:
        raise ValueError("Deze uitnodiging is al geaccepteerd")

    # Mark invite as accepted
    invite.accepted_at = now

    # Update family member
    member = invite.family_member
    member.invite_accepted_at = now
    member.access_level = AccessLevelModel.selected  # Activate access

    if user_id:
        member.linked_user_id = user_id

    db.commit()
    db.refresh(member)

    logger.info(f"Accepted invite {invite.id} for family member {member.id}")

    return member


def decline_invite(db: Session, invite: FamilyInvite) -> None:
    """Decline a family invitation."""
    invite.declined_at = _utcnow()
    db.commit()
    logger.info(f"Declined invite {invite.id}")


def get_family_stats(db: Session, journey_id: str) -> FamilyStatsResponse:
    """Get statistics about family members for a journey."""
    members = (
        db.query(FamilyMember)
        .filter(FamilyMember.journey_id == journey_id)
        .all()
    )

    pending = sum(1 for m in members if get_invite_status(m) == InviteStatus.pending)
    active = sum(1 for m in members if m.invite_accepted_at is not None)

    # Count by role
    by_role: dict[str, int] = {}
    for member in members:
        role = member.role.value
        by_role[role] = by_role.get(role, 0) + 1

    return FamilyStatsResponse(
        total_members=len(members),
        pending_invites=pending,
        active_members=active,
        members_by_role=by_role,
    )


def check_member_access(
    member: FamilyMember,
    chapter_id: str,
) -> bool:
    """
    Check if a family member has access to a specific chapter.

    Returns True if they have access, False otherwise.
    """
    # No access if not accepted
    if not member.invite_accepted_at:
        return False

    # Check access level
    if member.access_level == AccessLevelModel.none:
        return False

    if member.access_level == AccessLevelModel.full:
        return True

    # For selected access, check allowed chapters
    if member.access_level == AccessLevelModel.selected:
        if not member.allowed_chapters:
            return False
        try:
            allowed = json.loads(member.allowed_chapters)
            return chapter_id in allowed
        except json.JSONDecodeError:
            return False

    # Highlights only - specific logic could be added
    if member.access_level == AccessLevelModel.highlights:
        # For highlights, we might want to check if the chapter has highlights
        # For now, return True and let the frontend filter
        return True

    return False
