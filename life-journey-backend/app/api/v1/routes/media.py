from datetime import datetime, timezone
from typing import BinaryIO

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Request
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.media import MediaAsset as MediaAssetModel
from app.models.journey import Journey as JourneyModel
from app.models.user import User
from app.schemas.media import MediaAsset, MediaPresignRequest, MediaPresignResponse
from app.services.media.presigner import build_presigned_upload
from app.services.media.processor import enqueue_transcode_job, enqueue_transcript_job
from app.services.media.local_storage import local_storage
from app.services.media.validators import validate_upload_file, validate_object_key, validate_file_extension
from app.services.email.events import trigger_chapter_complete_email, trigger_milestone_email
from app.api.deps import get_current_user
from app.core.rate_limiter import limiter, RateLimits
from app.core.config import settings
from loguru import logger

import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError


router = APIRouter()


def _ensure_journey(journey_id: str, db: Session, user: User) -> JourneyModel:
  journey = db.query(JourneyModel).filter(JourneyModel.id == journey_id).first()
  if journey is None or journey.user_id != user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")
  return journey


@router.post("/presign", response_model=MediaPresignResponse)
@limiter.limit(RateLimits.MEDIA_UPLOAD)
def presign_upload(
  request: Request,
  payload: MediaPresignRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> MediaPresignResponse:
  _ensure_journey(payload.journey_id, db, current_user)
  response = build_presigned_upload(payload)

  # Use the object_key from the presign response (which includes chapter_id in the path)
  asset = MediaAssetModel(
    id=response.asset_id,
    journey_id=payload.journey_id,
    chapter_id=payload.chapter_id.value,
    modality=payload.modality.value,
    object_key=response.object_key,
    original_filename=payload.filename,
    size_bytes=payload.size_bytes,
    storage_state="pending",
    recorded_at=datetime.now(timezone.utc),
  )

  db.add(asset)
  db.commit()

  return response


@router.delete("/{asset_id}")
@limiter.limit(RateLimits.WRITE_STANDARD)
def delete_recording(
  request: Request,
  asset_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> dict[str, str]:
  """
  Delete a media recording and its associated file
  """
  asset = db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id).first()
  if asset is None:
    raise HTTPException(status_code=404, detail="Media-item niet gevonden")

  journey = db.query(JourneyModel).filter(JourneyModel.id == asset.journey_id).first()
  if journey is None or journey.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot dit media-item")

  # Delete the file from storage if it exists
  if asset.object_key:
    try:
      local_storage.delete_file(asset.object_key)
    except Exception as e:
      # Log but don't fail if file deletion fails
      print(f"Warning: Could not delete file {asset.object_key}: {e}")

  # Delete from database
  db.delete(asset)
  db.commit()

  return {"status": "deleted", "asset_id": asset_id}


@router.get("/{journey_id}", response_model=list[MediaAsset])
@limiter.limit(RateLimits.READ_STANDARD)
def list_media(
  request: Request,
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> list[MediaAsset]:
  _ensure_journey(journey_id, db, current_user)
  assets = (
    db.query(MediaAssetModel)
    .filter(MediaAssetModel.journey_id == journey_id)
    .order_by(MediaAssetModel.recorded_at.desc())
    .all()
  )
  return [
    MediaAsset(
      id=item.id,
      chapter_id=item.chapter_id,
      modality=item.modality,
      filename=item.original_filename,
      duration_seconds=item.duration_seconds,
      size_bytes=item.size_bytes,
      storage_state=item.storage_state,
      recorded_at=item.recorded_at,
      object_key=item.object_key,
    )
    for item in assets
  ]


@router.post("/{asset_id}/complete", status_code=202)
@limiter.limit(RateLimits.WRITE_STANDARD)
def finalize_upload(
  request: Request,
  asset_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> dict[str, str]:
  asset = db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id).first()
  if asset is None:
    raise HTTPException(status_code=404, detail="Media-item niet gevonden")

  journey = db.query(JourneyModel).filter(JourneyModel.id == asset.journey_id).first()
  if journey is None or journey.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot dit media-item")

  asset.storage_state = "processing"
  asset.recorded_at = asset.recorded_at or datetime.now(timezone.utc)
  db.add(asset)
  db.commit()

  enqueue_transcode_job(asset_id)
  enqueue_transcript_job(asset_id)

  # Trigger email notifications
  try:
    # Chapter completion email
    trigger_chapter_complete_email(db, current_user.id, journey.id, asset.chapter_id)

    # Milestone unlock emails
    if asset.chapter_id == "future-gratitude":
      # Last chapter of fase 5 → unlocks bonus chapters
      trigger_milestone_email(db, current_user.id, journey.id, "bonus")
    elif asset.chapter_id == "bonus-culture":
      # Last bonus chapter → unlocks deep chapters
      trigger_milestone_email(db, current_user.id, journey.id, "deep")
  except Exception as e:
    logger.warning(f"Failed to trigger email for asset {asset_id}: {e}")
    # Don't fail the upload if email fails

  return {"status": "queued"}


@router.put("/local-upload/{object_key:path}")
@limiter.limit(RateLimits.MEDIA_UPLOAD)
async def local_upload(
  request: Request,
  object_key: str,
  db: Session = Depends(get_db),
) -> dict[str, str]:
  """
  Local storage upload endpoint (for development without S3)

  Security features:
  - File type validation (only allowed extensions)
  - File size limits (500MB video, 100MB audio, 10MB text)
  - Filename sanitization
  - Path traversal protection
  """
  import logging
  import io
  logger = logging.getLogger(__name__)

  try:
    logger.info(f"Local upload attempt - object_key: {object_key}")

    # Check if this is a multipart form upload
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
      # Parse FormData and extract the file
      form = await request.form()
      file = form.get("file")
      if file and hasattr(file, "read"):
        body = await file.read()
      else:
        raise HTTPException(status_code=400, detail="No file in form data")
    else:
      # Read raw body
      body = await request.body()

    logger.info(f"Received {len(body)} bytes")

    # Extract filename from object_key (last part of path)
    filename = object_key.split("/")[-1]
    logger.info(f"Extracted filename: {filename}")

    # Validate extension
    extension = validate_file_extension(filename)

    # Validate and sanitize object key (prevent path traversal)
    safe_object_key = validate_object_key(object_key)

    # Save file to local storage (wrap bytes in BytesIO for compatibility)
    file_like = io.BytesIO(body)
    stored_key = local_storage.save_file(safe_object_key, file_like)

    # Update asset status
    # Extract asset_id from object_key (format: journey_id/chapter_id/asset_id/filename)
    parts = safe_object_key.split("/")
    if len(parts) >= 3:
      asset_id = parts[2]
      asset = db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id).first()
      if asset:
        asset.storage_state = "ready"
        db.add(asset)
        db.commit()

    return {"status": "uploaded", "object_key": stored_key}
  except HTTPException as e:
    # Log and re-raise validation errors
    logger.error(f"Validation error in local_upload: {e.detail}")
    raise
  except Exception as e:
    logger.error(f"Unexpected error in local_upload: {str(e)}")
    raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/local-file/{object_key:path}")
@limiter.limit(RateLimits.MEDIA_READ)
async def serve_local_file(request: Request, object_key: str) -> FileResponse:
  """
  Serve files from local storage (for development without S3)
  """
  file_path = local_storage.get_file_path(object_key)

  if not file_path.exists():
    raise HTTPException(status_code=404, detail="File not found")

  # Determine media type based on file extension
  suffix = file_path.suffix.lower()
  media_type_map = {
    ".webm": "video/webm",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".txt": "text/plain",
  }
  media_type = media_type_map.get(suffix, "application/octet-stream")

  return FileResponse(
    path=str(file_path),
    media_type=media_type,
    filename=file_path.name,
  )


@router.get("/file/{object_key:path}")
@limiter.limit(RateLimits.MEDIA_READ)
async def serve_file(request: Request, object_key: str):
  """
  Serve files from S3 (production) or local storage (development).
  For S3, redirects to a presigned URL for direct download.
  """
  # Try S3 first if configured
  if settings.s3_bucket and settings.aws_access_key_id and settings.aws_secret_access_key:
    try:
      # Use explicit endpoint URL for the region, or construct it from region
      endpoint_url = settings.s3_endpoint_url
      if not endpoint_url and settings.s3_region:
        endpoint_url = f"https://s3.{settings.s3_region}.amazonaws.com"

      client = boto3.client(
        "s3",
        region_name=settings.s3_region,
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
      )

      # Generate presigned GET URL (valid for 1 hour)
      presigned_url = client.generate_presigned_url(
        "get_object",
        Params={
          "Bucket": settings.s3_bucket,
          "Key": object_key,
        },
        ExpiresIn=3600,
      )

      logger.info(f"Redirecting to S3 presigned URL for {object_key}")
      return RedirectResponse(url=presigned_url, status_code=302)

    except (BotoCoreError, NoCredentialsError) as exc:
      logger.warning(f"S3 not available, trying local storage: {exc}")
    except Exception as exc:
      logger.warning(f"Error generating S3 presigned URL: {exc}")

  # Fallback to local storage
  file_path = local_storage.get_file_path(object_key)

  if not file_path.exists():
    raise HTTPException(status_code=404, detail="File not found")

  # Determine media type based on file extension
  suffix = file_path.suffix.lower()
  media_type_map = {
    ".webm": "video/webm",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".txt": "text/plain",
  }
  media_type = media_type_map.get(suffix, "application/octet-stream")

  return FileResponse(
    path=str(file_path),
    media_type=media_type,
    filename=file_path.name,
  )
