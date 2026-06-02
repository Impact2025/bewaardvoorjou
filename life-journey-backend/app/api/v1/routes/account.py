"""
AVG-rechten endpoints (Art. 15, 17, 20).

- GET  /account/me/export  → dataportabiliteit (Art. 20)
- DELETE /account/me       → wissingsrecht (Art. 17)
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limiter import RateLimits, limiter
from app.db.session import get_db
from app.models.family import FamilyMember
from app.models.journey import Journey
from app.models.media import MediaAsset, TranscriptSegment
from app.models.memo import Memo
from app.models.quick_thought import QuickThought
from app.models.sharing import ShareGrant
from app.models.user import User
from app.services.auth import verify_password

router = APIRouter()


class DeleteAccountRequest(BaseModel):
    password: str
    confirm: bool


@router.get("/me/export", tags=["account"])
@limiter.limit("5/hour")
def export_my_data(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Dataportabiliteit (AVG Art. 20).
    Retourneert alle persoonsgegevens van de gebruiker als gestructureerde JSON.
    Mediabestanden zijn niet inbegrepen — download die via de mediasectie in uw account.
    """
    journeys = db.query(Journey).filter(Journey.user_id == current_user.id).all()
    journey_ids = [j.id for j in journeys]

    media_assets = (
        db.query(MediaAsset)
        .filter(MediaAsset.journey_id.in_(journey_ids))
        .all()
    ) if journey_ids else []

    asset_ids = [a.id for a in media_assets]

    transcripts = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.media_asset_id.in_(asset_ids))
        .all()
    ) if asset_ids else []

    memos = (
        db.query(Memo)
        .filter(Memo.journey_id.in_(journey_ids))
        .all()
    ) if journey_ids else []

    quick_thoughts = (
        db.query(QuickThought)
        .filter(QuickThought.journey_id.in_(journey_ids))
        .all()
    ) if journey_ids else []

    family_members = (
        db.query(FamilyMember)
        .filter(FamilyMember.journey_id.in_(journey_ids))
        .all()
    ) if journey_ids else []

    share_grants = (
        db.query(ShareGrant)
        .filter(ShareGrant.journey_id.in_(journey_ids))
        .all()
    ) if journey_ids else []

    def _dt(val) -> str | None:
        if val is None:
            return None
        if isinstance(val, datetime):
            return val.isoformat()
        return str(val)

    return {
        "export_generated_at": datetime.now(timezone.utc).isoformat(),
        "export_version": "1.0",
        "note": "Mediabestanden (audio/video) zijn niet inbegrepen in deze export. Download deze afzonderlijk via uw account.",
        "user": {
            "id": current_user.id,
            "display_name": current_user.display_name,
            "email": current_user.email,
            "country": current_user.country,
            "locale": current_user.locale,
            "birth_year": current_user.birth_year,
            "privacy_level": current_user.privacy_level,
            "package_tier": current_user.package_tier,
            "package_activated_at": _dt(current_user.package_activated_at),
            "ai_assistance_level": current_user.ai_assistance_level,
            "preferred_recording_method": current_user.preferred_recording_method,
            "captions": current_user.captions,
            "high_contrast": current_user.high_contrast,
            "large_text": current_user.large_text,
            "email_verified": current_user.email_verified,
            "created_at": _dt(current_user.created_at),
            "updated_at": _dt(current_user.updated_at),
            "last_login_at": _dt(current_user.last_login_at),
            "terms_accepted_at": _dt(current_user.terms_accepted_at),
            "consent_special_categories_at": _dt(current_user.consent_special_categories_at),
            "consent_marketing": current_user.consent_marketing,
        },
        "journeys": [
            {
                "id": j.id,
                "title": j.title,
                "progress": j.progress,
                "created_at": _dt(j.created_at),
                "updated_at": _dt(j.updated_at),
            }
            for j in journeys
        ],
        "media_assets": [
            {
                "id": a.id,
                "journey_id": a.journey_id,
                "chapter_id": a.chapter_id,
                "modality": a.modality,
                "original_filename": a.original_filename,
                "duration_seconds": a.duration_seconds,
                "size_bytes": a.size_bytes,
                "storage_state": a.storage_state,
                "recorded_at": _dt(a.recorded_at),
            }
            for a in media_assets
        ],
        "transcripts": [
            {
                "id": t.id,
                "media_asset_id": t.media_asset_id,
                "text": t.text,
                "start_ms": t.start_ms,
                "end_ms": t.end_ms,
                "sentiment": t.sentiment,
                "emotion_hint": t.emotion_hint,
            }
            for t in transcripts
        ],
        "memos": [
            {
                "id": m.id,
                "journey_id": m.journey_id,
                "chapter_id": m.chapter_id,
                "title": m.title,
                "content": m.content,
                "created_at": _dt(m.created_at),
                "updated_at": _dt(m.updated_at),
            }
            for m in memos
        ],
        "quick_thoughts": [
            {
                "id": q.id,
                "journey_id": q.journey_id,
                "text_content": q.text_content,
                "transcript": q.transcript,
                "duration_seconds": q.duration_seconds,
                "auto_tags": q.auto_tags,
                "emotion_score": q.emotion_score,
                "created_at": _dt(q.created_at),
            }
            for q in quick_thoughts
        ],
        "family_members": [
            {
                "id": fm.id,
                "name": fm.name,
                "email": fm.email,
                "role": fm.role,
                "access_level": fm.access_level,
                "invite_sent_at": _dt(fm.invite_sent_at),
                "invite_accepted_at": _dt(fm.invite_accepted_at),
                "created_at": _dt(fm.created_at),
            }
            for fm in family_members
        ],
        "share_grants": [
            {
                "id": sg.id,
                "issued_to": sg.issued_to,
                "email": sg.email,
                "chapter_ids": sg.chapter_ids,
                "status": sg.status,
                "expires_at": _dt(sg.expires_at),
                "created_at": _dt(sg.created_at),
            }
            for sg in share_grants
        ],
    }


@router.delete("/me", status_code=204, tags=["account"])
@limiter.limit("3/hour")
def delete_my_account(
    request: Request,
    payload: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Wissingsrecht (AVG Art. 17).
    Verwijdert het account en alle bijbehorende gegevens permanent.
    Vereist wachtwoordbevestiging en een expliciete confirm=true vlag.
    Gegevens met een wettelijke bewaarplicht (zoals facturen) worden niet verwijderd.
    """
    if not payload.confirm:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Bevestig de verwijdering door confirm=true mee te sturen.",
        )

    if current_user.password_hash:
        if not payload.password or not verify_password(payload.password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Wachtwoord is onjuist. Verwijdering geannuleerd.",
            )

    # Verwijder FamilyMember-records in journeys van anderen waar deze user created_by is.
    # (Die worden niet automatisch via cascade verwijderd.)
    other_journey_ids = [
        j.id
        for j in db.query(Journey.id).filter(Journey.user_id != current_user.id).all()
    ]
    if other_journey_ids:
        db.query(FamilyMember).filter(
            FamilyMember.created_by == current_user.id,
            FamilyMember.journey_id.in_(other_journey_ids),
        ).delete(synchronize_session=False)

    db.delete(current_user)
    db.commit()
