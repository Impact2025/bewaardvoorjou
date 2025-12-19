"""Enhanced Admin API routes - World-class monitoring dashboard."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, text
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from app.api.deps import get_current_admin_user, get_db
from app.models.user import User
from app.models.journey import Journey
from app.models.media import MediaAsset, TranscriptSegment, PromptRun
from app.models.sharing import Highlight, ShareGrant
from app.models.memo import Memo


router = APIRouter()


@router.get("/stats/enhanced")
async def get_enhanced_stats(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Get comprehensive admin dashboard statistics with real data."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users_30d = db.query(func.count(User.id)).filter(User.last_login_at >= month_ago).scalar() or 0
    active_users_7d = db.query(func.count(User.id)).filter(User.last_login_at >= week_ago).scalar() or 0
    new_users_today = db.query(func.count(User.id)).filter(User.created_at >= today_start).scalar() or 0
    new_users_yesterday = db.query(func.count(User.id)).filter(and_(User.created_at >= yesterday_start, User.created_at < today_start)).scalar() or 0
    new_users_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar() or 0

    total_journeys = db.query(func.count(Journey.id)).scalar() or 0
    total_recordings = db.query(func.count(MediaAsset.id)).scalar() or 0
    total_duration = db.query(func.sum(MediaAsset.duration_seconds)).scalar() or 0
    total_storage = db.query(func.sum(MediaAsset.size_bytes)).scalar() or 0
    recordings_today = db.query(func.count(MediaAsset.id)).filter(MediaAsset.recorded_at >= today_start).scalar() or 0
    recordings_week = db.query(func.count(MediaAsset.id)).filter(MediaAsset.recorded_at >= week_ago).scalar() or 0

    total_transcripts = db.query(func.count(func.distinct(TranscriptSegment.media_asset_id))).scalar() or 0
    total_highlights = db.query(func.count(Highlight.id)).scalar() or 0
    total_prompts = db.query(func.count(PromptRun.id)).scalar() or 0
    prompts_today = db.query(func.count(PromptRun.id)).filter(PromptRun.created_at >= today_start).scalar() or 0
    total_shares = db.query(func.count(ShareGrant.id)).scalar() or 0
    total_memos = db.query(func.count(Memo.id)).scalar() or 0

    user_trend = ((new_users_today - new_users_yesterday) / max(new_users_yesterday, 1)) * 100

    return {
        "users": {"total": total_users, "active_30d": active_users_30d, "active_7d": active_users_7d, "new_today": new_users_today, "new_week": new_users_week, "trend_percent": round(user_trend, 1)},
        "journeys": {"total": total_journeys},
        "recordings": {"total": total_recordings, "today": recordings_today, "week": recordings_week, "total_duration_hours": round(total_duration / 3600, 1), "total_storage_gb": round(total_storage / (1024 ** 3), 2)},
        "transcripts": {"total": total_transcripts},
        "highlights": {"total": total_highlights},
        "ai_usage": {"total_prompts": total_prompts, "prompts_today": prompts_today},
        "sharing": {"total_shares": total_shares},
        "memos": {"total": total_memos},
    }


@router.get("/users/{user_id}/detail")
async def get_user_detail(user_id: str, admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Get detailed user information including all activity metrics."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gebruiker niet gevonden")

    journey = db.query(Journey).filter(Journey.user_id == user_id).first()
    metrics = {"recordings": {"total": 0, "duration_seconds": 0, "storage_bytes": 0}, "transcripts": {"total": 0}, "highlights": {"total": 0}, "prompts": {"total": 0}, "memos": {"total": 0}, "shares": {"total": 0}, "chapters_started": 0, "chapters_completed": 0}
    recent_activity = []
    chapter_progress = {}

    if journey:
        recording_stats = db.query(func.count(MediaAsset.id), func.sum(MediaAsset.duration_seconds), func.sum(MediaAsset.size_bytes)).filter(MediaAsset.journey_id == journey.id).first()
        metrics["recordings"] = {"total": recording_stats[0] or 0, "duration_seconds": recording_stats[1] or 0, "storage_bytes": recording_stats[2] or 0}
        transcript_count = db.query(func.count(func.distinct(TranscriptSegment.media_asset_id))).join(MediaAsset, TranscriptSegment.media_asset_id == MediaAsset.id).filter(MediaAsset.journey_id == journey.id).scalar() or 0
        metrics["transcripts"]["total"] = transcript_count
        metrics["highlights"]["total"] = db.query(func.count(Highlight.id)).filter(Highlight.journey_id == journey.id).scalar() or 0
        metrics["prompts"]["total"] = db.query(func.count(PromptRun.id)).filter(PromptRun.journey_id == journey.id).scalar() or 0
        metrics["shares"]["total"] = db.query(func.count(ShareGrant.id)).filter(ShareGrant.journey_id == journey.id).scalar() or 0

        if journey.progress:
            chapter_progress = journey.progress
            for chapter_id, progress in journey.progress.items():
                if isinstance(progress, dict):
                    if progress.get("recordings", 0) > 0:
                        metrics["chapters_started"] += 1
                    if progress.get("completed", False):
                        metrics["chapters_completed"] += 1

        for rec in db.query(MediaAsset).filter(MediaAsset.journey_id == journey.id).order_by(desc(MediaAsset.recorded_at)).limit(10).all():
            recent_activity.append({"type": "recording", "timestamp": rec.recorded_at.isoformat() if rec.recorded_at else None, "chapter_id": rec.chapter_id, "duration_seconds": rec.duration_seconds, "modality": rec.modality})
        for prompt in db.query(PromptRun).filter(PromptRun.journey_id == journey.id).order_by(desc(PromptRun.created_at)).limit(5).all():
            recent_activity.append({"type": "ai_prompt", "timestamp": prompt.created_at.isoformat() if prompt.created_at else None, "chapter_id": prompt.chapter_id})

    metrics["memos"]["total"] = db.query(func.count(Memo.id)).filter(Memo.user_id == user_id).scalar() or 0
    recent_activity.sort(key=lambda x: x.get("timestamp") or "", reverse=True)

    return {
        "user": {"id": user.id, "display_name": user.display_name, "email": user.email, "country": user.country, "locale": user.locale, "birth_year": user.birth_year, "is_active": user.is_active, "is_admin": user.is_admin, "created_at": user.created_at.isoformat() if user.created_at else None, "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None, "onboarding_completed_at": user.onboarding_completed_at.isoformat() if user.onboarding_completed_at else None, "preferred_recording_method": user.preferred_recording_method, "ai_assistance_level": user.ai_assistance_level},
        "journey_id": journey.id if journey else None,
        "metrics": metrics,
        "chapter_progress": chapter_progress,
        "recent_activity": recent_activity[:15],
    }


@router.get("/activity/feed")
async def get_activity_feed(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db), limit: int = Query(default=50, le=100), activity_type: Optional[str] = None):
    """Get real-time platform activity feed."""
    activities = []

    if not activity_type or activity_type == "registration":
        for user in db.query(User).order_by(desc(User.created_at)).limit(20).all():
            activities.append({"type": "user_registration", "timestamp": user.created_at.isoformat() if user.created_at else None, "user_id": user.id, "user_name": user.display_name, "user_email": user.email, "description": f"{user.display_name} heeft zich geregistreerd"})

    if not activity_type or activity_type == "login":
        for user in db.query(User).filter(User.last_login_at.isnot(None)).order_by(desc(User.last_login_at)).limit(20).all():
            activities.append({"type": "user_login", "timestamp": user.last_login_at.isoformat() if user.last_login_at else None, "user_id": user.id, "user_name": user.display_name, "user_email": user.email, "description": f"{user.display_name} is ingelogd"})

    if not activity_type or activity_type == "recording":
        for recording, journey, user in db.query(MediaAsset, Journey, User).join(Journey, MediaAsset.journey_id == Journey.id).join(User, Journey.user_id == User.id).order_by(desc(MediaAsset.recorded_at)).limit(30).all():
            activities.append({"type": "recording", "timestamp": recording.recorded_at.isoformat() if recording.recorded_at else None, "user_id": user.id, "user_name": user.display_name, "user_email": user.email, "chapter_id": recording.chapter_id, "duration_seconds": recording.duration_seconds, "modality": recording.modality, "description": f"{user.display_name} heeft een {recording.modality} opname gemaakt ({recording.duration_seconds}s)"})

    if not activity_type or activity_type == "ai_prompt":
        for prompt, journey, user in db.query(PromptRun, Journey, User).join(Journey, PromptRun.journey_id == Journey.id).join(User, Journey.user_id == User.id).order_by(desc(PromptRun.created_at)).limit(20).all():
            activities.append({"type": "ai_prompt", "timestamp": prompt.created_at.isoformat() if prompt.created_at else None, "user_id": user.id, "user_name": user.display_name, "user_email": user.email, "chapter_id": prompt.chapter_id, "description": f"{user.display_name} heeft AI hulp gevraagd"})

    activities.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
    return {"activities": activities[:limit], "total": len(activities)}


@router.get("/analytics/overview")
async def get_analytics_overview(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db), days: int = Query(default=30, le=90)):
    """Get analytics overview with time-series data for charts."""
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=days)

    user_growth = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        count = db.query(func.count(User.id)).filter(User.created_at < day + timedelta(days=1)).scalar() or 0
        user_growth.append({"date": day.strftime("%Y-%m-%d"), "total_users": count})

    daily_registrations = []
    for i in range(min(days, 14)):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        count = db.query(func.count(User.id)).filter(and_(User.created_at >= day_start, User.created_at < day_start + timedelta(days=1))).scalar() or 0
        daily_registrations.append({"date": day_start.strftime("%Y-%m-%d"), "registrations": count})
    daily_registrations.reverse()

    daily_recordings = []
    for i in range(min(days, 14)):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        count = db.query(func.count(MediaAsset.id)).filter(and_(MediaAsset.recorded_at >= day_start, MediaAsset.recorded_at < day_start + timedelta(days=1))).scalar() or 0
        duration = db.query(func.sum(MediaAsset.duration_seconds)).filter(and_(MediaAsset.recorded_at >= day_start, MediaAsset.recorded_at < day_start + timedelta(days=1))).scalar() or 0
        daily_recordings.append({"date": day_start.strftime("%Y-%m-%d"), "recordings": count, "duration_minutes": round(duration / 60, 1)})
    daily_recordings.reverse()

    chapter_distribution = {row.chapter_id: row.count for row in db.query(MediaAsset.chapter_id, func.count(MediaAsset.id).label("count")).group_by(MediaAsset.chapter_id).all()}
    modality_distribution = {row.modality: row.count for row in db.query(MediaAsset.modality, func.count(MediaAsset.id).label("count")).group_by(MediaAsset.modality).all()}
    countries = {row.country: row.count for row in db.query(User.country, func.count(User.id).label("count")).group_by(User.country).all()}

    hour_distribution = defaultdict(int)
    for (recorded_at,) in db.query(MediaAsset.recorded_at).filter(MediaAsset.recorded_at >= start_date).all():
        if recorded_at:
            hour_distribution[recorded_at.hour] += 1

    return {"user_growth": user_growth, "daily_registrations": daily_registrations, "daily_recordings": daily_recordings, "chapter_distribution": chapter_distribution, "modality_distribution": modality_distribution, "country_distribution": countries, "hourly_activity": dict(hour_distribution)}


@router.get("/analytics/engagement")
async def get_engagement_metrics(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Get user engagement metrics."""
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)
    week_ago = now - timedelta(days=7)

    total_users = db.query(func.count(User.id)).scalar() or 1
    users_with_recordings = db.query(func.count(func.distinct(Journey.user_id))).join(MediaAsset, Journey.id == MediaAsset.journey_id).scalar() or 0
    users_onboarded = db.query(func.count(User.id)).filter(User.onboarding_completed_at.isnot(None)).scalar() or 0
    avg_recordings = db.query(func.count(MediaAsset.id)).scalar() or 0
    avg_recordings_per_user = round(avg_recordings / max(users_with_recordings, 1), 1)
    avg_duration = db.query(func.avg(MediaAsset.duration_seconds)).scalar() or 0
    active_7d = db.query(func.count(User.id)).filter(User.last_login_at >= week_ago).scalar() or 0
    retention_base = db.query(func.count(User.id)).filter(User.created_at < month_ago).scalar() or 1
    retained = db.query(func.count(User.id)).filter(and_(User.created_at < month_ago, User.last_login_at >= month_ago)).scalar() or 0

    return {
        "conversion": {"onboarding_rate": round((users_onboarded / total_users) * 100, 1), "first_recording_rate": round((users_with_recordings / total_users) * 100, 1)},
        "engagement": {"avg_recordings_per_user": avg_recordings_per_user, "avg_recording_duration_seconds": round(avg_duration, 0), "weekly_active_rate": round((active_7d / total_users) * 100, 1)},
        "retention": {"thirty_day_retention": round((retained / retention_base) * 100, 1) if retention_base > 0 else 0},
    }


@router.get("/system/health")
async def get_system_health(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Get system health metrics."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "error"

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_journeys = db.query(func.count(Journey.id)).scalar() or 0
    total_media = db.query(func.count(MediaAsset.id)).scalar() or 0
    total_storage = db.query(func.sum(MediaAsset.size_bytes)).scalar() or 0

    return {"status": "operational", "database": {"status": db_status, "users": total_users, "journeys": total_journeys, "media_assets": total_media, "storage_gb": round(total_storage / (1024 ** 3), 2)}, "api": {"status": "healthy"}}
