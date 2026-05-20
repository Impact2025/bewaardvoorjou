"""add blog posts table

Revision ID: 20260518_blog_posts
Revises: 20260102_quick_thoughts
Create Date: 2026-05-18

"""
from alembic import op
import sqlalchemy as sa


revision = '20260518_blog_posts'
down_revision = '20260102_quick_thoughts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "blogpost",
        sa.Column("id", sa.String(36), nullable=False),
        sa.Column("author_id", sa.String(36), nullable=False),

        # Content
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("slug", sa.String(300), nullable=False),
        sa.Column("content", sa.Text(), nullable=False, server_default=""),
        sa.Column("excerpt", sa.String(500), nullable=True),

        # SEO
        sa.Column("meta_title", sa.String(70), nullable=True),
        sa.Column("meta_description", sa.String(160), nullable=True),
        sa.Column("og_image", sa.String(512), nullable=True),
        sa.Column("keywords", sa.String(500), nullable=True),
        sa.Column("tags", sa.String(500), nullable=True),

        # Status
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.DateTime(), nullable=True),

        # Lifecycle
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),

        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_blogpost_slug"),
    )

    op.create_index("ix_blogpost_author_id", "blogpost", ["author_id"])
    op.create_index("ix_blogpost_slug", "blogpost", ["slug"], unique=True)
    op.create_index("ix_blogpost_status", "blogpost", ["status"])
    op.create_index("ix_blogpost_published_at", "blogpost", ["published_at"])


def downgrade() -> None:
    op.drop_index("ix_blogpost_published_at", table_name="blogpost")
    op.drop_index("ix_blogpost_status", table_name="blogpost")
    op.drop_index("ix_blogpost_slug", table_name="blogpost")
    op.drop_index("ix_blogpost_author_id", table_name="blogpost")
    op.drop_table("blogpost")
