import { BaseService } from '../../../../shared/services/base.service';
import { DrugReturnsRepository } from './drug-returns.repository';
import {
  type DrugReturns,
  type CreateDrugReturns,
  type UpdateDrugReturns,
  type GetDrugReturnsQuery,
  type ListDrugReturnsQuery,
  DrugReturnsErrorCode,
  DrugReturnsErrorMessages,
} from './drug-returns.types';

/**
 * DrugReturns Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugReturnsService extends BaseService<
  DrugReturns,
  CreateDrugReturns,
  UpdateDrugReturns
> {
  constructor(private drugReturnsRepository: DrugReturnsRepository) {
    super(drugReturnsRepository);
  }

  /**
   * Get drugReturns by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugReturnsQuery = {},
  ): Promise<DrugReturns | null> {
    const drugReturns = await this.getById(id);

    if (drugReturns) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugReturns;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugReturnsQuery = {}): Promise<{
    data: DrugReturns[];
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
   * Create new drugReturns
   */
  async create(data: CreateDrugReturns): Promise<DrugReturns> {
    const drugReturns = await super.create(data);

    return drugReturns;
  }

  /**
   * Update existing drugReturns
   */
  async update(
    id: string | number,
    data: UpdateDrugReturns,
  ): Promise<DrugReturns | null> {
    const drugReturns = await super.update(id, data);

    return drugReturns;
  }

  /**
   * Delete drugReturns
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugReturns with ID:', id);

      // Check if drugReturns exists first
      const existing = await this.drugReturnsRepository.findById(id);
      if (!existing) {
        console.log('DrugReturns not found for deletion:', id);
        return false;
      }

      console.log('Found drugReturns to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugReturnsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugReturns deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugReturns:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugReturns
   */
  protected async validateCreate(data: CreateDrugReturns): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: total_amount must be positive
    if (data.total_amount !== undefined && data.total_amount !== null) {
      if (Number(data.total_amount) < 0) {
        const error = new Error(
          DrugReturnsErrorMessages[
            DrugReturnsErrorCode.INVALID_VALUE_TOTAL_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugReturnsErrorCode.INVALID_VALUE_TOTAL_AMOUNT;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugReturns,
  ): Promise<CreateDrugReturns> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugReturns creation
   */
  protected async afterCreate(
    drugReturns: DrugReturns,
    _originalData: CreateDrugReturns,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugReturns created:',
      JSON.stringify(drugReturns),
      '(ID: ' + drugReturns.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugReturns,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'D') {
      throw new Error('Cannot delete D ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.drugReturnsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DrugReturnsErrorMessages[
            DrugReturnsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugReturnsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete drugReturns - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
