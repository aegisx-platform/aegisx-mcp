import { BaseRepository } from '../../shared/repositories/base.repository';
import { knex } from '../../shared/database/knex';
import {
  type CreateNotifications,
  type UpdateNotifications,
  type Notifications,
  type GetNotificationsQuery,
  type ListNotificationsQuery
} from './notifications.types';

export class NotificationsService extends BaseRepository<Notifications> {

  constructor() {
    super(knex, 'notifications');
  }

  async create(data: CreateNotifications): Promise<Notifications> {
    try {
      const [notifications] = await this.query()
        .insert(data)
        .returning('*');


      return notifications;
    } catch (error) {
      throw new Error(`Failed to create notifications: ${error.message}`);
    }
  }

  async findById(
    id: number | string,
    options: GetNotificationsQuery = {}
  ): Promise<Notifications | null> {
    try {
      let query = this.query().where('id', id);

      // Handle query options
      if (options.include) {
        // Add include logic based on relationships
        const includes = Array.isArray(options.include) ? options.include : [options.include];
        includes.forEach(relation => {
          // TODO: Add join logic for relationships
        });
      }

      const notifications = await query.first();
      

      return notifications || null;
    } catch (error) {
      throw new Error(`Failed to find notifications: ${error.message}`);
    }
  }

  async findMany(options: ListNotificationsQuery = {}): Promise<{
    data: Notifications[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'id',
        sortOrder = 'desc',
        search,
        include
      } = options;

      let query = this.query();

      // Search functionality
      if (search) {
        query = query.where(builder => {
        });
      }

      // Include relationships
      if (include) {
        const includes = Array.isArray(include) ? include : [include];
        includes.forEach(relation => {
          // TODO: Add join logic for relationships
        });
      }

      // Get total count
      const countQuery = query.clone();
      const totalResult = await countQuery.count('* as count').first();
      const total = parseInt(totalResult?.count as string) || 0;

      // Apply pagination and sorting
      const data = await query
        .orderBy(sortBy, sortOrder)
        .limit(limit)
        .offset((page - 1) * limit);


      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to find notificationss: ${error.message}`);
    }
  }

  async update(
    id: number | string,
    data: UpdateNotifications
  ): Promise<Notifications | null> {
    try {
      const [notifications] = await this.query()
        .where('id', id)
        .update({
          ...data,
          updated_at: new Date()
        })
        .returning('*');


      return notifications || null;
    } catch (error) {
      throw new Error(`Failed to update notifications: ${error.message}`);
    }
  }

  async delete(
    id: number | string
  ): Promise<boolean> {
    try {
      // Get the record before deletion for event emission

      const deleted = await this.query()
        .where('id', id)
        .del();


      return deleted > 0;
    } catch (error) {
      throw new Error(`Failed to delete notifications: ${error.message}`);
    }
  }

  // Additional business logic methods can be added here
}