import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export type OperationType = 'create' | 'update' | 'delete' | 'upload';
export type QueueStatus = 'pending' | 'processing' | 'failed' | 'completed';

export default class SyncQueue extends Model {
  static table = 'sync_queue';

  @field('operation_type') operationType!: OperationType;
  @field('table_name') tableName!: string;
  @field('record_id') recordId!: string;
  @field('payload') payload!: string; // JSON string
  @field('attempts') attempts!: number;
  @date('last_attempt_at') lastAttemptAt!: Date | null;
  @field('error_message') errorMessage!: string | null;
  @field('status') status!: QueueStatus;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
