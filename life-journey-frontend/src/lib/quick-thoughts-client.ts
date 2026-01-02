/**
 * Quick Thoughts API Client - Gedachte Inspreken feature
 *
 * Client voor het maken, ophalen en beheren van quick thoughts.
 */

import { apiFetch } from "@/lib/api-client";

// =============================================================================
// Types
// =============================================================================

export type QuickThoughtModality = "text" | "audio" | "video";

export interface SuggestedChapter {
  chapter_id: string;
  confidence: number;
  reason: string;
}

export interface QuickThought {
  id: string;
  journey_id: string;
  chapter_id: string | null;
  modality: QuickThoughtModality;

  // Content
  text_content: string | null;
  media_url: string | null;
  title: string | null;
  duration_seconds: number | null;

  // Transcription
  transcript: string | null;
  transcript_status: "pending" | "processing" | "ready" | "failed";

  // AI Analysis
  auto_category: string | null;
  auto_tags: string[];
  emotion_score: number | null;
  ai_summary: string | null;
  suggested_chapters: SuggestedChapter[];

  // Status
  processing_status: "pending" | "processing" | "ready" | "failed";
  is_used_in_interview: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface QuickThoughtListResponse {
  items: QuickThought[];
  total: number;
  has_more: boolean;
  offset: number;
  limit: number;
}

export interface QuickThoughtStats {
  total_count: number;
  by_modality: Record<string, number>;
  by_category: Record<string, number>;
  unused_count: number;
  recent_count: number;
}

export interface QuickThoughtsForInterviewResponse {
  direct: QuickThought[];
  suggested: QuickThought[];
  total_unused: number;
}

export interface QuickThoughtPresignResponse {
  thought_id: string;
  upload_url: string;
  upload_method: string;
  object_key: string;
  expires_in: number;
}

// =============================================================================
// Request Types
// =============================================================================

export interface CreateTextThoughtRequest {
  text_content: string;
  title?: string;
  chapter_id?: string;
}

export interface PresignUploadRequest {
  modality: "audio" | "video";
  filename: string;
  content_type?: string;
  chapter_id?: string;
  size_bytes?: number;
}

export interface UpdateThoughtRequest {
  title?: string;
  chapter_id?: string;
  auto_tags?: string[];
}

export interface ListThoughtsParams {
  chapter_id?: string;
  modality?: QuickThoughtModality;
  category?: string;
  include_archived?: boolean;
  unused_only?: boolean;
  limit?: number;
  offset?: number;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Create a text-only quick thought.
 */
export async function createTextThought(
  data: CreateTextThoughtRequest,
  token: string
): Promise<QuickThought> {
  return apiFetch<QuickThought>("/quick-thoughts", {
    method: "POST",
    body: JSON.stringify(data),
  }, { token });
}

/**
 * Get a presigned URL for uploading audio/video.
 */
export async function getPresignedUploadUrl(
  data: PresignUploadRequest,
  token: string
): Promise<QuickThoughtPresignResponse> {
  return apiFetch<QuickThoughtPresignResponse>("/quick-thoughts/presign", {
    method: "POST",
    body: JSON.stringify(data),
  }, { token });
}

/**
 * Upload a media file to the presigned URL.
 */
export async function uploadMedia(
  uploadUrl: string,
  blob: Blob,
  contentType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}

/**
 * Mark an upload as complete to trigger processing.
 */
export async function completeUpload(
  thoughtId: string,
  token: string
): Promise<{ status: string; thought_id: string; message: string }> {
  return apiFetch<{ status: string; thought_id: string; message: string }>(
    `/quick-thoughts/${thoughtId}/complete`,
    { method: "POST" },
    { token }
  );
}

/**
 * List all quick thoughts with optional filtering.
 */
export async function listThoughts(
  params: ListThoughtsParams,
  token: string
): Promise<QuickThoughtListResponse> {
  const searchParams = new URLSearchParams();

  if (params.chapter_id) searchParams.set("chapter_id", params.chapter_id);
  if (params.modality) searchParams.set("modality", params.modality);
  if (params.category) searchParams.set("category", params.category);
  if (params.include_archived) searchParams.set("include_archived", "true");
  if (params.unused_only) searchParams.set("unused_only", "true");
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.offset) searchParams.set("offset", params.offset.toString());

  const queryString = searchParams.toString();
  const path = queryString ? `/quick-thoughts?${queryString}` : "/quick-thoughts";

