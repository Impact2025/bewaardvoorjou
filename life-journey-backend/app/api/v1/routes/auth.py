from datetime import timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.schemas.auth import (
    AuthResponse, ForgotPasswordRequest, LoginRequest, MessageResponse,
    RegisterRequest, RegisterResponse, ResendVerificationRequest,
    ResetPasswordRequest, UserPublic, VerifyEmailRequest,
)
from app.services.auth import (
    authenticate_user, create_access_token, generate_email_verification_token,
    generate_password_reset_token, register_user, reset_password, verify_email_token,
)
from app.services.email.events import (
    trigger_email_verification, trigger_password_reset_email, trigger_welcome_email,
)
from loguru import logger


router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=201, tags=["auth"])
@limiter.limit(RateLimits.AUTH_REGISTER)
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)) -> RegisterResponse:
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

  try:
    verification_url = f"{settings.app_base_url}/email-bevestigen?token={user.email_verification_token}"
    trigger_email_verification(db, user.id, verification_url)
  except Exception as e:
    logger.warning(f"Failed to queue verification email for user {user.id}: {e}")

  return RegisterResponse(
    message="Account aangemaakt. Controleer je inbox om je e-mailadres te bevestigen.",
    email=user.email,
  )


@router.post("/verify-email", response_model=AuthResponse, tags=["auth"])
@limiter.limit(RateLimits.AUTH_LOGIN)
def verify_email(request: Request, payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> AuthResponse:
  user = verify_email_token(db, token=payload.token)

  try:
    trigger_welcome_email(db, user.id)
  except Exception as e:
    logger.warning(f"Failed to queue welcome email for user {user.id}: {e}")

  token = create_access_token(subject=user.id)
  primary_journey = next(iter(user.journeys), None)
  return AuthResponse(
    access_token=token,
    user=UserPublic.model_validate(user),
    primary_journey_id=primary_journey.id if primary_journey else None,
  )


@router.post("/resend-verification", response_model=MessageResponse, tags=["auth"])
@limiter.limit(RateLimits.AUTH_LOGIN)
def resend_verification(request: Request, payload: ResendVerificationRequest, db: Session = Depends(get_db)) -> MessageResponse:
  from app.models.user import User as UserModel
  new_token = generate_email_verification_token(db, email=payload.email)
  if new_token:
    user = db.query(UserModel).filter_by(email=payload.email.lower()).first()
    if user:
      try:
        verification_url = f"{settings.app_base_url}/email-bevestigen?token={new_token}"
        trigger_email_verification(db, user.id, verification_url)
      except Exception as e:
        logger.warning(f"Failed to queue resend verification for {user.email}: {e}")

  return MessageResponse(
    message="Als dit e-mailadres bij ons bekend is en nog niet bevestigd, ontvang je binnen enkele minuten een nieuwe verificatielink."
  )


@router.post("/forgot-password", response_model=MessageResponse, tags=["auth"])
@limiter.limit(RateLimits.AUTH_LOGIN)
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
  from app.models.user import User as UserModel
  token = generate_password_reset_token(db, email=payload.email)
  if token:
    user = db.query(UserModel).filter_by(email=payload.email.lower()).first()
    if user:
      try:
        reset_url = f"{settings.app_base_url}/wachtwoord-resetten?token={token}"
        trigger_password_reset_email(db, user.id, reset_url)
      except Exception as e:
        logger.warning(f"Failed to queue password reset email for {user.email}: {e}")

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
