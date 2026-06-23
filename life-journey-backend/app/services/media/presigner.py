from __future__ import annotations

import hashlib
import hmac
import time
from uuid import uuid4

from loguru import logger

from app.core.config import settings
from app.schemas.media import MediaPresignRequest, MediaPresignResponse


# Geldigheidsduur van een ondertekende upload-URL (capability).
_UPLOAD_URL_TTL_SECONDS = 3600


def _sign_upload(object_key: str, expires_at: int) -> str:
    """Bereken de HMAC-handtekening voor een upload-capability."""
    message = f"{object_key}:{expires_at}".encode()
    secret = (settings.jwt_secret_key or "").encode()
    return hmac.new(secret, message, hashlib.sha256).hexdigest()


def verify_upload_signature(object_key: str, expires_at: int, signature: str) -> bool:
    """
    Verifieer een ondertekende upload-URL.

    De handtekening wordt aangemaakt door ``build_presigned_upload`` op het moment
    dat de geauthenticeerde ``/media/presign``-endpoint de eigenaarscheck al heeft
    uitgevoerd. De upload-URL is daarmee zelf de capability — net als een echte
    S3 presigned URL — zodat de upload-proxy geen aparte Bearer-token nodig heeft.
    """
    if not signature or expires_at <= 0:
        return False
    if time.time() > expires_at:
        return False
    expected = _sign_upload(object_key, expires_at)
    return hmac.compare_digest(expected, signature)


def build_presigned_upload(payload: MediaPresignRequest) -> MediaPresignResponse:
    asset_id = str(uuid4())
    chapter_id_value = payload.chapter_id.value if hasattr(payload.chapter_id, 'value') else str(payload.chapter_id)
    object_key = f"{payload.journey_id}/{chapter_id_value}/{asset_id}/{payload.filename}"

    # Always route through the backend proxy to avoid browser→R2 CORS issues.
    # The local-upload endpoint handles S3/R2 upload server-side when configured.
    # De URL wordt ondertekend zodat de proxy de upload kan autoriseren zonder
    # dat de browser opnieuw een Bearer-token hoeft mee te sturen.
    expires_at = int(time.time()) + _UPLOAD_URL_TTL_SECONDS
    signature = _sign_upload(object_key, expires_at)
    upload_url = (
        f"{settings.api_base_url}/api/v1/media/local-upload/{object_key}"
        f"?exp={expires_at}&sig={signature}"
    )

    logger.info(f"Generated signed backend proxy upload URL for asset {asset_id}")
    return MediaPresignResponse(
        upload_url=upload_url,
        asset_id=asset_id,
        upload_method="PUT",
        object_key=object_key,
    )
