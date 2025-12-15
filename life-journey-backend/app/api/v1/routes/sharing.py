from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.journey import Journey
from app.models.sharing import ShareGrant as ShareGrantModel
from app.models.user import User
from app.schemas.sharing import ShareInviteRequest, ShareInviteResponse
from app.schemas.common import ShareGrant as ShareGrantSchema
from app.services.sharing.generator import create_share_invite
from app.services.sharing.exporter import generate_export_bundle
from app.services.sharing.expiry import revoke_grant, enforce_expired_grants


router = APIRouter()


def _ensure_journey_access(journey_id: str, db: Session, user: User) -> Journey:
  journey = db.query(Journey).filter(Journey.id == journey_id).first()
  if journey is None or journey.user_id != user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")
  return journey


def _ensure_grant_access(grant_id: str, db: Session, user: User) -> ShareGrantModel:
  """Verify user has access to the grant (owns the journey)."""
  grant = db.query(ShareGrantModel).filter(ShareGrantModel.id == grant_id).first()
  if grant is None:
    raise HTTPException(status_code=404, detail="Deellink niet gevonden")

  journey = db.query(Journey).filter(Journey.id == grant.journey_id).first()
  if journey is None or journey.user_id != user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot deze deellink")

  return grant


@router.post("/{journey_id}/invites", response_model=ShareInviteResponse)
@limiter.limit(RateLimits.SHARE_CREATE)
def issue_share_invite(
  request: Request,
  journey_id: str,
  payload: ShareInviteRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> ShareInviteResponse:
  """Create a new share invite for a journey."""
  _ensure_journey_access(journey_id, db, current_user)
  return create_share_invite(journey_id, payload, db)


@router.get("/{journey_id}/grants", response_model=list[ShareGrantSchema])
@limiter.limit(RateLimits.READ_STANDARD)
def list_share_grants(
  request: Request,
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> list[ShareGrantSchema]:
  """List all share grants for a journey."""
  _ensure_journey_access(journey_id, db, current_user)

  # Run expiry enforcement before listing
  enforce_expired_grants(db)

  grants = (
    db.query(ShareGrantModel)
    .filter(ShareGrantModel.journey_id == journey_id)
    .order_by(ShareGrantModel.created_at.desc())
    .all()
  )

  return [
    ShareGrantSchema(
      id=grant.id,
      issued_to=grant.issued_to,
      email=grant.email,
      granted_by=grant.journey_id,
      chapter_ids=grant.chapter_ids,
      expires_at=grant.expires_at,
      status=grant.status,
    )
    for grant in grants
  ]


@router.delete("/grants/{grant_id}")
@limiter.limit(RateLimits.WRITE_STANDARD)
def revoke_share_grant(
  request: Request,
  grant_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> dict[str, str]:
  """Revoke a share grant."""
  _ensure_grant_access(grant_id, db, current_user)

  if revoke_grant(db, grant_id):
    return {"status": "revoked", "grant_id": grant_id}
  else:
    raise HTTPException(status_code=400, detail="Kon deellink niet intrekken")


@router.get("/{journey_id}/export")
@limiter.limit(RateLimits.EXPORT)
def export_journey_bundle(
  request: Request,
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> dict[str, str]:
  """Export journey data as a downloadable bundle."""
  _ensure_journey_access(journey_id, db, current_user)
  return generate_export_bundle(journey_id)
