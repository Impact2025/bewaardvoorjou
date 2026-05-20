"""Email preference checking helpers."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.email import EmailPreference as EmailPreferenceModel


def should_send_email(db: Session, user_id: str, email_type: str) -> bool:
    """
    Check if user wants to receive emails of this type.

    Transactional emails (email_verification, password_reset) always bypass
    this check and should be sent regardless of preferences.

    Returns:
        True if email should be sent, False otherwise
    """
    from app.models.user import User as UserModel

    # Hard-bounced addresses never receive marketing/trigger emails
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user and getattr(user, "email_bounced", False):
        return False

    prefs = db.query(EmailPreferenceModel).filter(
        EmailPreferenceModel.user_id == user_id
    ).first()

    if not prefs:
        return True

    if prefs.unsubscribed_all:
        return False

    if email_type == "welcome":
        return prefs.welcome_emails
    elif email_type == "chapter_complete":
        return prefs.chapter_emails
    elif email_type == "milestone_unlock":
        return prefs.milestone_emails

    return False


def get_or_create_preferences(db: Session, user_id: str) -> EmailPreferenceModel:
    """
    Get or create email preferences for a user.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        EmailPreference instance
    """
    prefs = db.query(EmailPreferenceModel).filter(
        EmailPreferenceModel.user_id == user_id
    ).first()

    if not prefs:
        prefs = EmailPreferenceModel(
            user_id=user_id,
            welcome_emails=True,
            chapter_emails=True,
            milestone_emails=True,
            unsubscribed_all=False,
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return prefs
