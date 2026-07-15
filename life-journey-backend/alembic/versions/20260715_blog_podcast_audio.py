"""add podcast / notebooklm audio fields to blogpost

Revision ID: 20260715_blog_podcast_audio
Revises: 20260522_add_blog_view_count
Create Date: 2026-07-15
"""
from alembic import op
import sqlalchemy as sa

revision = '20260715_blog_podcast_audio'
down_revision = '20260522_add_blog_view_count'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('blogpost', sa.Column('audio_url', sa.String(1024), nullable=True))
    op.add_column('blogpost', sa.Column('audio_title', sa.String(300), nullable=True))
    op.add_column('blogpost', sa.Column('audio_duration', sa.Integer(), nullable=True))
    op.add_column('blogpost', sa.Column('transcript', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('blogpost', 'transcript')
    op.drop_column('blogpost', 'audio_duration')
    op.drop_column('blogpost', 'audio_title')
    op.drop_column('blogpost', 'audio_url')
