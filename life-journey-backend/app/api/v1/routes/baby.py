"""
BewaardVoorBaby — API routes.

Endpoints:
  POST   /baby/journeys                 — Maak nieuw babyboek aan
  GET    /baby/journeys/me              — Haal babyboek op (+ voortgang)
  PATCH  /baby/journeys/me             — Profiel bijwerken
  GET    /baby/journeys/me/milestones  — Alle mijlpalen
  POST   /baby/journeys/me/milestones  — Markeer mijlpaal
  POST   /baby/journeys/me/partner     — Nodig partner uit
  POST   /baby/journeys/me/grandparents— Voeg opa/oma toe
  DELETE /baby/journeys/me/grandparents/{email} — Verwijder opa/oma
  GET    /baby/journeys/me/photobook   — Fotoboek-voucher status
  POST   /baby/journeys/me/photobook/claim — Claim de voucher
  POST   /baby/interview/{chapter_id}  — AI interviewvraag voor baby-chapter
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.user import User
from app.schemas.baby import (
    BabyJourneyCreate,
    BabyJourneyPublic,
    BabyJourneyUpdate,
    BabyJourneyWithProgress,
    BabyMilestoneCreate,
    BabyMilestonePublic,
    GrandparentAdd,
    GrandparentRemove,
    PartnerInviteRequest,
    PhotobookVoucherStatus,
)
from app.services.baby.journey import (
    add_grandparent,
    claim_photobook_voucher,
    create_baby_journey,
    get_baby_journey_by_user,
    get_baby_journey_with_progress,
    get_milestones,
    get_photobook_voucher_status,
    invite_partner,
    mark_milestone,
    remove_grandparent,
    update_baby_journey,
    build_baby_prompt,
)


router = APIRouter()


def _require_baby_journey(db: Session, user_id: str):
    bj = get_baby_journey_by_user(db, user_id)
    if not bj:
        raise HTTPException(status_code=404, detail="Geen actief babyboek gevonden.")
    return bj


# ---------------------------------------------------------------------------
# Babyboek aanmaken
# ---------------------------------------------------------------------------

@router.post("/journeys", response_model=BabyJourneyPublic, status_code=201)
@limiter.limit(RateLimits.WRITE_STANDARD)
def create_journey(
    request: Request,
    payload: BabyJourneyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BabyJourneyPublic:
    # Eén actief babyboek per gebruiker
    existing = get_baby_journey_by_user(db, current_user.id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Je hebt al een actief babyboek. Gebruik PATCH om bij te werken.",
        )
    bj = create_baby_journey(db, current_user.id, payload)
    current_user.onboarding_completed_at = datetime.now(timezone.utc)
    db.commit()
    return BabyJourneyPublic.model_validate(bj)


# ---------------------------------------------------------------------------
# Babyboek ophalen (met voortgang)
# ---------------------------------------------------------------------------

@router.get("/journeys/me", response_model=BabyJourneyWithProgress)
@limiter.limit(RateLimits.READ_STANDARD)
def get_my_journey(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BabyJourneyWithProgress:
    result = get_baby_journey_with_progress(db, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Geen actief babyboek gevonden.")
    return result


# ---------------------------------------------------------------------------
# Babyboek bijwerken (profiel, geboortedata, foto)
# ---------------------------------------------------------------------------

@router.patch("/journeys/me", response_model=BabyJourneyPublic)
@limiter.limit(RateLimits.WRITE_STANDARD)
def update_my_journey(
    request: Request,
    payload: BabyJourneyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BabyJourneyPublic:
    bj = _require_baby_journey(db, current_user.id)
    bj = update_baby_journey(db, bj, payload)
    return BabyJourneyPublic.model_validate(bj)


# ---------------------------------------------------------------------------
# Mijlpalen
# ---------------------------------------------------------------------------

@router.get("/journeys/me/milestones", response_model=list[BabyMilestonePublic])
@limiter.limit(RateLimits.READ_STANDARD)
def list_milestones(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BabyMilestonePublic]:
    bj = _require_baby_journey(db, current_user.id)
    return get_milestones(db, bj.id)


@router.post("/journeys/me/milestones", response_model=BabyMilestonePublic, status_code=201)
@limiter.limit(RateLimits.WRITE_STANDARD)
def create_milestone(
    request: Request,
    payload: BabyMilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BabyMilestonePublic:
    bj = _require_baby_journey(db, current_user.id)
    milestone = mark_milestone(db, bj.id, payload)
    return BabyMilestonePublic.from_orm_with_label(milestone)


# ---------------------------------------------------------------------------
# Partner uitnodigen
# ---------------------------------------------------------------------------

@router.post("/journeys/me/partner", status_code=200)
@limiter.limit(RateLimits.WRITE_STANDARD)
def invite_partner_endpoint(
    request: Request,
    payload: PartnerInviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    bj = _require_baby_journey(db, current_user.id)
    inviter_name = current_user.display_name or current_user.email.split("@")[0]
    invite_partner(db, bj, payload.partner_email, inviter_name)
    return {"detail": f"Uitnodiging verstuurd naar {payload.partner_email}."}


# ---------------------------------------------------------------------------
# Grootouders beheren
# ---------------------------------------------------------------------------

@router.post("/journeys/me/grandparents", response_model=BabyJourneyPublic)
@limiter.limit(RateLimits.WRITE_STANDARD)
def add_grandparent_endpoint(
    request: Request,
    payload: GrandparentAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BabyJourneyPublic:
    bj = _require_baby_journey(db, current_user.id)
    bj = add_grandparent(db, bj, payload)
    return BabyJourneyPublic.model_validate(bj)


@router.delete("/journeys/me/grandparents", response_model=BabyJourneyPublic)
@limiter.limit(RateLimits.WRITE_STANDARD)
def remove_grandparent_endpoint(
    request: Request,
    payload: GrandparentRemove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BabyJourneyPublic:
    bj = _require_baby_journey(db, current_user.id)
    bj = remove_grandparent(db, bj, payload.email)
    return BabyJourneyPublic.model_validate(bj)


# ---------------------------------------------------------------------------
# Fotoboek-voucher
# ---------------------------------------------------------------------------

@router.get("/journeys/me/photobook", response_model=PhotobookVoucherStatus)
@limiter.limit(RateLimits.READ_STANDARD)
def get_photobook_status(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PhotobookVoucherStatus:
    bj = _require_baby_journey(db, current_user.id)
    return get_photobook_voucher_status(db, bj)


@router.post("/journeys/me/photobook/claim", response_model=PhotobookVoucherStatus)
@limiter.limit(RateLimits.WRITE_STANDARD)
def claim_photobook(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PhotobookVoucherStatus:
    bj = _require_baby_journey(db, current_user.id)
    status = claim_photobook_voucher(db, bj)
    if not status.claimed:
        raise HTTPException(
            status_code=400,
            detail="Voucher is nog niet beschikbaar. Voltooi eerst alle 12 maandelijkse hoofdstukken.",
        )
    return status


# ---------------------------------------------------------------------------
# AI interview endpoint voor baby-chapters
# ---------------------------------------------------------------------------

@router.post("/interview/{chapter_id}")
@limiter.limit(RateLimits.WRITE_STANDARD)
def get_baby_interview_question(
    request: Request,
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Genereer een rol-bewuste AI interviewvraag voor een baby-chapter."""
    bj = _require_baby_journey(db, current_user.id)
    question = build_baby_prompt(
        chapter_id=chapter_id,
        baby_name=bj.baby_name,
        narrator_role=bj.narrator_role,
    )
    return {"question": question, "chapter_id": chapter_id}
