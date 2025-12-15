import { apiFetch } from "@/lib/api-client";
import type { Memo, ChapterId } from "@/lib/types";

// DTOs matching backend schemas (snake_case)
interface MemoDto {
  id: string;
  journey_id: string;
  chapter_id: ChapterId | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

interface MemoListDto {
  memos: MemoDto[];
}

interface MemoCreateRequest {
  title: string;
  content: string;
  chapter_id?: ChapterId;
}

interface MemoUpdateRequest {
  title?: string;
  content?: string;
  chapter_id?: ChapterId;
}

// Helper to convert DTO to frontend type
function dtoToMemo(dto: MemoDto): Memo {
  return {
    id: dto.id,
    journeyId: dto.journey_id,
    chapterId: dto.chapter_id ?? undefined,
    title: dto.title,
    content: dto.content,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at ?? dto.created_at,
  };
}

/**
 * Fetch all memos for a journey
 */
export async function fetchMemos(
  journeyId: string,
  token: string,
  chapterId?: ChapterId
): Promise<Memo[]> {
  const url = chapterId
    ? `/memos/${journeyId}?chapter_id=${chapterId}`
    : `/memos/${journeyId}`;

  const response = await apiFetch<MemoListDto>(url, { method: "GET" }, { token });
  return response.memos.map(dtoToMemo);
}

/**
 * Create a new memo
 */
export async function createMemo(
  journeyId: string,
  data: MemoCreateRequest,
  token: string
): Promise<Memo> {
  const response = await apiFetch<MemoDto>(
    `/memos?journey_id=${journeyId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        chapter_id: data.chapter_id,
      }),
    },
    { token }
  );
  return dtoToMemo(response);
}

/**
 * Get a specific memo by ID
 */
export async function fetchMemo(memoId: string, token: string): Promise<Memo> {
  const response = await apiFetch<MemoDto>(
    `/memos/detail/${memoId}`,
    { method: "GET" },
    { token }
  );
  return dtoToMemo(response);
}

/**
 * Update an existing memo
 */
export async function updateMemo(
  memoId: string,
  data: MemoUpdateRequest,
  token: string
): Promise<Memo> {
  const response = await apiFetch<MemoDto>(
    `/memos/${memoId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        chapter_id: data.chapter_id,
      }),
    },
    { token }
  );
  return dtoToMemo(response);
}

/**
 * Delete a memo
 */
export async function deleteMemo(memoId: string, token: string): Promise<void> {
  await apiFetch<void>(
    `/memos/${memoId}`,
    { method: "DELETE" },
    { token }
  );
}
