import { BaseService } from '../../../../shared/services/base.service';
import { DrugsRepository } from './drugs.repository';
import {
  type Drugs,
  type CreateDrugs,
  type UpdateDrugs,
  type GetDrugsQuery,
  type ListDrugsQuery,
  DrugsErrorCode,
  DrugsErrorMessages,
} from './drugs.types';

/**
 * Drugs Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugsService extends BaseService<Drugs, CreateDrugs, UpdateDrugs> {
  constructor(private drugsRepository: DrugsRepository) {
    super(drugsRepository);
  }

  /**
   * Get drugs by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugsQuery = {},
  ): Promise<Drugs | null> {
    const drugs = await this.getById(id);

    if (drugs) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugs;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugsQuery = {}): Promise<{
    data: Drugs[];
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
   * Create new drugs
   */
  async create(data: CreateDrugs): Promise<Drugs> {
    const drugs = await super.create(data);

    return drugs;
  }

  /**
   * Update existing drugs
   */
  async update(id: string | number, data: UpdateDrugs): Promise<Drugs | null> {
    const drugs = await super.update(id, data);

    return drugs;
  }

  /**
   * Delete drugs
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugs with ID:', id);

      // Check if drugs exists first
      const existing = await this.drugsRepository.findById(id);
      if (!existing) {
        console.log('Drugs not found for deletion:', id);
        return false;
      }

      console.log('Found drugs to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Drugs deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugs:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugs
   */
  protected async validateCreate(data: CreateDrugs): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: unit_price must be positive
    if (data.unit_price !== undefined && data.unit_price !== null) {
      if (Number(data.unit_price) < 0) {
        const error = new Error(
          DrugsErrorMessages[DrugsErrorCode.INVALID_VALUE_UNIT_PRICE],
        ) as any;
        error.statusCode = 422;
        error.code = DrugsErrorCode.INVALID_VALUE_UNIT_PRICE;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateDrugs): Promise<CreateDrugs> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugs creation
   */
  protected async afterCreate(
    drugs: Drugs,
    _originalData: CreateDrugs,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Drugs created:',
      JSON.stringify(drugs),
      '(ID: ' + drugs.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Drugs,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.drugsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DrugsErrorMessages[DrugsErrorCode.CANNOT_DELETE_HAS_REFERENCES],
        ) as any;
        error.statusCode = 422;
        error.code = DrugsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete drugs - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
