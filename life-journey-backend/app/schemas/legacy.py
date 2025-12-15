from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import LegacyMode, LegacyPolicy


class LegacyPolicyRequest(BaseModel):
  mode: LegacyMode
  unlock_date: datetime | None = None
  grace_period_days: int | None = None
  trustee_emails: list[str] = []


class LegacyPolicyResponse(BaseModel):
  policy: LegacyPolicy
