"""Add onboarding progress fields to user table.

Revision ID: 20251130_onboarding
Revises: 20251130_family
Create Date: 2025-11-30

Adds fields for Onboarding 2.0:
- onboarding_progress: JSON storage for wizard progress
- onboarding_completed_at: Timestamp when onboarding was completed
- preferred_recording_method: User's preferred recording method
- ai_assistance_level: Level of AI assistance preferred
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "20251130_onboarding"
down_revision = "20251130_add_family_ecosystem"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add onboarding fields to user table
    op.add_column(
        "user",
        sa.Column("onboarding_progress", sa.Text(), nullable=True),
    )
    op.add_column(
        "user",
        sa.Column("onboarding_completed_at", sa.DateTime(), nullable=True),
    )
    op.add_column(
        "user",
        sa.Column("preferred_recording_method", sa.String(32), nullable=True),
    )
    op.add_column(
        "user",
        sa.Column("ai_assistance_level", sa.String(32), nullable=True, server_default="full"),
    )


def downgrade() -> None:
    op.drop_column("user", "ai_assistance_level")
    op.drop_column("user", "preferred_recording_method")
    op.drop_column("user", "onboarding_completed_at")
    op.drop_column("user", "onboarding_progress")
