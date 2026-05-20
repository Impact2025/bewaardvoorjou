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
        import premailer
        return premailer.transform(
            html,
            remove_classes=False,
            strip_important=False,
            allow_network=False,
        )
    except Exception as e:
        logger.warning(f"CSS inlining failed, using raw HTML: {e}")
        return html


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
