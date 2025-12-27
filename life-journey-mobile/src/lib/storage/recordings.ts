import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import type { ChapterId } from '@/lib/types';

const RECORDINGS_DIR = `${FileSystem.documentDirectory}recordings/`;

export interface LocalRecording {
  id: string;
  chapterId: ChapterId;
  localUri: string;
  type: 'audio' | 'video';
  durationSeconds: number;
  sizeBytes: number;
  createdAt: number;
  status: 'pending_upload' | 'uploading' | 'uploaded' | 'failed';
  remoteUrl?: string;
  errorMessage?: string;
}

/**
 * Initialize recordings directory
 */
export async function initializeRecordingsDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
    console.log('Created recordings directory:', RECORDINGS_DIR);
  }
}

/**
 * Save recording locally to FileSystem
 */
export async function saveRecordingLocally(
  uri: string,
  chapterId: ChapterId,
  type: 'audio' | 'video',
  durationSeconds: number
): Promise<LocalRecording> {
  try {
    // Ensure directory exists
    await initializeRecordingsDir();

    // Generate unique filename
    const timestamp = Date.now();
    const extension = type === 'audio' ? 'm4a' : 'm4v';
    const filename = `${chapterId}_${timestamp}.${extension}`;
    const newUri = RECORDINGS_DIR + filename;

    // Get file info to get size
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const sizeBytes = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

    // Copy/Move file to app documents directory
    if (Platform.OS === 'ios') {
      // iOS: Recording is in temp directory, copy to documents
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });
    } else {
      // Android: Move file
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });
    }

    const recording: LocalRecording = {
      id: timestamp.toString(),
      chapterId,
      localUri: newUri,
      type,
      durationSeconds,
      sizeBytes,
      createdAt: timestamp,
      status: 'pending_upload',
    };

    console.log('Saved recording locally:', recording);
    return recording;
  } catch (error) {
    console.error('Failed to save recording locally:', error);
    throw error;
  }
}

/**
 * Get all local recordings
 */
export async function getAllRecordings(): Promise<LocalRecording[]> {
  try {
    await initializeRecordingsDir();

    const files = await FileSystem.readDirectoryAsync(RECORDINGS_DIR);

    // Parse filenames to get metadata
    const recordings: LocalRecording[] = [];

    for (const file of files) {
      const uri = RECORDINGS_DIR + file;
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (!fileInfo.exists) continue;

      // Parse filename: chapterId_timestamp.ext
      const match = file.match(/^(.+?)_(\d+)\.(m4a|m4v)$/);

      if (match) {
        const [, chapterId, timestamp, ext] = match;
        const type = ext === 'm4a' ? 'audio' : 'video';

        recordings.push({
          id: timestamp,
          chapterId: chapterId as ChapterId,
          localUri: uri,
          type,
          durationSeconds: 0, // Unknown without reading metadata
          sizeBytes: 'size' in fileInfo ? fileInfo.size : 0,
          createdAt: parseInt(timestamp),
          status: 'pending_upload', // Default status
        });
      }
    }

    return recordings.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Failed to get all recordings:', error);
    return [];
  }
}

/**
 * Get recordings for a specific chapter
 */
export async function getRecordingsByChapter(chapterId: ChapterId): Promise<LocalRecording[]> {
  const allRecordings = await getAllRecordings();
  return allRecordings.filter((r) => r.chapterId === chapterId);
}

/**
 * Delete recording from local storage
 */
export async function deleteRecording(localUri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      console.log('Deleted recording:', localUri);
    }
  } catch (error) {
    console.error('Failed to delete recording:', error);
    throw error;
  }
}

/**
 * Get pending uploads (recordings not yet uploaded)
 */
export async function getPendingUploads(): Promise<LocalRecording[]> {
  const allRecordings = await getAllRecordings();
  return allRecordings.filter((r) => r.status === 'pending_upload' || r.status === 'failed');
}

/**
 * Get total storage used by recordings
 */
export async function getStorageUsed(): Promise<number> {
  try {
    const recordings = await getAllRecordings();
    return recordings.reduce((total, r) => total + r.sizeBytes, 0);
  } catch (error) {
    console.error('Failed to get storage used:', error);
    return 0;
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Clean up uploaded recordings older than specified days
 */
export async function cleanupOldRecordings(daysOld: number = 30): Promise<number> {
  try {
    const recordings = await getAllRecordings();
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const recording of recordings) {
      if (
        recording.status === 'uploaded' &&
        recording.createdAt < cutoffTime
      ) {
        await deleteRecording(recording.localUri);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} old recordings`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup old recordings:', error);
    return 0;
  }
}
