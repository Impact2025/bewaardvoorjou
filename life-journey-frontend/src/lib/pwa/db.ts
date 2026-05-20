import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * IndexedDB Schema for Offline PWA Storage
 */
interface BewaardvoorjouDB extends DBSchema {
  recordings: {
    key: string;
    value: {
      id: string;
      journeyId: string;
      chapterId: string;
      blob: Blob;
      type: 'audio' | 'video';
      duration: number;
      createdAt: number;
      status: 'pending' | 'uploading' | 'uploaded' | 'failed';
      uploadAttempts: number;
      lastAttemptAt?: number;
      serverId?: string;
      error?: string;
    };
    indexes: { 'by-status': string; 'by-chapter': string; 'by-journey': string };
  };
  transcriptions: {
    key: string;
    value: {
      id: string;
      recordingId: string;
      text: string;
      language: string;
      segments: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
      }>;
      highlights?: Array<{
        type: string;
        startTime: number;
        endTime: number;
        text: string;
      }>;
      createdAt: number;
    };
    indexes: { 'by-recording': string };
  };
  'chapter-progress': {
    key: string;
    value: {
      chapterId: string;
      journeyId: string;
      completed: boolean;
      recordingsCount: number;
      lastActivityAt: number;
    };
    indexes: { 'by-journey': string };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'bewaardvoorjou-pwa';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<BewaardvoorjouDB> | null = null;

/**
 * Initialize and get the IndexedDB instance
 */
export async function getDB(): Promise<IDBPDatabase<BewaardvoorjouDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BewaardvoorjouDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);

      // Recordings store
      if (!db.objectStoreNames.contains('recordings')) {
        const recordingsStore = db.createObjectStore('recordings', { keyPath: 'id' });
        recordingsStore.createIndex('by-status', 'status');
        recordingsStore.createIndex('by-chapter', 'chapterId');
        recordingsStore.createIndex('by-journey', 'journeyId');
      }

      // Transcriptions store
      if (!db.objectStoreNames.contains('transcriptions')) {
        const transcriptionsStore = db.createObjectStore('transcriptions', { keyPath: 'id' });
        transcriptionsStore.createIndex('by-recording', 'recordingId');
      }

      // Chapter progress store
      if (!db.objectStoreNames.contains('chapter-progress')) {
        const progressStore = db.createObjectStore('chapter-progress', { keyPath: 'chapterId' });
        progressStore.createIndex('by-journey', 'journeyId');
      }

      // Metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
