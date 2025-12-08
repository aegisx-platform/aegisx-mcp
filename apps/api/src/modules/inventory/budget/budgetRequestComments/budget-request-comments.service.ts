import { BaseService } from '../../../../shared/services/base.service';
import { BudgetRequestCommentsRepository } from './budget-request-comments.repository';
import {
  type BudgetRequestComments,
  type CreateBudgetRequestComments,
  type UpdateBudgetRequestComments,
  type GetBudgetRequestCommentsQuery,
  type ListBudgetRequestCommentsQuery,
  BudgetRequestCommentsErrorCode,
  BudgetRequestCommentsErrorMessages,
} from './budget-request-comments.types';

/**
 * BudgetRequestComments Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class BudgetRequestCommentsService extends BaseService<
  BudgetRequestComments,
  CreateBudgetRequestComments,
  UpdateBudgetRequestComments
> {
  constructor(
    private budgetRequestCommentsRepository: BudgetRequestCommentsRepository,
  ) {
    super(budgetRequestCommentsRepository);
  }

  /**
   * Get budgetRequestComments by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetBudgetRequestCommentsQuery = {},
  ): Promise<BudgetRequestComments | null> {
    const budgetRequestComments = await this.getById(id);

    if (budgetRequestComments) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return budgetRequestComments;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListBudgetRequestCommentsQuery = {}): Promise<{
    data: BudgetRequestComments[];
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
   * Create new budgetRequestComments
   */
  async create(
    data: CreateBudgetRequestComments,
  ): Promise<BudgetRequestComments> {
    const budgetRequestComments = await super.create(data);

    return budgetRequestComments;
  }

  /**
   * Update existing budgetRequestComments
   */
  async update(
    id: string | number,
    data: UpdateBudgetRequestComments,
  ): Promise<BudgetRequestComments | null> {
    const budgetRequestComments = await super.update(id, data);

    return budgetRequestComments;
  }

  /**
   * Delete budgetRequestComments
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete budgetRequestComments with ID:', id);

      // Check if budgetRequestComments exists first
      const existing = await this.budgetRequestCommentsRepository.findById(id);
      if (!existing) {
        console.log('BudgetRequestComments not found for deletion:', id);
        return false;
      }

      console.log('Found budgetRequestComments to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.budgetRequestCommentsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('BudgetRequestComments deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting budgetRequestComments:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating budgetRequestComments
   */
  protected async validateCreate(
    data: CreateBudgetRequestComments,
  ): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateBudgetRequestComments,
  ): Promise<CreateBudgetRequestComments> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after budgetRequestComments creation
   */
  protected async afterCreate(
    budgetRequestComments: BudgetRequestComments,
    _originalData: CreateBudgetRequestComments,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'BudgetRequestComments created:',
      JSON.stringify(budgetRequestComments),
      '(ID: ' + budgetRequestComments.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: BudgetRequestComments,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck =
      await this.budgetRequestCommentsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          BudgetRequestCommentsErrorMessages[
            BudgetRequestCommentsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code =
          BudgetRequestCommentsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete budgetRequestComments - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
