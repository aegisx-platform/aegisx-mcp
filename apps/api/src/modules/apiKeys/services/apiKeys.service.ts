import { BaseService } from '../../../shared/services/base.service';
import { ApiKeysRepository } from '../repositories/apiKeys.repository';
import { EventService } from '../../../shared/websocket/event.service';
import { CrudEventHelper } from '../../../shared/websocket/crud-event-helper';
import {
  type ApiKeys,
  type CreateApiKeys,
  type UpdateApiKeys,
  type GetApiKeysQuery,
  type ListApiKeysQuery
} from '../types/apiKeys.types';

/**
 * ApiKeys Service
 * 
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ApiKeysService extends BaseService<ApiKeys, CreateApiKeys, UpdateApiKeys> {
  private eventHelper?: CrudEventHelper;

  constructor(
    private apiKeysRepository: ApiKeysRepository,
    private eventService?: EventService
  ) {
    super(apiKeysRepository);
    
    // Initialize event helper using Fastify pattern
    if (eventService) {
      this.eventHelper = eventService.for('apiKeys', 'apiKeys');
    }
  }

  /**
   * Get apiKeys by ID with optional query parameters
   */
  async findById(id: string | number, options: GetApiKeysQuery = {}): Promise<ApiKeys | null> {
    const apiKeys = await this.getById(id);
    
    if (apiKeys) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
      
      // Emit read event for monitoring/analytics
      if (this.eventHelper) {
        await this.eventHelper.emitCustom('read', apiKeys);
      }
    }

    return apiKeys;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListApiKeysQuery = {}): Promise<{
    data: ApiKeys[];
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
   * Create new apiKeys
   */
  async create(data: CreateApiKeys): Promise<ApiKeys> {
    const apiKeys = await super.create(data);
    
    // Emit created event for real-time updates
    if (this.eventHelper) {
      await this.eventHelper.emitCreated(apiKeys);
    }
    
    return apiKeys;
  }

  /**
   * Update existing apiKeys
   */
  async update(id: string | number, data: UpdateApiKeys): Promise<ApiKeys | null> {
    const apiKeys = await super.update(id, data);
    
    if (apiKeys && this.eventHelper) {
      await this.eventHelper.emitUpdated(apiKeys);
    }
    
    return apiKeys;
  }

  /**
   * Delete apiKeys
   */
  async delete(id: string | number): Promise<boolean> {
    // Get entity before deletion for event emission
    const apiKeys = await this.getById(id);
    
    const deleted = await super.delete(id);
    
    if (deleted && apiKeys && this.eventHelper) {
      await this.eventHelper.emitDeleted(apiKeys.id);
    }
    
    return deleted;
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating apiKeys
   */
  protected async validateCreate(data: CreateApiKeys): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateApiKeys): Promise<CreateApiKeys> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after apiKeys creation
   */
  protected async afterCreate(apiKeys: ApiKeys, _originalData: CreateApiKeys): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log('ApiKeys created:', JSON.stringify(apiKeys), '(ID: ' + apiKeys.id + ')');
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(_id: string | number, existing: ApiKeys): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }
}