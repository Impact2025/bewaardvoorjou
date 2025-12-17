"""Celery tasks for email sending."""

from __future__ import annotations

from celery import Celery
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.email import EmailEvent as EmailEventModel
from app.models.user import User as UserModel
from app.models.journey import Journey as JourneyModel
from app.services.email.client import send_email, ResendError
from app.services.email.renderer import (
    build_welcome_email,
    build_chapter_complete_email,
    build_milestone_unlock_email,
)

celery_app = Celery("life_journey_email")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url.replace("/0", "/1")
celery_app.conf.broker_connection_timeout = 1
celery_app.conf.broker_connection_retry = False


@celery_app.task(name="email.send")
def send_email_task(email_event_id: str) -> None:
    """
    Send an email based on EmailEvent record.

    This task:
    1. Fetches EmailEvent from database
    2. Gets user and journey data
    3. Builds email template
    4. Sends via Resend
    5. Updates event status

    Args:
        email_event_id: ID of the EmailEvent to send
    """
    logger.info(f"Starting email send task for event {email_event_id}")

    db: Session = SessionLocal()
    try:
        # Get email event
        email_event = db.query(EmailEventModel).filter(
            EmailEventModel.id == email_event_id
        ).first()

        if not email_event:
            logger.error(f"EmailEvent {email_event_id} not found")
            return

        # Get user
        user = db.query(UserModel).filter(UserModel.id == email_event.user_id).first()
        if not user:
            logger.error(f"User {email_event.user_id} not found for email event {email_event_id}")
            email_event.status = "failed"
            email_event.error_message = "User not found"
            db.commit()
            return

        # Generate unsubscribe token (simple token based on user ID)
        # TODO: Use proper JWT token for production
        unsubscribe_token = f"{user.id}:{email_event.id}"

        # Build email based on type
        try:
            if email_event.email_type == "welcome":
                journey = db.query(JourneyModel).filter(
                    JourneyModel.id == email_event.journey_id
                ).first()
                journey_title = journey.title if journey else "Je levensverhaal"

                subject, html, text = build_welcome_email(
                    user_display_name=user.display_name,
                    journey_title=journey_title,
                    unsubscribe_token=unsubscribe_token,
                )

            elif email_event.email_type == "chapter_complete":
                context = email_event.context_data or {}
                journey = db.query(JourneyModel).filter(
                    JourneyModel.id == email_event.journey_id
                ).first()
                journey_title = journey.title if journey else "Je levensverhaal"

                subject, html, text = build_chapter_complete_email(
                    user_display_name=user.display_name,
                    journey_title=journey_title,
                    chapter_id=context.get("chapter_id", "unknown"),
                    completed_count=context.get("completed_count", 0),
                    total_count=context.get("total_count", 30),
                    next_chapter_id=context.get("next_chapter_id"),
                    unsubscribe_token=unsubscribe_token,
                )

            elif email_event.email_type == "milestone_unlock":
                context = email_event.context_data or {}
                journey = db.query(JourneyModel).filter(
                    JourneyModel.id == email_event.journey_id
                ).first()
                journey_title = journey.title if journey else "Je levensverhaal"

                subject, html, text = build_milestone_unlock_email(
                    user_display_name=user.display_name,
                    journey_title=journey_title,
                    milestone_type=context.get("milestone_type", "bonus"),
                    unsubscribe_token=unsubscribe_token,
                )

            else:
                logger.error(f"Unknown email type: {email_event.email_type}")
                email_event.status = "failed"
                email_event.error_message = f"Unknown email type: {email_event.email_type}"
                db.commit()
                return

        except Exception as e:
            logger.error(f"Failed to build email template for event {email_event_id}: {e}")
            email_event.status = "failed"
            email_event.error_message = f"Template error: {str(e)}"
            db.commit()
            return

        # Send email via Resend
        try:
            message_id = send_email(
                to=email_event.sent_to,
                subject=subject,
                html=html,
                text=text,
            )

            # Update event status
            email_event.status = "sent"
            email_event.resend_id = message_id
            email_event.sent_at = db.query(EmailEventModel).filter(
                EmailEventModel.id == email_event_id
            ).first().created_at  # Use current time

            logger.info(f"Email sent successfully for event {email_event_id}, Resend ID: {message_id}")

        except ResendError as e:
            logger.error(f"Failed to send email for event {email_event_id}: {e}")
            email_event.status = "failed"
            email_event.error_message = str(e)

        db.commit()

    except Exception as e:
        logger.error(f"Unexpected error in send_email_task for event {email_event_id}: {e}")
        try:
            email_event = db.query(EmailEventModel).filter(
                EmailEventModel.id == email_event_id
            ).first()
            if email_event:
                email_event.status = "failed"
                email_event.error_message = f"Unexpected error: {str(e)}"
                db.commit()
        except Exception:
            pass

    finally:
        db.close()
