import { BaseService } from '../../../../shared/services/base.service';
import { DrugLotsRepository } from './drug-lots.repository';
import {
  type DrugLots,
  type CreateDrugLots,
  type UpdateDrugLots,
  type GetDrugLotsQuery,
  type ListDrugLotsQuery,
  DrugLotsErrorCode,
  DrugLotsErrorMessages,
} from './drug-lots.types';

/**
 * DrugLots Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugLotsService extends BaseService<
  DrugLots,
  CreateDrugLots,
  UpdateDrugLots
> {
  constructor(private drugLotsRepository: DrugLotsRepository) {
    super(drugLotsRepository);
  }

  /**
   * Get drugLots by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugLotsQuery = {},
  ): Promise<DrugLots | null> {
    const drugLots = await this.getById(id);

    if (drugLots) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugLots;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugLotsQuery = {}): Promise<{
    data: DrugLots[];
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
   * Create new drugLots
   */
  async create(data: CreateDrugLots): Promise<DrugLots> {
    const drugLots = await super.create(data);

    return drugLots;
  }

  /**
   * Update existing drugLots
   */
  async update(
    id: string | number,
    data: UpdateDrugLots,
  ): Promise<DrugLots | null> {
    const drugLots = await super.update(id, data);

    return drugLots;
  }

  /**
   * Delete drugLots
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugLots with ID:', id);

      // Check if drugLots exists first
      const existing = await this.drugLotsRepository.findById(id);
      if (!existing) {
        console.log('DrugLots not found for deletion:', id);
        return false;
      }

      console.log('Found drugLots to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugLotsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugLots deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugLots:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugLots
   */
  protected async validateCreate(data: CreateDrugLots): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: quantity_available must be positive
    if (
      data.quantity_available !== undefined &&
      data.quantity_available !== null
    ) {
      if (Number(data.quantity_available) < 0) {
        const error = new Error(
          DrugLotsErrorMessages[
            DrugLotsErrorCode.INVALID_VALUE_QUANTITY_AVAILABLE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugLotsErrorCode.INVALID_VALUE_QUANTITY_AVAILABLE;
        throw error;
      }
    }

    // Business rule: unit_cost must be positive
    if (data.unit_cost !== undefined && data.unit_cost !== null) {
      if (Number(data.unit_cost) < 0) {
        const error = new Error(
          DrugLotsErrorMessages[DrugLotsErrorCode.INVALID_VALUE_UNIT_COST],
        ) as any;
        error.statusCode = 422;
        error.code = DrugLotsErrorCode.INVALID_VALUE_UNIT_COST;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateDrugLots): Promise<CreateDrugLots> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugLots creation
   */
  protected async afterCreate(
    drugLots: DrugLots,
    _originalData: CreateDrugLots,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugLots created:',
      JSON.stringify(drugLots),
      '(ID: ' + drugLots.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugLots,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
