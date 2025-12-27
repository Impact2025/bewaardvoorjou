import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, children } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';

export default class Journey extends Model {
  static table = 'journeys';

  static associations: Associations = {
    recordings: { type: 'has_many', foreignKey: 'journey_id' },
    chapter_progress: { type: 'has_many', foreignKey: 'journey_id' },
  };

  @field('server_id') serverId!: string | null;
  @field('title') title!: string;
  @field('user_id') userId!: string;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt!: Date | null;

  @children('recordings') recordings: any;
  @children('chapter_progress') chapterProgress: any;
}
