from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
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
  result = create_share_invite(journey_id, payload, db)

  from app.services.email.events import trigger_family_invite_email

  if payload.expires_at is not None:
    _DUTCH_MONTHS = [
      "", "januari", "februari", "maart", "april", "mei", "juni",
      "juli", "augustus", "september", "oktober", "november", "december",
    ]
    expires_date = f"{payload.expires_at.day} {_DUTCH_MONTHS[payload.expires_at.month]} {payload.expires_at.year}"
  else:
    expires_date = "geen vervaldatum"

  trigger_family_invite_email(
    db,
    recipient_email=str(payload.recipient_email),
    recipient_name=payload.recipient_name,
    inviter_name=current_user.display_name,
    role_label=payload.role_label,
    invite_url=result.magic_link,
    expires_date=expires_date,
  )

  return result


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


@router.get("/export/download/{bundle_id}")
def download_export_bundle(
  bundle_id: str,
  current_user: User = Depends(get_current_user),
) -> FileResponse:
  """Serve a locally-stored export ZIP (fallback when S3 is not configured)."""
  # Sanitize: bundle_id must be URL-safe alphanumerics only
  if not bundle_id.replace("-", "").replace("_", "").isalnum():
    raise HTTPException(status_code=400, detail="Ongeldig bundle ID")
  path = Path("media_storage") / "exports" / f"{bundle_id}.zip"
  if not path.exists():
    raise HTTPException(status_code=404, detail="Export niet gevonden of verlopen")
  return FileResponse(
    path=str(path),
    media_type="application/zip",
    filename=f"bewaardvoorjou_export_{bundle_id}.zip",
  )


@router.post("/{journey_id}/export", status_code=202)
@limiter.limit(RateLimits.EXPORT)
def request_export_bundle(
  request: Request,
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> dict[str, str]:
  """Start async export generation. User receives a download link by email."""
  _ensure_journey_access(journey_id, db, current_user)
  from app.services.email.tasks import generate_export_task
  generate_export_task.delay(journey_id, current_user.id)
  return {"message": "Je exportverzoek is ontvangen. Je ontvangt een download-link per e-mail zodra het klaar is."}
