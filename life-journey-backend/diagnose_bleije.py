import sys
sys.path.insert(0, "D:/apps/memories/life-journey-backend")
from app.db.session import SessionLocal
from app.models.order import Order
from app.models.user import User
from app.models.email import EmailEvent
from sqlalchemy import func, or_

db = SessionLocal()

term = "%bleij%"
user_ids = [
    row[0]
    for row in db.query(User.id).filter(
        or_(
            func.lower(User.email).like(term),
            func.lower(User.display_name).like(term),
        )
    ).all()
]

filters = [
    func.lower(Order.guest_email).like(term),
    func.lower(Order.recipient_name).like(term),
    func.lower(Order.recipient_email).like(term),
]
if user_ids:
    filters.append(Order.user_id.in_(user_ids))

orders = db.query(Order).filter(or_(*filters)).order_by(Order.created_at.desc()).all()

if not orders:
    print("Geen orders gevonden voor 'bleij' — toon recente 10 bestellingen:")
    orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()
    for o in orders:
        buyer = o.guest_email or ""
        if o.user_id:
            u = db.query(User).filter(User.id == o.user_id).first()
            if u:
                buyer = u.email or ""
        datum = str(o.created_at)[:16] if o.created_at else "?"
        recv = o.recipient_name or "geen"
        print(f"{datum} | koper={buyer} | ontvanger={recv} | {o.status} | {o.package_type}")
else:
    for o in orders:
        buyer = o.guest_email or ""
        if o.user_id:
            u = db.query(User).filter(User.id == o.user_id).first()
            if u:
                buyer = u.email or ""
        print("=" * 60)
        print(f"Order ID     : {o.id}")
        print(f"Datum        : {o.created_at}")
        print(f"Status       : {o.status}")
        print(f"Pakket       : {o.package_type}")
        print(f"Koper email  : {buyer}")
        print(f"Ontvanger    : {o.recipient_name} <{o.recipient_email}>")
        print(f"Delivery date: {o.delivery_date}")
        print(f"Redemption sent: {o.redemption_email_sent_at}")
        print(f"Redemption token: {o.redemption_token}")
        print()

        # EmailEvents voor deze order
        events = db.query(EmailEvent).filter(EmailEvent.order_id == o.id).all()
        if events:
            print("  E-mail events:")
            for ev in events:
                print(f"    type={ev.email_type} | to={ev.sent_to} | status={ev.status} | resend_id={ev.resend_id} | error={ev.error_message}")
        else:
            print("  Geen EmailEvent records gevonden voor deze order!")

db.close()
