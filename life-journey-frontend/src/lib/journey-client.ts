import { apiFetch } from "@/lib/api-client";
import type {
  ChapterId,
  Journey,
  MediaAsset,
  PromptRun,
  TranscriptSegment,
  Highlight,
  ShareGrant,
  LegacyPolicy,
  ConsentLogEntry,
  UserProfile,
} from "@/lib/types";

interface JourneyDetailDto {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  progress: Record<ChapterId, number>;
  active_chapters: ChapterId[];
  media: Array<{
    id: string;
    chapter_id: ChapterId;
    modality: "audio" | "video";
    filename: string;
    duration_seconds: number;
    size_bytes: number;
    storage_state: "pending" | "processing" | "ready" | "archived";
    recorded_at: string;
  }>;
  prompt_runs: Array<{
    id: string;
    chapter_id: ChapterId;
    prompt: string;
    follow_ups: string[];
    created_at: string;
    consent_to_deepen: boolean;
  }>;
  transcripts: Array<{
    id: string;
    media_asset_id: string;
    start_ms: number;
    end_ms: number;
    text: string;
    sentiment: string | null;
    emotion_hint: string | null;
  }>;
  highlights: Array<{
    id: string;
    media_asset_id?: string;
    chapter_id: ChapterId;
    label: "laugh" | "insight" | "love" | "wisdom";
    start_ms: number;
    end_ms: number;
    created_by: "ai" | "user";
  }>;
  share_grants: Array<{
    id: string;
    issued_to: string;
    email: string;
    granted_by: string;
    chapter_ids: ChapterId[];
    expires_at: string | null;
    status: "active" | "revoked" | "pending";
  }>;
  legacy_policy: {
    mode: "manual" | "dead-mans-switch" | "time-capsule";
    unlock_date: string | null;
    grace_period_days: number | null;
    trustees: Array<{
      name: string;
      email: string;
      status: "pending" | "verified";
    }>;
  } | null;
  consent_log: Array<{
    id: string;
    type: "recording" | "ai" | "sharing" | "legacy";
    granted_at: string;
    revoked_at: string | null;
    scope: string;
  }>;
  chapter_statuses: Record<string, {
    status: "locked" | "available" | "completed";
    mediaCount: number;
    isUnlocked: boolean;
  }>;
  journey_progress: {
    totalChapters: number;
    completedChapters: number;
    availableChapters: number;
    percentComplete: number;
    nextAvailableChapter?: ChapterId;
  };
  owner: {
    id: string;
    display_name: string;
    email: string;
    locale: string;
    country: string;
    birth_year: number | null;
    accessibility: {
      captions: boolean;
      high_contrast: boolean;
      large_text: boolean;
    };
    privacy_level: string;
    target_recipients: string[];
    deadlines: Array<{
      label: string;
      due_date: string;
    }>;
  };
}

const defaultChapterOrder: ChapterId[] = [
  "intro-reflection",
  "intro-intention",
  "intro-uniqueness",
  "youth-favorite-place",
  "youth-sounds",
  "youth-hero",
  "love-connection",
  "love-lessons",
  "love-symbol",
  "work-dream-job",
  "work-passion",
  "work-challenge",
  "future-message",
  "future-dream",
  "future-gratitude",
  "bonus-funny",
  "bonus-relive",
  "bonus-culture",
];

function mapMediaAsset(input: JourneyDetailDto["media"][number]): MediaAsset {
  return {
    id: input.id,
    chapterId: input.chapter_id,
    type: input.modality as MediaAsset["type"],
    filename: input.filename,
    durationSeconds: input.duration_seconds,
    sizeBytes: input.size_bytes,
    storageState: input.storage_state,
    recordedAt: input.recorded_at,
  };
}

function mapPromptRun(input: JourneyDetailDto["prompt_runs"][number]): PromptRun {
  return {
    id: input.id,
    chapterId: input.chapter_id,
    prompt: input.prompt,
    followUps: input.follow_ups,
    createdAt: input.created_at,
    consentToDeepen: input.consent_to_deepen,
  };
}

function mapTranscript(input: JourneyDetailDto["transcripts"][number]): TranscriptSegment {
  return {
    id: input.id,
    mediaAssetId: input.media_asset_id,
    startMs: input.start_ms,
    endMs: input.end_ms,
    text: input.text,
    sentiment: (input.sentiment as TranscriptSegment["sentiment"]) ?? undefined,
    emotionHint: (input.emotion_hint as TranscriptSegment["emotionHint"]) ?? undefined,
  };
}

