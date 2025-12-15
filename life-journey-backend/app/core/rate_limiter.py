"""
Centralized rate limiting configuration for the API.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def get_user_or_ip(request: Request) -> str:
    """
    Get rate limit key based on user ID (if authenticated) or IP address.
    This allows authenticated users to have separate limits from anonymous users.
    """
    # Try to get user from request state (set by auth middleware)
    user = getattr(request.state, "user", None)
    if user and hasattr(user, "id"):
        return f"user:{user.id}"

    # Fall back to IP address
    return get_remote_address(request)


# Main limiter instance
limiter = Limiter(key_func=get_user_or_ip)


# Rate limit presets for different endpoint types
class RateLimits:
    """Standard rate limits for different endpoint categories."""

    # Authentication (stricter limits)
    AUTH_REGISTER = "5/hour"
    AUTH_LOGIN = "10/minute"

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
