"""Email preference and unsubscribe endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.email import EmailEvent as EmailEventModel, EmailPreference as EmailPreferenceModel
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
    prefs = get_or_create_preferences(db, current_user.id)
    return EmailPreferenceResponse.model_validate(prefs)


@router.put("/preferences", response_model=EmailPreferenceResponse, tags=["emails"])
def update_email_preferences(
    payload: EmailPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmailPreferenceResponse:
    prefs = get_or_create_preferences(db, current_user.id)

    if payload.welcome_emails is not None:
        prefs.welcome_emails = payload.welcome_emails
    if payload.chapter_emails is not None:
        prefs.chapter_emails = payload.chapter_emails
    if payload.milestone_emails is not None:
        prefs.milestone_emails = payload.milestone_emails
    if payload.weekly_question_emails is not None:
        prefs.weekly_question_emails = payload.weekly_question_emails
    if payload.inactivity_reminders is not None:
        prefs.inactivity_reminders = payload.inactivity_reminders
    if payload.seasonal_emails is not None:
        prefs.seasonal_emails = payload.seasonal_emails
    if payload.family_notifications is not None:
        prefs.family_notifications = payload.family_notifications
    if payload.unsubscribed_all is not None:
        prefs.unsubscribed_all = payload.unsubscribed_all
        prefs.unsubscribed_at = datetime.now(timezone.utc) if payload.unsubscribed_all else None

    db.commit()
    db.refresh(prefs)
    return EmailPreferenceResponse.model_validate(prefs)


@router.post("/unsubscribe/{token}", response_model=UnsubscribeResponse, tags=["emails"])
def unsubscribe_from_emails(
    token: str,
    db: Session = Depends(get_db),
) -> UnsubscribeResponse:
    """
    One-click unsubscribe endpoint. No authentication required.

    The token is a random secret stored on the EmailEvent row — it cannot
    be guessed or forged, so no additional HMAC verification is needed.
    """
    event = db.query(EmailEventModel).filter(
        EmailEventModel.unsubscribe_token == token
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Ongeldige uitschrijflink")

    prefs = db.query(EmailPreferenceModel).filter(
        EmailPreferenceModel.user_id == event.user_id
    ).first()

    if not prefs:
        prefs = EmailPreferenceModel(
            user_id=event.user_id,
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

    # Invalidate token so it cannot be replayed
    event.unsubscribe_token = None
    db.commit()

    return UnsubscribeResponse(
        message="Je bent uitgeschreven voor alle e-mails van Bewaard voor jou.",
        unsubscribed=True,
    )
