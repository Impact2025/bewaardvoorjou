/**
 * Onboarding 2.0 Types
 *
 * Comprehensive wizard-style onboarding with progress persistence.
 */

// =============================================================================
// Step Types
// =============================================================================

export type OnboardingStep =
   | "welcome"
   | "personal_info"
   | "first_memory"
   | "story_purpose"
   | "recording_preferences"
   | "privacy_settings"
   | "chapter_selection"
   | "accessibility"
   | "complete";

export const STEP_ORDER: OnboardingStep[] = [
   "welcome",
   "personal_info",
   "first_memory",
   "story_purpose",
   "recording_preferences",
   "privacy_settings",
   "chapter_selection",
   "accessibility",
   "complete",
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
   welcome: "Welkom",
   personal_info: "Over jou",
   first_memory: "Eerste herinnering",
   story_purpose: "Je doel",
   recording_preferences: "Opname voorkeuren",
   privacy_settings: "Privacy",
   chapter_selection: "Hoofdstukken",
   accessibility: "Toegankelijkheid",
   complete: "Gereed",
};

// =============================================================================
// Data Types
// =============================================================================

export interface PersonalInfoData {
  display_name: string;
  birth_year?: number;
  family_photo?: string; // URL or base64 of uploaded family photo
}

export type StoryPurpose = "legacy" | "healing" | "preservation" | "gift" | "other";

export interface StoryPurposeData {
  purpose: StoryPurpose;
  recipients: string[];
  custom_purpose?: string;
}

export const PURPOSE_LABELS: Record<StoryPurpose, { label: string; description: string }> = {
  legacy: {
    label: "Nalatenschap",
    description: "Voor toekomstige generaties",
  },
  healing: {
    label: "Verwerking",
    description: "Om gebeurtenissen te verwerken",
  },
  preservation: {
    label: "Bewaring",
    description: "Om herinneringen vast te leggen",
  },
  gift: {
    label: "Cadeau",
    description: "Als geschenk voor iemand",
  },
  other: {
    label: "Anders",
    description: "Een andere reden",
  },
};

export type RecordingMethod = "video" | "audio" | "text" | "mixed";
export type AIAssistanceLevel = "full" | "minimal" | "none";

export interface RecordingPrefsData {
  preferred_method: RecordingMethod;
  session_reminder: boolean;
  ai_assistance: AIAssistanceLevel;
}

export const RECORDING_METHOD_LABELS: Record<RecordingMethod, { label: string; description: string; icon: string }> = {
  video: {
    label: "Video",
    description: "Neem jezelf op met camera",
    icon: "🎥",
  },
  audio: {
    label: "Audio",
    description: "Spreek je verhaal in",
    icon: "🎤",
  },
  text: {
    label: "Tekst",
    description: "Schrijf je gedachten uit",
    icon: "✍️",
  },
  mixed: {
    label: "Gemengd",
    description: "Combineer meerdere methoden",
    icon: "🎨",
  },
};

export const AI_ASSISTANCE_LABELS: Record<AIAssistanceLevel, { label: string; description: string }> = {
  full: {
    label: "Volledige begeleiding",
    description: "AI stelt vervolgvragen en helpt je dieper nadenken",
  },
  minimal: {
    label: "Minimale begeleiding",
    description: "AI geeft alleen startvragen per hoofdstuk",
  },
  none: {
    label: "Geen begeleiding",
    description: "Je vertelt je verhaal op je eigen manier",
  },
};

export type PrivacyLevel = "private" | "trusted" | "legacy";

export interface PrivacySettingsData {
  privacy_level: PrivacyLevel;
  auto_backup: boolean;
  analytics_consent: boolean;
}

export const PRIVACY_LEVEL_LABELS: Record<PrivacyLevel, { label: string; description: string }> = {
  private: {
    label: "Privé",
    description: "Alleen jij hebt toegang tot je verhaal",
  },
  trusted: {
    label: "Vertrouwd",
    description: "Deel met geselecteerde familieleden",
  },
  legacy: {
    label: "Nalatenschap",
    description: "Beschikbaar na bepaalde tijd of gebeurtenis",
  },
};

export type LifePhase = "intro" | "youth" | "love" | "work" | "future" | "bonus" | "deep";

export interface ChapterSelectionData {
  selected_phases: LifePhase[];
  starting_chapter?: string;
}

export const PHASE_INFO: Record<LifePhase, { label: string; description: string; chapterCount: number }> = {
  intro: {
    label: "Introductie",
    description: "Kernwoorden, intentie en uniciteit",
    chapterCount: 3,
  },
  youth: {
    label: "Jeugd",
    description: "Favoriete plek, geluiden en held",
    chapterCount: 3,
  },
  love: {
    label: "Liefde & Relaties",
    description: "Verbinding, lessen en symbolen",
    chapterCount: 3,
  },
  work: {
    label: "Werk & Passies",
    description: "Dromen, passie en uitdagingen",
    chapterCount: 3,
  },
  future: {
    label: "Toekomst",
    description: "Boodschap, dromen en dankbaarheid",
    chapterCount: 3,
  },
  bonus: {
    label: "Bonus",
    description: "Grappige momenten en cultuur",
    chapterCount: 3,
  },
  deep: {
    label: "Verborgen Dimensies",
    description: "Diepere reflecties en levenslessen",
    chapterCount: 12,
  },
};

export interface AccessibilityPrefs {
  captions: boolean;
  high_contrast: boolean;
  large_text: boolean;
}

// =============================================================================
// Progress Types
// =============================================================================

export interface OnboardingProgress {
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  personal_info?: PersonalInfoData;
  story_purpose?: StoryPurposeData;
  recording_prefs?: RecordingPrefsData;
  privacy_settings?: PrivacySettingsData;
  chapter_selection?: ChapterSelectionData;
  accessibility?: AccessibilityPrefs;
  started_at?: string;
  last_updated_at?: string;
}

// =============================================================================
// API Types
// =============================================================================

export interface SaveProgressRequest {
  current_step: OnboardingStep;
  personal_info?: PersonalInfoData;
  story_purpose?: StoryPurposeData;
  recording_prefs?: RecordingPrefsData;
  privacy_settings?: PrivacySettingsData;
  chapter_selection?: ChapterSelectionData;
  accessibility?: AccessibilityPrefs;
}

export interface SaveProgressResponse {
  success: boolean;
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  message: string;
}

export interface GetProgressResponse {
  has_progress: boolean;
  progress?: OnboardingProgress;
}

export interface CompleteOnboardingRequest {
  personal_info: PersonalInfoData;
  story_purpose: StoryPurposeData;
  recording_prefs: RecordingPrefsData;
  privacy_settings: PrivacySettingsData;
  chapter_selection: ChapterSelectionData;
  accessibility: AccessibilityPrefs;
}

export interface CompleteOnboardingResponse {
  user_id: string;
  journey_id: string;
  display_name: string;
  starting_chapter?: string;
  message: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

export function getStepIndex(step: OnboardingStep): number {
  return STEP_ORDER.indexOf(step);
}

export function getNextStep(current: OnboardingStep): OnboardingStep | null {
  const index = getStepIndex(current);
  if (index < STEP_ORDER.length - 1) {
    return STEP_ORDER[index + 1];
  }
  return null;
}

export function getPrevStep(current: OnboardingStep): OnboardingStep | null {
  const index = getStepIndex(current);
  if (index > 0) {
    return STEP_ORDER[index - 1];
  }
  return null;
}

export function getProgressPercentage(step: OnboardingStep): number {
  const index = getStepIndex(step);
  return Math.round((index / (STEP_ORDER.length - 1)) * 100);
}
