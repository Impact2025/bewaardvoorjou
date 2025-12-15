"""
Create admin user script
Run with: python -m scripts.create_admin
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.auth import hash_password
from app.core.config import settings
from datetime import datetime, timezone

def create_admin_user():
    """Create admin user with credentials"""

    # Create engine
    engine = create_engine(str(settings.database_url))

    with Session(engine) as db:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "bewaard@weareimpact.nl").first()

        if existing_admin:
            print("Admin user already exists!")
            print(f"Email: {existing_admin.email}")
            print(f"Is Admin: {existing_admin.is_admin}")

            # Update to ensure is_admin is True
            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                db.commit()
                print("Updated existing user to admin")
            return

        # Create new admin user
        admin_user = User(
            email="bewaard@weareimpact.nl",
            display_name="Admin",
            country="Nederland",
            locale="nl",
            password_hash=hash_password("Demo1234"),
            is_active=True,
            is_admin=True,
            created_at=datetime.now(timezone.utc),
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("Admin user created successfully!")
        print(f"Email: {admin_user.email}")
        print(f"Password: Demo1234")
        print(f"ID: {admin_user.id}")
        print(f"Is Admin: {admin_user.is_admin}")

if __name__ == "__main__":
    print("Creating admin user...")
    create_admin_user()
