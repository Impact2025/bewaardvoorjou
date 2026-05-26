import logging
import traceback

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppError
from app.core.rate_limiter import limiter
from app.core.security_headers import SecurityHeadersMiddleware

logger = logging.getLogger(__name__)

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.1,
        environment=settings.environment,
        send_default_pii=False,
    )

# CORS origins - loaded from settings (configurable via CORS_ORIGINS env var)
CORS_ORIGINS = settings.cors_origins


def create_app() -> FastAPI:
  app = FastAPI(title=settings.app_name, version="0.1.0")

  # Add rate limiter to app state
  app.state.limiter = limiter
  app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

  @app.exception_handler(AppError)
  async def app_error_handler(request: Request, exc: AppError):
    origin = request.headers.get("origin", "")
    response = JSONResponse(
      status_code=exc.status_code,
      content={"detail": exc.detail, "code": exc.code},
    )
    if origin in CORS_ORIGINS:
      response.headers["Access-Control-Allow-Origin"] = origin
      response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

  # Global exception handler to ensure CORS headers on errors
  @app.exception_handler(Exception)
  async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions and ensure CORS headers are present."""
    logger.error(f"Unhandled exception: {exc}\n{traceback.format_exc()}")

    origin = request.headers.get("origin", "")

    content: dict = {"detail": "Internal server error"}
    if settings.environment == "development":
      content["type"] = type(exc).__name__
      content["traceback"] = traceback.format_exc()

    response = JSONResponse(status_code=500, content=content)

    if origin in CORS_ORIGINS:
      response.headers["Access-Control-Allow-Origin"] = origin
      response.headers["Access-Control-Allow-Credentials"] = "true"

    return response

  # IMPORTANT: Middleware order matters! Last added = first executed for requests
  # We want CORS to handle preflight OPTIONS first, so add it LAST

  # Add security headers middleware FIRST (executes after CORS)
  app.add_middleware(SecurityHeadersMiddleware)

  # CORS - Add LAST so it executes FIRST (handles preflight OPTIONS)
  app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    expose_headers=["X-Request-ID"],
  )

  @app.get("/healthz", tags=["system"], summary="Lightweight health probe")
  async def healthz() -> dict[str, str]:
    from app.db.session import SessionLocal
    from sqlalchemy import text
    db_ok = False
    try:
      db = SessionLocal()
      db.execute(text("SELECT 1"))
      db.close()
      db_ok = True
    except Exception:
      pass
    return {
      "status": "ok" if db_ok else "degraded",
      "db": "ok" if db_ok else "unreachable",
      "environment": settings.environment,
    }

  app.include_router(api_router, prefix=settings.api_v1_prefix)

  return app


app = create_app()
