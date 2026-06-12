"""ensure_ticket_number_sequence (idempotent safety)

Garandeert dat de sequence supportticket_ticket_number_seq bestaat én als
DEFAULT op supportticket.ticket_number staat. Het model koppelt deze sequence
nu expliciet (Sequence -> nextval), maar als een eerdere migratie op een
omgeving niet (volledig) doorliep, ontbreekt de sequence en faalt elke INSERT
met een NOT NULL-violation. Deze migratie is volledig idempotent.

Revision ID: 20260612_ensure_ticket_seq
Revises: 20260610_email_engagement
Create Date: 2026-06-12
"""

revision = "20260612_ensure_ticket_seq"
down_revision = "20260610_email_engagement"
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.execute(sa.text("CREATE SEQUENCE IF NOT EXISTS supportticket_ticket_number_seq START 1"))
    op.execute(sa.text(
        "ALTER TABLE supportticket ALTER COLUMN ticket_number "
        "SET DEFAULT nextval('supportticket_ticket_number_seq'::regclass)"
    ))
    # Sequence-eigenaarschap koppelen aan de kolom (cosmetisch, voorkomt verweesde sequence)
    op.execute(sa.text(
        "ALTER SEQUENCE supportticket_ticket_number_seq "
        "OWNED BY supportticket.ticket_number"
    ))
    # Sequence gelijkzetten aan max+1 zodat we niet botsen met bestaande rijen
    op.execute(sa.text(
        "SELECT setval('supportticket_ticket_number_seq', "
        "COALESCE((SELECT MAX(ticket_number) FROM supportticket), 0) + 1, false)"
    ))


def downgrade() -> None:
    # Geen destructieve downgrade: de sequence/default zijn vereist voor correcte werking.
    pass
