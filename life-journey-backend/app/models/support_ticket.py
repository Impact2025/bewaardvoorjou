from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Sequence, String, Text
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql.functions import next_value

from app.models.base import Base


@compiles(next_value, "sqlite")
def _sqlite_next_value(element, compiler, **kw):
    """SQLite kent geen sequences. Alleen voor de test-DB (sqlite) compileren we
    nextval() naar NULL, zodat `create_all` de SupportTicket-tabel kan aanmaken.
    Op Postgres (productie) blijft het echte sequence-gedrag ongewijzigd.
    """
    return "NULL"


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid4())


class SupportTicket(Base):
    id = Column(String, primary_key=True, default=generate_uuid)

    # Human-readable number (BVJ-0001). De sequence wordt door de migraties aangemaakt
    # (supportticket_ticket_number_seq). Door de Sequence ook hier te koppelen haalt
    # SQLAlchemy zelf nextval() op bij elke INSERT — anders stuurt de ORM expliciet
    # NULL mee, wat de DB-default overschrijft en een NOT NULL-violation geeft.
    _ticket_number_seq = Sequence("supportticket_ticket_number_seq")
    ticket_number = Column(
        Integer,
        _ticket_number_seq,
        server_default=_ticket_number_seq.next_value(),
        nullable=False,
        unique=True,
    )

    # Ingelogde gebruiker (optioneel — gasten hebben geen user_id)
    user_id = Column(String, ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True)

    # Gastvelden (niet-leden)
    guest_name = Column(String(128), nullable=True)
    guest_email = Column(String(255), nullable=True, index=True)

    # Ticket inhoud
    category = Column(String(32), nullable=False, default="overig", index=True)
    # categorieen: technisch, account, privacy, abonnement, overig
    subject = Column(String(255), nullable=False)

    # Status: open, in_behandeling, opgelost, gesloten
    status = Column(String(32), nullable=False, default="open", index=True)

    # Prioriteit: laag, normaal, hoog, urgent
    priority = Column(String(16), nullable=False, default="normaal", index=True)

    # Tijdstempels
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
    resolved_at = Column(DateTime, nullable=True)


class TicketMessage(Base):
    id = Column(String, primary_key=True, default=generate_uuid)
    ticket_id = Column(String, ForeignKey("supportticket.id", ondelete="CASCADE"), nullable=False, index=True)

    # sender_type: klant, medewerker, systeem
    sender_type = Column(String(16), nullable=False)
    sender_name = Column(String(128), nullable=False)

    content = Column(Text, nullable=False)

    # Interne notities zijn alleen zichtbaar voor medewerkers
    is_internal = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)
