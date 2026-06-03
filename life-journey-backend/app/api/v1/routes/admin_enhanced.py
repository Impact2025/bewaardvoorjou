"""Enhanced Admin API routes."""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import cast, Date as SADate, desc, func, and_, text
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.models.audit_log import AuditLog
from app.models.media import MediaAsset, TranscriptSegment, PromptRun
from app.models.memo import Memo
from app.models.sharing import Highlight, ShareGrant
from app.models.journey import Journey
from app.models.user import User
from app.models.waitlist import WaitlistEntry
from app.schemas.admin import AuditLogEntry


router = APIRouter(dependencies=[Depends(get_current_admin_user)])


@router.get("/stats/enhanced")
def get_enhanced_stats(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users = db.query(func.count(User.id)).scalar() or 0
    active_30d = db.query(func.count(User.id)).filter(User.last_login_at >= month_ago).scalar() or 0
    active_7d = db.query(func.count(User.id)).filter(User.last_login_at >= week_ago).scalar() or 0
    new_today = db.query(func.count(User.id)).filter(User.created_at >= today_start).scalar() or 0
    new_yesterday = db.query(func.count(User.id)).filter(
        and_(User.created_at >= yesterday_start, User.created_at < today_start)
    ).scalar() or 0
    new_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar() or 0

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

    trend = ((new_today - new_yesterday) / max(new_yesterday, 1)) * 100 if new_yesterday > 0 else None

    return {
        "users": {
            "total": total_users,
            "active_30d": active_30d,
            "active_7d": active_7d,
            "new_today": new_today,
            "new_week": new_week,
            "trend_percent": round(trend, 1) if trend is not None else None,
        },
        "journeys": {"total": db.query(func.count(Journey.id)).scalar() or 0},
        "recordings": {
            "total": total_recordings,
            "today": recordings_today,
            "week": recordings_week,
            "total_duration_hours": round(total_duration / 3600, 1),
            "total_storage_gb": round(total_storage / (1024 ** 3), 2),
        },
        "transcripts": {"total": total_transcripts},
        "highlights": {"total": total_highlights},
        "ai_usage": {"total_prompts": total_prompts, "prompts_today": prompts_today},
        "sharing": {"total_shares": total_shares},
        "memos": {"total": total_memos},
    }


@router.get("/users/{user_id}/detail")
def get_user_detail(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException, status
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gebruiker niet gevonden")

    journey = db.query(Journey).filter(Journey.user_id == user_id).first()
    metrics = {
        "recordings": {"total": 0, "duration_seconds": 0, "storage_bytes": 0},
        "transcripts": {"total": 0},
        "highlights": {"total": 0},
        "prompts": {"total": 0},
        "memos": {"total": 0},
        "shares": {"total": 0},
        "chapters_started": 0,
        "chapters_completed": 0,
    }
    recent_activity = []
    chapter_progress = {}

    journey_progress_data = {
        "percent_complete": 0,
        "completed_chapters": 0,
        "available_chapters": 0,
        "total_chapters": 30,
        "phases": [],
    }

    if journey:
        rec_total, rec_duration, rec_storage = db.query(
            func.count(MediaAsset.id),
            func.sum(MediaAsset.duration_seconds),
            func.sum(MediaAsset.size_bytes),
        ).filter(MediaAsset.journey_id == journey.id).first()
        metrics["recordings"] = {
            "total": rec_total or 0,
            "duration_seconds": rec_duration or 0,
            "storage_bytes": rec_storage or 0,
        }
        metrics["transcripts"]["total"] = db.query(
            func.count(func.distinct(TranscriptSegment.media_asset_id))
        ).join(MediaAsset, TranscriptSegment.media_asset_id == MediaAsset.id).filter(
            MediaAsset.journey_id == journey.id
        ).scalar() or 0
        metrics["highlights"]["total"] = db.query(func.count(Highlight.id)).filter(
            Highlight.journey_id == journey.id
        ).scalar() or 0
        metrics["prompts"]["total"] = db.query(func.count(PromptRun.id)).filter(
            PromptRun.journey_id == journey.id
        ).scalar() or 0
        metrics["shares"]["total"] = db.query(func.count(ShareGrant.id)).filter(
            ShareGrant.journey_id == journey.id
        ).scalar() or 0

        # Accurate progress via MediaAsset counts
        from app.services.journey_progress import get_journey_progress, get_all_chapter_statuses, CHAPTER_ORDER
        progress_stats = get_journey_progress(db, journey.id)
        chapter_statuses = get_all_chapter_statuses(db, journey.id)

        metrics["chapters_started"] = sum(
            1 for s in chapter_statuses.values() if s["mediaCount"] > 0
        )
        metrics["chapters_completed"] = progress_stats["completedChapters"]

        # Build per-phase breakdown
        phases_def = [
            ("Voorbereiding", ["intro-reflection", "intro-intention", "intro-uniqueness"]),
            ("Vroege Jaren", ["youth-favorite-place", "youth-sounds", "youth-hero"]),
            ("Liefde & Relaties", ["love-connection", "love-lessons", "love-symbol"]),
            ("Werk & Passies", ["work-dream-job", "work-passion", "work-challenge"]),
            ("Toekomst", ["future-message", "future-dream", "future-gratitude"]),
            ("Bonus", ["bonus-funny", "bonus-relive", "bonus-culture"]),
            ("Verborgen", [c for c in CHAPTER_ORDER if c.startswith("deep-")]),
        ]
        phases = []
        for phase_name, chapter_ids in phases_def:
            completed = sum(1 for cid in chapter_ids if chapter_statuses.get(cid, {}).get("status") == "completed")
            phases.append({
                "name": phase_name,
                "total": len(chapter_ids),
                "completed": completed,
            })

        journey_progress_data = {
            "percent_complete": progress_stats["percentComplete"],
            "completed_chapters": progress_stats["completedChapters"],
            "available_chapters": progress_stats["availableChapters"],
            "total_chapters": progress_stats["totalChapters"],
            "phases": phases,
        }
        chapter_progress = {cid: s for cid, s in chapter_statuses.items()}

        for rec in db.query(MediaAsset).filter(MediaAsset.journey_id == journey.id).order_by(
            desc(MediaAsset.recorded_at)
        ).limit(10).all():
            recent_activity.append({
                "type": "recording",
                "timestamp": rec.recorded_at.isoformat() if rec.recorded_at else None,
                "chapter_id": rec.chapter_id,
                "duration_seconds": rec.duration_seconds,
                "modality": rec.modality,
                "description": f"{user.display_name} heeft een {rec.modality} opname gemaakt ({rec.duration_seconds}s)",
            })
        for prompt in db.query(PromptRun).filter(PromptRun.journey_id == journey.id).order_by(
            desc(PromptRun.created_at)
        ).limit(5).all():
            recent_activity.append({
                "type": "ai_prompt",
                "timestamp": prompt.created_at.isoformat() if prompt.created_at else None,
                "chapter_id": prompt.chapter_id,
                "description": f"{user.display_name} heeft AI hulp gevraagd",
            })

    metrics["memos"]["total"] = db.query(func.count(Memo.id)).filter(Memo.user_id == user_id).scalar() or 0
    recent_activity.sort(key=lambda x: x.get("timestamp") or "", reverse=True)

    return {
        "user": {
            "id": user.id,
            "display_name": user.display_name,
            "email": user.email,
            "country": user.country,
            "locale": user.locale,
            "birth_year": user.birth_year,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
            "onboarding_completed_at": user.onboarding_completed_at.isoformat() if user.onboarding_completed_at else None,
            "preferred_recording_method": user.preferred_recording_method,
            "ai_assistance_level": user.ai_assistance_level,
        },
        "journey_id": journey.id if journey else None,
        "metrics": metrics,
        "journey_progress": journey_progress_data,
        "chapter_progress": chapter_progress,
        "recent_activity": recent_activity[:15],
    }


@router.get("/activity/feed")
def get_activity_feed(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=100),
    activity_type: Optional[str] = None,
):
    activities = []

    if not activity_type or activity_type == "registration":
        for user in db.query(User).order_by(desc(User.created_at)).limit(20).all():
            activities.append({
                "type": "user_registration",
                "timestamp": user.created_at.isoformat() if user.created_at else None,
                "user_id": user.id,
                "user_name": user.display_name,
                "user_email": user.email,
                "description": f"{user.display_name} heeft zich geregistreerd",
            })

    if not activity_type or activity_type == "login":
        for user in db.query(User).filter(User.last_login_at.isnot(None)).order_by(desc(User.last_login_at)).limit(20).all():
            activities.append({
                "type": "user_login",
                "timestamp": user.last_login_at.isoformat() if user.last_login_at else None,
                "user_id": user.id,
                "user_name": user.display_name,
                "user_email": user.email,
                "description": f"{user.display_name} is ingelogd",
            })

    if not activity_type or activity_type == "recording":
        rows = (
            db.query(MediaAsset, Journey, User)
            .join(Journey, MediaAsset.journey_id == Journey.id)
            .join(User, Journey.user_id == User.id)
            .order_by(desc(MediaAsset.recorded_at))
            .limit(30)
            .all()
        )
        for recording, journey, user in rows:
            activities.append({
                "type": "recording",
                "timestamp": recording.recorded_at.isoformat() if recording.recorded_at else None,
                "user_id": user.id,
                "user_name": user.display_name,
                "user_email": user.email,
                "chapter_id": recording.chapter_id,
                "duration_seconds": recording.duration_seconds,
                "modality": recording.modality,
                "description": f"{user.display_name} heeft een {recording.modality} opname gemaakt ({recording.duration_seconds}s)",
            })

    if not activity_type or activity_type == "ai_prompt":
        rows = (
            db.query(PromptRun, Journey, User)
            .join(Journey, PromptRun.journey_id == Journey.id)
            .join(User, Journey.user_id == User.id)
            .order_by(desc(PromptRun.created_at))
            .limit(20)
            .all()
        )
        for prompt, journey, user in rows:
            activities.append({
                "type": "ai_prompt",
                "timestamp": prompt.created_at.isoformat() if prompt.created_at else None,
                "user_id": user.id,
                "user_name": user.display_name,
                "user_email": user.email,
                "chapter_id": prompt.chapter_id,
                "description": f"{user.display_name} heeft AI hulp gevraagd",
            })

    activities.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
    return {"activities": activities[:limit], "total": len(activities)}


@router.get("/analytics/overview")
def get_analytics_overview(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    days: int = Query(default=30, le=90),
):
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=days)

    # User growth — 2 queries instead of N
    total_before = db.query(func.count(User.id)).filter(User.created_at < start_date).scalar() or 0
    daily_reg_rows = db.query(
        cast(User.created_at, SADate).label("day"),
        func.count(User.id).label("cnt"),
    ).filter(User.created_at >= start_date).group_by("day").all()
    daily_reg_map = {str(row.day): row.cnt for row in daily_reg_rows}

    user_growth = []
    running_total = total_before
    for i in range(days):
        day = start_date + timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        running_total += daily_reg_map.get(day_str, 0)
        user_growth.append({"date": day_str, "total_users": running_total})

    # Daily registrations — last 14 days from the map we already have
    daily_registrations = []
    for i in range(min(days, 14) - 1, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        daily_registrations.append({"date": day_str, "registrations": daily_reg_map.get(day_str, 0)})

    # Daily recordings — 2 queries
    rec_rows = db.query(
        cast(MediaAsset.recorded_at, SADate).label("day"),
        func.count(MediaAsset.id).label("cnt"),
        func.sum(MediaAsset.duration_seconds).label("dur"),
    ).filter(MediaAsset.recorded_at >= start_date).group_by("day").all()
    rec_by_day = {str(row.day): (row.cnt, row.dur or 0) for row in rec_rows}

    daily_recordings = []
    for i in range(min(days, 14) - 1, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        cnt, dur = rec_by_day.get(day_str, (0, 0))
        daily_recordings.append({
            "date": day_str,
            "recordings": cnt,
            "duration_minutes": round(dur / 60, 1),
        })

    chapter_distribution = {
        row.chapter_id: row.count
        for row in db.query(MediaAsset.chapter_id, func.count(MediaAsset.id).label("count")).group_by(MediaAsset.chapter_id).all()
    }
    modality_distribution = {
        row.modality: row.count
        for row in db.query(MediaAsset.modality, func.count(MediaAsset.id).label("count")).group_by(MediaAsset.modality).all()
    }
    countries = {
        row.country: row.count
        for row in db.query(User.country, func.count(User.id).label("count")).group_by(User.country).all()
    }

    hour_distribution: dict[int, int] = defaultdict(int)
    for (recorded_at,) in db.query(MediaAsset.recorded_at).filter(MediaAsset.recorded_at >= start_date).all():
        if recorded_at:
            hour_distribution[recorded_at.hour] += 1

    return {
        "user_growth": user_growth,
        "daily_registrations": daily_registrations,
        "daily_recordings": daily_recordings,
        "chapter_distribution": chapter_distribution,
        "modality_distribution": modality_distribution,
        "country_distribution": countries,
        "hourly_activity": dict(hour_distribution),
    }


@router.get("/analytics/engagement")
def get_engagement_metrics(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)
    week_ago = now - timedelta(days=7)

    total_users = db.query(func.count(User.id)).scalar() or 1
    users_with_recordings = db.query(func.count(func.distinct(Journey.user_id))).join(
        MediaAsset, Journey.id == MediaAsset.journey_id
    ).scalar() or 0
    users_onboarded = db.query(func.count(User.id)).filter(User.onboarding_completed_at.isnot(None)).scalar() or 0
    avg_recordings = db.query(func.count(MediaAsset.id)).scalar() or 0
    avg_recordings_per_user = round(avg_recordings / max(users_with_recordings, 1), 1)
    avg_duration = db.query(func.avg(MediaAsset.duration_seconds)).scalar() or 0
    active_7d = db.query(func.count(User.id)).filter(User.last_login_at >= week_ago).scalar() or 0
    retention_base = db.query(func.count(User.id)).filter(User.created_at < month_ago).scalar() or 1
    retained = db.query(func.count(User.id)).filter(
        and_(User.created_at < month_ago, User.last_login_at >= month_ago)
    ).scalar() or 0

    return {
        "conversion": {
            "onboarding_rate": round((users_onboarded / total_users) * 100, 1),
            "first_recording_rate": round((users_with_recordings / total_users) * 100, 1),
        },
        "engagement": {
            "avg_recordings_per_user": avg_recordings_per_user,
            "avg_recording_duration_seconds": round(avg_duration, 0),
            "weekly_active_rate": round((active_7d / total_users) * 100, 1),
        },
        "retention": {
            "thirty_day_retention": round((retained / retention_base) * 100, 1) if retention_base > 0 else 0,
        },
    }


@router.get("/system/health")
def get_system_health(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "error"

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_journeys = db.query(func.count(Journey.id)).scalar() or 0
    total_media = db.query(func.count(MediaAsset.id)).scalar() or 0
    total_storage = db.query(func.sum(MediaAsset.size_bytes)).scalar() or 0
    admin_count = db.query(func.count(User.id)).filter(User.is_admin).scalar() or 0

    return {
        "status": "operational" if db_status == "healthy" else "degraded",
        "database": {
            "status": db_status,
            "users": total_users,
            "journeys": total_journeys,
            "media_assets": total_media,
            "storage_gb": round(total_storage / (1024 ** 3), 2),
        },
        "api": {"status": "healthy"},
        "security": {
            "admin_accounts": admin_count,
            "active_users": db.query(func.count(User.id)).filter(User.is_active).scalar() or 0,
        },
    }


@router.get("/audit", response_model=list[AuditLogEntry])
def get_audit_log(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=200),
    action: Optional[str] = Query(default=None),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    return q.order_by(desc(AuditLog.created_at)).limit(limit).all()


# ─── Wachtlijst admin ─────────────────────────────────────────────────────────

@router.get("/waitlist")
def get_waitlist(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    package_type: Optional[str] = Query(default=None),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
):
    q = db.query(WaitlistEntry)
    if package_type:
        q = q.filter(WaitlistEntry.package_type == package_type)

    total = q.count()
    entries = q.order_by(desc(WaitlistEntry.created_at)).offset(offset).limit(limit).all()

    by_package = (
        db.query(WaitlistEntry.package_type, func.count(WaitlistEntry.id))
        .group_by(WaitlistEntry.package_type)
        .all()
    )

    return {
        "total": total,
        "by_package": {pkg: count for pkg, count in by_package},
        "entries": [
            {
                "id": e.id,
                "email": e.email,
                "package_type": e.package_type,
                "created_at": e.created_at.isoformat(),
            }
            for e in entries
        ],
    }


@router.get("/waitlist/export.csv")
def export_waitlist_csv(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    package_type: Optional[str] = Query(default=None),
):
    q = db.query(WaitlistEntry)
    if package_type:
        q = q.filter(WaitlistEntry.package_type == package_type)
    entries = q.order_by(WaitlistEntry.package_type, WaitlistEntry.created_at).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["email", "pakket", "aangemeld_op"])
    for e in entries:
        writer.writerow([e.email, e.package_type, e.created_at.strftime("%Y-%m-%d %H:%M")])

    output.seek(0)
    filename = f"wachtlijst_{package_type or 'alle'}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
