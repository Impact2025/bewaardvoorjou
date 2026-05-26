"""email_preferences_v2 — re-engagement email preference columns

Revision ID: 20260525_email_prefs_v2
Revises: 20260524_add_audit_log
Create Date: 2026-05-25
"""

from alembic import op
import sqlalchemy as sa

revision = "20260525_email_prefs_v2"
down_revision = "20260524_add_audit_log"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "emailpreference",
        sa.Column("weekly_question_emails", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "emailpreference",
        sa.Column("inactivity_reminders", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "emailpreference",
        sa.Column("seasonal_emails", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column(
        "emailpreference",
        sa.Column("family_notifications", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column("emailpreference", "family_notifications")
    op.drop_column("emailpreference", "seasonal_emails")
    op.drop_column("emailpreference", "inactivity_reminders")
    op.drop_column("emailpreference", "weekly_question_emails")
