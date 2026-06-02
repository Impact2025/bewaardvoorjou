"""parent_interview — Interview je Ouders tabellen

Revision ID: 20260602_parent_interview
Revises: 20260602_family_pods
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa

revision = "20260602_parent_interview"
down_revision = "20260602_family_pods"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "parentinterview",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("journey_id", sa.String(), sa.ForeignKey("journey.id", ondelete="CASCADE"), nullable=False),
        sa.Column("interviewee_name", sa.String(120), nullable=False),
        sa.Column("interviewee_email", sa.String(255), nullable=True),
        sa.Column("personal_message", sa.Text(), nullable=True),
        sa.Column("questions", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("token", sa.String(64), nullable=False, unique=True),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("email_sent_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_parentinterview_journey_id", "parentinterview", ["journey_id"])
    op.create_index("ix_parentinterview_token", "parentinterview", ["token"], unique=True)

    op.create_table(
        "parentinterviewanswer",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("interview_id", sa.String(), sa.ForeignKey("parentinterview.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.String(64), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("answer_text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_parentinterviewanswer_interview_id", "parentinterviewanswer", ["interview_id"])


def downgrade() -> None:
    op.drop_index("ix_parentinterviewanswer_interview_id", table_name="parentinterviewanswer")
    op.drop_table("parentinterviewanswer")
    op.drop_index("ix_parentinterview_token", table_name="parentinterview")
    op.drop_index("ix_parentinterview_journey_id", table_name="parentinterview")
    op.drop_table("parentinterview")
