from fastapi import APIRouter

from app.api.v1.routes import (
    onboarding,
    journeys,
    media,
    sharing,
    legacy,
    assistant,
    auth,
    chapters,
    memos,
    timeline,
    family,
    admin,
    admin_enhanced,
    emails,
    quick_thoughts,
)


api_router = APIRouter()
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(journeys.router, prefix="/journeys", tags=["journeys"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(sharing.router, prefix="/sharing", tags=["sharing"])
api_router.include_router(legacy.router, prefix="/legacy", tags=["legacy"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chapters.router, prefix="/chapters", tags=["chapters"])
api_router.include_router(memos.router, prefix="/memos", tags=["memos"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["timeline"])
api_router.include_router(family.router, prefix="/family", tags=["family"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_enhanced.router, prefix="/admin", tags=["admin-enhanced"])
api_router.include_router(emails.router, prefix="/emails", tags=["emails"])
api_router.include_router(quick_thoughts.router, prefix="/quick-thoughts", tags=["quick-thoughts"])
