"""
Recover text_content from R2/S3 for text assets that lost their content.

WHY: text used to be stored only as a .txt object; Railway's local disk is
ephemeral and S3_ENDPOINT_URL was empty, so text became unreadable after
redeploys. Text is now stored in mediaasset.text_content (DB = source of truth).
This script backfills existing rows by reading the original .txt back from R2/S3
(or local disk) into text_content.

RUN THIS IN THE RAILWAY CONSOLE (Service -> Console tab), so it inherits the
production env (DATABASE_URL, S3 creds, S3_ENDPOINT_URL):

    python scripts/backfill_text_from_r2.py            # dry run (no writes)
    python scripts/backfill_text_from_r2.py --apply    # write to DB

Idempotent: only touches text assets where text_content IS NULL.
"""
import sys

import boto3

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.media import MediaAsset
from app.services.media.local_storage import local_storage


def main() -> None:
    apply = "--apply" in sys.argv
    db = SessionLocal()

    assets = (
        db.query(MediaAsset)
        .filter(MediaAsset.modality == "text", MediaAsset.text_content.is_(None))
        .all()
    )

    s3 = None
    if settings.s3_bucket and settings.aws_access_key_id and settings.aws_secret_access_key:
        endpoint_url = settings.s3_endpoint_url
        if not endpoint_url and settings.s3_region:
            endpoint_url = f"https://s3.{settings.s3_region}.amazonaws.com"
        s3 = boto3.client(
            "s3",
            region_name=settings.s3_region,
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

    print(f"S3/R2 configured: {s3 is not None} | endpoint: {settings.s3_endpoint_url or '(default AWS)'}")
    print(f"Candidates (text assets without text_content): {len(assets)}")

    recovered = from_s3 = from_local = missing = 0
    missing_ids = []

    for a in assets:
        text_value = None
        if s3 is not None:
            try:
                obj = s3.get_object(Bucket=settings.s3_bucket, Key=a.object_key)
                text_value = obj["Body"].read().decode("utf-8", errors="replace")
                from_s3 += 1
            except Exception:
                text_value = None
        if text_value is None:
            try:
                fp = local_storage.get_file_path(a.object_key)
                if fp.exists():
                    text_value = fp.read_text(encoding="utf-8", errors="replace")
                    from_local += 1
            except Exception:
                text_value = None

        if text_value is None:
            missing += 1
            if len(missing_ids) < 50:
                missing_ids.append(a.id)
            continue

        recovered += 1
        if apply:
            a.text_content = text_value
            a.storage_state = "ready"
            db.add(a)

    if apply:
        db.commit()

    print("--- RESULT ---")
    print(f"recovered   : {recovered}  (from_s3={from_s3}, from_local={from_local})")
    print(f"missing     : {missing}  (content no longer in any storage)")
    if missing_ids:
        print(f"missing_ids (sample): {missing_ids}")
    print(f"mode        : {'APPLIED (written to DB)' if apply else 'DRY RUN (no writes) — re-run with --apply'}")


if __name__ == "__main__":
    main()
