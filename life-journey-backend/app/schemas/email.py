"""Email preference schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class EmailPreferenceResponse(BaseModel):
    """Email preference response."""

    welcome_emails: bool
    chapter_emails: bool
    milestone_emails: bool
    unsubscribed_all: bool
    unsubscribed_at: datetime | None = None

    model_config = {"from_attributes": True}


class EmailPreferenceUpdate(BaseModel):
    """Email preference update."""

    welcome_emails: bool | None = None
    chapter_emails: bool | None = None
    milestone_emails: bool | None = None
    unsubscribed_all: bool | None = None


class UnsubscribeResponse(BaseModel):
    """Unsubscribe response."""

    message: str
    unsubscribed: bool
