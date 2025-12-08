import { BaseService } from '../../../../shared/services/base.service';
import { DrugReturnItemsRepository } from './drug-return-items.repository';
import {
  type DrugReturnItems,
  type CreateDrugReturnItems,
  type UpdateDrugReturnItems,
  type GetDrugReturnItemsQuery,
  type ListDrugReturnItemsQuery,
  DrugReturnItemsErrorCode,
  DrugReturnItemsErrorMessages,
} from './drug-return-items.types';

/**
 * DrugReturnItems Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugReturnItemsService extends BaseService<
  DrugReturnItems,
  CreateDrugReturnItems,
  UpdateDrugReturnItems
> {
  constructor(private drugReturnItemsRepository: DrugReturnItemsRepository) {
    super(drugReturnItemsRepository);
  }

  /**
   * Get drugReturnItems by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugReturnItemsQuery = {},
  ): Promise<DrugReturnItems | null> {
    const drugReturnItems = await this.getById(id);

    if (drugReturnItems) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugReturnItems;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugReturnItemsQuery = {}): Promise<{
    data: DrugReturnItems[];
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
   * Create new drugReturnItems
   */
  async create(data: CreateDrugReturnItems): Promise<DrugReturnItems> {
    const drugReturnItems = await super.create(data);

    return drugReturnItems;
  }

  /**
   * Update existing drugReturnItems
   */
  async update(
    id: string | number,
    data: UpdateDrugReturnItems,
  ): Promise<DrugReturnItems | null> {
    const drugReturnItems = await super.update(id, data);

    return drugReturnItems;
  }

  /**
   * Delete drugReturnItems
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugReturnItems with ID:', id);

      // Check if drugReturnItems exists first
      const existing = await this.drugReturnItemsRepository.findById(id);
      if (!existing) {
        console.log('DrugReturnItems not found for deletion:', id);
        return false;
      }

      console.log('Found drugReturnItems to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugReturnItemsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugReturnItems deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugReturnItems:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugReturnItems
   */
  protected async validateCreate(data: CreateDrugReturnItems): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: total_quantity must be positive
    if (data.total_quantity !== undefined && data.total_quantity !== null) {
      if (Number(data.total_quantity) < 0) {
        const error = new Error(
          DrugReturnItemsErrorMessages[
            DrugReturnItemsErrorCode.INVALID_VALUE_TOTAL_QUANTITY
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugReturnItemsErrorCode.INVALID_VALUE_TOTAL_QUANTITY;
        throw error;
      }
    }

    // Business rule: good_quantity must be positive
    if (data.good_quantity !== undefined && data.good_quantity !== null) {
      if (Number(data.good_quantity) < 0) {
        const error = new Error(
          DrugReturnItemsErrorMessages[
            DrugReturnItemsErrorCode.INVALID_VALUE_GOOD_QUANTITY
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugReturnItemsErrorCode.INVALID_VALUE_GOOD_QUANTITY;
        throw error;
      }
    }

    // Business rule: damaged_quantity must be positive
    if (data.damaged_quantity !== undefined && data.damaged_quantity !== null) {
      if (Number(data.damaged_quantity) < 0) {
        const error = new Error(
          DrugReturnItemsErrorMessages[
            DrugReturnItemsErrorCode.INVALID_VALUE_DAMAGED_QUANTITY
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugReturnItemsErrorCode.INVALID_VALUE_DAMAGED_QUANTITY;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugReturnItems,
  ): Promise<CreateDrugReturnItems> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugReturnItems creation
   */
  protected async afterCreate(
    drugReturnItems: DrugReturnItems,
    _originalData: CreateDrugReturnItems,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugReturnItems created:',
      JSON.stringify(drugReturnItems),
      '(ID: ' + drugReturnItems.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugReturnItems,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
