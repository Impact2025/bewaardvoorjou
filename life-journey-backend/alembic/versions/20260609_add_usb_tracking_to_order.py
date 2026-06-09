"""add usb_burned_at and usb_burned_by to order

Revision ID: 20260609_add_usb_tracking
Revises: 20260604_fix_ticket_seq
Create Date: 2026-06-09

"""

from alembic import op
import sqlalchemy as sa

revision = "20260609_add_usb_tracking"
down_revision = "20260604_fix_ticket_seq"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("order", sa.Column("usb_burned_at", sa.DateTime(), nullable=True))
    op.add_column("order", sa.Column("usb_burned_by", sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column("order", "usb_burned_by")
    op.drop_column("order", "usb_burned_at")
