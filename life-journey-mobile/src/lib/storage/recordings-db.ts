import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { database, Recording } from '@/lib/db';
import type { RecordingType, RecordingStatus } from '@/lib/db/models/Recording';
import type { ChapterId } from '@/lib/types';
import { Q } from '@nozbe/watermelondb';

const RECORDINGS_DIR = `${FileSystem.documentDirectory}recordings/`;

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
 * Save recording to WatermelonDB and FileSystem
 */
export async function saveRecordingToDatabase(
  uri: string,
  chapterId: ChapterId,
  journeyId: string,
  type: RecordingType,
  durationSeconds: number
): Promise<Recording> {
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
      await FileSystem.copyAsync({ from: uri, to: newUri });
    } else {
      await FileSystem.moveAsync({ from: uri, to: newUri });
    }

    // Save to WatermelonDB
    const recording = await database.write(async () => {
      return await database.get<Recording>('recordings').create((rec) => {
        rec.journeyId = journeyId;
        rec.chapterId = chapterId;
        rec.localUri = newUri;
        rec.type = type;
        rec.durationSeconds = durationSeconds;
        rec.sizeBytes = sizeBytes;
        rec.status = 'pending_upload' as RecordingStatus;
        rec.uploadAttempts = 0;
        rec.isDeleted = false;
      });
    });

    console.log('Saved recording to database:', recording.id);
    return recording;
  } catch (error) {
    console.error('Failed to save recording to database:', error);
    throw error;
  }
}

/**
 * Get all recordings for a chapter
 */
export async function getRecordingsByChapter(chapterId: ChapterId): Promise<Recording[]> {
  try {
    const recordings = await database
      .get<Recording>('recordings')
      .query(
        Q.where('chapter_id', chapterId),
        Q.where('is_deleted', false),
        Q.sortBy('created_at', Q.desc)
      )
      .fetch();

    return recordings;
  } catch (error) {
    console.error('Failed to get recordings by chapter:', error);
    return [];
  }
}

/**
 * Get all recordings for a journey
 */
export async function getRecordingsByJourney(journeyId: string): Promise<Recording[]> {
  try {
    const recordings = await database
      .get<Recording>('recordings')
      .query(
        Q.where('journey_id', journeyId),
        Q.where('is_deleted', false),
        Q.sortBy('created_at', Q.desc)
      )
      .fetch();

    return recordings;
  } catch (error) {
    console.error('Failed to get recordings by journey:', error);
    return [];
  }
}

/**
 * Get pending uploads
 */
export async function getPendingUploads(): Promise<Recording[]> {
  try {
    const recordings = await database
      .get<Recording>('recordings')
      .query(
        Q.or(
          Q.where('status', 'pending_upload'),
          Q.where('status', 'failed')
        ),
        Q.where('is_deleted', false)
      )
      .fetch();

    return recordings;
  } catch (error) {
    console.error('Failed to get pending uploads:', error);
    return [];
  }
}

/**
 * Update recording status
 */
export async function updateRecordingStatus(
  recordingId: string,
  status: RecordingStatus,
  errorMessage?: string
): Promise<void> {
  try {
    await database.write(async () => {
      const recording = await database.get<Recording>('recordings').find(recordingId);
      await recording.update((rec) => {
        rec.status = status;
        if (errorMessage !== undefined) {
          rec.errorMessage = errorMessage;
        }
      });
    });
  } catch (error) {
    console.error('Failed to update recording status:', error);
    throw error;
  }
}

/**
 * Delete recording (soft delete)
 */
export async function deleteRecording(recordingId: string): Promise<void> {
  try {
    await database.write(async () => {
      const recording = await database.get<Recording>('recordings').find(recordingId);

      // Delete file from filesystem
      const fileInfo = await FileSystem.getInfoAsync(recording.localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(recording.localUri, { idempotent: true });
      }

      // Soft delete in database
      await recording.update((rec) => {
        rec.isDeleted = true;
      });
    });

    console.log('Deleted recording:', recordingId);
  } catch (error) {
    console.error('Failed to delete recording:', error);
    throw error;
  }
}

/**
 * Get total storage used by recordings
 */
export async function getStorageUsed(): Promise<number> {
  try {
    const recordings = await database
      .get<Recording>('recordings')
      .query(Q.where('is_deleted', false))
      .fetch();

    return recordings.reduce((total, rec) => total + rec.sizeBytes, 0);
  } catch (error) {
    console.error('Failed to get storage used:', error);
    return 0;
  }
}

/**
 * Clean up uploaded recordings older than specified days
 */
export async function cleanupOldRecordings(daysOld: number = 30): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const recordings = await database
      .get<Recording>('recordings')
      .query(
        Q.where('status', 'uploaded'),
        Q.where('created_at', Q.lte(cutoffTime.getTime())),
        Q.where('is_deleted', false)
      )
      .fetch();

    let deletedCount = 0;

    for (const recording of recordings) {
      await deleteRecording(recording.id);
      deletedCount++;
    }

    console.log(`Cleaned up ${deletedCount} old recordings`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup old recordings:', error);
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
