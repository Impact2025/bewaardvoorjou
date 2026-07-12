"""
Machine-publicatie endpoint voor Agent OS → bewaardvoorjou.nl live.

Agent OS (het externe content-platform) POST hiernaartoe met een kant-en-klaar
artikel. Deze route vertaalt de Agent OS-payload naar de BlogPost-tabel,
publiceert direct (status=published), pingt IndexNow + Google, en triggert een
revalidate van de frontend zodat het artikel meteen live staat.

Auth: Authorization: Bearer <PUBLISH_API_KEY>  (timing-safe vergelijking).
De key wordt gelezen uit de backend .env (PUBLISH_API_KEY) — zelfde waarde als
BEWAARDVOORJOU_PUBLISH_KEY in de Agent OS .env.

Verwachte payload (Agent OS legacy-writer, "weareimpact-vorm"):
{
  "title": "...",
  "content": "<html body>",
  "slug": "mijn-artikel",          # optioneel; anders afgeleid van title
  "seoDescription": "...",         # -> meta_description + excerpt
  "tags": ["zoekwoord"],           # -> tags (kommagescheiden)
  "source": "agent-os",            # log-label
  "section": "blog" | "knowledge"  # optioneel; default uit settings
}
"""
import asyncio
import hashlib
import hmac
import re
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, Request, Response
from loguru import logger
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.models.blog_post import BlogPost
from app.services.indexing import ping_google_indexing_api, ping_index_now

router = APIRouter()


# ── Korte healthcheck (monitoring) ──────────────────────────────────────────
@router.get("/health", tags=["publish"])
async def publish_health(db: Session = Depends(get_db)):
    """Compacte health-probe voor de publish-flow: DB-reachable + key config.

    Gebruik dit endpoint in externe monitoring (bijv. UptimeRobot) in plaats
    van de volledige app-/healthz-check. Geen auth vereist."""
    db_ok = False
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:  # pragma: no cover - alleen bij DB-down
        logger.warning(f"Publish-health DB-check faalde: {e}")
    key_ok = bool(getattr(settings, "publish_api_key", None))
    return {
        "status": "ok" if (db_ok and key_ok) else "degraded",
        "db": "ok" if db_ok else "unreachable",
        "publish_key": "configured" if key_ok else "missing",
        "service": "agent-os-publish",
    }


# ── Verwijder een Agent OS-gepubliceerd artikel (slug) ─────────────────────
@router.delete("/{slug}", tags=["publish"])
async def delete_published(request: Request, slug: str, db: Session = Depends(get_db)):
    """Verwijder een via Agent OS gepubliceerd artikel op basis van slug.

    Dezelfde Bearer-auth als POST /api/v1/publish (PUBLISH_API_KEY). Bedoeld
    om duplicate/verkeerde Agent OS-posts op te ruimen zónder admin-token."""
    if not _is_authorized(request):
        return Response(
            content='{"error":"Unauthorized"}',
            status_code=401,
            media_type="application/json",
        )
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        return Response(
            content='{"error":"Niet gevonden"}',
            status_code=404,
            media_type="application/json",
        )
    db.delete(post)
    db.commit()
    logger.info(f"Agent OS artikel verwijderd: {slug}")
    return Response(
        content='{"success":true,"slug":"' + slug + '"}',
        status_code=200,
        media_type="application/json",
    )



# ── Auth ────────────────────────────────────────────────────────────────────
def _is_authorized(request: Request) -> bool:
    """Timing-safe check van de PUBLISH_API_KEY (Bearer)."""
    key = getattr(settings, "publish_api_key", None)
    if not key:
        logger.warning("PUBLISH_API_KEY niet geconfigureerd — /api/v1/publish geblokkeerd")
        return False
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        return False
    provided = auth[7:].encode("utf-8")
    expected = key.encode("utf-8")
    return hmac.compare_digest(
        hashlib.sha256(provided).digest(),
        hashlib.sha256(expected).digest(),
    )


# ── Helpers ───────────────────────────────────────────────────────────────────
def _slugify(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r"[̀-ͯ]", "", s)  # diakritische tekens weg
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s-]+", "-", s)
    s = s.strip("-")
    return s[:80] or "artikel"


_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _strip_html(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html or "").replace(r"\s+", " ").strip()


def _section_path(section: str) -> str:
    return "kennisbank" if section == "knowledge" else "blog"


