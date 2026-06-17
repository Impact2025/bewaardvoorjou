"""Waitlist — vangnet voor uitverkochte pakketten (ERFGOED, VOOR_ALTIJD)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from loguru import logger

from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.waitlist import WaitlistEntry
from app.schemas.waitlist import WaitlistJoinRequest, WaitlistJoinResponse

router = APIRouter()

_SOLD_OUT: dict[str, dict[str, str]] = {
    "ERFGOED": {"name": "De Erfgoed Box", "available_from": "nader te bepalen"},
    "NALATENSCHAP": {"name": "Nalatenschap", "available_from": "nader te bepalen"},
    "VOOR_ALTIJD": {"name": "Voor Altijd", "available_from": "nader te bepalen"},
}


@router.post("", response_model=WaitlistJoinResponse, status_code=201)
@limiter.limit(RateLimits.WRITE_STANDARD)
def join_waitlist(
    request: Request,
    payload: WaitlistJoinRequest,
    db: Session = Depends(get_db),
) -> WaitlistJoinResponse:
    package_meta = _SOLD_OUT.get(payload.package_type)
    if not package_meta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dit pakket is niet uitverkocht",
        )

    from datetime import datetime, timezone
    from dateutil.parser import parse as parse_dt
    from app.core.config import settings as _s

    normalized_email = payload.email.lower().strip()

    # Stel guaranteed_discount_cents in als early bird nog actief is
    guaranteed_discount = 0
    try:
        if _s.early_bird_active:
            deadline = parse_dt(_s.early_bird_deadline)
            if datetime.now(timezone.utc) <= deadline:
                guaranteed_discount = _s.early_bird_waitlist_discount_cents
    except Exception:
        pass

    entry = WaitlistEntry(
        email=normalized_email,
        package_type=payload.package_type,
        guaranteed_discount_cents=guaranteed_discount,
    )

    try:
        db.add(entry)
        db.commit()
    except IntegrityError:
        db.rollback()
        return WaitlistJoinResponse(
            message="Je staat al op de wachtlijst voor dit pakket.",
            already_registered=True,
        )

    _send_confirmation_email(
        email=normalized_email,
        package_name=package_meta["name"],
        available_from=package_meta["available_from"],
        guaranteed_discount_cents=guaranteed_discount,
    )

    return WaitlistJoinResponse(
        message="Je staat op de wachtlijst! We laten je weten zodra het pakket beschikbaar is.",
        already_registered=False,
        guaranteed_discount_cents=guaranteed_discount,
    )


def _send_confirmation_email(
    email: str,
    package_name: str,
    available_from: str,
    guaranteed_discount_cents: int = 0,
) -> None:
    try:
        from app.services.email.client import send_email
        from app.services.email.renderer import build_waitlist_confirmation_email

        subject, html, text = build_waitlist_confirmation_email(
            email, package_name, available_from, guaranteed_discount_cents
        )
        send_email(to=email, subject=subject, html=html, text=text)
    except Exception as exc:
        logger.warning(f"Wachtlijst bevestigingsmail mislukt voor {email}: {exc}")
