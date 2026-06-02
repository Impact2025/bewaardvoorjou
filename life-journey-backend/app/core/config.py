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
  api_base_url: str = "http://localhost:8001"

  # CORS configuration - override via CORS_ORIGINS env var (comma-separated)
  cors_origins: list[str] = [
    "https://bewaardvoorjou.vercel.app",
    "https://bewaardvoorjou.nl",
    "https://www.bewaardvoorjou.nl",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:3006",
    "http://localhost:3007",
    "http://localhost:3011",
    "http://localhost:2345",
  ]

  # Database configuration
  database_url: str = "postgresql://username:password@host.neon.tech:5432/database_name"
  redis_url: str = "redis://localhost:6379/0"

  # S3/Storage configuration
  s3_endpoint_url: str | None = None
  s3_bucket: str | None = None
  s3_region: str = "eu-central-1"
  aws_access_key_id: str | None = None
  aws_secret_access_key: str | None = None
  media_encryption_kms_key: str | None = None
  # Publieke basis-URL voor opgeslagen bestanden (bijv. Cloudflare R2 public dev URL of custom domain)
  s3_public_url: str | None = None

  # AI/Whisper configuration
  whisper_endpoint: str | None = None
  whisper_model: str = "openai/whisper-large-v3"
  whisper_backend: str = "openrouter"
  openai_api_base: str = "https://openrouter.ai/api/v1"
  openai_api_key: str | None = None
  openai_model: str = "anthropic/claude-sonnet-4-6"
  openrouter_app_name: str = "Life Journey"
  openrouter_app_url: str = ""

  # Email (Resend)
  resend_api_key: str | None = None
  resend_from_email: str = "Bewaardvoorjou <noreply@bewaardvoorjou.nl>"
  resend_reply_to_email: str = "support@bewaardvoorjou.nl"
  resend_webhook_signing_secret: str | None = None
  resend_enabled: bool = True
  app_base_url: str = "http://localhost:3000"

  # Telemetry
  telemetry_disabled: bool = False

  # Sentry error tracking (optional — leave empty to disable)
  sentry_dsn: str | None = None

  # Stripe Payments
  stripe_secret_key: str | None = None
  stripe_publishable_key: str | None = None
  stripe_webhook_secret: str | None = None

  # Early Bird campagne
  # Zet EARLY_BIRD_ACTIVE=false in .env om de actie uit te zetten zonder herdeployment
  early_bird_active: bool = True
  early_bird_deadline: str = "2026-06-10T23:59:59+00:00"   # ISO-8601 UTC
  early_bird_begin_discount_cents: int = 2000                # €20 op BEGIN
  early_bird_waitlist_discount_cents: int = 3000             # €30 garantie op wachtlijst

  # SEO Indexing
  site_url: str = "https://bewaardvoorjou.nl"
  indexnow_key: str | None = None
  google_service_account_json: str | None = None

  # JWT Security - CRITICAL: Must be set via environment variable
  # For development, if not set, a random key will be generated (sessions won't persist across restarts)
  # For production, this MUST be set to a secure, persistent value
  jwt_secret_key: str | None = None
  jwt_algorithm: str = "HS256"
  jwt_access_token_expires_minutes: int = 60  # 60 minutes

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
      print("⚠️  Sessions will not persist across server restarts.", file=sys.stderr)
      print("⚠️  Set JWT_SECRET_KEY in .env to persist sessions:", file=sys.stderr)
      print(f"    JWT_SECRET_KEY={generated_key}", file=sys.stderr)
      return generated_key

    return v


@lru_cache
def get_settings() -> Settings:
  return Settings()


settings = get_settings()