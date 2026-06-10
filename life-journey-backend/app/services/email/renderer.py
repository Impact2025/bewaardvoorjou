"""Email template renderer with CSS inlining for cross-client compatibility."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape
from loguru import logger

from app.core.config import settings
from app.services.email.chapter_names import get_chapter_name


TEMPLATE_DIR = Path(__file__).parent / "templates"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
    trim_blocks=True,
    lstrip_blocks=True,
)


def _inline_css(html: str) -> str:
    """Inline CSS for Outlook and legacy email client compatibility."""
    try:
        import logging
        import premailer
        # cssutils emits spurious warnings for CSS3 values (gradients, transitions)
        logging.getLogger("cssutils").setLevel(logging.CRITICAL)
        return premailer.transform(
            html,
            remove_classes=False,
            strip_important=False,
            allow_network=False,
        )
    except Exception as e:
        logger.warning(f"CSS inlining failed, using raw HTML: {e}")
        return html


def truncate_subject(text: str, limit: int = 60) -> str:
    """
    Kort een onderwerpregel netjes in op een woordgrens.

    Voegt alleen een ellips toe wanneer er daadwerkelijk is ingekort, en knipt
    nooit midden in een woord af.
    """
    text = " ".join(text.split())  # normaliseer witruimte
    if len(text) <= limit:
        return text
    clipped = text[:limit].rsplit(" ", 1)[0].rstrip(",.;:!?-")
    if not clipped:  # één heel lang woord
        clipped = text[:limit]
    return f"{clipped}…"


def render_email(
    template_name: str,
    context: dict[str, Any],
    unsubscribe_token: str | None = None,
) -> tuple[str, str]:
    """
    Render an email template to HTML (with inlined CSS) and plain text.

    Returns:
        Tuple of (html_content, text_content)
    """
    full_context = {
        **context,
        "app_base_url": settings.app_base_url,
        "unsubscribe_token": unsubscribe_token,
    }

    html_template = jinja_env.get_template(f"{template_name}.html")
    raw_html = html_template.render(full_context)
    html_content = _inline_css(raw_html)

    text_template = jinja_env.get_template(f"{template_name}.txt")
    text_content = text_template.render(full_context)

    return html_content, text_content


def build_welcome_email(
    user_display_name: str,
    journey_title: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    subject = f"Welkom bij je levensverhaal, {user_display_name}!"
    context = {
        "display_name": user_display_name,
        "journey_title": journey_title,
    }
    html, text = render_email("welcome", context, unsubscribe_token)
    logger.info(f"Built welcome email for {user_display_name}")
    return subject, html, text


def build_chapter_complete_email(
    user_display_name: str,
    journey_title: str,
    chapter_id: str,
    completed_count: int,
    total_count: int,
    next_chapter_id: str | None,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    chapter_name = get_chapter_name(chapter_id)
    subject = f"Hoofdstuk voltooid: {chapter_name}"
    context = {
        "display_name": user_display_name,
        "journey_title": journey_title,
        "chapter_name": chapter_name,
        "completed_count": completed_count,
        "total_count": total_count,
        "progress_percentage": round((completed_count / total_count) * 100),
        "next_chapter_name": get_chapter_name(next_chapter_id) if next_chapter_id else None,
    }
    html, text = render_email("chapter_complete", context, unsubscribe_token)
    logger.info(f"Built chapter_complete email for {chapter_name}")
    return subject, html, text


def build_milestone_unlock_email(
    user_display_name: str,
    journey_title: str,
    milestone_type: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    if milestone_type == "bonus":
        milestone_name = "Bonusvragen"
        milestone_description = "Extra vragen om je verhaal te verrijken"
    else:
        milestone_name = "Verborgen Dimensies"
        milestone_description = "Diepgaande vragen voor een volledig portret"

    subject = f"Mijlpaal bereikt: {milestone_name} ontgrendeld!"
    context = {
        "display_name": user_display_name,
        "journey_title": journey_title,
        "milestone_name": milestone_name,
        "milestone_description": milestone_description,
        "milestone_type": milestone_type,
    }
    html, text = render_email("milestone_unlock", context, unsubscribe_token)
    logger.info(f"Built milestone_unlock email for {milestone_name}")
    return subject, html, text


def build_password_reset_email(
    user_display_name: str,
    reset_url: str,
) -> tuple[str, str, str]:
    subject = "Wachtwoord opnieuw instellen – Bewaard voor jou"
    context = {
        "display_name": user_display_name,
        "reset_url": reset_url,
    }
    html, text = render_email("password_reset", context)
    logger.info(f"Built password_reset email for {user_display_name}")
    return subject, html, text


def build_email_verification_email(
    user_display_name: str,
    verification_url: str,
) -> tuple[str, str, str]:
    subject = "Bevestig je e-mailadres – Bewaard voor jou"
    context = {
        "display_name": user_display_name,
        "verification_url": verification_url,
    }
    html, text = render_email("email_verification", context)
    logger.info(f"Built email_verification email for {user_display_name}")
    return subject, html, text


def build_weekly_question_email(
    user_display_name: str,
    chapter_id: str,
    question_text: str,
    journey_url: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    chapter_name = get_chapter_name(chapter_id)
    subject = f"Jouw vraag van deze week: {truncate_subject(question_text, 55)}"
    context = {
        "display_name": user_display_name,
        "chapter_name": chapter_name,
        "question_text": question_text,
        "journey_url": journey_url,
    }
    html, text = render_email("weekly_question", context, unsubscribe_token)
    return subject, html, text


def build_inactivity_reminder_email(
    user_display_name: str,
    days_inactive: int,
    next_chapter_id: str,
    next_question: str,
    journey_url: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    subject = f"Je verhaal wacht op je, {user_display_name}"
    context = {
        "display_name": user_display_name,
        "days_inactive": days_inactive,
        "next_chapter_name": get_chapter_name(next_chapter_id),
        "next_question": next_question,
        "journey_url": journey_url,
    }
    html, text = render_email("inactivity_reminder", context, unsubscribe_token)
    return subject, html, text


def build_seasonal_email(
    user_display_name: str,
    occasion: str,
    question_text: str,
    chapter_id: str,
    journey_url: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    occasion_subjects = {
        "moederdag": f"Op Moederdag: een vraag speciaal voor jou, {user_display_name}",
        "vaderdag": f"Op Vaderdag: een vraag speciaal voor jou, {user_display_name}",
        "kerst": f"Met kerst: deel een herinnering, {user_display_name}",
        "verjaardag": "Gefeliciteerd! Een bijzondere vraag op jouw dag",
        "oud_nieuw": "Een nieuw jaar, een nieuw verhaal — speciaal voor jou",
    }
    subject = occasion_subjects.get(occasion, f"Een bijzondere vraag voor jou, {user_display_name}")
    context = {
        "display_name": user_display_name,
        "occasion": occasion,
        "question_text": question_text,
        "chapter_name": get_chapter_name(chapter_id),
        "journey_url": journey_url,
    }
    html, text = render_email("seasonal", context, unsubscribe_token)
    return subject, html, text


def build_first_memory_nudge_email(
    user_display_name: str,
    tier: int,
    next_chapter_id: str,
    first_question: str,
    journey_url: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    # Toon escaleert zacht naarmate de dagen verstrijken zonder eerste opname
    subjects = {
        1: f"Klaar voor je eerste herinnering, {user_display_name}?",
        3: f"Je eerste verhaal in vijf minuten, {user_display_name}",
        7: f"Eén vraag, één herinnering — begin vandaag, {user_display_name}",
    }
    subject = subjects.get(tier, f"Begin je eerste herinnering, {user_display_name}")
    context = {
        "display_name": user_display_name,
        "tier": tier,
        "chapter_name": get_chapter_name(next_chapter_id),
        "first_question": first_question,
        "journey_url": journey_url,
    }
    html, text = render_email("first_memory_nudge", context, unsubscribe_token)
    return subject, html, text


def build_journey_complete_email(
    user_display_name: str,
    journey_title: str,
    total_count: int,
    journey_url: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    subject = f"Je hebt je levensverhaal voltooid, {user_display_name} 🎉"
    context = {
        "display_name": user_display_name,
        "journey_title": journey_title,
        "total_count": total_count,
        "journey_url": journey_url,
    }
    html, text = render_email("journey_complete", context, unsubscribe_token)
    logger.info(f"Built journey_complete email for {user_display_name}")
    return subject, html, text


def build_progress_milestone_email(
    user_display_name: str,
    journey_title: str,
    percent: int,
    completed_count: int,
    total_count: int,
    journey_url: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    subject = f"Geweldig! Je bent {percent}% van je verhaal klaar"
    context = {
        "display_name": user_display_name,
        "journey_title": journey_title,
        "percent": percent,
        "completed_count": completed_count,
        "total_count": total_count,
        "journey_url": journey_url,
    }
    html, text = render_email("progress_milestone", context, unsubscribe_token)
    return subject, html, text


def build_family_invite_email(
    recipient_name: str,
    inviter_name: str,
    role_label: str,
    invite_url: str,
    expires_date: str,
) -> tuple[str, str, str]:
    subject = f"{inviter_name} nodigt je uit voor hun levensverhaal"
    context = {
        "recipient_name": recipient_name,
        "inviter_name": inviter_name,
        "role_label": role_label,
        "invite_url": invite_url,
        "expires_date": expires_date,
    }
    html, text = render_email("family_invite", context)
    logger.info(f"Built family_invite email for {recipient_name}")
    return subject, html, text


def build_family_notification_email(
    recipient_name: str,
    storyteller_name: str,
    chapter_title: str,
    share_url: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    subject = f"{storyteller_name} heeft een nieuw verhaal gedeeld"
    context = {
        "recipient_name": recipient_name,
        "storyteller_name": storyteller_name,
        "chapter_title": chapter_title,
        "share_url": share_url,
    }
    html, text = render_email("family_notification", context, unsubscribe_token)
    return subject, html, text


def build_magic_link_email(
    user_display_name: str,
    magic_link_url: str,
    gifter_name: str | None = None,
    personal_message: str | None = None,
) -> tuple[str, str, str]:
    subject = (
        f"{gifter_name} heeft je iets bijzonders gegeven"
        if gifter_name
        else "Je persoonlijke toegangslink – Bewaardvoorjou"
    )
    context = {
        "display_name": user_display_name,
        "magic_link_url": magic_link_url,
        "gifter_name": gifter_name,
        "personal_message": personal_message,
    }
    html, text = render_email("magic_link", context)
    return subject, html, text


def build_waitlist_confirmation_email(
    email: str,
    package_name: str,
    available_from: str,
    guaranteed_discount_cents: int = 0,
) -> tuple[str, str, str]:
    subject = f"Je staat op de wachtlijst voor {package_name}"
    context = {
        "package_name": package_name,
        "available_from": available_from,
        "guaranteed_discount_euros": guaranteed_discount_cents // 100 if guaranteed_discount_cents else None,
    }
    html, text = render_email("waitlist_confirmation", context)
    logger.info(f"Built waitlist_confirmation email for {email} ({package_name})")
    return subject, html, text


def build_gift_card_buyer_email(
    buyer_email: str,
    recipient_name: str,
    gift_card_url: str,
    voucher_code: str,
) -> tuple[str, str, str]:
    subject = "Je Vaderdag cadeaukaart staat klaar! 🎁"
    context = {
        "recipient_name": recipient_name,
        "gift_card_url": gift_card_url,
        "voucher_code": voucher_code,
    }
    html, text = render_email("gift_card_buyer", context)
    logger.info(f"Built gift_card_buyer email for {buyer_email}")
    return subject, html, text


def build_gift_buyer_confirmation_email(
    buyer_email: str,
    recipient_name: str,
    recipient_email: str,
    package_name: str,
    order_id_short: str,
    shipping_city: str | None = None,
) -> tuple[str, str, str]:
    subject = f"Bedankt! Je cadeau voor {recipient_name} is verstuurd 🎁"
    context = {
        "recipient_name": recipient_name,
        "recipient_email": recipient_email,
        "package_name": package_name,
        "order_id_short": order_id_short,
        "shipping_city": shipping_city,
    }
    html, text = render_email("gift_buyer_confirmation", context)
    logger.info(f"Built gift_buyer_confirmation email for {buyer_email}")
    return subject, html, text


def build_export_ready_email(
    user_display_name: str,
    download_url: str,
    expires_hours: int,
) -> tuple[str, str, str]:
    subject = "Uw verhalen staan klaar voor download – Bewaard voor jou"
    context = {
        "display_name": user_display_name,
        "download_url": download_url,
        "expires_hours": expires_hours,
    }
    html, text = render_email("export_ready", context)
    return subject, html, text
