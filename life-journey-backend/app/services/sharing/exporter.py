from datetime import datetime, timedelta, timezone
from uuid import uuid4


def generate_export_bundle(journey_id: str) -> dict[str, str]:
  bundle_id = str(uuid4())
  expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
  download_url = f"https://life-journey.app/exports/{bundle_id}.zip"
  return {
    "bundle_id": bundle_id,
    "download_url": download_url,
    "expires_at": expires_at.isoformat(),
  }
