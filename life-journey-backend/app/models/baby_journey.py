"""
BewaardVoorBaby — database modellen.

BabyJourney:  metadata van het babyboek (naam, geboortedata, rol, partner, opa/oma).
BabyMilestone: lichtgewicht markeringen (eerste glimlach, eerste stapje, etc.)
              die elk een e-mail-trigger en optioneel een diep interview starten.
"""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Float,
    ForeignKey, Integer, JSON, String, Text,
)
from sqlalchemy.orm import relationship

from app.models.base import Base


def _uuid() -> str:
    return str(uuid4())


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Enum-waarden voor narrator_role (opgeslagen als string)
# ---------------------------------------------------------------------------
NARRATOR_ROLE_MOEDER  = "MOEDER"
NARRATOR_ROLE_PARTNER = "PARTNER"
NARRATOR_ROLE_SAMEN   = "SAMEN"

# ---------------------------------------------------------------------------
# Alle milestone-types in vaste volgorde voor de tijdlijn
# ---------------------------------------------------------------------------
MILESTONE_TYPES_ORDERED = [
    # Geboorte
    "eerste_bad_thuis",
    # 0–3 maanden
    "eerste_glimlach",
    "eerste_lach",
    "eerste_doorslapen",
    # 3–6 maanden
    "eerste_omrollen_buik_naar_rug",
    "eerste_omrollen_rug_naar_buik",
    "eerste_hapjes",
    "eerste_tandje",
    # 6–9 maanden
    "eerste_zitten",
    "eerste_kruipen",
    "eerste_zwaaien",
    "eerste_klappen",
    "eerste_kusje",
    # 9–12 maanden
    "eerste_staan",
    "eerste_woordje_mama",
    "eerste_woordje_papa",
    "eerste_stapjes",
    # Variabel
    "eerste_knipbeurt",
    "eerste_zwemmen",
    "eerste_fiets",
    "eerste_nachtje_logeren",
    "eerste_vakantie",
    "eerste_feestdag_kerst",
    "eerste_sinterklaas",
    "eerste_crèche",
    "eerste_blowout",
    "eerste_lopen",
    "eerste_verjaardag",
    "eerste_cake_smash",
]

# Human-readable labels (gebruikt in e-mails + dashboard)
MILESTONE_LABELS: dict[str, str] = {
    "eerste_bad_thuis":          "Eerste bad thuis",
    "eerste_glimlach":           "Eerste sociale glimlach",
    "eerste_lach":               "Eerste schaterlach",
    "eerste_doorslapen":         "Eerste keer doorslapen",
    "eerste_omrollen_buik_naar_rug": "Eerste omrollen (buik → rug)",
    "eerste_omrollen_rug_naar_buik": "Eerste omrollen (rug → buik)",
    "eerste_hapjes":             "Eerste hapjes vaste voeding",
    "eerste_tandje":             "Eerste tandje",
    "eerste_zitten":             "Zelfstandig zitten",
    "eerste_kruipen":            "Eerste kruipen / tijgeren",
    "eerste_zwaaien":            "Eerste keer zwaaien",
    "eerste_klappen":            "Eerste keer klappen",
    "eerste_kusje":              "Eerste kusje",
    "eerste_staan":              "Eerste keer zelfstandig staan",
    "eerste_woordje_mama":       "Eerste woordje 'mama'",
    "eerste_woordje_papa":       "Eerste woordje 'papa'",
    "eerste_stapjes":            "Eerste stapjes",
    "eerste_knipbeurt":          "Eerste knipbeurt",
    "eerste_zwemmen":            "Eerste keer zwemmen",
    "eerste_fiets":              "Eerste fietstocht / loopfiets",
    "eerste_nachtje_logeren":    "Eerste nachtje logeren",
    "eerste_vakantie":           "Eerste vakantie",
    "eerste_feestdag_kerst":     "Eerste Kerstmis",
    "eerste_sinterklaas":        "Eerste Sinterklaas",
    "eerste_crèche":             "Eerste dag crèche / opvang",
    "eerste_blowout":            "De legendarische blowout",
    "eerste_lopen":              "Zelfstandig lopen",
    "eerste_verjaardag":         "Eerste verjaardag",
    "eerste_cake_smash":         "Cake smash",
}


class BabyJourney(Base):
    """
    Babyboek-metadata gekoppeld aan een bestaande Journey.
    De Journey bevat de hoofdstukken (audio, transcripties, highlights).
    BabyJourney voegt de baby-specifieke context toe.
    """
    id         = Column(String, primary_key=True, default=_uuid)
    journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"),
                        nullable=False, unique=True, index=True)
    user_id    = Column(String, ForeignKey("user.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    order_id   = Column(String, ForeignKey("order.id", ondelete="SET NULL"),
                        nullable=True, index=True)

    # Baby-profiel
    baby_name          = Column(String(100), nullable=False)
    baby_birth_date    = Column(Date, nullable=True)          # Null = nog niet geboren
    birth_time_str     = Column(String(10), nullable=True)    # "14:32"
    birth_weight_grams = Column(Integer, nullable=True)
    birth_length_cm    = Column(Float, nullable=True)
    first_outfit_photo_url = Column(String(512), nullable=True)

    # Vertellerrol
    narrator_role = Column(String(16), nullable=False, default=NARRATOR_ROLE_SAMEN)

    # Partner
    partner_email    = Column(String(255), nullable=True)
    partner_user_id  = Column(String, ForeignKey("user.id", ondelete="SET NULL"),
                              nullable=True, index=True)
    partner_joined_at = Column(DateTime, nullable=True)

    # Grootouders (JSON: [{name, email, digest_active}])
    grandparent_emails = Column(JSON, nullable=False, default=list)

    # Fotoboek-voucher (ingebakken bij BABY_GIFT)
    photobook_voucher_active    = Column(Boolean, nullable=False, default=True)
    photobook_voucher_claimed   = Column(Boolean, nullable=False, default=False)
    photobook_voucher_claimed_at = Column(DateTime, nullable=True)

    # Engagement-logica
    # Na maand 3 schakelen we van wekelijks naar maandelijks
    pivot_to_monthly        = Column(Boolean, nullable=False, default=False)
    pivot_triggered_at      = Column(DateTime, nullable=True)
    last_weekly_email_at    = Column(DateTime, nullable=True)
    last_grandparent_digest_at = Column(DateTime, nullable=True)

    # Tijdstempels
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now)

    # Relationships
    milestones = relationship(
        "BabyMilestone",
        backref="parent_baby_journey",
        lazy="select",
        cascade="all, delete-orphan",
        order_by="BabyMilestone.marked_at",
    )


class BabyMilestone(Base):
    """
    Een gemarkeerd mijlpaalmoment in het babyboek.
    Lichtgewicht: datum + optionele foto + optionele notitie.
    Het markeren triggert een mail met een verdiepende vraag.
    """
    id              = Column(String, primary_key=True, default=_uuid)
    baby_journey_id = Column(String, ForeignKey("babyjourney.id", ondelete="CASCADE"),
                             nullable=False, index=True)

    milestone_type  = Column(String(64), nullable=False)   # zie MILESTONE_TYPES_ORDERED
    milestone_date  = Column(Date, nullable=True)          # wanneer het echt gebeurde
    notes           = Column(Text, nullable=True)
    photo_url       = Column(String(512), nullable=True)

    # Tracking
    chapter_id_triggered = Column(String(64), nullable=True)  # welk chapter dit opende
    email_triggered      = Column(Boolean, nullable=False, default=False)

    marked_at  = Column(DateTime, default=_utc_now, nullable=False)
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now)
