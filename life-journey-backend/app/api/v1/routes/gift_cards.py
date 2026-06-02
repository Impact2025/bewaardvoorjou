"""Gift cards — publieke endpoint voor Vaderdag Digitaal cadeaukaarten."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order

router = APIRouter()


class GiftCardResponse(BaseModel):
    code: str
    recipient_name: str | None
    personal_message: str | None
    paid_at: datetime | None

    model_config = {"from_attributes": True}


@router.get("/{code}", response_model=GiftCardResponse)
def get_gift_card(code: str, db: Session = Depends(get_db)) -> GiftCardResponse:
    """Ophalen van cadeaukaart data — publiek, alleen voor betaalde DIGITAAL orders."""
    order = (
        db.query(Order)
        .filter(Order.gift_card_code == code, Order.status == "PAID")
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Cadeaukaart niet gevonden")

    return GiftCardResponse(
        code=order.gift_card_code,
        recipient_name=order.recipient_name,
        personal_message=order.personal_message,
        paid_at=order.paid_at,
    )
