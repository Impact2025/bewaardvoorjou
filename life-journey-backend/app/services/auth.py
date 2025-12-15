from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.models.journey import Journey


password_hasher = PasswordHasher()


def _default_progress() -> dict[str, float]:
  return {
    "roots": 0.0,
    "music": 0.0,
    "milestones": 0.0,
    "humor": 0.0,
    "lessons": 0.0,
    "people": 0.0,
    "message": 0.0,
  }


def hash_password(password: str) -> str:
  return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
  try:
    if password_hasher.verify(hashed_password, plain_password):
      return True
  except (VerifyMismatchError, VerificationError):
    return False
  except Exception:
    return False

  return False


def create_access_token(*, subject: str, expires_delta: timedelta | None = None) -> str:
  now = datetime.now(timezone.utc)
  expire = now + (expires_delta or timedelta(minutes=settings.jwt_access_token_expires_minutes))
  payload = {"sub": subject, "iat": now, "exp": expire}
  return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def register_user(db: Session, *, email: str, password: str, **user_kwargs) -> User:
  normalized_email = email.lower()
  existing_user = db.query(User).filter_by(email=normalized_email).first()
  if existing_user:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mailadres is al geregistreerd")

  target_recipients = user_kwargs.get("target_recipients")
  if target_recipients is None:
    user_kwargs["target_recipients"] = []
  else:
    user_kwargs["target_recipients"] = list(target_recipients)
  if "is_active" not in user_kwargs:
    user_kwargs["is_active"] = True
  user = User(email=normalized_email, password_hash=hash_password(password), **user_kwargs)
  journey_title = user.display_name if getattr(user, "display_name", None) else "Mijn levensverhaal"
  journey = Journey(
    id=str(uuid4()),
    title=f"Verhaal van {journey_title}",
    user=user,
    progress=_default_progress(),
  )
  db.add(user)
  db.add(journey)
  db.commit()
  db.refresh(user)
  return user


def authenticate_user(db: Session, *, email: str, password: str) -> User:
  normalized_email = email.lower()
  user = db.query(User).filter_by(email=normalized_email).first()
  if not user or not verify_password(password, user.password_hash):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ongeldige inloggegevens")

  if not user.is_active:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is gedeactiveerd")

  if password_hasher.check_needs_rehash(user.password_hash):
    user.password_hash = hash_password(password)

  user.last_login_at = datetime.now(timezone.utc)
  db.add(user)
  db.commit()
  db.refresh(user)
  return user
