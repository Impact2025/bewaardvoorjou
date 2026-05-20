"""
Blog + Kennisbank API routes — admin CRUD, SEO, afbeeldingen, publicatie.

Endpoints:
- GET    /blog                  → Lijst alle posts (filter: status, section)
- POST   /blog                  → Nieuwe post aanmaken
- POST   /blog/seo-optimize     → AI SEO + interne links
- POST   /blog/images/upload    → Afbeelding uploaden
- GET    /blog/images/{name}    → Lokale afbeelding serveren (dev)
- GET    /blog/{id}             → Één post ophalen
- PATCH  /blog/{id}             → Post bijwerken
- DELETE /blog/{id}             → Post verwijderen
- POST   /blog/{id}/publish     → Publiceer + ping zoekmachines
- POST   /blog/{id}/unpublish   → Zet terug naar concept
"""
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

import boto3
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from loguru import logger
from openai import AsyncOpenAI
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.core.config import settings
from app.models.blog_post import BlogPost
from app.models.user import User
from app.schemas.blog_post import (
    BlogPostCreate,
    BlogPostListItem,
    BlogPostResponse,
    BlogPostUpdate,
    ImageUploadResponse,
    InternalLinkSuggestion,
    SeoOptimizeRequest,
    SeoOptimizeResponse,
)
from app.services.indexing import ping_google_indexing_api, ping_index_now

router = APIRouter()

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


def _get_post_or_404(db: Session, post_id: str) -> BlogPost:
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post niet gevonden")
    return post


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.get("", response_model=List[BlogPostListItem])
async def list_blog_posts(
    status: Optional[str] = Query(None),
    section: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    q = db.query(BlogPost)
    if status:
        q = q.filter(BlogPost.status == status)
    if section:
        q = q.filter(BlogPost.section == section)
    return q.order_by(BlogPost.created_at.desc()).offset(offset).limit(limit).all()


@router.post("", response_model=BlogPostResponse, status_code=201)
async def create_blog_post(
    payload: BlogPostCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    if db.query(BlogPost).filter(BlogPost.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Slug al in gebruik")
    post = BlogPost(id=str(uuid4()), author_id=admin.id, **payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


# ---------------------------------------------------------------------------
# AI SEO — VOOR /{id} routes anders matcht "seo-optimize" als post_id
# ---------------------------------------------------------------------------

@router.post("/seo-optimize", response_model=SeoOptimizeResponse)
async def seo_optimize(
    payload: SeoOptimizeRequest,
    admin: User = Depends(get_current_admin_user),
):
    if not settings.openai_api_key:
        raise HTTPException(503, detail="OpenRouter API key niet geconfigureerd")

    client = AsyncOpenAI(api_key=settings.openai_api_key, base_url=settings.openai_api_base)
    content_preview = payload.content[:3000] if payload.content else ""

    post_list_str = ""
    if payload.existing_posts:
        items = payload.existing_posts[:30]
        post_list_str = "\n".join(
            f"- {p.get('title', '')} (/{p.get('slug', '')})" for p in items
        )

    system_prompt = """Je bent een senior SEO-specialist en copywriter voor de Nederlandse markt.

REGELS:
- meta_title: max 60 tekens, bevat het primaire zoekwoord
- meta_description: 140-155 tekens, actief en uitnodigend
- keywords: 5-8 Nederlandse zoekwoorden, kommagescheiden
- tags: 3-5 categorietags, enkelvoud, kleine letters
- excerpt: 2-3 zinnen, boeiend, geen spoilers
- slug: lowercase, koppeltekens, alleen a-z 0-9, max 60 tekens
- internal_links: 2-3 meest relevante artikelen om intern naar te linken

Geef ALLEEN geldige JSON terug, geen uitleg."""

    posts_section = (
        f"\n\nBestaande artikelen voor interne links:\n{post_list_str}"
        if post_list_str
        else ""
    )

    user_prompt = f"""Analyseer deze blog post:

Titel: {payload.title}
Bestaande keywords: {payload.existing_keywords or 'geen'}
Excerpt: {payload.excerpt or 'niet opgegeven'}

Inhoud:
{content_preview}{posts_section}

Geef terug als JSON:
{{
  "meta_title": "...",
  "meta_description": "...",
  "keywords": "...",
  "tags": "...",
  "excerpt": "...",
  "slug": "...",
  "internal_links": [
    {{"slug": "artikel-slug", "title": "Artikel Titel", "reason": "Waarom relevant"}}
  ]
}}"""

    try:
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=900,
            temperature=0.3,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url or settings.site_url,
                "X-Title": settings.openrouter_app_name,
            },
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        data = json.loads(raw)

        links: List[InternalLinkSuggestion] = []
        for link in data.get("internal_links", []):
            if isinstance(link, dict) and link.get("slug") and link.get("title"):
                links.append(
                    InternalLinkSuggestion(
                        slug=link["slug"],
                        title=link["title"],
                        reason=link.get("reason", ""),
                    )
                )

        return SeoOptimizeResponse(
            meta_title=data.get("meta_title", "")[:70],
            meta_description=data.get("meta_description", "")[:160],
            keywords=data.get("keywords", ""),
            tags=data.get("tags", ""),
            excerpt=data.get("excerpt", ""),
            slug=data.get("slug", ""),
            internal_links=links,
        )

    except Exception as exc:
        logger.error(f"SEO optimalisatie fout: {exc}")
        raise HTTPException(500, detail=f"AI SEO fout: {str(exc)[:100]}")


# ---------------------------------------------------------------------------
# Image Upload — VOOR /{id} routes
# ---------------------------------------------------------------------------

@router.post("/images/upload", response_model=ImageUploadResponse)
async def upload_blog_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin_user),
):
    """Upload een afbeelding voor blog of kennisbank. Max 5 MB, JPEG/PNG/WebP/GIF."""
    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, detail="Alleen JPEG, PNG, WebP en GIF zijn toegestaan")

    content = await file.read()
    if len(content) > _MAX_IMAGE_BYTES:
        raise HTTPException(400, detail="Afbeelding mag maximaal 5 MB zijn")

    ext = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    filename = f"{uuid4()}{ext}"

    # S3 als geconfigureerd
    if settings.s3_bucket and settings.aws_access_key_id:
        try:
            s3 = boto3.client(
                "s3",
                region_name=settings.s3_region,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                **({"endpoint_url": settings.s3_endpoint_url} if settings.s3_endpoint_url else {}),
            )
            object_key = f"blog/{filename}"
            s3.put_object(
                Bucket=settings.s3_bucket,
                Key=object_key,
                Body=content,
                ContentType=file.content_type or "image/jpeg",
            )
            if settings.s3_endpoint_url:
                url = f"{settings.s3_endpoint_url.rstrip('/')}/{settings.s3_bucket}/{object_key}"
            else:
                url = f"https://{settings.s3_bucket}.s3.{settings.s3_region}.amazonaws.com/{object_key}"
            return ImageUploadResponse(url=url)
        except Exception as exc:
            logger.warning(f"S3 upload mislukt, lokale opslag: {exc}")

    # Lokale opslag als fallback
    blog_dir = Path("media_storage/blog")
    blog_dir.mkdir(parents=True, exist_ok=True)
    (blog_dir / filename).write_bytes(content)

    url = f"{settings.api_base_url.rstrip('/')}{settings.api_v1_prefix}/blog/images/{filename}"
    return ImageUploadResponse(url=url)


