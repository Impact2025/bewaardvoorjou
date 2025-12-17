import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.rate_limiter import limiter
from app.core.security_headers import SecurityHeadersMiddleware

logger = logging.getLogger(__name__)

# CORS origins - centralized for reuse in exception handler
CORS_ORIGINS = [
  "https://bewaardvoorjou.vercel.app",
  "https://bewaardvoorjou.nl",
  "https://www.bewaardvoorjou.nl",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4005",
]


def create_app() -> FastAPI:
  app = FastAPI(title=settings.app_name, version="0.1.0")

  # Add rate limiter to app state
  app.state.limiter = limiter
  app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

  # Global exception handler to ensure CORS headers on errors
  @app.exception_handler(Exception)
  async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions and ensure CORS headers are present."""
    logger.error(f"Unhandled exception: {exc}\n{traceback.format_exc()}")

    # Get origin from request
    origin = request.headers.get("origin", "")

    # Build response
    response = JSONResponse(
      status_code=500,
      content={
        "detail": str(exc),
        "type": type(exc).__name__,
      },
    )

    # Add CORS headers if origin is allowed
    if origin in CORS_ORIGINS:
      response.headers["Access-Control-Allow-Origin"] = origin
      response.headers["Access-Control-Allow-Credentials"] = "true"
      response.headers["Access-Control-Allow-Methods"] = "*"
      response.headers["Access-Control-Allow-Headers"] = "*"

    return response

  # IMPORTANT: Middleware order matters! Last added = first executed for requests
  # We want CORS to handle preflight OPTIONS first, so add it LAST

  # Add security headers middleware FIRST (executes after CORS)
  app.add_middleware(SecurityHeadersMiddleware)

  # CORS - Add LAST so it executes FIRST (handles preflight OPTIONS)
  app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
  )

  @app.get("/healthz", tags=["system"], summary="Lightweight health probe")
  async def healthz() -> dict[str, str]:
    return {"status": "ok", "version": "2025-12-17-v2", "cors_fixed": "exception_handler"}

  @app.get("/cors-test", tags=["system"], summary="CORS configuration test")
  async def cors_test() -> dict[str, str]:
    return {
      "status": "ok",
      "message": "CORS is working",
      "timestamp": "2025-12-17T00:00:00Z"
    }

  app.include_router(api_router, prefix=settings.api_v1_prefix)

  return app


app = create_app()
