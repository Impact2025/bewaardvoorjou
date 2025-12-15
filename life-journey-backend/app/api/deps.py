from __future__ import annotations

from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.journey import Journey


http_bearer = HTTPBearer(auto_error=False)


def _decode_token(token: str) -> dict[str, Any]:
  try:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
  except jwt.ExpiredSignatureError as exc:  # pragma: no cover - handled in auth flow
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is verlopen") from exc
  except jwt.InvalidTokenError as exc:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ongeldig token") from exc


def get_current_user(
  credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
  db: Session = Depends(get_db),
) -> User:
  if credentials is None or not credentials.credentials:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authenticatie vereist")

  payload = _decode_token(credentials.credentials)
  subject = payload.get("sub")
  if subject is None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token mist onderwerp")

  user = db.query(User).filter(User.id == subject).first()
  if user is None:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Gebruiker niet gevonden")

  if not user.is_active:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is gedeactiveerd")

  return user


def get_current_admin_user(
  current_user: User = Depends(get_current_user),
) -> User:
  """
  Dependency to verify the current user has admin privileges.

  Usage:
    @router.get("/admin/users")
    def list_users(
      admin: User = Depends(get_current_admin_user)
    ):
      # Only admins can access this endpoint
      ...

  Returns:
    User object (with is_admin=True)

  Raises:
    403: User doesn't have admin privileges
  """
  if not current_user.is_admin:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Admin toegang vereist"
    )

  return current_user


class JourneyAccessDependency:
  """
  Reusable dependency for journey access verification.

  Usage:
    @router.get("/{journey_id}")
    def get_journey(
      journey: Journey = Depends(get_authorized_journey),
      current_user: User = Depends(get_current_user)
    ):
      # journey is already verified to exist and belong to current_user
      ...
  """

  def __init__(self, journey_id: str):
    self.journey_id = journey_id

  def __call__(
    self,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
  ) -> Journey:
    """Verify journey exists and user has access."""
    journey = db.query(Journey).filter(Journey.id == self.journey_id).first()

    if not journey:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Journey niet gevonden"
      )

    if journey.user_id != current_user.id:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Geen toegang tot deze journey"
      )

    return journey


def get_authorized_journey(
  journey_id: str,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
) -> Journey:
  """
  Dependency to get and authorize a journey in one step.

  Verifies:
  - Journey exists
  - Current user owns the journey

  Returns:
    Journey object

  Raises:
    404: Journey not found
    403: User doesn't have access
  """
  journey = db.query(Journey).filter(Journey.id == journey_id).first()

  if not journey:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Journey niet gevonden"
    )

  if journey.user_id != current_user.id:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Geen toegang tot deze journey"
    )

  return journey
