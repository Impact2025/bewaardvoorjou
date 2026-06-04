export type ChapterId =
  // Fase 1: Intro
  | "intro-reflection"
  | "intro-intention"
  | "intro-uniqueness"
  // Fase 2: Wortels & Familie
  | "roots-first-memory"
  | "roots-father"
  | "roots-mother"
  | "roots-grandparents"
  | "roots-siblings"
  | "roots-home"
  | "roots-neighborhood"
  | "roots-faith"
  | "roots-finances"
  | "roots-hardship"
  // Fase 3: Jeugd & School
  | "youth-favorite-place"
  | "youth-sounds"
  | "youth-hero"
  | "youth-primary-school"
  | "youth-friends"
  | "youth-secondary-school"
  | "youth-history"
  | "youth-ambition"
  // Fase 4: Jong Volwassen
  | "work-dream-job"
  | "work-passion"
  | "work-challenge"
  | "young-adult-first-job"
  | "young-adult-independence"
  | "young-adult-first-home"
  | "young-adult-career-path"
  | "young-adult-pivotal-choice"
  | "young-adult-finances"
  | "young-adult-world-events"
  // Fase 5: Liefde & Gezin
  | "love-connection"
  | "love-lessons"
  | "love-symbol"
  | "family-partner-story"
  | "family-early-years"
  | "family-wedding"
  | "family-children"
  | "family-typical-week"
  | "family-hardship"
  | "family-pride"
  // Fase 6: Midden Leven & Verlies
  | "midlife-grief"
  | "midlife-aging"
  | "midlife-regret"
  | "midlife-resilience"
  | "midlife-parents-retrospect"
  | "midlife-formative-decade"
  | "midlife-social-change"
  | "midlife-faith-evolution"
  // Fase 7: Nu & Nalatenschap
  | "future-message"
  | "future-dream"
  | "future-gratitude"
  | "legacy-daily-joy"
  | "legacy-faith-now"
  | "legacy-remembered"
  | "legacy-verdict"
  | "legacy-unsaid"
  | "legacy-letter"
  // Optioneel
  | "bonus-funny"
  | "bonus-relive"
  | "bonus-culture"
  | "deep-daily-ritual"
  | "deep-favorite-time"
  | "deep-ugly-object"
  | "deep-near-death"
  | "deep-misconception"
  | "deep-recurring-dream"
  | "deep-life-chapters"
  | "deep-intuition-choice"
  | "deep-money-impact"
  | "deep-shadow-side"
  | "deep-life-meal"
  | "deep-statue"
  | "optional-childhood-game"
  | "optional-alter-ego"
  | "optional-superpower"
  | "optional-bucket-list"
  | "optional-final-chapter";

export interface ChapterDefinition {
  id: ChapterId;
  title: string;
  description: string;
  phase: "intro" | "roots" | "youth" | "young-adult" | "family" | "midlife" | "legacy" | "optional";
  phaseTitle: string;
  question: string;
  mood: "gentle" | "celebratory" | "reflective" | "playful";
  defaultModalities: Array<"text" | "audio" | "video">;
  mediaFocus: string;
}

export interface PromptRun {
  id: string;
  chapterId: ChapterId;
  prompt: string;
  followUps: string[];
  createdAt: string;
  consentToDeepen: boolean;
}

export interface MediaAsset {
  id: string;
  chapterId: ChapterId;
  type: "video" | "audio" | "text";
  filename: string;
  durationSeconds: number;
  resolution?: string;
  sizeBytes: number;
  previewUrl?: string;
  waveformUrl?: string;
  recordedAt: string;
  storageState: "pending" | "processing" | "ready" | "archived";
}

export interface TranscriptSegment {
  id: string;
  mediaAssetId: string;
  startMs: number;
  endMs: number;
  text: string;
  sentiment?: "positive" | "neutral" | "mixed" | "somber";
  emotionHint?: "joy" | "tears" | "contemplative" | "surprise";
}

export interface Highlight {
  id: string;
  mediaAssetId: string;
  chapterId: ChapterId;
  startMs: number;
  endMs: number;
  label: "laugh" | "insight" | "love" | "wisdom";
  createdBy: "ai" | "user";
}

export interface ShareGrant {
  id: string;
  issuedTo: string;
  email: string;
  grantedBy: string;
  chapterIds: ChapterId[];
  expiresAt?: string;
  status: "active" | "revoked" | "pending";
}

export interface LegacyPolicy {
  mode: "manual" | "dead-mans-switch" | "time-capsule";
  unlockDate?: string;
  trustees: Array<{
    name: string;
    email: string;
    status: "pending" | "verified";
  }>;
  gracePeriodDays?: number;
}

export interface ConsentLogEntry {
  id: string;
  type: "recording" | "ai" | "sharing" | "legacy";
  grantedAt: string;
  revokedAt?: string;
  scope: string;
}

export interface Memo {
  id: string;
  journeyId: string;
  chapterId?: ChapterId;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterStatus {
  status: "locked" | "available" | "completed";
  mediaCount: number;
  isUnlocked: boolean;
}

export interface JourneyProgress {
  totalChapters: number;
  completedChapters: number;
  availableChapters: number;
  percentComplete: number;
  nextAvailableChapter?: ChapterId;
  currentPhase?: ChapterDefinition["phase"];
  phaseProgress?: Partial<Record<ChapterDefinition["phase"], { total: number; completed: number }>>;
}

export interface Journey {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeChapterId?: ChapterId;
  progress: Record<ChapterId, number>;
  activeChapters: ChapterId[];
  media: MediaAsset[];
  transcripts: TranscriptSegment[];
  highlights: Highlight[];
  promptRuns: PromptRun[];
  shareGrants: ShareGrant[];
  legacyPolicy?: LegacyPolicy;
  consentLog: ConsentLogEntry[];
  chapterStatuses: Record<string, ChapterStatus>;
  journeyProgress: JourneyProgress;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  locale: "nl" | "en";
  country: string;
  birthYear?: number;
  avatarUrl?: string;
  accessibility: {
    captions: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
  privacyLevel: "private" | "trusted" | "legacy";
  targetRecipients: string[];
  deadlines?: {
    label: string;
    dueDate: string;
  }[];
}

export interface OfflineQueueItem {
  id: string;
  chapterId: ChapterId;
  fileName: string;
  sizeBytes: number;
  recordedAt: string;
  status: "pending" | "uploading" | "failed" | "synced";
}

export interface JourneyState {
  profile: UserProfile | null;
  journey: Journey | null;
  offlineQueue: OfflineQueueItem[];
  setProfile: (profile: UserProfile) => void;
  setJourney: (journey: Journey) => void;
  updateJourney: (journey: Partial<Journey>) => void;
  enqueueRecording: (item: OfflineQueueItem) => void;
  updateQueueItem: (id: string, patch: Partial<OfflineQueueItem>) => void;
  clearQueueItem: (id: string) => void;
}

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  country: string;
  locale: string;
  birthYear?: number | null;
  privacyLevel: string;
  isAdmin?: boolean;
  packageTier?: string;
  packageActivatedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  user: AuthUser;
  primaryJourneyId: string | null;
}
