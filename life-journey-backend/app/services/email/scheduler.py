"""
Celery beat scheduled tasks voor re-engagement emails.

Taken:
- Wekelijkse vraag (elke maandag 09:00)
- Inactiviteitscheck (dagelijks)
- Seizoensgebonden triggers (dagelijks check)
- Voortgangs-mijlpaal check (na elke recording via media tasks)
"""

from __future__ import annotations

from datetime import date, datetime, timezone

from loguru import logger
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User as UserModel
from app.models.journey import Journey as JourneyModel
from app.models.media import MediaAsset as MediaAssetModel
from app.services.journey_progress import (
    get_next_available_chapter,
    get_journey_progress,
)
from app.services.email.events import (
    trigger_weekly_question_email,
    trigger_inactivity_reminder_email,
    trigger_first_memory_nudge_email,
    trigger_journey_complete_email,
    trigger_seasonal_email,
    trigger_progress_milestone_email,
)
from app.models.email import EmailEvent as EmailEventModel
from app.services.ai.interviewer import build_prompt_fallback
from app.schemas.common import ChapterId

from app.services.email.tasks import celery_app


# ---------------------------------------------------------------------------
# Seizoenskalender — (maand, dag, occasie, chapter_id, vraag)
# ---------------------------------------------------------------------------

SEASONAL_TRIGGERS: list[tuple[int, int, str, str, str]] = [
    (5, 11, "moederdag", "family-children",
     "Wat was het mooiste moment dat je als moeder hebt beleefd?"),
    (6, 15, "vaderdag", "family-children",
     "Wat heeft het vaderschap jou geleerd over jezelf?"),
    (12, 24, "kerst", "roots-siblings",
     "Hoe zag kerst eruit in je kindertijd — wat mis je het meest?"),
    (12, 31, "oud_nieuw", "future-dream",
     "Als je terugkijkt op dit jaar — wat was het mooiste moment?"),
]


# Re-engagement drempels (in dagen)
ONBOARDING_TIERS = [1, 3, 7]      # gebruiker heeft NOOIT iets opgenomen
WINBACK_TIERS = [7, 21, 45, 90]   # gebruiker was actief maar is inactief geworden


def select_reminder_tier(
    days_inactive: int,
    sent_tiers: set[int],
    tiers: list[int],
) -> int | None:
    """
    Kies de hoogste drempel die bereikt is (<= days_inactive) en nog niet is
    verstuurd. Dit is bestand tegen gemiste runs: draait de dagelijkse taak een
    dag niet, dan wordt de gemiste drempel alsnog opgepakt zodra hij weer draait.

    Returns de drempel om te versturen, of None als er niets te doen is.
    """
    candidates = [t for t in tiers if t <= days_inactive and t not in sent_tiers]
    return max(candidates) if candidates else None


def _sent_tiers_for(
    db: Session,
    *,
    user_id: str,
    journey_id: str,
    email_type: str,
) -> set[int]:
    """Verzamel de drempels die al voor dit type/journey zijn verstuurd."""
    events = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == email_type,
    ).all()
    return {
        e.context_data["tier"]
        for e in events
        if e.context_data and e.context_data.get("tier") is not None
    }


def _get_user_birthday_occasion(user: UserModel) -> tuple[str, str, str] | None:
    """Controleer of vandaag de verjaardag van de gebruiker is."""
    if not user.birth_year:
        return None
    # We kennen alleen het geboortejaar, niet de exacte datum — sla over
    return None


def _get_active_journeys(db: Session) -> list[tuple[UserModel, JourneyModel]]:
    """Haal alle actieve journeys op van geverifieerde, actieve gebruikers."""
    results = (
        db.query(UserModel, JourneyModel)
        .join(JourneyModel, JourneyModel.user_id == UserModel.id)
        .filter(
            UserModel.is_active,
            UserModel.email_verified,
            ~UserModel.email_bounced,
        )
        .all()
    )
    return results


# ---------------------------------------------------------------------------
# Celery Beat Tasks
# ---------------------------------------------------------------------------

@celery_app.task(name="email.weekly_questions")
def send_weekly_questions_task() -> None:
    """
    Elke maandag 09:00: stuur wekelijkse vraag naar alle actieve storytellers.
    Haal de volgende beschikbare chapter op en genereer een vraag.
    """
    logger.info("Starting weekly questions task")
    db: Session = SessionLocal()
    sent_count = 0

    try:
        pairs = _get_active_journeys(db)
        for user, journey in pairs:
            try:
                next_chapter = get_next_available_chapter(db, journey.id)
                if not next_chapter:
                    continue

                # Genereer fallback-vraag (snel, geen API call nodig voor scheduled task)
                try:
                    chapter_enum = ChapterId(next_chapter)
                    question = build_prompt_fallback(chapter_enum, [])
                except (ValueError, Exception):
                    question = "Vertel eens over een bijzonder moment dat je nooit vergeet."

                result = trigger_weekly_question_email(
                    db=db,
                    user_id=user.id,
                    journey_id=journey.id,
                    chapter_id=next_chapter,
                    question_text=question,
                )
                if result:
                    sent_count += 1

            except Exception as e:
                logger.error(f"Weekly question failed for user {user.id}: {e}")
                continue

    finally:
        db.close()

    logger.info(f"Weekly questions task complete: {sent_count} emails queued")


