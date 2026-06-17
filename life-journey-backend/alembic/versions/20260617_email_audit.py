"""email_audit — alle uitgaande e-mail traceerbaar via EmailEvent

Maakt de EmailEvent-tabel geschikt om élke transactionele mail te loggen,
ook die zonder gebruikersaccount (eigenaar-verkoopmelding, gast-koper):

- emailevent.user_id wordt nullable (was NOT NULL)
- nieuwe kolom emailevent.order_id → link naar de bestelling, met index + FK

Backward-compatible: bestaande rijen blijven geldig; nieuwe kolom is nullable.

Revision ID: 20260617_email_audit
Revises: 20260616_gift_flow
Create Date: 2026-06-17
"""

from alembic import op
import sqlalchemy as sa

revision = "20260617_email_audit"
down_revision = "20260616_gift_flow"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("emailevent", "user_id", existing_type=sa.String(), nullable=True)
    op.add_column("emailevent", sa.Column("order_id", sa.String(), nullable=True))
    op.create_index("ix_emailevent_order_id", "emailevent", ["order_id"])
    op.create_foreign_key(
        "fk_emailevent_order_id",
        "emailevent",
        "order",
        ["order_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_emailevent_order_id", "emailevent", type_="foreignkey")
    op.drop_index("ix_emailevent_order_id", table_name="emailevent")
    op.drop_column("emailevent", "order_id")
    # Let op: terugzetten naar NOT NULL kan alleen als er geen rijen met user_id IS NULL zijn.
    op.alter_column("emailevent", "user_id", existing_type=sa.String(), nullable=False)
