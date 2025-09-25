import { BaseService } from '../../shared/services/base.service';
import { ApiKeysRepository } from './apiKeys.repository';
import {
  type ApiKeys,
  type CreateApiKeys,
  type UpdateApiKeys,
  type GetApiKeysQuery,
  type ListApiKeysQuery
} from './apiKeys.types';

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

  constructor(
    private apiKeysRepository: ApiKeysRepository,
    
  ) {
    super(apiKeysRepository);
    
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
    
    
    return result;
  }

  /**
   * Create new apiKeys
   */
  async create(data: CreateApiKeys): Promise<ApiKeys> {
    const apiKeys = await super.create(data);
    
    
    return apiKeys;
  }

  /**
   * Update existing apiKeys
   */
  async update(id: string | number, data: UpdateApiKeys): Promise<ApiKeys | null> {
    const apiKeys = await super.update(id, data);
    
    
    return apiKeys;
  }

  /**
   * Delete apiKeys
   */
  async delete(id: string | number): Promise<boolean> {
    // Get entity before deletion for event emission
    const apiKeys = await this.getById(id);
    
    const deleted = await super.delete(id);
    
    
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