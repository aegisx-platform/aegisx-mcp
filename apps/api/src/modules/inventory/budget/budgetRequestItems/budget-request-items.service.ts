import { BaseService } from '../../../../shared/services/base.service';
import { BudgetRequestItemsRepository } from './budget-request-items.repository';
import {
  type BudgetRequestItems,
  type CreateBudgetRequestItems,
  type UpdateBudgetRequestItems,
  type GetBudgetRequestItemsQuery,
  type ListBudgetRequestItemsQuery,
  BudgetRequestItemsErrorCode,
  BudgetRequestItemsErrorMessages,
} from './budget-request-items.types';

/**
 * BudgetRequestItems Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class BudgetRequestItemsService extends BaseService<
  BudgetRequestItems,
  CreateBudgetRequestItems,
  UpdateBudgetRequestItems
> {
  constructor(
    private budgetRequestItemsRepository: BudgetRequestItemsRepository,
  ) {
    super(budgetRequestItemsRepository);
  }

  /**
   * Get budgetRequestItems by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetBudgetRequestItemsQuery = {},
  ): Promise<BudgetRequestItems | null> {
    const budgetRequestItems = await this.getById(id);

    if (budgetRequestItems) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return budgetRequestItems;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListBudgetRequestItemsQuery = {}): Promise<{
    data: BudgetRequestItems[];
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
   * Create new budgetRequestItems
   */
  async create(data: CreateBudgetRequestItems): Promise<BudgetRequestItems> {
    const budgetRequestItems = await super.create(data);

    return budgetRequestItems;
  }

  /**
   * Update existing budgetRequestItems
   */
  async update(
    id: string | number,
    data: UpdateBudgetRequestItems,
  ): Promise<BudgetRequestItems | null> {
    // Get existing item to check budget_request_id
    const existing = await this.budgetRequestItemsRepository.findById(id);
    if (!existing) {
      return null;
    }

    // Hook 1: Validate DRAFT status
    const budgetRequestId =
      data.budget_request_id || existing.budget_request_id;
    const budgetRequest = await (this.budgetRequestItemsRepository as any)
      .db('budget_requests')
      .where('id', budgetRequestId)
      .first();

    if (!budgetRequest) {
      const error = new Error('Budget request not found') as any;
      error.statusCode = 404;
      error.code = 'BUDGET_REQUEST_NOT_FOUND';
      throw error;
    }

    if (budgetRequest.status !== 'DRAFT') {
      const error = new Error(
        'Cannot update items when budget request status is not DRAFT',
      ) as any;
      error.statusCode = 422;
      error.code = 'BUDGET_REQUEST_NOT_DRAFT';
      throw error;
    }

    // Hook 2: Validate quarterly split
    const q1_qty = data.q1_qty !== undefined ? data.q1_qty : existing.q1_qty;
    const q2_qty = data.q2_qty !== undefined ? data.q2_qty : existing.q2_qty;
    const q3_qty = data.q3_qty !== undefined ? data.q3_qty : existing.q3_qty;
    const q4_qty = data.q4_qty !== undefined ? data.q4_qty : existing.q4_qty;
    const requested_qty =
      data.requested_qty !== undefined
        ? data.requested_qty
        : existing.requested_qty;

    if (requested_qty !== null && requested_qty !== undefined) {
      const quarterlyTotal = q1_qty + q2_qty + q3_qty + q4_qty;
      if (quarterlyTotal !== requested_qty) {
        const error = new Error(
          `Quarterly total (${quarterlyTotal}) must equal requested_qty (${requested_qty})`,
        ) as any;
        error.statusCode = 422;
        error.code = 'INVALID_QUARTERLY_SPLIT';
        throw error;
      }
    }

    // Hook 3: Auto-calculate requested_amount
    const unit_price =
      data.unit_price !== undefined ? data.unit_price : existing.unit_price;
    if (
      requested_qty !== undefined &&
      requested_qty !== null &&
      unit_price !== undefined &&
      unit_price !== null
    ) {
      data.requested_amount = requested_qty * unit_price;
    }

    const budgetRequestItems = await super.update(id, data);

    return budgetRequestItems;
  }

  /**
   * Delete budgetRequestItems
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete budgetRequestItems with ID:', id);

      // Check if budgetRequestItems exists first
      const existing = await this.budgetRequestItemsRepository.findById(id);
      if (!existing) {
        console.log('BudgetRequestItems not found for deletion:', id);
        return false;
      }

      console.log('Found budgetRequestItems to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.budgetRequestItemsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('BudgetRequestItems deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting budgetRequestItems:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating budgetRequestItems
   */
  protected async validateCreate(
    data: CreateBudgetRequestItems,
  ): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Hook 1: Validate DRAFT status - can only add items when budget request is in DRAFT status
    const budgetRequest = await (this.budgetRequestItemsRepository as any)
      .db('budget_requests')
      .where('id', data.budget_request_id)
      .first();

    if (!budgetRequest) {
      const error = new Error('Budget request not found') as any;
      error.statusCode = 404;
      error.code = 'BUDGET_REQUEST_NOT_FOUND';
      throw error;
    }

    if (budgetRequest.status !== 'DRAFT') {
      const error = new Error(
        'Cannot add items when budget request status is not DRAFT',
      ) as any;
      error.statusCode = 422;
      error.code = 'BUDGET_REQUEST_NOT_DRAFT';
      throw error;
    }

    // Hook 2: Validate quarterly split - Q1 + Q2 + Q3 + Q4 must equal requested_qty
    if (data.requested_qty !== undefined && data.requested_qty !== null) {
      const q1 = data.q1_qty || 0;
      const q2 = data.q2_qty || 0;
      const q3 = data.q3_qty || 0;
      const q4 = data.q4_qty || 0;
      const quarterlyTotal = q1 + q2 + q3 + q4;

      if (quarterlyTotal !== data.requested_qty) {
        const error = new Error(
          `Quarterly total (${quarterlyTotal}) must equal requested_qty (${data.requested_qty})`,
        ) as any;
        error.statusCode = 422;
        error.code = 'INVALID_QUARTERLY_SPLIT';
        throw error;
      }
    }

    // Business rule: requested_amount must be positive
    if (data.requested_amount !== undefined && data.requested_amount !== null) {
      if (Number(data.requested_amount) < 0) {
        const error = new Error(
          BudgetRequestItemsErrorMessages[
            BudgetRequestItemsErrorCode.INVALID_VALUE_REQUESTED_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = BudgetRequestItemsErrorCode.INVALID_VALUE_REQUESTED_AMOUNT;
        throw error;
      }
    }

    // Business rule: unit_price must be positive
    if (data.unit_price !== undefined && data.unit_price !== null) {
      if (Number(data.unit_price) < 0) {
        const error = new Error(
          BudgetRequestItemsErrorMessages[
            BudgetRequestItemsErrorCode.INVALID_VALUE_UNIT_PRICE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = BudgetRequestItemsErrorCode.INVALID_VALUE_UNIT_PRICE;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateBudgetRequestItems,
  ): Promise<CreateBudgetRequestItems> {
    // Hook 3: Auto-calculate requested_amount = requested_qty × unit_price
    let requested_amount = data.requested_amount;
    if (
      data.requested_qty !== undefined &&
      data.requested_qty !== null &&
      data.unit_price !== undefined &&
      data.unit_price !== null
    ) {
      requested_amount = data.requested_qty * data.unit_price;
    }

    // Hook 4: Auto-assign line_number for Excel export ordering
    let line_number = data.line_number;
    if (line_number === undefined || line_number === null) {
      // Get the max line_number for this budget_request_id
      const maxLineResult = await (this.budgetRequestItemsRepository as any)
        .db('budget_request_items')
        .where('budget_request_id', data.budget_request_id)
        .max('line_number as max_line')
        .first();

      const maxLine = maxLineResult?.max_line || 0;
      line_number = maxLine + 1;
    }

    return {
      ...data,
      requested_amount,
      line_number,
    };
  }

  /**
   * Execute logic after budgetRequestItems creation
   */
  protected async afterCreate(
    budgetRequestItems: BudgetRequestItems,
    _originalData: CreateBudgetRequestItems,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'BudgetRequestItems created:',
      JSON.stringify(budgetRequestItems),
      '(ID: ' + budgetRequestItems.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: BudgetRequestItems,
  ): Promise<void> {
    // Hook 1: Validate DRAFT status - can only delete items when budget request is in DRAFT status
    const budgetRequest = await (this.budgetRequestItemsRepository as any)
      .db('budget_requests')
      .where('id', existing.budget_request_id)
      .first();

    if (!budgetRequest) {
      const error = new Error('Budget request not found') as any;
      error.statusCode = 404;
      error.code = 'BUDGET_REQUEST_NOT_FOUND';
      throw error;
    }

    if (budgetRequest.status !== 'DRAFT') {
      const error = new Error(
        'Cannot delete items when budget request status is not DRAFT',
      ) as any;
      error.statusCode = 422;
      error.code = 'BUDGET_REQUEST_NOT_DRAFT';
      throw error;
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
