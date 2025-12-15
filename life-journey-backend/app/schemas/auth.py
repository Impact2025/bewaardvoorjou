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


class LoginRequest(BaseModel):
  email: EmailStr
  password: str


class AuthResponse(BaseModel):
  access_token: str
  token_type: str = Field(default="bearer")
  user: UserPublic
  primary_journey_id: str | None = None
