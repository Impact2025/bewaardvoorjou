"""Tests for the GDPR data-export bundle generator."""
from __future__ import annotations

import re
import zipfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import pytest

from app.models.journey import Journey
from app.models.media import MediaAsset, TranscriptSegment, PromptRun
from app.models.memo import Memo
from app.services.sharing.exporter import generate_export_bundle


def _utc() -> datetime:
    return datetime.now(timezone.utc)


# ── Lightweight stand-ins for SQLAlchemy models ──────────────────────────────
# The exporter only reads plain attributes — no relationships needed.

@dataclass
class _Journey:
    id: str
    title: str = "Testjournaal"
    created_at: datetime = field(default_factory=_utc)
    updated_at: datetime = field(default_factory=_utc)
    progress: dict = field(default_factory=dict)


@dataclass
class _Asset:
    id: str
    journey_id: str
    chapter_id: str = "intro-reflection"
    modality: str = "audio"
    object_key: str = ""
    original_filename: str = "opname.webm"
    duration_seconds: int = 42
    recorded_at: datetime = field(default_factory=_utc)
    storage_state: str = "ready"

    def __post_init__(self):
        if not self.object_key:
            self.object_key = f"media/{self.id}.webm"


@dataclass
class _Segment:
    id: str
    media_asset_id: str
    start_ms: int
    end_ms: int
    text: str


@dataclass
class _PromptRun:
    id: str
    journey_id: str
    chapter_id: str
    prompt: str
    follow_ups: list
    created_at: datetime = field(default_factory=_utc)


@dataclass
class _Memo:
    id: str
    journey_id: str
    chapter_id: str
    title: str
    content: str
    created_at: datetime = field(default_factory=_utc)


# ── Fake ORM session ─────────────────────────────────────────────────────────

class _FakeQuery:
    def __init__(self, data: list):
        self._data = list(data)

    def filter(self, *_):
        return self

    def filter_by(self, **kwargs):
        filtered = [i for i in self._data if all(getattr(i, k) == v for k, v in kwargs.items())]
        return _FakeQuery(filtered)

    def order_by(self, *_):
        return self

    def all(self):
        return self._data

    def first(self):
        return self._data[0] if self._data else None

    def in_(self, ids: list):
        ids_set = set(ids)
        return _FakeQuery([i for i in self._data if getattr(i, "media_asset_id", None) in ids_set])


class _FakeDb:
    def __init__(self, journeys=None, assets=None, segments=None, prompt_runs=None, memos=None):
        self._journeys = list(journeys or [])
        self._assets = list(assets or [])
        self._segments = list(segments or [])
        self._prompt_runs = list(prompt_runs or [])
        self._memos = list(memos or [])

    def query(self, model):
        mapping = {
            Journey: self._journeys,
            MediaAsset: self._assets,
            TranscriptSegment: self._segments,
            PromptRun: self._prompt_runs,
            Memo: self._memos,
        }
        return _FakeQuery(mapping.get(model, []))


# ── Helpers ──────────────────────────────────────────────────────────────────

def _read_zip(result: dict) -> zipfile.ZipFile:
    bundle_id = result["bundle_id"]
    zip_path = Path("media_storage") / "exports" / f"{bundle_id}.zip"
    assert zip_path.exists(), f"Export ZIP not written to {zip_path}"
    return zipfile.ZipFile(zip_path)


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_generate_export_raises_for_unknown_journey():
    db = _FakeDb()
    with pytest.raises(ValueError, match="not found"):
        generate_export_bundle("nonexistent-id", db)


def test_generate_export_returns_required_keys():
    journey_id = str(uuid4())
    db = _FakeDb(journeys=[_Journey(id=journey_id)])
    result = generate_export_bundle(journey_id, db)
    assert "bundle_id" in result
    assert "download_url" in result
    assert "expires_at" in result


def test_generate_export_zip_contains_readme():
    journey_id = str(uuid4())
    db = _FakeDb(journeys=[_Journey(id=journey_id)])
    result = generate_export_bundle(journey_id, db)
    with _read_zip(result) as zf:
        assert "README.txt" in zf.namelist()


def test_generate_export_zip_contains_metadata_files():
    journey_id = str(uuid4())
    db = _FakeDb(journeys=[_Journey(id=journey_id)])
    result = generate_export_bundle(journey_id, db)
    with _read_zip(result) as zf:
        names = zf.namelist()
        assert "metadata/journey.json" in names
        assert "metadata/vragen.json" in names
        assert "media/media_overzicht.json" in names


def test_generate_export_zip_includes_transcript():
    journey_id = str(uuid4())
    asset_id = str(uuid4())
    asset = _Asset(id=asset_id, journey_id=journey_id)
    seg = _Segment(id=str(uuid4()), media_asset_id=asset_id, start_ms=0, end_ms=1000, text="Mijn testverhaal.")

    # Patch the TranscriptSegment filter to match by media_asset_id
    class _PatchedDb(_FakeDb):
        def query(self, model):
            if model is TranscriptSegment:
                # Return segments matching the one asset
                return _FakeQuery([seg])
            return super().query(model)

    db = _PatchedDb(journeys=[_Journey(id=journey_id)], assets=[asset])
    result = generate_export_bundle(journey_id, db)
    with _read_zip(result) as zf:
        transcript_files = [n for n in zf.namelist() if n.startswith("transcripties/")]
        assert len(transcript_files) == 1
        content = zf.read(transcript_files[0]).decode("utf-8")
        assert "testverhaal" in content


def test_generate_export_bundle_id_is_url_safe():
    journey_id = str(uuid4())
    db = _FakeDb(journeys=[_Journey(id=journey_id)])
    result = generate_export_bundle(journey_id, db)
    assert re.match(r"^[A-Za-z0-9_\-]+$", result["bundle_id"])


def test_generate_export_empty_journey_no_crash():
    journey_id = str(uuid4())
    db = _FakeDb(journeys=[_Journey(id=journey_id)])
    result = generate_export_bundle(journey_id, db)
    with _read_zip(result) as zf:
        names = zf.namelist()
    assert "README.txt" in names
    assert "metadata/journey.json" in names
    # No transcripts for empty journey
    assert not any(n.startswith("transcripties/") for n in names)
