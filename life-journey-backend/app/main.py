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
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:4005",
  "http://localhost:6001",
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

    # Build response with full traceback for debugging
    response = JSONResponse(
      status_code=500,
      content={
        "detail": str(exc),
        "type": type(exc).__name__,
        "traceback": traceback.format_exc(),
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
    return {"status": "ok", "version": "2025-12-17-v6", "cors_fixed": "exception_handler"}

  @app.get("/debug/journey/{journey_id}", tags=["debug"])
  def debug_journey(journey_id: str):
    """Debug endpoint to test journey query without auth - TEMPORARY"""
    from sqlalchemy.orm import joinedload, selectinload
    from app.db.session import SessionLocal
    from app.models.journey import Journey as JourneyModel
    from app.models.media import MediaAsset as MediaAssetModel
    
    try:
      db = SessionLocal()
      
      # Step 1: Basic query
      journey = db.query(JourneyModel).filter(JourneyModel.id == journey_id).first()
      if not journey:
        db.close()
        return {"error": "Journey not found", "journey_id": journey_id}
      
      result = {"step1": "basic query OK", "title": journey.title}
      
      # Step 2: Query with eager loading
      journey = (
        db.query(JourneyModel)
        .filter(JourneyModel.id == journey_id)
        .options(
          joinedload(JourneyModel.user),
          selectinload(JourneyModel.media_assets).selectinload(MediaAssetModel.transcripts),
          selectinload(JourneyModel.prompt_runs),
          selectinload(JourneyModel.highlights),
          selectinload(JourneyModel.share_grants),
          selectinload(JourneyModel.chapter_preferences),
          selectinload(JourneyModel.consent_logs),
          joinedload(JourneyModel.legacy_policy),
        )
        .first()
      )
      
      result["step2"] = "eager loading OK"
      result["user"] = journey.user.display_name if journey.user else "NO USER"
      result["media_count"] = len(journey.media_assets)
      result["prefs_count"] = len(journey.chapter_preferences)
      
      # Step 3: Test services
      from app.services.journey_progress import get_all_chapter_statuses, get_journey_progress
      chapter_statuses = get_all_chapter_statuses(db, journey_id)
      progress = get_journey_progress(db, journey_id)
      
      result["step3"] = "services OK"
      result["chapters"] = len(chapter_statuses)
      result["progress"] = progress
      
      db.close()
      return {"status": "ALL OK", "result": result}
      
    except Exception as e:
      return {
        "error": str(e),
        "type": type(e).__name__,
        "traceback": traceback.format_exc()
      }

  app.include_router(api_router, prefix=settings.api_v1_prefix)

  return app


app = create_app()
