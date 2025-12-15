"""Add family ecosystem tables

Revision ID: 20251130_add_family_ecosystem
Revises: 20251130_performance_indexes
Create Date: 2025-11-30

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251130_add_family_ecosystem'
down_revision = '20251130_performance_indexes'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create family member table
    op.create_table(
        'familymember',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('journey_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(120), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('owner', 'spouse', 'child', 'parent', 'sibling', 'grandchild', 'extended', 'friend', name='familyrole'), nullable=False),
        sa.Column('access_level', sa.Enum('full', 'selected', 'highlights', 'none', name='accesslevel'), nullable=False),
        sa.Column('allowed_chapters', sa.String(), nullable=True),
        sa.Column('invite_token', sa.String(64), nullable=True),
        sa.Column('invite_sent_at', sa.DateTime(), nullable=True),
        sa.Column('invite_accepted_at', sa.DateTime(), nullable=True),
        sa.Column('linked_user_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['journey_id'], ['journey.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['linked_user_id'], ['user.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by'], ['user.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes for family member
    op.create_index('ix_familymember_journey_id', 'familymember', ['journey_id'])
    op.create_index('ix_familymember_email', 'familymember', ['email'])
    op.create_index('ix_familymember_invite_token', 'familymember', ['invite_token'], unique=True)

    # Create family invite table
    op.create_table(
        'familyinvite',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('family_member_id', sa.String(), nullable=False),
        sa.Column('token', sa.String(64), nullable=False),
        sa.Column('email_sent_to', sa.String(255), nullable=False),
        sa.Column('sent_at', sa.DateTime(), nullable=False),
        sa.Column('opened_at', sa.DateTime(), nullable=True),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('declined_at', sa.DateTime(), nullable=True),
        sa.Column('expired_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['family_member_id'], ['familymember.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes for family invite
    op.create_index('ix_familyinvite_family_member_id', 'familyinvite', ['family_member_id'])
    op.create_index('ix_familyinvite_token', 'familyinvite', ['token'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_familyinvite_token', table_name='familyinvite')
    op.drop_index('ix_familyinvite_family_member_id', table_name='familyinvite')
    op.drop_table('familyinvite')

    op.drop_index('ix_familymember_invite_token', table_name='familymember')
    op.drop_index('ix_familymember_email', table_name='familymember')
    op.drop_index('ix_familymember_journey_id', table_name='familymember')
    op.drop_table('familymember')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS familyrole')
    op.execute('DROP TYPE IF EXISTS accesslevel')
