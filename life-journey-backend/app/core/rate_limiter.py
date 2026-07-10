"""
Centralized rate limiting configuration for the API.
"""

import jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.core.config import settings


def get_user_or_ip(request: Request) -> str:
    """
    Get rate limit key based on user ID (if authenticated) or IP address.
    This allows authenticated users to have separate limits from anonymous users.

    Auth loopt via FastAPI-dependencies en zet niets op request.state, en de
    limiter draait vóór de dependencies — dus we lezen het Bearer-token hier
    zelf. Alleen signature/expiry-verificatie, bewust géén DB-lookup: de key
    hoeft niet te bewijzen dat de user bestaat, alleen stabiel en onvervalsbaar
    per user te zijn.
    """
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            payload = jwt.decode(
                auth_header[7:],
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
        except jwt.InvalidTokenError:
            payload = {}
        subject = payload.get("sub")
        if subject:
            return f"user:{subject}"

    # Fall back to IP address
    return get_remote_address(request)


# Main limiter instance
limiter = Limiter(key_func=get_user_or_ip)


# Rate limit presets for different endpoint types
class RateLimits:
    """Standard rate limits for different endpoint categories."""

    # Authentication (stricter limits)
    AUTH_REGISTER = "5/hour"
    AUTH_LOGIN = "3/minute"
    AUTH_MAGIC_VERIFY = "10/hour"

    # Read operations (generous limits)
    READ_STANDARD = "100/minute"
    READ_HEAVY = "30/minute"  # For operations that load a lot of data

    # Write operations (moderate limits)
    WRITE_STANDARD = "30/minute"
    WRITE_HEAVY = "10/minute"  # For expensive operations

    # AI operations (cost-controlled)
    AI_PROMPT = "30/minute"
    AI_CHAT = "20/minute"
    AI_SUGGESTION = "15/minute"

    # Media operations
    MEDIA_UPLOAD = "10/minute"
    MEDIA_READ = "60/minute"

    # Export/sharing (rate limited to prevent abuse)
    EXPORT = "5/minute"
    SHARE_CREATE = "10/minute"
