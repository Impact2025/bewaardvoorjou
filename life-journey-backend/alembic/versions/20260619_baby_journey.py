"""baby_journey — BewaardVoorBaby tabellen

Voegt twee nieuwe tabellen toe voor het BewaardVoorBaby product:
- babyjourney: babyboek-metadata (naam, geboortedata, rol, partner, opa/oma, fotoboek-voucher)
- babymilestone: lichtgewichte mijlpaal-markeringen met e-mail-trigger

Revision ID: 20260619_baby_journey
Revises: 20260617_email_audit
Create Date: 2026-06-19
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "20260619_baby_journey"
down_revision = "20260617_email_audit"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── babyjourney ──────────────────────────────────────────────────────────
    op.create_table(
        "babyjourney",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("journey_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("order_id", sa.String(), nullable=True),
        # Baby-profiel
        sa.Column("baby_name", sa.String(100), nullable=False),
        sa.Column("baby_birth_date", sa.Date(), nullable=True),
        sa.Column("birth_time_str", sa.String(10), nullable=True),
        sa.Column("birth_weight_grams", sa.Integer(), nullable=True),
        sa.Column("birth_length_cm", sa.Float(), nullable=True),
        sa.Column("first_outfit_photo_url", sa.String(512), nullable=True),
        # Vertellerrol
        sa.Column("narrator_role", sa.String(16), nullable=False, server_default="SAMEN"),
        # Partner
        sa.Column("partner_email", sa.String(255), nullable=True),
        sa.Column("partner_user_id", sa.String(), nullable=True),
        sa.Column("partner_joined_at", sa.DateTime(), nullable=True),
        # Grootouders
        sa.Column("grandparent_emails", sa.JSON(), nullable=False, server_default="[]"),
        # Fotoboek-voucher
        sa.Column("photobook_voucher_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("photobook_voucher_claimed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("photobook_voucher_claimed_at", sa.DateTime(), nullable=True),
        # Engagement
        sa.Column("pivot_to_monthly", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("pivot_triggered_at", sa.DateTime(), nullable=True),
        sa.Column("last_weekly_email_at", sa.DateTime(), nullable=True),
        sa.Column("last_grandparent_digest_at", sa.DateTime(), nullable=True),
        # Tijdstempels
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        # Keys & constraints
        sa.ForeignKeyConstraint(["journey_id"], ["journey.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["order_id"], ["order.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["partner_user_id"], ["user.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("journey_id"),
    )
    op.create_index("ix_babyjourney_journey_id", "babyjourney", ["journey_id"])
    op.create_index("ix_babyjourney_user_id", "babyjourney", ["user_id"])
    op.create_index("ix_babyjourney_order_id", "babyjourney", ["order_id"])
    op.create_index("ix_babyjourney_partner_user_id", "babyjourney", ["partner_user_id"])

    # ── babymilestone ────────────────────────────────────────────────────────
    op.create_table(
        "babymilestone",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("baby_journey_id", sa.String(), nullable=False),
        sa.Column("milestone_type", sa.String(64), nullable=False),
        sa.Column("milestone_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.String(512), nullable=True),
        sa.Column("chapter_id_triggered", sa.String(64), nullable=True),
        sa.Column("email_triggered", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("marked_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["baby_journey_id"], ["babyjourney.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_babymilestone_baby_journey_id", "babymilestone", ["baby_journey_id"])


def downgrade() -> None:
    op.drop_index("ix_babymilestone_baby_journey_id", table_name="babymilestone")
    op.drop_table("babymilestone")

    op.drop_index("ix_babyjourney_partner_user_id", table_name="babyjourney")
    op.drop_index("ix_babyjourney_order_id", table_name="babyjourney")
    op.drop_index("ix_babyjourney_user_id", table_name="babyjourney")
    op.drop_index("ix_babyjourney_journey_id", table_name="babyjourney")
    op.drop_table("babyjourney")
