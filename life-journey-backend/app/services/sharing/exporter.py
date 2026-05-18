import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import settings


def generate_export_bundle(journey_id: str) -> dict[str, str]:
  bundle_id = secrets.token_urlsafe(16)
  expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
  download_url = f"{settings.app_base_url}/exports/{bundle_id}.zip"
  return {
    "bundle_id": bundle_id,
    "download_url": download_url,
    "expires_at": expires_at.isoformat(),
  }
