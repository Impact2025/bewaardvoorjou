from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.media import MediaAsset as MediaAssetModel
from app.models.journey import Journey as JourneyModel
from app.models.user import User
from app.schemas.media import MediaAsset, MediaPresignRequest, MediaPresignResponse
from app.services.media.presigner import build_presigned_upload
from app.services.media.processor import enqueue_transcode_job, enqueue_transcript_job
from app.services.media.local_storage import local_storage
from app.services.media.validators import validate_object_key, validate_file_extension
from app.services.entitlements import assert_can_record
from app.services.email.events import trigger_milestone_email
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


def _authorize_object_key(object_key: str, db: Session, user: User) -> str:
  """
  Valideer een object_key en controleer of de ingelogde gebruiker eigenaar is.

  De key heeft de vorm ``journey_id/chapter_id/asset_id/filename``. We leiden de
  asset_id af (segment 2), zoeken het bijbehorende media-item op en controleren
  dat de journey van de gebruiker is. Beschermt tegen path traversal én tegen
  het opvragen van andermans privé-opnames (IDOR).

  Returns:
    De gesaneerde object_key (veilig voor opslag-toegang).
  """
  safe_key = validate_object_key(object_key)
  parts = safe_key.split("/")
  asset_id = parts[2] if len(parts) >= 3 else None

  asset = (
    db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id).first()
    if asset_id else None
  )
  if asset is None:
    raise HTTPException(status_code=404, detail="Media-item niet gevonden")

  journey = db.query(JourneyModel).filter(JourneyModel.id == asset.journey_id).first()
  if journey is None or journey.user_id != user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot dit media-item")

  return safe_key


