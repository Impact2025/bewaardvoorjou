"""
Debug script to test email system
Run on Railway: python debug_email.py
"""
import os
import sys

print("=== EMAIL SYSTEM DEBUG ===\n")

# 1. Check environment variables
print("1. Environment Variables:")
resend_key = os.getenv("RESEND_API_KEY")
resend_from = os.getenv("RESEND_FROM_EMAIL", "not set")
app_url = os.getenv("APP_BASE_URL", "not set")
resend_enabled = os.getenv("RESEND_ENABLED", "true")

print(f"   RESEND_API_KEY: {'✓ Set' if resend_key else '✗ Missing'}")
if resend_key:
    print(f"   Key starts with: {resend_key[:10]}...")
print(f"   RESEND_FROM_EMAIL: {resend_from}")
print(f"   APP_BASE_URL: {app_url}")
print(f"   RESEND_ENABLED: {resend_enabled}")

# 2. Test imports
print("\n2. Import Test:")
try:
    from app.services.email.client import send_email
    from app.services.email.events import trigger_welcome_email
    from app.models.email import EmailEvent
    print("   ✓ Email modules import successfully")
except Exception as e:
    print(f"   ✗ Import failed: {e}")
    sys.exit(1)

# 3. Database connection
print("\n3. Database Connection:")
try:
    from app.db.session import SessionLocal
    db = SessionLocal()
    
    # Check if tables exist
    from sqlalchemy import inspect, text
    inspector = inspect(db.bind)
    tables = inspector.get_table_names()
    
    has_emailevent = 'emailevent' in tables
    has_emailpreference = 'emailpreference' in tables
    
    print(f"   emailevent table: {'✓' if has_emailevent else '✗'}")
    print(f"   emailpreference table: {'✓' if has_emailpreference else '✗'}")
    
    if has_emailevent:
        # Count email events
        result = db.execute(text("SELECT COUNT(*) FROM emailevent")).scalar()
        print(f"   Total email events: {result}")
        
        # Show recent events
        recent = db.execute(text(
            "SELECT email_type, status, sent_to, error_message, created_at "
            "FROM emailevent ORDER BY created_at DESC LIMIT 3"
        )).fetchall()
        
        if recent:
            print("\n   Recent EmailEvents:")
            for row in recent:
                print(f"   - {row[0]} → {row[1]} ({row[2]}) at {row[4]}")
                if row[3]:
                    print(f"     Error: {row[3]}")
    
    db.close()
    
except Exception as e:
    print(f"   ✗ Database error: {e}")

print("\n=== END DEBUG ===")
