import { BaseService } from '../../../../shared/services/base.service';
import { DistributionTypesRepository } from './distribution-types.repository';
import {
  type DistributionTypes,
  type CreateDistributionTypes,
  type UpdateDistributionTypes,
  type GetDistributionTypesQuery,
  type ListDistributionTypesQuery,
  DistributionTypesErrorCode,
  DistributionTypesErrorMessages,
} from './distribution-types.types';

/**
 * DistributionTypes Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DistributionTypesService extends BaseService<
  DistributionTypes,
  CreateDistributionTypes,
  UpdateDistributionTypes
> {
  constructor(
    private distributionTypesRepository: DistributionTypesRepository,
  ) {
    super(distributionTypesRepository);
  }

  /**
   * Get distributionTypes by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDistributionTypesQuery = {},
  ): Promise<DistributionTypes | null> {
    const distributionTypes = await this.getById(id);

    if (distributionTypes) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return distributionTypes;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDistributionTypesQuery = {}): Promise<{
    data: DistributionTypes[];
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
   * Create new distributionTypes
   */
  async create(data: CreateDistributionTypes): Promise<DistributionTypes> {
    const distributionTypes = await super.create(data);

    return distributionTypes;
  }

  /**
   * Update existing distributionTypes
   */
  async update(
    id: string | number,
    data: UpdateDistributionTypes,
  ): Promise<DistributionTypes | null> {
    const distributionTypes = await super.update(id, data);

    return distributionTypes;
  }

  /**
   * Delete distributionTypes
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete distributionTypes with ID:', id);

      // Check if distributionTypes exists first
      const existing = await this.distributionTypesRepository.findById(id);
      if (!existing) {
        console.log('DistributionTypes not found for deletion:', id);
        return false;
      }

      console.log('Found distributionTypes to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.distributionTypesRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DistributionTypes deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting distributionTypes:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating distributionTypes
   */
  protected async validateCreate(data: CreateDistributionTypes): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDistributionTypes,
  ): Promise<CreateDistributionTypes> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after distributionTypes creation
   */
  protected async afterCreate(
    distributionTypes: DistributionTypes,
    _originalData: CreateDistributionTypes,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DistributionTypes created:',
      JSON.stringify(distributionTypes),
      '(ID: ' + distributionTypes.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DistributionTypes,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.distributionTypesRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DistributionTypesErrorMessages[
            DistributionTypesErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DistributionTypesErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete distributionTypes - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
