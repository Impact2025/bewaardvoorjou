import { apiFetch } from "./client";
import type { ChapterId, Journey, ChapterStatus } from "@/lib/types";

export interface ChapterProgressResponse {
  chapter_id: ChapterId;
  status: 'locked' | 'available' | 'completed';
  media_count: number;
  last_activity_at?: string;
  completion_percentage: number;
}

export interface UpdateChapterProgressRequest {
  progress: number;
  status?: 'locked' | 'available' | 'completed';
}

/**
 * Get chapter progress for a journey
 */
export async function getChapterProgress(
  journeyId: string,
  chapterId: ChapterId,
  token: string
): Promise<ChapterProgressResponse> {
  const response = await apiFetch<ChapterProgressResponse>(
    `/journeys/${journeyId}/chapters/${chapterId}/progress`,
    {
      method: 'GET',
    },
    { token }
  );

  return response;
}

/**
 * Get all chapters progress for a journey
 */
export async function getAllChaptersProgress(
  journeyId: string,
  token: string
): Promise<Record<ChapterId, ChapterProgressResponse>> {
  const response = await apiFetch<Record<ChapterId, ChapterProgressResponse>>(
    `/journeys/${journeyId}/chapters/progress`,
    {
      method: 'GET',
    },
    { token }
  );

  return response;
}

/**
 * Update chapter progress
 */
export async function updateChapterProgress(
  journeyId: string,
  chapterId: ChapterId,
  data: UpdateChapterProgressRequest,
  token: string
): Promise<ChapterProgressResponse> {
  const response = await apiFetch<ChapterProgressResponse>(
    `/journeys/${journeyId}/chapters/${chapterId}/progress`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    { token }
  );

  return response;
}

/**
 * Mark chapter as completed
 */
export async function markChapterCompleted(
  journeyId: string,
  chapterId: ChapterId,
  token: string
): Promise<ChapterProgressResponse> {
  return updateChapterProgress(
    journeyId,
    chapterId,
    {
      progress: 100,
      status: 'completed',
    },
    token
  );
}

/**
 * Unlock next chapter
 */
export async function unlockChapter(
  journeyId: string,
  chapterId: ChapterId,
  token: string
): Promise<ChapterProgressResponse> {
  return updateChapterProgress(
    journeyId,
    chapterId,
    {
      status: 'available',
    },
    token
  );
}

/**
 * Get journey with chapters
 */
export async function getJourney(
  journeyId: string,
  token: string
): Promise<Journey> {
  const response = await apiFetch<Journey>(
    `/journeys/${journeyId}`,
    {
      method: 'GET',
    },
    { token }
  );

  return response;
}

/**
 * Create new journey
 */
export async function createJourney(
  title: string,
  token: string
): Promise<Journey> {
  const response = await apiFetch<Journey>(
    `/journeys`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    },
    { token }
  );

  return response;
}

/**
 * Get user's journeys
 */
export async function getUserJourneys(
  token: string
): Promise<Journey[]> {
  const response = await apiFetch<Journey[]>(
    `/journeys`,
    {
      method: 'GET',
    },
    { token }
  );

  return response;
}
