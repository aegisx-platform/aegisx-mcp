import { BaseService } from '../../../../shared/services/base.service';
import { AdjustmentReasonsRepository } from './adjustment-reasons.repository';
import {
  type AdjustmentReasons,
  type CreateAdjustmentReasons,
  type UpdateAdjustmentReasons,
  type GetAdjustmentReasonsQuery,
  type ListAdjustmentReasonsQuery,
} from './adjustment-reasons.types';

/**
 * AdjustmentReasons Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class AdjustmentReasonsService extends BaseService<
  AdjustmentReasons,
  CreateAdjustmentReasons,
  UpdateAdjustmentReasons
> {
  constructor(
    private adjustmentReasonsRepository: AdjustmentReasonsRepository,
  ) {
    super(adjustmentReasonsRepository);
  }

  /**
   * Get adjustmentReasons by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetAdjustmentReasonsQuery = {},
  ): Promise<AdjustmentReasons | null> {
    const adjustmentReasons = await this.getById(id);

    if (adjustmentReasons) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return adjustmentReasons;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListAdjustmentReasonsQuery = {}): Promise<{
    data: AdjustmentReasons[];
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
   * Create new adjustmentReasons
   */
  async create(data: CreateAdjustmentReasons): Promise<AdjustmentReasons> {
    const adjustmentReasons = await super.create(data);

    return adjustmentReasons;
  }

  /**
   * Update existing adjustmentReasons
   */
  async update(
    id: string | number,
    data: UpdateAdjustmentReasons,
  ): Promise<AdjustmentReasons | null> {
    const adjustmentReasons = await super.update(id, data);

    return adjustmentReasons;
  }

  /**
   * Delete adjustmentReasons
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete adjustmentReasons with ID:', id);

      // Check if adjustmentReasons exists first
      const existing = await this.adjustmentReasonsRepository.findById(id);
      if (!existing) {
        console.log('AdjustmentReasons not found for deletion:', id);
        return false;
      }

      console.log('Found adjustmentReasons to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.adjustmentReasonsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('AdjustmentReasons deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting adjustmentReasons:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating adjustmentReasons
   */
  protected async validateCreate(data: CreateAdjustmentReasons): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateAdjustmentReasons,
  ): Promise<CreateAdjustmentReasons> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after adjustmentReasons creation
   */
  protected async afterCreate(
    adjustmentReasons: AdjustmentReasons,
    _originalData: CreateAdjustmentReasons,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'AdjustmentReasons created:',
      JSON.stringify(adjustmentReasons),
      '(ID: ' + adjustmentReasons.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: AdjustmentReasons,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
