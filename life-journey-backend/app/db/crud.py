"""
CRUD operations for database models
"""
import uuid
from sqlalchemy.orm import Session

from app.models.media import MediaAsset, TranscriptSegment


def get_media_asset(db: Session, asset_id: str) -> MediaAsset | None:
    """Get a media asset by ID"""
    return db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()


def create_transcript_segment(
    db: Session,
    media_asset_id: str,
    text: str,
    start_ms: int,
    end_ms: int,
    sentiment: str | None = None,
    emotion_hint: str | None = None,
) -> TranscriptSegment:
    """Create a new transcript segment"""
    segment = TranscriptSegment(
        id=str(uuid.uuid4()),
        media_asset_id=media_asset_id,
        text=text,
        start_ms=start_ms,
        end_ms=end_ms,
        sentiment=sentiment,
        emotion_hint=emotion_hint,
    )
    db.add(segment)
    return segment
