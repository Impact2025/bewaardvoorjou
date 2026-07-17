"""merge the two existing heads (order_baby_theme + blog_podcast_audio)

Revision ID: 20260717_merge_heads
Revises: 20260623_order_baby_theme, 20260717_text_versioning
"""
from alembic import op


revision = "20260717_merge_heads"
down_revision = ("20260623_order_baby_theme", "20260717_text_versioning")
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Pure merge of the two branches; no schema changes.
    pass


def downgrade() -> None:
    pass
