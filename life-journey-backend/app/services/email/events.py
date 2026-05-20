"""Email event triggers — all outbound email goes through here."""

from __future__ import annotations

import secrets
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from app.models.email import EmailEvent as EmailEventModel
from app.models.user import User as UserModel
from app.models.journey import Journey as JourneyModel
from app.models.media import MediaAsset as MediaAssetModel
from app.services.email.preferences import should_send_email
from app.services.email.processor import enqueue_email_job


def _create_email_event(
    db: Session,
    *,
    user_id: str,
    email_type: str,
    sent_to: str,
    journey_id: str | None = None,
    context_data: dict | None = None,
) -> EmailEventModel:
    """Create and persist an EmailEvent with a fresh unsubscribe token."""
    event = EmailEventModel(
        user_id=user_id,
        journey_id=journey_id,
        email_type=email_type,
        sent_to=sent_to,
        status="pending",
        context_data=context_data,
        unsubscribe_token=secrets.token_urlsafe(32),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def trigger_welcome_email(db: Session, user_id: str) -> Optional[str]:
    if not should_send_email(db, user_id, "welcome"):
        logger.info(f"User {user_id} opted out of welcome emails")
        return None

    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.email_type == "welcome",
    ).first()
    if existing:
        logger.info(f"Welcome email already sent to user {user_id}")
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return None

    journey = db.query(JourneyModel).filter(JourneyModel.user_id == user_id).first()

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey.id if journey else None,
        email_type="welcome",
        sent_to=user.email,
    )

    logger.info(f"Email queued: welcome to {user.email}")
    return enqueue_email_job(event.id)


def trigger_email_verification(
    db: Session,
    user_id: str,
    verification_url: str,
) -> Optional[str]:
    """Queue a verification email. Transactional — not subject to preferences."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found for verification email")
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        email_type="email_verification",
        sent_to=user.email,
        context_data={"verification_url": verification_url},
    )

    logger.info(f"Email queued: email_verification to {user.email}")
    return enqueue_email_job(event.id)


def trigger_password_reset_email(
    db: Session,
    user_id: str,
    reset_url: str,
) -> Optional[str]:
    """Queue a password reset email. Transactional — not subject to preferences."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found for password reset email")
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        email_type="password_reset",
        sent_to=user.email,
        context_data={"reset_url": reset_url},
    )

    logger.info(f"Email queued: password_reset to {user.email}")
    return enqueue_email_job(event.id)


def trigger_chapter_complete_email(
    db: Session,
    user_id: str,
    journey_id: str,
    chapter_id: str,
) -> Optional[str]:
    if not should_send_email(db, user_id, "chapter_complete"):
        logger.info(f"User {user_id} opted out of chapter completion emails")
        return None

    existing_events = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == "chapter_complete",
    ).all()
    if any(
        e.context_data and e.context_data.get("chapter_id") == chapter_id
        for e in existing_events
    ):
        logger.info(f"Chapter complete email already sent for {chapter_id} to user {user_id}")
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return None

    from app.services.journey_progress import CHAPTER_ORDER
    total_chapters = len(CHAPTER_ORDER)
    completed_chapters = db.query(MediaAssetModel).filter(
        MediaAssetModel.journey_id == journey_id,
        MediaAssetModel.storage_state.in_(["stored", "processing"]),
    ).count()

    try:
        current_index = CHAPTER_ORDER.index(chapter_id)
        next_chapter_id = CHAPTER_ORDER[current_index + 1] if current_index + 1 < len(CHAPTER_ORDER) else None
    except (ValueError, IndexError):
        next_chapter_id = None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="chapter_complete",
        sent_to=user.email,
        context_data={
            "chapter_id": chapter_id,
            "completed_count": completed_chapters,
            "total_count": total_chapters,
            "next_chapter_id": next_chapter_id,
        },
    )

    logger.info(f"Email queued: chapter_complete for {chapter_id} to {user.email}")
    return enqueue_email_job(event.id)


def trigger_milestone_email(
    db: Session,
    user_id: str,
    journey_id: str,
    milestone_type: str,
) -> Optional[str]:
    if not should_send_email(db, user_id, "milestone_unlock"):
        logger.info(f"User {user_id} opted out of milestone emails")
        return None

    existing_events = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == "milestone_unlock",
    ).all()
    if any(
        e.context_data and e.context_data.get("milestone_type") == milestone_type
        for e in existing_events
    ):
        logger.info(f"Milestone email already sent for {milestone_type} to user {user_id}")
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="milestone_unlock",
        sent_to=user.email,
        context_data={"milestone_type": milestone_type},
    )

    logger.info(f"Email queued: milestone_unlock ({milestone_type}) to {user.email}")
    return enqueue_email_job(event.id)
