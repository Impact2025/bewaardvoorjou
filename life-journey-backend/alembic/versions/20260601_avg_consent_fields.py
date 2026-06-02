"""avg_consent_fields — AVG/GDPR consent kolommen op user tabel

Voegt vier kolommen toe die nodig zijn voor AVG-compliance (Art. 6, 9, 17):
- terms_accepted_at              : timestamp aanvaarding AV + privacyverklaring
- consent_special_categories_at : timestamp toestemming bijzondere categorieën (audio/video/emotie)
- consent_marketing              : boolean toestemming marketing e-mails
- deletion_requested_at          : timestamp wissingsverzoek (Art. 17)

Revision ID: 20260601_avg_consent
Revises: 20260525_memory_cache
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa

revision = "20260601_avg_consent"
down_revision = "20260525_memory_cache"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user", sa.Column("terms_accepted_at", sa.DateTime(), nullable=True))
    op.add_column("user", sa.Column("consent_special_categories_at", sa.DateTime(), nullable=True))
    op.add_column(
        "user",
        sa.Column("consent_marketing", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column("user", sa.Column("deletion_requested_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("user", "deletion_requested_at")
    op.drop_column("user", "consent_marketing")
    op.drop_column("user", "consent_special_categories_at")
    op.drop_column("user", "terms_accepted_at")
