"""Admin API routes."""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.models.audit_log import AuditLog
from app.models.email import EmailEvent, EmailPreference
from app.models.family import FamilyMember
from app.models.journey import Journey
from app.models.user import User
from app.schemas.admin import (
    CreateUserRequest,
    ToggleActiveResponse,
    ToggleAdminResponse,
)
from app.schemas.auth import UserPublic
from app.services.auth import hash_password


router = APIRouter(dependencies=[Depends(get_current_admin_user)])


def _audit(
    db: Session,
    admin: User,
    action: str,
    target: Optional[User] = None,
    detail: Optional[str] = None,
) -> None:
    db.add(AuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action=action,
        target_user_id=target.id if target else None,
        target_email=target.email if target else None,
        detail=detail,
    ))


@router.get("/stats")
def get_admin_stats(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    from datetime import timedelta
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    return {
        "total_users": db.query(func.count(User.id)).scalar() or 0,
        "active_users": db.query(func.count(User.id)).filter(User.last_login_at >= thirty_days_ago).scalar() or 0,
        "new_users_today": db.query(func.count(User.id)).filter(User.created_at >= today_start).scalar() or 0,
        "total_journeys": db.query(func.count(Journey.id)).scalar() or 0,
    }


@router.get("/users", response_model=List[UserPublic])
def list_all_users(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    search: Optional[str] = Query(default=None, max_length=100),
    is_active: Optional[bool] = Query(default=None),
    is_admin: Optional[bool] = Query(default=None),
):
    q = db.query(User)
    if search:
        term = f"%{search.lower()}%"
        q = q.filter(or_(
            func.lower(User.email).like(term),
            func.lower(User.display_name).like(term),
        ))
    if is_active is not None:
        q = q.filter(User.is_active == is_active)
    if is_admin is not None:
        q = q.filter(User.is_admin == is_admin)
    return q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserPublic)
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gebruiker niet gevonden")
    return user


@router.patch("/users/{user_id}/toggle-admin", response_model=ToggleAdminResponse)
def toggle_user_admin_status(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gebruiker niet gevonden")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Je kunt je eigen admin status niet wijzigen")

    user.is_admin = not user.is_admin
    _audit(db, admin, "toggle_admin", target=user, detail=f"is_admin → {user.is_admin}")
    db.commit()
    db.refresh(user)

    return ToggleAdminResponse(user_id=user.id, email=user.email, is_admin=user.is_admin)


@router.patch("/users/{user_id}/toggle-active", response_model=ToggleActiveResponse)
def toggle_user_active_status(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gebruiker niet gevonden")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Je kunt je eigen account niet deactiveren")

    user.is_active = not user.is_active
    _audit(db, admin, "toggle_active", target=user, detail=f"is_active → {user.is_active}")
    db.commit()
    db.refresh(user)

    return ToggleActiveResponse(user_id=user.id, email=user.email, is_active=user.is_active)


@router.post("/users", response_model=UserPublic, status_code=201)
def create_user(
    data: CreateUserRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gebruiker met dit email adres bestaat al")

    new_user = User(
        email=data.email.lower(),
        display_name=data.display_name,
        country=data.country,
        locale=data.locale,
        password_hash=hash_password(data.password),
        is_active=True,
        is_admin=data.is_admin,
        privacy_level="private",
        target_recipients=[],
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_user)
    db.flush()  # assign ID before audit log references it
    _audit(db, admin, "create_user", target=new_user, detail=f"is_admin={data.is_admin}")
    db.commit()
    db.refresh(new_user)

    return new_user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gebruiker niet gevonden")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Je kunt je eigen account niet verwijderen")

    # Verwijder gerelateerde records die geen DB-level CASCADE hebben
    db.query(FamilyMember).filter(FamilyMember.created_by == user_id).delete(synchronize_session=False)
    db.query(EmailEvent).filter(EmailEvent.user_id == user_id).delete(synchronize_session=False)
    db.query(EmailPreference).filter(EmailPreference.user_id == user_id).delete(synchronize_session=False)

    # Journeys (en hun children) via CASCADE in DB, maar ook expliciet voor zekerheid
    journeys = db.query(Journey).filter(Journey.user_id == user_id).all()
    for journey in journeys:
        db.delete(journey)
    db.flush()

    _audit(db, admin, "delete_user", target=user)
    db.delete(user)
    db.commit()
