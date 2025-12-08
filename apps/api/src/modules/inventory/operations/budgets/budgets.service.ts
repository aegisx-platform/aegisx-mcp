import { BaseService } from '../../../../shared/services/base.service';
import { BudgetsRepository } from './budgets.repository';
import {
  type Budgets,
  type CreateBudgets,
  type UpdateBudgets,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
  BudgetsErrorCode,
  BudgetsErrorMessages,
} from './budgets.types';

/**
 * Budgets Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class BudgetsService extends BaseService<
  Budgets,
  CreateBudgets,
  UpdateBudgets
> {
  constructor(private budgetsRepository: BudgetsRepository) {
    super(budgetsRepository);
  }

  /**
   * Get budgets by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetBudgetsQuery = {},
  ): Promise<Budgets | null> {
    const budgets = await this.getById(id);

    if (budgets) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return budgets;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListBudgetsQuery = {}): Promise<{
    data: Budgets[];
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
   * Create new budgets
   */
  async create(data: CreateBudgets): Promise<Budgets> {
    const budgets = await super.create(data);

    return budgets;
  }

  /**
   * Update existing budgets
   */
  async update(
    id: string | number,
    data: UpdateBudgets,
  ): Promise<Budgets | null> {
    const budgets = await super.update(id, data);

    return budgets;
  }

  /**
   * Delete budgets
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete budgets with ID:', id);

      // Check if budgets exists first
      const existing = await this.budgetsRepository.findById(id);
      if (!existing) {
        console.log('Budgets not found for deletion:', id);
        return false;
      }

      console.log('Found budgets to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.budgetsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Budgets deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting budgets:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating budgets
   */
  protected async validateCreate(data: CreateBudgets): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateBudgets): Promise<CreateBudgets> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after budgets creation
   */
  protected async afterCreate(
    budgets: Budgets,
    _originalData: CreateBudgets,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Budgets created:',
      JSON.stringify(budgets),
      '(ID: ' + budgets.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Budgets,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.budgetsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          BudgetsErrorMessages[BudgetsErrorCode.CANNOT_DELETE_HAS_REFERENCES],
        ) as any;
        error.statusCode = 422;
        error.code = BudgetsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete budgets - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
