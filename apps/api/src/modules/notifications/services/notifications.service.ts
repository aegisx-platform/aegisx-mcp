import { BaseService } from '../../../shared/services/base.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import {
  type Notifications,
  type CreateNotifications,
  type UpdateNotifications,
  type GetNotificationsQuery,
  type ListNotificationsQuery,
} from '../types/notifications.types';

/**
 * Notifications Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class NotificationsService extends BaseService<
  Notifications,
  CreateNotifications,
  UpdateNotifications
> {
  constructor(private notificationsRepository: NotificationsRepository) {
    super(notificationsRepository);
  }

  /**
   * Get notifications by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetNotificationsQuery = {},
  ): Promise<Notifications | null> {
    const notifications = await this.getById(id);

    if (notifications) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return notifications;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListNotificationsQuery = {}): Promise<{
    data: Notifications[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);

    return result;
  }

  /**
   * Create new notifications
   */
  async create(data: CreateNotifications): Promise<Notifications> {
    const notifications = await super.create(data);

    return notifications;
  }

  /**
   * Update existing notifications
   */
  async update(
    id: string | number,
    data: UpdateNotifications,
  ): Promise<Notifications | null> {
    const notifications = await super.update(id, data);

    return notifications;
  }

  /**
   * Delete notifications
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete notifications with ID:', id);

      // Check if notifications exists first
      const existing = await this.notificationsRepository.findById(id);
      if (!existing) {
        console.log('Notifications not found for deletion:', id);
        return false;
      }

      console.log('Found notifications to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.notificationsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Notifications deleted successfully:', {
          id,
          name: existing.title,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting notifications:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating notifications
   */
  protected async validateCreate(data: CreateNotifications): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateNotifications,
  ): Promise<CreateNotifications> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after notifications creation
   */
  protected async afterCreate(
    notifications: Notifications,
    _originalData: CreateNotifications,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Notifications created:',
      JSON.stringify(notifications),
      '(ID: ' + notifications.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: Notifications,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }
}
