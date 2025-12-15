from __future__ import annotations

from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError
from loguru import logger

from app.core.config import settings
from app.schemas.media import MediaPresignRequest, MediaPresignResponse
from app.services.media.local_storage import local_storage


def build_presigned_upload(payload: MediaPresignRequest) -> MediaPresignResponse:
  asset_id = str(uuid4())
  # Use .value to get the string value of the enum (e.g. "intro-reflection" instead of "ChapterId.intro_reflection")
  chapter_id_value = payload.chapter_id.value if hasattr(payload.chapter_id, 'value') else str(payload.chapter_id)
  object_key = f"{payload.journey_id}/{chapter_id_value}/{asset_id}/{payload.filename}"

  # Try S3 first if configured
  if settings.s3_bucket:
    try:
      client = boto3.client(
        "s3",
        region_name=settings.s3_region,
        endpoint_url=settings.s3_endpoint_url,
      )
      presigned = client.generate_presigned_post(
        Bucket=settings.s3_bucket,
        Key=object_key,
        Fields={"Content-Type": "application/octet-stream"},
        Conditions=[{"Content-Type": "application/octet-stream"}],
        ExpiresIn=900,
      )
      logger.info(f"Generated S3 presigned URL for asset {asset_id}")
      return MediaPresignResponse(
        upload_url=presigned["url"],
        asset_id=asset_id,
        upload_method="POST",
        fields=presigned["fields"],
        object_key=object_key,
      )
    except (BotoCoreError, NoCredentialsError) as exc:
      logger.warning(f"S3 credentials not configured, falling back to local storage: {exc}")
    except Exception as exc:
      logger.warning(f"Error generating S3 presigned URL, falling back to local storage: {exc}")

  # Fallback to local storage for development
  logger.info(f"Using local storage for asset {asset_id}")

  # Generate upload URL with the asset_id included in the path
  upload_url = f"http://localhost:8000/api/v1/media/local-upload/{object_key}"

  return MediaPresignResponse(
    upload_url=upload_url,
    asset_id=asset_id,
    upload_method="PUT",
    object_key=object_key,
  )
