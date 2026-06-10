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
from app.models.family import FamilyPod, PodMessage
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
    InvitePreviewResponse,
    RoleMetadata,
    ROLE_METADATA,
    FamilyRole,
    AccessLevel,
    PodCreateRequest,
    PodMessageCreateRequest,
    PodReactRequest,
    PodResponse,
    PodMessageResponse,
)
from app.services.family.manager import (
    list_family_members,
    get_family_member,
    create_family_member,
    update_family_member,
    delete_family_member,
    create_invite,
    get_invite_by_token,
    get_invite_url,
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
    _ensure_journey_access(journey_id, db, current_user)

    try:
        member, invite = create_family_member(
            db=db,
            journey_id=journey_id,
            creator_id=current_user.id,
            request=payload,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    invite_url = get_invite_url(invite.token) if invite else ""

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

    return FamilyInviteResponse(
        member_id=member.id,
        invite_sent=True,
        invite_url=get_invite_url(invite.token),
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


# Public invite preview endpoint (no auth required, no side effects)
@router.get("/invite/{token}", response_model=InvitePreviewResponse)
@limiter.limit(RateLimits.AUTH_LOGIN)
def preview_invitation(
    request: Request,
    token: str,
    db: Session = Depends(get_db),
) -> InvitePreviewResponse:
    """
    Preview an invitation without accepting it.

    Returns inviter name, journey title, access level and expiry so the
    frontend can show a confirmation screen before the user commits.
    """
    from datetime import datetime

    invite = get_invite_by_token(db, token)
    if not invite:
        raise HTTPException(status_code=404, detail="Uitnodiging niet gevonden")

    expires = invite.expires_at
    if expires.tzinfo is not None:
        expires = expires.replace(tzinfo=None)
    if expires < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Deze uitnodiging is verlopen")

    if invite.accepted_at:
        raise HTTPException(status_code=409, detail="Deze uitnodiging is al geaccepteerd")

    member = invite.family_member
    journey = member.journey
    inviter = member.creator

    return InvitePreviewResponse(
        inviter_name=inviter.display_name if inviter else "Iemand",
        invitee_name=member.name,
        journey_title=journey.title,
        access_level=AccessLevel(member.access_level.value),
        expires_at=invite.expires_at,
    )


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


# ── Family Pods ────────────────────────────────────────────────────────────────

def _pod_to_response(pod: FamilyPod) -> PodResponse:
    return PodResponse(
        id=pod.id,
        journey_id=pod.journey_id,
        title=pod.title,
        description=pod.description,
        created_by=pod.created_by,
        is_active=pod.is_active,
        last_activity=pod.last_activity_at.isoformat(),
        members=[pod.created_by] if pod.created_by else [],
        created_at=pod.created_at,
    )


def _message_to_response(msg: PodMessage) -> PodMessageResponse:
    return PodMessageResponse(
        id=msg.id,
        pod_id=msg.pod_id,
        author_id=msg.author_id,
        author_name=msg.author_name,
        content=msg.content,
        reactions=msg.reactions or {},
        created_at=msg.created_at,
    )


@router.get("/{journey_id}/pods", response_model=list[PodResponse])
@limiter.limit(RateLimits.READ_STANDARD)
def list_pods(
    request: Request,
    journey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PodResponse]:
    _ensure_journey_access(journey_id, db, current_user)
    pods = db.query(FamilyPod).filter(
        FamilyPod.journey_id == journey_id,
        FamilyPod.is_active == True,  # noqa: E712 — SQLAlchemy ORM requires == True
    ).order_by(FamilyPod.last_activity_at.desc()).all()
    return [_pod_to_response(p) for p in pods]


@router.post("/{journey_id}/pods", response_model=PodResponse, status_code=201)
@limiter.limit(RateLimits.WRITE_STANDARD)
def create_pod(
    request: Request,
    journey_id: str,
    payload: PodCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PodResponse:
    _ensure_journey_access(journey_id, db, current_user)
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    pod = FamilyPod(
        journey_id=journey_id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        created_by=current_user.id,
        is_active=True,
        last_activity_at=now,
        created_at=now,
    )
    db.add(pod)
    db.commit()
    db.refresh(pod)
    return _pod_to_response(pod)


@router.delete("/{journey_id}/pods/{pod_id}", status_code=204)
@limiter.limit(RateLimits.WRITE_STANDARD)
def delete_pod(
    request: Request,
    journey_id: str,
    pod_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _ensure_journey_access(journey_id, db, current_user)
    pod = db.query(FamilyPod).filter(
        FamilyPod.id == pod_id,
        FamilyPod.journey_id == journey_id,
    ).first()
    if not pod:
        raise HTTPException(status_code=404, detail="Pod niet gevonden")
    if pod.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Alleen de aanmaker kan een pod verwijderen")
    db.delete(pod)
    db.commit()


@router.get("/{journey_id}/pods/{pod_id}/messages", response_model=list[PodMessageResponse])
@limiter.limit(RateLimits.READ_STANDARD)
def list_messages(
    request: Request,
    journey_id: str,
    pod_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PodMessageResponse]:
    _ensure_journey_access(journey_id, db, current_user)
    pod = db.query(FamilyPod).filter(
        FamilyPod.id == pod_id,
        FamilyPod.journey_id == journey_id,
    ).first()
    if not pod:
        raise HTTPException(status_code=404, detail="Pod niet gevonden")
    return [_message_to_response(m) for m in pod.messages]


@router.post("/{journey_id}/pods/{pod_id}/messages", response_model=PodMessageResponse, status_code=201)
@limiter.limit(RateLimits.WRITE_STANDARD)
def post_message(
    request: Request,
    journey_id: str,
    pod_id: str,
    payload: PodMessageCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PodMessageResponse:
    _ensure_journey_access(journey_id, db, current_user)
    pod = db.query(FamilyPod).filter(
        FamilyPod.id == pod_id,
        FamilyPod.journey_id == journey_id,
        FamilyPod.is_active == True,  # noqa: E712 — SQLAlchemy ORM requires == True
    ).first()
    if not pod:
        raise HTTPException(status_code=404, detail="Pod niet gevonden")

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    msg = PodMessage(
        pod_id=pod_id,
        author_id=current_user.id,
        author_name=current_user.display_name,
        content=payload.content.strip(),
        reactions={},
        created_at=now,
    )
    pod.last_activity_at = now
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _message_to_response(msg)


@router.post("/{journey_id}/pods/{pod_id}/messages/{message_id}/react", response_model=PodMessageResponse)
@limiter.limit(RateLimits.WRITE_STANDARD)
def react_to_message(
    request: Request,
    journey_id: str,
    pod_id: str,
    message_id: str,
    payload: PodReactRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PodMessageResponse:
    _ensure_journey_access(journey_id, db, current_user)
    msg = db.query(PodMessage).filter(
        PodMessage.id == message_id,
        PodMessage.pod_id == pod_id,
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Bericht niet gevonden")

    reactions = dict(msg.reactions or {})
    users = list(reactions.get(payload.emoji, []))
    if current_user.id in users:
        users.remove(current_user.id)
    else:
        users.append(current_user.id)
    reactions[payload.emoji] = users
    msg.reactions = reactions
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _message_to_response(msg)
