import { BaseService } from '../../../../shared/services/base.service';
import { DrugDistributionItemsRepository } from './drug-distribution-items.repository';
import {
  type DrugDistributionItems,
  type CreateDrugDistributionItems,
  type UpdateDrugDistributionItems,
  type GetDrugDistributionItemsQuery,
  type ListDrugDistributionItemsQuery,
  DrugDistributionItemsErrorCode,
  DrugDistributionItemsErrorMessages,
} from './drug-distribution-items.types';

/**
 * DrugDistributionItems Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugDistributionItemsService extends BaseService<
  DrugDistributionItems,
  CreateDrugDistributionItems,
  UpdateDrugDistributionItems
> {
  constructor(
    private drugDistributionItemsRepository: DrugDistributionItemsRepository,
  ) {
    super(drugDistributionItemsRepository);
  }

  /**
   * Get drugDistributionItems by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugDistributionItemsQuery = {},
  ): Promise<DrugDistributionItems | null> {
    const drugDistributionItems = await this.getById(id);

    if (drugDistributionItems) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugDistributionItems;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugDistributionItemsQuery = {}): Promise<{
    data: DrugDistributionItems[];
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
   * Create new drugDistributionItems
   */
  async create(
    data: CreateDrugDistributionItems,
  ): Promise<DrugDistributionItems> {
    const drugDistributionItems = await super.create(data);

    return drugDistributionItems;
  }

  /**
   * Update existing drugDistributionItems
   */
  async update(
    id: string | number,
    data: UpdateDrugDistributionItems,
  ): Promise<DrugDistributionItems | null> {
    const drugDistributionItems = await super.update(id, data);

    return drugDistributionItems;
  }

  /**
   * Delete drugDistributionItems
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugDistributionItems with ID:', id);

      // Check if drugDistributionItems exists first
      const existing = await this.drugDistributionItemsRepository.findById(id);
      if (!existing) {
        console.log('DrugDistributionItems not found for deletion:', id);
        return false;
      }

      console.log('Found drugDistributionItems to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugDistributionItemsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugDistributionItems deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugDistributionItems:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugDistributionItems
   */
  protected async validateCreate(
    data: CreateDrugDistributionItems,
  ): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: quantity_dispensed must be positive
    if (
      data.quantity_dispensed !== undefined &&
      data.quantity_dispensed !== null
    ) {
      if (Number(data.quantity_dispensed) < 0) {
        const error = new Error(
          DrugDistributionItemsErrorMessages[
            DrugDistributionItemsErrorCode.INVALID_VALUE_QUANTITY_DISPENSED
          ],
        ) as any;
        error.statusCode = 422;
        error.code =
          DrugDistributionItemsErrorCode.INVALID_VALUE_QUANTITY_DISPENSED;
        throw error;
      }
    }

    // Business rule: unit_cost must be positive
    if (data.unit_cost !== undefined && data.unit_cost !== null) {
      if (Number(data.unit_cost) < 0) {
        const error = new Error(
          DrugDistributionItemsErrorMessages[
            DrugDistributionItemsErrorCode.INVALID_VALUE_UNIT_COST
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugDistributionItemsErrorCode.INVALID_VALUE_UNIT_COST;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugDistributionItems,
  ): Promise<CreateDrugDistributionItems> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugDistributionItems creation
   */
  protected async afterCreate(
    drugDistributionItems: DrugDistributionItems,
    _originalData: CreateDrugDistributionItems,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugDistributionItems created:',
      JSON.stringify(drugDistributionItems),
      '(ID: ' + drugDistributionItems.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugDistributionItems,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