@router.post("/presign", response_model=MediaPresignResponse)
@limiter.limit(RateLimits.MEDIA_UPLOAD)
def presign_upload(
  request: Request,
  payload: MediaPresignRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> MediaPresignResponse:
  _ensure_journey(payload.journey_id, db, current_user)
  assert_can_record(db, current_user, payload.journey_id, payload.chapter_id.value)

  # Text is edited repeatedly per chapter: keep a single "current" record and
  # supersede the previous one so the recordings list doesn't pile up duplicates.
  if payload.modality.value == "text":
    prev = (
      db.query(MediaAssetModel)
      .filter(
        MediaAssetModel.journey_id == payload.journey_id,
        MediaAssetModel.chapter_id == payload.chapter_id.value,
        MediaAssetModel.modality == "text",
        MediaAssetModel.is_current.is_(True),
      )
      .first()
    )
    if prev:
      prev.is_current = False
      db.add(prev)

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
    is_current=True,
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
  # Hide superseded (old) text versions; show the current version of each save.
  assets = (
    db.query(MediaAssetModel)
    .filter(
      MediaAssetModel.journey_id == journey_id,
      MediaAssetModel.is_current.is_(True),
    )
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
      text_content=item.text_content if item.modality == "text" else None,
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

  # Text is fully stored on /complete (transcribe/transcript are audio/video-only),
  # so mark it ready immediately. Audio/video start in 'processing' and are advanced
  # by the worker; if the worker is unavailable we still flip to 'ready' so playback
  # works (transcript/highlights are best-effort and simply absent).
  asset.recorded_at = asset.recorded_at or datetime.now(timezone.utc)
  db.add(asset)
  db.commit()

  if asset.modality != "text":
    asset.storage_state = "processing"
    db.add(asset)
    db.commit()
    enqueue_transcode_job(asset_id)
    if not enqueue_transcript_job(asset_id):
      logger.warning(
        f"Transcript job not enqueued for {asset_id} (worker unavailable); "
        f"marking asset ready without transcript."
      )
      asset.storage_state = "ready"
      db.add(asset)
      db.commit()

  # Milestone unlock emails (fired on upload, not on chapter-complete)
  try:
    if asset.chapter_id == "future-gratitude":
      trigger_milestone_email(db, current_user.id, journey.id, "bonus")
    elif asset.chapter_id == "bonus-culture":
      trigger_milestone_email(db, current_user.id, journey.id, "deep")
  except Exception as e:
    logger.warning(f"Failed to trigger milestone email for asset {asset_id}: {e}")

  return {"status": "queued"}


@router.get("/{asset_id}/transcript")
@limiter.limit(RateLimits.READ_STANDARD)
def get_transcript(
  request: Request,
  asset_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> dict:
  """
  Get transcript text for a media asset.

  Returns the joined transcript if available, or a 202 with ready=False
  when transcription is still in progress.
  """
  from app.models.media import TranscriptSegment

  asset = db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id).first()
  if asset is None:
    raise HTTPException(status_code=404, detail="Media-item niet gevonden")

  journey = db.query(JourneyModel).filter(JourneyModel.id == asset.journey_id).first()
  if journey is None or journey.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Geen toegang tot dit media-item")

  segments = (
    db.query(TranscriptSegment)
    .filter(TranscriptSegment.media_asset_id == asset_id)
    .order_by(TranscriptSegment.start_ms.asc())
    .all()
  )

  if not segments:
    # Text assets keep their content in text_content (DB is source of truth).
    if asset.modality == "text" and asset.text_content is not None:
      return {"ready": True, "text": asset.text_content, "segment_count": 0}
    # Audio/video still transcribing (or worker unavailable).
    return {"ready": False, "text": None, "storage_state": asset.storage_state}

  text = " ".join(s.text for s in segments)
  return {"ready": True, "text": text, "segment_count": len(segments)}


@router.put("/local-upload/{object_key:path}")
@limiter.limit(RateLimits.MEDIA_UPLOAD)
async def local_upload(
  request: Request,
  object_key: str,
  exp: int = 0,
  sig: str = "",
  db: Session = Depends(get_db),
) -> dict[str, str]:
  """
  Upload endpoint: proxies to S3/R2 when configured, falls back to local storage.

  Security features:
  - Capability-based autorisatie: alleen een door /media/presign ondertekende
    URL (HMAC over object_key + vervaltijd) wordt geaccepteerd. De presign-stap
    heeft de eigenaarscheck al uitgevoerd.
  - File type validation (only allowed extensions)
  - Filename sanitization
  - Path traversal protection
  """
  import io
  from app.core.config import settings as app_settings
  from app.services.media.presigner import verify_upload_signature

  # Autoriseer via de ondertekende upload-URL voordat we iets accepteren.
  if not verify_upload_signature(object_key, exp, sig):
    raise HTTPException(status_code=403, detail="Ongeldige of verlopen upload-URL")

  try:
    logger.info(f"Upload attempt - object_key: {object_key}")

    # Read body — handle both raw and multipart/form-data
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
      form = await request.form()
      file = form.get("file")
      if file and hasattr(file, "read"):
        body = await file.read()
        # Detect content type from the uploaded file part
        file_content_type = getattr(file, "content_type", None) or "application/octet-stream"
      else:
        raise HTTPException(status_code=400, detail="No file in form data")
    else:
      body = await request.body()
      file_content_type = content_type or "application/octet-stream"

    logger.info(f"Received {len(body)} bytes")

    filename = object_key.split("/")[-1]
    validate_file_extension(filename)
    safe_object_key = validate_object_key(object_key)

    # Determine asset_id (format: journey_id/chapter_id/asset_id/filename)
    parts = safe_object_key.split("/")
    asset_id_from_key = parts[2] if len(parts) >= 3 else None

    # --- Text: store content IN the database (source of truth). ---
    # Object storage is ephemeral on Railway; keeping text only as a .txt caused
    # "Kon tekst niet laden" after every redeploy. We still attempt the object
    # upload below for backward-compat, but the DB copy is authoritative.
    if filename.lower().endswith(".txt") and asset_id_from_key:
      try:
        text_value = body.decode("utf-8")
      except UnicodeDecodeError:
        text_value = body.decode("utf-8", errors="replace")
      asset = db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id_from_key).first()
      if asset:
        asset.text_content = text_value
        asset.storage_state = "ready"
        db.add(asset)
        db.commit()
        logger.info(f"Stored text_content in DB for asset {asset_id_from_key} ({len(text_value)} chars)")

    # --- Upload to S3/R2 server-side when configured ---
    if app_settings.s3_bucket and app_settings.aws_access_key_id and app_settings.aws_secret_access_key:
      try:
        endpoint_url = app_settings.s3_endpoint_url
        if not endpoint_url and app_settings.s3_region:
          endpoint_url = f"https://s3.{app_settings.s3_region}.amazonaws.com"

        s3 = boto3.client(
          "s3",
          region_name=app_settings.s3_region,
          endpoint_url=endpoint_url,
          aws_access_key_id=app_settings.aws_access_key_id,
          aws_secret_access_key=app_settings.aws_secret_access_key,
        )
        s3.put_object(
          Bucket=app_settings.s3_bucket,
          Key=safe_object_key,
          Body=body,
          ContentType=file_content_type,
        )
        logger.info(f"Uploaded {len(body)} bytes to R2/S3: {safe_object_key}")

        if asset_id_from_key:
          asset = db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id_from_key).first()
          if asset:
            asset.storage_state = "ready"
            db.add(asset)
            db.commit()

        return {"status": "uploaded", "object_key": safe_object_key}
      except (BotoCoreError, NoCredentialsError) as exc:
        logger.warning(f"S3 credentials error, falling back to local storage: {exc}")
      except Exception as exc:
        logger.warning(f"S3 upload failed, falling back to local storage: {exc}")

    # --- Fallback: local storage ---
    file_like = io.BytesIO(body)
    stored_key = local_storage.save_file(safe_object_key, file_like)

    if asset_id_from_key:
      asset = db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id_from_key).first()
      if asset:
        asset.storage_state = "ready"
        db.add(asset)
        db.commit()

    return {"status": "uploaded", "object_key": stored_key}

  except HTTPException as e:
    logger.error(f"Validation error in local_upload: {e.detail}")
    raise
  except Exception as e:
    logger.error(f"Unexpected error in local_upload: {str(e)}")
    raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/local-file/{object_key:path}")
