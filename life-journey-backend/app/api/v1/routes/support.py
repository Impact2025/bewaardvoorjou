"""Support / Helpdesk routes — voor niet-leden én leden."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db, get_optional_user
from app.core.rate_limiter import limiter
from app.models.support_ticket import SupportTicket, TicketMessage
from app.models.user import User
from app.schemas.support import (
    TicketCreateRequest,
    TicketListItem,
    TicketListResponse,
    TicketMessageResponse,
    TicketReplyRequest,
    TicketResponse,
    TicketStatusUpdate,
)
from app.services.email.client import ResendError, send_email


router = APIRouter()
admin_router = APIRouter(dependencies=[Depends(get_current_admin_user)])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ticket_to_response(ticket: SupportTicket, db: Session) -> TicketResponse:
    messages = (
        db.query(TicketMessage)
        .filter(TicketMessage.ticket_id == ticket.id)
        .order_by(TicketMessage.created_at)
        .all()
    )
    return TicketResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        category=ticket.category,
        subject=ticket.subject,
        status=ticket.status,
        priority=ticket.priority,
        guest_name=ticket.guest_name,
        guest_email=ticket.guest_email,
        user_id=ticket.user_id,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        resolved_at=ticket.resolved_at,
        messages=[
            TicketMessageResponse.model_validate(m)
            for m in messages
            if not m.is_internal  # Klanten zien geen interne notities
        ],
    )


def _send_confirmation_email(to: str, name: str, ticket_number: int, subject: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1a1a2e">We hebben je vraag ontvangen</h2>
      <p>Hallo {name},</p>
      <p>Bedankt voor je bericht. We hebben je vraag geregistreerd en reageren binnen <strong>1–2 werkdagen</strong>.</p>
      <div style="background:#f9f6f0;border-radius:12px;padding:16px;margin:20px 0">
        <p style="margin:0;font-size:14px;color:#666">Ticketnummer</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#e05c00">BVJ-{ticket_number:04d}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#444"><strong>Onderwerp:</strong> {subject}</p>
      </div>
      <p>Heb je een account? Dan kun je de status van je vraag volgen via je dashboard.</p>
      <p style="color:#888;font-size:12px;margin-top:32px">
        BewaardVoorJou.nl &bull; info@bewaardvoorjou.nl
      </p>
    </div>
    """
    text = f"Hallo {name}, je vraag is ontvangen (BVJ-{ticket_number:04d}). We reageren binnen 1–2 werkdagen."
    try:
        send_email(to=to, subject=f"Je vraag is ontvangen — BVJ-{ticket_number:04d}", html=html, text=text)
    except ResendError:
        pass  # Bevestigingsmail is best-effort; ticket is al aangemaakt


def _send_reply_notification(to: str, name: str, ticket_number: int, subject: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1a1a2e">Je hebt een reactie ontvangen</h2>
      <p>Hallo {name},</p>
      <p>Ons team heeft gereageerd op je vraag <strong>BVJ-{ticket_number:04d}</strong>: {subject}.</p>
      <p>Log in op je account om de reactie te lezen en eventueel te reageren.</p>
      <p style="color:#888;font-size:12px;margin-top:32px">
        BewaardVoorJou.nl &bull; info@bewaardvoorjou.nl
      </p>
    </div>
    """
    text = f"Hallo {name}, je hebt een reactie op je vraag BVJ-{ticket_number:04d}. Log in om te lezen."
    try:
        send_email(to=to, subject=f"Reactie op je vraag — BVJ-{ticket_number:04d}", html=html, text=text)
    except ResendError:
        pass


# ---------------------------------------------------------------------------
# Publieke endpoints (gasten + leden)
# ---------------------------------------------------------------------------

@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/hour")
def create_ticket(
    request: Request,
    payload: TicketCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
) -> TicketResponse:
    """Maak een nieuw supportticket aan. Werkt voor gasten én ingelogde leden."""
    # Gast: naam + email verplicht
    if current_user is None:
        if not payload.guest_name or not payload.guest_email:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Naam en e-mailadres zijn verplicht voor niet-leden",
            )
        submitter_name = payload.guest_name
        submitter_email = str(payload.guest_email)
    else:
        submitter_name = current_user.display_name or current_user.email
        submitter_email = current_user.email

    ticket = SupportTicket(
        user_id=current_user.id if current_user else None,
        guest_name=payload.guest_name if current_user is None else None,
        guest_email=str(payload.guest_email) if (current_user is None and payload.guest_email) else None,
        category=payload.category,
        subject=payload.subject,
        status="open",
        priority="normaal",
    )
    db.add(ticket)
    db.flush()  # Zodat ticket.id en ticket_number beschikbaar zijn

    first_message = TicketMessage(
        ticket_id=ticket.id,
        sender_type="klant",
        sender_name=submitter_name,
        content=payload.message,
        is_internal=False,
    )
    db.add(first_message)
    db.commit()
    db.refresh(ticket)

    _send_confirmation_email(
        to=submitter_email,
        name=submitter_name,
        ticket_number=ticket.ticket_number,
        subject=ticket.subject,
    )

    # Notificeer de eigenaar (info@bewaardvoorjou.nl) met de volledige vraag
    from app.services.email.admin import send_owner_ticket_notification

    send_owner_ticket_notification(
        ticket_number=ticket.ticket_number,
        category=ticket.category,
        subject=ticket.subject,
        message=payload.message,
        submitter_name=submitter_name,
        submitter_email=submitter_email,
    )

    return _ticket_to_response(ticket, db)


@router.get("/count")
def get_my_open_count(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
) -> dict:
    """Snel opvragen van het aantal openstaande tickets voor de badge in de nav."""
    if current_user is None:
        return {"open": 0}
    count = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.user_id == current_user.id,
            SupportTicket.status.in_(["open", "in_behandeling"]),
        )
        .count()
    )
    return {"open": count}


@router.get("/mine", response_model=TicketListResponse)
def list_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
) -> TicketListResponse:
    """Overzicht van tickets voor de ingelogde gebruiker."""
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inloggen vereist")

    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.user_id == current_user.id)
        .order_by(SupportTicket.created_at.desc())
        .all()
    )
    return TicketListResponse(
        tickets=[TicketListItem.model_validate(t) for t in tickets],
        total=len(tickets),
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
) -> TicketResponse:
    """Haal een ticket op. Leden zien alleen hun eigen tickets."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket niet gevonden")

    # Toegangscontrole: leden mogen alleen eigen tickets zien
    if current_user and ticket.user_id and ticket.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geen toegang tot dit ticket")

    return _ticket_to_response(ticket, db)


