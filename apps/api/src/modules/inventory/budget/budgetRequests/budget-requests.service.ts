import { BaseService } from '../../../../shared/services/base.service';
import { BudgetRequestsRepository } from './budget-requests.repository';
import {
  type BudgetRequests,
  type CreateBudgetRequests,
  type UpdateBudgetRequests,
  type GetBudgetRequestsQuery,
  type ListBudgetRequestsQuery,
  BudgetRequestsErrorCode,
  BudgetRequestsErrorMessages,
} from './budget-requests.types';

/**
 * BudgetRequests Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class BudgetRequestsService extends BaseService<
  BudgetRequests,
  CreateBudgetRequests,
  UpdateBudgetRequests
> {
  constructor(private budgetRequestsRepository: BudgetRequestsRepository) {
    super(budgetRequestsRepository);
  }

  /**
   * Get budgetRequests by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetBudgetRequestsQuery = {},
  ): Promise<BudgetRequests | null> {
    const budgetRequests = await this.getById(id);

    if (budgetRequests) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return budgetRequests;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListBudgetRequestsQuery = {}): Promise<{
    data: BudgetRequests[];
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
   * Create new budgetRequests
   */
  async create(data: CreateBudgetRequests): Promise<BudgetRequests> {
    const budgetRequests = await super.create(data);

    return budgetRequests;
  }

  /**
   * Update existing budgetRequests
   */
  async update(
    id: string | number,
    data: UpdateBudgetRequests,
  ): Promise<BudgetRequests | null> {
    const budgetRequests = await super.update(id, data);

    return budgetRequests;
  }

  /**
   * Delete budgetRequests
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete budgetRequests with ID:', id);

      // Check if budgetRequests exists first
      const existing = await this.budgetRequestsRepository.findById(id);
      if (!existing) {
        console.log('BudgetRequests not found for deletion:', id);
        return false;
      }

      console.log('Found budgetRequests to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.budgetRequestsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('BudgetRequests deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting budgetRequests:', error);
      return false;
    }
  }

  // ===== WORKFLOW METHODS =====

  /**
   * Submit budget request for approval
   * Status: DRAFT → SUBMITTED
   */
  async submit(
    id: string | number,
    userId: string,
  ): Promise<BudgetRequests | null> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot submit budget request with status: ${request.status}`,
      );
    }

    const updated = await this.budgetRequestsRepository.update(id, {
      status: 'SUBMITTED',
      submitted_by: userId,
      submitted_at: new Date().toISOString(),
    });

    console.log('Budget request submitted:', { id, userId });

    return updated;
  }

  /**
   * Approve budget request by department head
   * Status: SUBMITTED → DEPT_APPROVED
   */
  async approveDept(
    id: string | number,
    userId: string,
    comments?: string,
  ): Promise<BudgetRequests | null> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'SUBMITTED') {
      throw new Error(
        `Cannot approve budget request with status: ${request.status}. Must be SUBMITTED.`,
      );
    }

    const updated = await this.budgetRequestsRepository.update(id, {
      status: 'DEPT_APPROVED',
      dept_reviewed_by: userId,
      dept_reviewed_at: new Date().toISOString(),
      dept_comments: comments,
    });

    console.log('Budget request approved by department:', { id, userId });

    return updated;
  }

  /**
   * Approve budget request by finance manager
   * Status: DEPT_APPROVED → FINANCE_APPROVED
   * This will also create budget_allocations from approved items
   */
  async approveFinance(
    id: string | number,
    userId: string,
    comments?: string,
  ): Promise<BudgetRequests | null> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DEPT_APPROVED') {
      throw new Error(
        `Cannot approve budget request with status: ${request.status}. Must be DEPT_APPROVED.`,
      );
    }

    // Get knex instance from repository
    const knex = (this.budgetRequestsRepository as any).knex;

    // Use transaction to ensure atomicity
    const trx = await knex.transaction();

    try {
      // Step 1: Update budget request status
      const updated = await trx('inventory.budget_requests')
        .where({ id })
        .update({
          status: 'FINANCE_APPROVED',
          finance_reviewed_by: userId,
          finance_reviewed_at: new Date(),
          finance_comments: comments,
          updated_at: new Date(),
        })
        .returning('*')
        .then((rows: any[]) => rows[0]);

      // Step 2: Fetch all budget_request_items for this request
      const requestItems = await trx('inventory.budget_request_items')
        .where({ budget_request_id: id })
        .select('*');

      console.log(
        `Found ${requestItems.length} budget request items to process`,
      );

      // Step 3: Create or update budget_allocations for each item
      for (const item of requestItems) {
        const allocationData = {
          fiscal_year: request.fiscal_year,
          budget_id: item.budget_id,
          department_id: request.department_id,
          total_budget: item.requested_amount,
          q1_budget: item.q1_amount,
          q2_budget: item.q2_amount,
          q3_budget: item.q3_amount,
          q4_budget: item.q4_amount,
          remaining_budget: item.requested_amount, // Initially, no spending
          total_spent: 0,
          q1_spent: 0,
          q2_spent: 0,
          q3_spent: 0,
          q4_spent: 0,
          is_active: true,
          updated_at: new Date(),
        };

        // UPSERT: Insert or update if already exists
        // PostgreSQL's ON CONFLICT syntax
        await trx.raw(
          `
          INSERT INTO inventory.budget_allocations (
            fiscal_year, budget_id, department_id, total_budget,
            q1_budget, q2_budget, q3_budget, q4_budget,
            q1_spent, q2_spent, q3_spent, q4_spent,
            total_spent, remaining_budget, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON CONFLICT (fiscal_year, budget_id, department_id)
          DO UPDATE SET
            total_budget = budget_allocations.total_budget + EXCLUDED.total_budget,
            q1_budget = budget_allocations.q1_budget + EXCLUDED.q1_budget,
            q2_budget = budget_allocations.q2_budget + EXCLUDED.q2_budget,
            q3_budget = budget_allocations.q3_budget + EXCLUDED.q3_budget,
            q4_budget = budget_allocations.q4_budget + EXCLUDED.q4_budget,
            remaining_budget = budget_allocations.remaining_budget + EXCLUDED.total_budget,
            updated_at = NOW()
        `,
          [
            allocationData.fiscal_year,
            allocationData.budget_id,
            allocationData.department_id,
            allocationData.total_budget,
            allocationData.q1_budget,
            allocationData.q2_budget,
            allocationData.q3_budget,
            allocationData.q4_budget,
            allocationData.q1_spent,
            allocationData.q2_spent,
            allocationData.q3_spent,
            allocationData.q4_spent,
            allocationData.total_spent,
            allocationData.remaining_budget,
            allocationData.is_active,
          ],
        );

        console.log(
          `Created/updated budget allocation for budget_id: ${item.budget_id}`,
        );
      }

      // Commit transaction
      await trx.commit();

      console.log('Budget request approved by finance:', { id, userId });
      console.log(
        `Auto-created/updated ${requestItems.length} budget allocations`,
      );

      return updated;
    } catch (error) {
      // Rollback on error
      await trx.rollback();
      console.error('Error approving finance and creating allocations:', error);
      throw error;
    }
  }

  /**
   * Reject budget request
   * Can reject at any stage after SUBMITTED
   */
  async reject(
    id: string | number,
    userId: string,
    reason: string,
  ): Promise<BudgetRequests | null> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status === 'DRAFT' || request.status === 'REJECTED') {
      throw new Error(
        `Cannot reject budget request with status: ${request.status}`,
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    const updated = await this.budgetRequestsRepository.update(id, {
      status: 'REJECTED',
      rejection_reason: reason,
      // Store who rejected it based on current status
      ...(request.status === 'SUBMITTED' && {
        dept_reviewed_by: userId,
        dept_reviewed_at: new Date().toISOString(),
      }),
      ...(request.status === 'DEPT_APPROVED' && {
        finance_reviewed_by: userId,
        finance_reviewed_at: new Date().toISOString(),
      }),
    });

    console.log('Budget request rejected:', { id, userId, reason });

    return updated;
  }

  /**
   * Initialize budget request with drug generics
   * Pulls all active drugs and calculates historical usage
   * Status: Must be DRAFT
   */
  async initialize(
    id: string | number,
    userId: string,
  ): Promise<{
    success: boolean;
    itemsCreated: number;
    message: string;
  }> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot initialize budget request with status: ${request.status}. Must be DRAFT.`,
      );
    }

    // Get knex instance from repository
    const knex = (this.budgetRequestsRepository as any).knex;

    try {
      console.log(`Starting initialization for budget request ${id}...`);

      // Step 1: Get all active drug generics
      const drugGenerics = await knex('inventory.drug_generics')
        .where({ is_active: true })
        .select('*')
        .orderBy('generic_code');

      console.log(`Found ${drugGenerics.length} active drug generics`);

      if (drugGenerics.length === 0) {
        return {
          success: false,
          itemsCreated: 0,
          message: 'No active drug generics found',
        };
      }

      let itemsCreated = 0;

      // Step 2: For each drug generic, calculate historical usage and create item
      for (const generic of drugGenerics) {
        // Calculate historical usage from drug_distributions
        // Query drug_distribution_items joined with drug_distributions
        // Filter by fiscal year and sum quantity_dispensed

        const usage2566 = await this.calculateYearlyUsage(
          knex,
          generic.id,
          2566,
        );
        const usage2567 = await this.calculateYearlyUsage(
          knex,
          generic.id,
          2567,
        );
        const usage2568 = await this.calculateYearlyUsage(
          knex,
          generic.id,
          2568,
        );

        // Calculate average usage
        const avgUsage = (usage2566 + usage2567 + usage2568) / 3;

        // Estimate usage for 2569 (using average)
        const estimatedUsage2569 = Math.round(avgUsage);

        // Get current stock (placeholder - would come from inventory table)
        const currentStock = 0;

        // Calculate estimated purchase
        const estimatedPurchase = Math.max(
          0,
          estimatedUsage2569 - currentStock,
        );

        // Get latest unit price (placeholder - would come from drugs table)
        const unitPrice = 0;

        // Calculate requested amount
        const requestedAmount = estimatedPurchase * unitPrice;

        // Distribute quarterly (25% each quarter for now)
        const q1Qty = Math.round(estimatedPurchase * 0.25);
        const q2Qty = Math.round(estimatedPurchase * 0.25);
        const q3Qty = Math.round(estimatedPurchase * 0.25);
        const q4Qty = estimatedPurchase - (q1Qty + q2Qty + q3Qty); // Remainder

        // Create budget_request_item
        await knex('inventory.budget_request_items').insert({
          budget_request_id: id,
          budget_id: 1, // Default budget (would be determined by business logic)

          // Drug information
          generic_id: generic.id,
          generic_code: generic.generic_code,
          generic_name: generic.generic_name,
          package_size: generic.package_size || '',
          unit: generic.unit || '',
          line_number: itemsCreated + 1,

          // Historical usage
          usage_year_2566: usage2566,
          usage_year_2567: usage2567,
          usage_year_2568: usage2568,
          avg_usage: avgUsage,

          // Planning data
          estimated_usage_2569: estimatedUsage2569,
          current_stock: currentStock,
          estimated_purchase: estimatedPurchase,

          // Pricing and quantities
          unit_price: unitPrice,
          requested_qty: estimatedPurchase,
          requested_amount: requestedAmount,

          // Quarterly distribution
          q1_qty: q1Qty,
          q2_qty: q2Qty,
          q3_qty: q3Qty,
          q4_qty: q4Qty,

          // Audit
          created_at: new Date(),
          updated_at: new Date(),
        });

        itemsCreated++;
      }

      console.log(
        `Successfully initialized ${itemsCreated} budget request items`,
      );

      return {
        success: true,
        itemsCreated,
        message: `Successfully initialized ${itemsCreated} drug items with historical usage data`,
      };
    } catch (error) {
      console.error('Error initializing budget request:', error);
      throw error;
    }
  }

  /**
   * Calculate yearly usage for a drug generic from drug_distributions
   * @param knex Knex instance
   * @param genericId Generic drug ID
   * @param fiscalYear Fiscal year (e.g., 2566)
   * @returns Total quantity dispensed in that year
   */
  private async calculateYearlyUsage(
    knex: any,
    genericId: number,
    fiscalYear: number,
  ): Promise<number> {
    // Convert Buddhist year to AD year for date comparison
    const startYear = fiscalYear - 543; // e.g., 2566 -> 2023
    const startDate = `${startYear}-10-01`; // Fiscal year starts Oct 1
    const endDate = `${startYear + 1}-09-30`; // Fiscal year ends Sep 30

    const result = await knex('inventory.drug_distribution_items as ddi')
      .join(
        'inventory.drug_distributions as dd',
        'ddi.distribution_id',
        '=',
        'dd.id',
      )
      .join('inventory.drugs as d', 'ddi.drug_id', '=', 'd.id')
      .where('d.generic_id', genericId)
      .whereBetween('dd.distribution_date', [startDate, endDate])
      .sum('ddi.quantity_dispensed as total')
      .first();

    return parseFloat(result?.total || 0);
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating budgetRequests
   */
  protected async validateCreate(data: CreateBudgetRequests): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: total_requested_amount must be positive
    if (
      data.total_requested_amount !== undefined &&
      data.total_requested_amount !== null
    ) {
      if (Number(data.total_requested_amount) < 0) {
        const error = new Error(
          BudgetRequestsErrorMessages[
            BudgetRequestsErrorCode.INVALID_VALUE_TOTAL_REQUESTED_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code =
          BudgetRequestsErrorCode.INVALID_VALUE_TOTAL_REQUESTED_AMOUNT;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateBudgetRequests,
  ): Promise<CreateBudgetRequests> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after budgetRequests creation
   */
  protected async afterCreate(
    budgetRequests: BudgetRequests,
    _originalData: CreateBudgetRequests,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'BudgetRequests created:',
      JSON.stringify(budgetRequests),
      '(ID: ' + budgetRequests.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: BudgetRequests,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'D') {
      throw new Error('Cannot delete D ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.budgetRequestsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          BudgetRequestsErrorMessages[
            BudgetRequestsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = BudgetRequestsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete budgetRequests - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
