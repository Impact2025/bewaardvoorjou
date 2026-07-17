"""text_content in DB (tekst niet meer afhankelijk van ephemeral/R2 storage)

Revision ID: 20260717_text_content
Revises: 20260717_merge_heads
"""
from alembic import op
import sqlalchemy as sa


revision = "20260717_text_content"
down_revision = "20260717_merge_heads"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("mediaasset", sa.Column("text_content", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("mediaasset", "text_content")
