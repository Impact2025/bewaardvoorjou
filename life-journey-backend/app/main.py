from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.rate_limiter import limiter
from app.core.security_headers import SecurityHeadersMiddleware


def create_app() -> FastAPI:
  app = FastAPI(title=settings.app_name, version="0.1.0")

  # Add rate limiter to app state
  app.state.limiter = limiter
  app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

  # IMPORTANT: Middleware order matters! Last added = first executed for requests
  # We want CORS to handle preflight OPTIONS first, so add it LAST

  # Add security headers middleware FIRST (executes after CORS)
  app.add_middleware(SecurityHeadersMiddleware)

  # CORS - Add LAST so it executes FIRST (handles preflight OPTIONS)
  app.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "https://bewaardvoorjou.vercel.app",
      "https://bewaardvoorjou.nl",
      "https://www.bewaardvoorjou.nl",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:4005",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
  )

  @app.get("/healthz", tags=["system"], summary="Lightweight health probe")
  async def healthz() -> dict[str, str]:
    return {"status": "ok", "version": "2025-12-17-v1", "cors_fixed": "middleware_order"}

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
