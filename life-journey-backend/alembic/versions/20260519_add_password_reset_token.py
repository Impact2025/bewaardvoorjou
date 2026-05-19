"""add password reset token columns to user

Revision ID: 20260519_password_reset
Revises: 20260519_extend_blog_posts
Create Date: 2026-05-19

"""
from alembic import op
import sqlalchemy as sa


revision = '20260519_password_reset'
down_revision = '20260519_extend_blog'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('password_reset_token', sa.String(128), nullable=True))
    op.add_column('user', sa.Column('password_reset_token_expires_at', sa.DateTime(), nullable=True))
    op.create_index('ix_user_password_reset_token', 'user', ['password_reset_token'])


def downgrade() -> None:
    op.drop_index('ix_user_password_reset_token', 'user')
    op.drop_column('user', 'password_reset_token_expires_at')
    op.drop_column('user', 'password_reset_token')
