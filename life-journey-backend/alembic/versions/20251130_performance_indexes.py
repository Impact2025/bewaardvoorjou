"""Add performance indexes for common query patterns

Revision ID: 20251130_performance_indexes
Revises: 20251103_add_memos
Create Date: 2025-11-30

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '20251130_performance_indexes'
down_revision = '20251103_add_memos'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Composite indexes for common chapter-based queries

    # MediaAsset: frequently queried by journey_id + chapter_id together
    op.create_index(
        'ix_mediaasset_journey_chapter',
        'mediaasset',
        ['journey_id', 'chapter_id']
    )

    # MediaAsset: for sorting by recorded_at within a journey
    op.create_index(
        'ix_mediaasset_journey_recorded',
        'mediaasset',
        ['journey_id', 'recorded_at']
    )

    # PromptRun: frequently queried by journey_id + chapter_id
    op.create_index(
        'ix_promptrun_journey_chapter',
        'promptrun',
        ['journey_id', 'chapter_id']
    )

    # Highlight: frequently queried by journey_id + chapter_id
    op.create_index(
        'ix_highlight_journey_chapter',
        'highlight',
        ['journey_id', 'chapter_id']
    )

    # ShareGrant: for status filtering
    op.create_index(
        'ix_sharegrant_status',
        'sharegrant',
        ['status']
    )

    # ShareGrant: for expiry enforcement queries
    op.create_index(
        'ix_sharegrant_status_expires',
        'sharegrant',
        ['status', 'expires_at']
    )

    # Memo: for sorting by created_at within a journey
    op.create_index(
        'ix_memo_journey_created',
        'memo',
        ['journey_id', 'created_at']
    )

    # TranscriptSegment: for time-based segment lookups
    op.create_index(
        'ix_transcriptsegment_asset_time',
        'transcriptsegment',
        ['media_asset_id', 'start_ms']
    )


def downgrade() -> None:
    op.drop_index('ix_transcriptsegment_asset_time', table_name='transcriptsegment')
    op.drop_index('ix_memo_journey_created', table_name='memo')
    op.drop_index('ix_sharegrant_status_expires', table_name='sharegrant')
    op.drop_index('ix_sharegrant_status', table_name='sharegrant')
    op.drop_index('ix_highlight_journey_chapter', table_name='highlight')
    op.drop_index('ix_promptrun_journey_chapter', table_name='promptrun')
    op.drop_index('ix_mediaasset_journey_recorded', table_name='mediaasset')
    op.drop_index('ix_mediaasset_journey_chapter', table_name='mediaasset')
