"""promo_codes — grants_package kolom toevoegen

Revision ID: 20260603_promo_grants_package
Revises: 20260603_promo_codes
Create Date: 2026-06-03
"""

from alembic import op
import sqlalchemy as sa

revision = "20260603_promo_grants_package"
down_revision = "20260603_promo_codes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "promo_codes",
        sa.Column("grants_package", sa.String(32), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("promo_codes", "grants_package")
