import { BaseService } from '../../../../shared/services/base.service';
import { ReturnActionsRepository } from './return-actions.repository';
import {
  type ReturnActions,
  type CreateReturnActions,
  type UpdateReturnActions,
  type GetReturnActionsQuery,
  type ListReturnActionsQuery,
  ReturnActionsErrorCode,
  ReturnActionsErrorMessages,
} from './return-actions.types';

/**
 * ReturnActions Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ReturnActionsService extends BaseService<
  ReturnActions,
  CreateReturnActions,
  UpdateReturnActions
> {
  constructor(private returnActionsRepository: ReturnActionsRepository) {
    super(returnActionsRepository);
  }

  /**
   * Get returnActions by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetReturnActionsQuery = {},
  ): Promise<ReturnActions | null> {
    const returnActions = await this.getById(id);

    if (returnActions) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return returnActions;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListReturnActionsQuery = {}): Promise<{
    data: ReturnActions[];
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
   * Create new returnActions
   */
  async create(data: CreateReturnActions): Promise<ReturnActions> {
    const returnActions = await super.create(data);

    return returnActions;
  }

  /**
   * Update existing returnActions
   */
  async update(
    id: string | number,
    data: UpdateReturnActions,
  ): Promise<ReturnActions | null> {
    const returnActions = await super.update(id, data);

    return returnActions;
  }

  /**
   * Delete returnActions
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete returnActions with ID:', id);

      // Check if returnActions exists first
      const existing = await this.returnActionsRepository.findById(id);
      if (!existing) {
        console.log('ReturnActions not found for deletion:', id);
        return false;
      }

      console.log('Found returnActions to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.returnActionsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('ReturnActions deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting returnActions:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating returnActions
   */
  protected async validateCreate(data: CreateReturnActions): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateReturnActions,
  ): Promise<CreateReturnActions> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after returnActions creation
   */
  protected async afterCreate(
    returnActions: ReturnActions,
    _originalData: CreateReturnActions,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'ReturnActions created:',
      JSON.stringify(returnActions),
      '(ID: ' + returnActions.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: ReturnActions,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.returnActionsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          ReturnActionsErrorMessages[
            ReturnActionsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReturnActionsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete returnActions - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
