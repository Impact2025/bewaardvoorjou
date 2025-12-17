"""Email preference endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.email import EmailPreference as EmailPreferenceModel
from app.models.user import User
from app.schemas.email import (
    EmailPreferenceResponse,
    EmailPreferenceUpdate,
    UnsubscribeResponse,
)
from app.services.email.preferences import get_or_create_preferences


router = APIRouter()


@router.get("/preferences", response_model=EmailPreferenceResponse, tags=["emails"])
def get_email_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmailPreferenceResponse:
    """Get user's email preferences."""
    prefs = get_or_create_preferences(db, current_user.id)
    return EmailPreferenceResponse.model_validate(prefs)


@router.put("/preferences", response_model=EmailPreferenceResponse, tags=["emails"])
def update_email_preferences(
    payload: EmailPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmailPreferenceResponse:
    """Update user's email preferences."""
    prefs = get_or_create_preferences(db, current_user.id)

    # Update fields if provided
    if payload.welcome_emails is not None:
        prefs.welcome_emails = payload.welcome_emails
    if payload.chapter_emails is not None:
        prefs.chapter_emails = payload.chapter_emails
    if payload.milestone_emails is not None:
        prefs.milestone_emails = payload.milestone_emails
    if payload.unsubscribed_all is not None:
        prefs.unsubscribed_all = payload.unsubscribed_all
        if payload.unsubscribed_all:
            prefs.unsubscribed_at = datetime.now(timezone.utc)
        else:
            prefs.unsubscribed_at = None

    db.commit()
    db.refresh(prefs)

    return EmailPreferenceResponse.model_validate(prefs)


@router.post("/unsubscribe/{token}", response_model=UnsubscribeResponse, tags=["emails"])
def unsubscribe_from_emails(
    token: str,
    db: Session = Depends(get_db),
) -> UnsubscribeResponse:
    """
    Public unsubscribe endpoint (no authentication required).

    Token format: {user_id}:{email_event_id}
    """
    # Parse token
    try:
        parts = token.split(":")
        if len(parts) != 2:
            raise ValueError("Invalid token format")
        user_id = parts[0]
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid unsubscribe token")

    # Get or create preferences
    prefs = db.query(EmailPreferenceModel).filter(
        EmailPreferenceModel.user_id == user_id
    ).first()

    if not prefs:
        prefs = EmailPreferenceModel(
            user_id=user_id,
            welcome_emails=False,
            chapter_emails=False,
            milestone_emails=False,
            unsubscribed_all=True,
            unsubscribed_at=datetime.now(timezone.utc),
        )
        db.add(prefs)
    else:
        prefs.unsubscribed_all = True
        prefs.unsubscribed_at = datetime.now(timezone.utc)

    db.commit()

    return UnsubscribeResponse(
        message="Je bent uitgeschreven voor alle emails van Bewaardvoorjou.",
        unsubscribed=True,
    )
