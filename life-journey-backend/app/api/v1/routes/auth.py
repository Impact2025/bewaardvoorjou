from datetime import timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.schemas.auth import AuthResponse, ForgotPasswordRequest, LoginRequest, MessageResponse, RegisterRequest, ResetPasswordRequest, UserPublic
from app.services.auth import authenticate_user, create_access_token, generate_password_reset_token, register_user, reset_password
from app.services.email.client import send_email
from app.services.email.events import trigger_welcome_email
from app.services.email.renderer import build_password_reset_email
from loguru import logger


router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=201, tags=["auth"])
@limiter.limit(RateLimits.AUTH_REGISTER)
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
  user = register_user(
    db,
    email=payload.email,
    password=payload.password,
    display_name=payload.display_name,
    country=payload.country,
    locale=payload.locale,
    birth_year=payload.birth_year,
    privacy_level=payload.privacy_level,
  )

  # Trigger welcome email
  try:
    trigger_welcome_email(db, user.id)
  except Exception as e:
    logger.warning(f"Failed to trigger welcome email for user {user.id}: {e}")
    # Don't fail registration if email fails

  token = create_access_token(subject=user.id)
  primary_journey = next(iter(user.journeys), None)
  return AuthResponse(
    access_token=token,
    user=UserPublic.model_validate(user),
    primary_journey_id=primary_journey.id if primary_journey else None,
  )


@router.post("/forgot-password", response_model=MessageResponse, tags=["auth"])
@limiter.limit(RateLimits.AUTH_LOGIN)
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
  token = generate_password_reset_token(db, email=payload.email)

  if token:
    from app.models.user import User as UserModel
    user = db.query(UserModel).filter_by(email=payload.email.lower()).first()
    if user:
      reset_url = f"{settings.app_base_url}/wachtwoord-resetten?token={token}"
      subject, html, text = build_password_reset_email(user.display_name, reset_url)
      try:
        send_email(to=user.email, subject=subject, html=html, text=text)
      except Exception as e:
        logger.warning(f"Failed to send password reset email to {user.email}: {e}")

  # Always return the same message to prevent user enumeration
  return MessageResponse(message="Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een resetlink.")


@router.post("/reset-password", response_model=MessageResponse, tags=["auth"])
@limiter.limit(RateLimits.AUTH_LOGIN)
def reset_password_endpoint(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
  reset_password(db, token=payload.token, new_password=payload.new_password)
  return MessageResponse(message="Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen.")


@router.post("/login", response_model=AuthResponse, tags=["auth"])
@limiter.limit(RateLimits.AUTH_LOGIN)
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
  user = authenticate_user(db, email=payload.email, password=payload.password)
  token = create_access_token(
    subject=user.id,
    expires_delta=timedelta(minutes=settings.jwt_access_token_expires_minutes),
  )
  primary_journey = next(iter(user.journeys), None)
  return AuthResponse(
    access_token=token,
    user=UserPublic.model_validate(user),
    primary_journey_id=primary_journey.id if primary_journey else None,
  )
