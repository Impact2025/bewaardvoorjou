"""extend blog posts with header, section and image support

Revision ID: 20260519_extend_blog
Revises: 20260518_blog_posts
Create Date: 2026-05-19
"""
from alembic import op
import sqlalchemy as sa

revision = '20260519_extend_blog'
down_revision = '20260518_blog_posts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('blogpost', sa.Column('section', sa.String(20), nullable=False, server_default='blog'))
    op.add_column('blogpost', sa.Column('header_type', sa.String(20), nullable=False, server_default='color'))
    op.add_column('blogpost', sa.Column('header_color', sa.String(50), nullable=True))
    op.add_column('blogpost', sa.Column('header_text_color', sa.String(50), nullable=True))
    op.add_column('blogpost', sa.Column('header_image_url', sa.String(512), nullable=True))
    op.create_index('ix_blogpost_section', 'blogpost', ['section'])


def downgrade() -> None:
    op.drop_index('ix_blogpost_section', table_name='blogpost')
    op.drop_column('blogpost', 'header_image_url')
    op.drop_column('blogpost', 'header_text_color')
    op.drop_column('blogpost', 'header_color')
    op.drop_column('blogpost', 'header_type')
    op.drop_column('blogpost', 'section')
