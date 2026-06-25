"""Direct email send test - no prompts."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User as UserModel
from app.services.email.renderer import build_welcome_email
from app.services.email.client import send_email
from sqlalchemy import desc

print("Testing direct email send...")
print(f"From: {settings.resend_from_email}")
print(f"API Key: {settings.resend_api_key[:8]}...{settings.resend_api_key[-4:]}")
print()

db = SessionLocal()

# Get most recent user
user = db.query(UserModel).order_by(desc(UserModel.created_at)).first()

if not user:
    print("No users found")
    sys.exit(1)

print(f"Recipient: {user.email}")
print(f"User: {user.display_name}")
print()

try:
    subject, html, text = build_welcome_email(
        user_display_name=user.display_name,
        journey_title="Je levensverhaal",
        unsubscribe_token=f"test-{user.id}"
    )

    print(f"Subject: {subject}")
    print("Template built successfully")
    print()

    print("Attempting to send via Resend API...")
    message_id = send_email(
        to=user.email,
        subject=subject,
        html=html,
        text=text
    )

    print()
    print("=" * 80)
    print("SUCCESS!")
    print("=" * 80)
    print(f"Email sent successfully!")
    print(f"Resend Message ID: {message_id}")
    print(f"Sent to: {user.email}")
    print()
    print("Check the inbox (and spam folder)!")

except Exception as e:
    print()
    print("=" * 80)
    print("FAILED!")
    print("=" * 80)
    print(f"Error: {e}")
    print()

    if "403" in str(e) and "not verified" in str(e):
        print("Domain is still not verified by Resend.")
        print("Even though DNS is propagated, Resend hasn't re-checked yet.")
        print()
        print("Solutions:")
        print("1. Wait 10-15 more minutes for Resend to auto-verify")
        print("2. Contact Resend support to manually trigger verification")
        print("3. Use test domain temporarily: onboarding@resend.dev")

db.close()
