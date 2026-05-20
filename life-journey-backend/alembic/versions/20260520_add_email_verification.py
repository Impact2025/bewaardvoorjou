"""add email verification columns to user

Revision ID: 20260520_email_verification
Revises: 20260519_password_reset
Create Date: 2026-05-20

"""
from alembic import op
import sqlalchemy as sa


revision = '20260520_email_verification'
down_revision = '20260519_password_reset'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('user', sa.Column('email_verification_token', sa.String(128), nullable=True))
    op.add_column('user', sa.Column('email_verification_token_expires_at', sa.DateTime(), nullable=True))
    op.create_index('ix_user_email_verification_token', 'user', ['email_verification_token'])


def downgrade() -> None:
    op.drop_index('ix_user_email_verification_token', 'user')
    op.drop_column('user', 'email_verification_token_expires_at')
    op.drop_column('user', 'email_verification_token')
    op.drop_column('user', 'email_verified')
