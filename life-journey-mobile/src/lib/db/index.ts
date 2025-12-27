import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Journey from './models/Journey';
import Recording from './models/Recording';
import ChapterProgress from './models/ChapterProgress';
import SyncQueue from './models/SyncQueue';

// Create SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  // JSI mode for better performance (requires new architecture)
  jsi: true,
  // Callback when database setup fails
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [
    Journey,
    Recording,
    ChapterProgress,
    SyncQueue,
  ],
});

/**
 * Initialize database - call this once on app start
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection
    const count = await database.get<Journey>('journeys').query().fetchCount();
    console.log('Database initialized successfully. Journeys:', count);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Reset database - useful for development/testing
 */
export async function resetDatabase(): Promise<void> {
  try {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}

// Export models for easy access
export { Journey, Recording, ChapterProgress, SyncQueue };
export type { RecordingType, RecordingStatus } from './models/Recording';
export type { ChapterStatus } from './models/ChapterProgress';
export type { OperationType, QueueStatus } from './models/SyncQueue';
