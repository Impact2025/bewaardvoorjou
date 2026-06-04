"""fix_ticket_number_sequence

Adds a PostgreSQL sequence as the default for supportticket.ticket_number.
The original migration used autoincrement=True on a non-PK column, which
Alembic/PostgreSQL ignores — leaving the column without a server-side
default and causing NOT NULL violations on every INSERT.

Revision ID: 20260604_fix_ticket_seq
Revises: 37bf0b71e223
Create Date: 2026-06-04
"""

revision = "20260604_fix_ticket_seq"
down_revision = "37bf0b71e223"
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
    # Sync the sequence to one past the current max so we don't collide with existing rows
    op.execute(sa.text(
        "SELECT setval('supportticket_ticket_number_seq', "
        "COALESCE((SELECT MAX(ticket_number) FROM supportticket), 0) + 1, false)"
    ))


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE supportticket ALTER COLUMN ticket_number DROP DEFAULT"))
    op.execute(sa.text("DROP SEQUENCE IF EXISTS supportticket_ticket_number_seq"))