function mapHighlight(input: JourneyDetailDto["highlights"][number]): Highlight {
  return {
    id: input.id,
    chapterId: input.chapter_id,
    label: input.label,
    startMs: input.start_ms,
    endMs: input.end_ms,
    createdBy: input.created_by,
    mediaAssetId: (input as unknown as { media_asset_id?: string }).media_asset_id ?? "",
  };
}

function mapShareGrant(input: JourneyDetailDto["share_grants"][number]): ShareGrant {
  return {
    id: input.id,
    issuedTo: input.issued_to,
    email: input.email,
    grantedBy: input.granted_by,
    chapterIds: input.chapter_ids,
    expiresAt: input.expires_at ?? undefined,
    status: input.status,
  };
}

function mapLegacyPolicy(input: JourneyDetailDto["legacy_policy"]): LegacyPolicy | undefined {
  if (!input) {
    return undefined;
  }
  
  return {
    mode: input.mode,
    unlockDate: input.unlock_date ?? undefined,
    gracePeriodDays: input.grace_period_days ?? undefined,
    trustees: input.trustees.map((trustee) => ({
      name: trustee.name,
      email: trustee.email,
      status: trustee.status,
    })),
  };
}

function mapConsentLog(input: JourneyDetailDto["consent_log"][number]): ConsentLogEntry {
  return {
    id: input.id,
    type: input.type,
    grantedAt: input.granted_at,
    revokedAt: input.revoked_at ?? undefined,
    scope: input.scope,
  };
}

function mapUserProfile(input: JourneyDetailDto["owner"]): UserProfile {
  return {
    id: input.id,
    displayName: input.display_name,
    email: input.email,
    locale: (input.locale as UserProfile["locale"]) ?? "nl",
    country: input.country,
    birthYear: input.birth_year ?? undefined,
    accessibility: {
      captions: input.accessibility.captions,
      highContrast: input.accessibility.high_contrast,
      largeText: input.accessibility.large_text,
    },
    privacyLevel: (input.privacy_level as UserProfile["privacyLevel"]) ?? "private",
    targetRecipients: input.target_recipients,
    deadlines: (input.deadlines ?? []).map((deadline) => ({
      label: deadline.label,
      dueDate: deadline.due_date,
    })),
  };
}

function pickActiveChapter(progress: Record<ChapterId, number>): ChapterId {
  const sorted = [...defaultChapterOrder].sort((a, b) => (progress[b] ?? 0) - (progress[a] ?? 0));
  return sorted[0];
}

export interface JourneyData {
  journey: Journey;
  owner: UserProfile;
}

export async function fetchJourneyDetail(journeyId: string, token: string): Promise<JourneyData> {
  const response = await apiFetch<JourneyDetailDto>(`/journeys/${journeyId}`, undefined, {
    token,
  });

  const owner = mapUserProfile(response.owner);
  const legacyPolicy = response.legacy_policy ? mapLegacyPolicy(response.legacy_policy) : undefined;

  const media = response.media.map(mapMediaAsset);
  const activeChapters = response.active_chapters;
  const activeChapterId = activeChapters[0] ?? pickActiveChapter(response.progress);
  const journey: Journey = {
    id: response.id,
    title: response.title,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    activeChapterId,
    progress: response.progress,
    activeChapters,
    media,
    transcripts: response.transcripts.map(mapTranscript),
    highlights: response.highlights.map(mapHighlight),
    promptRuns: response.prompt_runs.map(mapPromptRun),
    shareGrants: response.share_grants.map(mapShareGrant),
    legacyPolicy,
    consentLog: response.consent_log.map(mapConsentLog),
    chapterStatuses: response.chapter_statuses || {},
    journeyProgress: response.journey_progress ? {
      totalChapters: response.journey_progress.totalChapters,
      completedChapters: response.journey_progress.completedChapters,
      availableChapters: response.journey_progress.availableChapters,
      percentComplete: response.journey_progress.percentComplete,
      nextAvailableChapter: response.journey_progress.nextAvailableChapter,
    } : {
      totalChapters: 30,
      completedChapters: 0,
      availableChapters: 18,
      percentComplete: 0,
    },
  };

  return { journey, owner };
}

export async function updateActivatedChapters(
  journeyId: string,
  chapters: ChapterId[],
  token: string,
): Promise<ChapterId[]> {
  const response = await apiFetch<ChapterId[]>(
    `/journeys/${journeyId}/activate-chapters`,
    {
      method: "POST",
      body: JSON.stringify({ chapter_ids: chapters }),
    },
    { token },
  );
  return response;
}