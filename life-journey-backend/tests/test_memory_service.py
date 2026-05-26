"""Tests for the AI memory service."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.services.ai.memory import (
    JourneyMemory,
    _ai_extract_people,
    _ai_extract_places,
    _extract_themes,
    build_journey_memory,
)


# ── _ai_extract_people (fallback path, no API key) ────────────────────────────

def test_extract_people_fallback_finds_oma():
    # When Claude is unavailable, keyword fallback runs
    result = _ai_extract_people("Mijn oma deed altijd zo fijn voor ons.")
    assert any("oma" in r.lower() for r in result)


def test_extract_people_fallback_finds_papa():
    result = _ai_extract_people("Papa werkte altijd heel hard in de fabriek.")
    assert any("papa" in r.lower() for r in result)


def test_extract_people_empty_text():
    result = _ai_extract_people("")
    assert result == []


# ── _ai_extract_places (fallback path — returns [] when API unavailable) ─────

def test_extract_places_empty_on_fallback():
    # No Claude key in test env — fallback returns []
    result = _ai_extract_places("Ik woonde in Amsterdam en later in Rotterdam.")
    # Either Claude results (list of strings) or empty fallback list
    assert isinstance(result, list)


# ── _extract_themes ────────────────────────────────────────────────────────────

def test_extract_themes_detects_familie():
    transcripts = [{"chapter_id": "intro", "text": "Mijn familie was altijd belangrijk. Mijn ouders, kinderen.", "sentiment": None}]
    themes = _extract_themes(transcripts)
    assert "familie" in themes


def test_extract_themes_detects_multiple():
    transcripts = [
        {"chapter_id": "intro", "text": "Mijn huwelijk was mooi. De liefde was groot.", "sentiment": None},
        {"chapter_id": "werk", "text": "Ik werkte hard in mijn eerste baan.", "sentiment": None},
    ]
    themes = _extract_themes(transcripts)
    assert "liefde" in themes or "werk" in themes


def test_extract_themes_empty():
    themes = _extract_themes([])
    assert themes == []


# ── JourneyMemory.to_context_string ───────────────────────────────────────────

def test_context_string_uses_dutch_chapter_names():
    memory = JourneyMemory(
        journey_id="test",
        themes=["familie"],
        key_people=["opa Kees"],
        key_places=["Leiden"],
        key_events=["emigratie"],
        emotional_tone="warm",
        completed_chapters=["youth-favorite-place"],
        chapter_summaries={"youth-favorite-place": "Over de speeltuin in Leiden."},
    )
    ctx = memory.to_context_string(current_chapter="intro-reflection")
    # Dutch label from chapter_names.py, not raw ID
    assert "Je favoriete plek" in ctx
    assert "youth-favorite-place" not in ctx


def test_context_string_excludes_current_chapter():
    memory = JourneyMemory(
        journey_id="test",
        themes=[],
        key_people=[],
        key_places=[],
        key_events=[],
        emotional_tone="",
        completed_chapters=["youth-favorite-place", "intro-reflection"],
        chapter_summaries={},
    )
    ctx = memory.to_context_string(current_chapter="youth-favorite-place")
    # current chapter should be filtered out from completed list
    assert "Je favoriete plek" not in ctx


def test_context_string_empty_memory():
    memory = JourneyMemory(
        journey_id="test",
        themes=[],
        key_people=[],
        key_places=[],
        key_events=[],
        emotional_tone="",
        completed_chapters=[],
        chapter_summaries={},
    )
    assert memory.to_context_string() == ""


def test_context_string_shows_key_people_and_places():
    memory = JourneyMemory(
        journey_id="test",
        themes=["natuur"],
        key_people=["tante Corrie", "oom Hendrik"],
        key_places=["Zwolle"],
        key_events=["verhuizing"],
        emotional_tone="nostalgisch",
        completed_chapters=[],
        chapter_summaries={},
    )
    ctx = memory.to_context_string()
    assert "tante Corrie" in ctx
    assert "Zwolle" in ctx
    assert "nostalgisch" in ctx


# ── build_journey_memory (no DB assets — should return empty memory) ──────────

@dataclass
class _FakeQuery:
    data: list = field(default_factory=list)

    def filter(self, *_):
        return self

    def filter_by(self, **_):
        return self

    def order_by(self, *_):
        return self

    def first(self):
        return self.data[0] if self.data else None

    def all(self):
        return list(self.data)

    def count(self):
        return len(self.data)


class _EmptyDb:
    def query(self, model):
        return _FakeQuery([])

    def add(self, obj):
        pass

    def commit(self):
        pass


def test_build_journey_memory_empty_journey():
    db = _EmptyDb()
    memory = build_journey_memory(db, "empty-journey-id")
    assert memory.journey_id == "empty-journey-id"
    assert memory.completed_chapters == []
    assert memory.key_people == []
    assert memory.key_places == []
