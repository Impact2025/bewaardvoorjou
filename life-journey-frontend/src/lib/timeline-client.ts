/**
 * Timeline API client.
 */

import { apiFetch } from "./api-client";
import type {
  PhaseMetadata,
  TimelineChapterDetail,
  TimelineResponse,
} from "./timeline-types";
import type { ChapterId } from "./types";

/**
 * Get all available life phases with metadata.
 */
export async function getPhases(token: string): Promise<PhaseMetadata[]> {
  return apiFetch<PhaseMetadata[]>("/timeline/phases", { method: "GET" }, { token });
}

/**
 * Get complete timeline data for a journey.
 */
export async function getTimeline(
  token: string,
  journeyId: string,
): Promise<TimelineResponse> {
  return apiFetch<TimelineResponse>(
    `/timeline/${journeyId}`,
    { method: "GET" },
    { token },
  );
}

/**
 * Get detailed information for a specific chapter in the timeline.
 */
export async function getChapterDetail(
  token: string,
  journeyId: string,
  chapterId: ChapterId,
): Promise<TimelineChapterDetail> {
  return apiFetch<TimelineChapterDetail>(
    `/timeline/${journeyId}/chapter/${chapterId}`,
    { method: "GET" },
    { token },
  );
}
