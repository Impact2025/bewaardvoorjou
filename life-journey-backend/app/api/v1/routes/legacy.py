from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.schemas.legacy import LegacyPolicyRequest, LegacyPolicyResponse
from app.services.legacy.policy import upsert_legacy_policy
from app.api.deps import get_current_user
from app.models.user import User
from app.models.journey import Journey


router = APIRouter()


@router.put("/{journey_id}", response_model=LegacyPolicyResponse)
@limiter.limit(RateLimits.WRITE_HEAVY)
def update_legacy_policy(
  request: Request,
  journey_id: str,
  payload: LegacyPolicyRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> LegacyPolicyResponse:
  journey = db.query(Journey).filter(Journey.id == journey_id).first()
  if journey is None or journey.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")

  return upsert_legacy_policy(journey_id, payload, db)
