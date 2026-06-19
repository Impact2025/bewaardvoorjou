"""
Celery beat scheduled tasks voor re-engagement emails.

Taken:
- Wekelijkse vraag (elke maandag 09:00)
- Inactiviteitscheck (dagelijks)
- Seizoensgebonden triggers (dagelijks check)
- Voortgangs-mijlpaal check (na elke recording via media tasks)
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Callable

from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
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
    trigger_seasonal_email,
    trigger_progress_milestone_email,
)
from app.services.ai.interviewer import build_prompt_fallback
from app.schemas.common import ChapterId

from app.services.email.tasks import celery_app


# ---------------------------------------------------------------------------
# Seizoenskalender
# ---------------------------------------------------------------------------
# Moeder- en Vaderdag zijn *zwevende* feestdagen (2e zondag mei / 3e zondag
# juni) — geen vaste datum. We berekenen ze per jaar i.p.v. ze te hardcoden,
# zodat de mail altijd op de juiste zondag valt en niet op een willekeurige
# weekdag. Kerst en oud & nieuw zijn wél vaste datums.


def _nth_weekday_of_month(year: int, month: int, weekday: int, n: int) -> date:
    """De n-de `weekday` (ma=0 … zo=6) van een maand. n=1 is de eerste."""
    first = date(year, month, 1)
    offset = (weekday - first.weekday()) % 7
    return date(year, month, 1) + timedelta(days=offset + (n - 1) * 7)


def mothers_day(year: int) -> date:
    """Moederdag NL/BE: tweede zondag van mei."""
    return _nth_weekday_of_month(year, 5, 6, 2)


def fathers_day(year: int) -> date:
    """Vaderdag NL/BE: derde zondag van juni."""
    return _nth_weekday_of_month(year, 6, 6, 3)


@dataclass(frozen=True)
class SeasonalTrigger:
    """Eén seizoensgebonden e-mailmoment.

    `resolve_date` levert de datum voor een gegeven jaar — vast of zwevend.
    `audience` bepaalt naar wie de mail gaat (zie _matches_audience).
    """
    occasion: str
    chapter_id: str
    question: str
    resolve_date: Callable[[int], date]
    audience: str = "all"


SEASONAL_TRIGGERS: list[SeasonalTrigger] = [
    SeasonalTrigger(
        "moederdag", "family-children",
        "Wat was het mooiste moment dat je als moeder hebt beleefd?",
        mothers_day, audience="mothers",
    ),
    SeasonalTrigger(
        "vaderdag", "family-children",
        "Wat heeft het vaderschap jou geleerd over jezelf?",
        fathers_day, audience="fathers",
    ),
    SeasonalTrigger(
        "kerst", "roots-siblings",
        "Hoe zag kerst eruit in je kindertijd — wat mis je het meest?",
        lambda y: date(y, 12, 24),
    ),
    SeasonalTrigger(
        "oud_nieuw", "future-dream",
        "Als je terugkijkt op dit jaar — wat was het mooiste moment?",
        lambda y: date(y, 12, 31),
    ),
]


def _seasonal_triggers_for(today: date) -> list[SeasonalTrigger]:
    """Alle seizoenstriggers die vandaag (in het lopende jaar) vallen."""
    return [t for t in SEASONAL_TRIGGERS if t.resolve_date(today.year) == today]


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


def _journey_activity_key(journey: JourneyModel) -> datetime:
    """Sorteersleutel: laatste activiteit van een journey (tz-aware UTC)."""
    moment = journey.updated_at or journey.created_at
    if moment is None:
        return datetime.min.replace(tzinfo=timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment


def _one_journey_per_user(
    pairs: list[tuple[UserModel, JourneyModel]],
) -> list[tuple[UserModel, JourneyModel]]:
    """Dedupliceer naar één (meest recent actieve) journey per gebruiker.

    Een gebruiker met meerdere journeys zou anders per journey een aparte
    re-engagement-mail krijgen. We kiezen de journey met de laatste activiteit.
    """
    best: dict[str, tuple[UserModel, JourneyModel]] = {}
    for user, journey in pairs:
        current = best.get(user.id)
        if current is None or _journey_activity_key(journey) > _journey_activity_key(current[1]):
            best[user.id] = (user, journey)
    return list(best.values())


def _matches_audience(user: UserModel, audience: str) -> bool:
    """Bepaal of een gebruiker tot de doelgroep van een seizoenstrigger hoort.

    Op dit moment kent het datamodel nog geen rol-/oudersignaal, dus
    'mothers'/'fathers' gedragen zich nog als 'all'. Dit is het enige
    filterpunt: zodra `User.parent_role` bestaat (zie targeting-plan) wordt
    hier daadwerkelijk gefilterd zonder de rest van de flow te raken.
    """
    if audience == "all":
        return True
    # TODO(targeting): filter op parent_role zodra het veld beschikbaar is.
    return True


# ---------------------------------------------------------------------------
# Celery Beat Tasks
# ---------------------------------------------------------------------------

@celery_app.task(name="email.weekly_questions")
def send_weekly_questions_task() -> None:
    """
    Elke maandag 09:00: stuur wekelijkse vraag naar alle actieve storytellers.
    Haal de volgende beschikbare chapter op en genereer een vraag.

    - Eén mail per gebruiker (niet per journey).
    - Op een dag die ook een seizoensmoment is, slaan we de wekelijkse vraag
      over: de speciale (Moeder-/Vaderdag/kerst-)mail krijgt voorrang.
    """
    logger.info("Starting weekly questions task")
    db: Session = SessionLocal()
    sent_count = 0

    if _seasonal_triggers_for(date.today()):
        logger.info("Weekly questions skipped: today is a seasonal email day")
        return

    try:
        pairs = _one_journey_per_user(_get_active_journeys(db))
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
    Dagelijks: check users die 7 of 21 dagen geen recording hebben gemaakt.
    Stuur een warme herinnering met de volgende vraag.
    """
    logger.info("Starting inactivity check task")
    db: Session = SessionLocal()
    sent_count = 0
    now = datetime.now(timezone.utc)

    try:
        pairs = _one_journey_per_user(_get_active_journeys(db))
        for user, journey in pairs:
            try:
                # Haal datum van laatste recording op
                latest_asset = (
                    db.query(MediaAssetModel)
                    .filter(MediaAssetModel.journey_id == journey.id)
                    .order_by(MediaAssetModel.recorded_at.desc())
                    .first()
                )

                if latest_asset and latest_asset.recorded_at:
                    recorded_at = latest_asset.recorded_at
                    if recorded_at.tzinfo is None:
                        recorded_at = recorded_at.replace(tzinfo=timezone.utc)
                    days_inactive = (now - recorded_at).days
                elif not latest_asset:
                    # Nooit een recording gemaakt — gebruik account aanmaakdatum
                    created_at = user.created_at
                    if created_at and created_at.tzinfo is None:
                        created_at = created_at.replace(tzinfo=timezone.utc)
                    days_inactive = (now - created_at).days if created_at else 0
                else:
                    continue

                # Stuur reminder bij 7 en 21 dagen inactiviteit
                if days_inactive not in (7, 21):
                    continue

                next_chapter = get_next_available_chapter(db, journey.id)
                if not next_chapter:
                    continue

                try:
                    chapter_enum = ChapterId(next_chapter)
                    next_question = build_prompt_fallback(chapter_enum, [])
                except (ValueError, Exception):
                    next_question = "Vertel over een moment dat je nooit vergeet."

                result = trigger_inactivity_reminder_email(
                    db=db,
                    user_id=user.id,
                    journey_id=journey.id,
                    days_inactive=days_inactive,
                    next_chapter_id=next_chapter,
                    next_question=next_question,
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
        matching = _seasonal_triggers_for(today)

        if not matching:
            logger.debug(f"No seasonal triggers for {today}")
            return

        pairs = _one_journey_per_user(_get_active_journeys(db))
        for trigger in matching:
            for user, journey in pairs:
                if not _matches_audience(user, trigger.audience):
                    continue
                try:
                    result = trigger_seasonal_email(
                        db=db,
                        user_id=user.id,
                        journey_id=journey.id,
                        occasion=trigger.occasion,
                        question_text=trigger.question,
                        chapter_id=trigger.chapter_id,
                    )
                    if result:
                        sent_count += 1
                except Exception as e:
                    logger.error(f"Seasonal trigger failed for user {user.id}: {e}")
                    continue

    finally:
        db.close()

    logger.info(f"Seasonal triggers complete: {sent_count} emails queued")


@celery_app.task(name="admin.daily_health_report")
def send_daily_health_report_task() -> None:
    """
    Dagelijks: stuur de eigenaar (info@bewaardvoorjou.nl) een systeemrapport
    met verkopen/omzet, nieuwe accounts, e-mailgezondheid en waarschuwingen.
    """
    logger.info("Starting daily health report task")
    from app.services.email.admin import send_daily_health_report

    db: Session = SessionLocal()
    try:
        send_daily_health_report(db)
    except Exception as e:
        logger.error(f"Daily health report task failed: {e}")
    finally:
        db.close()


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
    except Exception as e:
        logger.error(f"Progress milestone check failed for journey {journey_id}: {e}")
    finally:
        db.close()


@celery_app.task(name="baby.weekly_questions")
def send_baby_weekly_questions_task() -> None:
    """
    Elke maandag 09:00: stuur wekelijkse herinneringsvraag naar alle actieve
    babyboek-ouders. Schakelt na maand 3 automatisch over naar maandelijks.
    """
    from app.models.baby_journey import BabyJourney as BabyJourneyModel
    from app.services.baby.journey import build_baby_prompt, MONTHLY_CHAPTER_IDS, _next_chapter
    from app.services.email.events import trigger_baby_weekly_question_email

    logger.info("Starting baby weekly questions task")
    db: Session = SessionLocal()
    sent = 0
    today = date.today()

    try:
        baby_journeys = (
            db.query(BabyJourneyModel)
            .join(UserModel, UserModel.id == BabyJourneyModel.user_id)
            .filter(
                UserModel.is_active,
                UserModel.email_verified,
                ~UserModel.email_bounced,
            )
            .all()
        )

        for bj in baby_journeys:
            try:
                # Leeftijd in weken
                age_weeks: int | None = None
                if bj.baby_birth_date:
                    delta = today - bj.baby_birth_date
                    age_weeks = delta.days // 7

                # Na maand 3 → maandelijks i.p.v. wekelijks
                if bj.pivot_to_monthly:
                    # Sla wekelijkse taken over — de maandelijkse beat-task regelt dit
                    continue

                if age_weeks is not None and age_weeks > 13 and not bj.pivot_to_monthly:
                    bj.pivot_to_monthly = True
                    bj.pivot_triggered_at = datetime.now(timezone.utc)
                    db.commit()
                    continue

                from app.models.journey import Journey as JourneyModel2
                journey = db.query(JourneyModel2).filter(JourneyModel2.id == bj.journey_id).first()
                progress_dict = journey.progress if journey and journey.progress else {}

                next_chapter_id, _ = _next_chapter(age_weeks, progress_dict)
                if not next_chapter_id:
                    continue

                question = build_baby_prompt(
                    next_chapter_id,
                    bj.baby_name,
                    bj.narrator_role,
                )
                dashboard_url = f"{settings.app_base_url}/baby/dashboard"

                result = trigger_baby_weekly_question_email(
                    db=db,
                    user_id=bj.user_id,
                    journey_id=bj.journey_id,
                    baby_name=bj.baby_name,
                    chapter_id=next_chapter_id,
                    question_text=question,
                    dashboard_url=dashboard_url,
                    age_weeks=age_weeks,
                )
                if result:
                    bj.last_weekly_email_at = datetime.now(timezone.utc)
                    db.commit()
                    sent += 1

            except Exception as e:
                logger.error(f"Baby weekly question failed for baby journey {bj.id}: {e}")
                continue

    finally:
        db.close()

    logger.info(f"Baby weekly questions task complete: {sent} emails queued")


@celery_app.task(name="baby.grandparent_digest")
def send_baby_grandparent_digest_task() -> None:
    """
    Maandelijks (1e van de maand): stuur opa/oma een digest van de nieuwe mijlpalen.
    """
    from app.models.baby_journey import BabyJourney as BabyJourneyModel, BabyMilestone as BabyMilestoneModel, MILESTONE_LABELS
    from app.services.email.renderer import build_baby_grandparent_digest_email
    from app.services.email.audit import log_and_send

    logger.info("Starting baby grandparent digest task")
    db: Session = SessionLocal()
    sent = 0
    today = date.today()

    try:
        baby_journeys = db.query(BabyJourneyModel).filter(
            BabyJourneyModel.grandparent_emails.isnot(None),
        ).all()

        for bj in baby_journeys:
            grandparents = bj.grandparent_emails or []
            if not grandparents:
                continue

            # Mijlpalen van de afgelopen maand
            month_ago = datetime(today.year, today.month, 1, tzinfo=timezone.utc)
            recent_milestones = db.query(BabyMilestoneModel).filter(
                BabyMilestoneModel.baby_journey_id == bj.id,
                BabyMilestoneModel.marked_at >= month_ago,
            ).all()

            if not recent_milestones:
                continue

            age_weeks: int | None = None
            if bj.baby_birth_date:
                age_weeks = (today - bj.baby_birth_date).days // 7

            milestones_data = [
                {
                    "label": MILESTONE_LABELS.get(m.milestone_type, m.milestone_type),
                    "date": m.milestone_date.strftime("%d %B") if m.milestone_date else None,
                }
                for m in recent_milestones
            ]

            digest_url = f"{settings.app_base_url}/baby/shared/{bj.id}"

            for gp in grandparents:
                if not gp.get("digest_active"):
                    continue
                gp_email = gp.get("email", "")
                gp_name = gp.get("name", "")
                if not gp_email:
                    continue
                try:
                    subject, html, text = build_baby_grandparent_digest_email(
                        grandparent_name=gp_name,
                        baby_name=bj.baby_name,
                        age_weeks=age_weeks,
                        milestones_this_month=milestones_data,
                        highlight_snippet=None,
                        digest_url=digest_url,
                    )
                    log_and_send(
                        db,
                        email_type="baby_grandparent_digest",
                        to=gp_email,
                        subject=subject,
                        html=html,
                        text=text,
                        user_id=bj.user_id,
                        journey_id=bj.journey_id,
                        context_data={"baby_name": bj.baby_name, "grandparent_email": gp_email},
                    )
                    sent += 1
                except Exception as e:
                    logger.error(f"Grandparent digest failed for {gp_email}: {e}")

            bj.last_grandparent_digest_at = datetime.now(timezone.utc)
            db.commit()

    finally:
        db.close()

    logger.info(f"Baby grandparent digest complete: {sent} emails sent")


@celery_app.task(name="baby.check_first_birthday")
def check_baby_first_birthday_task() -> None:
    """Dagelijks: check welke baby's vandaag 1 jaar worden en stuur verjaardagsmail + golden ticket."""
    from app.models.baby_journey import BabyJourney as BabyJourneyModel
    from app.services.email.events import trigger_baby_first_birthday_email
    from app.services.baby.journey import get_photobook_voucher_status

    logger.info("Starting baby first birthday check task")
    db: Session = SessionLocal()
    today = date.today()
    first_birthday = today.replace(year=today.year - 1)
    sent = 0

    try:
        turning_one = db.query(BabyJourneyModel).filter(
            BabyJourneyModel.baby_birth_date == first_birthday,
        ).all()

        for bj in turning_one:
            try:
                status = get_photobook_voucher_status(db, bj)
                dashboard_url = f"{settings.app_base_url}/baby/dashboard"
                golden_ticket_url = f"{settings.app_base_url}/cadeau?utm_source=golden_ticket&ref={bj.user_id}"

                result = trigger_baby_first_birthday_email(
                    db=db,
                    user_id=bj.user_id,
                    journey_id=bj.journey_id,
                    baby_name=bj.baby_name,
                    photobook_progress_pct=status.progress_pct,
                    dashboard_url=dashboard_url,
                    golden_ticket_url=golden_ticket_url,
                )
                if result:
                    sent += 1
            except Exception as e:
                logger.error(f"First birthday check failed for baby journey {bj.id}: {e}")

    finally:
        db.close()

    logger.info(f"Baby first birthday check complete: {sent} emails queued")


@celery_app.task(name="email.scheduled_gift_redemptions")
def send_scheduled_gift_redemptions_task() -> None:
    """Dagelijks: verstuur cadeau-uitnodigingen waarvan het bezorgmoment is bereikt.

    Voor cadeaus met een toekomstig bezorgmoment (bijv. 'vóór Vaderdag') wordt de
    ontvanger-uitnodiging pas op de dag zelf verstuurd. Idempotent via
    order.redemption_email_sent_at — een order wordt nooit dubbel gemaild.
    """
    from app.models.order import Order as OrderModel
    from app.api.v1.routes.webhooks import _send_storyteller_magic_link

    logger.info("Starting scheduled gift redemptions task")
    db: Session = SessionLocal()
    sent = 0
    try:
        today = date.today()
        orders = (
            db.query(OrderModel)
            .filter(
                OrderModel.status.in_(["PAID", "FULFILLED"]),
                OrderModel.recipient_email.isnot(None),
                OrderModel.redemption_email_sent_at.is_(None),
                OrderModel.delivery_date.isnot(None),
                OrderModel.delivery_date <= today,
            )
            .all()
        )
        for order in orders:
            contact_email = order.guest_email or ""
            if not contact_email and order.user_id:
                user = db.query(UserModel).filter(UserModel.id == order.user_id).first()
                if user:
                    contact_email = user.email
            try:
                _send_storyteller_magic_link(
                    db,
                    order.recipient_email,
                    order.recipient_name or "je dierbare",
                    contact_email,
                    package_type=order.package_type,
                    personal_message=order.personal_message,
                )
                order.redemption_email_sent_at = datetime.now(timezone.utc)
                db.commit()
                sent += 1
            except Exception as e:
                logger.error(f"Geplande redemption-mail mislukt voor order {order.id}: {e}")
                db.rollback()
        logger.info(f"Geplande cadeau-redemptions verzonden: {sent}")
    except Exception as e:
        logger.error(f"Scheduled gift redemptions task failed: {e}")
    finally:
        db.close()
