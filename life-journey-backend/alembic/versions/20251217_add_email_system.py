"""add email system

Revision ID: 20251217_email_system
Revises: add_is_admin_001
Create Date: 2025-12-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251217_email_system'
down_revision = 'add_is_admin_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create emailevent table
    op.create_table(
        "emailevent",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("journey_id", sa.String(), nullable=True),
        sa.Column("email_type", sa.String(length=64), nullable=False),
        sa.Column("context_data", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("sent_to", sa.String(length=255), nullable=False),
        sa.Column("resend_id", sa.String(length=255), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_emailevent_user_id", "emailevent", ["user_id"], unique=False)
    op.create_index("ix_emailevent_journey_id", "emailevent", ["journey_id"], unique=False)
    op.create_index("ix_emailevent_email_type", "emailevent", ["email_type"], unique=False)
    op.create_index("ix_emailevent_status", "emailevent", ["status"], unique=False)
    op.create_index("ix_emailevent_resend_id", "emailevent", ["resend_id"], unique=False)
    op.create_index("ix_emailevent_created_at", "emailevent", ["created_at"], unique=False)

    # Create emailpreference table
    op.create_table(
        "emailpreference",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("welcome_emails", sa.Boolean(), nullable=False),
        sa.Column("chapter_emails", sa.Boolean(), nullable=False),
        sa.Column("milestone_emails", sa.Boolean(), nullable=False),
        sa.Column("unsubscribed_all", sa.Boolean(), nullable=False),
        sa.Column("unsubscribed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_emailpreference_user_id"),
    )
    op.create_index("ix_emailpreference_user_id", "emailpreference", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_emailpreference_user_id", table_name="emailpreference")
    op.drop_table("emailpreference")
    op.drop_index("ix_emailevent_created_at", table_name="emailevent")
    op.drop_index("ix_emailevent_resend_id", table_name="emailevent")
    op.drop_index("ix_emailevent_status", table_name="emailevent")
    op.drop_index("ix_emailevent_email_type", table_name="emailevent")
    op.drop_index("ix_emailevent_journey_id", table_name="emailevent")
    op.drop_index("ix_emailevent_user_id", table_name="emailevent")
    op.drop_table("emailevent")
