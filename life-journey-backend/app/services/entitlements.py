"""
Toegangscontrole voor opnames op basis van pakket en proefperiode.

De gratis proefperiode en hoofdstuk-limiet worden bij registratie op de
gebruiker gezet (zie ``app/services/auth.py``), maar moeten ook daadwerkelijk
worden afgedwongen op het moment dat iemand een nieuwe opname wil toevoegen.
Dit is precies wat we op de prijspagina beloven: na 30 dagen blijven verhalen
leesbaar en deelbaar, maar voor nieuwe opnames is een betaald pakket nodig.
"""

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.media import MediaAsset
from app.models.user import User

# Pakketten met onbeperkte toegang (geen proefperiode- of hoofdstuk-limiet).
PAID_TIERS: frozenset[str] = frozenset(
    {"VERHAAL", "ERFGOED", "NALATENSCHAP", "VOOR_ALTIJD"}
)


def _utc_now() -> datetime:
    """Huidige tijd als timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    """Maak een (mogelijk naïeve) datetime timezone-aware in UTC."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def assert_can_record(
    db: Session,
    user: User,
    journey_id: str,
    chapter_id: str,
) -> None:
    """
    Controleer of de gebruiker een nieuwe opname mag toevoegen.

    Betaalde pakketten hebben onbeperkt toegang. Gratis accounts mogen opnemen
    zolang (a) hun proefperiode niet is verlopen en (b) ze binnen hun
    hoofdstuk-limiet blijven. Bij overschrijding volgt een 402-fout met een
    duidelijke Nederlandse boodschap, zodat de frontend kan doorsturen naar de
    prijspagina.

    Args:
        db: Database-sessie.
        user: De ingelogde gebruiker.
        journey_id: Journey waarin de opname wordt geplaatst.
        chapter_id: Hoofdstuk waarin de opname wordt geplaatst.

    Raises:
        HTTPException: 402 wanneer de proefperiode is verlopen of de
            hoofdstuk-limiet is bereikt.
    """
    if user.package_tier in PAID_TIERS:
        return

    # 1) Proefperiode verlopen? (legacy-accounts zonder einddatum laten we vrij)
    if user.trial_expires_at is not None:
        if _utc_now() > _as_utc(user.trial_expires_at):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=(
                    "Je gratis proefperiode van 30 dagen is verlopen. Je verhalen "
                    "blijven leesbaar en deelbaar, maar voor nieuwe opnames kies je "
                    "een pakket."
                ),
            )

    # 2) Hoofdstuk-limiet bereikt? (NULL = onbeperkt)
    if user.max_chapters is not None:
        used_chapters = {
            row[0]
            for row in (
                db.query(MediaAsset.chapter_id)
                .filter(MediaAsset.journey_id == journey_id)
                .distinct()
                .all()
            )
        }
        # Doorgaan in een al gestart hoofdstuk mag altijd; alleen een nieuw
        # hoofdstuk openen telt mee voor de limiet.
        if chapter_id not in used_chapters and len(used_chapters) >= user.max_chapters:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=(
                    f"In de gratis versie leg je {user.max_chapters} hoofdstukken "
                    "vast. Wil je je hele levensverhaal bewaren? Kies dan een pakket."
                ),
            )
