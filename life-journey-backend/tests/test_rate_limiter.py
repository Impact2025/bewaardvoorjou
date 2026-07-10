import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from starlette.requests import Request  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.rate_limiter import get_user_or_ip  # noqa: E402


def _build_request(authorization: str | None = None, client_ip: str = "203.0.113.7") -> Request:
    headers = []
    if authorization is not None:
        headers.append((b"authorization", authorization.encode()))
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": headers,
        "client": (client_ip, 12345),
    }
    return Request(scope)


def _make_token(payload: dict) -> str:
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def test_geldig_token_geeft_user_key():
    token = _make_token({"sub": "user-123", "exp": datetime.now(timezone.utc) + timedelta(hours=1)})
    request = _build_request(f"Bearer {token}")
    assert get_user_or_ip(request) == "user:user-123"


def test_zonder_auth_header_valt_terug_op_ip():
    request = _build_request(client_ip="198.51.100.42")
    assert get_user_or_ip(request) == "198.51.100.42"


def test_vervalst_token_valt_terug_op_ip():
    token = jwt.encode({"sub": "user-123"}, "verkeerde-sleutel", algorithm=settings.jwt_algorithm)
    request = _build_request(f"Bearer {token}", client_ip="198.51.100.42")
    assert get_user_or_ip(request) == "198.51.100.42"


def test_verlopen_token_valt_terug_op_ip():
    token = _make_token({"sub": "user-123", "exp": datetime.now(timezone.utc) - timedelta(hours=1)})
    request = _build_request(f"Bearer {token}", client_ip="198.51.100.42")
    assert get_user_or_ip(request) == "198.51.100.42"


def test_token_zonder_sub_valt_terug_op_ip():
    token = _make_token({"exp": datetime.now(timezone.utc) + timedelta(hours=1)})
    request = _build_request(f"Bearer {token}", client_ip="198.51.100.42")
    assert get_user_or_ip(request) == "198.51.100.42"


def test_kapotte_header_valt_terug_op_ip():
    request = _build_request("Bearer niet-een-jwt", client_ip="198.51.100.42")
    assert get_user_or_ip(request) == "198.51.100.42"