@router.get("/images/{filename}")
async def serve_blog_image(filename: str):
    """Serveert lokaal opgeslagen blog-afbeeldingen (development)."""
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(400, detail="Ongeldig bestandspad")
    file_path = Path("media_storage/blog") / filename
    if not file_path.exists():
        raise HTTPException(404, detail="Afbeelding niet gevonden")
    return FileResponse(str(file_path))


# ---------------------------------------------------------------------------
# Individuele post endpoints (NA de statische routes!)
# ---------------------------------------------------------------------------

@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(
    post_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    return _get_post_or_404(db, post_id)


@router.patch("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: str,
    payload: BlogPostUpdate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    post = _get_post_or_404(db, post_id)
    if payload.slug and payload.slug != post.slug:
        if db.query(BlogPost).filter(
            BlogPost.slug == payload.slug, BlogPost.id != post_id
        ).first():
            raise HTTPException(status_code=409, detail="Slug al in gebruik")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
async def delete_blog_post(
    post_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    post = _get_post_or_404(db, post_id)
    db.delete(post)
    db.commit()


@router.post("/{post_id}/publish", response_model=BlogPostResponse)
async def publish_blog_post(
    post_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Publiceer een post en ping IndexNow + Google. Fout in indexering stopt publicatie NIET."""
    post = _get_post_or_404(db, post_id)
    if post.status == "published":
        raise HTTPException(status_code=409, detail="Post is al gepubliceerd")

    post.status = "published"
    if not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)

    section_path = "kennisbank" if post.section == "knowledge" else "blog"
    full_url = f"{settings.site_url}/{section_path}/{post.slug}"
    await asyncio.gather(
        ping_index_now([full_url]),
        ping_google_indexing_api(full_url),
        return_exceptions=True,
    )
    logger.info(f"Gepubliceerd: {post.slug} ({post.section})")
    return post


@router.post("/{post_id}/unpublish", response_model=BlogPostResponse)
async def unpublish_blog_post(
    post_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    post = _get_post_or_404(db, post_id)
    post.status = "draft"
    post.published_at = None
    db.commit()
    db.refresh(post)
    return post
