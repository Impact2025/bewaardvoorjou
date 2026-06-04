"""add_support_tickets

Revision ID: 37bf0b71e223
Revises: 20260603_conv_sessions
Create Date: 2026-06-04
"""

revision = '37bf0b71e223'
down_revision = '20260603_conv_sessions'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.create_table(
        'supportticket',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('ticket_number', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('guest_name', sa.String(length=128), nullable=True),
        sa.Column('guest_email', sa.String(length=255), nullable=True),
        sa.Column('category', sa.String(length=32), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('priority', sa.String(length=16), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_number'),
    )
    op.create_index('ix_supportticket_category', 'supportticket', ['category'])
    op.create_index('ix_supportticket_created_at', 'supportticket', ['created_at'])
    op.create_index('ix_supportticket_guest_email', 'supportticket', ['guest_email'])
    op.create_index('ix_supportticket_priority', 'supportticket', ['priority'])
    op.create_index('ix_supportticket_status', 'supportticket', ['status'])
    op.create_index('ix_supportticket_user_id', 'supportticket', ['user_id'])

    op.create_table(
        'ticketmessage',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('ticket_id', sa.String(), nullable=False),
        sa.Column('sender_type', sa.String(length=16), nullable=False),
        sa.Column('sender_name', sa.String(length=128), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_internal', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['ticket_id'], ['supportticket.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_ticketmessage_created_at', 'ticketmessage', ['created_at'])
    op.create_index('ix_ticketmessage_ticket_id', 'ticketmessage', ['ticket_id'])


def downgrade() -> None:
    op.drop_index('ix_ticketmessage_ticket_id', table_name='ticketmessage')
    op.drop_index('ix_ticketmessage_created_at', table_name='ticketmessage')
    op.drop_table('ticketmessage')
    op.drop_index('ix_supportticket_user_id', table_name='supportticket')
    op.drop_index('ix_supportticket_status', table_name='supportticket')
    op.drop_index('ix_supportticket_priority', table_name='supportticket')
    op.drop_index('ix_supportticket_guest_email', table_name='supportticket')
    op.drop_index('ix_supportticket_created_at', table_name='supportticket')
    op.drop_index('ix_supportticket_category', table_name='supportticket')
    op.drop_table('supportticket')
