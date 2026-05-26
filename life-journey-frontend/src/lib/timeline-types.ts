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

export interface MediaAssetInfo {
  id: string;
  modality: string;
  filename: string;
  duration_seconds: number;
  recorded_at: string | null;
  url: string | null;
}

export interface TimelineChapterDetail {
  chapter: TimelineChapter;
  phase: PhaseMetadata;
  prompt_hint: string;
  media_assets: MediaAssetInfo[];
  transcripts_preview: string | null;
}

/**
 * Phase colors for consistent styling
 */
export const PHASE_COLORS: Record<LifePhase, { bg: string; text: string; border: string }> = {
  intro:  { bg: "bg-white",       text: "text-[#FF8C42]", border: "border-[#E6E2DD]" },
  youth:  { bg: "bg-[#FAF7F2]",  text: "text-[#FF8C42]", border: "border-[#E6E2DD]" },
  love:   { bg: "bg-white",       text: "text-[#FF8C42]", border: "border-[#E6E2DD]" },
  work:   { bg: "bg-[#FAF7F2]",  text: "text-[#FF8C42]", border: "border-[#E6E2DD]" },
  future: { bg: "bg-white",       text: "text-[#FF8C42]", border: "border-[#E6E2DD]" },
  bonus:  { bg: "bg-[#FAF7F2]",  text: "text-[#FF8C42]", border: "border-[#E6E2DD]" },
  deep:   { bg: "bg-white",       text: "text-[#FF8C42]", border: "border-[#E6E2DD]" },
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