@limiter.limit(RateLimits.MEDIA_READ)
async def serve_local_file(
  request: Request,
  object_key: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> FileResponse:
  """
  Serve files from local storage (for development without S3).
  Vereist authenticatie en eigenaarschap van het media-item.
  """
  safe_key = _authorize_object_key(object_key, db, current_user)
  file_path = local_storage.get_file_path(safe_key)

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
async def serve_file(
  request: Request,
  object_key: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
  """
  Serve files from S3 (production) or local storage (development).
  Vereist authenticatie en eigenaarschap van het media-item.
  Text files (.txt) are proxied server-side to avoid browser CORS issues with R2.
  Audio/video files return a presigned URL for direct browser playback.
  """
  object_key = _authorize_object_key(object_key, db, current_user)

  # Text: the database is the source of truth (object storage is ephemeral).
  if object_key.endswith(".txt"):
    parts = object_key.split("/")
    asset_id = parts[2] if len(parts) >= 3 else None
    asset = (
      db.query(MediaAssetModel).filter(MediaAssetModel.id == asset_id).first()
      if asset_id else None
    )
    if asset is not None and asset.text_content is not None:
      return {"content": asset.text_content, "type": "local"}

  if settings.s3_bucket and settings.aws_access_key_id and settings.aws_secret_access_key:
    try:
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

      # Text files: proxy content server-side so the browser never touches R2 directly
      if object_key.endswith(".txt"):
        try:
          s3_response = client.get_object(Bucket=settings.s3_bucket, Key=object_key)
          content = s3_response["Body"].read().decode("utf-8")
          logger.info(f"Proxied text content from S3 for {object_key}")
          return {"content": content, "type": "local"}
        except Exception as exc:
          logger.warning(f"Text file not in S3 ({object_key}): {exc}")
          # Fall through to local storage
      else:
        params: dict = {"Bucket": settings.s3_bucket, "Key": object_key}
        if object_key.endswith((".webm", ".mp4", ".m4a")):
          params["ResponseContentType"] = "video/webm" if object_key.endswith(".webm") else "audio/mp4"
        elif object_key.endswith((".mp3", ".wav", ".ogg")):
          params["ResponseContentType"] = "audio/mpeg" if object_key.endswith(".mp3") else f"audio/{object_key.split('.')[-1]}"

        presigned_url = client.generate_presigned_url("get_object", Params=params, ExpiresIn=3600)
        logger.info(f"Generated S3 presigned URL for {object_key}")
        return {"url": presigned_url, "type": "s3"}

    except (BotoCoreError, NoCredentialsError) as exc:
      logger.warning(f"S3 not available, trying local storage: {exc}")
    except Exception as exc:
      logger.warning(f"Error with S3 for {object_key}: {exc}")

  # Fallback to local storage
  file_path = local_storage.get_file_path(object_key)

  if not file_path.exists():
    raise HTTPException(status_code=404, detail="File not found")

  suffix = file_path.suffix.lower()
  if suffix == ".txt":
    with open(file_path, "r", encoding="utf-8") as f:
      content = f.read()
    return {"content": content, "type": "local"}

  media_type_map = {
    ".webm": "video/webm",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
  }
  media_type = media_type_map.get(suffix, "application/octet-stream")

  return FileResponse(
    path=str(file_path),
    media_type=media_type,
    filename=file_path.name,
  )


@router.post("/admin/backfill-text-content")
@limiter.limit(RateLimits.WRITE_STANDARD)
def backfill_text_content(
  request: Request,
  dry_run: bool = True,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> dict:
  """
  Self-healing recovery: for every text asset without text_content, read the
  original .txt from R2/S3 (or local disk) and store it in the DB.

  Runs in production where the R2 credentials live. Admin-only. Idempotent.
  Call with ?dry_run=false to write.
  """
  if not current_user.is_admin:
    raise HTTPException(status_code=403, detail="Admin vereist")

  assets = (
    db.query(MediaAssetModel)
    .filter(MediaAssetModel.modality == "text", MediaAssetModel.text_content.is_(None))
    .all()
  )

  s3_client = None
  if settings.s3_bucket and settings.aws_access_key_id and settings.aws_secret_access_key:
    endpoint_url = settings.s3_endpoint_url
    if not endpoint_url and settings.s3_region:
      endpoint_url = f"https://s3.{settings.s3_region}.amazonaws.com"
    s3_client = boto3.client(
      "s3",
      region_name=settings.s3_region,
      endpoint_url=endpoint_url,
      aws_access_key_id=settings.aws_access_key_id,
      aws_secret_access_key=settings.aws_secret_access_key,
    )

  recovered, from_s3, from_local, missing = 0, 0, 0, 0
  missing_ids: list[str] = []

  for asset in assets:
    text_value = None
    if s3_client is not None:
      try:
        obj = s3_client.get_object(Bucket=settings.s3_bucket, Key=asset.object_key)
        text_value = obj["Body"].read().decode("utf-8", errors="replace")
        from_s3 += 1
      except Exception:
        text_value = None
    if text_value is None:
      try:
        fp = local_storage.get_file_path(asset.object_key)
        if fp.exists():
          text_value = fp.read_text(encoding="utf-8", errors="replace")
          from_local += 1
      except Exception:
        text_value = None

    if text_value is None:
      missing += 1
      if len(missing_ids) < 50:
        missing_ids.append(asset.id)
      continue

    recovered += 1
    if not dry_run:
      asset.text_content = text_value
      asset.storage_state = "ready"
      db.add(asset)

  if not dry_run:
    db.commit()

  return {
    "dry_run": dry_run,
    "candidates": len(assets),
    "recovered": recovered,
    "from_s3": from_s3,
    "from_local": from_local,
    "missing": missing,
    "missing_sample": missing_ids,
    "s3_configured": s3_client is not None,
  }
