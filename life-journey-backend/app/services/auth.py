from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import EMAIL_NOT_VERIFIED
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


def register_user(
  db: Session,
  *,
  email: str,
  password: str,
  consent_terms: bool = False,
  consent_special_categories: bool = False,
  consent_marketing: bool = False,
  **user_kwargs,
) -> User:
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

  now = datetime.now(timezone.utc)
  verification_token = secrets.token_urlsafe(32)
  user = User(
    email=normalized_email,
    password_hash=hash_password(password),
    email_verified=False,
    email_verification_token=verification_token,
    email_verification_token_expires_at=now + timedelta(hours=24),
    terms_accepted_at=now if consent_terms else None,
    consent_special_categories_at=now if consent_special_categories else None,
    consent_marketing=consent_marketing,
    **user_kwargs,
  )
  db.add(user)
  db.commit()
  db.refresh(user)
  return user


def verify_email_token(db: Session, *, token: str) -> User:
  """Verify email verification token and activate the user's email."""
  user = db.query(User).filter_by(email_verification_token=token).first()
  if not user:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ongeldige of verlopen verificatielink")

  expires_at = user.email_verification_token_expires_at
  if expires_at is None:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ongeldige of verlopen verificatielink")

  if expires_at.tzinfo is None:
    expires_at = expires_at.replace(tzinfo=timezone.utc)

  if datetime.now(timezone.utc) > expires_at:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verificatielink is verlopen. Vraag een nieuwe aan.")

  user.email_verified = True
  user.email_verification_token = None
  user.email_verification_token_expires_at = None
  db.add(user)
  db.commit()
  db.refresh(user)
  return user


def generate_email_verification_token(db: Session, *, email: str) -> str | None:
  """Generate a new email verification token. Returns None if user not found or already verified."""
  normalized_email = email.lower()
  user = db.query(User).filter_by(email=normalized_email).first()
  if not user or not user.is_active or user.email_verified:
    return None

  token = secrets.token_urlsafe(32)
  user.email_verification_token = token
  user.email_verification_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
  db.add(user)
  db.commit()
  return token


def generate_password_reset_token(db: Session, *, email: str) -> str | None:
  """Generate a password reset token and store it on the user. Returns None if user not found."""
  normalized_email = email.lower()
  user = db.query(User).filter_by(email=normalized_email).first()
  if not user or not user.is_active:
    return None

  token = secrets.token_urlsafe(32)
  user.password_reset_token = token
  user.password_reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
  db.add(user)
  db.commit()
  return token


def reset_password(db: Session, *, token: str, new_password: str) -> User:
  """Validate reset token and update the user's password."""
  user = db.query(User).filter_by(password_reset_token=token).first()
  if not user:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ongeldige of verlopen resetlink")

  expires_at = user.password_reset_token_expires_at
  if expires_at is None:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ongeldige of verlopen resetlink")

  # Make timezone-aware for comparison
  if expires_at.tzinfo is None:
    expires_at = expires_at.replace(tzinfo=timezone.utc)

  if datetime.now(timezone.utc) > expires_at:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resetlink is verlopen. Vraag een nieuwe aan.")

  user.password_hash = hash_password(new_password)
  user.password_reset_token = None
  user.password_reset_token_expires_at = None
  db.add(user)
  db.commit()
  db.refresh(user)
  return user


def create_magic_link_token(db: Session, *, user: User) -> str:
  """Genereer een magic link token voor passwordless login. Geldig 24 uur."""
  token = secrets.token_urlsafe(32)
  user.magic_link_token = token
  user.magic_link_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
  db.add(user)
  db.commit()
  return token


def verify_magic_link_token(db: Session, *, token: str) -> User:
  """Valideer een magic link token en retourneer de gebruiker. Invalideert het token na gebruik."""
  user = db.query(User).filter(User.magic_link_token == token).first()
  if not user:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ongeldige toegangslink")

  expires_at = user.magic_link_token_expires_at
  if expires_at is None:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ongeldige toegangslink")

  if expires_at.tzinfo is None:
    expires_at = expires_at.replace(tzinfo=timezone.utc)

  if datetime.now(timezone.utc) > expires_at:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Toegangslink is verlopen. Vraag een nieuwe aan.")

  # Token eenmalig geldig — wis na gebruik en log gebruik
  user.magic_link_token = None
  user.magic_link_token_expires_at = None
  user.magic_link_last_used_at = datetime.now(timezone.utc)
  user.email_verified = True  # Magic link = impliciete emailverificatie
  user.last_login_at = datetime.now(timezone.utc)
  db.add(user)
  db.commit()
  db.refresh(user)
  return user


def get_or_create_storyteller(db: Session, *, email: str, display_name: str) -> User:
  """
  Haal bestaande gebruiker op of maak een nieuw pending account aan.
  Gebruikt wanneer een kind oma uitnodigt — oma heeft nog geen account.
  """
  normalized_email = email.lower()
  user = db.query(User).filter_by(email=normalized_email).first()
  if user:
    return user

  user = User(
    email=normalized_email,
    display_name=display_name,
    country="NL",
    locale="nl",
    is_active=True,
    email_verified=False,
    package_tier="NONE",
    max_family_members=0,
    max_chapters=None,
    storage_years=0,
  )
  journey = Journey(
    id=str(uuid4()),
    title=f"Verhaal van {display_name}",
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

  if not user.email_verified:
    raise EMAIL_NOT_VERIFIED

  if password_hasher.check_needs_rehash(user.password_hash):
    user.password_hash = hash_password(password)

  user.last_login_at = datetime.now(timezone.utc)
  db.add(user)
  db.commit()
  db.refresh(user)
  return user
