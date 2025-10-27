import { BaseService } from '../../../shared/services/base.service';
import { BudgetsRepository } from '../repositories/budgets.repository';
import { EventService } from '../../../shared/websocket/event.service';
import { CrudEventHelper } from '../../../shared/websocket/crud-event-helper';
import {
  type Budgets,
  type CreateBudgets,
  type UpdateBudgets,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
  BudgetsErrorCode,
  BudgetsErrorMessages,
} from '../types/budgets.types';

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
  private eventHelper?: CrudEventHelper;

  constructor(
    private budgetsRepository: BudgetsRepository,
    private eventService?: EventService,
  ) {
    super(budgetsRepository);

    // Initialize event helper using Fastify pattern
    if (eventService) {
      this.eventHelper = eventService.for('budgets', 'budgets');
    }
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

      // Emit read event for monitoring/analytics
      if (this.eventHelper) {
        await this.eventHelper.emitCustom('read', budgets);
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

    // Emit bulk read event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('bulk_read', {
        count: result.data.length,
        filters: options,
      });
    }

    return result;
  }

  /**
   * Create new budgets
   */
  async create(data: CreateBudgets): Promise<Budgets> {
    const budgets = await super.create(data);

    // Emit created event for real-time updates
    if (this.eventHelper) {
      await this.eventHelper.emitCreated(budgets);
    }

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

    if (budgets && this.eventHelper) {
      await this.eventHelper.emitUpdated(budgets);
    }

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

      // Get entity before deletion for event emission
      const budgets = await this.getById(id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.budgetsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted && budgets && this.eventHelper) {
        await this.eventHelper.emitDeleted(budgets.id);
      }

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

    // Check for duplicate budget_code
    if (data.budget_code) {
      const existing = await this.budgetsRepository.findByBudgetCode(
        data.budget_code,
      );
      if (existing) {
        const error = new Error(
          BudgetsErrorMessages[BudgetsErrorCode.DUPLICATE_BUDGET_CODE],
        ) as any;
        error.statusCode = 409;
        error.code = BudgetsErrorCode.DUPLICATE_BUDGET_CODE;
        throw error;
      }
    }

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
  }
}
