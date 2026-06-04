"""Tests for magic link authentication flow."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.models.user import User
from app.models.journey import Journey
from app.services import auth as auth_service


def _make_user(**kwargs) -> User:
    defaults = dict(
        id=str(uuid4()),
        email="test@example.com",
        display_name="Testgebruiker",
        password_hash=auth_service.hash_password("wachtwoord123"),
        country="NL",
        locale="nl",
        privacy_level="private",
        is_active=True,
        email_verified=True,
        email_bounced=False,
        package_tier="NONE",
        max_family_members=0,
        storage_years=0,
        target_recipients=[],
    )
    defaults.update(kwargs)
    return User(**defaults)


@dataclass
class _FakeQuery:
    data: list

    def filter_by(self, **kwargs):
        filtered = [i for i in self.data if all(getattr(i, k) == v for k, v in kwargs.items())]
        return _FakeQuery(filtered)

    def filter(self, *_):
        # Simplified: return all (tests set up data specifically)
        return self

    def first(self):
        return self.data[0] if self.data else None


@dataclass
class _FakeDb:
    users: list = field(default_factory=list)
    journeys: list = field(default_factory=list)
    _committed: list = field(default_factory=list)

    def query(self, model):
        if model is User:
            return _FakeQuery(self.users)
        if model is Journey:
            return _FakeQuery(self.journeys)
        return _FakeQuery([])

    def add(self, obj):
        if isinstance(obj, User) and obj not in self.users:
            if not obj.id:
                obj.id = str(uuid4())
            self.users.append(obj)
        if isinstance(obj, Journey) and obj not in self.journeys:
            self.journeys.append(obj)

    def commit(self):
        self._committed.append(True)

    def refresh(self, obj):
        pass


# ── create_magic_link_token ──────────────────────────────────────────────────

def test_create_magic_link_token_returns_non_empty_string():
    db = _FakeDb()
    user = _make_user()
    db.users.append(user)
    token = auth_service.create_magic_link_token(db, user=user)
    assert isinstance(token, str) and len(token) >= 32


def test_create_magic_link_token_sets_token_on_user():
    db = _FakeDb()
    user = _make_user()
    db.users.append(user)
    token = auth_service.create_magic_link_token(db, user=user)
    assert user.magic_link_token == token


def test_create_magic_link_token_expires_in_24_hours():
    db = _FakeDb()
    user = _make_user()
    db.users.append(user)
    auth_service.create_magic_link_token(db, user=user)
    now = datetime.now(timezone.utc)
    expires = user.magic_link_token_expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    delta = expires - now
    assert timedelta(hours=23) < delta <= timedelta(hours=24, seconds=5)


# ── verify_magic_link_token ──────────────────────────────────────────────────

def test_verify_magic_link_token_returns_user():
    db = _FakeDb()
    user = _make_user(email_verified=False)
    db.users.append(user)
    token = auth_service.create_magic_link_token(db, user=user)

    # Patch query to find by magic_link_token
    original_query = db.query
    def patched_query(model):
        q = original_query(model)
        if model is User:
            q.filter = lambda *_: _FakeQuery([u for u in db.users if u.magic_link_token == token])
        return q
    db.query = patched_query

    result = auth_service.verify_magic_link_token(db, token=token)
    assert result.id == user.id


def test_verify_magic_link_token_clears_token_after_use():
    db = _FakeDb()
    user = _make_user()
    db.users.append(user)
    token = auth_service.create_magic_link_token(db, user=user)

    original_query = db.query
    def patched_query(model):
        q = original_query(model)
        if model is User:
            q.filter = lambda *_: _FakeQuery([u for u in db.users if u.magic_link_token == token])
        return q
    db.query = patched_query

    auth_service.verify_magic_link_token(db, token=token)
    assert user.magic_link_token is None
    assert user.magic_link_token_expires_at is None


def test_verify_magic_link_token_raises_for_unknown_token():
    db = _FakeDb()
    original_query = db.query
    def patched_query(model):
        q = original_query(model)
        if model is User:
            q.filter = lambda *_: _FakeQuery([])
        return q
    db.query = patched_query

    with pytest.raises(HTTPException) as exc_info:
        auth_service.verify_magic_link_token(db, token="nonexistent-token")
    assert exc_info.value.status_code == 400


def test_verify_magic_link_token_raises_for_expired_token():
    db = _FakeDb()
    user = _make_user()
    db.users.append(user)
    auth_service.create_magic_link_token(db, user=user)
    # Manually expire the token
    user.magic_link_token_expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
    stored_token = user.magic_link_token

    original_query = db.query
    def patched_query(model):
        q = original_query(model)
        if model is User:
            q.filter = lambda *_: _FakeQuery([u for u in db.users if u.magic_link_token == stored_token])
        return q
    db.query = patched_query

    with pytest.raises(HTTPException) as exc_info:
        auth_service.verify_magic_link_token(db, token=stored_token)
    assert exc_info.value.status_code == 400


# ── get_or_create_storyteller ────────────────────────────────────────────────

def test_get_or_create_storyteller_creates_new_user():
    db = _FakeDb()
    user = auth_service.get_or_create_storyteller(
        db, email="oma@example.com", display_name="Oma Riet"
    )
    assert user.email == "oma@example.com"
    assert user.display_name == "Oma Riet"
    assert not user.email_verified
    assert user.package_tier == "NONE"


def test_get_or_create_storyteller_returns_existing_user():
    db = _FakeDb()
    existing = _make_user(email="oma@example.com", display_name="Oma Riet")
    db.users.append(existing)

    user = auth_service.get_or_create_storyteller(
        db, email="oma@example.com", display_name="Anders"
    )
    assert user.id == existing.id
    assert user.display_name == "Oma Riet"  # not overwritten


def test_get_or_create_storyteller_normalises_email():
    db = _FakeDb()
    user = auth_service.get_or_create_storyteller(
        db, email="OMA@EXAMPLE.COM", display_name="Oma"
    )
    assert user.email == "oma@example.com"
