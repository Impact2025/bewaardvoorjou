"""
Family ecosystem API routes.

Endpoints for managing family members, invitations, and access control.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.journey import Journey
from app.models.user import User
from app.schemas.family import (
    FamilyMemberCreateRequest,
    FamilyMemberUpdateRequest,
    FamilyMemberResponse,
    FamilyMemberListResponse,
    FamilyInviteResponse,
    FamilyStatsResponse,
    ResendInviteRequest,
    AcceptInviteRequest,
    AcceptInviteResponse,
    RoleMetadata,
    ROLE_METADATA,
    FamilyRole,
    AccessLevel,
)
from app.services.family.manager import (
    list_family_members,
    get_family_member,
    create_family_member,
    update_family_member,
    delete_family_member,
    create_invite,
    get_invite_by_token,
    accept_invite,
    decline_invite,
    get_family_stats,
    member_to_response,
)


router = APIRouter()


def _ensure_journey_access(journey_id: str, db: Session, user: User) -> Journey:
    """Verify user has access to the journey."""
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if journey is None or journey.user_id != user.id:
        raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")
    return journey


# Role metadata endpoint
@router.get("/roles", response_model=list[RoleMetadata])
@limiter.limit(RateLimits.READ_STANDARD)
def get_roles(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> list[RoleMetadata]:
    """Get all available family roles with metadata."""
    # Return all roles except 'owner'
    return [
        meta for role, meta in ROLE_METADATA.items()
        if role != FamilyRole.owner
    ]


# Family member CRUD endpoints
@router.get("/{journey_id}/members", response_model=FamilyMemberListResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def list_members(
    request: Request,
    journey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FamilyMemberListResponse:
    """List all family members for a journey."""
    _ensure_journey_access(journey_id, db, current_user)
    return list_family_members(db, journey_id)


@router.post("/{journey_id}/members", response_model=FamilyInviteResponse, status_code=201)
@limiter.limit(RateLimits.SHARE_CREATE)
def add_member(
    request: Request,
    journey_id: str,
    payload: FamilyMemberCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FamilyInviteResponse:
    """Add a new family member and optionally send an invitation."""
    journey = _ensure_journey_access(journey_id, db, current_user)

    try:
        member, invite = create_family_member(
            db=db,
            journey_id=journey_id,
            creator_id=current_user.id,
            request=payload,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Generate invite URL
    invite_url = f"https://life-journey.app/family/accept/{invite.token}" if invite else ""

    return FamilyInviteResponse(
        member_id=member.id,
        invite_sent=invite is not None,
        invite_url=invite_url,
        expires_at=invite.expires_at if invite else None,
    )


@router.get("/{journey_id}/members/{member_id}", response_model=FamilyMemberResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def get_member(
    request: Request,
    journey_id: str,
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FamilyMemberResponse:
    """Get details of a specific family member."""
    _ensure_journey_access(journey_id, db, current_user)

    member = get_family_member(db, member_id)
    if not member or member.journey_id != journey_id:
        raise HTTPException(status_code=404, detail="Familielid niet gevonden")

    return member_to_response(member)


@router.put("/{journey_id}/members/{member_id}", response_model=FamilyMemberResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
def update_member(
    request: Request,
    journey_id: str,
    member_id: str,
    payload: FamilyMemberUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FamilyMemberResponse:
    """Update a family member's details or access level."""
    _ensure_journey_access(journey_id, db, current_user)

    member = get_family_member(db, member_id)
    if not member or member.journey_id != journey_id:
        raise HTTPException(status_code=404, detail="Familielid niet gevonden")

    updated = update_family_member(db, member, payload)
    return member_to_response(updated)


@router.delete("/{journey_id}/members/{member_id}")
@limiter.limit(RateLimits.WRITE_STANDARD)
def remove_member(
    request: Request,
    journey_id: str,
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Remove a family member."""
    _ensure_journey_access(journey_id, db, current_user)

    member = get_family_member(db, member_id)
    if not member or member.journey_id != journey_id:
        raise HTTPException(status_code=404, detail="Familielid niet gevonden")

    delete_family_member(db, member)
    return {"status": "deleted", "member_id": member_id}


# Invitation endpoints
@router.post("/{journey_id}/members/{member_id}/resend-invite", response_model=FamilyInviteResponse)
@limiter.limit(RateLimits.SHARE_CREATE)
def resend_invitation(
    request: Request,
    journey_id: str,
    member_id: str,
    payload: ResendInviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FamilyInviteResponse:
    """Resend an invitation to a family member."""
    _ensure_journey_access(journey_id, db, current_user)

    member = get_family_member(db, member_id)
    if not member or member.journey_id != journey_id:
        raise HTTPException(status_code=404, detail="Familielid niet gevonden")

    if member.invite_accepted_at:
        raise HTTPException(status_code=400, detail="Uitnodiging is al geaccepteerd")

    invite = create_invite(db, member)
    db.commit()

    invite_url = f"https://life-journey.app/family/accept/{invite.token}"

    return FamilyInviteResponse(
        member_id=member.id,
        invite_sent=True,
        invite_url=invite_url,
        expires_at=invite.expires_at,
    )


# Statistics endpoint
@router.get("/{journey_id}/stats", response_model=FamilyStatsResponse)
@limiter.limit(RateLimits.READ_STANDARD)
def get_stats(
    request: Request,
    journey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FamilyStatsResponse:
    """Get family sharing statistics for a journey."""
    _ensure_journey_access(journey_id, db, current_user)
    return get_family_stats(db, journey_id)


# Public invitation acceptance endpoint (no auth required)
@router.post("/accept-invite", response_model=AcceptInviteResponse)
@limiter.limit(RateLimits.AUTH_LOGIN)  # Rate limit like login
def accept_invitation(
    request: Request,
    payload: AcceptInviteRequest,
    db: Session = Depends(get_db),
) -> AcceptInviteResponse:
    """
    Accept a family invitation using the invite token.

    This is a public endpoint - no authentication required.
    """
    invite = get_invite_by_token(db, payload.token)
    if not invite:
        raise HTTPException(status_code=404, detail="Uitnodiging niet gevonden")

    try:
        member = accept_invite(db, invite)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Get journey info
    journey = member.journey
    inviter = member.creator

    return AcceptInviteResponse(
        success=True,
        journey_title=journey.title,
        inviter_name=inviter.display_name if inviter else "Onbekend",
        access_level=AccessLevel(member.access_level.value),
        requires_login=member.linked_user_id is None,
        login_url="/login?redirect=/family/dashboard" if not member.linked_user_id else None,
    )


@router.post("/decline-invite")
@limiter.limit(RateLimits.AUTH_LOGIN)
def decline_invitation(
    request: Request,
    payload: AcceptInviteRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Decline a family invitation.

    This is a public endpoint - no authentication required.
    """
    invite = get_invite_by_token(db, payload.token)
    if not invite:
        raise HTTPException(status_code=404, detail="Uitnodiging niet gevonden")

    decline_invite(db, invite)
    return {"status": "declined"}
