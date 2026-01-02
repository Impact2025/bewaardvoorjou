"""add quick thoughts table for Gedachte Inspreken feature

Revision ID: 20260102_quick_thoughts
Revises: 20251217_email_system
Create Date: 2026-01-02

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260102_quick_thoughts'
down_revision = '20251217_email_system'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create quickthought table
    op.create_table(
        "quickthought",
        # Identity
        sa.Column("id", sa.String(36), nullable=False),
        sa.Column("journey_id", sa.String(36), nullable=False),
        sa.Column("chapter_id", sa.String(32), nullable=True),

        # Content
        sa.Column("modality", sa.String(16), nullable=False),  # text, audio, video
        sa.Column("object_key", sa.String(512), nullable=True),  # S3/local storage path
        sa.Column("text_content", sa.Text(), nullable=True),  # For text mode
        sa.Column("original_filename", sa.String(255), nullable=True),

        # Metadata
        sa.Column("title", sa.String(200), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=True),

        # Transcription
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("transcript_status", sa.String(32), nullable=False, server_default="pending"),

        # AI Analysis
        sa.Column("auto_category", sa.String(32), nullable=True),
        sa.Column("auto_tags", sa.JSON(), nullable=True),
        sa.Column("emotion_score", sa.Float(), nullable=True),
        sa.Column("ai_summary", sa.String(500), nullable=True),
        sa.Column("suggested_chapters", sa.JSON(), nullable=True),

        # Status
        sa.Column("processing_status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("is_used_in_interview", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("used_in_interview_at", sa.DateTime(), nullable=True),

        # Lifecycle
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("archived_at", sa.DateTime(), nullable=True),

        # Constraints
        sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for common queries
    op.create_index("ix_quickthought_journey_id", "quickthought", ["journey_id"], unique=False)
    op.create_index("ix_quickthought_chapter_id", "quickthought", ["chapter_id"], unique=False)
    op.create_index("ix_quickthought_created_at", "quickthought", ["created_at"], unique=False)
    op.create_index("ix_quickthought_processing_status", "quickthought", ["processing_status"], unique=False)
    op.create_index("ix_quickthought_auto_category", "quickthought", ["auto_category"], unique=False)
    op.create_index("ix_quickthought_is_used", "quickthought", ["is_used_in_interview"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_quickthought_is_used", table_name="quickthought")
    op.drop_index("ix_quickthought_auto_category", table_name="quickthought")
    op.drop_index("ix_quickthought_processing_status", table_name="quickthought")
    op.drop_index("ix_quickthought_created_at", table_name="quickthought")
    op.drop_index("ix_quickthought_chapter_id", table_name="quickthought")
    op.drop_index("ix_quickthought_journey_id", table_name="quickthought")
    op.drop_table("quickthought")
