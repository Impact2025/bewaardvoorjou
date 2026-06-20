"""
BewaardVoorBaby — service layer.

Alle business-logica voor het aanmaken, bijhouden en ophalen van babyboeken,
mijlpalen, partner-uitnodigingen en opa/oma-digestbeheer.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import uuid4

from loguru import logger
from sqlalchemy.orm import Session

from app.models.baby_journey import (
    BabyJourney,
    BabyMilestone,
    MILESTONE_TYPES_ORDERED,
    MILESTONE_LABELS,
)
from app.models.journey import Journey
from app.models.user import User
from app.schemas.baby import (
    BabyJourneyCreate,
    BabyJourneyUpdate,
    BabyJourneyWithProgress,
    BabyMilestoneCreate,
    BabyMilestonePublic,
    GrandparentAdd,
    PhotobookVoucherStatus,
)
from app.schemas.common import ChapterId


# Maandelijkse chapter-ids in volgorde — bepaalt welk chapter een maand opent
MONTHLY_CHAPTER_IDS = [
    ChapterId.baby_birth_story.value,
    ChapterId.baby_week_one.value,
    ChapterId.baby_month_1.value,
    ChapterId.baby_month_2.value,
    ChapterId.baby_month_3.value,
    ChapterId.baby_month_4.value,
    ChapterId.baby_month_5.value,
    ChapterId.baby_month_6.value,
    ChapterId.baby_month_7.value,
    ChapterId.baby_month_8.value,
    ChapterId.baby_month_9.value,
    ChapterId.baby_month_10.value,
    ChapterId.baby_month_11.value,
    ChapterId.baby_month_12.value,
]

# Fotoboek-progressie: vereist 12 maand-hoofdstukken voltooid (exclusief week 1 en geboorte)
PHOTOBOOK_REQUIRED_CHAPTERS = MONTHLY_CHAPTER_IDS[2:]   # maand 1 t/m 12


# ---------------------------------------------------------------------------
# Journey aanmaken
# ---------------------------------------------------------------------------

def create_baby_journey(
    db: Session,
    user_id: str,
    payload: BabyJourneyCreate,
) -> BabyJourney:
    """
    Maakt een nieuwe BabyJourney aan, inclusief de onderliggende Journey.
    Roep aan nadat een BABY_GIFT order is ingewisseld.
    """
    # Maak de basis Journey
    journey = Journey(
        id=str(uuid4()),
        user_id=user_id,
        title=f"Bewaard voor {payload.baby_name}",
        progress={},
    )
    db.add(journey)
    db.flush()  # journey.id beschikbaar maken vóór BabyJourney-insert

    baby_journey = BabyJourney(
        journey_id=journey.id,
        user_id=user_id,
        order_id=payload.order_id,
        baby_name=payload.baby_name,
        narrator_role=payload.narrator_role,
        baby_birth_date=payload.baby_birth_date,
        birth_time_str=payload.birth_time_str,
        birth_weight_grams=payload.birth_weight_grams,
        birth_length_cm=payload.birth_length_cm,
        partner_email=payload.partner_email,
        grandparent_emails=payload.grandparent_emails or [],
        photobook_voucher_active=True,
    )
    db.add(baby_journey)
    db.commit()
    db.refresh(baby_journey)

    logger.info(f"BabyJourney aangemaakt voor user {user_id}, baby: {payload.baby_name}")
    return baby_journey


# ---------------------------------------------------------------------------
# Journey ophalen
# ---------------------------------------------------------------------------

def get_baby_journey_by_user(db: Session, user_id: str) -> BabyJourney | None:
    """Geeft de (eerste) actieve BabyJourney van een gebruiker terug."""
    return db.query(BabyJourney).filter(BabyJourney.user_id == user_id).first()


def get_baby_journey_by_id(db: Session, baby_journey_id: str) -> BabyJourney | None:
    return db.query(BabyJourney).filter(BabyJourney.id == baby_journey_id).first()


def get_baby_journey_with_progress(
    db: Session, user_id: str
) -> BabyJourneyWithProgress | None:
    bj = get_baby_journey_by_user(db, user_id)
    if not bj:
        return None

    milestones = db.query(BabyMilestone).filter(
        BabyMilestone.baby_journey_id == bj.id
    ).all()
    completed = len(milestones)
    total = len(MILESTONE_TYPES_ORDERED)

    # Fotoboek-progress: maand-hoofdstukken voltooid / 12
    journey = db.query(Journey).filter(Journey.id == bj.journey_id).first()
    progress_dict: dict = journey.progress if journey and journey.progress else {}
    photobook_done = sum(
        1 for cid in PHOTOBOOK_REQUIRED_CHAPTERS
        if progress_dict.get(cid, {}).get("completed")
    )
    photobook_pct = round((photobook_done / len(PHOTOBOOK_REQUIRED_CHAPTERS)) * 100)

    # Leeftijd in weken
    age_weeks: int | None = None
    if bj.baby_birth_date:
        delta = date.today() - bj.baby_birth_date
        age_weeks = delta.days // 7

    # Volgende chapter
    next_chapter_id, next_chapter_label = _next_chapter(age_weeks, progress_dict)

    completed_chapter_ids = [
        cid for cid in (progress_dict or {})
        if progress_dict.get(cid, {}).get("completed")
    ]

    base = BabyJourneyWithProgress.model_validate(bj)
    base.milestones_completed = completed
    base.milestones_total = total
    base.photobook_progress_pct = photobook_pct
    base.current_age_weeks = age_weeks
    base.next_chapter_id = next_chapter_id
    base.next_chapter_label = next_chapter_label
    base.completed_chapter_ids = completed_chapter_ids
    return base


def _next_chapter(
    age_weeks: int | None,
    progress_dict: dict,
) -> tuple[str | None, str | None]:
    """Geeft het eerste nog-niet-voltooide maand-chapter terug passend bij de leeftijd."""
    CHAPTER_LABELS = {
        ChapterId.baby_birth_story.value:  "De geboortedag",
        ChapterId.baby_week_one.value:     "De eerste week thuis",
        ChapterId.baby_month_1.value:      "Maand 1",
        ChapterId.baby_month_2.value:      "Maand 2",
        ChapterId.baby_month_3.value:      "Maand 3",
        ChapterId.baby_month_4.value:      "Maand 4",
        ChapterId.baby_month_5.value:      "Maand 5",
        ChapterId.baby_month_6.value:      "Maand 6",
        ChapterId.baby_month_7.value:      "Maand 7",
        ChapterId.baby_month_8.value:      "Maand 8",
        ChapterId.baby_month_9.value:      "Maand 9",
        ChapterId.baby_month_10.value:     "Maand 10",
        ChapterId.baby_month_11.value:     "Maand 11",
        ChapterId.baby_month_12.value:     "Maand 12",
    }
    # Bepaal hoeveel maand-chapters beschikbaar zijn op basis van leeftijd
    if age_weeks is None:
        available = 1  # alleen geboortedag
    elif age_weeks < 1:
        available = 1
    elif age_weeks < 4:
        available = 2  # + week 1
    else:
        months_old = min(age_weeks // 4, 12)
        available = 2 + months_old  # geboorte + week1 + maanden

    for cid in MONTHLY_CHAPTER_IDS[:available]:
        if not progress_dict.get(cid, {}).get("completed"):
            return cid, CHAPTER_LABELS.get(cid)
    return None, None


# ---------------------------------------------------------------------------
# Journey bijwerken
# ---------------------------------------------------------------------------

def update_baby_journey(
    db: Session,
    bj: BabyJourney,
    payload: BabyJourneyUpdate,
) -> BabyJourney:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(bj, field, value)
    bj.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(bj)
    return bj


# ---------------------------------------------------------------------------
# Mijlpalen
# ---------------------------------------------------------------------------

def mark_milestone(
    db: Session,
    baby_journey_id: str,
    payload: BabyMilestoneCreate,
    *,
    trigger_email: bool = True,
) -> BabyMilestone:
    """
    Markeert een mijlpaal. Dubbel markeren is idempotent — geeft bestaande terug.
    Als trigger_email=True: stuurt een verdiepende vraag-mail.
    """
    existing = db.query(BabyMilestone).filter(
        BabyMilestone.baby_journey_id == baby_journey_id,
        BabyMilestone.milestone_type == payload.milestone_type,
    ).first()

    if existing:
        # Update foto of notitie indien meegegeven
        if payload.photo_url:
            existing.photo_url = payload.photo_url
        if payload.notes:
            existing.notes = payload.notes
        if payload.milestone_date:
            existing.milestone_date = payload.milestone_date
        db.commit()
        db.refresh(existing)
        return existing

    milestone = BabyMilestone(
        baby_journey_id=baby_journey_id,
        milestone_type=payload.milestone_type,
        milestone_date=payload.milestone_date,
        notes=payload.notes,
        photo_url=payload.photo_url,
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    if trigger_email:
        _trigger_milestone_question_email(db, baby_journey_id, milestone)

    logger.info(f"Mijlpaal '{payload.milestone_type}' gemarkeerd voor journey {baby_journey_id}")
    return milestone


def get_milestones(db: Session, baby_journey_id: str) -> list[BabyMilestonePublic]:
    rows = db.query(BabyMilestone).filter(
        BabyMilestone.baby_journey_id == baby_journey_id
    ).order_by(BabyMilestone.marked_at).all()
    return [BabyMilestonePublic.from_orm_with_label(r) for r in rows]


def _trigger_milestone_question_email(
    db: Session,
    baby_journey_id: str,
    milestone: BabyMilestone,
) -> None:
    """Triggert een e-mail met een verdiepende vraag na het markeren van een mijlpaal."""
    bj = get_baby_journey_by_id(db, baby_journey_id)
    if not bj:
        return
    user = db.query(User).filter(User.id == bj.user_id).first()
    if not user:
        return

    from app.services.email.events import _create_email_event
    from app.services.email.processor import enqueue_email_job

    event = _create_email_event(
        db,
        user_id=bj.user_id,
        journey_id=bj.journey_id,
        email_type="baby_milestone_trigger",
        sent_to=user.email,
        context_data={
            "baby_name": bj.baby_name,
            "milestone_type": milestone.milestone_type,
            "milestone_label": MILESTONE_LABELS.get(milestone.milestone_type, milestone.milestone_type),
            "narrator_role": bj.narrator_role,
        },
    )
    milestone.email_triggered = True
    db.commit()
    enqueue_email_job(event.id)


# ---------------------------------------------------------------------------
# Partner & grootouders
# ---------------------------------------------------------------------------

def invite_partner(
    db: Session,
    bj: BabyJourney,
    partner_email: str,
    inviter_name: str,
) -> None:
    bj.partner_email = partner_email
    db.commit()

    # Stuur partner-uitnodiging
    from app.services.email.events import _create_email_event
    from app.services.email.processor import enqueue_email_job

    # Zoek of partner al een account heeft
    partner_user = db.query(User).filter(User.email == partner_email).first()
    target_user_id = partner_user.id if partner_user else bj.user_id  # fallback

    event = _create_email_event(
        db,
        user_id=target_user_id,
        journey_id=bj.journey_id,
        email_type="baby_partner_invite",
        sent_to=partner_email,
        context_data={
            "baby_name": bj.baby_name,
            "inviter_name": inviter_name,
            "baby_journey_id": bj.id,
        },
    )
    enqueue_email_job(event.id)
    logger.info(f"Partner-uitnodiging verstuurd naar {partner_email} voor baby {bj.baby_name}")


def add_grandparent(db: Session, bj: BabyJourney, entry: GrandparentAdd) -> BabyJourney:
    current: list = list(bj.grandparent_emails or [])
    # Deduplicate op e-mailadres
    if not any(g.get("email") == entry.email for g in current):
        current.append({
            "name": entry.name,
            "email": entry.email,
            "digest_active": entry.digest_active,
        })
        bj.grandparent_emails = current
        db.commit()
        db.refresh(bj)
        logger.info(f"Opa/oma {entry.email} toegevoegd aan baby journey {bj.id}")
    return bj


def remove_grandparent(db: Session, bj: BabyJourney, email: str) -> BabyJourney:
    current: list = list(bj.grandparent_emails or [])
    bj.grandparent_emails = [g for g in current if g.get("email") != email]
    db.commit()
    db.refresh(bj)
    return bj


# ---------------------------------------------------------------------------
# Fotoboek-voucher
# ---------------------------------------------------------------------------

def get_photobook_voucher_status(
    db: Session,
    bj: BabyJourney,
) -> PhotobookVoucherStatus:
    journey = db.query(Journey).filter(Journey.id == bj.journey_id).first()
    progress_dict: dict = journey.progress if journey and journey.progress else {}

    completed = sum(
        1 for cid in PHOTOBOOK_REQUIRED_CHAPTERS
        if progress_dict.get(cid, {}).get("completed")
    )
    total = len(PHOTOBOOK_REQUIRED_CHAPTERS)
    pct = round((completed / total) * 100)

    return PhotobookVoucherStatus(
        active=bj.photobook_voucher_active,
        claimed=bj.photobook_voucher_claimed,
        claimed_at=bj.photobook_voucher_claimed_at,
        milestones_completed=completed,
        milestones_total=total,
        progress_pct=pct,
        eligible_to_claim=(completed >= total and not bj.photobook_voucher_claimed),
    )


def claim_photobook_voucher(db: Session, bj: BabyJourney) -> PhotobookVoucherStatus:
    status = get_photobook_voucher_status(db, bj)
    if not status.eligible_to_claim:
        return status

    bj.photobook_voucher_claimed = True
    bj.photobook_voucher_claimed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(bj)

    # Stuur claim-bevestiging
    user = db.query(User).filter(User.id == bj.user_id).first()
    if user:
        from app.services.email.events import _create_email_event
        from app.services.email.processor import enqueue_email_job
        event = _create_email_event(
            db,
            user_id=bj.user_id,
            journey_id=bj.journey_id,
            email_type="baby_photobook_claimed",
            sent_to=user.email,
            context_data={"baby_name": bj.baby_name},
        )
        enqueue_email_job(event.id)

    return get_photobook_voucher_status(db, bj)


# ---------------------------------------------------------------------------
# AI prompt helper
# ---------------------------------------------------------------------------

def build_baby_prompt(
    chapter_id: str,
    baby_name: str,
    narrator_role: str,
    follow_up_history: list[str] | None = None,
) -> str:
    """
    Genereer een rol-bewuste interviewvraag voor een baby-chapter.
    Variant van build_prompt_with_ai, speciaal voor BewaardVoorBaby.
    """
    from app.services.ai.interviewer import CHAPTER_CONTEXTS, clean_ai_question
    from app.schemas.common import ChapterId as ChapterIdEnum
    from app.core.config import settings

    try:
        chapter_enum = ChapterIdEnum(chapter_id)
    except ValueError:
        return f"Vertel me iets bijzonders over {baby_name} dit moment."

    ctx = CHAPTER_CONTEXTS.get(chapter_enum)
    if not ctx:
        return f"Vertel me iets bijzonders over {baby_name} dit moment."

    # Kies de rol-specifieke voorbeeldvragen
    if narrator_role == "MOEDER" and "example_prompts_moeder" in ctx:
        examples = ctx["example_prompts_moeder"]
    elif narrator_role == "PARTNER" and "example_prompts_partner" in ctx:
        examples = ctx["example_prompts_partner"]
    else:
        examples = ctx.get("example_prompts", [])

    # Vervang [naam] door de babynaam
    examples = [p.replace("[naam]", baby_name) for p in examples]
    theme = ctx["theme"].replace("[naam]", baby_name)

    if not settings.openai_api_key:
        return examples[0] if examples else theme

    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url="https://openrouter.ai/api/v1",
        )
        role_hint = {
            "MOEDER": "De moeder zelf vertelt (ze was aan het bevallen, dus stel jij/jouw vragen vanuit haar beleving achteraf).",
            "PARTNER": "De partner vertelt (van buitenaf meekijkend).",
            "SAMEN": "Ouders vertellen samen.",
        }.get(narrator_role, "")

        prompt = f"""Je bent een warme, empathische interviewer die ouders helpt het eerste levensjaar van hun kind vast te leggen.

Baby's naam: {baby_name}
Hoofdstuk: "{ctx['title']}"
Context: {theme}
Stemming: {ctx['mood']}
Verteller: {role_hint}

Al gestelde vragen (vermijd herhaling):
{chr(10).join('- ' + q for q in (follow_up_history or []))}

Voorbeeldvragen voor inspiratie:
{chr(10).join('- ' + e for e in examples)}

Genereer ÉÉN open, warme vraag (max 20 woorden). Gebruik '{baby_name}' bij naam.
Gebruik informeel Nederlands (je/jij/jouw). Alleen de vraag zelf, geen uitleg."""

        response = client.chat.completions.create(
            model="anthropic/claude-3.5-sonnet",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.8,
        )
        raw = response.choices[0].message.content or ""
        return clean_ai_question(raw) or (examples[0] if examples else theme)

    except Exception as e:
        logger.warning(f"Baby AI prompt generation failed: {e}")
        return examples[0] if examples else theme
