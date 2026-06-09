"""Admin orders routes — overzicht, statusbeheer en USB-tracking."""

from __future__ import annotations

import csv
import io
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.models.audit_log import AuditLog
from app.models.order import Order
from app.models.user import User
from app.schemas.orders import OrderAdmin, OrderListResponse, UpdateOrderStatusRequest

router = APIRouter(dependencies=[Depends(get_current_admin_user)])


def _enrich(order: Order, db: Session) -> dict:
    """Voeg kopergegevens toe aan een order dict."""
    buyer_email: str | None = order.guest_email
    buyer_name: str | None = None
    if order.user_id:
        user = db.query(User).filter(User.id == order.user_id).first()
        if user:
            buyer_email = user.email
            buyer_name = user.display_name
    data = {c.name: getattr(order, c.name) for c in order.__table__.columns}
    data["buyer_email"] = buyer_email
    data["buyer_name"] = buyer_name
    data["addons"] = data.get("addons") or []
    return data


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_order_stats(
    db: Session = Depends(get_db),
):
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    paid_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status.in_(["PAID", "FULFILLED"]))
        .scalar() or 0
    )
    pending_fulfillment = (
        db.query(func.count(Order.id))
        .filter(Order.status == "PAID")
        .scalar() or 0
    )
    total_revenue_cents = (
        db.query(func.sum(Order.price_paid))
        .filter(Order.status.in_(["PAID", "FULFILLED"]))
        .scalar() or 0
    )
    usb_needed = (
        db.query(func.count(Order.id))
        .filter(
            Order.status == "PAID",
            Order.usb_burned_at.is_(None),
            Order.package_type.in_(["BEGIN", "ERFGOED", "VOOR_ALTIJD"]),
        )
        .scalar() or 0
    )
    return {
        "total_orders": total_orders,
        "paid_orders": paid_orders,
        "pending_fulfillment": pending_fulfillment,
        "total_revenue_cents": total_revenue_cents,
        "usb_needed": usb_needed,
    }


# ---------------------------------------------------------------------------
# List orders
# ---------------------------------------------------------------------------

@router.get("", response_model=OrderListResponse)
def list_orders(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    search: Optional[str] = Query(default=None, max_length=100),
    order_status: Optional[str] = Query(default=None, alias="status"),
    package_type: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
):
    q = db.query(Order)

    if order_status:
        q = q.filter(Order.status == order_status.upper())

    if package_type:
        q = q.filter(Order.package_type == package_type.upper())

    if date_from:
        try:
            q = q.filter(Order.created_at >= datetime.fromisoformat(date_from))
        except ValueError:
            pass

    if date_to:
        try:
            q = q.filter(Order.created_at <= datetime.fromisoformat(date_to))
        except ValueError:
            pass

    if search:
        term = f"%{search.lower()}%"
        # Zoek op gast-email of cadeauontvanger-email
        email_filter = or_(
            func.lower(Order.guest_email).like(term),
            func.lower(Order.recipient_email).like(term),
            func.lower(Order.recipient_name).like(term),
            func.lower(Order.promo_code_used).like(term),
            func.lower(Order.id).like(term),
        )
        # Inclusief gebruikers die ingelogd waren
        user_ids = [
            row[0]
            for row in db.query(User.id).filter(
                or_(
                    func.lower(User.email).like(term),
                    func.lower(User.display_name).like(term),
                )
            ).all()
        ]
        if user_ids:
            q = q.filter(or_(email_filter, Order.user_id.in_(user_ids)))
        else:
            q = q.filter(email_filter)

    total = q.count()
    orders = q.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    enriched = [OrderAdmin(**_enrich(o, db)) for o in orders]
    return OrderListResponse(orders=enriched, total=total, skip=skip, limit=limit)


# ---------------------------------------------------------------------------
# Single order
# ---------------------------------------------------------------------------

@router.get("/{order_id}", response_model=OrderAdmin)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Bestelling niet gevonden")
    return OrderAdmin(**_enrich(order, db))


# ---------------------------------------------------------------------------
# Status bijwerken
# ---------------------------------------------------------------------------

@router.patch("/{order_id}/status", response_model=OrderAdmin)
def update_order_status(
    order_id: str,
    body: UpdateOrderStatusRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Bestelling niet gevonden")

    old_status = order.status
    order.status = body.status

    if body.status == "FULFILLED" and not order.fulfilled_at:
        order.fulfilled_at = datetime.now(timezone.utc)

    db.add(AuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="order_status_change",
        detail=f"order={order_id} {old_status}→{body.status}",
    ))
    db.commit()
    db.refresh(order)
    return OrderAdmin(**_enrich(order, db))


# ---------------------------------------------------------------------------
# USB-stick gebranden markeren
# ---------------------------------------------------------------------------

@router.patch("/{order_id}/usb-burned", response_model=OrderAdmin)
def mark_usb_burned(
    order_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Bestelling niet gevonden")

    order.usb_burned_at = datetime.now(timezone.utc)
    order.usb_burned_by = admin.email
    db.add(AuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="order_usb_burned",
        detail=f"order={order_id}",
    ))
    db.commit()
    db.refresh(order)
    return OrderAdmin(**_enrich(order, db))


# ---------------------------------------------------------------------------
# CSV export
# ---------------------------------------------------------------------------

@router.get("/export/csv")
def export_orders_csv(
    db: Session = Depends(get_db),
    order_status: Optional[str] = Query(default=None, alias="status"),
):
    q = db.query(Order)
    if order_status:
        q = q.filter(Order.status == order_status.upper())
    orders = q.order_by(Order.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Datum", "Status", "Klant email", "Pakket",
        "Add-ons", "Bedrag (€)", "Korting (€)", "Promo code",
        "Ontvanger naam", "Ontvanger email", "USB gebrand op", "Verstuurd op",
    ])

    for o in orders:
        buyer_email = o.guest_email
        if o.user_id:
            user = db.query(User).filter(User.id == o.user_id).first()
            if user:
                buyer_email = user.email

        writer.writerow([
            o.id,
            o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "",
            o.status,
            buyer_email or "",
            o.package_type,
            ", ".join(o.addons or []),
            f"{o.price_paid / 100:.2f}",
            f"{o.discount_cents / 100:.2f}",
            o.promo_code_used or "",
            o.recipient_name or "",
            o.recipient_email or "",
            o.usb_burned_at.strftime("%Y-%m-%d") if o.usb_burned_at else "",
            o.fulfilled_at.strftime("%Y-%m-%d") if o.fulfilled_at else "",
        ])

    output.seek(0)
    filename = f"bestellingen_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
