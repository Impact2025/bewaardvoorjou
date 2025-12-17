"""
Test email trigger - Run this to manually test sending a welcome email
Usage: python test_email_trigger.py <user_email>
"""
import sys
from app.db.session import SessionLocal
from app.models.user import User
from app.services.email.events import trigger_welcome_email

def test_welcome_email(user_email: str):
    db = SessionLocal()

    # Find user by email
    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        print(f"❌ User not found: {user_email}")
        print("\nAvailable users:")
        users = db.query(User.email).limit(5).all()
        for u in users:
            print(f"  - {u.email}")
        db.close()
        return

    print(f"✓ Found user: {user.display_name} ({user.email})")
    print(f"  User ID: {user.id}")

    # Trigger welcome email
    print("\nTriggering welcome email...")
    try:
        task_id = trigger_welcome_email(db, user.id)

        if task_id:
            print(f"✓ Email triggered successfully! Task ID: {task_id}")
        else:
            print("⚠️ Email not sent (already sent or user opted out)")

    except Exception as e:
        print(f"❌ Error triggering email: {e}")
        import traceback
        traceback.print_exc()

    # Check EmailEvent table
    from app.models.email import EmailEvent
    events = db.query(EmailEvent).filter(
        EmailEvent.user_id == user.id
    ).order_by(EmailEvent.created_at.desc()).limit(3).all()

    if events:
        print(f"\n📧 EmailEvent records for this user ({len(events)}):")
        for event in events:
            print(f"  - {event.email_type}: {event.status}")
            print(f"    To: {event.sent_to}")
            print(f"    Created: {event.created_at}")
            if event.error_message:
                print(f"    Error: {event.error_message}")
            if event.resend_id:
                print(f"    Resend ID: {event.resend_id}")
    else:
        print("\n⚠️ No EmailEvent records found for this user")

    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_email_trigger.py <user_email>")
        print("Example: python test_email_trigger.py vincent@example.com")
        sys.exit(1)

    test_welcome_email(sys.argv[1])
