from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class CreateUserRequest(BaseModel):
    email: EmailStr
    display_name: str
    password: str
    country: str = "Nederland"
    locale: str = "nl"
    is_admin: bool = False


class ToggleAdminResponse(BaseModel):
    user_id: str
    email: str
    is_admin: bool


class ToggleActiveResponse(BaseModel):
    user_id: str
    email: str
    is_active: bool


class AuditLogEntry(BaseModel):
    id: str
    admin_id: str
    admin_email: str
    action: str
    target_user_id: Optional[str]
    target_email: Optional[str]
    detail: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
