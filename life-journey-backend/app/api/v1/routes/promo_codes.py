"""Promo codes — admin CRUD + publiek validatie + gebruiker redeem."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_current_user, get_db
from app.models.promo_code import PromoCode
from app.models.user import User
from app.schemas.promo_code import (
    PromoCodeCreate,
    PromoCodePublic,
    PromoCodeUpdate,
    RedeemPromoCodeRequest,
    RedeemPromoCodeResponse,
    ValidatePromoCodeRequest,
    ValidatePromoCodeResponse,
)
from app.schemas.orders import PACKAGE_PRICES

router = APIRouter()

# ── Admin routes (require admin auth) ──────────────────────────────────────

admin_router = APIRouter(dependencies=[Depends(get_current_admin_user)])


@admin_router.get("", response_model=list[PromoCodePublic])
def list_promo_codes(db: Session = Depends(get_db)) -> list[PromoCodePublic]:
    codes = db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()
    return [PromoCodePublic.model_validate(c) for c in codes]


@admin_router.post("", response_model=PromoCodePublic, status_code=201)
def create_promo_code(
    data: PromoCodeCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> PromoCodePublic:
    code_upper = data.code.upper()
    if db.query(PromoCode).filter(PromoCode.code == code_upper).first():
        raise HTTPException(status_code=400, detail="Code bestaat al")

    promo = PromoCode(
        code=code_upper,
        description=data.description,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        applicable_packages=data.applicable_packages,
        grants_package=data.grants_package,
        max_uses=data.max_uses,
        expires_at=data.expires_at,
        is_active=True,
        created_by=admin.id,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return PromoCodePublic.model_validate(promo)


@admin_router.patch("/{promo_id}", response_model=PromoCodePublic)
def update_promo_code(
    promo_id: str,
    data: PromoCodeUpdate,
    db: Session = Depends(get_db),
) -> PromoCodePublic:
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Code niet gevonden")

    if data.description is not None:
        promo.description = data.description
    if data.max_uses is not None:
        promo.max_uses = data.max_uses
    if data.expires_at is not None:
        promo.expires_at = data.expires_at
    if data.is_active is not None:
        promo.is_active = data.is_active

    db.commit()
    db.refresh(promo)
    return PromoCodePublic.model_validate(promo)


@admin_router.delete("/{promo_id}", status_code=204)
def delete_promo_code(
    promo_id: str,
    db: Session = Depends(get_db),
) -> None:
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Code niet gevonden")
    db.delete(promo)
    db.commit()


# ── Publiek: valideer code (voor checkout) ──────────────────────────────────

@router.post("/validate", response_model=ValidatePromoCodeResponse)
def validate_promo_code(
    payload: ValidatePromoCodeRequest,
    db: Session = Depends(get_db),
) -> ValidatePromoCodeResponse:
    return _validate_code(db, payload.code, payload.package_type)


# ── Ingelogde gebruiker: wissel code in voor gratis pakket ──────────────────

@router.post("/redeem", response_model=RedeemPromoCodeResponse)
def redeem_promo_code(
    payload: RedeemPromoCodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RedeemPromoCodeResponse:
    code_upper = payload.code.upper().strip()

    promo = db.query(PromoCode).filter(
        PromoCode.code == code_upper,
        PromoCode.is_active.is_(True),
    ).first()

    if not promo:
        raise HTTPException(status_code=400, detail="Onbekende of ongeldige code")

    now = datetime.now(timezone.utc)
    if promo.expires_at and promo.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=400, detail="Deze code is verlopen")

    if promo.max_uses is not None and promo.used_count >= promo.max_uses:
        raise HTTPException(status_code=400, detail="Code heeft de gebruikslimiet bereikt")

    if not promo.grants_package:
        raise HTTPException(status_code=400, detail="Deze code is alleen geldig bij de checkout, niet als directe activatie")

    # Activeer pakket op het account (zelfde logica als na Stripe-betaling)
    _PACKAGE_SETTINGS = {
        "BEGIN": {"package_tier": "BEGIN", "max_family_members": 2, "max_chapters": 3, "storage_years": 3},
        "ERFGOED": {"package_tier": "ERFGOED", "max_family_members": 5, "max_chapters": None, "storage_years": 10},
        "VOOR_ALTIJD": {"package_tier": "VOOR_ALTIJD", "max_family_members": 10, "max_chapters": None, "storage_years": 999},
        "DIGITAAL": {"package_tier": "BEGIN", "max_family_members": 2, "max_chapters": 3, "storage_years": 3},
    }

    pkg_settings = _PACKAGE_SETTINGS.get(promo.grants_package)
    if not pkg_settings:
        raise HTTPException(status_code=400, detail="Ongeldige pakketconfiguratie")

    current_user.package_tier = pkg_settings["package_tier"]
    current_user.package_activated_at = now
    current_user.max_family_members = pkg_settings["max_family_members"]
    current_user.max_chapters = pkg_settings["max_chapters"]
    current_user.storage_years = pkg_settings["storage_years"]

    promo.used_count += 1
    db.commit()

    package_names = {
        "BEGIN": "Het Begin",
        "ERFGOED": "De Erfgoed Box",
        "VOOR_ALTIJD": "Voor Altijd",
        "DIGITAAL": "Digitaal",
    }
    pkg_label = package_names.get(promo.grants_package, promo.grants_package)

    return RedeemPromoCodeResponse(
        success=True,
        message=f"Gelukt! Je account is bijgewerkt naar het {pkg_label} pakket.",
        grants_package=promo.grants_package,
    )


# ── Interne helpers (gebruikt door orders.py en webhooks.py) ────────────────

def _validate_code(
    db: Session,
    code: str,
    package_type: str,
) -> ValidatePromoCodeResponse:
    promo = db.query(PromoCode).filter(
        PromoCode.code == code.upper().strip(),
        PromoCode.is_active.is_(True),
    ).first()

    if not promo:
        return ValidatePromoCodeResponse(valid=False, error="Onbekende kortingscode")

    now = datetime.now(timezone.utc)
    if promo.expires_at and promo.expires_at.replace(tzinfo=timezone.utc) < now:
        return ValidatePromoCodeResponse(valid=False, error="Kortingscode is verlopen")

    if promo.max_uses is not None and promo.used_count >= promo.max_uses:
        return ValidatePromoCodeResponse(valid=False, error="Kortingscode heeft de gebruikslimiet bereikt")

    if promo.applicable_packages and package_type not in promo.applicable_packages:
        return ValidatePromoCodeResponse(valid=False, error="Kortingscode is niet geldig voor dit pakket")

    package_price = PACKAGE_PRICES.get(package_type, 0)
    if promo.discount_type == "PERCENTAGE":
        discount_cents = int(package_price * promo.discount_value / 100)
    else:
        discount_cents = promo.discount_value

    return ValidatePromoCodeResponse(
        valid=True,
        discount_cents=discount_cents,
        discount_type=promo.discount_type,
        discount_value=promo.discount_value,
        grants_package=promo.grants_package,
    )


def apply_promo_code(db: Session, code: str, package_type: str) -> tuple[int, str | None]:
    """Returns (discount_cents, error_message). Used by orders.py on checkout."""
    result = _validate_code(db, code, package_type)
    if not result.valid:
        return 0, result.error
    return result.discount_cents, None


def increment_promo_usage(db: Session, code: str) -> None:
    """Increments used_count. Call after successful payment."""
    promo = db.query(PromoCode).filter(PromoCode.code == code.upper()).first()
    if promo:
        promo.used_count += 1
        db.flush()
