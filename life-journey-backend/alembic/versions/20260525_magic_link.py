"""magic_link — passwordless auth + phone_number on user

Revision ID: 20260525_magic_link
Revises: 20260525_email_prefs_v2
Create Date: 2026-05-25
"""

from alembic import op
import sqlalchemy as sa

revision = "20260525_magic_link"
down_revision = "20260525_email_prefs_v2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user", sa.Column("magic_link_token", sa.String(128), nullable=True))
    op.add_column("user", sa.Column("magic_link_token_expires_at", sa.DateTime(), nullable=True))
    op.add_column("user", sa.Column("magic_link_last_used_at", sa.DateTime(), nullable=True))
    op.add_column("user", sa.Column("phone_number", sa.String(32), nullable=True))
    op.create_index("ix_user_magic_link_token", "user", ["magic_link_token"])


def downgrade() -> None:
    op.drop_index("ix_user_magic_link_token", table_name="user")
    op.drop_column("user", "phone_number")
    op.drop_column("user", "magic_link_last_used_at")
    op.drop_column("user", "magic_link_token_expires_at")
    op.drop_column("user", "magic_link_token")
