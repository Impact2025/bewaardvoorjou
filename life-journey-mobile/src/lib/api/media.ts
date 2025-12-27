import { apiFetch } from "./client";
import * as FileSystem from 'expo-file-system';
import type { ChapterId } from "@/lib/types";

export interface UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  fileName: string;
}

export interface MediaUploadResponse {
  id: string;
  journeyId: string;
  chapterId: ChapterId;
  objectKey: string;
  fileName: string;
  sizeBytes: number;
  mediaType: string;
  uploadedAt: string;
}

/**
 * Request a pre-signed S3 upload URL from backend
 */
export async function getUploadUrl(
  journeyId: string,
  chapterId: ChapterId,
  fileType: 'audio' | 'video',
  token: string
): Promise<UploadUrlResponse> {
  const extension = fileType === 'audio' ? 'm4a' : 'm4v';
  const contentType = fileType === 'audio' ? 'audio/m4a' : 'video/mp4';

  const response = await apiFetch<UploadUrlResponse>(
    `/media/upload-url`,
    {
      method: 'POST',
      body: JSON.stringify({
        journey_id: journeyId,
        chapter_id: chapterId,
        file_extension: extension,
        content_type: contentType,
      }),
    },
    { token }
  );

  return response;
}

/**
 * Upload file to S3 using pre-signed URL
 */
export async function uploadFileToS3(
  presignedUrl: string,
  localUri: string,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    // Use FileSystem upload for progress tracking
    const uploadResult = await FileSystem.uploadAsync(presignedUrl, localUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (uploadResult.status !== 200) {
      throw new Error(`Upload failed with status ${uploadResult.status}`);
    }

    console.log('Upload successful:', uploadResult);
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw error;
  }
}

/**
 * Confirm upload to backend after S3 upload completes
 */
export async function confirmUpload(
  journeyId: string,
  chapterId: ChapterId,
  objectKey: string,
  sizeBytes: number,
  durationSeconds: number,
  token: string
): Promise<MediaUploadResponse> {
  const response = await apiFetch<MediaUploadResponse>(
    `/media/confirm-upload`,
    {
      method: 'POST',
      body: JSON.stringify({
        journey_id: journeyId,
        chapter_id: chapterId,
        object_key: objectKey,
        size_bytes: sizeBytes,
        duration_seconds: durationSeconds,
      }),
    },
    { token }
  );

  return response;
}

/**
 * Complete upload flow: Get URL → Upload to S3 → Confirm
 */
export async function uploadRecording(
  journeyId: string,
  chapterId: ChapterId,
  localUri: string,
  fileType: 'audio' | 'video',
  sizeBytes: number,
  durationSeconds: number,
  token: string,
  onProgress?: (progress: number) => void
): Promise<MediaUploadResponse> {
  try {
    // Step 1: Get pre-signed upload URL
    const { uploadUrl, objectKey } = await getUploadUrl(
      journeyId,
      chapterId,
      fileType,
      token
    );

    // Step 2: Upload to S3
    const contentType = fileType === 'audio' ? 'audio/m4a' : 'video/mp4';
    await uploadFileToS3(uploadUrl, localUri, contentType, onProgress);

    // Step 3: Confirm upload with backend
    const result = await confirmUpload(
      journeyId,
      chapterId,
      objectKey,
      sizeBytes,
      durationSeconds,
      token
    );

    console.log('Recording uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to upload recording:', error);
    throw error;
  }
}

/**
 * Get all media for a journey
 */
export async function getJourneyMedia(
  journeyId: string,
  token: string
): Promise<any[]> {
  const response = await apiFetch<any[]>(
    `/journeys/${journeyId}/media`,
    {
      method: 'GET',
    },
    { token }
  );

  return response;
}

/**
 * Get media for a specific chapter
 */
export async function getChapterMedia(
  journeyId: string,
  chapterId: ChapterId,
  token: string
): Promise<any[]> {
  const response = await apiFetch<any[]>(
    `/journeys/${journeyId}/chapters/${chapterId}/media`,
    {
      method: 'GET',
    },
    { token }
  );

  return response;
}

/**
 * Delete media
 */
export async function deleteMedia(
  mediaId: string,
  token: string
): Promise<void> {
  await apiFetch<void>(
    `/media/${mediaId}`,
    {
      method: 'DELETE',
    },
    { token }
  );
}
