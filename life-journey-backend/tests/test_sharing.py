"""Tests for share token generation security."""
import re
import pytest

from app.services.sharing.generator import generate_magic_token


UUID4_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)


def test_magic_token_length():
    token = generate_magic_token()
    assert len(token) >= 32


def test_magic_token_is_unique():
    tokens = {generate_magic_token() for _ in range(100)}
    assert len(tokens) == 100


def test_magic_token_is_not_uuid4_format():
    token = generate_magic_token()
    assert not UUID4_PATTERN.match(token), "Token should not be a plain UUID4"


def test_magic_token_url_safe_characters():
    token = generate_magic_token()
    assert re.match(r"^[A-Za-z0-9_\-]+$", token)
