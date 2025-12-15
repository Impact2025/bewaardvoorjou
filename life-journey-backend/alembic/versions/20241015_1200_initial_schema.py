"""initial schema"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20241015_1200"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
  op.create_table(
    "user",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("display_name", sa.String(length=120), nullable=False),
    sa.Column("email", sa.String(length=255), nullable=False),
    sa.Column("country", sa.String(length=64), nullable=False),
    sa.Column("locale", sa.String(length=8), nullable=False),
    sa.Column("birth_year", sa.Integer(), nullable=True),
    sa.Column("privacy_level", sa.String(length=32), nullable=False),
    sa.Column("target_recipients", sa.JSON(), nullable=False),
    sa.Column("deadline_label", sa.String(length=120), nullable=True),
    sa.Column("deadline_at", sa.DateTime(), nullable=True),
    sa.Column("captions", sa.Boolean(), nullable=False),
    sa.Column("high_contrast", sa.Boolean(), nullable=False),
    sa.Column("large_text", sa.Boolean(), nullable=False),
    sa.Column("password_hash", sa.String(length=255), nullable=True),
    sa.Column("is_active", sa.Boolean(), nullable=False),
    sa.Column("last_login_at", sa.DateTime(), nullable=True),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint("id"),
    sa.UniqueConstraint("email", name="uq_user_email"),
  )
  op.create_index("ix_user_email", "user", ["email"], unique=False)

  op.create_table(
    "journey",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("title", sa.String(length=200), nullable=False),
    sa.Column("user_id", sa.String(), nullable=False),
    sa.Column("progress", sa.JSON(), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )

  op.create_table(
    "consentlog",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("type", sa.String(length=32), nullable=False),
    sa.Column("scope", sa.String(), nullable=False),
    sa.Column("granted_at", sa.DateTime(), nullable=False),
    sa.Column("revoked_at", sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )

  op.create_table(
    "legacypolicy",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("mode", sa.String(length=32), nullable=False),
    sa.Column("unlock_date", sa.DateTime(), nullable=True),
    sa.Column("grace_period_days", sa.Integer(), nullable=True),
    sa.Column("trustees", sa.JSON(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
    sa.UniqueConstraint("journey_id", name="uq_legacypolicy_journey_id"),
  )

  op.create_table(
    "mediaasset",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("chapter_id", sa.String(length=32), nullable=False),
    sa.Column("modality", sa.String(length=16), nullable=False),
    sa.Column("object_key", sa.String(), nullable=False),
    sa.Column("original_filename", sa.String(length=255), nullable=False),
    sa.Column("duration_seconds", sa.Integer(), nullable=False),
    sa.Column("size_bytes", sa.Integer(), nullable=False),
    sa.Column("storage_state", sa.String(length=32), nullable=False),
    sa.Column("recorded_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_mediaasset_journey_id", "mediaasset", ["journey_id"], unique=False)

  op.create_table(
    "promptrun",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("chapter_id", sa.String(length=32), nullable=False),
    sa.Column("prompt", sa.String(), nullable=False),
    sa.Column("follow_ups", sa.JSON(), nullable=False),
    sa.Column("consent_to_deepen", sa.Boolean(), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )

  op.create_table(
    "sharegrant",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("issued_to", sa.String(length=120), nullable=False),
    sa.Column("email", sa.String(length=255), nullable=False),
    sa.Column("chapter_ids", sa.JSON(), nullable=False),
    sa.Column("expires_at", sa.DateTime(), nullable=True),
    sa.Column("status", sa.String(length=16), nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )

  op.create_table(
    "highlight",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("journey_id", sa.String(), nullable=False),
    sa.Column("media_asset_id", sa.String(), nullable=False),
    sa.Column("chapter_id", sa.String(length=32), nullable=False),
    sa.Column("label", sa.String(length=32), nullable=False),
    sa.Column("start_ms", sa.Integer(), nullable=False),
    sa.Column("end_ms", sa.Integer(), nullable=False),
    sa.Column("created_by", sa.String(length=8), nullable=False),
    sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
    sa.ForeignKeyConstraint(["media_asset_id"], ["mediaasset.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_highlight_journey_id", "highlight", ["journey_id"], unique=False)

  op.create_table(
    "transcriptsegment",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("media_asset_id", sa.String(), nullable=False),
    sa.Column("start_ms", sa.Integer(), nullable=False),
    sa.Column("end_ms", sa.Integer(), nullable=False),
    sa.Column("text", sa.String(), nullable=False),
    sa.Column("sentiment", sa.String(length=32), nullable=True),
    sa.Column("emotion_hint", sa.String(length=32), nullable=True),
    sa.ForeignKeyConstraint(["media_asset_id"], ["mediaasset.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id"),
  )


def downgrade() -> None:
  op.drop_table("transcriptsegment")
  op.drop_index("ix_highlight_journey_id", table_name="highlight")
  op.drop_table("highlight")
  op.drop_table("sharegrant")
  op.drop_table("promptrun")
  op.drop_index("ix_mediaasset_journey_id", table_name="mediaasset")
  op.drop_table("mediaasset")
  op.drop_table("legacypolicy")
  op.drop_table("consentlog")
  op.drop_table("journey")
  op.drop_index("ix_user_email", table_name="user")
  op.drop_table("user")
