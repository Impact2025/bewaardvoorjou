"""
Gebruiker Self-Service Backup

GET /account/backup?type=quick  → audio + transcripties als ZIP  (~30 sec)
GET /account/backup?type=full   → volledige USB-kopie met PDF    (~2 min)
"""

from __future__ import annotations

import io
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import boto3
from botocore.exceptions import BotoCoreError
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from loguru import logger
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.rate_limiter import limiter
from app.models.journey import Journey
from app.models.media import MediaAsset, TranscriptSegment
from app.models.memo import Memo
from app.models.user import User
from app.services.export.pdf_generator import generate_pdf_bytes, generate_pdf_html

router = APIRouter()

# ─── Constanten (gespiegeld aan usb_export) ───────────────────────────────────

_PHASE_PREFIX: dict[str, str] = {
    "intro":    "Fase_1_Vroege_Jeugd",
    "roots":    "Fase_1_Vroege_Jeugd",
    "youth":    "Fase_1_Vroege_Jeugd",
    "work":     "Fase_2_Volwassen_Leven",
    "young":    "Fase_2_Volwassen_Leven",
    "love":     "Fase_2_Volwassen_Leven",
    "family":   "Fase_2_Volwassen_Leven",
    "midlife":  "Fase_3_Later_Leven",
    "future":   "Fase_3_Later_Leven",
    "legacy":   "Fase_3_Later_Leven",
    "bonus":    "Fase_3_Later_Leven",
    "deep":     "Fase_3_Later_Leven",
    "optional": "Fase_3_Later_Leven",
}

_CHAPTER_NAMES: dict[str, str] = {
    "intro-reflection":          "Reflectie op mijn leven",
    "intro-intention":           "Mijn intentie",
    "intro-uniqueness":          "Wat mij uniek maakt",
    "roots-first-memory":        "Mijn eerste herinnering",
    "roots-father":              "Mijn vader",
    "roots-mother":              "Mijn moeder",
    "roots-grandparents":        "Mijn grootouders",
    "roots-siblings":            "Broers en zussen",
    "roots-home":                "Ons thuis",
    "roots-neighborhood":        "Mijn buurt",
    "roots-faith":               "Geloof en tradities",
    "roots-finances":            "Geld en armoede",
    "roots-hardship":            "Vroege tegenslagen",
    "youth-favorite-place":      "Mijn favoriete plek",
    "youth-sounds":              "Geluiden van vroeger",
    "youth-hero":                "Mijn held",
    "youth-primary-school":      "De lagere school",
    "youth-friends":             "Vriendschappen",
    "youth-secondary-school":    "Middelbare school",
    "youth-history":             "Geschiedenis die ik meemaakte",
    "youth-ambition":            "Mijn dromen als kind",
    "work-dream-job":            "Mijn droomwerk",
    "work-passion":              "Mijn passie",
    "work-challenge":            "Een grote uitdaging",
    "young-adult-first-job":     "Mijn eerste baan",
    "young-adult-independence":  "Op eigen benen",
    "young-adult-first-home":    "Mijn eerste thuis",
    "young-adult-career-path":   "Mijn carrièrepad",
    "young-adult-pivotal-choice":"Een keuze die alles veranderde",
    "young-adult-finances":      "Leren omgaan met geld",
    "young-adult-world-events":  "Wereldgebeurtenissen",
    "love-connection":           "Hoe ik mijn partner ontmoette",
    "love-lessons":              "Lessen in de liefde",
    "love-symbol":               "Een symbool van onze liefde",
    "family-partner-story":      "Het verhaal van ons samen",
    "family-early-years":        "De eerste jaren samen",
    "family-wedding":            "Ons huwelijk",
    "family-children":           "Mijn kinderen",
    "family-typical-week":       "Een gewone week",
    "family-hardship":           "Moeilijke tijden in het gezin",
    "family-pride":              "Waar ik trots op ben",
    "midlife-grief":             "Verlies en rouw",
    "midlife-aging":             "Ouder worden",
    "midlife-regret":            "Spijt en acceptatie",
    "midlife-resilience":        "Veerkracht",
    "midlife-parents-retrospect":"Terugkijken op mijn ouders",
    "midlife-formative-decade":  "Het decennium dat mij vormde",
    "midlife-social-change":     "Maatschappelijke verandering",
    "midlife-faith-evolution":   "Hoe mijn geloof veranderde",
    "future-message":            "Boodschap aan de toekomst",
    "future-dream":              "Mijn laatste droom",
    "future-gratitude":          "Dankbaarheid",
    "legacy-daily-joy":          "Dagelijkse vreugde",
    "legacy-faith-now":          "Geloof nu",
    "legacy-remembered":         "Hoe ik herinnerd wil worden",
    "legacy-verdict":            "Mijn levensuitspraak",
    "legacy-unsaid":             "Wat ik nooit gezegd heb",
    "legacy-letter":             "Een brief aan wie ik liefheb",
}


