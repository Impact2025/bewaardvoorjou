import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type Journey from './Journey';

export type RecordingType = 'audio' | 'video';
export type RecordingStatus = 'pending_upload' | 'uploading' | 'uploaded' | 'failed';

export default class Recording extends Model {
  static table = 'recordings';

  static associations: Associations = {
    journeys: { type: 'belongs_to', key: 'journey_id' },
  };

  @field('server_id') serverId!: string | null;
  @field('journey_id') journeyId!: string;
  @field('chapter_id') chapterId!: string;
  @field('local_uri') localUri!: string;
  @field('remote_url') remoteUrl!: string | null;
  @field('type') type!: RecordingType;
  @field('duration_seconds') durationSeconds!: number;
  @field('size_bytes') sizeBytes!: number;
  @field('status') status!: RecordingStatus;
  @field('upload_attempts') uploadAttempts!: number;
  @date('last_upload_attempt_at') lastUploadAttemptAt!: Date | null;
  @field('error_message') errorMessage!: string | null;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt!: Date | null;

  @relation('journeys', 'journey_id') journey!: Journey;
}
