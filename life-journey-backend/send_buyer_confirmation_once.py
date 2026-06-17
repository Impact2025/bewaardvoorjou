"""
One-off script: stuur koper-bevestiging naar vincent@fellow-travellers.com.

Uitvoeren op Railway:
  railway run python send_buyer_confirmation_once.py
"""

import sys
from app.db.session import SessionLocal
from app.models.order import Order
from app.api.v1.routes.webhooks import _send_gift_buyer_confirmation, _PACKAGE_NAMES

db = SessionLocal()

try:
    # Zoek de order op bestelnummer-fragment (D9AA975D) of op gast-email
    order = (
        db.query(Order)
        .filter(Order.guest_email == "vin3@fellow-travellers.com")
        .filter(Order.status == "PAID")
        .order_by(Order.created_at.desc())
        .first()
    )

    if not order:
        print("FOUT: Order niet gevonden voor vincent@fellow-travellers.com", file=sys.stderr)
        sys.exit(1)

    print(f"Order gevonden: {order.id}")
    print(f"  Pakket:  {order.package_type}")
    print(f"  Voor:    {order.recipient_name} ({order.recipient_email})")
    print(f"  Koper:   {order.guest_email}")
    print(f"  Status:  {order.status}")

    if not order.recipient_email:
        print("FOUT: Geen recipient_email op de order.", file=sys.stderr)
        sys.exit(1)

    _send_gift_buyer_confirmation(
        db,
        order=order,
        buyer_email=order.guest_email,
        recipient_name=order.recipient_name or "de ontvanger",
        recipient_email=order.recipient_email,
    )
    print(f"Mail verstuurd naar {order.guest_email}")

finally:
    db.close()
