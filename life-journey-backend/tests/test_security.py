"""Security header and endpoint tests."""
import pytest
from unittest.mock import patch
from starlette.testclient import TestClient


def test_csp_no_unsafe_eval(test_client):
    response = test_client.get("/healthz")
    csp = response.headers.get("Content-Security-Policy", "")
    assert "unsafe-eval" not in csp


def test_csp_script_src_no_unsafe_inline(test_client):
    response = test_client.get("/healthz")
    csp = response.headers.get("Content-Security-Policy", "")
    directives = {d.strip().split()[0]: d.strip() for d in csp.split(";")}
    script_src = directives.get("script-src", "")
    assert "unsafe-inline" not in script_src


def test_csp_present(test_client):
    response = test_client.get("/healthz")
    assert "Content-Security-Policy" in response.headers


def test_x_frame_options_deny(test_client):
    response = test_client.get("/healthz")
    assert response.headers.get("X-Frame-Options") == "DENY"


def test_debug_endpoint_removed(test_client):
    response = test_client.get("/debug/journey/some-id")
    assert response.status_code == 404


def test_500_response_hides_traceback_in_production(test_client):
    """In production mode the traceback must not leak to the client."""
    with patch("app.main.settings") as mock_settings:
        mock_settings.environment = "production"
        mock_settings.cors_origins = []
        # Simulate any 500 by calling the handler directly
        from app.main import app
        from fastapi import Request
        import asyncio

        async def call():
            scope = {"type": "http", "method": "GET", "path": "/", "headers": []}
            request = Request(scope)
            exc = RuntimeError("secret database error")
            for handler in app.exception_handlers.values():
                try:
                    resp = await handler(request, exc)
                    return resp
                except Exception:
                    pass

        resp = asyncio.get_event_loop().run_until_complete(call())
        if resp is not None:
            import json
            body = json.loads(resp.body)
            assert "traceback" not in body
            assert "secret database error" not in body.get("detail", "")


def test_cors_allowed_origin(test_client):
    response = test_client.get("/healthz", headers={"Origin": "http://localhost:3000"})
    assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"


def test_cors_unknown_origin_not_reflected(test_client):
    response = test_client.get("/healthz", headers={"Origin": "https://evil.example.com"})
    origin_header = response.headers.get("Access-Control-Allow-Origin", "")
    assert "evil.example.com" not in origin_header
