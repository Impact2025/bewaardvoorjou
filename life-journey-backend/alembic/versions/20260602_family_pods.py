"""family_pods — FamilyPod en PodMessage tabellen

Revision ID: 20260602_family_pods
Revises: 20260601_avg_consent
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa

revision = "20260602_family_pods"
down_revision = "20260601_avg_consent"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "familypod",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("journey_id", sa.String(), sa.ForeignKey("journey.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(), sa.ForeignKey("user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_activity_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_familypod_journey_id", "familypod", ["journey_id"])

    op.create_table(
        "podmessage",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("pod_id", sa.String(), sa.ForeignKey("familypod.id", ondelete="CASCADE"), nullable=False),
        sa.Column("author_id", sa.String(), sa.ForeignKey("user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("author_name", sa.String(120), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("reactions", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_podmessage_pod_id", "podmessage", ["pod_id"])


def downgrade() -> None:
    op.drop_index("ix_podmessage_pod_id", table_name="podmessage")
    op.drop_table("podmessage")
    op.drop_index("ix_familypod_journey_id", table_name="familypod")
    op.drop_table("familypod")
