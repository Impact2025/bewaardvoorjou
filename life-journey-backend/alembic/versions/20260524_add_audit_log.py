"""add audit_log table

Revision ID: 20260524_add_audit_log
Revises: 20260522_add_blog_view_count
Create Date: 2026-05-24

"""
from alembic import op
import sqlalchemy as sa

revision = "20260524_add_audit_log"
down_revision = "20260522_add_blog_view_count"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_log",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("admin_id", sa.String(), nullable=False),
        sa.Column("admin_email", sa.String(255), nullable=False),
        sa.Column("action", sa.String(64), nullable=False),
        sa.Column("target_user_id", sa.String(), nullable=True),
        sa.Column("target_email", sa.String(255), nullable=True),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_log_admin_id", "audit_log", ["admin_id"])
    op.create_index("ix_audit_log_action", "audit_log", ["action"])
    op.create_index("ix_audit_log_created_at", "audit_log", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_audit_log_created_at", table_name="audit_log")
    op.drop_index("ix_audit_log_action", table_name="audit_log")
    op.drop_index("ix_audit_log_admin_id", table_name="audit_log")
    op.drop_table("audit_log")
