import NetInfo from '@react-native-community/netinfo';
import { Q } from '@nozbe/watermelondb';
import { database, Recording, SyncQueue } from '@/lib/db';
import { uploadRecording } from '@/lib/api/media';
import type { RecordingStatus } from '@/lib/db/models/Recording';

const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export class SyncManager {
  private isOnline: boolean = false;
  private isSyncing: boolean = false;
  private authToken: string | null = null;
  private journeyId: string | null = null;
  private netInfoUnsubscribe: (() => void) | null = null;

  /**
   * Initialize sync manager
   */
  async initialize(token: string, journeyId: string): Promise<void> {
    this.authToken = token;
    this.journeyId = journeyId;

    // Subscribe to network state changes
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('Network state changed:', {
        isConnected: state.isConnected,
        type: state.type,
      });

      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline) {
        console.log('Network restored - triggering sync');
        this.syncPendingChanges();
      }
    });

    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;

    console.log('SyncManager initialized:', {
      isOnline: this.isOnline,
      networkType: state.type,
    });

    // Trigger initial sync if online
    if (this.isOnline) {
      this.syncPendingChanges();
    }
  }

  /**
   * Cleanup - call on logout
   */
  cleanup(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
    this.authToken = null;
    this.journeyId = null;
  }

  /**
   * Main sync function - uploads pending recordings
   */
  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.isSyncing || !this.authToken || !this.journeyId) {
      return;
    }

    this.isSyncing = true;
    console.log('Starting sync...');

    try {
      // 1. Upload pending recordings
      await this.uploadPendingRecordings();

      // 2. Process sync queue (future: other operations)
      // await this.processSyncQueue();

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Upload all pending recordings with retry logic
   */
  private async uploadPendingRecordings(): Promise<void> {
    if (!this.authToken || !this.journeyId) return;

    try {
      // Get all recordings that need upload
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

      console.log(`Found ${recordings.length} recordings to upload`);

      for (const recording of recordings) {
        await this.uploadSingleRecording(recording);
      }
    } catch (error) {
      console.error('Failed to upload pending recordings:', error);
      throw error;
    }
  }

  /**
   * Upload single recording with exponential backoff
   */
  private async uploadSingleRecording(recording: Recording): Promise<void> {
    // Check if max retries exceeded
    if (recording.uploadAttempts >= MAX_RETRY_ATTEMPTS) {
      console.log(`Recording ${recording.id} exceeded max retry attempts`);
      return;
    }

    // Calculate delay for exponential backoff
    if (recording.uploadAttempts > 0 && recording.lastUploadAttemptAt) {
      const timeSinceLastAttempt = Date.now() - recording.lastUploadAttemptAt.getTime();
      const requiredDelay = INITIAL_RETRY_DELAY * Math.pow(2, recording.uploadAttempts - 1);

      if (timeSinceLastAttempt < requiredDelay) {
        console.log(`Skipping recording ${recording.id} - retry delay not elapsed`);
        return;
      }
    }

    try {
      // Update status to uploading
      await database.write(async () => {
        await recording.update((rec) => {
          rec.status = 'uploading' as RecordingStatus;
          rec.uploadAttempts = recording.uploadAttempts + 1;
          rec.lastUploadAttemptAt = new Date();
        });
      });

      console.log(`Uploading recording ${recording.id} (attempt ${recording.uploadAttempts + 1})`);

      // Perform upload
      const result = await uploadRecording(
        this.journeyId!,
        recording.chapterId,
        recording.localUri,
        recording.type,
        recording.sizeBytes,
        recording.durationSeconds,
        this.authToken!
      );

      // Update status to uploaded
      await database.write(async () => {
        await recording.update((rec) => {
          rec.status = 'uploaded' as RecordingStatus;
          rec.serverId = result.id;
          rec.remoteUrl = result.objectKey;
          rec.syncedAt = new Date();
          rec.errorMessage = null;
        });
      });

      console.log(`Successfully uploaded recording ${recording.id}`);
    } catch (error: any) {
      console.error(`Failed to upload recording ${recording.id}:`, error);

      // Update status to failed
      await database.write(async () => {
        await recording.update((rec) => {
          rec.status = 'failed' as RecordingStatus;
          rec.errorMessage = error.message || 'Upload failed';
        });
      });
    }
  }

  /**
   * Manually trigger sync (called from UI)
   */
  async triggerManualSync(): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync - offline');
      return;
    }

    console.log('Manual sync triggered');
    await this.syncPendingChanges();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): { isOnline: boolean; isSyncing: boolean } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Get pending upload count
   */
  async getPendingUploadCount(): Promise<number> {
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

    return recordings.length;
  }
}

// Singleton instance
export const syncManager = new SyncManager();
