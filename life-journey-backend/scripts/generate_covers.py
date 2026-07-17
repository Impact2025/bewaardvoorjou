#!/usr/bin/env python3
"""
generate_covers.py — Genereer en koppel cover/og:image afbeeldingen voor alle
blog- en kennisbank-artikelen van BewaardVoorJou.nl.

De backend heeft ZELF geen image-generator; dit script:
  1. Logt in als admin (POST /auth/login)
  2. Haalt alle posts op (GET /blog)
  3. Voor elke post zonder og_image:
       a. Genereert een cover-afbeelding via een OpenAI-images-compatibele API
          (default: OpenRouter, zelfde key/base als de backend).
       b. Uploadt die naar POST /blog/images/upload  -> krijgt een URL terug
          (S3 of lokale storage, net als in de backend).
       c. Koppelt de URL via PATCH /blog/{id}  met {"og_image": <url>}.

Gebruik:
  # Dry-run (NIETS wordt gewijzigd, toont wat er zou gebeuren):
  python generate_covers.py --email admin@example.com --password **** --dry-run

  # Echt uitvoeren tegen productie:
  python generate_covers.py --email admin@example.com --password **** \
      --url https://api.bewaardvoorjou.nl/api/v1

  # Alleen de kennisbank bijwerken:
  python generate_covers.py --email ... --password ... --section knowledge

Configuratie (omgevingsvariabelen, optioneel — anders via flags):
  OPENROUTER_API_KEY / OPENAI_API_KEY   API-key voor image-generatie
  OPENROUTER_API_BASE / OPENAI_API_BASE  Basis-URL van de images-API
  COVER_MODEL                            Model (default: openai/dall-e-3)
  COVER_SIZE                             default 1024x1024
  COVER_PROMPT_EXTRA                     extra stijl-instructie (nl. brand)

Veiligheid:
  - Alleen posts zonder og_image worden aangepakt (--force om alle te doen).
  - --dry-run verandert niets.
  - Transient failures: 3x retry met exponentiele backoff per post.
  - Genereert nooit dubbele covers voor dezelfde post (idempotent via og_image-check).

Afhankelijkheden: alleen `requests`.
"""

import argparse
import base64
import os
import sys
import time

try:
    import requests
except ImportError:
    sys.exit("De 'requests' library ontbreekt: pip install requests")

DEFAULT_BASE = "http://localhost:8000/api/v1"
DEFAULT_COVER_MODEL = "openai/dall-e-3"
DEFAULT_COVER_SIZE = "1024x1024"

# Nederlandse brand-stijl voor de covers (warm, tijdloos, familie-archief).
# Wordt achter elke prompt geplakt zodat alle covers visueel consistent zijn.
BRAND_STYLE = (
    "Stijl: warme, tijdloze illustratie in zachte aardetinten (creme, teal, "
    "amber), minimale flat-design, veel rust en negatieve ruimte, geen tekst, "
    "geen letters, sfeervol en emotioneel, geschikt als social-share image "
    "voor een Nederlands platform over levensverhalen bewaren."
)


# --------------------------------------------------------------------------- #
# Auth + API helpers
# --------------------------------------------------------------------------- #
def login(base_url: str, email: str, password: str) -> str:
    resp = requests.post(
        f"{base_url}/auth/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    if resp.status_code != 200:
        sys.exit(f"Inloggen mislukt ({resp.status_code}): {resp.text}")
    return resp.json()["access_token"]


def list_posts(base_url: str, token: str, section: str | None = None) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    out: list[dict] = []
    offset = 0
    while True:
        params = {"limit": 200, "offset": offset}
        if section:
            params["section"] = section
        resp = requests.get(
            f"{base_url}/blog", headers=headers, params=params, timeout=30
        )
        if resp.status_code != 200:
            sys.exit(f"Ophalen posts mislukt ({resp.status_code}): {resp.text}")
        batch = resp.json()
        if not batch:
            break
        out.extend(batch)
        if len(batch) < 200:
            break
        offset += 200
    return out


def generate_cover_image(prompt: str, api_key: str, api_base: str,
                         model: str, size: str) -> bytes:
    """Genereer een PNG/JPEG via een OpenAI-images-compatibele API.

    OpenRouter ondersteunt het OpenAI images-formaat op /images/generations.
    Valt terug op de OpenAI-compatible endpoint als api_base anders is.
    """
    url = f"{api_base.rstrip('/')}/images/generations"
    payload = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "n": 1,
        "response_format": "b64_json",
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=120)
    if resp.status_code != 200:
        raise RuntimeError(f"Image API {resp.status_code}: {resp.text[:300]}")
    data = resp.json()
    try:
        b64 = data["data"][0]["b64_json"]
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"Onverwacht image-API antwoord: {data}") from exc
    return base64.b64decode(b64)


