"""add view_count to blogpost

Revision ID: 20260522_add_blog_view_count
Revises: 20260521_stripe_orders
Create Date: 2026-05-22

"""
from alembic import op
import sqlalchemy as sa

revision = '20260522_add_blog_view_count'
down_revision = '20260521_stripe_orders'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'blogpost',
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('blogpost', 'view_count')