# ─── S3 helpers ───────────────────────────────────────────────────────────────

def _s3() -> Any:
    endpoint = settings.s3_endpoint_url or f"https://s3.{settings.s3_region}.amazonaws.com"
    return boto3.client(
        "s3",
        region_name=settings.s3_region,
        endpoint_url=endpoint,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def _download_one(s3: Any, key: str) -> bytes | None:
    try:
        return s3.get_object(Bucket=settings.s3_bucket, Key=key)["Body"].read()
    except BotoCoreError as exc:
        logger.warning(f"S3 download mislukt: {key} — {exc}")
        return None


def _download_parallel(s3: Any, assets: list[MediaAsset]) -> dict[str, bytes]:
    results: dict[str, bytes] = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(_download_one, s3, a.object_key): a for a in assets}
        for future in as_completed(futures):
            asset = futures[future]
            data = future.result()
            if data:
                results[asset.id] = data
    return results


# ─── ZIP builders ─────────────────────────────────────────────────────────────

def _safe(name: str) -> str:
    return "".join(c if c.isalnum() or c in " _-" else "_" for c in name).strip()


def _chapter_name(chapter_id: str) -> str:
    return _CHAPTER_NAMES.get(chapter_id, chapter_id.replace("-", " ").title())


def _phase_folder(chapter_id: str) -> str:
    return _PHASE_PREFIX.get(chapter_id.split("-")[0], "Fase_3_Later_Leven")


def _build_quick_zip(journey: Journey, user: User, db: Session) -> io.BytesIO:
    """
    Snelle backup: elke opname als .mp3 + bijbehorende transcriptie als .txt.
    Memo's als platte tekstbestanden. Geen PDF, geen HTML-dashboard.
    """
    naam      = user.display_name or user.email.split("@")[0]
    datum_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.journey_id == journey.id,
            MediaAsset.modality == "audio",
            MediaAsset.storage_state == "ready",
        )
        .order_by(MediaAsset.recorded_at)
        .all()
    )

    asset_ids = [a.id for a in assets]
    all_segs: list[TranscriptSegment] = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.media_asset_id.in_(asset_ids))
        .order_by(TranscriptSegment.start_ms)
        .all()
        if asset_ids else []
    )
    segs_by_asset: dict[str, list[TranscriptSegment]] = {}
    for seg in all_segs:
        segs_by_asset.setdefault(seg.media_asset_id, []).append(seg)

    memos = (
        db.query(Memo)
        .filter(Memo.journey_id == journey.id)
        .order_by(Memo.created_at)
        .all()
    )

    s3 = _s3() if settings.s3_bucket and settings.aws_access_key_id else None
    downloaded = _download_parallel(s3, assets) if s3 else {}

    buf = io.BytesIO()
    seq_per_phase: dict[str, int] = {}

    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        readme = (
            f"Bewaardvoorjou — Tussentijdse Backup\n"
            f"=====================================\n\n"
            f"Naam:   {naam}\n"
            f"Datum:  {datum_str}\n\n"
            f"Inhoud\n"
            f"------\n"
            f"01_Verhalen/  — Uw opnames (.mp3) met transcriptie (.txt)\n"
            f"02_Notities/  — Uw geschreven notities\n\n"
            f"U kunt de audiobestanden openen met elke mediaspeler.\n"
            f"De transcripties zijn te lezen in elk tekstprogramma.\n\n"
            f"www.bewaardvoorjou.nl\n"
        )
        zf.writestr("LEESMIJ.txt", readme.encode("utf-8"))

        for asset in assets:
            phase   = _phase_folder(asset.chapter_id)
            seq     = seq_per_phase.get(phase, 0) + 1
            seq_per_phase[phase] = seq
            display = _chapter_name(asset.chapter_id)
            ext     = asset.original_filename.rsplit(".", 1)[-1] if "." in asset.original_filename else "mp3"
            base    = f"{seq:02d}_{_safe(display)}"

            # Audio
            audio_data = downloaded.get(asset.id)
            if audio_data:
                zf.writestr(f"01_Verhalen/{phase}/{base}.{ext}", audio_data)

            # Transcriptie als .txt naast het audiobestand
            segs = sorted(segs_by_asset.get(asset.id, []), key=lambda s: s.start_ms)
            transcript = " ".join(s.text for s in segs).strip()
            if transcript:
                txt = (
                    f"{display}\n"
                    f"{'=' * len(display)}\n\n"
                    f"{transcript}\n"
                )
                zf.writestr(f"01_Verhalen/{phase}/{base}.txt", txt.encode("utf-8"))

        # Memo's
        for i, memo in enumerate(memos, 1):
            txt = f"{memo.title}\n{'=' * len(memo.title)}\n\n{memo.content}\n"
            filename = f"{i:02d}_{_safe(memo.title)[:60]}.txt"
            zf.writestr(f"02_Notities/{filename}", txt.encode("utf-8"))

    buf.seek(0)
    return buf


