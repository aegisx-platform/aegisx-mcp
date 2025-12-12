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
import { BudgetRequestsAuditService } from './budget-requests-audit.service';
import { BudgetRequestItemsRepository } from '../budgetRequestItems/budget-request-items.repository';
import type { Knex } from 'knex';

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
  private auditService: BudgetRequestsAuditService;
  private budgetRequestItemsRepository: BudgetRequestItemsRepository;

  constructor(
    private budgetRequestsRepository: BudgetRequestsRepository,
    private db: Knex,
    private logger: any,
  ) {
    super(budgetRequestsRepository);
    this.auditService = new BudgetRequestsAuditService(db, logger);
    this.budgetRequestItemsRepository = new BudgetRequestItemsRepository(db);
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
   * Auto-generates: request_number, status=DRAFT, total_requested_amount=0
   */
  async create(data: CreateBudgetRequests): Promise<BudgetRequests> {
    // Auto-generate request_number if not provided
    const requestNumber =
      data.request_number ||
      (await this.generateRequestNumber(data.fiscal_year));

    // Build create data with defaults
    // Handle department_id: 0 → null (TypeBox may coerce null to 0 for Integer type)
    // null means "all departments" per business logic
    const createData: CreateBudgetRequests = {
      ...data,
      request_number: requestNumber,
      status: data.status || 'DRAFT',
      total_requested_amount: data.total_requested_amount ?? 0,
      department_id: data.department_id === 0 ? null : data.department_id,
    };

    const budgetRequests = await super.create(createData);

    return budgetRequests;
  }

  /**
   * Generate unique request number for budget request
   * Format: BR-{fiscal_year}-{sequence}
   * Example: BR-2568-001
   */
  private async generateRequestNumber(fiscalYear: number): Promise<string> {
    const knex = (this.budgetRequestsRepository as any).knex;

    // Get count of existing requests for this fiscal year
    const result = await knex('inventory.budget_requests')
      .where({ fiscal_year: fiscalYear })
      .count('id as count')
      .first();

    const sequence = (parseInt(result?.count || '0') + 1)
      .toString()
      .padStart(3, '0');
    return `BR-${fiscalYear}-${sequence}`;
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

  /**
   * Get aggregated stats for budget requests based on user permissions
   * @param user The authenticated user object, including permissions and department
   * @param filters Query filters like fiscal_year and department_id
   * @returns Aggregated statistics of budget requests
   */
  async getStats(
    user: { id: string; permissions?: string[] }, // Updated user type
    filters: { fiscal_year?: number; department_id?: number },
  ): Promise<{
    total: number;
    by_status: {
      DRAFT: number;
      SUBMITTED: number;
      DEPT_APPROVED: number;
      FINANCE_APPROVED: number;
      REJECTED: number;
    };
  }> {
    const knex = (this.repository as any).knex;
    let query = knex('inventory.budget_requests');

    // Apply permission-based filtering
    const userPermissions = user.permissions || []; // Handle optional permissions
    const canViewAll =
      userPermissions.includes('budgetRequests:view_all') ||
      userPermissions.includes('*:*');

    if (!canViewAll) {
      // If "view_all" is not granted, fall back to filtering by created_by.
      // Department-based filtering (view_dept) is not possible without department_id on the user object.
      // This part will need re-evaluation once department system is integrated.
      this.logger.info(
        { userId: user.id },
        'Applying "own" records filter for stats as department_id is not available or "view_all" not granted.',
      );
      query = query.where('created_by', user.id);
    } else {
      this.logger.info(
        { userId: user.id },
        'Applying "view_all" permission for stats, no user-based filters.',
      );
    }

    // Apply query filters from the request
    if (filters.fiscal_year) {
      query = query.where('fiscal_year', filters.fiscal_year);
    }
    // Allow admin/finance to override department filter if view_all is present
    // department_id filter from query will still work even without user's department_id
    if (filters.department_id && canViewAll) {
      query = query.where('department_id', filters.department_id);
    }

    const results = await query
      .select('status')
      .count('* as count')
      .groupBy('status');

    const byStatus = {
      DRAFT: 0,
      SUBMITTED: 0,
      DEPT_APPROVED: 0,
      FINANCE_APPROVED: 0,
      REJECTED: 0,
    };

    let total = 0;
    for (const row of results) {
      if (Object.prototype.hasOwnProperty.call(byStatus, row.status)) {
        const count = parseInt(row.count, 10);
        byStatus[row.status as keyof typeof byStatus] = count;
        total += count;
      }
    }

    return {
      total,
      by_status: byStatus,
    };
  }

  /**
   * Get budget requests pending the current user's action based on their permissions.
   * @param user The authenticated user object
   * @returns A list of pending budget requests and the count
   */
  async getMyPendingActions(user: {
    id: string;
    permissions?: string[]; // Updated type
  }): Promise<{ pending: BudgetRequests[]; count: number }> {
    const knex = (this.repository as any).knex;
    const query = knex('inventory.budget_requests');

    const userPermissions = user.permissions || [];
    const canApproveDept = userPermissions.includes(
      'budgetRequests:approve_dept',
    );
    const canApproveFinance = userPermissions.includes(
      'budgetRequests:approve_finance',
    );

    if (!canApproveDept && !canApproveFinance) {
      return { pending: [], count: 0 };
    }

    query.where((builder: any) => {
      if (canApproveDept) {
        // IMPORTANT: Without user.department_id, we cannot enforce "only own department"
        // and "prevent self-approval" for department heads as per spec.
        // This logic is simplified to just filter by status 'SUBMITTED' until department system is fully integrated.
        builder.orWhere('status', 'SUBMITTED');
        this.logger.warn(
          { userId: user.id },
          'getMyPendingActions: Approving department requests without department_id filter or self-approval prevention due to missing user.department_id.',
        );
      }
      if (canApproveFinance) {
        builder.orWhere('status', 'DEPT_APPROVED');
      }
    });

    const pendingRequests = await query.orderBy('updated_at', 'asc');

    return {
      pending: pendingRequests,
      count: pendingRequests.length,
    };
  }

  /**
   * Get the most recent budget requests based on user permissions.
   * @param user The authenticated user object
   * @param query Query parameters, including limit
   * @returns A list of recent budget requests and the count
   */
  async getRecent(
    user: { id: string; permissions?: string[] }, // Updated user type
    query: { limit?: number },
  ): Promise<{ requests: BudgetRequests[]; count: number }> {
    const knex = (this.repository as any).knex;
    let queryBuilder = knex('inventory.budget_requests');

    // Apply permission-based filtering (same as getStats)
    const userPermissions = user.permissions || [];
    const canViewAll =
      userPermissions.includes('budgetRequests:view_all') ||
      userPermissions.includes('*:*');

    if (!canViewAll) {
      // If "view_all" is not granted, fall back to filtering by created_by.
      // Department-based filtering (view_dept) is not possible without department_id on the user object.
      // This part will need re-evaluation once department system is integrated.
      this.logger.info(
        { userId: user.id },
        'Applying "own" records filter for recent requests as department_id is not available or "view_all" not granted.',
      );
      queryBuilder = queryBuilder.where('created_by', user.id);
    } else {
      this.logger.info(
        { userId: user.id },
        'Applying "view_all" permission for recent requests, no user-based filters.',
      );
    }

    const limit = query.limit || 10;
    const recentRequests = await queryBuilder
      .orderBy('updated_at', 'desc')
      .limit(limit);

    return {
      requests: recentRequests,
      count: recentRequests.length,
    };
  }

  // ===== WORKFLOW METHODS =====

  /**
   * Validate budget request before submission
   * @param id Budget request ID
   * @returns Validation result
   */
  async validateForSubmit(id: string | number): Promise<{
    valid: boolean;
    errors: { field?: string; message: string; code?: string }[];
    warnings: { field?: string; message: string; code?: string }[];
    info: string[];
  }> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      // This should ideally not be hit if called from a valid context,
      // but as a service method, it should be robust.
      return {
        valid: false,
        errors: [{ message: 'Budget request not found' }],
        warnings: [],
        info: [],
      };
    }

    const { data: items } = await this.budgetRequestItemsRepository.list({
      budget_request_id: Number(id),
      limit: 5000, // Set a high limit to fetch all items for validation
    });

    const errors: { field?: string; message: string; code?: string }[] = [];
    const warnings: { field?: string; message: string; code?: string }[] = [];
    const info: string[] = [];

    // Validate fiscal year
    if (!request.fiscal_year || request.fiscal_year < 2560) {
      errors.push({
        field: 'fiscal_year',
        message: 'Invalid or missing fiscal year. Must be 2560 or greater.',
        code: 'INVALID_FISCAL_YEAR',
      });
    }

    // Validate justification
    if (!request.justification || request.justification.length < 20) {
      errors.push({
        field: 'justification',
        message: 'Justification must be at least 20 characters.',
        code: 'JUSTIFICATION_TOO_SHORT',
      });
    }

    // Validate items existence
    if (!items || items.length === 0) {
      errors.push({
        field: 'items',
        message: 'At least one budget request item is required.',
        code: 'NO_ITEMS',
      });
    }

    // Validate quarterly distribution for each item
    for (const item of items) {
      const sum =
        (item.q1_qty || 0) +
        (item.q2_qty || 0) +
        (item.q3_qty || 0) +
        (item.q4_qty || 0);

      // Use a small tolerance for floating point comparisons
      if (Math.abs(sum - (item.requested_qty || 0)) > 0.001) {
        errors.push({
          field: `items[${item.line_number}].quarterly`,
          message: `For item '${item.generic_name}', the sum of quarterly quantities (${sum}) does not match the total requested quantity (${item.requested_qty}).`,
          code: 'QUARTERLY_SUM_MISMATCH',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

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

    // Log audit trail
    if (updated) {
      await this.auditService.logWorkflowChange(
        Number(updated.id),
        'SUBMIT',
        'DRAFT',
        'SUBMITTED',
        userId,
      );
    }

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

    // Log audit trail
    if (updated) {
      await this.auditService.logWorkflowChange(
        Number(updated.id),
        'APPROVE_DEPT',
        'SUBMITTED',
        'DEPT_APPROVED',
        userId,
      );
    }

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
        // Calculate amounts from quantities and unit price
        const unitPrice = Number(item.unit_price) || 0;
        const requestedQty = Number(item.requested_qty) || 0;
        const q1Qty = Number(item.q1_qty) || 0;
        const q2Qty = Number(item.q2_qty) || 0;
        const q3Qty = Number(item.q3_qty) || 0;
        const q4Qty = Number(item.q4_qty) || 0;

        const totalAmount = requestedQty * unitPrice;
        const q1Amount = q1Qty * unitPrice;
        const q2Amount = q2Qty * unitPrice;
        const q3Amount = q3Qty * unitPrice;
        const q4Amount = q4Qty * unitPrice;

        const allocationData = {
          fiscal_year: request.fiscal_year,
          budget_id: item.budget_type_id || 1, // Use budget_type_id (defaults to 1 = main budget)
          department_id: request.department_id,
          total_budget: totalAmount,
          q1_budget: q1Amount,
          q2_budget: q2Amount,
          q3_budget: q3Amount,
          q4_budget: q4Amount,
          remaining_budget: totalAmount, // Initially, no spending
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

      // Log audit trail before committing
      if (updated) {
        await this.auditService.logWorkflowChange(
          Number(updated.id),
          'APPROVE_FINANCE',
          'DEPT_APPROVED',
          'FINANCE_APPROVED',
          userId,
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

    // Log audit trail
    if (updated) {
      await this.auditService.logWorkflowChange(
        Number(updated.id),
        'REJECT',
        String(request.status),
        'REJECTED',
        userId,
      );
    }

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
        .orderBy('working_code');

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

        // Get drug info with unit_price from drugs table (linked by generic_id)
        const drugRecord = await knex('inventory.drugs')
          .where({ generic_id: generic.id, is_active: true })
          .orderBy('updated_at', 'desc')
          .first();

        // Get unit_price from drugs table (0 if not found)
        const unitPrice = parseFloat(drugRecord?.unit_price || 0);

        // Get current stock from drug_lots table (linked via drugRecord.id)
        // drug_lots.drug_id → drugs.id → drugs.generic_id = generic.id
        let currentStock = 0;
        if (drugRecord?.id) {
          const stockResult = await knex('inventory.drug_lots')
            .where({ drug_id: drugRecord.id, is_active: true })
            .sum('quantity_available as total')
            .first();
          currentStock = Math.max(0, parseFloat(stockResult?.total || 0));
        }

        // Calculate estimated purchase
        const estimatedPurchase = Math.max(
          0,
          estimatedUsage2569 - currentStock,
        );

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
          generic_code: generic.working_code,
          generic_name: generic.generic_name,
          package_size: generic.package_size || '',
          unit: generic.strength_unit || '', // Use strength_unit from drug_generics table
          line_number: itemsCreated + 1,

          // Historical usage (JSONB format)
          historical_usage: JSON.stringify({
            '2566': usage2566,
            '2567': usage2567,
            '2568': usage2568,
          }),
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
   * Initialize budget request from Drug Master (no calculation)
   * Pulls all active drug generics WITHOUT historical calculation.
   * Creates items with default values (qty=0, price=0).
   * Status: Must be DRAFT
   */
  async initializeFromMaster(
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
      console.log(
        `Starting initialization from Drug Master for budget request ${id}...`,
      );

      // Step 1: Get all active drug generics
      const drugGenerics = await knex('inventory.drug_generics')
        .where({ is_active: true })
        .select('*')
        .orderBy('working_code');

      console.log(`Found ${drugGenerics.length} active drug generics`);

      if (drugGenerics.length === 0) {
        return {
          success: false,
          itemsCreated: 0,
          message: 'No active drug generics found',
        };
      }

      let itemsCreated = 0;

      // Step 2: For each drug generic, create item with default values (no calculation)
      for (const generic of drugGenerics) {
        // Create budget_request_item with default values
        await knex('inventory.budget_request_items').insert({
          budget_request_id: id,
          budget_id: 1, // Default budget

          // Drug information
          generic_id: generic.id,
          generic_code: generic.working_code,
          generic_name: generic.generic_name,
          package_size: generic.package_size || '',
          unit: generic.strength_unit || '', // Use strength_unit from drug_generics table
          line_number: itemsCreated + 1,

          // Historical usage - empty (no calculation)
          historical_usage: JSON.stringify({}),
          avg_usage: 0,

          // Planning data - all zeros
          estimated_usage_2569: 0,
          current_stock: 0,
          estimated_purchase: 0,

          // Pricing and quantities - all zeros
          unit_price: 0,
          requested_qty: 0,
          requested_amount: 0,

          // Quarterly distribution - all zeros
          q1_qty: 0,
          q2_qty: 0,
          q3_qty: 0,
          q4_qty: 0,

          // Audit
          created_at: new Date(),
          updated_at: new Date(),
        });

        itemsCreated++;
      }

      console.log(
        `Successfully initialized ${itemsCreated} items from Drug Master (no calculation)`,
      );

      return {
        success: true,
        itemsCreated,
        message: `Successfully initialized ${itemsCreated} drug items from Drug Master (no historical calculation)`,
      };
    } catch (error) {
      console.error('Error initializing from Drug Master:', error);
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

  /**
   * Recalculate total_requested_amount for a budget request
   * Sums up all (requested_qty * unit_price) from budget_request_items
   * @param id Budget request ID
   * @returns Updated budget request
   */
  async recalculateTotalAmount(
    id: string | number,
  ): Promise<BudgetRequests | null> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    const knex = (this.budgetRequestsRepository as any).knex;

    // Calculate total from all items
    const result = await knex('inventory.budget_request_items')
      .where({ budget_request_id: id })
      .select(
        knex.raw(
          'COALESCE(SUM((requested_qty * unit_price)::numeric), 0) as total',
        ),
      )
      .first();

    const totalAmount = parseFloat(result?.total || 0);

    // Update budget_requests table
    const updated = await this.budgetRequestsRepository.update(id, {
      total_requested_amount: totalAmount,
    } as Partial<BudgetRequests>);

    console.log(`Recalculated total amount for request ${id}: ${totalAmount}`);

    return updated;
  }

  /**
   * Check if drugs in the request are included in budget plan
   * @param requestId Budget request ID
   * @param drugIds Array of drug IDs to check
   * @returns Summary of drugs in and not in plan
   */
  async checkDrugsInPlan(
    requestId: string | number,
    drugIds: string[],
  ): Promise<{
    total_drugs: number;
    in_plan: number;
    not_in_plan: number;
    drugs_not_in_plan: Array<{
      drug_id: string;
      drug_name: string;
      generic_name: string;
    }>;
  }> {
    const request = await this.budgetRequestsRepository.findById(requestId);

    if (!request) {
      const error = new Error('Budget request not found') as any;
      error.statusCode = 404;
      throw error;
    }

    const knex = (this.budgetRequestsRepository as any).knex;

    // Get the budget plan for this fiscal year and department
    const budgetPlan = await knex('inventory.budget_plans')
      .where({
        fiscal_year: request.fiscal_year,
        department_id: request.department_id,
      })
      .first();

    if (!budgetPlan) {
      // No plan exists, all drugs are "not in plan"
      return {
        total_drugs: drugIds.length,
        in_plan: 0,
        not_in_plan: drugIds.length,
        drugs_not_in_plan: drugIds.map((id) => ({
          drug_id: id,
          drug_name: '',
          generic_name: '',
        })),
      };
    }

    // Get all drug generics for the provided IDs
    const drugs = await knex('inventory.drug_generics')
      .whereIn('working_code', drugIds)
      .select('id', 'working_code', 'generic_name');

    const drugMap = new Map<string, { id: number; generic_name: string }>();
    drugs.forEach((drug: any) => {
      drugMap.set(drug.working_code, {
        id: drug.id,
        generic_name: drug.generic_name,
      });
    });

    // Get drugs that are in the budget plan
    const planItems = await knex('inventory.budget_plan_items')
      .where({ budget_plan_id: budgetPlan.id })
      .whereIn(
        'generic_id',
        Array.from(drugMap.values()).map((d) => d.id),
      )
      .select('generic_id');

    const planItemGenericIds = new Set(
      planItems.map((item: any) => item.generic_id),
    );

    // Identify drugs not in plan
    const drugsNotInPlan: Array<{
      drug_id: string;
      drug_name: string;
      generic_name: string;
    }> = [];

    drugIds.forEach((drugId) => {
      const drug = drugMap.get(drugId);
      if (!drug || !planItemGenericIds.has(drug.id)) {
        drugsNotInPlan.push({
          drug_id: drugId,
          drug_name: drug?.generic_name || '',
          generic_name: drug?.generic_name || '',
        });
      }
    });

    const inPlanCount = drugIds.length - drugsNotInPlan.length;

    return {
      total_drugs: drugIds.length,
      in_plan: inPlanCount,
      not_in_plan: drugsNotInPlan.length,
      drugs_not_in_plan: drugsNotInPlan,
    };
  }

  /**
   * Check budget availability for the request
   * Calculates allocated, used, reserved, and available budget
   * @param requestId Budget request ID
   * @returns Budget availability analysis
   */
  async checkBudgetAvailability(requestId: string | number): Promise<{
    budget_type_id: string;
    budget_type_name: string;
    allocated: number;
    used: number;
    reserved: number;
    available: number;
    request_amount: number;
    remaining_after: number;
    percentage_used: number;
    is_available: boolean;
    warnings: string[];
  }> {
    const request = await this.budgetRequestsRepository.findById(requestId);

    if (!request) {
      const error = new Error('Budget request not found') as any;
      error.statusCode = 404;
      throw error;
    }

    const knex = (this.budgetRequestsRepository as any).knex;

    // Get total requested amount for this request
    const requestAmount = Number(request.total_requested_amount) || 0;

    // Get budget allocation for this request's fiscal year, budget type (1=main), and department
    const allocation = await knex('inventory.budget_allocations')
      .where({
        fiscal_year: request.fiscal_year,
        budget_id: 1, // Default to main budget (budget_id=1)
        department_id: request.department_id,
      })
      .first();

    // Get budget type information (from budgets table)
    const budgetType = await knex('inventory.budgets').where({ id: 1 }).first();

    const warnings: string[] = [];

    if (!allocation) {
      // No allocation exists - full budget is available (theoretical)
      return {
        budget_type_id: String(budgetType?.id || 1),
        budget_type_name: budgetType?.budget_type_name || 'Main Budget',
        allocated: 0,
        used: 0,
        reserved: 0,
        available: 999999999, // Unlimited if no allocation
        request_amount: requestAmount,
        remaining_after: 999999999 - requestAmount,
        percentage_used: 0,
        is_available: true,
        warnings: [
          'No budget allocation exists for this period - treating as unlimited',
        ],
      };
    }

    // Calculate budget metrics
    const allocated = Number(allocation.total_budget) || 0;
    const used = Number(allocation.total_spent) || 0;
    const available = Number(allocation.remaining_budget) || 0;
    const reserved = 0; // Would be calculated from budget_reservations table if needed

    // Calculate percentage used
    const percentageUsed = allocated > 0 ? (used / allocated) * 100 : 0;

    // Check if request can be accommodated
    const remainingAfter = available - requestAmount;
    const isAvailable = remainingAfter >= 0;

    // Generate warnings
    if (percentageUsed > 80) {
      warnings.push(
        `Budget utilization is high (${percentageUsed.toFixed(1)}%) - consider budget increase`,
      );
    }

    if (!isAvailable) {
      warnings.push(
        `Insufficient budget available. Request amount (${requestAmount.toFixed(2)}) exceeds available budget (${available.toFixed(2)})`,
      );
    }

    if (percentageUsed > 100) {
      warnings.push('Budget has been overutilized - immediate review required');
    }

    return {
      budget_type_id: String(budgetType?.id || 1),
      budget_type_name: budgetType?.budget_type_name || 'Main Budget',
      allocated,
      used,
      reserved,
      available,
      request_amount: requestAmount,
      remaining_after: remainingAfter,
      percentage_used: parseFloat(percentageUsed.toFixed(2)),
      is_available: isAvailable,
      warnings,
    };
  }

  /**
   * Import Excel/CSV file to create budget request items
   * @param id Budget request ID
   * @param fileBuffer Excel or CSV file buffer
   * @param replaceAll If true, delete all existing items first
   * @param userId User performing the import
   * @returns Import result with counts and errors
   */
  async importExcel(
    id: string | number,
    fileBuffer: Buffer,
    options: { mode: 'append' | 'replace' | 'update'; skipErrors: boolean } = {
      mode: 'append',
      skipErrors: true,
    },
    userId: string,
  ): Promise<{
    success: boolean;
    imported: number;
    updated: number;
    skipped: number;
    errors: Array<{ row: number; field: string; message: string }>;
  }> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot import items for budget request with status: ${request.status}. Must be DRAFT.`,
      );
    }

    const knex = (this.budgetRequestsRepository as any).knex;
    const { mode, skipErrors } = options;

    try {
      // Parse Excel/CSV file
      const xlsx = await import('xlsx');
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with header row
      const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length < 2) {
        throw new Error('File is empty or has no data rows');
      }

      const headers = rawData[0] as string[];
      const dataRows = rawData.slice(1);

      // Support both old format (full columns) and new format (simple columns)
      // New format: รหัสยา, ชื่อยา, หน่วย, ราคาต่อหน่วย, จำนวน
      // Old format: รหัสยา, ชื่อยา, หน่วย, ปี2566, ปี2567, ปี2568, ประมาณการ2569, คงคลัง, ราคา/หน่วย, จำนวนที่ขอ, Q1, Q2, Q3, Q4
      const isSimpleFormat =
        headers.includes('ราคาต่อหน่วย') || headers.includes('จำนวน');

      // Only check for drug code - it's required in both formats
      if (!headers.includes('รหัสยา')) {
        throw new Error('Missing required column: รหัสยา');
      }

      // Handle replace mode - delete all existing items
      if (mode === 'replace') {
        await knex('inventory.budget_request_items')
          .where({ budget_request_id: id })
          .delete();
      }

      const results = {
        success: true,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [] as Array<{ row: number; field: string; message: string }>,
      };

      // Map header indices - support both formats
      const colIndexes = {
        drugCode: headers.indexOf('รหัสยา'),
        drugName: headers.indexOf('ชื่อยา'),
        unit: headers.indexOf('หน่วย'),
        year2566: headers.indexOf('ปี2566'),
        year2567: headers.indexOf('ปี2567'),
        year2568: headers.indexOf('ปี2568'),
        estimatedUsage: headers.indexOf('ประมาณการ2569'),
        currentStock: headers.indexOf('คงคลัง'),
        // Support both 'ราคา/หน่วย' and 'ราคาต่อหน่วย'
        unitPrice:
          headers.indexOf('ราคา/หน่วย') !== -1
            ? headers.indexOf('ราคา/หน่วย')
            : headers.indexOf('ราคาต่อหน่วย'),
        // Support both 'จำนวนที่ขอ' and 'จำนวน'
        requestedQty:
          headers.indexOf('จำนวนที่ขอ') !== -1
            ? headers.indexOf('จำนวนที่ขอ')
            : headers.indexOf('จำนวน'),
        q1: headers.indexOf('Q1'),
        q2: headers.indexOf('Q2'),
        q3: headers.indexOf('Q3'),
        q4: headers.indexOf('Q4'),
        notes: headers.indexOf('หมายเหตุ'),
      };

      // Process each data row
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i] as any[];
        const rowNumber = i + 2; // Excel row number (1-based + 1 for header)

        // Skip empty rows
        if (!row || row.length === 0 || !row[colIndexes.drugCode]) {
          continue;
        }

        try {
          // Get values
          const drugCode = String(row[colIndexes.drugCode] || '').trim();
          const year2566 =
            colIndexes.year2566 !== -1
              ? parseFloat(row[colIndexes.year2566] || 0)
              : 0;
          const year2567 =
            colIndexes.year2567 !== -1
              ? parseFloat(row[colIndexes.year2567] || 0)
              : 0;
          const year2568 =
            colIndexes.year2568 !== -1
              ? parseFloat(row[colIndexes.year2568] || 0)
              : 0;
          const estimatedUsage =
            colIndexes.estimatedUsage !== -1
              ? parseFloat(row[colIndexes.estimatedUsage] || 0)
              : 0;
          const currentStock =
            colIndexes.currentStock !== -1
              ? parseFloat(row[colIndexes.currentStock] || 0)
              : 0;
          const unitPrice =
            colIndexes.unitPrice !== -1
              ? parseFloat(row[colIndexes.unitPrice] || 0)
              : 0;
          const requestedQty =
            colIndexes.requestedQty !== -1
              ? parseFloat(row[colIndexes.requestedQty] || 0)
              : 0;

          // Q1-Q4: Use provided values or auto-split if not in file
          const hasQuarterlyColumns =
            colIndexes.q1 !== -1 &&
            colIndexes.q2 !== -1 &&
            colIndexes.q3 !== -1 &&
            colIndexes.q4 !== -1;
          let q1: number, q2: number, q3: number, q4: number;

          if (hasQuarterlyColumns) {
            q1 = parseFloat(row[colIndexes.q1] || 0);
            q2 = parseFloat(row[colIndexes.q2] || 0);
            q3 = parseFloat(row[colIndexes.q3] || 0);
            q4 = parseFloat(row[colIndexes.q4] || 0);
          } else {
            // Auto-split quarterly based on requestedQty
            const quarterQty = Math.floor(requestedQty / 4);
            const remainder = requestedQty % 4;
            q1 = quarterQty + (remainder > 0 ? 1 : 0);
            q2 = quarterQty + (remainder > 1 ? 1 : 0);
            q3 = quarterQty + (remainder > 2 ? 1 : 0);
            q4 = quarterQty;
          }

          // Validate drug code exists
          const generic = await knex('inventory.drug_generics')
            .where({ working_code: drugCode, is_active: true })
            .first();

          if (!generic) {
            results.errors.push({
              row: rowNumber,
              field: 'working_code',
              message: `Drug code '${drugCode}' not found in active drug generics`,
            });
            if (!skipErrors) {
              results.success = false;
              results.skipped++;
              continue;
            }
            results.skipped++;
            continue;
          }

          // Validate unit price (allow 0 for simple format)
          if (unitPrice < 0) {
            results.errors.push({
              row: rowNumber,
              field: 'unit_price',
              message: 'Unit price cannot be negative',
            });
            if (!skipErrors) {
              results.success = false;
            }
            results.skipped++;
            continue;
          }

          // Validate requested quantity
          if (requestedQty <= 0) {
            results.errors.push({
              row: rowNumber,
              field: 'requested_qty',
              message: 'Requested quantity must be greater than 0',
            });
            if (!skipErrors) {
              results.success = false;
            }
            results.skipped++;
            continue;
          }

          // Validate quarterly split only if quarters were provided in file
          if (hasQuarterlyColumns) {
            const quarterlySum = q1 + q2 + q3 + q4;
            if (Math.abs(quarterlySum - requestedQty) > 0.01) {
              results.errors.push({
                row: rowNumber,
                field: 'quarterly_split',
                message: `Q1+Q2+Q3+Q4 (${quarterlySum}) must equal requested quantity (${requestedQty})`,
              });
              if (!skipErrors) {
                results.success = false;
              }
              results.skipped++;
              continue;
            }
          }

          // Calculate averages
          const avgUsage = (year2566 + year2567 + year2568) / 3;
          const estimatedPurchase = Math.max(0, estimatedUsage - currentStock);
          const requestedAmount = requestedQty * unitPrice;

          // Check if item already exists for this generic
          const existingItem = await knex('inventory.budget_request_items')
            .where({
              budget_request_id: id,
              generic_id: generic.id,
            })
            .first();

          const itemData = {
            budget_request_id: id,
            budget_id: 1, // Default budget ID
            generic_id: generic.id,
            generic_code: generic.working_code,
            generic_name: generic.generic_name,
            package_size: generic.package_size || '',
            unit: row[colIndexes.unit] || generic.unit || '',
            line_number: results.imported + results.updated + 1,
            // Use JSONB historical_usage instead of individual year columns
            historical_usage: {
              '2566': year2566,
              '2567': year2567,
              '2568': year2568,
            },
            avg_usage: avgUsage,
            estimated_usage_2569: estimatedUsage,
            current_stock: currentStock,
            estimated_purchase: estimatedPurchase,
            unit_price: unitPrice,
            requested_qty: requestedQty,
            requested_amount: requestedAmount,
            q1_qty: q1,
            q2_qty: q2,
            q3_qty: q3,
            q4_qty: q4,
            updated_at: new Date(),
          };

          if (existingItem && (mode === 'update' || mode === 'append')) {
            // Update existing item in update or append mode
            if (mode === 'update') {
              await knex('inventory.budget_request_items')
                .where({ id: existingItem.id })
                .update(itemData);
              results.updated++;
            } else {
              // append mode - skip duplicates
              results.skipped++;
            }
          } else {
            // Insert new item (replace mode always inserts, append/update insert new)
            await knex('inventory.budget_request_items').insert({
              ...itemData,
              created_at: new Date(),
            });
            results.imported++;
          }
        } catch (error: any) {
          results.errors.push({
            row: rowNumber,
            field: 'general',
            message: error.message || 'Unknown error processing row',
          });
          results.skipped++;
        }
      }

      return results;
    } catch (error) {
      console.error('Error importing Excel file:', error);
      throw error;
    }
  }

  /**
   * Export budget request items to SSCJ Excel format
   * @param id Budget request ID
   * @returns Excel buffer
   */
  async exportSSCJ(id: string | number): Promise<Buffer> {
    const request = await this.budgetRequestsRepository.findById(id);

    if (!request) {
      throw new Error('Budget request not found');
    }

    const knex = (this.budgetRequestsRepository as any).knex;

    // Fetch all items for this budget request
    const items = await knex('inventory.budget_request_items')
      .where({ budget_request_id: id })
      .orderBy('line_number', 'asc');

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      const amount = (item.requested_qty || 0) * (item.unit_price || 0);
      return sum + amount;
    }, 0);

    // Calculate dynamic years based on fiscal_year from budget request
    const fiscalYear = request.fiscal_year || 2569; // Default to 2569 if not set
    const histYear1 = fiscalYear - 3; // e.g., 2566
    const histYear2 = fiscalYear - 2; // e.g., 2567
    const histYear3 = fiscalYear - 1; // e.g., 2568
    const q1StartYear = fiscalYear - 1; // Q1 starts in October of previous year

    // Import ExcelJS
    const ExcelJS = await import('exceljs');
    const { Workbook } = ExcelJS.default || ExcelJS;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('แผนงบประมาณยา');

    // Set column widths
    worksheet.columns = [
      { width: 6 }, // A: ลำดับ
      { width: 10 }, // B: รหัส
      { width: 30 }, // C: รายการ
      { width: 10 }, // D: ขนาดบรรจุ
      { width: 8 }, // E: หน่วย
      { width: 8 }, // F: ปี2566
      { width: 8 }, // G: ปี2567
      { width: 8 }, // H: ปี2568
      { width: 10 }, // I: ประมาณการ2569
      { width: 10 }, // J: คงคลัง
      { width: 10 }, // K: ประมาณการจัดซื้อ
      { width: 12 }, // L: ราคา/หน่วย
      { width: 10 }, // M: งบประมาณ จำนวน
      { width: 15 }, // N: งบประมาณ มูลค่า
      { width: 10 }, // O: เงินบำรุง จำนวน
      { width: 15 }, // P: เงินบำรุง มูลค่า
      { width: 10 }, // Q: Q1 จำนวน
      { width: 15 }, // R: Q1 มูลค่า
      { width: 10 }, // S: (spacing)
      { width: 10 }, // T: (spacing)
      { width: 10 }, // U: Q2 จำนวน
      { width: 15 }, // V: Q2 มูลค่า
      { width: 10 }, // W: (spacing)
      { width: 10 }, // X: (spacing)
      { width: 10 }, // Y: Q3 จำนวน
      { width: 15 }, // Z: Q3 มูลค่า
      { width: 10 }, // AA: (spacing)
      { width: 10 }, // AB: (spacing)
      { width: 10 }, // AC: Q4 จำนวน
      { width: 15 }, // AD: Q4 มูลค่า
      { width: 10 }, // AE: (spacing)
      { width: 10 }, // AF: (spacing)
      { width: 10 }, // AG: Total จำนวน
      { width: 15 }, // AH: Total มูลค่า
    ];

    // Row 1: Title (merged A1:AH1)
    worksheet.mergeCells('A1:AH1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `แผนงบประมาณจัดซื้อยา ปีงบประมาณ ${fiscalYear}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 25;

    // Row 2: Summary
    const row2 = worksheet.getRow(2);
    row2.getCell(12).value = 'รวมมูลค่าจัดซื้อ';
    row2.getCell(12).font = { bold: true };
    row2.getCell(16).value = totalAmount;
    row2.getCell(16).numFmt = '#,##0.00';
    row2.getCell(16).font = { bold: true };
    row2.height = 20;

    // Row 3: Main headers
    const row3 = worksheet.getRow(3);
    const headers3 = [
      { col: 1, value: 'ลำดับ', merge: null },
      { col: 2, value: 'รหัส', merge: null },
      { col: 3, value: 'รายการ', merge: null },
      { col: 4, value: 'ขนาดบรรจุ', merge: null },
      { col: 5, value: 'หน่วยนับ', merge: null },
      { col: 6, value: 'ข้อมูลอัตราการใช้ย้อนหลัง 3ปี', merge: 'F3:H3' },
      { col: 9, value: `ประมาณการใช้ปีงบฯ ${fiscalYear}`, merge: null },
      { col: 10, value: 'ยอดยาคงคลัง', merge: null },
      { col: 11, value: 'ประมาณการจัดซื้อฯ', merge: null },
      { col: 12, value: 'ราคา/หน่วยขนาดบรรจุ', merge: null },
      { col: 13, value: 'จัดซื้อด้วยเงินงบประมาณ', merge: 'M3:N3' },
      { col: 15, value: 'จัดซื้อด้วยเงินบำรุง', merge: 'O3:P3' },
      { col: 17, value: `งวดที่ 1 ต.ค.${q1StartYear}`, merge: 'Q3:T3' },
      { col: 21, value: `งวดที่ 2 ม.ค.${fiscalYear}`, merge: 'U3:X3' },
      { col: 25, value: `งวดที่ 3 เม.ย ${fiscalYear}`, merge: 'Y3:AB3' },
      { col: 29, value: `งวดที่ 4 ก.ค ${fiscalYear}`, merge: 'AC3:AF3' },
      { col: 33, value: 'ยอดรวม', merge: 'AG3:AH3' },
    ];

    headers3.forEach((h) => {
      const cell = row3.getCell(h.col);
      cell.value = h.value;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (h.merge) {
        worksheet.mergeCells(h.merge);
      }
    });
    row3.height = 20;

    // Row 4: Sub-headers
    const row4 = worksheet.getRow(4);
    const headers4 = [
      { col: 1, value: '', border: true }, // ลำดับ
      { col: 2, value: '', border: true }, // รหัส
      { col: 3, value: '', border: true }, // รายการ
      { col: 4, value: '', border: true }, // ขนาดบรรจุ
      { col: 5, value: '', border: true }, // หน่วยนับ
      { col: 6, value: `ปีงบฯ${histYear1}`, border: true },
      { col: 7, value: `ปีงบฯ${histYear2}`, border: true },
      { col: 8, value: `ปีงบฯ${histYear3}`, border: true },
      { col: 9, value: '', border: true }, // ประมาณการ
      { col: 10, value: '', border: true }, // คงคลัง
      { col: 11, value: '', border: true }, // ประมาณการจัดซื้อ
      { col: 12, value: '', border: true }, // ราคา
      { col: 13, value: 'จำนวน', border: true },
      { col: 14, value: 'มูลค่า', border: true },
      { col: 15, value: 'จำนวน', border: true },
      { col: 16, value: 'มูลค่า', border: true },
      { col: 17, value: 'แผนจัดซื้อ', border: true },
      { col: 18, value: 'มูลค่า', border: true },
      { col: 19, value: '', border: true },
      { col: 20, value: '', border: true },
      { col: 21, value: 'แผนจัดซื้อ', border: true },
      { col: 22, value: 'มูลค่า', border: true },
      { col: 23, value: '', border: true },
      { col: 24, value: '', border: true },
      { col: 25, value: 'แผนจัดซื้อ', border: true },
      { col: 26, value: 'มูลค่า', border: true },
      { col: 27, value: '', border: true },
      { col: 28, value: '', border: true },
      { col: 29, value: 'แผนจัดซื้อ', border: true },
      { col: 30, value: 'มูลค่า', border: true },
      { col: 31, value: '', border: true },
      { col: 32, value: '', border: true },
      { col: 33, value: 'แผนจัดซื้อ', border: true },
      { col: 34, value: 'มูลค่า', border: true },
    ];

    headers4.forEach((h) => {
      const cell = row4.getCell(h.col);
      cell.value = h.value;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (h.border) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    });
    row4.height = 20;

    // Data rows (starting from row 5)
    let rowIndex = 5;
    items.forEach((item: any) => {
      const row = worksheet.getRow(rowIndex);

      // Calculate amounts
      const unitPrice = item.unit_price || 0;
      const budgetQty = 0; // Not specified in database
      const budgetAmount = budgetQty * unitPrice;
      const fundQty = 0; // Not specified in database
      const fundAmount = fundQty * unitPrice;
      const q1Amount = (item.q1_qty || 0) * unitPrice;
      const q2Amount = (item.q2_qty || 0) * unitPrice;
      const q3Amount = (item.q3_qty || 0) * unitPrice;
      const q4Amount = (item.q4_qty || 0) * unitPrice;
      const totalQty = item.requested_qty || 0;
      const totalAmount = totalQty * unitPrice;

      // Parse JSONB historical_usage field
      const historicalUsage =
        typeof item.historical_usage === 'string'
          ? JSON.parse(item.historical_usage)
          : item.historical_usage || {};

      // Set values
      row.getCell(1).value = item.line_number || rowIndex - 4; // A: ลำดับ
      row.getCell(2).value = item.generic_code || ''; // B: รหัส
      row.getCell(3).value = item.generic_name || ''; // C: รายการ
      row.getCell(4).value = item.package_size || ''; // D: ขนาดบรรจุ
      row.getCell(5).value = item.unit || ''; // E: หน่วย
      row.getCell(6).value = historicalUsage[String(histYear1)] || 0; // F: historical year 1
      row.getCell(7).value = historicalUsage[String(histYear2)] || 0; // G: historical year 2
      row.getCell(8).value = historicalUsage[String(histYear3)] || 0; // H: historical year 3
      row.getCell(9).value = item.estimated_usage_2569 || 0; // I: ประมาณการ2569
      row.getCell(10).value = item.current_stock || 0; // J: คงคลัง
      row.getCell(11).value = item.estimated_purchase || 0; // K: ประมาณการจัดซื้อ
      row.getCell(12).value = unitPrice; // L: ราคา
      row.getCell(13).value = budgetQty; // M: งบประมาณ จำนวน
      row.getCell(14).value = budgetAmount; // N: งบประมาณ มูลค่า
      row.getCell(15).value = fundQty; // O: เงินบำรุง จำนวน
      row.getCell(16).value = fundAmount; // P: เงินบำรุง มูลค่า
      row.getCell(17).value = item.q1_qty || 0; // Q: Q1 จำนวน
      row.getCell(18).value = q1Amount; // R: Q1 มูลค่า
      row.getCell(21).value = item.q2_qty || 0; // U: Q2 จำนวน
      row.getCell(22).value = q2Amount; // V: Q2 มูลค่า
      row.getCell(25).value = item.q3_qty || 0; // Y: Q3 จำนวน
      row.getCell(26).value = q3Amount; // Z: Q3 มูลค่า
      row.getCell(29).value = item.q4_qty || 0; // AC: Q4 จำนวน
      row.getCell(30).value = q4Amount; // AD: Q4 มูลค่า
      row.getCell(33).value = totalQty; // AG: Total จำนวน
      row.getCell(34).value = totalAmount; // AH: Total มูลค่า

      // Apply number formatting
      [6, 7, 8, 9, 10, 11, 13, 15, 17, 21, 25, 29, 33].forEach((col) => {
        row.getCell(col).numFmt = '#,##0';
      });
      [12, 14, 16, 18, 22, 26, 30, 34].forEach((col) => {
        row.getCell(col).numFmt = '#,##0.00';
      });

      // Apply borders
      for (let col = 1; col <= 34; col++) {
        row.getCell(col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }

      rowIndex++;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Reopen budget request - Send budget request back to DRAFT status
   *
   * Business Rules:
   * - REJECTED → DRAFT (auto-allow)
   * - SUBMITTED → DRAFT (allowed with proper permission)
   * - DEPT_APPROVED → DRAFT (allowed with proper permission)
   * - FINANCE_APPROVED → Not allowed (budget locked, must create new request)
   */
  async reopen(
    id: string | number,
    reason: string,
    userId: string,
  ): Promise<BudgetRequests> {
    // Get existing budget request
    const budgetRequest = await this.budgetRequestsRepository.findById(id);

    if (!budgetRequest) {
      const error = new Error('Budget request not found') as any;
      error.statusCode = 404;
      error.code = 'BUDGET_REQUEST_NOT_FOUND';
      throw error;
    }

    // Business Rule: Cannot reopen FINANCE_APPROVED (budget locked)
    if (budgetRequest.status === 'FINANCE_APPROVED') {
      const error = new Error(
        'Cannot reopen FINANCE_APPROVED budget request - budget is locked. Please create a new request instead.',
      ) as any;
      error.statusCode = 422;
      error.code = 'BUDGET_REQUEST_CANNOT_REOPEN_FINANCE_APPROVED';
      throw error;
    }

    // Business Rule: Cannot reopen DRAFT status (already in DRAFT)
    if (budgetRequest.status === 'DRAFT') {
      const error = new Error(
        'Budget request is already in DRAFT status',
      ) as any;
      error.statusCode = 422;
      error.code = 'BUDGET_REQUEST_ALREADY_DRAFT';
      throw error;
    }

    // Update status to DRAFT and set reopen tracking fields
    const updated = await this.budgetRequestsRepository.update(id, {
      status: 'DRAFT' as any,
      reopened_by: userId,
      reopened_at: new Date() as any,
    });

    if (!updated) {
      const error = new Error('Failed to reopen budget request') as any;
      error.statusCode = 500;
      error.code = 'BUDGET_REQUEST_REOPEN_FAILED';
      throw error;
    }

    // Log audit trail
    await this.auditService.logWorkflowChange(
      Number(updated.id),
      'REOPEN',
      String(budgetRequest.status),
      'DRAFT',
      userId,
    );

    return updated;
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

  // ===== ITEM MANAGEMENT METHODS =====

  /**
   * Add drug item to budget request
   * Only allowed when status = DRAFT
   */
  async addItem(
    budgetRequestId: string | number,
    data: {
      generic_id: number;
      estimated_usage_2569?: number;
      requested_qty: number;
      unit_price?: number;
      q1_qty?: number;
      q2_qty?: number;
      q3_qty?: number;
      q4_qty?: number;
      notes?: string;
    },
    userId: string,
  ): Promise<any> {
    // Validate budget request exists and status is DRAFT
    const request =
      await this.budgetRequestsRepository.findById(budgetRequestId);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot add items to budget request with status: ${request.status}. Only DRAFT requests can be modified.`,
      );
    }

    // Get drug generic information
    const generic = await this.db('inventory.drug_generics')
      .where({ id: data.generic_id })
      .first();

    if (!generic) {
      throw new Error(`Drug generic with ID ${data.generic_id} not found`);
    }

    // Get next line number
    const lastItem = await this.db('inventory.budget_request_items')
      .where({ budget_request_id: budgetRequestId })
      .orderBy('line_number', 'desc')
      .first();

    const lineNumber = (lastItem?.line_number || 0) + 1;

    // Calculate quarterly amounts if not provided
    const requestedQty = data.requested_qty;
    const q1Qty = data.q1_qty ?? Math.round(requestedQty * 0.25);
    const q2Qty = data.q2_qty ?? Math.round(requestedQty * 0.25);
    const q3Qty = data.q3_qty ?? Math.round(requestedQty * 0.25);
    const q4Qty = data.q4_qty ?? requestedQty - (q1Qty + q2Qty + q3Qty);

    // Calculate amounts
    const unitPrice = data.unit_price || 0;
    const requestedAmount = requestedQty * unitPrice;

    // Create item (only columns that exist in the database)
    const itemData: any = {
      budget_request_id: budgetRequestId,
      budget_id: 1, // Default budget
      generic_id: data.generic_id,
      generic_code: generic.working_code,
      generic_name: generic.generic_name,
      package_size: generic.package_size || '',
      unit: generic.strength_unit || '', // Use strength_unit from drug_generics table
      line_number: lineNumber,
      estimated_usage_2569: data.estimated_usage_2569 || 0,
      requested_qty: requestedQty,
      unit_price: unitPrice,
      requested_amount: requestedAmount,
      q1_qty: q1Qty,
      q2_qty: q2Qty,
      q3_qty: q3Qty,
      q4_qty: q4Qty,
      item_justification: data.notes || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [item] = await this.db('inventory.budget_request_items')
      .insert(itemData)
      .returning('*');

    return item;
  }

  /**
   * Update budget request item
   * Only allowed when status = DRAFT
   */
  async updateItem(
    budgetRequestId: string | number,
    itemId: string | number,
    data: {
      estimated_usage_2569?: number;
      requested_qty?: number;
      unit_price?: number;
      q1_qty?: number;
      q2_qty?: number;
      q3_qty?: number;
      q4_qty?: number;
      notes?: string;
      // Historical usage fields (editable)
      historical_usage?: Record<string, number>;
      avg_usage?: number;
      current_stock?: number;
    },
    userId: string,
  ): Promise<any> {
    // Validate budget request exists and status is DRAFT
    const request =
      await this.budgetRequestsRepository.findById(budgetRequestId);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot update items in budget request with status: ${request.status}. Only DRAFT requests can be modified.`,
      );
    }

    // Verify item belongs to this budget request
    const existingItem = await this.db('inventory.budget_request_items')
      .where({ id: itemId, budget_request_id: budgetRequestId })
      .first();

    if (!existingItem) {
      throw new Error(
        'Item not found or does not belong to this budget request',
      );
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.estimated_usage_2569 !== undefined) {
      updateData.estimated_usage_2569 = data.estimated_usage_2569;
    }

    if (data.requested_qty !== undefined) {
      updateData.requested_qty = data.requested_qty;
    }

    if (data.unit_price !== undefined) {
      updateData.unit_price = data.unit_price;
    }

    // Recalculate requested_amount if qty or price changed
    if (data.requested_qty !== undefined || data.unit_price !== undefined) {
      const qty =
        data.requested_qty !== undefined
          ? data.requested_qty
          : existingItem.requested_qty;
      const price =
        data.unit_price !== undefined
          ? data.unit_price
          : existingItem.unit_price;
      updateData.requested_amount = qty * price;
    }

    if (data.q1_qty !== undefined) {
      updateData.q1_qty = data.q1_qty;
    }

    if (data.q2_qty !== undefined) {
      updateData.q2_qty = data.q2_qty;
    }

    if (data.q3_qty !== undefined) {
      updateData.q3_qty = data.q3_qty;
    }

    if (data.q4_qty !== undefined) {
      updateData.q4_qty = data.q4_qty;
    }

    if (data.notes !== undefined) {
      updateData.item_justification = data.notes;
    }

    // Historical usage fields (editable)
    if (data.historical_usage !== undefined) {
      updateData.historical_usage = JSON.stringify(data.historical_usage);
    }

    if (data.avg_usage !== undefined) {
      updateData.avg_usage = data.avg_usage;
    }

    if (data.current_stock !== undefined) {
      updateData.current_stock = data.current_stock;
    }

    // Update item
    const [updated] = await this.db('inventory.budget_request_items')
      .where({ id: itemId })
      .update(updateData)
      .returning('*');

    return updated;
  }

  /**
   * Batch update multiple budget request items
   * Only allowed when status = DRAFT
   */
  async batchUpdateItems(
    budgetRequestId: string | number,
    items: Array<{
      id: number;
      estimated_usage_2569?: number;
      requested_qty?: number;
      unit_price?: number;
      q1_qty?: number;
      q2_qty?: number;
      q3_qty?: number;
      q4_qty?: number;
      notes?: string;
      // Historical usage fields (editable)
      historical_usage?: Record<string, number>;
      avg_usage?: number;
      current_stock?: number;
    }>,
    userId: string,
  ): Promise<{ updated: number; failed: number }> {
    // Validate budget request exists and status is DRAFT
    const request =
      await this.budgetRequestsRepository.findById(budgetRequestId);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot update items in budget request with status: ${request.status}. Only DRAFT requests can be modified.`,
      );
    }

    let updated = 0;
    let failed = 0;

    // Update each item
    for (const item of items) {
      try {
        await this.updateItem(budgetRequestId, item.id, item, userId);
        updated++;
      } catch (error) {
        console.error(`Failed to update item ${item.id}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  }

  /**
   * Delete budget request item
   * Only allowed when status = DRAFT
   */
  async deleteItem(
    budgetRequestId: string | number,
    itemId: string | number,
    userId: string,
  ): Promise<boolean> {
    // Validate budget request exists and status is DRAFT
    const request =
      await this.budgetRequestsRepository.findById(budgetRequestId);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot delete items from budget request with status: ${request.status}. Only DRAFT requests can be modified.`,
      );
    }

    // Verify item belongs to this budget request
    const existingItem = await this.db('inventory.budget_request_items')
      .where({ id: itemId, budget_request_id: budgetRequestId })
      .first();

    if (!existingItem) {
      return false;
    }

    // Delete item
    const deleted = await this.db('inventory.budget_request_items')
      .where({ id: itemId })
      .delete();

    return deleted > 0;
  }

  /**
   * Bulk delete selected items for a budget request
   * Only allowed when status = DRAFT
   */
  async bulkDeleteItems(
    budgetRequestId: string | number,
    itemIds: number[],
    userId: string,
  ): Promise<{ deletedCount: number }> {
    // Validate budget request exists and status is DRAFT
    const request =
      await this.budgetRequestsRepository.findById(budgetRequestId);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot delete items from budget request with status: ${request.status}. Only DRAFT requests can be modified.`,
      );
    }

    // Delete selected items
    const deletedCount = await this.db('inventory.budget_request_items')
      .where({ budget_request_id: budgetRequestId })
      .whereIn('id', itemIds)
      .delete();

    // Recalculate total from remaining items
    const remaining = await this.db('inventory.budget_request_items')
      .where({ budget_request_id: budgetRequestId })
      .select(this.db.raw('COALESCE(SUM(requested_amount), 0) as total'))
      .first<{ total: string }>();

    const newTotal = Number(remaining?.total || 0);

    // Update the budget request total
    await this.budgetRequestsRepository.update(budgetRequestId, {
      total_requested_amount: newTotal,
    });

    return { deletedCount };
  }

  /**
   * Delete all items for a budget request
   * Only allowed when status = DRAFT
   * Uses single SQL query for efficiency
   */
  async deleteAllItems(
    budgetRequestId: string | number,
    userId: string,
  ): Promise<{ deletedCount: number }> {
    // Validate budget request exists and status is DRAFT
    const request =
      await this.budgetRequestsRepository.findById(budgetRequestId);

    if (!request) {
      throw new Error('Budget request not found');
    }

    if (request.status !== 'DRAFT') {
      throw new Error(
        `Cannot delete items from budget request with status: ${request.status}. Only DRAFT requests can be modified.`,
      );
    }

    // Delete all items with single SQL query (efficient for large datasets)
    const deletedCount = await this.db('inventory.budget_request_items')
      .where({ budget_request_id: budgetRequestId })
      .delete();

    // Update the budget request total (updated_at is auto-updated by the repository)
    await this.budgetRequestsRepository.update(budgetRequestId, {
      total_requested_amount: 0,
    });

    return { deletedCount };
  }
}
