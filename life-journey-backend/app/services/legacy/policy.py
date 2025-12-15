from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.legacy import LegacyPolicy as LegacyPolicyModel
from app.schemas.legacy import LegacyPolicyRequest, LegacyPolicyResponse


def upsert_legacy_policy(journey_id: str, payload: LegacyPolicyRequest, db: Session) -> LegacyPolicyResponse:
  policy = (
    db.query(LegacyPolicyModel)
    .filter(LegacyPolicyModel.journey_id == journey_id)
    .first()
  )

  if not policy:
    policy = LegacyPolicyModel(id=str(uuid4()), journey_id=journey_id)
    db.add(policy)

  policy.mode = payload.mode.value if hasattr(payload.mode, "value") else payload.mode
  policy.unlock_date = payload.unlock_date
  policy.grace_period_days = payload.grace_period_days
  policy.trustees = payload.trustee_emails
  policy.updated_at = datetime.now(timezone.utc)

  db.commit()
  db.refresh(policy)

  return LegacyPolicyResponse(
    policy={
      "mode": policy.mode,
      "unlock_date": policy.unlock_date,
      "grace_period_days": policy.grace_period_days,
      "trustees": policy.trustees,
    }
  )
