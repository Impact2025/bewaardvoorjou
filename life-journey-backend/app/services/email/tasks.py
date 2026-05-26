"""Celery tasks for email sending with retry and full email type support."""

from __future__ import annotations

from datetime import datetime, timezone

from celery import Celery
from celery.schedules import crontab
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
    build_weekly_question_email,
    build_inactivity_reminder_email,
    build_seasonal_email,
    build_progress_milestone_email,
    build_family_notification_email,
    build_magic_link_email,
    build_export_ready_email,
)

celery_app = Celery("life_journey_email")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url
celery_app.conf.broker_connection_timeout = 2
celery_app.conf.broker_connection_retry_on_startup = False

# Celery Beat schedule — re-engagement automation
celery_app.conf.beat_schedule = {
    # Elke maandag 09:00 Amsterdam time (= 07:00 UTC winter, 07:00 UTC zomer)
    "weekly-questions": {
        "task": "email.weekly_questions",
        "schedule": crontab(hour=7, minute=0, day_of_week=1),
        "options": {"expires": 3600},
    },
    # Dagelijks 08:00 UTC — inactiviteitscheck
    "daily-inactivity-check": {
        "task": "email.check_inactive_users",
        "schedule": crontab(hour=8, minute=0),
        "options": {"expires": 3600},
    },
    # Dagelijks 09:00 UTC — seizoenstriggers
    "daily-seasonal-triggers": {
        "task": "email.seasonal_triggers",
        "schedule": crontab(hour=9, minute=0),
        "options": {"expires": 3600},
    },
}
celery_app.conf.timezone = "Europe/Amsterdam"

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

    if email_event.email_type == "weekly_question":
        journey_url = f"{settings.app_base_url}/vertel"
        return build_weekly_question_email(
            user_display_name=user.display_name,
            chapter_id=ctx.get("chapter_id", "intro-reflection"),
            question_text=ctx.get("question_text", "Vertel iets moois..."),
            journey_url=journey_url,
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "inactivity_reminder":
        journey_url = f"{settings.app_base_url}/vertel"
        return build_inactivity_reminder_email(
            user_display_name=user.display_name,
            days_inactive=ctx.get("days_inactive", 7),
            next_chapter_id=ctx.get("next_chapter_id", "intro-reflection"),
            next_question=ctx.get("next_question", "Vertel iets moois over je jeugd..."),
            journey_url=journey_url,
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "seasonal":
        journey_url = f"{settings.app_base_url}/vertel"
        return build_seasonal_email(
            user_display_name=user.display_name,
            occasion=ctx.get("occasion", "kerst"),
            question_text=ctx.get("question_text", "Vertel over een bijzonder moment..."),
            chapter_id=ctx.get("chapter_id", "intro-reflection"),
            journey_url=journey_url,
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "progress_milestone":
        journey = db.query(JourneyModel).filter(JourneyModel.id == email_event.journey_id).first()
        journey_title = journey.title if journey else "Je levensverhaal"
        percent = ctx.get("percent", 25)
        journey_url = f"{settings.app_base_url}/vertel"
        return build_progress_milestone_email(
            user_display_name=user.display_name,
            journey_title=journey_title,
            percent=percent,
            completed_count=ctx.get("completed_count", 0),
            total_count=ctx.get("total_count", 30),
            journey_url=journey_url,
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "family_notification":
        return build_family_notification_email(
            recipient_name=ctx.get("recipient_name", ""),
            storyteller_name=ctx.get("storyteller_name", ""),
            chapter_title=ctx.get("chapter_title", ""),
            share_url=ctx.get("share_url", settings.app_base_url),
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "magic_link":
        return build_magic_link_email(
            user_display_name=user.display_name,
            magic_link_url=ctx["magic_link_url"],
            gifter_name=ctx.get("gifter_name"),
        )

    if email_event.email_type == "export_ready":
        return build_export_ready_email(
            user_display_name=user.display_name,
            download_url=ctx["download_url"],
            expires_hours=ctx.get("expires_hours", 24),
        )

    raise ValueError(f"Unknown email type: {email_event.email_type}")


@celery_app.task(name="sharing.generate_export", acks_late=True, max_retries=2, retry_backoff=30)
def generate_export_task(journey_id: str, user_id: str) -> None:
    """Async export generation — builds ZIP, uploads to S3, emails download link."""
    from app.services.sharing.exporter import generate_export_bundle
    from app.services.email.events import trigger_export_ready_email

    db: Session = SessionLocal()
    try:
        result = generate_export_bundle(journey_id, db)
        trigger_export_ready_email(db, user_id, result["download_url"])
        logger.info(f"Export complete for journey {journey_id}, user {user_id}")
    except Exception as exc:
        logger.error(f"Export task failed for journey {journey_id}: {exc}")
        raise
    finally:
        db.close()
