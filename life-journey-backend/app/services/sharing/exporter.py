"""GDPR-compliant journey export — builds a ZIP in memory and uploads to S3."""
from __future__ import annotations

import io
import json
import secrets
import zipfile
from datetime import datetime, timedelta, timezone
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.journey import Journey
from app.models.media import MediaAsset, TranscriptSegment, PromptRun
from app.models.memo import Memo


def _build_s3_client():
  endpoint_url = settings.s3_endpoint_url
  if not endpoint_url and settings.s3_region:
    endpoint_url = f"https://s3.{settings.s3_region}.amazonaws.com"
  return boto3.client(
    "s3",
    region_name=settings.s3_region,
    endpoint_url=endpoint_url,
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
  )


def _format_date(dt: datetime | None) -> str:
  if dt is None:
    return "onbekend"
  if dt.tzinfo is None:
    dt = dt.replace(tzinfo=timezone.utc)
  return dt.strftime("%d-%m-%Y %H:%M UTC")


def generate_export_bundle(journey_id: str, db: Session) -> dict[str, str]:
  """
  Build a ZIP export for a journey and upload to S3.
  Returns bundle_id, download_url, and expires_at.
  Falls back to a local placeholder URL when S3 is not configured.
  """
  journey: Journey | None = db.query(Journey).filter(Journey.id == journey_id).first()
  if not journey:
    raise ValueError(f"Journey {journey_id} not found")

  media_assets: list[MediaAsset] = (
    db.query(MediaAsset)
    .filter(MediaAsset.journey_id == journey_id)
    .order_by(MediaAsset.recorded_at)
    .all()
  )

  asset_ids = [a.id for a in media_assets]
  transcripts: list[TranscriptSegment] = []
  if asset_ids:
    transcripts = (
      db.query(TranscriptSegment)
      .filter(TranscriptSegment.media_asset_id.in_(asset_ids))
      .order_by(TranscriptSegment.start_ms)
      .all()
    )

  prompt_runs: list[PromptRun] = (
    db.query(PromptRun)
    .filter(PromptRun.journey_id == journey_id)
    .order_by(PromptRun.created_at)
    .all()
  )

  memos: list[Memo] = (
    db.query(Memo)
    .filter(Memo.journey_id == journey_id)
    .order_by(Memo.created_at)
    .all()
  )

  # Build transcript index: asset_id → sorted segments
  transcript_by_asset: dict[str, list[TranscriptSegment]] = {}
  for seg in transcripts:
    transcript_by_asset.setdefault(seg.media_asset_id, []).append(seg)

  # Build transcript index: chapter_id → full text
  transcript_by_chapter: dict[str, list[str]] = {}
  for asset in media_assets:
    segs = transcript_by_asset.get(asset.id, [])
    full_text = " ".join(s.text for s in sorted(segs, key=lambda s: s.start_ms))
    if full_text:
      transcript_by_chapter.setdefault(asset.chapter_id, []).append(full_text)

  bundle_id = secrets.token_urlsafe(16)
  zip_buffer = io.BytesIO()

  with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
    # ── journey metadata ────────────────────────────────────────────────────
    journey_meta: dict[str, Any] = {
      "journey_id": journey.id,
      "title": journey.title,
      "created_at": _format_date(journey.created_at),
      "updated_at": _format_date(journey.updated_at),
      "chapters_completed": len([k for k, v in (journey.progress or {}).items() if v >= 1.0]),
      "progress": journey.progress or {},
      "export_generated_at": _format_date(datetime.now(timezone.utc)),
    }
    zf.writestr("metadata/journey.json", json.dumps(journey_meta, ensure_ascii=False, indent=2))

    # ── per-chapter transcripties ───────────────────────────────────────────
    for chapter_id, texts in transcript_by_chapter.items():
      full_transcript = "\n\n---\n\n".join(texts)
      zf.writestr(
        f"transcripties/{chapter_id}.txt",
        f"Hoofdstuk: {chapter_id}\n{'=' * 60}\n\n{full_transcript}\n",
      )

    # ── vragen per chapter (prompt runs) ───────────────────────────────────
    vragen: list[dict[str, Any]] = []
    for pr in prompt_runs:
      vragen.append({
        "chapter_id": pr.chapter_id,
        "vraag": pr.prompt,
        "doorvragen": pr.follow_ups,
        "gesteld_op": _format_date(pr.created_at),
      })
    zf.writestr("metadata/vragen.json", json.dumps(vragen, ensure_ascii=False, indent=2))

    # ── notities / memo's ───────────────────────────────────────────────────
    memos_data: list[dict[str, Any]] = [
      {
        "titel": m.title,
        "hoofdstuk": m.chapter_id,
        "inhoud": m.content,
        "aangemaakt": _format_date(m.created_at),
      }
      for m in memos
    ]
    if memos_data:
      zf.writestr("metadata/notities.json", json.dumps(memos_data, ensure_ascii=False, indent=2))

    # ── media URL lijst (audio/video te groot voor ZIP) ─────────────────────
    media_refs: list[dict[str, Any]] = []
    for asset in media_assets:
      media_refs.append({
        "asset_id": asset.id,
        "chapter_id": asset.chapter_id,
        "type": asset.modality,
        "bestandsnaam": asset.original_filename,
        "duur_seconden": asset.duration_seconds,
        "opgenomen_op": _format_date(asset.recorded_at),
        "status": asset.storage_state,
        "object_key": asset.object_key,
      })
    zf.writestr("media/media_overzicht.json", json.dumps(media_refs, ensure_ascii=False, indent=2))

    # ── README ──────────────────────────────────────────────────────────────
    readme = (
      "Bewaardvoorjou — Export van je levensverhaal\n"
      "============================================\n\n"
      "Dit archief bevat:\n"
      "  transcripties/   — Volledige tekst van elk verhaal-fragment\n"
      "  metadata/        — Metadata, vragen en notities in JSON-formaat\n"
      "  media/           — Overzicht van audio- en video-opnames (bestanden zelf zijn niet inbegrepen\n"
      "                     vanwege bestandsgrootte; neem contact op voor een volledige media-download)\n\n"
      f"Gegenereerd op: {_format_date(datetime.now(timezone.utc))}\n"
      f"Journey: {journey.title}\n"
    )
    zf.writestr("README.txt", readme)

  zip_buffer.seek(0)
  zip_bytes = zip_buffer.read()

  # Try upload to S3
  if settings.s3_bucket and settings.aws_access_key_id and settings.aws_secret_access_key:
    try:
      s3 = _build_s3_client()
      object_key = f"exports/{journey_id}/{bundle_id}.zip"
      s3.put_object(
        Bucket=settings.s3_bucket,
        Key=object_key,
        Body=zip_bytes,
        ContentType="application/zip",
        ContentDisposition=f'attachment; filename="bewaardvoorjou_export_{bundle_id}.zip"',
      )
      presigned_url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket, "Key": object_key},
        ExpiresIn=86400,  # 24 hours
      )
      expires_at = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
      logger.info(f"Export bundle {bundle_id} uploaded to S3 for journey {journey_id}")
      return {
        "bundle_id": bundle_id,
        "download_url": presigned_url,
        "expires_at": expires_at,
      }
    except (BotoCoreError, NoCredentialsError) as exc:
      logger.warning(f"S3 upload failed for export {bundle_id}: {exc}")
    except Exception as exc:
      logger.warning(f"Export S3 upload error: {exc}")

  # Fallback: save to local media_storage and serve via local endpoint
  from pathlib import Path
  exports_dir = Path("media_storage") / "exports"
  exports_dir.mkdir(parents=True, exist_ok=True)
  local_path = exports_dir / f"{bundle_id}.zip"
  local_path.write_bytes(zip_bytes)
  download_url = f"{settings.api_base_url}/api/v1/sharing/export/download/{bundle_id}"
  expires_at = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
  logger.info(f"Export bundle {bundle_id} saved locally for journey {journey_id}")
  return {
    "bundle_id": bundle_id,
    "download_url": download_url,
    "expires_at": expires_at,
  }
