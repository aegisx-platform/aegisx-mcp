import { BaseService } from '../../../../shared/services/base.service';
import { DrugGenericsRepository } from './drug-generics.repository';
import {
  type DrugGenerics,
  type CreateDrugGenerics,
  type UpdateDrugGenerics,
  type GetDrugGenericsQuery,
  type ListDrugGenericsQuery,
  DrugGenericsErrorCode,
  DrugGenericsErrorMessages,
} from './drug-generics.types';

/**
 * DrugGenerics Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugGenericsService extends BaseService<
  DrugGenerics,
  CreateDrugGenerics,
  UpdateDrugGenerics
> {
  constructor(private drugGenericsRepository: DrugGenericsRepository) {
    super(drugGenericsRepository);
  }

  /**
   * Get drugGenerics by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugGenericsQuery = {},
  ): Promise<DrugGenerics | null> {
    const drugGenerics = await this.getById(id);

    if (drugGenerics) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugGenerics;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugGenericsQuery = {}): Promise<{
    data: DrugGenerics[];
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
   * Create new drugGenerics
   */
  async create(data: CreateDrugGenerics): Promise<DrugGenerics> {
    const drugGenerics = await super.create(data);

    return drugGenerics;
  }

  /**
   * Update existing drugGenerics
   */
  async update(
    id: string | number,
    data: UpdateDrugGenerics,
  ): Promise<DrugGenerics | null> {
    const drugGenerics = await super.update(id, data);

    return drugGenerics;
  }

  /**
   * Delete drugGenerics
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugGenerics with ID:', id);

      // Check if drugGenerics exists first
      const existing = await this.drugGenericsRepository.findById(id);
      if (!existing) {
        console.log('DrugGenerics not found for deletion:', id);
        return false;
      }

      console.log('Found drugGenerics to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugGenericsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugGenerics deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugGenerics:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugGenerics
   */
  protected async validateCreate(data: CreateDrugGenerics): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugGenerics,
  ): Promise<CreateDrugGenerics> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugGenerics creation
   */
  protected async afterCreate(
    drugGenerics: DrugGenerics,
    _originalData: CreateDrugGenerics,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugGenerics created:',
      JSON.stringify(drugGenerics),
      '(ID: ' + drugGenerics.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugGenerics,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.drugGenericsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DrugGenericsErrorMessages[
            DrugGenericsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DrugGenericsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete drugGenerics - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
