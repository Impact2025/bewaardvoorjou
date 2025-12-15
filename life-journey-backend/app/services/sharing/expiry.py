"""
Share grant expiry enforcement service.

Handles automatic expiration of share grants that have passed their expires_at date.
Can be run as a periodic task (via Celery) or called on-demand.
"""

from datetime import datetime, timezone
from typing import Optional

from loguru import logger
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.sharing import ShareGrant


def enforce_expired_grants(db: Session) -> int:
    """
    Find all active share grants that have expired and mark them as expired.

    Args:
        db: Database session

    Returns:
        Number of grants that were expired
    """
    now = datetime.now(timezone.utc)

    # Find all active grants where expires_at has passed
    expired_grants = (
        db.query(ShareGrant)
        .filter(
            and_(
                ShareGrant.status == "active",
                ShareGrant.expires_at.isnot(None),
                ShareGrant.expires_at < now,
            )
        )
        .all()
    )

    count = len(expired_grants)

    if count > 0:
        for grant in expired_grants:
            grant.status = "expired"
            logger.info(f"Expired share grant {grant.id} for journey {grant.journey_id}")

        db.commit()
        logger.info(f"Expired {count} share grants")

    return count


def is_grant_valid(grant: ShareGrant) -> bool:
    """
    Check if a share grant is currently valid.

    A grant is valid if:
    - Status is "active"
    - Either expires_at is None (no expiry) or expires_at is in the future

    Args:
        grant: The ShareGrant to check

    Returns:
        True if the grant is valid, False otherwise
    """
    if grant.status != "active":
        return False

    if grant.expires_at is None:
        return True

    now = datetime.now(timezone.utc)
    return grant.expires_at > now


def get_valid_grant(
    db: Session,
    grant_id: str,
    auto_expire: bool = True
) -> Optional[ShareGrant]:
    """
    Get a share grant by ID, optionally auto-expiring it if past expiry date.

    Args:
        db: Database session
        grant_id: ID of the grant to retrieve
        auto_expire: If True, automatically expire the grant if past expiry

    Returns:
        The ShareGrant if valid, None if not found or invalid
    """
    grant = db.query(ShareGrant).filter(ShareGrant.id == grant_id).first()

    if grant is None:
        return None

    # Check if grant should be expired
    if auto_expire and grant.status == "active":
        if grant.expires_at is not None:
            now = datetime.now(timezone.utc)
            if grant.expires_at < now:
                grant.status = "expired"
                db.commit()
                logger.info(f"Auto-expired share grant {grant_id}")
                return None

    if not is_grant_valid(grant):
        return None

    return grant


def revoke_grant(db: Session, grant_id: str) -> bool:
    """
    Revoke a share grant by marking it as revoked.

    Args:
        db: Database session
        grant_id: ID of the grant to revoke

    Returns:
        True if the grant was revoked, False if not found
    """
    grant = db.query(ShareGrant).filter(ShareGrant.id == grant_id).first()

    if grant is None:
        return False

    if grant.status == "active":
        grant.status = "revoked"
        db.commit()
        logger.info(f"Revoked share grant {grant_id}")

    return True


def cleanup_old_grants(db: Session, days_old: int = 90) -> int:
    """
    Delete grants that have been expired or revoked for a long time.

    This is useful for GDPR compliance and database cleanup.

    Args:
        db: Database session
        days_old: Delete grants expired/revoked more than this many days ago

    Returns:
        Number of grants deleted
    """
    from datetime import timedelta

    cutoff = datetime.now(timezone.utc) - timedelta(days=days_old)

    deleted = (
        db.query(ShareGrant)
        .filter(
            and_(
                ShareGrant.status.in_(["expired", "revoked"]),
                ShareGrant.created_at < cutoff,
            )
        )
        .delete(synchronize_session=False)
    )

    if deleted > 0:
        db.commit()
        logger.info(f"Cleaned up {deleted} old share grants")

    return deleted