async def _trigger_revalidate(slug: str, section: str) -> None:
    """Laat de frontend (/api/revalidate) de statische pagina's vernieuwen,
    zodat het artikel direct zichtbaar is i.p.v. te wachten op de ISR-window."""
    frontend = (settings.app_base_url or settings.site_url).rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{frontend}/api/revalidate",
                json={"slug": slug, "section": _section_path(section)},
            )
    except Exception as e:  # revalidate is best-effort
        logger.warning(f"Revalidate frontend mislukt (niet kritiek): {e}")


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("")
async def agent_os_publish(request: Request, db: Session = Depends(get_db)):
    if not _is_authorized(request):
        return Response(
            content='{"error":"Unauthorized"}',
            status_code=401,
            media_type="application/json",
        )

    try:
        body = await request.json()
    except Exception:
        return Response(
            content='{"error":"Ongeldige JSON"}',
            status_code=400,
            media_type="application/json",
        )

    title = (body.get("title") or "").strip()
    content = (body.get("content") or "").strip()
    if not title or not content:
        return Response(
            content='{"error":"title en content zijn verplicht"}',
            status_code=400,
            media_type="application/json",
        )

    # Slug: expliciet meegestuurd (gesanitized) of afgeleid van de titel.
    requested = (body.get("slug") or "").strip().lower()
    base_slug = _slugify(requested) if _SLUG_RE.match(requested) else _slugify(title)
    if not base_slug:
        base_slug = "artikel"

    # Unieke slug (upsert by slug — bestaat al → UPDATE, anders INSERT).
    existing = db.query(BlogPost).filter(BlogPost.slug == base_slug).first()
    # Bij een gewenste slug die al door een ANDER artikel gebruikt wordt,
    # een suffix geven zodat we geen conflict krijgen.
    slug = base_slug
    if not existing:
        n = 2
        while db.query(BlogPost).filter(BlogPost.slug == slug).first():
            slug = f"{base_slug}-{n}"
            n += 1

    section = body.get("section") or getattr(settings, "publish_default_section", "blog")
    if section not in ("blog", "knowledge"):
        section = "blog"

    plain = _strip_html(content)
    seo_desc = (body.get("seoDescription") or "").strip()
    excerpt = (seo_desc or plain[:200]).strip()[:500]
    tags = body.get("tags") or []
    tags_str = ",".join(tags) if isinstance(tags, list) else str(tags)
    meta_title = (body.get("seoTitle") or title)[:70]
    meta_description = seo_desc[:160] if seo_desc else excerpt[:160]

    now = datetime.now(timezone.utc)

    if existing:
        existing.title = title
        existing.slug = slug
        existing.content = content
        existing.excerpt = excerpt
        existing.section = section
        existing.tags = tags_str
        existing.meta_title = meta_title
        existing.meta_description = meta_description
        existing.keywords = body.get("keywords") or tags_str
        existing.status = "published"
        existing.published_at = existing.published_at or now
        existing.updated_at = now
        post = existing
    else:
        post = BlogPost(
            title=title,
            slug=slug,
            content=content,
            excerpt=excerpt,
            section=section,
            tags=tags_str,
            meta_title=meta_title,
            meta_description=meta_description,
            keywords=body.get("keywords") or tags_str,
            header_type="color",
            header_color="#E8773C",
            status="published",
            published_at=now,
            author_id="00000000-0000-0000-0000-000000000000",  # Agent OS machine-account
        )
        db.add(post)

    db.commit()
    db.refresh(post)

    url = f"{settings.site_url}/{_section_path(section)}/{post.slug}"

    # Zoekmachines pingen (parallel, fouten blokkeren niet)
    index_now_ok = google_ok = False
    try:
        results = await asyncio.gather(
            ping_index_now([url]),
            ping_google_indexing_api(url),
            return_exceptions=True,
        )
        index_now_ok = not isinstance(results[0], Exception)
        google_ok = not isinstance(results[1], Exception)
    except Exception as e:
        logger.warning(f"Index-ping gefaald: {e}")

    # Frontend direct verversen (best-effort)
    await _trigger_revalidate(post.slug, section)

    logger.info(f"Agent OS gepubliceerd: {post.slug} ({section}) → {url}")
    return Response(
        content=__import__("json").dumps({
            "success": True,
            "id": post.id,
            "slug": post.slug,
            "url": url,
            "source": body.get("source", "agent-os"),
            "indexing": {
                "indexnow": "ok" if index_now_ok else "fout",
                "google": "ok" if google_ok else "fout",
            },
        }),
        status_code=201,
        media_type="application/json",
    )
