import { BaseService } from '../../shared/services/base.service';
import { SystemSettingsRepository } from './systemSettings.repository';
import { EventService } from '../../shared/websocket/event.service';
import { CrudEventHelper } from '../../shared/websocket/crud-event-helper';
import {
  type SystemSettings,
  type CreateSystemSettings,
  type UpdateSystemSettings,
  type GetSystemSettingsQuery,
  type ListSystemSettingsQuery
} from './systemSettings.types';

/**
 * SystemSettings Service
 * 
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class SystemSettingsService extends BaseService<SystemSettings, CreateSystemSettings, UpdateSystemSettings> {
  private eventHelper?: CrudEventHelper;

  constructor(
    private systemSettingsRepository: SystemSettingsRepository,
    private eventService?: EventService
  ) {
    super(systemSettingsRepository);
    
    // Initialize event helper using Fastify pattern
    if (eventService) {
      this.eventHelper = eventService.for('systemSettings', 'systemSettings');
    }
  }

  /**
   * Get systemSettings by ID with optional query parameters
   */
  async findById(id: string | number, options: GetSystemSettingsQuery = {}): Promise<SystemSettings | null> {
    const systemSettings = await this.getById(id);
    
    if (systemSettings) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
      
      // Emit read event for monitoring/analytics
      if (this.eventHelper) {
        await this.eventHelper.emitCustom('read', systemSettings);
      }
    }

    return systemSettings;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListSystemSettingsQuery = {}): Promise<{
    data: SystemSettings[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);
    
    // Emit bulk read event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('bulk_read', {
        count: result.data.length,
        filters: options
      });
    }
    
    return result;
  }

  /**
   * Create new systemSettings
   */
  async create(data: CreateSystemSettings): Promise<SystemSettings> {
    const systemSettings = await super.create(data);
    
    // Emit created event for real-time updates
    if (this.eventHelper) {
      await this.eventHelper.emitCreated(systemSettings);
    }
    
    return systemSettings;
  }

  /**
   * Update existing systemSettings
   */
  async update(id: string | number, data: UpdateSystemSettings): Promise<SystemSettings | null> {
    const systemSettings = await super.update(id, data);
    
    if (systemSettings && this.eventHelper) {
      await this.eventHelper.emitUpdated(systemSettings);
    }
    
    return systemSettings;
  }

  /**
   * Delete systemSettings
   */
  async delete(id: string | number): Promise<boolean> {
    // Get entity before deletion for event emission
    const systemSettings = await this.getById(id);
    
    const deleted = await super.delete(id);
    
    if (deleted && systemSettings && this.eventHelper) {
      await this.eventHelper.emitDeleted(systemSettings.id);
    }
    
    return deleted;
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating systemSettings
   */
  protected async validateCreate(data: CreateSystemSettings): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateSystemSettings): Promise<CreateSystemSettings> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after systemSettings creation
   */
  protected async afterCreate(systemSettings: SystemSettings, _originalData: CreateSystemSettings): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log('SystemSettings created:', JSON.stringify(systemSettings), '(ID: ' + systemSettings.id + ')');
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(_id: string | number, existing: SystemSettings): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }
}