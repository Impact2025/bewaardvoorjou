"""Machine-leestoegang voor Impact OS — bestellingen-dashboard + inkoop-signalering.

Tegenhanger van publish.py (Impact OS -> memories, schrijft artikelen): dit is
memories -> Impact OS, en leest alleen. Bewust een eigen router zonder de
router-level `get_current_admin_user`-dependency van admin_orders.py (dat is
een mens-JWT; een machine-proces heeft geen mens-sessie) en bewust GEEN
schrijfroutes hier — status wijzigen, USB-gebrand markeren en e-mails
hersturen blijven exclusief via het admin-panel (mens-only).

Auth: Authorization: Bearer <ORDERS_API_KEY> (timing-safe), zelfde patroon
als PUBLISH_API_KEY in publish.py. Moet gelijk zijn aan BEWAARDVOORJOU_ORDERS_KEY
in de Impact OS .env.

LET OP: het pad heet "impactos-sync" om gelijk te lopen met de caller
(Impact OS, voorheen Agent OS) — dit is een los repo en volgt de rename daar
dus niet automatisch; bij een volgende naamswijziging aan de Impact OS-kant
moet dit pad hier handmatig mee.
"""
from __future__ import annotations

import hashlib
import hmac
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.models.order import Order

router = APIRouter()


def _is_authorized(request: Request) -> bool:
    key = getattr(settings, "orders_api_key", None)
    if not key:
        return False
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        return False
    provided = auth[7:].encode("utf-8")
    expected = key.encode("utf-8")
    return hmac.compare_digest(
        hashlib.sha256(provided).digest(),
        hashlib.sha256(expected).digest(),
    )


@router.get("/impactos-sync")
def impactos_sync(
    request: Request,
    db: Session = Depends(get_db),
    days: int = Query(default=180, ge=1, le=730),
):
    """Read-only export voor Impact OS: orders van de laatste `days` dagen.

    Sinds 25 aug 2026 ook shipping_address/card_message/personal_message/
    recipient_relation: Impact OS regelt de fysieke fulfillment
    (dagbesteding-flow: adressticker + kaartjestekst), en heeft daarvoor het
    verzendadres en de door de klant geschreven tekst nodig.
    gift_card_code blijft bewust buiten de export: die bestaat alleen bij
    DIGITAAL (niets te verzenden) en is de sleutel tot de publieke cadeaupagina.
    E-mailadressen (koper én begiftigde) blijven bewust buiten deze export —
    niet nodig voor een adressticker, dus geen reden om die PII te cachen.
    """
    if not _is_authorized(request):
        raise HTTPException(status_code=401, detail="Unauthorized")

    since = datetime.now(timezone.utc) - timedelta(days=days)
    orders = (
        db.query(Order)
        .filter(Order.created_at >= since)
        .order_by(Order.created_at.desc())
        .all()
    )

    return {
        "orders": [
            {
                "id": o.id,
                "status": o.status,
                "package_type": o.package_type,
                "addons": o.addons or [],
                "price_paid": o.price_paid,
                "discount_cents": o.discount_cents,
                "promo_code_used": o.promo_code_used,
                "recipient_name": o.recipient_name,
                "recipient_relation": o.recipient_relation,
                "card_message": o.card_message,
                "personal_message": o.personal_message,
                "shipping_address": o.shipping_address,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "paid_at": o.paid_at.isoformat() if o.paid_at else None,
                "fulfilled_at": o.fulfilled_at.isoformat() if o.fulfilled_at else None,
                "usb_burned_at": o.usb_burned_at.isoformat() if o.usb_burned_at else None,
            }
            for o in orders
        ],
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }
