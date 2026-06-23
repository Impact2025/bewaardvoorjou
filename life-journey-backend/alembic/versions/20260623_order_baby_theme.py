"""order_baby_theme — voeg baby_theme kolom toe aan order

Sla het gekozen Baby-thema (meisje / jongen / neutraal) op zodat de
uitnodigingsmail de juiste kleur en tekst krijgt.

Revision ID: 20260623_order_baby_theme
Revises: 20260619_baby_journey
Create Date: 2026-06-23
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "20260623_order_baby_theme"
down_revision = "20260619_baby_journey"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "order",
        sa.Column("baby_theme", sa.String(16), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("order", "baby_theme")
