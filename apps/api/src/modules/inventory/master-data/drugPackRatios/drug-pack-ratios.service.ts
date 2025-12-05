import { BaseService } from '../../../../shared/services/base.service';
import { DrugPackRatiosRepository } from './drug-pack-ratios.repository';
import {
  type DrugPackRatios,
  type CreateDrugPackRatios,
  type UpdateDrugPackRatios,
  type GetDrugPackRatiosQuery,
  type ListDrugPackRatiosQuery,
  DrugPackRatiosErrorCode,
  DrugPackRatiosErrorMessages,
} from './drug-pack-ratios.types';

/**
 * DrugPackRatios Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugPackRatiosService extends BaseService<
  DrugPackRatios,
  CreateDrugPackRatios,
  UpdateDrugPackRatios
> {
  constructor(private drugPackRatiosRepository: DrugPackRatiosRepository) {
    super(drugPackRatiosRepository);
  }

  /**
   * Get drugPackRatios by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugPackRatiosQuery = {},
  ): Promise<DrugPackRatios | null> {
    const drugPackRatios = await this.getById(id);

    if (drugPackRatios) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugPackRatios;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugPackRatiosQuery = {}): Promise<{
    data: DrugPackRatios[];
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
   * Create new drugPackRatios
   */
  async create(data: CreateDrugPackRatios): Promise<DrugPackRatios> {
    const drugPackRatios = await super.create(data);

    return drugPackRatios;
  }

  /**
   * Update existing drugPackRatios
   */
  async update(
    id: string | number,
    data: UpdateDrugPackRatios,
  ): Promise<DrugPackRatios | null> {
    const drugPackRatios = await super.update(id, data);

    return drugPackRatios;
  }

  /**
   * Delete drugPackRatios
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugPackRatios with ID:', id);

      // Check if drugPackRatios exists first
      const existing = await this.drugPackRatiosRepository.findById(id);
      if (!existing) {
        console.log('DrugPackRatios not found for deletion:', id);
        return false;
      }

      console.log('Found drugPackRatios to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugPackRatiosRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugPackRatios deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugPackRatios:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugPackRatios
   */
  protected async validateCreate(data: CreateDrugPackRatios): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: pack_price must be positive
    if (data.pack_price !== undefined && data.pack_price !== null) {
      if (Number(data.pack_price) < 0) {
        const error = new Error(
          DrugPackRatiosErrorMessages[
            DrugPackRatiosErrorCode.INVALID_VALUE_PACK_PRICE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugPackRatiosErrorCode.INVALID_VALUE_PACK_PRICE;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugPackRatios,
  ): Promise<CreateDrugPackRatios> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugPackRatios creation
   */
  protected async afterCreate(
    drugPackRatios: DrugPackRatios,
    _originalData: CreateDrugPackRatios,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugPackRatios created:',
      JSON.stringify(drugPackRatios),
      '(ID: ' + drugPackRatios.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugPackRatios,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