  return apiFetch<QuickThoughtListResponse>(path, { method: "GET" }, { token });
}

/**
 * Get a single quick thought by ID.
 */
export async function getThought(
  thoughtId: string,
  token: string
): Promise<QuickThought> {
  return apiFetch<QuickThought>(
    `/quick-thoughts/${thoughtId}`,
    { method: "GET" },
    { token }
  );
}

/**
 * Get quick thoughts relevant for an interview session.
 */
export async function getThoughtsForInterview(
  chapterId: string,
  token: string
): Promise<QuickThoughtsForInterviewResponse> {
  return apiFetch<QuickThoughtsForInterviewResponse>(
    `/quick-thoughts/for-interview/${chapterId}`,
    { method: "GET" },
    { token }
  );
}

/**
 * Get statistics about quick thoughts.
 */
export async function getStats(token: string): Promise<QuickThoughtStats> {
  return apiFetch<QuickThoughtStats>(
    "/quick-thoughts/stats",
    { method: "GET" },
    { token }
  );
}

/**
 * Update a quick thought.
 */
export async function updateThought(
  thoughtId: string,
  data: UpdateThoughtRequest,
  token: string
): Promise<QuickThought> {
  return apiFetch<QuickThought>(
    `/quick-thoughts/${thoughtId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    { token }
  );
}

/**
 * Link a quick thought to a chapter.
 */
export async function linkToChapter(
  thoughtId: string,
  chapterId: string,
  token: string
): Promise<QuickThought> {
  return apiFetch<QuickThought>(
    `/quick-thoughts/${thoughtId}/link/${chapterId}`,
    { method: "POST" },
    { token }
  );
}

/**
 * Mark a quick thought as used in an interview.
 */
export async function markAsUsed(
  thoughtId: string,
  token: string
): Promise<QuickThought> {
  return apiFetch<QuickThought>(
    `/quick-thoughts/${thoughtId}/mark-used`,
    { method: "POST" },
    { token }
  );
}

/**
 * Archive (soft delete) a quick thought.
 */
export async function archiveThought(
  thoughtId: string,
  token: string
): Promise<QuickThought> {
  return apiFetch<QuickThought>(
    `/quick-thoughts/${thoughtId}/archive`,
    { method: "POST" },
    { token }
  );
}

/**
 * Permanently delete a quick thought.
 */
export async function deleteThought(
  thoughtId: string,
  token: string
): Promise<{ status: string; thought_id: string }> {
  return apiFetch<{ status: string; thought_id: string }>(
    `/quick-thoughts/${thoughtId}`,
    { method: "DELETE" },
    { token }
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Upload a complete quick thought (presign + upload + complete).
 */
export async function uploadQuickThought(
  blob: Blob,
  modality: "audio" | "video",
  token: string,
  options?: {
    chapterId?: string;
    onProgress?: (status: string) => void;
  }
): Promise<string> {
  const { chapterId, onProgress } = options ?? {};

  // Step 1: Get presigned URL
  onProgress?.("URL ophalen...");
  const filename = `recording.${modality === "video" ? "webm" : "webm"}`;
  const contentType = modality === "video" ? "video/webm" : "audio/webm";

  const presign = await getPresignedUploadUrl({
    modality,
    filename,
    content_type: contentType,
    chapter_id: chapterId,
    size_bytes: blob.size,
  }, token);

  // Step 2: Upload the blob
  onProgress?.("Uploaden...");
  await uploadMedia(presign.upload_url, blob, contentType);

  // Step 3: Mark as complete
  onProgress?.("Verwerken...");
  await completeUpload(presign.thought_id, token);

  return presign.thought_id;
}

/**
 * Get the display text for a processing status.
 */
export function getProcessingStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Wachten...",
    processing: "Verwerken...",
    ready: "Klaar",
    failed: "Mislukt",
  };
  return statusMap[status] ?? status;
}

/**
 * Get the display text for a category.
 */
export function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    jeugd: "Jeugd",
    familie: "Familie",
    liefde: "Liefde",
    vriendschap: "Vriendschap",
    werk: "Werk",
    school: "School",
    reizen: "Reizen",
    verlies: "Verlies",
    trots: "Trots",
    wijsheid: "Wijsheid",
    humor: "Humor",
    traditie: "Traditie",
  };
  return categoryMap[category] ?? category;
}

/**
 * Get an emoji for a category.
 */
export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    jeugd: "👶",
    familie: "👨‍👩‍👧‍👦",
    liefde: "❤️",
    vriendschap: "🤝",
    werk: "💼",
    school: "🎓",
    reizen: "✈️",
    verlies: "🕊️",
    trots: "🏆",
    wijsheid: "🦉",
    humor: "😄",
    traditie: "🎄",
  };
  return emojiMap[category] ?? "💭";
}

/**
 * Get an emoji for a modality.
 */
export function getModalityEmoji(modality: QuickThoughtModality): string {
  const emojiMap: Record<QuickThoughtModality, string> = {
    text: "📝",
    audio: "🎙️",
    video: "📹",
  };
  return emojiMap[modality];
}

/**
 * Format duration in seconds to mm:ss.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
