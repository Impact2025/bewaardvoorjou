"""
Diagnostic script to debug email sending issues.

Run this on Railway:
railway run python diagnose_email.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.email import EmailEvent as EmailEventModel
from app.models.user import User as UserModel
from sqlalchemy import desc

print("=" * 80)
print("BEWAARDVOORJOU.NL - EMAIL SYSTEM DIAGNOSTIC")
print("=" * 80)
print()

# 1. Check environment variables
print("1. ENVIRONMENT VARIABLES:")
print("-" * 80)
print(f"RESEND_API_KEY: {'[OK] Set' if settings.resend_api_key else '[X] NOT SET'}")
if settings.resend_api_key:
    print(f"   Value: {settings.resend_api_key[:8]}...{settings.resend_api_key[-4:]}")
print(f"RESEND_FROM_EMAIL: {settings.resend_from_email}")
print(f"RESEND_ENABLED: {settings.resend_enabled}")
print(f"APP_BASE_URL: {settings.app_base_url}")
print(f"REDIS_URL: {settings.redis_url}")
print()

# 2. Check database connection
print("2. DATABASE CONNECTION:")
print("-" * 80)
try:
    db = SessionLocal()
    user_count = db.query(UserModel).count()
    print(f"[OK] Database connected")
    print(f"  Total users: {user_count}")
except Exception as e:
    print(f"[X] Database connection failed: {e}")
    sys.exit(1)

print()

# 3. Check EmailEvent records
print("3. EMAIL EVENTS:")
print("-" * 80)
try:
    total_events = db.query(EmailEventModel).count()
    pending_events = db.query(EmailEventModel).filter(EmailEventModel.status == "pending").count()
    sent_events = db.query(EmailEventModel).filter(EmailEventModel.status == "sent").count()
    failed_events = db.query(EmailEventModel).filter(EmailEventModel.status == "failed").count()

    print(f"Total email events: {total_events}")
    print(f"  - Pending: {pending_events}")
    print(f"  - Sent: {sent_events}")
    print(f"  - Failed: {failed_events}")
    print()

    # Show recent events
    recent_events = db.query(EmailEventModel).order_by(desc(EmailEventModel.created_at)).limit(5).all()

    if recent_events:
        print("Recent email events:")
        for event in recent_events:
            print(f"  [{event.status.upper()}] {event.email_type} to {event.sent_to} - {event.created_at}")
            if event.error_message:
                print(f"     Error: {event.error_message}")
    else:
        print("No email events found in database")

except Exception as e:
    print(f"[X] Failed to query EmailEvents: {e}")

print()

# 4. Check users
print("4. RECENT USERS:")
print("-" * 80)
try:
    recent_users = db.query(UserModel).order_by(desc(UserModel.created_at)).limit(3).all()

    if recent_users:
        for user in recent_users:
            print(f"  User: {user.email} ({user.display_name})")
            print(f"    ID: {user.id}")
            print(f"    Created: {user.created_at}")

            # Check if welcome email was sent
            welcome_email = db.query(EmailEventModel).filter(
                EmailEventModel.user_id == user.id,
                EmailEventModel.email_type == "welcome"
            ).first()

            if welcome_email:
                print(f"    Welcome email: {welcome_email.status}")
                if welcome_email.error_message:
                    print(f"    Error: {welcome_email.error_message}")
            else:
                print(f"    Welcome email: NOT SENT [X]")
            print()
    else:
        print("No users found")

except Exception as e:
    print(f"[X] Failed to query users: {e}")

print()

# 5. Test Resend API connection
print("5. RESEND API TEST:")
print("-" * 80)

if not settings.resend_api_key:
    print("[X] Cannot test Resend - API key not set")
elif not settings.resend_enabled:
    print("[X] Email sending is disabled (RESEND_ENABLED=false)")
else:
    print("Testing Resend API connection...")
    try:
        import httpx

        response = httpx.get(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
            },
            timeout=10.0,
        )

        if response.status_code == 200:
            print("[OK] Resend API connection successful")
        else:
            print(f"[X] Resend API returned status {response.status_code}")
            print(f"  Response: {response.text[:200]}")

    except Exception as e:
        print(f"[X] Resend API test failed: {e}")

print()

# 6. Manual email send test (optional)
print("6. MANUAL EMAIL SEND TEST:")
print("-" * 80)

# Get most recent user
recent_user = db.query(UserModel).order_by(desc(UserModel.created_at)).first()

if recent_user and settings.resend_api_key and settings.resend_enabled:
    print(f"Would you like to send a test welcome email to {recent_user.email}?")
    print("This will help identify if the problem is in the sending or triggering logic.")
    print()

    # Ask for confirmation
    response = input("Send test email? (yes/no): ").strip().lower()

    if response == 'yes':
        print("\nSending test email...")
        try:
            from app.services.email.renderer import build_welcome_email
            from app.services.email.client import send_email

            subject, html, text = build_welcome_email(
                user_display_name=recent_user.display_name,
                journey_title="Je levensverhaal",
                unsubscribe_token=f"test-{recent_user.id}"
            )

            message_id = send_email(
                to=recent_user.email,
                subject=subject,
                html=html,
                text=text
            )

            print(f"[OK] Test email sent successfully!")
            print(f"  Resend Message ID: {message_id}")
            print(f"  Sent to: {recent_user.email}")
            print()
            print("Check the inbox! If you receive this email, the problem is in the")
            print("registration trigger logic. If not, check Resend dashboard for errors.")

        except Exception as e:
            print(f"[X] Test email failed: {e}")
    else:
        print("Test email skipped")
else:
    if not recent_user:
        print("No users found to test with")
    elif not settings.resend_api_key:
        print("Cannot test - RESEND_API_KEY not set")
    elif not settings.resend_enabled:
        print("Cannot test - RESEND_ENABLED is false")

print()
print("=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)

db.close()
