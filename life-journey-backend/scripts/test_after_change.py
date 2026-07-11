"""Test email after changing to test domain."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

print("=" * 80)
print("CHECKING CURRENT CONFIGURATION")
print("=" * 80)
print()
print(f"RESEND_FROM_EMAIL: {settings.resend_from_email}")
print()

if "resend.dev" in settings.resend_from_email:
    print("[OK] Using Resend test domain - should work!")
    print()
    print("Now test by registering a new user at:")
    print("https://bewaardvoorjou.vercel.app/register")
    print()
    print("Email should arrive within seconds!")
elif "bewaardvoorjou.nl" in settings.resend_from_email:
    print("[WAIT] Still using bewaardvoorjou.nl domain")
    print()
    print("Railway hasn't redeployed yet, or change not applied.")
    print("Wait 30-60 seconds and run this script again:")
    print("railway run python test_after_change.py")
else:
    print(f"[?] Unexpected domain: {settings.resend_from_email}")

print()
print("=" * 80)
