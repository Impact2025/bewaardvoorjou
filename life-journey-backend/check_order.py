import sys
sys.path.insert(0, "D:/apps/memories/life-journey-backend")
from app.db.session import SessionLocal
from app.models.order import Order
db = SessionLocal()
orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
for o in orders:
    print(o.guest_email, "|", o.recipient_name, "|", o.recipient_email, "|", o.status, "|", o.package_type)
db.close()
