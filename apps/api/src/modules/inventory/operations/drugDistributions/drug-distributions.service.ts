import { BaseService } from '../../../../shared/services/base.service';
import { DrugDistributionsRepository } from './drug-distributions.repository';
import {
  type DrugDistributions,
  type CreateDrugDistributions,
  type UpdateDrugDistributions,
  type GetDrugDistributionsQuery,
  type ListDrugDistributionsQuery,
  DrugDistributionsErrorCode,
  DrugDistributionsErrorMessages,
} from './drug-distributions.types';

/**
 * DrugDistributions Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugDistributionsService extends BaseService<
  DrugDistributions,
  CreateDrugDistributions,
  UpdateDrugDistributions
> {
  constructor(
    private drugDistributionsRepository: DrugDistributionsRepository,
  ) {
    super(drugDistributionsRepository);
  }

  /**
   * Get drugDistributions by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugDistributionsQuery = {},
  ): Promise<DrugDistributions | null> {
    const drugDistributions = await this.getById(id);

    if (drugDistributions) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugDistributions;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugDistributionsQuery = {}): Promise<{
    data: DrugDistributions[];
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
   * Create new drugDistributions
   */
  async create(data: CreateDrugDistributions): Promise<DrugDistributions> {
    const drugDistributions = await super.create(data);

    return drugDistributions;
  }

  /**
   * Update existing drugDistributions
   */
  async update(
    id: string | number,
    data: UpdateDrugDistributions,
  ): Promise<DrugDistributions | null> {
    const drugDistributions = await super.update(id, data);

    return drugDistributions;
  }

  /**
   * Delete drugDistributions
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugDistributions with ID:', id);

      // Check if drugDistributions exists first
      const existing = await this.drugDistributionsRepository.findById(id);
      if (!existing) {
        console.log('DrugDistributions not found for deletion:', id);
        return false;
      }

      console.log('Found drugDistributions to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugDistributionsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugDistributions deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugDistributions:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugDistributions
   */
  protected async validateCreate(data: CreateDrugDistributions): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: total_amount must be positive
    if (data.total_amount !== undefined && data.total_amount !== null) {
      if (Number(data.total_amount) < 0) {
        const error = new Error(
          DrugDistributionsErrorMessages[
            DrugDistributionsErrorCode.INVALID_VALUE_TOTAL_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugDistributionsErrorCode.INVALID_VALUE_TOTAL_AMOUNT;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugDistributions,
  ): Promise<CreateDrugDistributions> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugDistributions creation
   */
  protected async afterCreate(
    drugDistributions: DrugDistributions,
    _originalData: CreateDrugDistributions,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugDistributions created:',
      JSON.stringify(drugDistributions),
      '(ID: ' + drugDistributions.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugDistributions,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'P') {
      throw new Error('Cannot delete P ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.drugDistributionsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DrugDistributionsErrorMessages[
            DrugDistributionsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugDistributionsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete drugDistributions - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
