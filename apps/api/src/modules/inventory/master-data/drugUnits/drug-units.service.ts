import { BaseService } from '../../../../shared/services/base.service';
import { DrugUnitsRepository } from './drug-units.repository';
import {
  type DrugUnits,
  type CreateDrugUnits,
  type UpdateDrugUnits,
  type GetDrugUnitsQuery,
  type ListDrugUnitsQuery,
  DrugUnitsErrorCode,
  DrugUnitsErrorMessages,
} from './drug-units.types';

/**
 * DrugUnits Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugUnitsService extends BaseService<
  DrugUnits,
  CreateDrugUnits,
  UpdateDrugUnits
> {
  constructor(private drugUnitsRepository: DrugUnitsRepository) {
    super(drugUnitsRepository);
  }

  /**
   * Get drugUnits by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugUnitsQuery = {},
  ): Promise<DrugUnits | null> {
    const drugUnits = await this.getById(id);

    if (drugUnits) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugUnits;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugUnitsQuery = {}): Promise<{
    data: DrugUnits[];
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
   * Create new drugUnits
   */
  async create(data: CreateDrugUnits): Promise<DrugUnits> {
    const drugUnits = await super.create(data);

    return drugUnits;
  }

  /**
   * Update existing drugUnits
   */
  async update(
    id: string | number,
    data: UpdateDrugUnits,
  ): Promise<DrugUnits | null> {
    const drugUnits = await super.update(id, data);

    return drugUnits;
  }

  /**
   * Delete drugUnits
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugUnits with ID:', id);

      // Check if drugUnits exists first
      const existing = await this.drugUnitsRepository.findById(id);
      if (!existing) {
        console.log('DrugUnits not found for deletion:', id);
        return false;
      }

      console.log('Found drugUnits to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugUnitsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugUnits deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugUnits:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugUnits
   */
  protected async validateCreate(data: CreateDrugUnits): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugUnits,
  ): Promise<CreateDrugUnits> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugUnits creation
   */
  protected async afterCreate(
    drugUnits: DrugUnits,
    _originalData: CreateDrugUnits,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugUnits created:',
      JSON.stringify(drugUnits),
      '(ID: ' + drugUnits.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugUnits,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.drugUnitsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DrugUnitsErrorMessages[
            DrugUnitsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugUnitsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete drugUnits - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
