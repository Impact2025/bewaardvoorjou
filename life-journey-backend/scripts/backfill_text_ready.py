"""
One-time backfill: text media assets stuck in storage_state='processing'.

Root cause: media.py:/complete sets storage_state='processing' and enqueues
Celery jobs (transcode/transcript). The `media.transcript` task early-returns
for non-audio/video files, so the state is never advanced to 'ready' for text.
Result: text records stay 'processing' forever -> excluded from backups/exports
and not reflected as truly saved.

Fix: text assets are fully saved the moment /complete runs (transcode/transcript
are N/A), so set them to 'ready' immediately. This script applies that to the
already-stuck rows. New saves are fixed in the route itself.

Run: python scripts/backfill_text_ready.py            # dry run (default)
      python scripts/backfill_text_ready.py --apply    # actually write
"""
import os
import re
import sys

import psycopg

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")


def get_conn():
    with open(ENV_PATH) as f:
        env = f.read()
    m = re.search(r"DATABASE_URL\s*=\s*postgresql\+psycopg://(\S+)", env)
    if not m:
        raise RuntimeError("DATABASE_URL not found in .env")
    return psycopg.connect("postgresql://" + m.group(1))


def main():
    apply = "--apply" in sys.argv
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, chapter_id, modality, storage_state, size_bytes, recorded_at
        FROM mediaasset
        WHERE modality = 'text' AND storage_state = 'processing'
        ORDER BY recorded_at DESC
        """
    )
    rows = cur.fetchall()
    print(f"Found {len(rows)} text asset(s) in 'processing' state.")
    for r in rows:
        print("  ", r)

    if not rows:
        print("Nothing to fix. Exiting.")
        return

    if not apply:
        print("\nDRY RUN — no changes made. Re-run with --apply to write.")
        return

    cur.execute(
        """
        UPDATE mediaasset
        SET storage_state = 'ready'
        WHERE modality = 'text' AND storage_state = 'processing'
        """
    )
    conn.commit()
    print(f"\nApplied: set {cur.rowcount} text asset(s) to 'ready'.")


if __name__ == "__main__":
    main()
