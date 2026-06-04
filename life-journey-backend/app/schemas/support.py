from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, field_validator


TicketCategory = Literal["technisch", "account", "privacy", "abonnement", "overig"]
TicketStatus = Literal["open", "in_behandeling", "opgelost", "gesloten"]
TicketPriority = Literal["laag", "normaal", "hoog", "urgent"]
SenderType = Literal["klant", "medewerker", "systeem"]


class TicketCreateRequest(BaseModel):
    """Aanmaken van een nieuw ticket — werkt voor gasten én leden."""
    # Gastvelden (verplicht als niet ingelogd)
    guest_name: Optional[str] = None
    guest_email: Optional[EmailStr] = None

    category: TicketCategory = "overig"
    subject: str
    message: str  # Eerste bericht bij aanmaken

    @field_validator("subject")
    @classmethod
    def subject_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Onderwerp mag niet leeg zijn")
        return v[:255]

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Bericht mag niet leeg zijn")
        return v


class TicketReplyRequest(BaseModel):
    content: str
    is_internal: bool = False  # Alleen voor medewerkers bruikbaar

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Bericht mag niet leeg zijn")
        return v


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    priority: Optional[TicketPriority] = None


class TicketMessageResponse(BaseModel):
    id: str
    sender_type: SenderType
    sender_name: str
    content: str
    is_internal: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketResponse(BaseModel):
    id: str
    ticket_number: int
    category: TicketCategory
    subject: str
    status: TicketStatus
    priority: TicketPriority
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    messages: list[TicketMessageResponse] = []

    model_config = {"from_attributes": True}


class TicketListItem(BaseModel):
    id: str
    ticket_number: int
    category: TicketCategory
    subject: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TicketListResponse(BaseModel):
    tickets: list[TicketListItem]
    total: int
