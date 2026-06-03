"""conversation_sessions — persistente gespreksessies voor herstel na refresh

Revision ID: 20260603_add_conversation_sessions
Revises: 20260603_promo_grants_package
Create Date: 2026-06-03
"""

from alembic import op
import sqlalchemy as sa

revision = "20260603_conv_sessions"
down_revision = "20260603_promo_grants_package"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "conversationsessionrecord",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("journey_id", sa.String(), nullable=False),
        sa.Column("chapter_id", sa.String(32), nullable=False),
        sa.Column("asset_id", sa.String(), nullable=False),
        sa.Column("turns", sa.JSON(), nullable=False),
        sa.Column("is_complete", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_conversationsessionrecord_journey_id",
        "conversationsessionrecord",
        ["journey_id"],
    )
    op.create_index(
        "ix_conversationsessionrecord_journey_chapter",
        "conversationsessionrecord",
        ["journey_id", "chapter_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_conversationsessionrecord_journey_chapter", table_name="conversationsessionrecord")
    op.drop_index("ix_conversationsessionrecord_journey_id", table_name="conversationsessionrecord")
    op.drop_table("conversationsessionrecord")
