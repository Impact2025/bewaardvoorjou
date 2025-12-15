from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.common import ChapterId, ShareGrant


class ShareInviteRequest(BaseModel):
  recipient_name: str
  recipient_email: EmailStr
  chapter_ids: list[ChapterId]
  expires_at: datetime | None = None


class ShareInviteResponse(BaseModel):
  grant: ShareGrant
  magic_link: str
