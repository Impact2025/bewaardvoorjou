"""add chapter preferences"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20241022_activated_chapters"
down_revision = "20241015_1200"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "chapterpreference",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("chapter_id", sa.String(length=32), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )
  op.create_index(
    "ix_chapterpreference_journey_chapter",
    "chapterpreference",
    ["journey_id", "chapter_id"],
    unique=True,
  )


def downgrade() -> None:
  op.drop_index("ix_chapterpreference_journey_chapter", table_name="chapterpreference")
  op.drop_table("chapterpreference")
