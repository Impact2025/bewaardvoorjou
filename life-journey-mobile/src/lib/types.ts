// Shared types between web and mobile - copied from web app
export type ChapterId =
  | "intro-reflection"
  | "intro-intention"
  | "intro-uniqueness"
  | "youth-favorite-place"
  | "youth-sounds"
  | "youth-hero"
  | "love-connection"
  | "love-lessons"
  | "love-symbol"
  | "work-dream-job"
  | "work-passion"
  | "work-challenge"
  | "future-message"
  | "future-dream"
  | "future-gratitude"
  | "bonus-funny"
  | "bonus-relive"
  | "bonus-culture"
  // De Verborgen Dimensies
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
  | "deep-statue";

export interface ChapterDefinition {
  id: ChapterId;
  title: string;
  description: string;
  phase: "intro" | "youth" | "love" | "work" | "future" | "bonus" | "deep";
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
  type: "video" | "audio";
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
  createdAt: string;
  updatedAt?: string | null;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  user: AuthUser;
  primaryJourneyId: string | null;
}
