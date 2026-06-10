"""Tests voor de orders-route — focus op de betaalstatus-mapping.

Borgt dat een geannuleerde/afgebroken Stripe-betaling NOOIT als 'paid' wordt
geïnterpreteerd (anders toont de bevestigingspagina valse success).
"""
from __future__ import annotations

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