@celery_app.task(name="email.check_inactive_users")
def check_inactive_users_task() -> None:
    """
    Dagelijks: twee re-engagement sporen, beide drempel-gebaseerd en bestand
    tegen gemiste runs:

    1. Onboarding — gebruiker heeft NOOIT iets opgenomen: zachte zetjes op
       dag 1, 3 en 7 na registratie (first_memory_nudge).
    2. Win-back — gebruiker was actief maar is inactief: warme herinneringen
       op dag 7, 21, 45 en 90 sinds de laatste opname (inactivity_reminder).
    """
    logger.info("Starting inactivity check task")
    db: Session = SessionLocal()
    sent_count = 0
    now = datetime.now(timezone.utc)

    try:
        pairs = _get_active_journeys(db)
        for user, journey in pairs:
            try:
                latest_asset = (
                    db.query(MediaAssetModel)
                    .filter(MediaAssetModel.journey_id == journey.id)
                    .order_by(MediaAssetModel.recorded_at.desc())
                    .first()
                )

                never_recorded = latest_asset is None or latest_asset.recorded_at is None

                if never_recorded:
                    # Spoor 1: onboarding — meet vanaf registratie
                    created_at = user.created_at
                    if created_at and created_at.tzinfo is None:
                        created_at = created_at.replace(tzinfo=timezone.utc)
                    days_inactive = (now - created_at).days if created_at else 0
                    email_type = "first_memory_nudge"
                    tiers = ONBOARDING_TIERS
                else:
                    # Spoor 2: win-back — meet vanaf laatste opname
                    recorded_at = latest_asset.recorded_at
                    if recorded_at.tzinfo is None:
                        recorded_at = recorded_at.replace(tzinfo=timezone.utc)
                    days_inactive = (now - recorded_at).days
                    email_type = "inactivity_reminder"
                    tiers = WINBACK_TIERS

                sent_tiers = _sent_tiers_for(
                    db, user_id=user.id, journey_id=journey.id, email_type=email_type
                )
                tier = select_reminder_tier(days_inactive, sent_tiers, tiers)
                if tier is None:
                    continue

                next_chapter = get_next_available_chapter(db, journey.id)
                if not next_chapter:
                    continue

                try:
                    chapter_enum = ChapterId(next_chapter)
                    question = build_prompt_fallback(chapter_enum, [])
                except (ValueError, Exception):
                    question = "Vertel over een moment dat je nooit vergeet."

                if never_recorded:
                    result = trigger_first_memory_nudge_email(
                        db=db,
                        user_id=user.id,
                        journey_id=journey.id,
                        next_chapter_id=next_chapter,
                        first_question=question,
                        tier=tier,
                    )
                else:
                    result = trigger_inactivity_reminder_email(
                        db=db,
                        user_id=user.id,
                        journey_id=journey.id,
                        days_inactive=days_inactive,
                        next_chapter_id=next_chapter,
                        next_question=question,
                        tier=tier,
                    )
                if result:
                    sent_count += 1

            except Exception as e:
                logger.error(f"Inactivity check failed for user {user.id}: {e}")
                continue

    finally:
        db.close()

    logger.info(f"Inactivity check complete: {sent_count} reminders queued")


@celery_app.task(name="email.seasonal_triggers")
def send_seasonal_triggers_task() -> None:
    """
    Dagelijks: check of vandaag een seizoensdatum is en stuur relevante email.
    """
    logger.info("Starting seasonal triggers task")
    db: Session = SessionLocal()
    today = date.today()
    sent_count = 0

    try:
        matching = [
            (month, day, occasion, chapter_id, question)
            for month, day, occasion, chapter_id, question in SEASONAL_TRIGGERS
            if month == today.month and day == today.day
        ]

        if not matching:
            logger.debug(f"No seasonal triggers for {today}")
            return

        pairs = _get_active_journeys(db)
        for month, day, occasion, chapter_id, question in matching:
            for user, journey in pairs:
                try:
                    result = trigger_seasonal_email(
                        db=db,
                        user_id=user.id,
                        journey_id=journey.id,
                        occasion=occasion,
                        question_text=question,
                        chapter_id=chapter_id,
                    )
                    if result:
                        sent_count += 1
                except Exception as e:
                    logger.error(f"Seasonal trigger failed for user {user.id}: {e}")
                    continue

    finally:
        db.close()

    logger.info(f"Seasonal triggers complete: {sent_count} emails queued")


@celery_app.task(name="email.check_progress_milestones")
def check_progress_milestones_task(journey_id: str, user_id: str) -> None:
    """
    Triggered na elke nieuwe recording: check of een voortgangsmijlpaal bereikt is.
    Stuur email bij 25%, 50%, 75%.
    """
    db: Session = SessionLocal()
    try:
        progress = get_journey_progress(db, journey_id)
        percent = progress.get("percentComplete", 0)
        completed_count = progress.get("completedChapters", 0)
        total_count = progress.get("totalChapters", 30)

        for threshold in (25, 50, 75):
            if percent >= threshold:
                trigger_progress_milestone_email(
                    db=db,
                    user_id=user_id,
                    journey_id=journey_id,
                    percent=threshold,
                    completed_count=completed_count,
                    total_count=total_count,
                )

        # Het grote moment: alles voltooid — stuur de feestelijke voltooiingsmail
        if percent >= 100:
            trigger_journey_complete_email(
                db=db,
                user_id=user_id,
                journey_id=journey_id,
            )
    except Exception as e:
        logger.error(f"Progress milestone check failed for journey {journey_id}: {e}")
    finally:
        db.close()
