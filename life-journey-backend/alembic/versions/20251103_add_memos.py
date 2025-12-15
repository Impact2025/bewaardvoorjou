"""add memos table"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20251103_add_memos"
down_revision = "20241022_activated_chapters"
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "memo",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("chapter_id", sa.String(length=32), nullable=True),
    sa.Column("title", sa.String(length=200), nullable=False),
    sa.Column("content", sa.Text(), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_memo_journey_id", "memo", ["journey_id"], unique=False)
  op.create_index("ix_memo_chapter_id", "memo", ["chapter_id"], unique=False)


def downgrade() -> None:
  op.drop_index("ix_memo_chapter_id", table_name="memo")
  op.drop_index("ix_memo_journey_id", table_name="memo")
  op.drop_table("memo")