@router.post("/{ticket_id}/reply", response_model=TicketMessageResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/hour")
def reply_to_ticket(
    request: Request,
    ticket_id: str,
    payload: TicketReplyRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
) -> TicketMessageResponse:
    """Voeg een reactie toe aan een ticket (klant)."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket niet gevonden")

    if current_user and ticket.user_id and ticket.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geen toegang tot dit ticket")

    if ticket.status == "gesloten":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dit ticket is gesloten")

    sender_name = (
        current_user.display_name or current_user.email
        if current_user
        else ticket.guest_name or "Gast"
    )

    message = TicketMessage(
        ticket_id=ticket.id,
        sender_type="klant",
        sender_name=sender_name,
        content=payload.content,
        is_internal=False,
    )
    db.add(message)

    # Heropenen als het ticket opgelost was
    if ticket.status == "opgelost":
        ticket.status = "open"

    db.commit()
    db.refresh(message)
    return TicketMessageResponse.model_validate(message)


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@admin_router.get("/support", response_model=TicketListResponse)
def admin_list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
) -> TicketListResponse:
    """Admin: alle tickets met optionele statusfilter."""
    q = db.query(SupportTicket).order_by(SupportTicket.created_at.desc())
    if status_filter:
        q = q.filter(SupportTicket.status == status_filter)
    tickets = q.all()
    return TicketListResponse(
        tickets=[TicketListItem.model_validate(t) for t in tickets],
        total=len(tickets),
    )


@admin_router.get("/support/{ticket_id}", response_model=TicketResponse)
def admin_get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
) -> TicketResponse:
    """Admin: volledig ticket inclusief interne notities."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket niet gevonden")

    messages = (
        db.query(TicketMessage)
        .filter(TicketMessage.ticket_id == ticket.id)
        .order_by(TicketMessage.created_at)
        .all()
    )
    return TicketResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        category=ticket.category,
        subject=ticket.subject,
        status=ticket.status,
        priority=ticket.priority,
        guest_name=ticket.guest_name,
        guest_email=ticket.guest_email,
        user_id=ticket.user_id,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        resolved_at=ticket.resolved_at,
        messages=[TicketMessageResponse.model_validate(m) for m in messages],
    )


@admin_router.post("/support/{ticket_id}/reply", response_model=TicketMessageResponse, status_code=status.HTTP_201_CREATED)
def admin_reply_to_ticket(
    ticket_id: str,
    payload: TicketReplyRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
) -> TicketMessageResponse:
    """Admin: reageer op een ticket en stuur e-mail notificatie."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket niet gevonden")

    message = TicketMessage(
        ticket_id=ticket.id,
        sender_type="medewerker",
        sender_name=admin.display_name or "BewaardVoorJou Support",
        content=payload.content,
        is_internal=payload.is_internal,
    )
    db.add(message)

    # Status automatisch naar "in_behandeling" als het open was
    if ticket.status == "open" and not payload.is_internal:
        ticket.status = "in_behandeling"

    db.commit()
    db.refresh(message)

    # Stuur notificatie als het geen interne notitie is
    if not payload.is_internal:
        recipient_email = ticket.guest_email
        recipient_name = ticket.guest_name or "Klant"

        if ticket.user_id:
            from app.models.user import User as UserModel
            user = db.query(UserModel).filter(UserModel.id == ticket.user_id).first()
            if user:
                recipient_email = user.email
                recipient_name = user.display_name or user.email

        if recipient_email:
            _send_reply_notification(
                to=recipient_email,
                name=recipient_name,
                ticket_number=ticket.ticket_number,
                subject=ticket.subject,
            )

    return TicketMessageResponse.model_validate(message)


@admin_router.patch("/support/{ticket_id}/status", response_model=TicketResponse)
def admin_update_ticket_status(
    ticket_id: str,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
) -> TicketResponse:
    """Admin: wijzig status en/of prioriteit van een ticket."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket niet gevonden")

    ticket.status = payload.status
    if payload.priority:
        ticket.priority = payload.priority
    if payload.status == "opgelost":
        ticket.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(ticket)
    return _ticket_to_response(ticket, db)
