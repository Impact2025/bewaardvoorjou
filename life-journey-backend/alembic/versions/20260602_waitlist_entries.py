"""waitlist_entries — wachtlijst voor uitverkochte pakketten

Revision ID: 20260602_waitlist_entries
Revises: 20260602_parent_interview
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa

revision = "20260602_waitlist_entries"
down_revision = "20260602_parent_interview"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "waitlist_entries",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("package_type", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", "package_type", name="uq_waitlist_email_package"),
    )
    op.create_index("ix_waitlist_entries_email", "waitlist_entries", ["email"])


def downgrade() -> None:
    op.drop_index("ix_waitlist_entries_email", table_name="waitlist_entries")
    op.drop_table("waitlist_entries")
