import { BaseService } from '../../../../shared/services/base.service';
import { DosageFormsRepository } from './dosage-forms.repository';
import {
  type DosageForms,
  type CreateDosageForms,
  type UpdateDosageForms,
  type GetDosageFormsQuery,
  type ListDosageFormsQuery,
  DosageFormsErrorCode,
  DosageFormsErrorMessages,
} from './dosage-forms.types';

/**
 * DosageForms Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DosageFormsService extends BaseService<
  DosageForms,
  CreateDosageForms,
  UpdateDosageForms
> {
  constructor(private dosageFormsRepository: DosageFormsRepository) {
    super(dosageFormsRepository);
  }

  /**
   * Get dosageForms by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDosageFormsQuery = {},
  ): Promise<DosageForms | null> {
    const dosageForms = await this.getById(id);

    if (dosageForms) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return dosageForms;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDosageFormsQuery = {}): Promise<{
    data: DosageForms[];
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
   * Create new dosageForms
   */
  async create(data: CreateDosageForms): Promise<DosageForms> {
    const dosageForms = await super.create(data);

    return dosageForms;
  }

  /**
   * Update existing dosageForms
   */
  async update(
    id: string | number,
    data: UpdateDosageForms,
  ): Promise<DosageForms | null> {
    const dosageForms = await super.update(id, data);

    return dosageForms;
  }

  /**
   * Delete dosageForms
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete dosageForms with ID:', id);

      // Check if dosageForms exists first
      const existing = await this.dosageFormsRepository.findById(id);
      if (!existing) {
        console.log('DosageForms not found for deletion:', id);
        return false;
      }

      console.log('Found dosageForms to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.dosageFormsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DosageForms deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting dosageForms:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating dosageForms
   */
  protected async validateCreate(data: CreateDosageForms): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDosageForms,
  ): Promise<CreateDosageForms> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after dosageForms creation
   */
  protected async afterCreate(
    dosageForms: DosageForms,
    _originalData: CreateDosageForms,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DosageForms created:',
      JSON.stringify(dosageForms),
      '(ID: ' + dosageForms.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DosageForms,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.dosageFormsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DosageFormsErrorMessages[
            DosageFormsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DosageFormsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete dosageForms - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
