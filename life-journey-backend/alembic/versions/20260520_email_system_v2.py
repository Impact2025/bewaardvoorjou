"""email system v2: unsubscribe tokens, bounce tracking, deliverability

Revision ID: 20260520_email_system_v2
Revises: 20260520_email_verification
Create Date: 2026-05-20

"""
from alembic import op
import sqlalchemy as sa


revision = '20260520_email_system_v2'
down_revision = '20260520_email_verification'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # EmailEvent: unsubscribe token + webhook tracking fields
    op.add_column('emailevent', sa.Column('unsubscribe_token', sa.String(128), nullable=True))
    op.add_column('emailevent', sa.Column('bounced_at', sa.DateTime(), nullable=True))
    op.add_column('emailevent', sa.Column('complained_at', sa.DateTime(), nullable=True))
    op.create_index('ix_emailevent_unsubscribe_token', 'emailevent', ['unsubscribe_token'], unique=True)

    # User: bounce tracking
    op.add_column('user', sa.Column('email_bounced', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('user', sa.Column('email_bounced_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('user', 'email_bounced_at')
    op.drop_column('user', 'email_bounced')
    op.drop_index('ix_emailevent_unsubscribe_token', 'emailevent')
    op.drop_column('emailevent', 'complained_at')
    op.drop_column('emailevent', 'bounced_at')
    op.drop_column('emailevent', 'unsubscribe_token')
