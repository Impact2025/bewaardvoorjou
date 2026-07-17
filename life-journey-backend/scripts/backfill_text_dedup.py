"""
Backfill: for text media, keep only the latest record per (journey, chapter)
as current; mark older ones superseded (is_current=False, replaced_by=newest).

The presign route now supersedes on every save, but historical duplicates from
before this logic exist. This collapses them so the recordings list shows one
entry per chapter.

Run: python scripts/backfill_text_dedup.py            # dry run
      python scripts/backfill_text_dedup.py --apply    # write
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

    # Groups with >1 current text record. Pick the latest (recorded_at desc) as
    # the survivor; supersede the rest.
    cur.execute(
        """
        SELECT journey_id, chapter_id,
               array_agg(id ORDER BY recorded_at DESC, id DESC) AS ids
        FROM mediaasset
        WHERE modality = 'text' AND is_current = true
        GROUP BY journey_id, chapter_id
        HAVING count(*) > 1
        """
    )
    groups = cur.fetchall()
    plan = []
    for journey_id, chapter_id, ids in groups:
        keep = ids[0]
        supersede = ids[1:]
        plan.append((journey_id, chapter_id, keep, supersede))

    print(f"Found {len(plan)} chapter group(s) with duplicate current text records.")
    total_superseded = 0
    for journey_id, chapter_id, keep, supersede in plan:
        print(f"  {chapter_id}: keep {keep}, supersede {len(supersede)} -> {supersede}")
        total_superseded += len(supersede)

    if not plan:
        print("Nothing to dedup. Exiting.")
        return

    if not apply:
        print(f"\nDRY RUN — would supersede {total_superseded} record(s). Re-run with --apply to write.")
        return

    for journey_id, chapter_id, keep, supersede in plan:
        cur.execute(
            "UPDATE mediaasset SET is_current = false, replaced_by = %s WHERE id = ANY(%s)",
            (keep, supersede),
        )
    conn.commit()
    print(f"\nApplied: superseded {total_superseded} text record(s); kept latest per chapter.")


if __name__ == "__main__":
    main()
