"""Admin API routes."""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.models.audit_log import AuditLog
from app.models.email import EmailEvent, EmailPreference
from app.models.family import FamilyMember, FamilyPod
from app.models.journey import Journey
from app.models.quick_thought import QuickThought
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


def _engagement_rates(
    delivered: int, opened: int, clicked: int, bounced: int, complained: int, sent_ok: int
) -> dict:
    """Bereken engagement-percentages uit ruwe tellingen (deelt nooit door nul)."""
    def pct(num: int, den: int) -> float:
        return round((num / den) * 100, 1) if den else 0.0

    # Bounce/complaint relateren we aan alles wat we probeerden af te leveren.
    attempted = sent_ok + bounced
    return {
        "open_rate": pct(opened, delivered),
        "click_rate": pct(clicked, delivered),
        "click_to_open_rate": pct(clicked, opened),
        "bounce_rate": pct(bounced, attempted),
        "complaint_rate": pct(complained, delivered),
    }


@router.get("/email-analytics")
def get_email_analytics(
    days: int = Query(30, ge=1, le=365),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Engagement-cijfers per e-mailtype over de afgelopen `days` dagen:
    afgeleverd, geopend, geklikt, bounces en klachten — met afgeleide
    open-, klik-, bounce- en klachtpercentages.
    """
    from datetime import timedelta
    since = datetime.now(timezone.utc) - timedelta(days=days)

    rows = (
        db.query(
            EmailEvent.email_type.label("email_type"),
            func.count(EmailEvent.id).label("total"),
            func.sum(case((EmailEvent.status.in_(["sent", "delivered"]), 1), else_=0)).label("sent_ok"),
            func.sum(case((EmailEvent.delivered_at.isnot(None), 1), else_=0)).label("delivered"),
            func.sum(case((EmailEvent.opened_at.isnot(None), 1), else_=0)).label("opened"),
            func.sum(case((EmailEvent.clicked_at.isnot(None), 1), else_=0)).label("clicked"),
            func.sum(case((EmailEvent.status == "bounced", 1), else_=0)).label("bounced"),
            func.sum(case((EmailEvent.status == "complained", 1), else_=0)).label("complained"),
        )
        .filter(EmailEvent.created_at >= since)
        .group_by(EmailEvent.email_type)
        .all()
    )

    by_type = []
    totals = {"total": 0, "sent_ok": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "complained": 0}
    for r in rows:
        counts = {k: int(getattr(r, k) or 0) for k in totals}
        for k in totals:
            totals[k] += counts[k]
        by_type.append({
            "email_type": r.email_type,
            **counts,
            **_engagement_rates(
                counts["delivered"], counts["opened"], counts["clicked"],
                counts["bounced"], counts["complained"], counts["sent_ok"],
            ),
        })

    by_type.sort(key=lambda x: x["total"], reverse=True)

    return {
        "window_days": days,
        "totals": {
            **totals,
            **_engagement_rates(
                totals["delivered"], totals["opened"], totals["clicked"],
                totals["bounced"], totals["complained"], totals["sent_ok"],
            ),
        },
        "by_type": by_type,
    }


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

    # EmailEvent / EmailPreference hebben DB-level CASCADE — expliciet voor zekerheid
    db.query(EmailEvent).filter(EmailEvent.user_id == user_id).delete(synchronize_session=False)
    db.query(EmailPreference).filter(EmailPreference.user_id == user_id).delete(synchronize_session=False)

    # Haal journey-IDs op zodat we child-records kunnen opschonen
    journey_ids = [
        row[0] for row in db.query(Journey.id).filter(Journey.user_id == user_id).all()
    ]

    if journey_ids:
        # FamilyMember, FamilyPod en QuickThought hebben een backref naar Journey
        # zonder passive_deletes — SQLAlchemy probeert journey_id op NULL te zetten
        # (nullable=False) waardoor een IntegrityError volgt. Verwijder ze expliciet eerst.
        db.query(FamilyMember).filter(FamilyMember.journey_id.in_(journey_ids)).delete(synchronize_session=False)
        db.query(FamilyPod).filter(FamilyPod.journey_id.in_(journey_ids)).delete(synchronize_session=False)
        db.query(QuickThought).filter(QuickThought.journey_id.in_(journey_ids)).delete(synchronize_session=False)

    # FamilyMembers aangemaakt door deze gebruiker in andermans journeys
    # (created_by FK heeft geen ondelete-clause)
    db.query(FamilyMember).filter(FamilyMember.created_by == user_id).delete(synchronize_session=False)

    db.flush()

    # Verwijder journeys; overige children (media, highlights, etc.) hebben
    # cascade="all, delete-orphan" op de Journey-relatie en worden automatisch meegenomen
    journeys = db.query(Journey).filter(Journey.user_id == user_id).all()
    for journey in journeys:
        db.delete(journey)
    db.flush()

    _audit(db, admin, "delete_user", target=user)
    db.delete(user)
    db.commit()
