"""stripe orders en pakket-velden op user

Revision ID: 20260521_stripe_orders
Revises: 20260520_email_system_v2
Create Date: 2026-05-21

"""
from alembic import op
import sqlalchemy as sa


revision = '20260521_stripe_orders'
down_revision = '20260520_email_system_v2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Pakket-velden op user
    op.add_column('user', sa.Column('package_tier', sa.String(32), nullable=False, server_default='NONE'))
    op.add_column('user', sa.Column('package_activated_at', sa.DateTime, nullable=True))
    op.add_column('user', sa.Column('max_family_members', sa.Integer, nullable=False, server_default='0'))
    op.add_column('user', sa.Column('max_chapters', sa.Integer, nullable=True))
    op.add_column('user', sa.Column('storage_years', sa.Integer, nullable=False, server_default='0'))
    op.create_index('ix_user_package_tier', 'user', ['package_tier'])

    # Orders tabel
    op.create_table(
        'order',
        sa.Column('id', sa.String, primary_key=True),
        sa.Column('user_id', sa.String, nullable=True, index=True),
        sa.Column('guest_email', sa.String(255), nullable=True),
        sa.Column('package_type', sa.String(32), nullable=False),
        sa.Column('price_paid', sa.Integer, nullable=False),
        sa.Column('addons', sa.JSON, nullable=False),
        sa.Column('addons_price', sa.Integer, nullable=False, server_default='0'),
        sa.Column('stripe_payment_intent_id', sa.String(255), nullable=True, unique=True, index=True),
        sa.Column('stripe_payment_method', sa.String(64), nullable=True),
        sa.Column('status', sa.String(32), nullable=False, server_default='PENDING', index=True),
        sa.Column('recipient_name', sa.String(255), nullable=True),
        sa.Column('personal_message', sa.Text, nullable=True),
        sa.Column('shipping_address', sa.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('paid_at', sa.DateTime, nullable=True),
        sa.Column('fulfilled_at', sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    op.drop_table('order')
    op.drop_index('ix_user_package_tier', 'user')
    op.drop_column('user', 'storage_years')
    op.drop_column('user', 'max_chapters')
    op.drop_column('user', 'max_family_members')
    op.drop_column('user', 'package_activated_at')
    op.drop_column('user', 'package_tier')
