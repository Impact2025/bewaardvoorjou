"""Pydantic-schemas voor BewaardVoorBaby."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

from app.models.baby_journey import MILESTONE_LABELS, MILESTONE_TYPES_ORDERED

NarratorRole = Literal["MOEDER", "PARTNER", "SAMEN"]

MilestoneType = Literal[tuple(MILESTONE_TYPES_ORDERED)]  # type: ignore[valid-type]

GrandparentEntry = dict  # {name: str, email: str, digest_active: bool}


# ---------------------------------------------------------------------------
# Onboarding & create
# ---------------------------------------------------------------------------

class BabyJourneyCreate(BaseModel):
    baby_name: str = Field(min_length=1, max_length=100)
    narrator_role: NarratorRole
    baby_birth_date: date | None = None
    birth_time_str: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    birth_weight_grams: int | None = Field(default=None, ge=200, le=8000)
    birth_length_cm: float | None = Field(default=None, ge=20.0, le=80.0)
    partner_email: EmailStr | None = None
    grandparent_emails: list[GrandparentEntry] = Field(default_factory=list)
    order_id: str | None = None


class BabyJourneyUpdate(BaseModel):
    baby_name: str | None = Field(default=None, min_length=1, max_length=100)
    narrator_role: NarratorRole | None = None
    baby_birth_date: date | None = None
    birth_time_str: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    birth_weight_grams: int | None = Field(default=None, ge=200, le=8000)
    birth_length_cm: float | None = Field(default=None, ge=20.0, le=80.0)
    first_outfit_photo_url: str | None = None
    partner_email: EmailStr | None = None
    grandparent_emails: list[GrandparentEntry] | None = None


# ---------------------------------------------------------------------------
# Public responses
# ---------------------------------------------------------------------------

class BabyJourneyPublic(BaseModel):
    id: str
    journey_id: str
    user_id: str
    baby_name: str
    narrator_role: NarratorRole
    baby_birth_date: date | None
    birth_time_str: str | None
    birth_weight_grams: int | None
    birth_length_cm: float | None
    first_outfit_photo_url: str | None
    partner_email: str | None
    partner_joined_at: datetime | None
    grandparent_emails: list
    photobook_voucher_active: bool
    photobook_voucher_claimed: bool
    pivot_to_monthly: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BabyJourneyWithProgress(BabyJourneyPublic):
    """Extended versie voor het dashboard — inclusief voortgangsdata."""
    milestones_completed: int = 0
    milestones_total: int = len(MILESTONE_TYPES_ORDERED)
    photobook_progress_pct: int = 0  # 0-100
    current_age_weeks: int | None = None
    next_chapter_id: str | None = None
    next_chapter_label: str | None = None


# ---------------------------------------------------------------------------
# Milestones
# ---------------------------------------------------------------------------

class BabyMilestoneCreate(BaseModel):
    milestone_type: str = Field(min_length=1, max_length=64)
    milestone_date: date | None = None
    notes: str | None = Field(default=None, max_length=1000)
    photo_url: str | None = None


class BabyMilestonePublic(BaseModel):
    id: str
    baby_journey_id: str
    milestone_type: str
    milestone_label: str = ""
    milestone_date: date | None
    notes: str | None
    photo_url: str | None
    chapter_id_triggered: str | None
    email_triggered: bool
    marked_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_label(cls, obj: object) -> "BabyMilestonePublic":
        instance = cls.model_validate(obj)
        instance.milestone_label = MILESTONE_LABELS.get(instance.milestone_type, instance.milestone_type)
        return instance


# ---------------------------------------------------------------------------
# Grandparent digest
# ---------------------------------------------------------------------------

class GrandparentAdd(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    digest_active: bool = True


class GrandparentRemove(BaseModel):
    email: EmailStr


# ---------------------------------------------------------------------------
# Voucher & partner
# ---------------------------------------------------------------------------

class PartnerInviteRequest(BaseModel):
    partner_email: EmailStr


class PhotobookVoucherStatus(BaseModel):
    active: bool
    claimed: bool
    claimed_at: datetime | None
    milestones_completed: int
    milestones_total: int
    progress_pct: int
    eligible_to_claim: bool  # True als 12/12 maanden gedaan
