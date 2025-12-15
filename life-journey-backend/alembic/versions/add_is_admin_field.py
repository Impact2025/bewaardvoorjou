"""Add is_admin field to users table

Revision ID: add_is_admin_001
Revises:
Create Date: 2024-12-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_is_admin_001'
down_revision = '20251130_onboarding'
branch_labels = None
depends_on = None

def upgrade():
    # Add is_admin column with default False
    op.add_column('user', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))

def downgrade():
    # Remove is_admin column
    op.drop_column('user', 'is_admin')
