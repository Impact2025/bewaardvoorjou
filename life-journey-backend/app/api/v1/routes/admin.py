"""Admin API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone

from app.api.deps import get_current_admin_user, get_db
from app.models.user import User
from app.models.journey import Journey
from app.schemas.auth import UserPublic
from app.services.auth import hash_password
from pydantic import BaseModel, EmailStr


router = APIRouter()


class CreateUserRequest(BaseModel):
    """Request schema for creating a new user."""
    email: EmailStr
    display_name: str
    password: str
    country: str = "Nederland"
    locale: str = "nl"
    is_admin: bool = False


@router.get("/stats", response_model=Dict[str, Any])
async def get_admin_stats(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Get admin dashboard statistics.

    Returns:
    - Total users
    - Active users
    - New users today
    - Total journeys
    """
    # Total users
    total_users = db.query(func.count(User.id)).scalar()

    # Active users (logged in within last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    active_users = db.query(func.count(User.id)).filter(
        User.last_login_at >= thirty_days_ago
    ).scalar()

    # New users today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    new_users_today = db.query(func.count(User.id)).filter(
        User.created_at >= today_start
    ).scalar()

    # Total journeys
    total_journeys = db.query(func.count(Journey.id)).scalar()

    return {
        "total_users": total_users or 0,
        "active_users": active_users or 0,
        "new_users_today": new_users_today or 0,
        "total_journeys": total_journeys or 0,
    }


@router.get("/users", response_model=List[UserPublic])
async def list_all_users(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    List all users in the system.

    Only accessible by admin users.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user_by_id(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Get a specific user by ID.

    Only accessible by admin users.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gebruiker niet gevonden"
        )

    return user


@router.patch("/users/{user_id}/toggle-admin")
async def toggle_user_admin_status(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Toggle admin status for a user.

    Only accessible by admin users.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gebruiker niet gevonden"
        )

    # Don't allow admins to remove their own admin status
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Je kunt je eigen admin status niet wijzigen"
        )

    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
    }


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active_status(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Toggle active status for a user (enable/disable account).

    Only accessible by admin users.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gebruiker niet gevonden"
        )

    # Don't allow admins to deactivate their own account
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Je kunt je eigen account niet deactiveren"
        )

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "email": user.email,
        "is_active": user.is_active,
    }


@router.post("/users", response_model=UserPublic, status_code=201)
async def create_user(
    data: CreateUserRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Create a new user.

    Only accessible by admin users.
    """
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gebruiker met dit email adres bestaat al"
        )

    # Create new user
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
    db.commit()
    db.refresh(new_user)

    return new_user
