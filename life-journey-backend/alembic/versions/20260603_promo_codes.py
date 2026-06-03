"""promo_codes — nieuwe tabel + promo_code_used op order

Revision ID: 20260603_promo_codes
Revises: 20260602_digitaal_package
Create Date: 2026-06-03
"""

from alembic import op
import sqlalchemy as sa

revision = "20260603_promo_codes"
down_revision = "20260602_digitaal_package"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "promo_codes",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("discount_type", sa.String(16), nullable=False),
        sa.Column("discount_value", sa.Integer(), nullable=False),
        sa.Column("applicable_packages", sa.JSON(), nullable=True),
        sa.Column("max_uses", sa.Integer(), nullable=True),
        sa.Column("used_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_unique_constraint("uq_promo_codes_code", "promo_codes", ["code"])
    op.create_index("ix_promo_codes_code", "promo_codes", ["code"])

    op.add_column(
        "order",
        sa.Column("promo_code_used", sa.String(32), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("order", "promo_code_used")
    op.drop_index("ix_promo_codes_code", table_name="promo_codes")
    op.drop_constraint("uq_promo_codes_code", "promo_codes", type_="unique")
    op.drop_table("promo_codes")
