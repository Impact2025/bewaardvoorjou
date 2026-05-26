import { apiFetch } from "@/lib/api-client";
import type { ApiError } from "@/lib/api-client";
import type { ChapterId } from "@/lib/types";

export interface NextQuestion {
  chapterId: ChapterId;
  chapterTitle: string;
  question: string;
  sessionId: string | null;
}

export async function getNextQuestion(journeyId: string, token: string): Promise<NextQuestion | null> {
  try {
    const data = await apiFetch<{
      chapter_id: ChapterId;
      chapter_title: string;
      question: string;
      session_id: string | null;
    }>(`/journeys/${journeyId}/next-question`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      chapterId: data.chapter_id,
      chapterTitle: data.chapter_title,
      question: data.question,
      sessionId: data.session_id,
    };
  } catch (err) {
    // 404 means all chapters are completed — signal "done" to the caller
    if ((err as ApiError)?.status === 404) return null;
    throw err;
  }
}

export async function submitTextAnswer(
  journeyId: string,
  chapterId: ChapterId,
  text: string,
  token: string,
): Promise<void> {
  await apiFetch(`/journeys/${journeyId}/chapters/${chapterId}/text`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: text }),
  });
}

export async function getUploadUrl(
  journeyId: string,
  chapterId: ChapterId,
  filename: string,
  mimeType: string,
  token: string,
  sizeBytes = 0,
): Promise<{ uploadUrl: string; assetId: string; uploadMethod: string; fields?: Record<string, string> }> {
  const ext = filename.split(".").pop() ?? "webm";
  const data = await apiFetch<{
    upload_url: string;
    asset_id: string;
    upload_method: string;
    fields?: Record<string, string>;
  }>(`/media/presign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      journey_id: journeyId,
      chapter_id: chapterId,
      modality: "audio",
      filename,
      size_bytes: sizeBytes,
      checksum: `sha256-${ext}`,
    }),
  });
  return { uploadUrl: data.upload_url, assetId: data.asset_id, uploadMethod: data.upload_method, fields: data.fields };
}

export async function uploadAudioBlob(
  uploadUrl: string,
  blob: Blob,
  mimeType: string,
  uploadMethod: string,
  fields?: Record<string, string>,
): Promise<void> {
  if (uploadMethod === "POST" && fields) {
    // S3 presigned POST
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    form.append("file", blob, "recording.webm");
    await fetch(uploadUrl, { method: "POST", body: form });
  } else {
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: blob,
    });
  }
}