def _build_full_zip(journey: Journey, user: User, db: Session) -> io.BytesIO:
    """
    Eindversie: identiek aan de USB-stick die wij versturen.
    Hergebruikt de HTML-dashboard en PDF-generator.
    """
    from app.api.v1.routes.usb_export import (
        _build_dashboard_html,
        _download_parallel as _usb_dl,
        _phase_folder as _usb_phase,
        _chapter_display,
        _safe_name,
        _AUTORUN_INF,
        _README,
        _ROOT_WELCOME_HTML,
        _SOFTWARE_README,
        _FASE_CONFIG,
        _ACCOUNT_CONFIG,
        _UPDATER_PS1,
        _UPDATER_BAT,
    )

    naam      = user.display_name or user.email.split("@")[0]
    safe_naam = _safe_name(naam)

    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.journey_id == journey.id,
            MediaAsset.modality == "audio",
            MediaAsset.storage_state == "ready",
        )
        .order_by(MediaAsset.recorded_at)
        .all()
    )

    s3 = _s3() if settings.s3_bucket and settings.aws_access_key_id else None
    downloaded = _usb_dl(s3, assets) if s3 else {}

    chapters_by_phase: dict[str, list[dict]] = {}
    seq_per_phase: dict[str, int] = {}

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("autorun.inf", _AUTORUN_INF.encode("utf-8"))
        welcome = _ROOT_WELCOME_HTML.replace("TMPL_NAAM", naam)
        zf.writestr("index.html", welcome.encode("utf-8"))
        zf.writestr("KLIK_HIER_EERST.txt", _README.replace("TMPL_NAAM", naam).encode("utf-8"))
        config = (_ACCOUNT_CONFIG
                  .replace("TMPL_EMAIL",   user.email)
                  .replace("TMPL_WEBSITE", "https://api.bewaardvoorjou.nl"))
        zf.writestr("mijn_account.txt",       config.encode("utf-8"))
        zf.writestr("updater.ps1",            _UPDATER_PS1.encode("utf-8"))
        zf.writestr("Verhalen bijwerken.bat", _UPDATER_BAT.encode("utf-8"))

        # 01 PDF
        try:
            pdf_data = generate_pdf_bytes(journey.id, user, db)
            zf.writestr(f"01_Mijn_Levensboek_PDF/{safe_naam}_Levensboek.pdf", pdf_data)
        except ImportError:
            html_fb = generate_pdf_html(journey.id, user, db)
            zf.writestr(
                f"01_Mijn_Levensboek_PDF/{safe_naam}_Levensboek_PRINTKLAAR.html",
                html_fb.encode("utf-8"),
            )
        except Exception as exc:
            logger.error(f"PDF mislukt (user backup): {exc}")

        # 02 Audio
        for asset in assets:
            data = downloaded.get(asset.id)
            if not data:
                continue
            phase   = _usb_phase(asset.chapter_id)
            seq     = seq_per_phase.get(phase, 0) + 1
            seq_per_phase[phase] = seq
            display = _chapter_display(asset.chapter_id)
            ext     = asset.original_filename.rsplit(".", 1)[-1] if "." in asset.original_filename else "mp3"
            filename = f"{seq:02d}_{display}.{ext}"
            zf.writestr(f"02_Gesproken_Herinneringen/{phase}/{filename}", data)
            chapters_by_phase.setdefault(phase, []).append(
                {"display_name": display, "filename": filename}
            )

        for fase in _FASE_CONFIG:
            if not any(k.startswith(f"02_Gesproken_Herinneringen/{fase}/") for k in zf.namelist()):
                zf.writestr(f"02_Gesproken_Herinneringen/{fase}/.keep", b"")

        zf.writestr(
            "03_Mijn_Fotogalerij/LEESMIJ.txt",
            "Uw foto's kunt u hier handmatig toevoegen.\n".encode("utf-8"),
        )

        html = _build_dashboard_html(naam, safe_naam, chapters_by_phase, foto_count=0)
        zf.writestr("04_Start_Hier_Offline/index.html", html.encode("utf-8"))
        zf.writestr("05_Software/LEESMIJ.txt", _SOFTWARE_README.encode("utf-8"))

    buf.seek(0)
    return buf


