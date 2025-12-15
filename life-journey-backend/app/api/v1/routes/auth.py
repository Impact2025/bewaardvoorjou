from datetime import timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from app.services.auth import authenticate_user, create_access_token, register_user


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

  token = create_access_token(subject=user.id)
  primary_journey = next(iter(user.journeys), None)
  return AuthResponse(
    access_token=token,
    user=UserPublic.model_validate(user),
    primary_journey_id=primary_journey.id if primary_journey else None,
  )


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
