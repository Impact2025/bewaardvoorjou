"""Email event triggers — all outbound email goes through here."""

from __future__ import annotations

import secrets
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from app.models.email import EmailEvent as EmailEventModel
from app.models.user import User as UserModel
from app.models.journey import Journey as JourneyModel
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

    from app.services.journey_progress import CHAPTER_ORDER, get_journey_progress
    total_chapters = len(CHAPTER_ORDER)
    progress = get_journey_progress(db, journey_id)
    completed_chapters = progress["completedChapters"]

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


def trigger_weekly_question_email(
    db: Session,
    user_id: str,
    journey_id: str,
    chapter_id: str,
    question_text: str,
) -> Optional[str]:
    """Queue een wekelijkse vraag email. Kern van het re-engagement systeem."""
    if not should_send_email(db, user_id, "weekly_question"):
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="weekly_question",
        sent_to=user.email,
        context_data={
            "chapter_id": chapter_id,
            "question_text": question_text,
        },
    )

    logger.info(f"Email queued: weekly_question for {chapter_id} to {user.email}")
    return enqueue_email_job(event.id)


def _tier_already_sent(
    db: Session,
    *,
    user_id: str,
    journey_id: str,
    email_type: str,
    tier: int,
) -> bool:
    """Check whether a tiered re-engagement email was already sent for this tier."""
    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == email_type,
    ).all()
    return any(
        e.context_data and e.context_data.get("tier") == tier
        for e in existing
    )


def trigger_inactivity_reminder_email(
    db: Session,
    user_id: str,
    journey_id: str,
    days_inactive: int,
    next_chapter_id: str,
    next_question: str,
    tier: int | None = None,
) -> Optional[str]:
    """
    Queue een inactiviteitsherinnering voor een gebruiker die al opnames heeft
    maar inactief is geworden. `tier` is de drempel (7/21/45/90 dagen) en wordt
    gebruikt voor deduplicatie — elke drempel wordt maximaal één keer verstuurd.
    """
    if not should_send_email(db, user_id, "inactivity_reminder"):
        return None

    effective_tier = tier if tier is not None else days_inactive
    if _tier_already_sent(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="inactivity_reminder",
        tier=effective_tier,
    ):
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="inactivity_reminder",
        sent_to=user.email,
        context_data={
            "days_inactive": days_inactive,
            "next_chapter_id": next_chapter_id,
            "next_question": next_question,
            "tier": effective_tier,
        },
    )

    logger.info(f"Email queued: inactivity_reminder (tier {effective_tier}d) to {user.email}")
    return enqueue_email_job(event.id)


def trigger_first_memory_nudge_email(
    db: Session,
    user_id: str,
    journey_id: str,
    next_chapter_id: str,
    first_question: str,
    tier: int,
) -> Optional[str]:
    """
    Queue een onboarding-zetje voor een gebruiker die nog NOOIT een opname maakte.
    `tier` is het aantal dagen sinds registratie (1/3/7) en dedupliceert per drempel.
    """
    if not should_send_email(db, user_id, "first_memory_nudge"):
        return None

    if _tier_already_sent(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="first_memory_nudge",
        tier=tier,
    ):
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="first_memory_nudge",
        sent_to=user.email,
        context_data={
            "next_chapter_id": next_chapter_id,
            "first_question": first_question,
            "tier": tier,
        },
    )

    logger.info(f"Email queued: first_memory_nudge (tier {tier}d) to {user.email}")
    return enqueue_email_job(event.id)


def trigger_journey_complete_email(
    db: Session,
    user_id: str,
    journey_id: str,
) -> Optional[str]:
    """Queue de feestelijke 'levensverhaal voltooid' email. Maximaal één keer."""
    if not should_send_email(db, user_id, "journey_complete"):
        return None

    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == "journey_complete",
    ).first()
    if existing:
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="journey_complete",
        sent_to=user.email,
    )

    logger.info(f"Email queued: journey_complete to {user.email}")
    return enqueue_email_job(event.id)


def trigger_seasonal_email(
    db: Session,
    user_id: str,
    journey_id: str,
    occasion: str,
    question_text: str,
    chapter_id: str,
) -> Optional[str]:
    """Queue een seizoensgebonden email (Moederdag, Kerst, verjaardag)."""
    if not should_send_email(db, user_id, "seasonal"):
        return None

    # Stuur elk seizoensmailtype maximaal 1x per jaar
    from datetime import date
    year = date.today().year
    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.email_type == "seasonal",
    ).all()
    if any(
        e.context_data
        and e.context_data.get("occasion") == occasion
        and e.context_data.get("year") == year
        for e in existing
    ):
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="seasonal",
        sent_to=user.email,
        context_data={
            "occasion": occasion,
            "question_text": question_text,
            "chapter_id": chapter_id,
            "year": year,
        },
    )

    logger.info(f"Email queued: seasonal ({occasion}) to {user.email}")
    return enqueue_email_job(event.id)


