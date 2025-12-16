from functools import lru_cache
import secrets
import sys

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  """Application configuration loaded from environment variables."""

  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

  app_name: str = "Life Journey API"
  environment: str = "development"
  api_v1_prefix: str = "/api/v1"

  # Public API base URL (used for generating upload URLs)
  api_base_url: str = "http://localhost:8000"

  # CORS configuration - customize for your production domain
  cors_origins: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:3006",
    "http://localhost:3007",
    "http://localhost:3011",
    # Add your production domains here:
    # "https://life-journey.app",
    # "https://www.life-journey.app",
  ]

  # Database configuration
  database_url: str = "postgresql://username:password@host.neon.tech:5432/database_name"
  redis_url: str = "redis://localhost:6379/0"

  # S3/Storage configuration
  s3_endpoint_url: str | None = None
  s3_bucket: str = "life-journey-media"
  s3_region: str = "eu-central-1"
  media_encryption_kms_key: str | None = None

  # AI/Whisper configuration
  whisper_endpoint: str | None = None
  whisper_model: str = "openai/whisper-large-v3"
  whisper_backend: str = "openrouter"
  openai_api_base: str = "https://openrouter.ai/api/v1"
  openai_api_key: str | None = None
  openai_model: str = "anthropic/claude-3.5-sonnet"
  openrouter_app_name: str = "Life Journey"
  openrouter_app_url: str = ""

  # Telemetry
  telemetry_disabled: bool = False

  # JWT Security - CRITICAL: Must be set via environment variable
  # For development, if not set, a random key will be generated (sessions won't persist across restarts)
  # For production, this MUST be set to a secure, persistent value
  jwt_secret_key: str | None = None
  jwt_algorithm: str = "HS256"
  jwt_access_token_expires_minutes: int = 60 * 24  # 24 hours

  @field_validator('jwt_secret_key')
  @classmethod
  def validate_jwt_secret(cls, v: str | None, info) -> str:
    """Validate JWT secret key - require it in production, auto-generate in development."""
    environment = info.data.get('environment', 'development')

    # Production: JWT secret is REQUIRED
    if environment == 'production':
      if not v:
        print("❌ CRITICAL: JWT_SECRET_KEY environment variable is required in production!", file=sys.stderr)
        print("Generate a secure key with: python -c 'import secrets; print(secrets.token_hex(32))'", file=sys.stderr)
        sys.exit(1)

      if len(v) < 32:
        print("❌ CRITICAL: JWT_SECRET_KEY must be at least 32 characters long!", file=sys.stderr)
        sys.exit(1)

    # Development: Auto-generate if not provided (with warning)
    if not v:
      generated_key = secrets.token_hex(32)
      print("⚠️  WARNING: No JWT_SECRET_KEY set. Generated temporary key for development.", file=sys.stderr)
      print(f"⚠️  Sessions will not persist across server restarts.", file=sys.stderr)
      print(f"⚠️  Set JWT_SECRET_KEY in .env to persist sessions:", file=sys.stderr)
      print(f"    JWT_SECRET_KEY={generated_key}", file=sys.stderr)
      return generated_key

    return v


@lru_cache
def get_settings() -> Settings:
  return Settings()


settings = get_settings()