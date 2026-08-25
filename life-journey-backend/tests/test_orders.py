"""Tests voor de orders-route — focus op de betaalstatus-mapping.

Borgt dat een geannuleerde/afgebroken Stripe-betaling NOOIT als 'paid' wordt
geïnterpreteerd (anders toont de bevestigingspagina valse success).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from uuid import uuid4

import pytest

from app.api.v1.routes.orders import _map_stripe_status


@pytest.mark.parametrize(
    "stripe_status,expected",
    [
        ("succeeded", "paid"),
        ("processing", "processing"),
        # Geannuleerd of laatste poging mislukt/afgebroken → nooit 'paid'
        ("canceled", "failed"),
        ("requires_payment_method", "failed"),
        # Nog niet afgerond
        ("requires_action", "pending"),
        ("requires_confirmation", "pending"),
        ("requires_capture", "pending"),
        # Onbekende/toekomstige status → veilige fallback
        ("something_new", "pending"),
    ],
)
def test_map_stripe_status(stripe_status: str, expected: str) -> None:
    assert _map_stripe_status(stripe_status) == expected


# ── Gratis order (100%-kortingscode) hoogt de promo-teller op ────────────────
#
# VADERDAG26/VRIEND26 (aug 2026): een 100%-korting slaat de Stripe-webhook
# helemaal over (create_payment_intent zet 'm meteen op PAID), en
# increment_promo_usage() werd tot nu toe alleen vanuit die webhook
# aangeroepen. Daardoor bleef used_count op 0 staan terwijl de code allang
# gebruikt werd, en is een max_uses-limiet op zo'n code onbetrouwbaar
# precies wanneer je 'm het hardst nodig hebt.

@dataclass
class _FakePromo:
    code: str = "GRATIS100"
    description: str | None = None
    discount_type: str = "PERCENTAGE"
    discount_value: int = 100
    applicable_packages: list | None = None
    max_uses: int | None = None
    used_count: int = 0
    grants_package: str | None = None
    expires_at: object | None = None
    is_active: bool = True


class _FakeOrdersQuery:
    def __init__(self, data: list):
        self._data = list(data)

    def filter(self, *_):
        return self

    def first(self):
        return self._data[0] if self._data else None

    def all(self):
        return self._data


class _FakeOrdersDb:
    def __init__(self, promo: _FakePromo):
        self._promo = promo
        self.added: list = []
        self.committed = False

    def query(self, model):
        from app.models.promo_code import PromoCode
        if model is PromoCode:
            return _FakeOrdersQuery([self._promo])
        return _FakeOrdersQuery([])

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        self.committed = True

    def refresh(self, obj):
        if getattr(obj, "id", None) is None:
            obj.id = str(uuid4())

    def flush(self):
        pass


def test_gratis_order_verhoogt_promo_teller(monkeypatch) -> None:
    from app.api.v1.routes import orders as orders_module
    from app.schemas.orders import CreatePaymentIntentRequest

    promo = _FakePromo(code="GRATIS100", used_count=0)
    db = _FakeOrdersDb(promo)

    monkeypatch.setattr(orders_module.settings, "stripe_publishable_key", "pk_test_dummy")
    # Free-order branch raakt Stripe zelf nooit aan (total_cents <= 0, geen
    # PaymentIntent nodig) - _get_stripe() alleen omzeilen zodat de test niet
    # afhangt van een geïnstalleerd stripe-package.
    monkeypatch.setattr(orders_module, "_get_stripe", lambda: object())
    monkeypatch.setattr(orders_module, "_trigger_order_email_free", lambda **kw: None)
    monkeypatch.setattr(
        "app.services.email.admin.send_owner_sale_notification", lambda *a, **kw: None
    )

    payload = CreatePaymentIntentRequest(
        package_type="DIGITAAL",
        promo_code="gratis100",
        guest_email="klant@example.com",
        for_self=True,
    )

    class _FakeRequest:
        client = None
        headers: dict = {}
        state = type("S", (), {})()

    orders_module.create_payment_intent.__wrapped__(
        request=_FakeRequest(), payload=payload, db=db, current_user=None,
    )

    assert promo.used_count == 1, (
        "Een 100%-kortingscode moet used_count ophogen bij het gratis "
        "verzilveren, net als de Stripe-webhook dat bij een betaalde order doet."
    )
    assert db.committed
    orders_created = [o for o in db.added if getattr(o, "price_paid", None) == 0]
    assert orders_created and orders_created[0].status == "PAID"
