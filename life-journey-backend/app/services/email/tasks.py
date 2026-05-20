"""Celery tasks for email sending with retry and full email type support."""

from __future__ import annotations

from datetime import datetime, timezone

from celery import Celery
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.email import EmailEvent as EmailEventModel
from app.models.user import User as UserModel
from app.models.journey import Journey as JourneyModel
from app.services.email.client import send_email, ResendError, EmailBouncedError
from app.services.email.renderer import (
    build_welcome_email,
    build_chapter_complete_email,
    build_milestone_unlock_email,
    build_password_reset_email,
    build_email_verification_email,
)

celery_app = Celery("life_journey_email")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url
celery_app.conf.broker_connection_timeout = 2
celery_app.conf.broker_connection_retry_on_startup = False

# Retry on any exception: 3 attempts, 60s / 120s / 240s backoff
@celery_app.task(
    name="email.send",
    autoretry_for=(ResendError,),
    max_retries=3,
    retry_backoff=60,
    retry_backoff_max=300,
    acks_late=True,
)
def send_email_task(email_event_id: str) -> None:
    logger.info(f"Starting email send task for event {email_event_id}")

    db: Session = SessionLocal()
    try:
        email_event = db.query(EmailEventModel).filter(
            EmailEventModel.id == email_event_id
        ).first()

        if not email_event:
            logger.error(f"EmailEvent {email_event_id} not found")
            return

        user = db.query(UserModel).filter(UserModel.id == email_event.user_id).first()
        if not user:
            logger.error(f"User {email_event.user_id} not found")
            email_event.status = "failed"
            email_event.error_message = "User not found"
            db.commit()
            return

        # Build unsubscribe URL from token stored on the event
        unsubscribe_url: str | None = None
        if email_event.unsubscribe_token:
            unsubscribe_url = (
                f"{settings.app_base_url}/api/v1/emails/unsubscribe/{email_event.unsubscribe_token}"
            )

        # Build email content based on type
        try:
            subject, html, text = _build_email(db, email_event, user)
        except Exception as e:
            logger.error(f"Failed to build email template for event {email_event_id}: {e}")
            email_event.status = "failed"
            email_event.error_message = f"Template error: {e}"
            db.commit()
            return

        # Send via Resend
        try:
            message_id = send_email(
                to=email_event.sent_to,
                subject=subject,
                html=html,
                text=text,
                unsubscribe_url=unsubscribe_url,
                email_bounced=getattr(user, "email_bounced", False),
            )
            email_event.status = "sent"
            email_event.resend_id = message_id
            email_event.sent_at = datetime.now(timezone.utc)
            logger.info(f"Email sent for event {email_event_id}, resend_id={message_id}")

        except EmailBouncedError as e:
            logger.warning(f"Suppressed email to bounced address: {email_event.sent_to}")
            email_event.status = "failed"
            email_event.error_message = str(e)

        except ResendError as e:
            logger.error(f"Resend error for event {email_event_id}: {e}")
            email_event.status = "failed"
            email_event.error_message = str(e)
            db.commit()
            raise  # Celery will retry

        db.commit()

    except ResendError:
        raise  # Let Celery handle the retry

    except Exception as e:
        logger.error(f"Unexpected error in send_email_task for event {email_event_id}: {e}")
        try:
            ev = db.query(EmailEventModel).filter(EmailEventModel.id == email_event_id).first()
            if ev:
                ev.status = "failed"
                ev.error_message = f"Unexpected: {e}"
                db.commit()
        except Exception:
            pass

    finally:
        db.close()


def _build_email(
    db: Session,
    email_event: EmailEventModel,
    user: UserModel,
) -> tuple[str, str, str]:
    """Build (subject, html, text) for a given email event."""
    ctx = email_event.context_data or {}
    # Transactional emails don't get an unsubscribe token in templates
    unsub = email_event.unsubscribe_token or ""

    if email_event.email_type == "welcome":
        journey = db.query(JourneyModel).filter(JourneyModel.id == email_event.journey_id).first()
        journey_title = journey.title if journey else "Je levensverhaal"
        return build_welcome_email(user.display_name, journey_title, unsub)

    if email_event.email_type == "chapter_complete":
        journey = db.query(JourneyModel).filter(JourneyModel.id == email_event.journey_id).first()
        journey_title = journey.title if journey else "Je levensverhaal"
        return build_chapter_complete_email(
            user_display_name=user.display_name,
            journey_title=journey_title,
            chapter_id=ctx.get("chapter_id", "unknown"),
            completed_count=ctx.get("completed_count", 0),
            total_count=ctx.get("total_count", 30),
            next_chapter_id=ctx.get("next_chapter_id"),
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "milestone_unlock":
        journey = db.query(JourneyModel).filter(JourneyModel.id == email_event.journey_id).first()
        journey_title = journey.title if journey else "Je levensverhaal"
        return build_milestone_unlock_email(
            user_display_name=user.display_name,
            journey_title=journey_title,
            milestone_type=ctx.get("milestone_type", "bonus"),
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "email_verification":
        return build_email_verification_email(user.display_name, ctx["verification_url"])

    if email_event.email_type == "password_reset":
        return build_password_reset_email(user.display_name, ctx["reset_url"])

    raise ValueError(f"Unknown email type: {email_event.email_type}")
