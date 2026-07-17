"""text versioning + audio/video ready transition

Revision ID: 20260717_text_versioning
Revises: 20260715_blog_podcast_audio
"""
from alembic import op
import sqlalchemy as sa


revision = "20260717_text_versioning"
down_revision = "20260715_blog_podcast_audio"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Versioning: only one "current" text record per (journey, chapter).
    # Older saves are superseded (replaced_by points at the newer version).
    with op.batch_alter_table("mediaasset") as batch_op:
        batch_op.add_column(sa.Column("is_current", sa.Boolean(), nullable=False, server_default=sa.true()))
        batch_op.add_column(sa.Column("replaced_by", sa.String(), nullable=True))
        batch_op.create_index("ix_mediaasset_current", ["journey_id", "chapter_id", "modality", "is_current"])

    # Backfill: every existing row is current (no dedup of historical data here —
    # the recordings list filter simply hides superseded rows going forward).
    op.execute("UPDATE mediaasset SET is_current = true WHERE is_current IS NULL")


def downgrade() -> None:
    with op.batch_alter_table("mediaasset") as batch_op:
        batch_op.drop_index("ix_mediaasset_current")
        batch_op.drop_column("replaced_by")
        batch_op.drop_column("is_current")
