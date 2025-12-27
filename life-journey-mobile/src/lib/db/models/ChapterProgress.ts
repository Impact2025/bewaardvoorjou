import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type Journey from './Journey';

export type ChapterStatus = 'locked' | 'available' | 'completed';

export default class ChapterProgress extends Model {
  static table = 'chapter_progress';

  static associations: Associations = {
    journeys: { type: 'belongs_to', key: 'journey_id' },
  };

  @field('server_id') serverId!: string | null;
  @field('journey_id') journeyId!: string;
  @field('chapter_id') chapterId!: string;
  @field('status') status!: ChapterStatus;
  @field('progress_percentage') progressPercentage!: number;
  @field('media_count') mediaCount!: number;
  @date('last_activity_at') lastActivityAt!: Date | null;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt!: Date | null;

  @relation('journeys', 'journey_id') journey!: Journey;
}
