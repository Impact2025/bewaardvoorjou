"""Test email to account owner address."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.email.renderer import build_welcome_email
from app.services.email.client import send_email

print("Testing email to account owner: info@bewaardvoorjou.nl")
print()

try:
    subject, html, text = build_welcome_email(
        user_display_name="Test User",
        journey_title="Je levensverhaal",
        unsubscribe_token="test-123"
    )

    print("Sending test welcome email...")
    message_id = send_email(
        to="info@bewaardvoorjou.nl",
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
    print(f"Sent to: info@bewaardvoorjou.nl")
    print()
    print("Check the inbox at info@bewaardvoorjou.nl!")
    print()
    print("If email arrives, the system works perfectly!")
    print("You just need to wait for bewaardvoorjou.nl domain verification")
    print("to send to any email address.")

except Exception as e:
    print()
    print("=" * 80)
    print("FAILED!")
    print("=" * 80)
    print(f"Error: {e}")
