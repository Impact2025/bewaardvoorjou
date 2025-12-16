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

  # CORS - allow Vercel frontend
  app.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "https://bewaardvoorjou.vercel.app",  # Production
      "http://localhost:3000",  # Local development
      "http://localhost:3001",
    ],
    allow_credentials=True,  # Allow cookies/auth headers
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
  )

  # Add security headers middleware AFTER CORS
  app.add_middleware(SecurityHeadersMiddleware)

  @app.get("/healthz", tags=["system"], summary="Lightweight health probe")
  async def healthz() -> dict[str, str]:
    return {"status": "ok"}

  app.include_router(api_router, prefix=settings.api_v1_prefix)

  return app


app = create_app()
