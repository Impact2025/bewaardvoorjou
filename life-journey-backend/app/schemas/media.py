from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ChapterId, Modalities


class MediaAsset(BaseModel):
  id: str
  chapter_id: ChapterId
  modality: Modalities
  filename: str
  duration_seconds: int | None = None
  size_bytes: int
  storage_state: str
  recorded_at: datetime
  object_key: str | None = None


class MediaPresignRequest(BaseModel):
  journey_id: str
  chapter_id: ChapterId
  modality: Modalities
  filename: str
  size_bytes: int
  checksum: str


class MediaPresignResponse(BaseModel):
  upload_url: str
  asset_id: str
  upload_method: str = "PUT"
  fields: dict[str, str] | None = None
  expires_in: int = 900
  object_key: str | None = None
