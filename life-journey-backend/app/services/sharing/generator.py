"""
Share invite generator service.

Creates share grants and generates magic links for sharing journey content.
"""

from uuid import uuid4
from datetime import datetime, timezone
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from app.models.sharing import ShareGrant as ShareGrantModel
from app.schemas.sharing import ShareInviteRequest, ShareInviteResponse
from app.schemas.common import ShareGrant as ShareGrantSchema


def generate_magic_token() -> str:
    """Generate a secure magic token for share links."""
    return str(uuid4())


def create_share_invite(
    journey_id: str,
    payload: ShareInviteRequest,
    db: Optional[Session] = None,
) -> ShareInviteResponse:
    """
    Create a new share invite for a journey.

    Args:
        journey_id: ID of the journey to share
        payload: Share invite request with recipient details
        db: Database session (optional, for persistence)

    Returns:
        ShareInviteResponse with grant details and magic link
    """
    grant_id = str(uuid4())
    magic_token = generate_magic_token()

    # Create the database model
    grant_model = ShareGrantModel(
        id=grant_id,
        journey_id=journey_id,
        issued_to=payload.recipient_name,
        email=payload.recipient_email,
        chapter_ids=[c.value for c in payload.chapter_ids],
        expires_at=payload.expires_at,
        status="pending",
    )

    # Persist if database session provided
    if db is not None:
        db.add(grant_model)
        db.commit()
        db.refresh(grant_model)
        logger.info(f"Created share grant {grant_id} for journey {journey_id}")

    # Create schema for response
    grant_schema = ShareGrantSchema(
        id=grant_id,
        issued_to=payload.recipient_name,
        email=payload.recipient_email,
        granted_by=journey_id,
        chapter_ids=payload.chapter_ids,
        expires_at=payload.expires_at,
        status="pending",
    )

    # Generate magic link
    magic_link = f"https://life-journey.app/share/{magic_token}"

    return ShareInviteResponse(grant=grant_schema, magic_link=magic_link)


def activate_grant(db: Session, grant_id: str) -> bool:
    """
    Activate a pending share grant (when recipient accepts the invite).

    Args:
        db: Database session
        grant_id: ID of the grant to activate

    Returns:
        True if activated, False if not found or already active/expired
    """
    grant = db.query(ShareGrantModel).filter(ShareGrantModel.id == grant_id).first()

    if grant is None:
        return False

    if grant.status != "pending":
        logger.warning(f"Cannot activate grant {grant_id} with status {grant.status}")
        return False

    # Check if already expired
    if grant.expires_at is not None:
        now = datetime.now(timezone.utc)
        if grant.expires_at < now:
            grant.status = "expired"
            db.commit()
            logger.info(f"Grant {grant_id} already expired before activation")
            return False

    grant.status = "active"
    db.commit()
    logger.info(f"Activated share grant {grant_id}")

    return True
