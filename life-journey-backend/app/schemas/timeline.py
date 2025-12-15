"""
Timeline schemas for the visual journey timeline.

Provides structured data for rendering an interactive timeline view
that shows life phases, chapters, and progress.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import ChapterId


class LifePhase(str, Enum):
    """Major life phases that group related chapters."""
    intro = "intro"
    youth = "youth"
    love = "love"
    work = "work"
    future = "future"
    bonus = "bonus"
    deep = "deep"


class PhaseMetadata(BaseModel):
    """Metadata for a life phase."""
    id: LifePhase
    label: str
    description: str
    color: str
    icon: str
    order: int


# Static phase definitions
PHASE_METADATA: dict[LifePhase, PhaseMetadata] = {
    LifePhase.intro: PhaseMetadata(
        id=LifePhase.intro,
        label="Introductie",
        description="Wie ben je en wat maakt jou uniek?",
        color="#10B981",  # emerald-500
        icon="sparkles",
        order=0,
    ),
    LifePhase.youth: PhaseMetadata(
        id=LifePhase.youth,
        label="Jeugd",
        description="Herinneringen aan je kindertijd",
        color="#F59E0B",  # amber-500
        icon="sun",
        order=1,
    ),
    LifePhase.love: PhaseMetadata(
        id=LifePhase.love,
        label="Liefde & Relaties",
        description="Connecties die je leven hebben gevormd",
        color="#EC4899",  # pink-500
        icon="heart",
        order=2,
    ),
    LifePhase.work: PhaseMetadata(
        id=LifePhase.work,
        label="Werk & Passie",
        description="Je professionele reis en drijfveren",
        color="#3B82F6",  # blue-500
        icon="briefcase",
        order=3,
    ),
    LifePhase.future: PhaseMetadata(
        id=LifePhase.future,
        label="Toekomst & Wijsheid",
        description="Boodschappen voor de toekomst",
        color="#8B5CF6",  # violet-500
        icon="star",
        order=4,
    ),
    LifePhase.bonus: PhaseMetadata(
        id=LifePhase.bonus,
        label="Bonus",
        description="Extra verhalen en herinneringen",
        color="#14B8A6",  # teal-500
        icon="gift",
        order=5,
    ),
    LifePhase.deep: PhaseMetadata(
        id=LifePhase.deep,
        label="Verborgen Dimensies",
        description="Diepere reflecties en onverwachte vragen",
        color="#6366F1",  # indigo-500
        icon="eye",
        order=6,
    ),
}


# Map chapters to phases
CHAPTER_TO_PHASE: dict[ChapterId, LifePhase] = {
    # Intro
    ChapterId.intro_reflection: LifePhase.intro,
    ChapterId.intro_intention: LifePhase.intro,
    ChapterId.intro_uniqueness: LifePhase.intro,
    # Youth
    ChapterId.youth_favorite_place: LifePhase.youth,
    ChapterId.youth_sounds: LifePhase.youth,
    ChapterId.youth_hero: LifePhase.youth,
    # Love
    ChapterId.love_connection: LifePhase.love,
    ChapterId.love_lessons: LifePhase.love,
    ChapterId.love_symbol: LifePhase.love,
    # Work
    ChapterId.work_dream_job: LifePhase.work,
    ChapterId.work_passion: LifePhase.work,
    ChapterId.work_challenge: LifePhase.work,
    # Future
    ChapterId.future_message: LifePhase.future,
    ChapterId.future_dream: LifePhase.future,
    ChapterId.future_gratitude: LifePhase.future,
    # Bonus
    ChapterId.bonus_funny: LifePhase.bonus,
    ChapterId.bonus_relive: LifePhase.bonus,
    ChapterId.bonus_culture: LifePhase.bonus,
    # Deep
    ChapterId.deep_daily_ritual: LifePhase.deep,
    ChapterId.deep_favorite_time: LifePhase.deep,
    ChapterId.deep_ugly_object: LifePhase.deep,
    ChapterId.deep_near_death: LifePhase.deep,
    ChapterId.deep_misconception: LifePhase.deep,
    ChapterId.deep_recurring_dream: LifePhase.deep,
    ChapterId.deep_life_chapters: LifePhase.deep,
    ChapterId.deep_intuition_choice: LifePhase.deep,
    ChapterId.deep_money_impact: LifePhase.deep,
    ChapterId.deep_shadow_side: LifePhase.deep,
    ChapterId.deep_life_meal: LifePhase.deep,
    ChapterId.deep_statue: LifePhase.deep,
}


# Chapter display names (Dutch)
CHAPTER_LABELS: dict[ChapterId, str] = {
    ChapterId.intro_reflection: "Zelfreflectie",
    ChapterId.intro_intention: "Intentie",
    ChapterId.intro_uniqueness: "Uniciteit",
    ChapterId.youth_favorite_place: "Favoriete Plek",
    ChapterId.youth_sounds: "Geluiden",
    ChapterId.youth_hero: "Held",
    ChapterId.love_connection: "Connectie",
    ChapterId.love_lessons: "Lessen",
    ChapterId.love_symbol: "Symbool",
    ChapterId.work_dream_job: "Droombaan",
    ChapterId.work_passion: "Passie",
    ChapterId.work_challenge: "Uitdaging",
    ChapterId.future_message: "Boodschap",
    ChapterId.future_dream: "Droom",
    ChapterId.future_gratitude: "Dankbaarheid",
    ChapterId.bonus_funny: "Grappig Moment",
    ChapterId.bonus_relive: "Herbeleven",
    ChapterId.bonus_culture: "Cultuur",
    ChapterId.deep_daily_ritual: "Dagelijks Ritueel",
    ChapterId.deep_favorite_time: "Favoriete Tijd",
    ChapterId.deep_ugly_object: "Lelijk Voorwerp",
    ChapterId.deep_near_death: "Bijna-Dood",
    ChapterId.deep_misconception: "Misvatting",
    ChapterId.deep_recurring_dream: "Terugkerende Droom",
    ChapterId.deep_life_chapters: "Levenshoofdstukken",
    ChapterId.deep_intuition_choice: "Intuïtie Keuze",
    ChapterId.deep_money_impact: "Geld Impact",
    ChapterId.deep_shadow_side: "Schaduwkant",
    ChapterId.deep_life_meal: "Levensmaaltijd",
    ChapterId.deep_statue: "Standbeeld",
}


class TimelineChapter(BaseModel):
    """A chapter in the timeline with its current status."""
    id: ChapterId
    label: str
    phase: LifePhase
    is_active: bool
    is_unlocked: bool
    progress: float  # 0.0 to 1.0
    media_count: int
    has_video: bool
    has_audio: bool
    has_text: bool
    last_recorded_at: Optional[datetime] = None
    duration_total_seconds: int = 0


class TimelinePhase(BaseModel):
    """A phase in the timeline containing multiple chapters."""
    metadata: PhaseMetadata
    chapters: list[TimelineChapter]
    is_expanded: bool = True
    progress: float  # Average progress across chapters


class TimelineResponse(BaseModel):
    """Complete timeline data for a journey."""
    journey_id: str
    journey_title: str
    phases: list[TimelinePhase]
    total_chapters: int
    completed_chapters: int
    total_media: int
    total_duration_seconds: int
    last_activity_at: Optional[datetime] = None


class TimelineChapterDetail(BaseModel):
    """Detailed chapter info for timeline modal/detail view."""
    chapter: TimelineChapter
    phase: PhaseMetadata
    prompt_hint: str
    media_assets: list[dict]  # Simplified media info
    transcripts_preview: Optional[str] = None
