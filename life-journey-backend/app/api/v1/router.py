from fastapi import APIRouter

from app.api.v1.routes import (
    account,
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
    admin_orders,
    emails,
    quick_thoughts,
    blog,
    webhooks,
    orders,
    gift_cards,
    waitlist,
    parent_interview,
    promo_codes,
    support,
    helpdesk,
    usb_export,
    backup,
)


api_router = APIRouter()
api_router.include_router(account.router, prefix="/account", tags=["account"])
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
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(gift_cards.router, prefix="/gift-cards", tags=["gift-cards"])
api_router.include_router(waitlist.router, prefix="/waitlist", tags=["waitlist"])
api_router.include_router(parent_interview.router, tags=["parent-interview"])
api_router.include_router(promo_codes.router, prefix="/promo-codes", tags=["promo-codes"])
api_router.include_router(promo_codes.admin_router, prefix="/admin/promo-codes", tags=["admin-promo-codes"])
api_router.include_router(support.router, prefix="/support", tags=["support"])
api_router.include_router(support.admin_router, prefix="/admin", tags=["admin-support"])
api_router.include_router(helpdesk.router, prefix="/helpdesk", tags=["helpdesk"])
api_router.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin-orders"])
api_router.include_router(usb_export.router, prefix="/admin/usb", tags=["admin-usb"])
api_router.include_router(backup.router, prefix="/account", tags=["account"])
