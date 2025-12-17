"""Email event triggers."""

from __future__ import annotations

from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from app.models.email import EmailEvent as EmailEventModel
from app.models.user import User as UserModel
from app.models.journey import Journey as JourneyModel
from app.models.media import MediaAsset as MediaAssetModel
from app.services.email.preferences import should_send_email
from app.services.email.processor import enqueue_email_job


def trigger_welcome_email(db: Session, user_id: str) -> Optional[str]:
    """
    Trigger welcome email for new user.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        Task ID if queued, None if not sent
    """
    # Check preferences
    if not should_send_email(db, user_id, "welcome"):
        logger.info(f"User {user_id} opted out of welcome emails")
        return None

    # Check if already sent
    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.email_type == "welcome",
    ).first()

    if existing:
        logger.info(f"Welcome email already sent to user {user_id}")
        return None

    # Get user
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return None

    # Get user's journey
    journey = db.query(JourneyModel).filter(JourneyModel.user_id == user_id).first()

    # Create email event
    email_event = EmailEventModel(
        user_id=user_id,
        journey_id=journey.id if journey else None,
        email_type="welcome",
        sent_to=user.email,
        status="pending",
    )
    db.add(email_event)
    db.commit()
    db.refresh(email_event)

    logger.info(f"Email queued: welcome to {user.email}")

    # Queue job
    task_id = enqueue_email_job(email_event.id)
    return task_id


def trigger_chapter_complete_email(
    db: Session,
    user_id: str,
    journey_id: str,
    chapter_id: str,
) -> Optional[str]:
    """
    Trigger chapter completion email.

    Args:
        db: Database session
        user_id: User ID
        journey_id: Journey ID
        chapter_id: Completed chapter ID

    Returns:
        Task ID if queued, None if not sent
    """
    # Check preferences
    if not should_send_email(db, user_id, "chapter_complete"):
        logger.info(f"User {user_id} opted out of chapter completion emails")
        return None

    # Check if already sent for this chapter
    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == "chapter_complete",
        EmailEventModel.context_data["chapter_id"].astext == chapter_id,
    ).first()

    if existing:
        logger.info(f"Chapter complete email already sent for {chapter_id} to user {user_id}")
        return None

    # Get user
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return None

    # Calculate progress
    from app.services.journey_progress import CHAPTER_ORDER

    total_chapters = len(CHAPTER_ORDER)
    completed_chapters = db.query(MediaAssetModel).filter(
        MediaAssetModel.journey_id == journey_id,
        MediaAssetModel.storage_state.in_(["stored", "processing"]),
    ).count()

    # Get next chapter
    try:
        current_index = CHAPTER_ORDER.index(chapter_id)
        next_chapter_id = CHAPTER_ORDER[current_index + 1] if current_index + 1 < len(CHAPTER_ORDER) else None
    except (ValueError, IndexError):
        next_chapter_id = None

    # Create email event
    email_event = EmailEventModel(
        user_id=user_id,
        journey_id=journey_id,
        email_type="chapter_complete",
        sent_to=user.email,
        status="pending",
        context_data={
            "chapter_id": chapter_id,
            "completed_count": completed_chapters,
            "total_count": total_chapters,
            "next_chapter_id": next_chapter_id,
        },
    )
    db.add(email_event)
    db.commit()
    db.refresh(email_event)

    logger.info(f"Email queued: chapter_complete for {chapter_id} to {user.email}")

    # Queue job
    task_id = enqueue_email_job(email_event.id)
    return task_id


def trigger_milestone_email(
    db: Session,
    user_id: str,
    journey_id: str,
    milestone_type: str,
) -> Optional[str]:
    """
    Trigger milestone unlock email.

    Args:
        db: Database session
        user_id: User ID
        journey_id: Journey ID
        milestone_type: "bonus" or "deep"

    Returns:
        Task ID if queued, None if not sent
    """
    # Check preferences
    if not should_send_email(db, user_id, "milestone_unlock"):
        logger.info(f"User {user_id} opted out of milestone emails")
        return None

    # Check if already sent for this milestone
    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == "milestone_unlock",
        EmailEventModel.context_data["milestone_type"].astext == milestone_type,
    ).first()

    if existing:
        logger.info(f"Milestone email already sent for {milestone_type} to user {user_id}")
        return None

    # Get user
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return None

    # Create email event
    email_event = EmailEventModel(
        user_id=user_id,
        journey_id=journey_id,
        email_type="milestone_unlock",
        sent_to=user.email,
        status="pending",
        context_data={
            "milestone_type": milestone_type,
        },
    )
    db.add(email_event)
    db.commit()
    db.refresh(email_event)

    logger.info(f"Email queued: milestone_unlock ({milestone_type}) to {user.email}")

    # Queue job
    task_id = enqueue_email_job(email_event.id)
    return task_id
