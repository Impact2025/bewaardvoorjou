"""Chapter ID to Dutch name mapping for emails."""

from __future__ import annotations

# Map chapter IDs to Dutch display names
CHAPTER_NAMES: dict[str, str] = {
    # Fase 1: Voorbereiding & Introductie
    "intro-reflection": "Kernwoorden van je leven",
    "intro-intention": "Je intentie",
    "intro-uniqueness": "Wat maakt jou uniek",

    # Fase 2: De Vroege Jaren & Jeugd
    "youth-favorite-place": "Je favoriete plek",
    "youth-sounds": "Het geluid van toen",
    "youth-hero": "Je held",

    # Fase 3: Liefde, Relaties & Vriendschappen
    "love-connection": "Het moment van verbinding",
    "love-lessons": "Lessen over liefde",
    "love-symbol": "Een symbolisch voorwerp",

    # Fase 4: Werk, Carrière & Passies
    "work-dream-job": "Droom versus realiteit",
    "work-passion": "Je grootste passie",
    "work-challenge": "Een overwonnen uitdaging",

    # Fase 5: Levenslessen & Toekomstdromen
    "future-message": "Een boodschap voor later",
    "future-dream": "Een onvervulde droom",
    "future-gratitude": "Dankbaarheid",

    # Bonus: Aanvullende Vragen
    "bonus-funny": "Het grappigste moment",
    "bonus-relive": "Een dag opnieuw",
    "bonus-culture": "Culturele invloeden",

    # De Verborgen Dimensies
    "deep-daily-ritual": "Je essentiële ritueel",
    "deep-favorite-time": "Je favoriete uur",
    "deep-ugly-object": "Het lelijke object",
    "deep-near-death": "Bijna-doodervaring of bizar toeval",
    "deep-misconception": "De misvatting over jou",
    "deep-recurring-dream": "Je terugkerende droom",
    "deep-life-chapters": "Hoofdstukken van je leven",
    "deep-intuition-choice": "Intuïtie boven logica",
    "deep-money-impact": "De meest impactvolle aankoop",
    "deep-shadow-side": "Je schaduwzijde",
    "deep-life-meal": "De maaltijd van je leven",
    "deep-statue": "Je eigen standbeeld",
}


def get_chapter_name(chapter_id: str) -> str:
    """
    Get Dutch chapter name by ID.

    Args:
        chapter_id: Chapter identifier (e.g., "intro-reflection")

    Returns:
        Dutch chapter name, or the chapter_id if not found
    """
    return CHAPTER_NAMES.get(chapter_id, chapter_id)
