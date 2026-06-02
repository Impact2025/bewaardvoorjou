"""early_bird — discount_cents op orders, guaranteed_discount_cents op waitlist_entries

Revision ID: 20260602_early_bird
Revises: 20260602_waitlist_entries
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa

revision = "20260602_early_bird"
down_revision = "20260602_waitlist_entries"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "order",
        sa.Column("discount_cents", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "waitlist_entries",
        sa.Column("guaranteed_discount_cents", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("order", "discount_cents")
    op.drop_column("waitlist_entries", "guaranteed_discount_cents")
