import { BaseRepository, BaseListQuery, PaginatedListResult } from '../../shared/repositories/base.repository';
import { Knex } from 'knex';
import {
  type CreateNotifications,
  type UpdateNotifications,
  type Notifications,
  type GetNotificationsQuery,
  type ListNotificationsQuery,
  type NotificationsEntity
} from './notifications.types';

export interface NotificationsListQuery extends BaseListQuery {
  // Add specific filters for Notifications

  user_id?: string;
  

  type?: string;
  

  title?: string;
  

  message?: string;
  


  action_url?: string;
  
  read?: boolean;
  

  archived?: boolean;
  


  priority?: string;
  


}

export class NotificationsRepository extends BaseRepository<Notifications, CreateNotifications, UpdateNotifications> {

  constructor(knex: Knex) {
    super(
      knex,
      'notifications',
      [
        // Define searchable fields
        '.user_id',
        '.type',
        '.title',
        '.message',
        '.action_url',
        '.priority',
      ]
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Notifications {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      user_id: dbRow.user_id,
      type: dbRow.type,
      title: dbRow.title,
      message: dbRow.message,
      data: dbRow.data,
      action_url: dbRow.action_url,
      read: dbRow.read,
      read_at: dbRow.read_at,
      archived: dbRow.archived,
      archived_at: dbRow.archived_at,
      priority: dbRow.priority,
      expires_at: dbRow.expires_at,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateNotifications | UpdateNotifications): Partial<NotificationsEntity> {
    const transformed: Partial<NotificationsEntity> = {};

    if ('user_id' in dto && dto.user_id !== undefined) {
      transformed.user_id = dto.user_id;
    }
    if ('type' in dto && dto.type !== undefined) {
      transformed.type = dto.type;
    }
    if ('title' in dto && dto.title !== undefined) {
      transformed.title = dto.title;
    }
    if ('message' in dto && dto.message !== undefined) {
      transformed.message = dto.message;
    }
    if ('data' in dto && dto.data !== undefined) {
      transformed.data = dto.data;
    }
    if ('action_url' in dto && dto.action_url !== undefined) {
      transformed.action_url = dto.action_url;
    }
    if ('read' in dto && dto.read !== undefined) {
      transformed.read = dto.read;
    }
    if ('read_at' in dto && dto.read_at !== undefined) {
      transformed.read_at = typeof dto.read_at === 'string' ? new Date(dto.read_at) : dto.read_at;
    }
    if ('archived' in dto && dto.archived !== undefined) {
      transformed.archived = dto.archived;
    }
    if ('archived_at' in dto && dto.archived_at !== undefined) {
      transformed.archived_at = typeof dto.archived_at === 'string' ? new Date(dto.archived_at) : dto.archived_at;
    }
    if ('priority' in dto && dto.priority !== undefined) {
      transformed.priority = dto.priority;
    }
    if ('expires_at' in dto && dto.expires_at !== undefined) {
      transformed.expires_at = typeof dto.expires_at === 'string' ? new Date(dto.expires_at) : dto.expires_at;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('notifications')
      .select('notifications.*');
      // Add joins here if needed
      // .leftJoin('other_table', 'notifications.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: NotificationsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Notifications filters
    if (filters.user_id !== undefined) {
      query.where('.user_id', filters.user_id);
    }
    if (filters.type !== undefined) {
      query.where('.type', filters.type);
    }
    if (filters.title !== undefined) {
      query.where('.title', filters.title);
    }
    if (filters.message !== undefined) {
      query.where('.message', filters.message);
    }
    if (filters.data !== undefined) {
      query.where('.data', filters.data);
    }
    if (filters.action_url !== undefined) {
      query.where('.action_url', filters.action_url);
    }
    if (filters.read !== undefined) {
      query.where('.read', filters.read);
    }
    if (filters.read_at !== undefined) {
      query.where('.read_at', filters.read_at);
    }
    if (filters.archived !== undefined) {
      query.where('.archived', filters.archived);
    }
    if (filters.archived_at !== undefined) {
      query.where('.archived_at', filters.archived_at);
    }
    if (filters.priority !== undefined) {
      query.where('.priority', filters.priority);
    }
    if (filters.expires_at !== undefined) {
      query.where('.expires_at', filters.expires_at);
    }
    if (filters.updated_at !== undefined) {
      query.where('.updated_at', filters.updated_at);
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: '.id',
      userId: '.user_id',
      type: '.type',
      title: '.title',
      message: '.message',
      data: '.data',
      actionUrl: '.action_url',
      read: '.read',
      readAt: '.read_at',
      archived: '.archived',
      archivedAt: '.archived_at',
      priority: '.priority',
      expiresAt: '.expires_at',
      createdAt: '.created_at',
      updatedAt: '.updated_at'
    };

    return sortFields[sortBy] || 'notifications.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetNotificationsQuery = {}
  ): Promise<Notifications | null> {
    let query = this.getJoinQuery();
    query = query.where('notifications.id', id);

    // Handle include options
    if (options.include) {
      const includes = Array.isArray(options.include) ? options.include : [options.include];
      includes.forEach(relation => {
        // TODO: Add join logic for relationships
        // Example: if (relation === 'category') query.leftJoin('categories', 'items.category_id', 'categories.id');
      });
    }

    const row = await query.first();
    return row ? this.transformToEntity(row) : null;
  }

  // Extended list method with specific query type
  async list(query: NotificationsListQuery = {}): Promise<PaginatedListResult<Notifications>> {
    return super.list(query);
  }

  // Additional business-specific methods
  
  async findByUserId(userId: string): Promise<Notifications | null> {
    const query = this.getJoinQuery();
    const row = await query.where('notifications.user_id', userId).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByType(type: string): Promise<Notifications | null> {
    const query = this.getJoinQuery();
    const row = await query.where('notifications.type', type).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByTitle(title: string): Promise<Notifications | null> {
    const query = this.getJoinQuery();
    const row = await query.where('notifications.title', title).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByMessage(message: string): Promise<Notifications | null> {
    const query = this.getJoinQuery();
    const row = await query.where('notifications.message', message).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByActionUrl(actionUrl: string): Promise<Notifications | null> {
    const query = this.getJoinQuery();
    const row = await query.where('notifications.action_url', actionUrl).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByPriority(priority: string): Promise<Notifications | null> {
    const query = this.getJoinQuery();
    const row = await query.where('notifications.priority', priority).first();
    return row ? this.transformToEntity(row) : null;
  }


  // Statistics and aggregation methods
  async getStats(): Promise<{
    total: number;
    readCount: number;
    archivedCount: number;
  }> {
    const stats: any = await this.knex('notifications')
      .select([
        this.knex.raw('COUNT(*) as total'),
        this.knex.raw('COUNT(*) FILTER (WHERE read = true) as read_count'),
        this.knex.raw('COUNT(*) FILTER (WHERE archived = true) as archived_count')
      ])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
      readCount: parseInt(stats?.read_count || '0'),
      archivedCount: parseInt(stats?.archived_count || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateNotifications[]): Promise<Notifications[]> {
    const transformedData = data.map(item => this.transformToDb(item));
    const rows = await this.knex('notifications').insert(transformedData).returning('*');
    return rows.map(row => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateNotifications): Promise<Notifications> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('notifications').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}