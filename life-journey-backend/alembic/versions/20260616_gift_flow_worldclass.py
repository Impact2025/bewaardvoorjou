"""gift_flow_worldclass — wereldklasse cadeau-flow voor alle pakketten

Voegt op de order-tabel toe:
- recipient_relation, card_message (fysieke kaart-tekst)
- digitaal mediabericht: message_media_url/type, message_transcript, message_status
- gift_reveal (verrassing/aangekondigd), delivery_date (bezorgmoment)
- universele redemption_token + redeemed_at (ontgrendeling via QR of e-mail)

Alle kolommen nullable → volledig backward-compatible met bestaande orders.

Revision ID: 20260616_gift_flow
Revises: 20260612_ensure_ticket_seq
Create Date: 2026-06-16
"""

from alembic import op
import sqlalchemy as sa

revision = "20260616_gift_flow"
down_revision = "20260612_ensure_ticket_seq"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("order", sa.Column("recipient_relation", sa.String(32), nullable=True))
    op.add_column("order", sa.Column("card_message", sa.Text(), nullable=True))

    op.add_column("order", sa.Column("message_media_url", sa.String(512), nullable=True))
    op.add_column("order", sa.Column("message_media_type", sa.String(16), nullable=True))
    op.add_column("order", sa.Column("message_transcript", sa.Text(), nullable=True))
    op.add_column("order", sa.Column("message_status", sa.String(16), nullable=True))

    op.add_column("order", sa.Column("gift_reveal", sa.String(16), nullable=True))
    op.add_column("order", sa.Column("delivery_date", sa.Date(), nullable=True))

    op.add_column("order", sa.Column("redemption_token", sa.String(64), nullable=True))
    op.add_column("order", sa.Column("redeemed_at", sa.DateTime(), nullable=True))
    op.add_column("order", sa.Column("redemption_email_sent_at", sa.DateTime(), nullable=True))
    op.create_unique_constraint("uq_order_redemption_token", "order", ["redemption_token"])
    op.create_index("ix_order_redemption_token", "order", ["redemption_token"])


def downgrade() -> None:
    op.drop_index("ix_order_redemption_token", table_name="order")
    op.drop_constraint("uq_order_redemption_token", "order", type_="unique")
    op.drop_column("order", "redemption_email_sent_at")
    op.drop_column("order", "redeemed_at")
    op.drop_column("order", "redemption_token")
    op.drop_column("order", "delivery_date")
    op.drop_column("order", "gift_reveal")
    op.drop_column("order", "message_status")
    op.drop_column("order", "message_transcript")
    op.drop_column("order", "message_media_type")
    op.drop_column("order", "message_media_url")
    op.drop_column("order", "card_message")
    op.drop_column("order", "recipient_relation")
