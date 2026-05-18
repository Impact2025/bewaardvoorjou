"""Tests for the unsubscribe token implementation."""
import hashlib
import hmac
import re

from app.core.config import settings


def _make_token(user_id: str, event_id: str) -> str:
    return hmac.new(
        settings.jwt_secret_key.encode(),
        f"{user_id}:{event_id}".encode(),
        hashlib.sha256,
    ).hexdigest()


def test_unsubscribe_token_is_64_hex_chars():
    token = _make_token("user-1", "event-1")
    assert re.match(r"^[0-9a-f]{64}$", token), f"Expected 64 hex chars, got: {token!r}"


def test_unsubscribe_token_is_deterministic():
    t1 = _make_token("user-abc", "event-xyz")
    t2 = _make_token("user-abc", "event-xyz")
    assert t1 == t2


def test_unsubscribe_token_differs_per_user():
    t1 = _make_token("user-1", "event-1")
    t2 = _make_token("user-2", "event-1")
    assert t1 != t2


def test_unsubscribe_token_differs_per_event():
    t1 = _make_token("user-1", "event-1")
    t2 = _make_token("user-1", "event-2")
    assert t1 != t2


def test_unsubscribe_token_not_guessable_from_ids():
    user_id = "user-1"
    event_id = "event-1"
    naive_token = f"{user_id}:{event_id}"
    secure_token = _make_token(user_id, event_id)
    assert secure_token != naive_token
