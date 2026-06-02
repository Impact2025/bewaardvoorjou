"""digitaal_package — recipient_email en gift_card_code op order tabel

Revision ID: 20260602_digitaal_package
Revises: 20260602_early_bird
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa

revision = "20260602_digitaal_package"
down_revision = "20260602_early_bird"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "order",
        sa.Column("recipient_email", sa.String(255), nullable=True),
    )
    op.add_column(
        "order",
        sa.Column("gift_card_code", sa.String(32), nullable=True),
    )
    op.create_unique_constraint("uq_order_gift_card_code", "order", ["gift_card_code"])
    op.create_index("ix_order_gift_card_code", "order", ["gift_card_code"])


def downgrade() -> None:
    op.drop_index("ix_order_gift_card_code", table_name="order")
    op.drop_constraint("uq_order_gift_card_code", "order", type_="unique")
    op.drop_column("order", "gift_card_code")
    op.drop_column("order", "recipient_email")
