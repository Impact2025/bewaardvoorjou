"""
Create or promote an admin user.
Run with: python -m scripts.create_admin

Reads credentials from environment variables:
  ADMIN_EMAIL     — required
  ADMIN_PASSWORD  — required (min 12 chars recommended)
  ADMIN_NAME      — optional, defaults to "Admin"
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.services.auth import hash_password
from datetime import datetime, timezone


def main() -> None:
    email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD", "").strip()
    name = os.environ.get("ADMIN_NAME", "Admin").strip()

    if not email or not password:
        print("ERROR: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.")
        print("  ADMIN_EMAIL=... ADMIN_PASSWORD=... python -m scripts.create_admin")
        sys.exit(1)

    if len(password) < 12:
        print("ERROR: ADMIN_PASSWORD must be at least 12 characters.")
        sys.exit(1)

    engine = create_engine(str(settings.database_url))

    with Session(engine) as db:
        existing = db.query(User).filter(User.email == email).first()

        if existing:
            if not existing.is_admin:
                existing.is_admin = True
                db.commit()
                print(f"Promoted {email} to admin.")
            else:
                print(f"{email} is already an admin.")
            return

        user = User(
            email=email,
            display_name=name,
            country="Nederland",
            locale="nl",
            password_hash=hash_password(password),
            is_active=True,
            is_admin=True,
            email_verified=True,
            privacy_level="private",
            target_recipients=[],
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        print(f"Admin user created: {email}")


if __name__ == "__main__":
    main()
