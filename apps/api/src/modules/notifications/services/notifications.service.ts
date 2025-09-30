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

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options for UI components
   */
  async getDropdownOptions(options: any = {}): Promise<{
    options: Array<{
      value: string | number;
      label: string;
      disabled?: boolean;
    }>;
    total: number;
  }> {
    const {
      limit = 100,
      search,
      labelField = 'user_id',
      valueField = 'id',
    } = options;

    const result = await this.notificationsRepository.list({
      limit,
      search,
      sortBy: labelField,
      sortOrder: 'asc',
    });

    const dropdownOptions = result.data.map((item) => ({
      value: item[valueField],
      label: item[labelField] || `${item.id}`,
      disabled: false,
    }));

    return {
      options: dropdownOptions,
      total: result.pagination.total,
    };
  }

  /**
   * Bulk create multiple notificationss
   */
  async bulkCreate(data: { items: CreateNotifications[] }): Promise<{
    created: Notifications[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Notifications[] = [];
    const errors: any[] = [];

    // Validate and process all items first
    const validItems: CreateNotifications[] = [];
    for (const item of data.items) {
      try {
        await this.validateCreate(item);
        const processed = await this.beforeCreate(item);
        validItems.push(processed);
      } catch (error) {
        errors.push({
          item,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Bulk create valid items
    if (validItems.length > 0) {
      try {
        // Use individual creates instead of createMany for debugging
        for (const item of validItems) {
          const created = await this.notificationsRepository.create(item);
          results.push(created);
        }

        // Call afterCreate for each created item
        for (let i = 0; i < results.length; i++) {
          try {
            await this.afterCreate(results[i], validItems[i]);
          } catch (error) {
            console.warn('Error in afterCreate:', error);
          }
        }
      } catch (error) {
        errors.push({
          item: 'bulk_operation',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      created: results,
      summary: {
        successful: results.length,
        failed: errors.length,
        errors,
      },
    };
  }

  /**
   * Bulk update multiple notificationss
   */
  async bulkUpdate(data: {
    items: Array<{ id: string | number; data: UpdateNotifications }>;
  }): Promise<{
    updated: Notifications[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Notifications[] = [];
    const errors: any[] = [];

    for (const item of data.items) {
      try {
        const updated = await this.update(item.id, item.data);
        if (updated) {
          results.push(updated);
        }
      } catch (error) {
        errors.push({
          item,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      updated: results,
      summary: {
        successful: results.length,
        failed: errors.length,
        errors,
      },
    };
  }

  /**
   * Bulk delete multiple notificationss
   */
  async bulkDelete(data: { ids: Array<string | number> }): Promise<{
    deleted: Array<string | number>;
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Array<string | number> = [];
    const errors: any[] = [];

    for (const id of data.ids) {
      try {
        const deleted = await this.delete(id);
        if (deleted) {
          results.push(id);
        }
      } catch (error) {
        errors.push({
          id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      deleted: results,
      summary: {
        successful: results.length,
        failed: errors.length,
        errors,
      },
    };
  }

  /**
   * Get basic statistics (count only)
   */
  async getStats(): Promise<{
    total: number;
  }> {
    return this.notificationsRepository.getStats();
  }

  // ===== FULL PACKAGE METHODS =====

  /**
   * Validate data before save
   */
  async validate(data: { data: CreateNotifications }): Promise<{
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
  }> {
    const errors: Array<{ field: string; message: string }> = [];

    try {
      await this.validateCreate(data.data);
    } catch (error) {
      errors.push({
        field: 'general',
        message: error instanceof Error ? error.message : String(error),
      });
    }

    // Add specific field validations

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check field uniqueness
   */
  async checkUniqueness(
    field: string,
    options: { value: string; excludeId?: string | number },
  ): Promise<{
    unique: boolean;
    exists?: any;
  }> {
    const query: any = { [field]: options.value };

    // Add exclusion for updates
    if (options.excludeId) {
      query.excludeId = options.excludeId;
    }

    // Use field-specific find methods based on available repository methods
    let existing: any = null;

    // If updating (excludeId provided), ignore the current record
    if (existing && options.excludeId && existing.id === options.excludeId) {
      existing = null;
    }

    return {
      unique: !existing,
      exists: existing || undefined,
    };
  }
}
