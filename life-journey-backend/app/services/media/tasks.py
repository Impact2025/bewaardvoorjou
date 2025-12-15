import uuid
from celery import Celery
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.db import crud
from app.services.ai.transcriber import transcribe_audio, split_into_segments
from app.services.ai.highlight_detector import detect_highlights, find_text_position, validate_highlight_label
from app.services.media.local_storage import local_storage
from app.models.sharing import Highlight as HighlightModel

celery_app = Celery("life_journey_media")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url.replace("/0", "/1")
# Set short timeout for broker connection (1 second) for fast failure in dev
celery_app.conf.broker_connection_timeout = 1
celery_app.conf.broker_connection_retry = False


@celery_app.task(name="media.transcode")
def transcode_asset(asset_id: str) -> None:
    """
    Transcode media asset for optimal playback
    Currently a placeholder - transcoding not yet implemented
    """
    logger.info(f"Transcoding asset {asset_id}")
    # TODO: Implement actual transcoding logic when needed
    # For now, original files are used directly


@celery_app.task(name="media.transcript")
def generate_transcript(asset_id: str) -> None:
    """
    Generate transcript for media asset using Whisper via OpenRouter

    Args:
        asset_id: ID of the MediaAsset to transcribe
    """
    logger.info(f"Starting transcript generation for asset {asset_id}")

    db: Session = SessionLocal()
    try:
        # Get the media asset
        asset = crud.get_media_asset(db, asset_id)
        if not asset:
            logger.error(f"Media asset {asset_id} not found")
            return

        if not asset.object_key:
            logger.error(f"Media asset {asset_id} has no object_key")
            return

        logger.info(f"Transcribing asset: {asset.original_filename} (modality: {asset.modality})")

        # Get the audio file from storage
        file_path = local_storage.get_file_path(asset.object_key)
        if not file_path or not file_path.exists():
            logger.error(f"File not found for asset {asset_id}: {asset.object_key}")
            return

        # Open the file and transcribe
        with open(file_path, "rb") as audio_file:
            transcribed_text = transcribe_audio(audio_file, asset.original_filename)

        logger.info(f"Transcription complete, creating segments for asset {asset_id}")

        # Split into segments
        segments = split_into_segments(transcribed_text)

        # Save segments to database
        for segment_data in segments:
            crud.create_transcript_segment(
                db=db,
                media_asset_id=asset_id,
                text=segment_data["text"],
                start_ms=segment_data["start_ms"],
                end_ms=segment_data["end_ms"],
            )

        db.commit()
        logger.info(f"Successfully created {len(segments)} transcript segments for asset {asset_id}")

        # Detect highlights in the transcribed text
        try:
            logger.info(f"Detecting highlights for asset {asset_id}")
            highlights = detect_highlights(transcribed_text, asset.chapter_id)

            for highlight_data in highlights:
                label = validate_highlight_label(highlight_data.get("label", ""))
                if not label:
                    continue

                highlight_text = highlight_data.get("text", "")
                if not highlight_text:
                    continue

                # Find position in transcript
                start_ms, end_ms = find_text_position(transcribed_text, highlight_text)

                # Create highlight
                highlight = HighlightModel(
                    id=str(uuid.uuid4()),
                    journey_id=asset.journey_id,
                    media_asset_id=asset_id,
                    chapter_id=asset.chapter_id,
                    label=label.value,
                    start_ms=start_ms,
                    end_ms=end_ms,
                    created_by="ai",
                )
                db.add(highlight)

            db.commit()
            logger.info(f"Successfully created {len(highlights)} AI-detected highlights for asset {asset_id}")

        except Exception as e:
            logger.error(f"Failed to detect highlights for asset {asset_id}: {e}")
            # Don't fail the entire task if highlight detection fails
            db.rollback()

    except Exception as e:
        logger.error(f"Failed to generate transcript for asset {asset_id}: {e}")
        db.rollback()
        raise
    finally:
        db.close()