def upload_cover(base_url: str, token: str, image_bytes: bytes,
                 filename: str) -> str:
    """Upload naar POST /blog/images/upload en geef de resulterende URL terug."""
    headers = {"Authorization": f"Bearer {token}"}
    files = {
        "file": (filename, image_bytes, "image/png"),
    }
    resp = requests.post(
        f"{base_url}/blog/images/upload", headers=headers, files=files,
        timeout=60,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Upload {resp.status_code}: {resp.text[:300]}")
    return resp.json()["url"]


def patch_og_image(base_url: str, token: str, post_id: str, url: str) -> None:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    resp = requests.patch(
        f"{base_url}/blog/{post_id}",
        json={"og_image": url},
        headers=headers,
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Patch {resp.status_code}: {resp.text[:300]}")


def retry(func, *args, attempts: int = 3, **kwargs):
    last = None
    for i in range(attempts):
        try:
            return func(*args, **kwargs)
        except Exception as exc:  # noqa: BLE001 - transient, retry
            last = exc
            if i < attempts - 1:
                time.sleep(2 ** i)
    raise last  # type: ignore[misc]


# --------------------------------------------------------------------------- #
# Prompt-bouw
# --------------------------------------------------------------------------- #
def build_prompt(post: dict) -> str:
    title = post.get("title") or post.get("slug") or "levensverhaal"
    excerpt = (post.get("excerpt") or "")[:160]
    section = post.get("section", "blog")
    thema = (
        "een warm familiekiekje of generatie-moment"
        if section == "knowledge"
        else "een sfeervol moment van een levensverhaal"
    )
    base = (
        f"Een cover-illustratie voor een artikel getiteld '{title}'. "
        f"Centraal thema: {thema}. "
    )
    if excerpt:
        base += f"Samenvatting: {excerpt} "
    return base + BRAND_STYLE


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main() -> None:
    ap = argparse.ArgumentParser(description="Genereer + koppel blog covers.")
    ap.add_argument("--email", required=True)
    ap.add_argument("--password", required=True)
    ap.add_argument("--url", default=os.getenv("API_BASE_URL", DEFAULT_BASE))
    ap.add_argument("--section", choices=["blog", "knowledge"], default=None,
                    help="Alleen deze sectie (default: beide).")
    ap.add_argument("--force", action="store_true",
                    help="Ook posts MET al een og_image overschrijven.")
    ap.add_argument("--dry-run", action="store_true",
                    help="Niets wijzigen, alleen tonen wat er gebeurt.")
    ap.add_argument("--limit", type=int, default=0,
                    help="Max aantal posts verwerken (0 = alle).")
    # Image-generator config (env of flag)
    ap.add_argument("--api-key", default=os.getenv("OPENROUTER_API_KEY")
                    or os.getenv("OPENAI_API_KEY"))
    ap.add_argument("--api-base", default=os.getenv("OPENROUTER_API_BASE")
                    or os.getenv("OPENAI_API_BASE")
                    or "https://openrouter.ai/api/v1")
    ap.add_argument("--model", default=os.getenv("COVER_MODEL", DEFAULT_COVER_MODEL))
    ap.add_argument("--size", default=os.getenv("COVER_SIZE", DEFAULT_COVER_SIZE))
    args = ap.parse_args()

    if not args.api_key and not args.dry_run:
        sys.exit("Geen image-API key. Zet OPENROUTER_API_KEY/OPENAI_API_KEY of "
                 "gebruik --api-key, of --dry-run.")

    print(f"→ Verbinden met {args.url}")
    token = login(args.url, args.email, args.password)
    posts = list_posts(args.url, token, args.section)
    print(f"→ {len(posts)} post(s) gevonden"
          + (f" in sectie '{args.section}'" if args.section else ""))

    todo = [
        p for p in posts
        if args.force or not p.get("og_image")
    ]
    if args.limit:
        todo = todo[:args.limit]
    print(f"→ {len(todo)} post(s) te verwerken"
          + (" (force)" if args.force else " (alleen zonder og_image)"))

    if args.dry_run:
        for p in todo:
            print(f"  [dry-run] cover voor: {p.get('title')!r} "
                  f"(slug={p.get('slug')})")
            print(f"            prompt: {build_prompt(p)[:160]}...")
        print(f"\nDRY-RUN klaar: {len(todo)} cover(s) ZOUDEN worden gegenereerd. "
              f"Geen wijzigingen gemaakt.")
        return

    ok = 0
    skip = 0
    fail = 0
    for p in todo:
        post_id = p["id"]
        title = p.get("title", p.get("slug"))
        try:
            prompt = build_prompt(p)
            img = retry(generate_cover_image, prompt, args.api_key,
                        args.api_base, args.model, args.size)
            url = retry(upload_cover, args.url, token, img,
                        f"cover-{p.get('slug', post_id)}.png")
            retry(patch_og_image, args.url, token, post_id, url)
            ok += 1
            print(f"  ✓ {title!r} -> {url}")
        except Exception as exc:  # noqa: BLE001
            fail += 1
            print(f"  ✗ {title!r}: {exc}", file=sys.stderr)

    print(f"\nKlaar: {ok} gekoppeld, {skip} overgeslagen, {fail} gefaald "
          f"van {len(todo)}.")


if __name__ == "__main__":
    main()
