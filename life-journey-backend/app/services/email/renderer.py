"""Email template renderer using Jinja2."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape
from loguru import logger

from app.core.config import settings
from app.services.email.chapter_names import get_chapter_name


# Template directory
TEMPLATE_DIR = Path(__file__).parent / "templates"

# Jinja2 environment
jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
    trim_blocks=True,
    lstrip_blocks=True,
)


def render_email(
    template_name: str,
    context: dict[str, Any],
    unsubscribe_token: str | None = None,
) -> tuple[str, str]:
    """
    Render an email template to HTML and plain text.

    Args:
        template_name: Template name without extension (e.g., "welcome")
        context: Template context variables
        unsubscribe_token: Optional unsubscribe token

    Returns:
        Tuple of (html_content, text_content)
    """
    # Add common context
    full_context = {
        **context,
        "app_base_url": settings.app_base_url,
        "unsubscribe_token": unsubscribe_token,
    }

    # Render HTML
    html_template = jinja_env.get_template(f"{template_name}.html")
    html_content = html_template.render(full_context)

    # Render plain text
    text_template = jinja_env.get_template(f"{template_name}.txt")
    text_content = text_template.render(full_context)

    return html_content, text_content


def build_welcome_email(
    user_display_name: str,
    journey_title: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    """
    Build welcome email content.

    Args:
        user_display_name: User's display name
        journey_title: Journey title
        unsubscribe_token: Unsubscribe token

    Returns:
        Tuple of (subject, html_content, text_content)
    """
    subject = f"Welkom bij je levensverhaal, {user_display_name}!"

    context = {
        "display_name": user_display_name,
        "journey_title": journey_title,
    }

    html, text = render_email("welcome", context, unsubscribe_token)

    logger.info(f"Built welcome email for user {user_display_name}")
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
    """
    Build chapter completion email content.

    Args:
        user_display_name: User's display name
        journey_title: Journey title
        chapter_id: Completed chapter ID
        completed_count: Number of completed chapters
        total_count: Total number of chapters
        next_chapter_id: Next chapter ID (if any)
        unsubscribe_token: Unsubscribe token

    Returns:
        Tuple of (subject, html_content, text_content)
    """
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

    logger.info(f"Built chapter complete email for {chapter_name}")
    return subject, html, text


def build_milestone_unlock_email(
    user_display_name: str,
    journey_title: str,
    milestone_type: str,
    unsubscribe_token: str,
) -> tuple[str, str, str]:
    """
    Build milestone unlock email content.

    Args:
        user_display_name: User's display name
        journey_title: Journey title
        milestone_type: "bonus" or "deep"
        unsubscribe_token: Unsubscribe token

    Returns:
        Tuple of (subject, html_content, text_content)
    """
    if milestone_type == "bonus":
        milestone_name = "Bonusvragen"
        milestone_description = "Extra vragen om je verhaal te verrijken"
    else:  # deep
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

    logger.info(f"Built milestone unlock email for {milestone_name}")
    return subject, html, text
