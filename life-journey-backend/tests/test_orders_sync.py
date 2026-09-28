"""Tests voor de read-only bestellingen-export naar Impact OS."""
from datetime import datetime, timezone
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.api.v1.routes import orders_sync

API_KEY = "test-orders-key"


class _FakeQuery:
    def __init__(self, rows):
        self._rows = rows

    def filter(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def all(self):
        return self._rows


class _FakeDb:
    def __init__(self, rows):
        self._rows = rows

    def query(self, model):
        return _FakeQuery(self._rows)


def _request(auth: str | None) -> Request:
    headers = [(b"authorization", auth.encode())] if auth else []
    return Request({"type": "http", "headers": headers})


def _order(**overrides):
    base = dict(
        id="ord-1",
        status="PAID",
        package_type="ERFGOED",
        addons=[],
        price_paid=14900,
        discount_cents=0,
        promo_code_used=None,
        recipient_name="Oma Riet",
        recipient_relation="oma",
        card_message="Voor de mooiste verhalen",
        personal_message=None,
        shipping_address={"full_name": "Riet Jansen", "city": "Utrecht"},
        gift_card_code="ABCDEF1234",
        guest_email="koper@example.com",
        created_at=datetime(2026, 9, 1, tzinfo=timezone.utc),
        paid_at=None,
        fulfilled_at=None,
        usb_burned_at=None,
    )
    base.update(overrides)
    return SimpleNamespace(**base)


@pytest.fixture(autouse=True)
def _api_key(monkeypatch):
    monkeypatch.setattr(orders_sync.settings, "orders_api_key", API_KEY, raising=False)


def test_export_bevat_fulfillment_velden_maar_geen_cadeaucode_of_email():
    result = orders_sync.impactos_sync(
        request=_request(f"Bearer {API_KEY}"), db=_FakeDb([_order()]), days=180
    )
    order = result["orders"][0]

    assert order["shipping_address"] == {"full_name": "Riet Jansen", "city": "Utrecht"}
    assert order["card_message"] == "Voor de mooiste verhalen"
    assert order["recipient_relation"] == "oma"
    assert "gift_card_code" not in order
    assert not any("email" in key for key in order)


@pytest.mark.parametrize("auth", [None, "Bearer verkeerd", API_KEY])
def test_export_weigert_zonder_geldige_sleutel(auth):
    with pytest.raises(HTTPException) as exc:
        orders_sync.impactos_sync(request=_request(auth), db=_FakeDb([]), days=180)
    assert exc.value.status_code == 401
