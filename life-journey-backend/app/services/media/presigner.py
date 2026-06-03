from __future__ import annotations

from uuid import uuid4

from loguru import logger

from app.core.config import settings
from app.schemas.media import MediaPresignRequest, MediaPresignResponse


def build_presigned_upload(payload: MediaPresignRequest) -> MediaPresignResponse:
    asset_id = str(uuid4())
    chapter_id_value = payload.chapter_id.value if hasattr(payload.chapter_id, 'value') else str(payload.chapter_id)
    object_key = f"{payload.journey_id}/{chapter_id_value}/{asset_id}/{payload.filename}"

    # Always route through the backend proxy to avoid browser→R2 CORS issues.
    # The local-upload endpoint handles S3/R2 upload server-side when configured.
    upload_url = f"{settings.api_base_url}/api/v1/media/local-upload/{object_key}"

    logger.info(f"Generated backend proxy upload URL for asset {asset_id}")
    return MediaPresignResponse(
        upload_url=upload_url,
        asset_id=asset_id,
        upload_method="PUT",
        object_key=object_key,
    )
