import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * WatermelonDB Schema for offline-first data storage
 * Version 1: Initial schema
 */
export const schema = appSchema({
  version: 1,
  tables: [
    // Journeys table
    tableSchema({
      name: 'journeys',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),

    // Recordings table
    tableSchema({
      name: 'recordings',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'journey_id', type: 'string', isIndexed: true },
        { name: 'chapter_id', type: 'string', isIndexed: true },
        { name: 'local_uri', type: 'string' },
        { name: 'remote_url', type: 'string', isOptional: true },
        { name: 'type', type: 'string' }, // 'audio' | 'video'
        { name: 'duration_seconds', type: 'number' },
        { name: 'size_bytes', type: 'number' },
        { name: 'status', type: 'string' }, // 'pending_upload' | 'uploading' | 'uploaded' | 'failed'
        { name: 'upload_attempts', type: 'number' },
        { name: 'last_upload_attempt_at', type: 'number', isOptional: true },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),

    // Chapter progress table
    tableSchema({
      name: 'chapter_progress',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'journey_id', type: 'string', isIndexed: true },
        { name: 'chapter_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string' }, // 'locked' | 'available' | 'completed'
        { name: 'progress_percentage', type: 'number' },
        { name: 'media_count', type: 'number' },
        { name: 'last_activity_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),

    // Transcriptions table (for future use)
    tableSchema({
      name: 'transcriptions',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'recording_id', type: 'string', isIndexed: true },
        { name: 'text', type: 'string' },
        { name: 'language', type: 'string' },
        { name: 'confidence', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),

    // Sync queue table (tracks pending operations)
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'operation_type', type: 'string' }, // 'create' | 'update' | 'delete' | 'upload'
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'record_id', type: 'string', isIndexed: true },
        { name: 'payload', type: 'string' }, // JSON string
        { name: 'attempts', type: 'number' },
        { name: 'last_attempt_at', type: 'number', isOptional: true },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // 'pending' | 'processing' | 'failed' | 'completed'
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
