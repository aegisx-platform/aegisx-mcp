import { BaseService } from '../../../../shared/services/base.service';
import { ReturnReasonsRepository } from './return-reasons.repository';
import {
  type ReturnReasons,
  type CreateReturnReasons,
  type UpdateReturnReasons,
  type GetReturnReasonsQuery,
  type ListReturnReasonsQuery,
  ReturnReasonsErrorCode,
  ReturnReasonsErrorMessages,
} from './return-reasons.types';

/**
 * ReturnReasons Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ReturnReasonsService extends BaseService<
  ReturnReasons,
  CreateReturnReasons,
  UpdateReturnReasons
> {
  constructor(private returnReasonsRepository: ReturnReasonsRepository) {
    super(returnReasonsRepository);
  }

  /**
   * Get returnReasons by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetReturnReasonsQuery = {},
  ): Promise<ReturnReasons | null> {
    const returnReasons = await this.getById(id);

    if (returnReasons) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return returnReasons;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListReturnReasonsQuery = {}): Promise<{
    data: ReturnReasons[];
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
   * Create new returnReasons
   */
  async create(data: CreateReturnReasons): Promise<ReturnReasons> {
    const returnReasons = await super.create(data);

    return returnReasons;
  }

  /**
   * Update existing returnReasons
   */
  async update(
    id: string | number,
    data: UpdateReturnReasons,
  ): Promise<ReturnReasons | null> {
    const returnReasons = await super.update(id, data);

    return returnReasons;
  }

  /**
   * Delete returnReasons
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete returnReasons with ID:', id);

      // Check if returnReasons exists first
      const existing = await this.returnReasonsRepository.findById(id);
      if (!existing) {
        console.log('ReturnReasons not found for deletion:', id);
        return false;
      }

      console.log('Found returnReasons to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.returnReasonsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('ReturnReasons deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting returnReasons:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating returnReasons
   */
  protected async validateCreate(data: CreateReturnReasons): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateReturnReasons,
  ): Promise<CreateReturnReasons> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after returnReasons creation
   */
  protected async afterCreate(
    returnReasons: ReturnReasons,
    _originalData: CreateReturnReasons,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'ReturnReasons created:',
      JSON.stringify(returnReasons),
      '(ID: ' + returnReasons.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: ReturnReasons,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.returnReasonsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          ReturnReasonsErrorMessages[
            ReturnReasonsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReturnReasonsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete returnReasons - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
