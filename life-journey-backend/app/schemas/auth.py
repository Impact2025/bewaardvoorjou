from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserPublic(BaseModel):
  id: str
  display_name: str
  email: EmailStr
  country: str
  locale: str = Field(default="nl")
  birth_year: int | None = None
  privacy_level: str
  is_admin: bool = Field(default=False)
  package_tier: str = Field(default="NONE")
  package_activated_at: datetime | None = None
  created_at: datetime
  updated_at: datetime | None = None

  model_config = {"from_attributes": True}


class RegisterRequest(BaseModel):
  display_name: str
  email: EmailStr
  password: str = Field(min_length=8)
  country: str
  locale: str = Field(default="nl")
  birth_year: int | None = None
  privacy_level: str = Field(default="private")
  consent_terms: bool = Field(default=False)
  consent_special_categories: bool = Field(default=False)
  consent_marketing: bool = Field(default=False)
  promo_code: str | None = Field(default=None, max_length=32)


class RegisterResponse(BaseModel):
  message: str
  email: str


class LoginRequest(BaseModel):
  email: EmailStr
  password: str


class AuthResponse(BaseModel):
  access_token: str
  token_type: str = Field(default="bearer")
  user: UserPublic
  primary_journey_id: str | None = None


class ForgotPasswordRequest(BaseModel):
  email: EmailStr


class ResetPasswordRequest(BaseModel):
  token: str
  new_password: str = Field(min_length=8)


class VerifyEmailRequest(BaseModel):
  token: str


class ResendVerificationRequest(BaseModel):
  email: EmailStr


class MessageResponse(BaseModel):
  message: str


class MagicLinkRequest(BaseModel):
  email: EmailStr


class MagicLinkVerifyRequest(BaseModel):
  token: str
