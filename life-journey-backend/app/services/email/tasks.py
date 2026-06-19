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
    # BewaardVoorBaby
    build_baby_gift_delivery_email,
    build_baby_weekly_question_email,
    build_baby_milestone_trigger_email,
    build_baby_first_birthday_email,
    build_baby_golden_ticket_email,
    build_baby_partner_invite_email,
)

celery_app = Celery("life_journey_email")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url
celery_app.conf.broker_connection_timeout = 2
celery_app.conf.broker_connection_retry_on_startup = False

# Celery Beat schedule — re-engagement automation
#
# Prioriteitsvolgorde op een dag waarop meerdere triggers samenvallen wordt
# bepaald door de uitvoertijd + de dagcap in events.py (max 1 re-engagement-
# mail per gebruiker per dag): seizoen (06:30) > wekelijkse vraag (07:00) >
# inactiviteit (08:00). De seizoensmail draait dus eerst en de latere triggers
# vallen die dag stil. De wekelijkse taak slaat seizoensdagen sowieso over.
celery_app.conf.beat_schedule = {
    # Dagelijks 06:00 UTC (08:00 Amsterdam) — systeemrapport naar de eigenaar
    "daily-health-report": {
        "task": "admin.daily_health_report",
        "schedule": crontab(hour=6, minute=0),
        "options": {"expires": 3600},
    },
    # Dagelijks 06:15 UTC — geplande cadeau-uitnodigingen op bezorgmoment
    "scheduled-gift-redemptions": {
        "task": "email.scheduled_gift_redemptions",
        "schedule": crontab(hour=6, minute=15),
        "options": {"expires": 3600},
    },
    # Dagelijks 06:30 UTC — seizoenstriggers (hoogste prioriteit, draait eerst)
    "daily-seasonal-triggers": {
        "task": "email.seasonal_triggers",
        "schedule": crontab(hour=6, minute=30),
        "options": {"expires": 3600},
    },
    # Elke maandag 07:00 UTC (09:00 Amsterdam) — wekelijkse vraag
    "weekly-questions": {
        "task": "email.weekly_questions",
        "schedule": crontab(hour=7, minute=0, day_of_week=1),
        "options": {"expires": 3600},
    },
    # Dagelijks 08:00 UTC — inactiviteitscheck (laagste prioriteit)
    "daily-inactivity-check": {
        "task": "email.check_inactive_users",
        "schedule": crontab(hour=8, minute=0),
        "options": {"expires": 3600},
    },
    # BewaardVoorBaby: elke maandag 09:30 UTC wekelijkse herinneringsvraag
    "baby-weekly-questions": {
        "task": "baby.weekly_questions",
        "schedule": crontab(hour=9, minute=30, day_of_week=1),
        "options": {"expires": 3600},
    },
    # BewaardVoorBaby: 1e van de maand 10:00 UTC — opa/oma digest
    "baby-grandparent-digest": {
        "task": "baby.grandparent_digest",
        "schedule": crontab(hour=10, minute=0, day_of_month=1),
        "options": {"expires": 3600},
    },
    # BewaardVoorBaby: dagelijks 07:30 UTC — eerste verjaardag check
    "baby-first-birthday-check": {
        "task": "baby.check_first_birthday",
        "schedule": crontab(hour=7, minute=30),
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
            personal_message=ctx.get("personal_message"),
        )

    if email_event.email_type == "export_ready":
        return build_export_ready_email(
            user_display_name=user.display_name,
            download_url=ctx["download_url"],
            expires_hours=ctx.get("expires_hours", 24),
        )

    # ── BewaardVoorBaby ───────────────────────────────────────────────────

    if email_event.email_type == "baby_gift_delivery":
        return build_baby_gift_delivery_email(
            recipient_name=ctx.get("recipient_name", user.display_name),
            gifter_name=ctx.get("gifter_name"),
            baby_name=ctx.get("baby_name", "jullie kindje"),
            onboarding_url=ctx.get("onboarding_url", f"{settings.app_base_url}/voor-baby/onboarding"),
        )

    if email_event.email_type == "baby_weekly_question":
        return build_baby_weekly_question_email(
            user_display_name=ctx.get("display_name", user.display_name),
            baby_name=ctx.get("baby_name", "jullie kindje"),
            chapter_id=ctx.get("chapter_id", "baby-birth-story"),
            question_text=ctx.get("question_text", "Vertel over dit bijzondere moment..."),
            dashboard_url=ctx.get("dashboard_url", f"{settings.app_base_url}/voor-baby/dashboard"),
            age_weeks=ctx.get("age_weeks"),
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "baby_milestone_trigger":
        from app.services.ai.interviewer import CHAPTER_CONTEXTS
        from app.schemas.common import ChapterId as ChapterIdEnum

        milestone_type = ctx.get("milestone_type", "")
        milestone_label = ctx.get("milestone_label", milestone_type)
        narrator_role = ctx.get("narrator_role", "SAMEN")
        baby_name = ctx.get("baby_name", "jullie kindje")

        # Genereer een passende verdiepingsvraag voor deze mijlpaal
        milestone_questions: dict[str, str] = {
            "eerste_glimlach": f"Hoe zag die eerste glimlach van {baby_name} eruit, en wat dacht je op dat moment?",
            "eerste_lach": f"Wat deed je om die eerste echte schaterlach van {baby_name} uit te lokken?",
            "eerste_doorslapen": f"Hoe voelde het om voor het eerst door te slapen — geloofde je het bijna niet?",
            "eerste_omrollen_buik_naar_rug": f"Hoe zag het eruit toen {baby_name} voor het eerst omdraaide?",
            "eerste_hapjes": f"Wat was het eerste voedsel dat {baby_name} proefde, en hoe reageerde hij/zij?",
            "eerste_tandje": f"Hoe ontdekte je dat het eerste tandje van {baby_name} er aankwam?",
            "eerste_zitten": f"Hoe trots was je toen {baby_name} voor het eerst rechtop zat?",
            "eerste_kruipen": f"Waar kroop {baby_name} naartoe zodra hij/zij kon bewegen?",
            "eerste_staan": f"Beschrijf het moment dat {baby_name} voor het eerst zelfstandig stond.",
            "eerste_woordje_mama": f"Hoe klonk dat eerste 'mama' van {baby_name}, en wat deed je?",
            "eerste_woordje_papa": f"Hoe klonk dat eerste 'papa' van {baby_name}, en wie was erbij?",
            "eerste_stapjes": f"Vertel over de eerste stapjes van {baby_name} — wie was erbij en wat voelde je?",
            "eerste_verjaardag": f"Hoe was de eerste verjaardagsdag van {baby_name}?",
        }
        question = milestone_questions.get(
            milestone_type,
            f"Vertel over het moment dat {baby_name} {milestone_label.lower()} — hoe was dat voor jou?",
        )
        dashboard_url = ctx.get("dashboard_url", f"{settings.app_base_url}/voor-baby/dashboard")
        return build_baby_milestone_trigger_email(
            user_display_name=user.display_name,
            baby_name=baby_name,
            milestone_label=milestone_label,
            question_text=question,
            dashboard_url=dashboard_url,
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "baby_first_birthday":
        return build_baby_first_birthday_email(
            user_display_name=ctx.get("display_name", user.display_name),
            baby_name=ctx.get("baby_name", "jullie kindje"),
            photobook_progress_pct=ctx.get("photobook_progress_pct", 0),
            dashboard_url=ctx.get("dashboard_url", f"{settings.app_base_url}/voor-baby/dashboard"),
            unsubscribe_token=unsub,
        )

    if email_event.email_type in ("baby_golden_ticket",):
        return build_baby_golden_ticket_email(
            user_display_name=user.display_name,
            baby_name=ctx.get("baby_name", "jullie kindje"),
            golden_ticket_url=ctx.get("golden_ticket_url", f"{settings.app_base_url}/cadeau"),
            unsubscribe_token=unsub,
        )

    if email_event.email_type == "baby_partner_invite":
        return build_baby_partner_invite_email(
            partner_email=email_event.sent_to,
            inviter_name=ctx.get("inviter_name", "je partner"),
            baby_name=ctx.get("baby_name", "jullie kindje"),
            invite_url=ctx.get("invite_url", f"{settings.app_base_url}/voor-baby"),
        )

    if email_event.email_type == "baby_grandparent_digest":
        # Grootouder-digest wordt direct via log_and_send afgehandeld, niet via EmailEvent-task
        raise ValueError("baby_grandparent_digest moet via log_and_send lopen, niet via task queue")

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


# Registreer de Celery-beat taken uit scheduler.py bij deze app.
# De worker en beat draaien tegen `app.services.email.tasks:celery_app`; zonder
# deze import worden de taken uit scheduler.py (weekly_questions, inactivity,
# seasonal, admin.daily_health_report) nooit geregistreerd en dus nooit
# uitgevoerd. Onderaan geplaatst zodat celery_app al gedefinieerd is.
from app.services.email import scheduler as _scheduler  # noqa: E402,F401
