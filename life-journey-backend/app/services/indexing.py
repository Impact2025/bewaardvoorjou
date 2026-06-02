"""
SEO indexing service — pings IndexNow en Google Indexing API na publicatie.

Beide calls zijn non-blocking: een fout breekt de publish-flow NOOIT.
"""
import json
import time
from typing import Optional

import httpx
from loguru import logger

from app.core.config import settings


async def ping_index_now(urls: list[str]) -> None:
    """Stuur URLs naar IndexNow (Bing/Yandex/Google-compatible)."""
    if not settings.indexnow_key:
        logger.debug("INDEXNOW_KEY niet ingesteld, IndexNow overgeslagen")
        return

    if not urls:
        return

    payload = {
        "host": _extract_host(urls[0]),
        "key": settings.indexnow_key,
        "keyLocation": f"{settings.site_url}/{settings.indexnow_key}.txt",
        "urlList": urls,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://api.indexnow.org/indexnow",
                json=payload,
                headers={"Content-Type": "application/json; charset=utf-8"},
            )
            if resp.status_code in (200, 202):
                logger.info(f"IndexNow OK — {len(urls)} URL(s) ingediend")
            else:
                logger.warning(f"IndexNow HTTP {resp.status_code}: {resp.text[:200]}")
    except Exception as exc:
        logger.warning(f"IndexNow fout (niet kritiek): {exc}")


async def ping_google_indexing_api(url: str) -> None:
    """Meld een URL aan bij de Google Indexing API via Service Account."""
    if not settings.google_service_account_json:
        logger.debug("GOOGLE_SERVICE_ACCOUNT_JSON niet ingesteld, Google Indexing overgeslagen")
        return

    try:
        token = await _get_google_access_token()
        if not token:
            return

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://indexing.googleapis.com/v3/urlNotifications:publish",
                json={"url": url, "type": "URL_UPDATED"},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            if resp.status_code == 200:
                logger.info(f"Google Indexing OK — {url}")
            else:
                logger.warning(f"Google Indexing HTTP {resp.status_code}: {resp.text[:200]}")
    except Exception as exc:
        logger.warning(f"Google Indexing fout (niet kritiek): {exc}")


async def _get_google_access_token() -> Optional[str]:
    """Genereer een OAuth2 access token via Service Account JWT."""
    try:
        sa = json.loads(settings.google_service_account_json)
    except Exception:
        logger.warning("GOOGLE_SERVICE_ACCOUNT_JSON is geen geldige JSON")
        return None

    try:
        import importlib
        jwt_lib = importlib.import_module("jwt")
    except ImportError:
        logger.warning("PyJWT niet beschikbaar voor Google service account auth")
        return None

    now = int(time.time())
    claim = {
        "iss": sa["client_email"],
        "scope": "https://www.googleapis.com/auth/indexing",
        "aud": "https://oauth2.googleapis.com/token",
        "exp": now + 3600,
        "iat": now,
    }

    try:
        signed_jwt = jwt_lib.encode(claim, sa["private_key"], algorithm="RS256")
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                    "assertion": signed_jwt,
                },
            )
            data = resp.json()
            return data.get("access_token")
    except Exception as exc:
        logger.warning(f"Google OAuth token fout: {exc}")
        return None


def _extract_host(url: str) -> str:
    try:
        from urllib.parse import urlparse
        return urlparse(url).netloc
    except Exception:
        return ""
