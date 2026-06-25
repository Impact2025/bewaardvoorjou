"""
Toegangscontrole-tests voor media-endpoints.

Borgt de fix voor de access-control-gaten:
  * GET /media/file en /media/local-file vereisen authenticatie + eigenaarschap
    (geen IDOR op privé-opnames — AVG art. 9-data).
  * PUT /media/local-upload accepteert alleen een door /media/presign
    ondertekende capability-URL (geen anonieme uploads).
  * object_key-validatie blokkeert path traversal.
"""
from __future__ import annotations

import time
from pathlib import Path
from uuid import uuid4

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from starlette.testclient import TestClient

import app.db.base  # noqa: F401  — registreer alle mappers
from app.models.base import Base
from app.models.user import User
from app.models.journey import Journey
from app.models.media import MediaAsset
from app.db.session import get_db
from app.api.deps import get_current_user
from app.services.media.local_storage import local_storage
from app.services.media.presigner import (
    build_presigned_upload,
    verify_upload_signature,
)
from app.services.media.validators import validate_object_key
from fastapi import HTTPException


# ── Geïsoleerde in-memory database ──────────────────────────────────────────

@pytest.fixture(scope="module")
def db_session_factory():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)


@pytest.fixture(scope="module")
def seeded(db_session_factory):
    """Twee gebruikers, elk met een journey + media-item."""
    db = db_session_factory()

    owner = User(id=str(uuid4()), display_name="Eigenaar", email="owner@test.nl", country="NL")
    other = User(id=str(uuid4()), display_name="Vreemde", email="other@test.nl", country="NL")
    db.add_all([owner, other])

    journey = Journey(id=str(uuid4()), title="Verhaal", user_id=owner.id, progress={})
    db.add(journey)

    asset_id = str(uuid4())
    object_key = f"{journey.id}/roots/{asset_id}/opname.webm"
    asset = MediaAsset(
        id=asset_id,
        journey_id=journey.id,
        chapter_id="roots",
        modality="video",
        object_key=object_key,
        original_filename="opname.webm",
        storage_state="ready",
    )
    db.add(asset)
    db.commit()

    yield {
        "db": db,
        "owner": owner,
        "other": other,
        "journey": journey,
        "asset_id": asset_id,
        "object_key": object_key,
    }
    db.close()


@pytest.fixture
def client(db_session_factory, seeded):
    from app.main import app

    def _override_get_db():
        db = db_session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c, app
    app.dependency_overrides.clear()


def _as_user(app, user):
    app.dependency_overrides[get_current_user] = lambda: user


# ── Read-endpoints: authenticatie + eigenaarschap ───────────────────────────

def test_serve_file_requires_authentication(client, seeded):
    c, _ = client
    res = c.get(f"/api/v1/media/file/{seeded['object_key']}")
    assert res.status_code == 401


def test_serve_file_rejects_non_owner(client, seeded):
    c, app = client
    _as_user(app, seeded["other"])
    res = c.get(f"/api/v1/media/file/{seeded['object_key']}")
    assert res.status_code == 403


def test_serve_file_allows_owner(client, seeded):
    c, app = client
    _as_user(app, seeded["owner"])
    res = c.get(f"/api/v1/media/file/{seeded['object_key']}")
    # Eigenaar passeert autorisatie. Zonder S3-config en zonder fysiek bestand
    # volgt een 404 — het bewijs dat 401/403 niet meer optreedt.
    assert res.status_code not in (401, 403)


def test_serve_file_unknown_asset_is_not_leaked(client, seeded):
    c, app = client
    _as_user(app, seeded["owner"])
    journey_id = seeded["journey"].id
    res = c.get(f"/api/v1/media/file/{journey_id}/roots/{uuid4()}/x.webm")
    assert res.status_code == 404


def test_local_file_requires_authentication(client, seeded):
    c, _ = client
    res = c.get(f"/api/v1/media/local-file/{seeded['object_key']}")
    assert res.status_code == 401


def test_local_file_rejects_non_owner(client, seeded):
    c, app = client
    _as_user(app, seeded["other"])
    res = c.get(f"/api/v1/media/local-file/{seeded['object_key']}")
    assert res.status_code == 403


def test_local_file_streams_for_owner(client, seeded):
    c, app = client
    _as_user(app, seeded["owner"])

    # Schrijf een echt bestand op de verwachte locatie.
    path = local_storage.get_file_path(seeded["object_key"])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"\x1a\x45\xdf\xa3binary-body")
    try:
        res = c.get(f"/api/v1/media/local-file/{seeded['object_key']}")
        assert res.status_code == 200
        assert res.content == b"\x1a\x45\xdf\xa3binary-body"
    finally:
        path.unlink(missing_ok=True)


# ── Path traversal ──────────────────────────────────────────────────────────

@pytest.mark.parametrize("bad_key", ["../../etc/passwd", "/etc/passwd", "a/../../b/c"])
def test_validate_object_key_blocks_traversal(bad_key):
    with pytest.raises(HTTPException) as exc:
        validate_object_key(bad_key)
    assert exc.value.status_code == 400


# ── Upload-capability (ondertekende URL) ────────────────────────────────────

def _make_signed_key():
    """Genereer via de presigner een geldige (object_key, exp, sig)."""
    class _P:
        journey_id = "j1"
        class chapter_id:  # noqa: N801
            value = "roots"
        filename = "opname.webm"
    resp = build_presigned_upload(_P())
    # Haal exp & sig uit de querystring
    from urllib.parse import urlparse, parse_qs
    q = parse_qs(urlparse(resp.upload_url).query)
    return resp.object_key, int(q["exp"][0]), q["sig"][0]


def test_signed_upload_roundtrip_valid():
    key, exp, sig = _make_signed_key()
    assert verify_upload_signature(key, exp, sig) is True


def test_signed_upload_rejects_tampered_key():
    key, exp, sig = _make_signed_key()
    assert verify_upload_signature(key + "x", exp, sig) is False


def test_signed_upload_rejects_expired():
    key, _exp, sig = _make_signed_key()
    assert verify_upload_signature(key, int(time.time()) - 10, sig) is False


def test_signed_upload_rejects_missing_signature():
    key, exp, _sig = _make_signed_key()
    assert verify_upload_signature(key, exp, "") is False


def test_local_upload_rejects_unsigned_request(client):
    c, _ = client
    res = c.put(
        "/api/v1/media/local-upload/j1/roots/aaa/opname.webm",
        content=b"\x1a\x45\xdf\xa3data",
        headers={"content-type": "video/webm"},
    )
    assert res.status_code == 403


def test_local_upload_accepts_signed_request(client):
    c, _ = client
    key, exp, sig = _make_signed_key()
    res = c.put(
        f"/api/v1/media/local-upload/{key}?exp={exp}&sig={sig}",
        content=b"\x1a\x45\xdf\xa3data",
        headers={"content-type": "video/webm"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "uploaded"
    # Ruim het lokaal opgeslagen bestand op.
    local_storage.get_file_path(key).unlink(missing_ok=True)
