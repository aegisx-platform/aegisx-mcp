import { BaseService } from '../../../../shared/services/base.service';
import { ContractItemsRepository } from './contract-items.repository';
import {
  type ContractItems,
  type CreateContractItems,
  type UpdateContractItems,
  type GetContractItemsQuery,
  type ListContractItemsQuery,
  ContractItemsErrorCode,
  ContractItemsErrorMessages,
} from './contract-items.types';

/**
 * ContractItems Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ContractItemsService extends BaseService<
  ContractItems,
  CreateContractItems,
  UpdateContractItems
> {
  constructor(private contractItemsRepository: ContractItemsRepository) {
    super(contractItemsRepository);
  }

  /**
   * Get contractItems by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetContractItemsQuery = {},
  ): Promise<ContractItems | null> {
    const contractItems = await this.getById(id);

    if (contractItems) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return contractItems;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListContractItemsQuery = {}): Promise<{
    data: ContractItems[];
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
   * Create new contractItems
   */
  async create(data: CreateContractItems): Promise<ContractItems> {
    const contractItems = await super.create(data);

    return contractItems;
  }

  /**
   * Update existing contractItems
   */
  async update(
    id: string | number,
    data: UpdateContractItems,
  ): Promise<ContractItems | null> {
    const contractItems = await super.update(id, data);

    return contractItems;
  }

  /**
   * Delete contractItems
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete contractItems with ID:', id);

      // Check if contractItems exists first
      const existing = await this.contractItemsRepository.findById(id);
      if (!existing) {
        console.log('ContractItems not found for deletion:', id);
        return false;
      }

      console.log('Found contractItems to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.contractItemsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('ContractItems deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting contractItems:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating contractItems
   */
  protected async validateCreate(data: CreateContractItems): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: agreed_unit_price must be positive
    if (
      data.agreed_unit_price !== undefined &&
      data.agreed_unit_price !== null
    ) {
      if (Number(data.agreed_unit_price) < 0) {
        const error = new Error(
          ContractItemsErrorMessages[
            ContractItemsErrorCode.INVALID_VALUE_AGREED_UNIT_PRICE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ContractItemsErrorCode.INVALID_VALUE_AGREED_UNIT_PRICE;
        throw error;
      }
    }

    // Business rule: quantity_limit must be positive
    if (data.quantity_limit !== undefined && data.quantity_limit !== null) {
      if (Number(data.quantity_limit) < 0) {
        const error = new Error(
          ContractItemsErrorMessages[
            ContractItemsErrorCode.INVALID_VALUE_QUANTITY_LIMIT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ContractItemsErrorCode.INVALID_VALUE_QUANTITY_LIMIT;
        throw error;
      }
    }

    // Business rule: quantity_used must be positive
    if (data.quantity_used !== undefined && data.quantity_used !== null) {
      if (Number(data.quantity_used) < 0) {
        const error = new Error(
          ContractItemsErrorMessages[
            ContractItemsErrorCode.INVALID_VALUE_QUANTITY_USED
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ContractItemsErrorCode.INVALID_VALUE_QUANTITY_USED;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateContractItems,
  ): Promise<CreateContractItems> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after contractItems creation
   */
  protected async afterCreate(
    contractItems: ContractItems,
    _originalData: CreateContractItems,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'ContractItems created:',
      JSON.stringify(contractItems),
      '(ID: ' + contractItems.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: ContractItems,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
