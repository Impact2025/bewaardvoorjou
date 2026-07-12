"""
Backfill-script: verrijkt alle gepubliceerde kennisbank-artikelen met
contextuele interne links via de gedeelde, idempotente injector.

Bijeen-parity: net als frontend/src/db/backfill-kb-internal-links.ts maar dan
API-gedreven (de backend heeft geen directe HTML-opslag in de repo, de content
woont in de DB en wordt via de publish-API bijgewerkt — consistent met
update_kennisbank.py).

Gebruik:
  # alleen tonen wat er zou gebeuren (schrijft NIETS):
  python backfill_kb_internal_links.py --email admin@example.com --password xxx --dry

  # echt wegschrijven:
  python backfill_kb_internal_links.py --email admin@example.com --password xxx

  # tegen een andere omgeving:
  python backfill_kb_internal_links.py --email ... --password ... \
      --url https://api.bewaardvoorjou.nl/api/v1

Veiligheid:
  - Idempotent: bestaande links naar een doel worden overgeslagen, dus een
    tweede run verandert niets.
  - Per (anchor, target) hooguit 1 link per artikel (leesbaarheid).
  - Alleen gepubliceerde artikelen in sectie "knowledge".
"""
import argparse
import sys

import requests

from app.lib.kb_internal_links import count_kb_links, inject_kb_internal_links

DEFAULT_URL = "http://localhost:8001/api/v1"


def login(base_url: str, email: str, password: str) -> str:
    resp = requests.post(
        f"{base_url}/auth/login",
        json={"email": email, "password": password},
    )
    if resp.status_code != 200:
        print(f"Inloggen mislukt: {resp.text}")
        sys.exit(1)
    return resp.json()["access_token"]


def list_knowledge_articles(base_url: str, token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    out: list[dict] = []
    skip = 0
    limit = 100
    while True:
        resp = requests.get(
            f"{base_url}/blog/public/list",
            params={"section": "knowledge", "limit": limit, "skip": skip},
            headers=headers,
        )
        if resp.status_code != 200:
            print(f"Ophalen lijst mislukt: {resp.status_code} {resp.text[:200]}")
            sys.exit(1)
        items = resp.json()
        if not items:
            break
        out.extend(items)
        if len(items) < limit:
            break
        skip += limit
    return out


def get_full_article(base_url: str, token: str, article_id: str) -> dict:
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{base_url}/blog/{article_id}", headers=headers)
    resp.raise_for_status()
    return resp.json()


def patch_article(base_url: str, token: str, article_id: str, content: str) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.patch(
        f"{base_url}/blog/{article_id}",
        json={"content": content},
        headers=headers,
    )
    if resp.status_code not in (200, 201):
        print(f"  Fout bij patchen {article_id}: {resp.status_code} {resp.text[:200]}")
    else:
        print(f"  Geschreven ✓")


def main() -> None:
    ap = argparse.ArgumentParser(description="KB interne-link backfill")
    ap.add_argument("--email", required=True)
    ap.add_argument("--password", required=True)
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--dry", action="store_true", help="alleen tonen, niets wegschrijven")
    args = ap.parse_args()

    token = login(args.url, args.email, args.password)
    articles = list_knowledge_articles(args.url, token)

    total_before = total_after = 0
    for meta in articles:
        aid = meta["id"]
        full = get_full_article(args.url, token, aid)
        slug = full.get("slug", aid)
        if full.get("section") != "knowledge":
            continue
        html = full.get("content", "")
        before = count_kb_links(html)
        new_html = inject_kb_internal_links(html, exclude_slug=slug)
        after = count_kb_links(new_html)
        total_before += before
        total_after += after
        if after > before:
            print(f"[{slug}] {before}→{after} links" + ("  (DRY)" if args.dry else ""))
            if not args.dry:
                patch_article(args.url, token, aid, new_html)
        else:
            print(f"[{slug}] geen wijziging")

    verb = "Zou aanpassen" if args.dry else "Aangepast"
    print(f"\n{verb}: {total_after - total_before} interne links "
          f"({total_before}→{total_after}), {sum(1 for _ in articles)} artikelen bekeken.")


if __name__ == "__main__":
    main()