# ─── USB koppeltoken ─────────────────────────────────────────────────────────

@router.post("/usb-token")
@limiter.limit("10/day")
def generate_usb_token(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """
    Genereert een persoonlijk koppelbestand voor de USB-stick.
    Het bestand bevat een token dat 1 jaar geldig is — geen wachtwoord nodig op de stick.
    """
    from app.services.auth import create_access_token

    token = create_access_token(
        subject=current_user.id,
        expires_delta=timedelta(days=365),
    )

    api_url = str(request.base_url).rstrip("/")
    naam    = current_user.display_name or current_user.email.split("@")[0]
    datum   = datetime.now(timezone.utc)
    geldig  = datum + timedelta(days=365)

    inhoud = (
        f"# Bewaardvoorjou — Koppelbestand voor USB-stick\n"
        f"# ================================================\n"
        f"#\n"
        f"# Naam:      {naam}\n"
        f"# Aangemaakt: {datum.strftime('%d-%m-%Y')}\n"
        f"# Geldig tot: {geldig.strftime('%d-%m-%Y')}\n"
        f"#\n"
        f"# Zet dit bestand op uw USB-stick.\n"
        f"# De stick werkt dan zonder wachtwoord.\n"
        f"#\n"
        f"# Kwijt? Genereer een nieuw bestand via bewaardvoorjou.nl/instellingen\n"
        f"\n"
        f"TOKEN:    {token}\n"
        f"WEBSITE:  {api_url}\n"
    )

    logger.info(f"USB koppeltoken aangemaakt voor {current_user.email}")

    return StreamingResponse(
        iter([inhoud.encode("utf-8")]),
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="koppelbestand.txt"'},
    )


# ─── Endpoint ────────────────────────────────────────────────────────────────

@router.get("/backup")
@limiter.limit("10/hour")
def download_backup(
    request: Request,
    type: Literal["quick", "full"] = Query(default="quick"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """
    Gebruiker downloadt zijn eigen backup-ZIP direct in de browser.
    type=quick  — audio + transcripties, snel (~30 sec)
    type=full   — volledige USB-kopie met PDF (~2 min), max 3/dag
    """
    journey = (
        db.query(Journey)
        .filter(Journey.user_id == current_user.id)
        .first()
    )
    if not journey:
        raise HTTPException(status_code=404, detail="Geen journey gevonden")

    naam      = current_user.display_name or current_user.email.split("@")[0]
    safe_naam = _safe(naam)
    datum     = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    logger.info(f"Backup {type} aangevraagd door {current_user.email}")

    if type == "quick":
        buf      = _build_quick_zip(journey, current_user, db)
        filename = f"backup_{safe_naam}_{datum}.zip"
    else:
        buf      = _build_full_zip(journey, current_user, db)
        filename = f"eindversie_{safe_naam}_{datum}.zip"

    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
