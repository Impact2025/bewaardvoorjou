"""Audit-gelogde transactionele e-mail.

Eén plek waardoor élke directe (niet template-gestuurde) mail loopt, zodat er
voor iedere verzending een EmailEvent-rij ontstaat met status, resend_id en een
eventuele foutmelding — net als de magic-link/nieuwsbrief-mails. Hierdoor is in
de database terug te zien of bijvoorbeeld de koper-bevestiging of de eigenaar-
verkoopmelding daadwerkelijk is afgeleverd.

Bewust synchroon (geen Celery): deze mails werden voorheen ook synchroon
verstuurd. De Resend-client doet zelf al retries op 429/5xx. De helper faalt
nooit hard: een mislukte mail mag de betaal-/orderverwerking nooit blokkeren.
"""

from __future__ import annotations

from datetime import datetime, timezone

from loguru import logger
from sqlalchemy.orm import Session

from app.models.email import EmailEvent as EmailEventModel
from app.services.email.client import EmailBouncedError, send_email


def log_and_send(
    db: Session,
    *,
    email_type: str,
    to: str,
    subject: str,
    html: str,
    text: str | None = None,
    user_id: str | None = None,
    order_id: str | None = None,
    journey_id: str | None = None,
    context_data: dict | None = None,
    unsubscribe_url: str | None = None,
    email_bounced: bool = False,
) -> str | None:
    """Leg een EmailEvent vast en verstuur de mail; werk de status bij.

    Returns:
        De Resend message-id bij succes, anders None. Gooit nooit een exception.
    """
    event = EmailEventModel(
        user_id=user_id,
        journey_id=journey_id,
        order_id=order_id,
        email_type=email_type,
        sent_to=to,
        status="pending",
        context_data=context_data,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    try:
        message_id = send_email(
            to=to,
            subject=subject,
            html=html,
            text=text,
            unsubscribe_url=unsubscribe_url,
            email_bounced=email_bounced,
        )
        event.status = "sent"
        event.resend_id = message_id
        event.sent_at = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"{email_type} verstuurd naar {to} | resend_id={message_id}")
        return message_id

    except EmailBouncedError as exc:
        event.status = "failed"
        event.error_message = str(exc)[:500]
        db.commit()
        logger.warning(f"{email_type} onderdrukt (hard bounce) voor {to}")
        return None

    except Exception as exc:  # noqa: BLE001 — mag nooit de orderverwerking breken
        event.status = "failed"
        event.error_message = str(exc)[:500]
        try:
            db.commit()
        except Exception:
            db.rollback()
        logger.error(f"{email_type} faalde voor {to}: {exc}")
        return None
