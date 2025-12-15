from __future__ import annotations

from dataclasses import dataclass, field
from typing import List
from uuid import uuid4

import jwt
import pytest

from fastapi import HTTPException
from app.core.config import settings
from app.models.user import User
from app.services import auth as auth_service


@dataclass
class FakeQuery:
  data: List[User]

  def filter_by(self, **kwargs):
    filtered = [item for item in self.data if all(getattr(item, key) == value for key, value in kwargs.items())]
    return FakeQuery(filtered)

  def first(self) -> User | None:
    return self.data[0] if self.data else None


@dataclass
class FakeSession:
  users: List[User] = field(default_factory=list)

  def query(self, model):
    if model is not User:
      raise ValueError("FakeSession only supports User model queries")
    return FakeQuery(self.users)

  def add(self, obj):
    if isinstance(obj, User) and obj not in self.users:
      if not obj.id:
        obj.id = str(uuid4())
      self.users.append(obj)

  def commit(self):
    return None

  def refresh(self, obj):
    return None


def test_register_user_creates_user_with_hashed_password():
  session = FakeSession()

  user = auth_service.register_user(
    session,
    email="newuser@example.com",
    password="safepassword",
    display_name="Nieuw",
    country="NL",
    locale="nl",
    privacy_level="private",
  )

  assert user.email == "newuser@example.com"
  assert user.password_hash != "safepassword"
  assert auth_service.verify_password("safepassword", user.password_hash)
  assert user in session.users


def test_register_user_duplicate_email_raises_conflict():
  session = FakeSession()
  auth_service.register_user(
    session,
    email="dup@example.com",
    password="password123",
    display_name="Dup",
    country="NL",
    locale="nl",
    privacy_level="private",
  )

  with pytest.raises(HTTPException) as exc:
    auth_service.register_user(
      session,
      email="dup@example.com",
      password="nieuwpass",
      display_name="Dup",
      country="NL",
      locale="nl",
      privacy_level="private",
    )

  assert exc.value.status_code == 409


def test_authenticate_user_returns_user_and_updates_last_login():
  session = FakeSession()
  user = auth_service.register_user(
    session,
    email="login@example.com",
    password="password123",
    display_name="Inlog",
    country="NL",
    locale="nl",
    privacy_level="private",
  )
  assert user.last_login_at is None

  authenticated = auth_service.authenticate_user(session, email="login@example.com", password="password123")

  assert authenticated.id == user.id
  assert authenticated.last_login_at is not None


def test_authenticate_user_wrong_password_raises_unauthorized():
  session = FakeSession()
  auth_service.register_user(
    session,
    email="wrongpass@example.com",
    password="password123",
    display_name="Wrong",
    country="NL",
    locale="nl",
    privacy_level="private",
  )

  with pytest.raises(HTTPException) as exc:
    auth_service.authenticate_user(session, email="wrongpass@example.com", password="badpass")

  assert exc.value.status_code == 401


def test_create_access_token_contains_subject_claim():
  token = auth_service.create_access_token(subject="user-id")
  decoded = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
  assert decoded["sub"] == "user-id"