def trigger_progress_milestone_email(
    db: Session,
    user_id: str,
    journey_id: str,
    percent: int,
    completed_count: int = 0,
    total_count: int = 30,
) -> Optional[str]:
    """Queue een voortgangs-mijlpaal email bij 25%, 50%, 75% completion."""
    if not should_send_email(db, user_id, "progress_milestone"):
        return None

    existing = db.query(EmailEventModel).filter(
        EmailEventModel.user_id == user_id,
        EmailEventModel.journey_id == journey_id,
        EmailEventModel.email_type == "progress_milestone",
    ).all()
    if any(
        e.context_data and e.context_data.get("percent") == percent
        for e in existing
    ):
        return None

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        journey_id=journey_id,
        email_type="progress_milestone",
        sent_to=user.email,
        context_data={
            "percent": percent,
            "completed_count": completed_count,
            "total_count": total_count,
        },
    )

    logger.info(f"Email queued: progress_milestone ({percent}%) to {user.email}")
    return enqueue_email_job(event.id)


def trigger_family_invite_email(
    db: Session,
    recipient_email: str,
    recipient_name: str,
    inviter_name: str,
    role_label: str,
    invite_url: str,
    expires_date: str,
) -> Optional[str]:
    """Stuur een uitnodigingsemail naar een familielid (geen account vereist)."""
    from app.services.email.renderer import build_family_invite_email
    from app.services.email.client import send_email

    user = db.query(UserModel).filter(UserModel.email == recipient_email).first()

    if user and getattr(user, "email_bounced", False):
        logger.warning(f"Skipping family invite to bounced address {recipient_email}")
        return None

    try:
        subject, html, text = build_family_invite_email(
            recipient_name=recipient_name,
            inviter_name=inviter_name,
            role_label=role_label,
            invite_url=invite_url,
            expires_date=expires_date,
        )
        send_email(to=recipient_email, subject=subject, html=html, text=text)
        logger.info(f"Family invite email sent to {recipient_email}")
    except Exception as e:
        logger.error(f"Family invite email failed for {recipient_email}: {e}")
    return None


def trigger_family_notification_email(
    db: Session,
    recipient_email: str,
    recipient_name: str,
    storyteller_name: str,
    chapter_title: str,
    journey_id: str,
    share_url: str,
) -> Optional[str]:
    """Notificeer familie wanneer er een nieuw verhaal klaarstaat."""
    # Zoek de user met dit emailadres (hoeft geen account te hebben)
    user = db.query(UserModel).filter(UserModel.email == recipient_email).first()
    user_id = user.id if user else None

    if user_id and not should_send_email(db, user_id, "family_notification"):
        return None

    if user_id and getattr(user, "email_bounced", False):
        return None

    # Maak een minimaal event voor tracking (user_id mag None zijn bij guest)
    if user_id:
        event = _create_email_event(
            db,
            user_id=user_id,
            journey_id=journey_id,
            email_type="family_notification",
            sent_to=recipient_email,
            context_data={
                "recipient_name": recipient_name,
                "storyteller_name": storyteller_name,
                "chapter_title": chapter_title,
                "share_url": share_url,
            },
        )
        return enqueue_email_job(event.id)
    else:
        # Geen user — stuur direct zonder event tracking
        from app.services.email.renderer import build_family_notification_email
        from app.services.email.client import send_email
        try:
            subject, html, text = build_family_notification_email(
                recipient_name=recipient_name,
                storyteller_name=storyteller_name,
                chapter_title=chapter_title,
                share_url=share_url,
                unsubscribe_token="",
            )
            send_email(to=recipient_email, subject=subject, html=html, text=text)
        except Exception as e:
            logger.error(f"Family notification direct send failed: {e}")
        return None


def trigger_magic_link_email(
    db: Session,
    user_id: str,
    magic_link_url: str,
    gifter_name: Optional[str] = None,
    personal_message: Optional[str] = None,
) -> Optional[str]:
    """Queue een magic link email voor passwordless login."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        email_type="magic_link",
        sent_to=user.email,
        context_data={
            "magic_link_url": magic_link_url,
            "gifter_name": gifter_name,
            "personal_message": personal_message,
        },
    )

    logger.info(f"Email queued: magic_link to {user.email}")
    return enqueue_email_job(event.id)


def trigger_export_ready_email(
    db: Session,
    user_id: str,
    download_url: str,
    expires_hours: int = 24,
) -> Optional[str]:
    """Queue een export-klaar email met download link."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        return None

    event = _create_email_event(
        db,
        user_id=user_id,
        email_type="export_ready",
        sent_to=user.email,
        context_data={
            "download_url": download_url,
            "expires_hours": expires_hours,
        },
    )

    logger.info(f"Email queued: export_ready to {user.email}")
    return enqueue_email_job(event.id)
