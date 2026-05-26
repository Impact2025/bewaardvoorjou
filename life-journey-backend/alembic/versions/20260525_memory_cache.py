"""memory_cache — journey AI memory cache table

Revision ID: 20260525_memory_cache
Revises: 20260525_magic_link
Create Date: 2026-05-25
"""

from alembic import op
import sqlalchemy as sa

revision = "20260525_memory_cache"
down_revision = "20260525_magic_link"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "journeymemorycache",
        sa.Column("journey_id", sa.String(), sa.ForeignKey("journey.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("memory_json", sa.Text(), nullable=False),
        sa.Column("built_at", sa.DateTime(), nullable=False),
        sa.Column("chapters_included", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("journeymemorycache")
