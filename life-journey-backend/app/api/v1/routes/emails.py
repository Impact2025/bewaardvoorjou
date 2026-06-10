"""Email preference and unsubscribe endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.email import EmailEvent as EmailEventModel, EmailPreference as EmailPreferenceModel
from app.models.user import User
from app.schemas.email import (
    EmailPreferenceResponse,
    EmailPreferenceUpdate,
    UnsubscribeResponse,
)
from app.services.email.preferences import get_or_create_preferences


router = APIRouter()


@router.get("/preferences", response_model=EmailPreferenceResponse, tags=["emails"])
def get_email_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmailPreferenceResponse:
    prefs = get_or_create_preferences(db, current_user.id)
    return EmailPreferenceResponse.model_validate(prefs)


@router.put("/preferences", response_model=EmailPreferenceResponse, tags=["emails"])
def update_email_preferences(
    payload: EmailPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmailPreferenceResponse:
    prefs = get_or_create_preferences(db, current_user.id)

    if payload.welcome_emails is not None:
        prefs.welcome_emails = payload.welcome_emails
    if payload.chapter_emails is not None:
        prefs.chapter_emails = payload.chapter_emails
    if payload.milestone_emails is not None:
        prefs.milestone_emails = payload.milestone_emails
    if payload.weekly_question_emails is not None:
        prefs.weekly_question_emails = payload.weekly_question_emails
    if payload.inactivity_reminders is not None:
        prefs.inactivity_reminders = payload.inactivity_reminders
    if payload.seasonal_emails is not None:
        prefs.seasonal_emails = payload.seasonal_emails
    if payload.family_notifications is not None:
        prefs.family_notifications = payload.family_notifications
    if payload.unsubscribed_all is not None:
        prefs.unsubscribed_all = payload.unsubscribed_all
        prefs.unsubscribed_at = datetime.now(timezone.utc) if payload.unsubscribed_all else None

    db.commit()
    db.refresh(prefs)
    return EmailPreferenceResponse.model_validate(prefs)


def _apply_unsubscribe(db: Session, token: str) -> bool:
    """
    Globally unsubscribe the user behind an email's unsubscribe token.

    The token is a random secret stored on the EmailEvent row — it cannot be
    guessed or forged, so no additional HMAC verification is needed.

    Returns True if a matching event was found and the user unsubscribed,
    False if the token is unknown (or already used — tokens are single-use).
    """
    event = db.query(EmailEventModel).filter(
        EmailEventModel.unsubscribe_token == token
    ).first()

    if not event:
        return False

    prefs = db.query(EmailPreferenceModel).filter(
        EmailPreferenceModel.user_id == event.user_id
    ).first()

    now = datetime.now(timezone.utc)
    if not prefs:
        prefs = EmailPreferenceModel(
            user_id=event.user_id,
            welcome_emails=False,
            chapter_emails=False,
            milestone_emails=False,
            unsubscribed_all=True,
            unsubscribed_at=now,
        )
        db.add(prefs)
    else:
        prefs.unsubscribed_all = True
        prefs.unsubscribed_at = now

    # Invalidate the token so it cannot be replayed.
    event.unsubscribe_token = None
    db.commit()
    return True


def _unsubscribe_page(found: bool) -> str:
    """A small, branded confirmation page shown after a one-click unsubscribe."""
    base = settings.app_base_url
    if found:
        heading = "Je bent uitgeschreven"
        message = (
            "Je ontvangt geen herinneringen of nieuwsbrieven meer van "
            "Bewaardvoorjou. Transactionele berichten (zoals inloglinks) "
            "blijven we wel sturen wanneer dat nodig is."
        )
    else:
        heading = "Deze afmeldlink is al gebruikt"
        message = (
            "Deze link is al een keer gebruikt of is verlopen. "
            "Waarschijnlijk sta je dus al uitgeschreven. Wil je je voorkeuren "
            "aanpassen? Dat kan altijd in je accountinstellingen."
        )

    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Afmelden — Bewaardvoorjou</title>
  <style>
    body {{
      margin: 0; padding: 48px 16px; background-color: #F2EDE3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      color: #1C1917;
    }}
    .card {{
      max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px;
      padding: 40px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }}
    .brand {{
      font-size: 13px; font-weight: 600; color: #92400E; letter-spacing: 0.8px;
      text-transform: uppercase; margin: 0 0 24px;
    }}
    h1 {{ font-size: 22px; margin: 0 0 14px; line-height: 1.3; }}
    p {{ font-size: 15px; color: #57534E; line-height: 1.7; margin: 0 0 24px; }}
    a.button {{
      display: inline-block; background-color: #B45309; color: #FFFFFF;
      text-decoration: none; padding: 13px 34px; border-radius: 10px;
      font-size: 15px; font-weight: 600;
    }}
  </style>
</head>
<body>
  <div class="card">
    <p class="brand">Bewaardvoorjou</p>
    <h1>{heading}</h1>
    <p>{message}</p>
    <a class="button" href="{base}">Terug naar Bewaardvoorjou</a>
  </div>
</body>
</html>"""


@router.get("/unsubscribe/{token}", response_class=HTMLResponse, tags=["emails"])
def unsubscribe_via_link(
    token: str,
    db: Session = Depends(get_db),
) -> HTMLResponse:
    """
    Human-facing unsubscribe link (the 'Afmelden' link in every email footer).

    Always returns a friendly branded page — even for an unknown/used token —
    so a recipient who clicks twice never lands on a scary error page.
    """
    found = _apply_unsubscribe(db, token)
    return HTMLResponse(content=_unsubscribe_page(found), status_code=200)


@router.post("/unsubscribe/{token}", response_model=UnsubscribeResponse, tags=["emails"])
def unsubscribe_one_click(
    token: str,
    db: Session = Depends(get_db),
) -> UnsubscribeResponse:
    """
    RFC 8058 one-click unsubscribe endpoint (List-Unsubscribe-Post header).
    Invoked by the mail client, not a human — returns JSON.
    """
    found = _apply_unsubscribe(db, token)
    if not found:
        raise HTTPException(status_code=404, detail="Ongeldige uitschrijflink")

    return UnsubscribeResponse(
        message="Je bent uitgeschreven voor alle e-mails van Bewaard voor jou.",
        unsubscribed=True,
    )
