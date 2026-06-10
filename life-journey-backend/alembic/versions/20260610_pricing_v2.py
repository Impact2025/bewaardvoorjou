"""pricing v2: trial fields + founding member op user

Revision ID: 20260610_pricing_v2
Revises: 20260609_add_usb_tracking
Create Date: 2026-06-10

"""

from alembic import op
import sqlalchemy as sa

revision = "20260610_pricing_v2"
down_revision = "20260609_add_usb_tracking"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user", sa.Column("trial_started_at", sa.DateTime(), nullable=True))
    op.add_column("user", sa.Column("trial_expires_at", sa.DateTime(), nullable=True))
    op.add_column("user", sa.Column("founding_member", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("user", sa.Column("founding_member_number", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("user", "founding_member_number")
    op.drop_column("user", "founding_member")
    op.drop_column("user", "trial_expires_at")
    op.drop_column("user", "trial_started_at")
