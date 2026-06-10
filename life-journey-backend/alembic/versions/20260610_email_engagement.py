"""email_engagement — open/click tracking columns on emailevent

Revision ID: 20260610_email_engagement
Revises: 20260610_pricing_v2
Create Date: 2026-06-10
"""

from alembic import op
import sqlalchemy as sa

revision = "20260610_email_engagement"
down_revision = "20260610_pricing_v2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("emailevent", sa.Column("open_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("emailevent", sa.Column("click_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("emailevent", sa.Column("delivered_at", sa.DateTime(), nullable=True))
    op.add_column("emailevent", sa.Column("opened_at", sa.DateTime(), nullable=True))
    op.add_column("emailevent", sa.Column("clicked_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("emailevent", "clicked_at")
    op.drop_column("emailevent", "opened_at")
    op.drop_column("emailevent", "delivered_at")
    op.drop_column("emailevent", "click_count")
    op.drop_column("emailevent", "open_count")
