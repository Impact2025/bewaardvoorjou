"""Test alle email templates — stuur elk type naar chat@weareimpact.nl."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.email.renderer import (
    build_welcome_email,
    build_chapter_complete_email,
    build_milestone_unlock_email,
    build_password_reset_email,
    build_email_verification_email,
)
from app.services.email.client import send_email

TARGET = "chat@weareimpact.nl"
TEST_NAME = "Test Gebruiker"
JOURNEY = "Mijn levensverhaal"
TOKEN = "test-unsubscribe-token-123"

emails = [
    {
        "label": "1. Welcome",
        "build": lambda: build_welcome_email(
            user_display_name=TEST_NAME,
            journey_title=JOURNEY,
            unsubscribe_token=TOKEN,
        ),
    },
    {
        "label": "2. Hoofdstuk voltooid",
        "build": lambda: build_chapter_complete_email(
            user_display_name=TEST_NAME,
            journey_title=JOURNEY,
            chapter_id="childhood",
            completed_count=3,
            total_count=18,
            next_chapter_id="school",
            unsubscribe_token=TOKEN,
        ),
    },
    {
        "label": "3. Mijlpaal — bonus",
        "build": lambda: build_milestone_unlock_email(
            user_display_name=TEST_NAME,
            journey_title=JOURNEY,
            milestone_type="bonus",
            unsubscribe_token=TOKEN,
        ),
    },
    {
        "label": "4. Mijlpaal — verborgen dimensies",
        "build": lambda: build_milestone_unlock_email(
            user_display_name=TEST_NAME,
            journey_title=JOURNEY,
            milestone_type="hidden",
            unsubscribe_token=TOKEN,
        ),
    },
    {
        "label": "5. Wachtwoord reset",
        "build": lambda: build_password_reset_email(
            user_display_name=TEST_NAME,
            reset_url="https://bewaardvoorjou.nl/reset-password?token=test-reset-token",
        ),
    },
    {
        "label": "6. E-mail verificatie",
        "build": lambda: build_email_verification_email(
            user_display_name=TEST_NAME,
            verification_url="https://bewaardvoorjou.nl/verify-email?token=test-verify-token",
        ),
    },
]

print(f"Stuur {len(emails)} test-emails naar: {TARGET}")
print("=" * 60)

success = 0
failed = 0

for email in emails:
    label = email["label"]
    print(f"\n{label}")
    try:
        subject, html, text = email["build"]()
        print(f"  Subject : {subject}")
        msg_id = send_email(to=TARGET, subject=subject, html=html, text=text)
        print(f"  Status  : VERZONDEN (ID: {msg_id})")
        success += 1
    except Exception as e:
        print(f"  Status  : MISLUKT — {e}")
        failed += 1

print()
print("=" * 60)
print(f"Resultaat: {success} verzonden, {failed} mislukt")
if failed == 0:
    print("Alle emails succesvol verstuurd! Controleer inbox van chat@weareimpact.nl")
