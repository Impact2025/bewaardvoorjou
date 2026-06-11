"""Tests voor de opname-toegangscontrole (proefperiode + hoofdstuk-limiet)."""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.services.entitlements import assert_can_record

NOW = datetime.now(timezone.utc)


class _StubQuery:
    def __init__(self, chapters):
        self._chapters = chapters

    def filter(self, *args, **kwargs):
        return self

    def distinct(self):
        return self

    def all(self):
        return [(c,) for c in self._chapters]


class _StubDB:
    """Minimale db-stub die distinct chapter_ids teruggeeft."""

    def __init__(self, chapters):
        self._chapters = chapters

    def query(self, *args, **kwargs):
        return _StubQuery(self._chapters)


def _user(**overrides):
    base = dict(
        package_tier="NONE",
        trial_expires_at=NOW + timedelta(days=10),
        max_chapters=3,
    )
    base.update(overrides)
    return SimpleNamespace(**base)


def test_paid_tier_is_always_allowed():
    user = _user(package_tier="ERFGOED", trial_expires_at=NOW - timedelta(days=1))
    # Verlopen datum en hoofdstukken vol: tóch toegestaan voor betaald pakket.
    assert_can_record(_StubDB(["a", "b", "c"]), user, "j1", "z") is None


def test_expired_trial_blocks_with_402():
    user = _user(trial_expires_at=NOW - timedelta(days=1))
    with pytest.raises(HTTPException) as exc:
        assert_can_record(_StubDB([]), user, "j1", "a")
    assert exc.value.status_code == 402


def test_naive_trial_datetime_is_treated_as_utc():
    user = _user(trial_expires_at=(NOW - timedelta(days=1)).replace(tzinfo=None))
    with pytest.raises(HTTPException) as exc:
        assert_can_record(_StubDB([]), user, "j1", "a")
    assert exc.value.status_code == 402


def test_new_chapter_under_limit_is_allowed():
    user = _user()
    assert_can_record(_StubDB(["a", "b"]), user, "j1", "c") is None


def test_new_chapter_at_limit_blocks_with_402():
    user = _user()
    with pytest.raises(HTTPException) as exc:
        assert_can_record(_StubDB(["a", "b", "c"]), user, "j1", "d")
    assert exc.value.status_code == 402


def test_continuing_existing_chapter_at_limit_is_allowed():
    user = _user()
    # Hoofdstuk 'b' is al gestart: doorgaan mag, ook al zit de gebruiker op de limiet.
    assert_can_record(_StubDB(["a", "b", "c"]), user, "j1", "b") is None


def test_legacy_free_account_without_limits_is_allowed():
    user = _user(trial_expires_at=None, max_chapters=None)
    assert_can_record(_StubDB(["a", "b", "c", "d", "e"]), user, "j1", "f") is None
