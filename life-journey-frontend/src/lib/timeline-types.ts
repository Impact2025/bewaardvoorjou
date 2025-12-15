/**
 * Timeline types for the visual journey timeline.
 */

import type { ChapterId } from "./types";

export type LifePhase = "intro" | "youth" | "love" | "work" | "future" | "bonus" | "deep";

export interface PhaseMetadata {
  id: LifePhase;
  label: string;
  description: string;
  color: string;
  icon: string;
  order: number;
}

export interface TimelineChapter {
  id: ChapterId;
  label: string;
  phase: LifePhase;
  is_active: boolean;
  is_unlocked: boolean;
  progress: number;
  media_count: number;
  has_video: boolean;
  has_audio: boolean;
  has_text: boolean;
  last_recorded_at: string | null;
  duration_total_seconds: number;
}

export interface TimelinePhase {
  metadata: PhaseMetadata;
  chapters: TimelineChapter[];
  is_expanded: boolean;
  progress: number;
}

export interface TimelineResponse {
  journey_id: string;
  journey_title: string;
  phases: TimelinePhase[];
  total_chapters: number;
  completed_chapters: number;
  total_media: number;
  total_duration_seconds: number;
  last_activity_at: string | null;
}

export interface TimelineChapterDetail {
  chapter: TimelineChapter;
  phase: PhaseMetadata;
  prompt_hint: string;
  media_assets: Array<{
    id: string;
    modality: string;
    filename: string;
    duration_seconds: number;
    recorded_at: string | null;
  }>;
  transcripts_preview: string | null;
}

/**
 * Phase colors for consistent styling
 */
export const PHASE_COLORS: Record<LifePhase, { bg: string; text: string; border: string }> = {
  intro: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  youth: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
  },
  love: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-300",
  },
  work: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  future: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-300",
  },
  bonus: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-300",
  },
  deep: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-300",
  },
};

/**
 * Phase icons (Lucide icon names)
 */
export const PHASE_ICONS: Record<LifePhase, string> = {
  intro: "sparkles",
  youth: "sun",
  love: "heart",
  work: "briefcase",
  future: "star",
  bonus: "gift",
  deep: "eye",
};
