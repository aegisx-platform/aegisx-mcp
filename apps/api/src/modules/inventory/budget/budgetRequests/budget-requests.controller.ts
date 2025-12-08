import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { BudgetRequestsService } from './budget-requests.service';
import {
  CreateBudgetRequests,
  UpdateBudgetRequests,
} from './budget-requests.types';
import {
  CreateBudgetRequestsSchema,
  UpdateBudgetRequestsSchema,
  BudgetRequestsIdParamSchema,
  GetBudgetRequestsQuerySchema,
  ListBudgetRequestsQuerySchema,
} from './budget-requests.schemas';

/**
 * BudgetRequests Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class BudgetRequestsController {
  constructor(private budgetRequestsService: BudgetRequestsService) {}

  /**
   * Create new budgetRequests
   * POST /budgetRequests
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateBudgetRequestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating budgetRequests');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const budgetRequests = await this.budgetRequestsService.create(createData);

    request.log.info(
      { budgetRequestsId: budgetRequests.id },
      'BudgetRequests created successfully',
    );

    return reply
      .code(201)
      .success(budgetRequests, 'BudgetRequests created successfully');
  }

  /**
   * Get budgetRequests by ID
   * GET /budgetRequests/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Querystring: Static<typeof GetBudgetRequestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetRequestsId: id }, 'Fetching budgetRequests');

    const budgetRequests = await this.budgetRequestsService.findById(
      id,
      request.query,
    );

    return reply.success(budgetRequests);
  }

  /**
   * Get paginated list of budgetRequestss
   * GET /budgetRequests
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListBudgetRequestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching budgetRequests list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'request_number', 'created_at'],
      user: [
        'id',
        'request_number',
        'id',
        'request_number',
        'fiscal_year',
        'department_id',
        'status',
        'total_requested_amount',
        'justification',
        'submitted_by',
        'submitted_at',
        'dept_reviewed_by',
        'dept_reviewed_at',
        'dept_comments',
        'finance_reviewed_by',
        'finance_reviewed_at',
        'finance_comments',
        'rejection_reason',
        'created_by',
        'created_at',
        'updated_at',
        'is_active',
        'created_at',
      ],
      admin: [
        'id',
        'request_number',
        'fiscal_year',
        'department_id',
        'status',
        'total_requested_amount',
        'justification',
        'submitted_by',
        'submitted_at',
        'dept_reviewed_by',
        'dept_reviewed_at',
        'dept_comments',
        'finance_reviewed_by',
        'finance_reviewed_at',
        'finance_comments',
        'rejection_reason',
        'created_by',
        'created_at',
        'updated_at',
        'deleted_at',
        'is_active',
      ],
    };

    // 🛡️ Security: Get user role (default to public for safety)
    const userRole = request.user?.role || 'public';
    const allowedFields = SAFE_FIELDS[userRole] || SAFE_FIELDS.public;

    // 🛡️ Security: Filter requested fields against whitelist
    const safeFields = fields
      ? fields.filter((field) => allowedFields.includes(field))
      : undefined;

    // 🛡️ Security: Log suspicious requests
    if (fields && fields.some((field) => !allowedFields.includes(field))) {
      request.log.warn(
        {
          user: request.user?.id,
          requestedFields: fields,
          allowedFields,
          ip: request.ip,
        },
        'Suspicious field access attempt detected',
      );
    }

    // Get budgetRequests list with field filtering
    const result = await this.budgetRequestsService.findMany({
      ...queryParams,
      fields: safeFields,
    });

    request.log.info(
      {
        count: result.data.length,
        total: result.pagination.total,
        fieldsRequested: fields?.length || 0,
        fieldsAllowed: safeFields?.length || 'all',
      },
      'BudgetRequests list fetched',
    );

    // Use raw send to match FlexibleSchema
    return reply.send({
      success: true,
      data: result.data,
      pagination: result.pagination,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: process.env.NODE_ENV || 'development',
      },
    });
  }

  /**
   * Update budgetRequests
   * PUT /budgetRequests/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: Static<typeof UpdateBudgetRequestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { budgetRequestsId: id, body: request.body },
      'Updating budgetRequests',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const budgetRequests = await this.budgetRequestsService.update(
      id,
      updateData,
    );

    request.log.info(
      { budgetRequestsId: id },
      'BudgetRequests updated successfully',
    );

    return reply.success(budgetRequests, 'BudgetRequests updated successfully');
  }

  /**
   * Delete budgetRequests
   * DELETE /budgetRequests/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetRequestsId: id }, 'Deleting budgetRequests');

    const deleted = await this.budgetRequestsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'BudgetRequests not found');
    }

    request.log.info(
      { budgetRequestsId: id },
      'BudgetRequests deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'BudgetRequests deleted successfully',
    );
  }

  // ===== WORKFLOW ENDPOINTS =====

  /**
   * Submit budget request for approval
   * POST /budgetRequests/:id/submit
   */
  async submit(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestsId: id, userId },
      'Submitting budget request',
    );

    try {
      const updated = await this.budgetRequestsService.submit(id, userId);

      return reply.success(updated, 'Budget request submitted successfully');
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestsId: id },
        'Failed to submit budget request',
      );
      return reply.code(400).error('SUBMISSION_FAILED', error.message);
    }
  }

  /**
   * Approve budget request by department head
   * POST /budgetRequests/:id/approve-dept
   */
  async approveDept(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: { comments?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { comments } = request.body || {};
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestsId: id, userId },
      'Approving budget request (dept)',
    );

    try {
      const updated = await this.budgetRequestsService.approveDept(
        id,
        userId,
        comments,
      );

      return reply.success(updated, 'Budget request approved by department');
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestsId: id },
        'Failed to approve budget request (dept)',
      );
      return reply.code(400).error('APPROVAL_FAILED', error.message);
    }
  }

  /**
   * Approve budget request by finance manager
   * POST /budgetRequests/:id/approve-finance
   */
  async approveFinance(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: { comments?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { comments } = request.body || {};
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestsId: id, userId },
      'Approving budget request (finance)',
    );

    try {
      const updated = await this.budgetRequestsService.approveFinance(
        id,
        userId,
        comments,
      );

      return reply.success(updated, 'Budget request approved by finance');
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestsId: id },
        'Failed to approve budget request (finance)',
      );
      return reply.code(400).error('APPROVAL_FAILED', error.message);
    }
  }

  /**
   * Reject budget request
   * POST /budgetRequests/:id/reject
   */
  async reject(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: { reason: string };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { reason } = request.body || {};
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    if (!reason || reason.trim().length === 0) {
      return reply
        .code(400)
        .error('VALIDATION_ERROR', 'Rejection reason is required');
    }

    request.log.info(
      { budgetRequestsId: id, userId },
      'Rejecting budget request',
    );

    try {
      const updated = await this.budgetRequestsService.reject(
        id,
        userId,
        reason,
      );

      return reply.success(updated, 'Budget request rejected');
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestsId: id },
        'Failed to reject budget request',
      );
      return reply.code(400).error('REJECTION_FAILED', error.message);
    }
  }

  /**
   * Initialize budget request with drug generics
   * POST /budgetRequests/:id/initialize
   */
  async initialize(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestsId: id, userId },
      'Initializing budget request with drug generics',
    );

    try {
      const result = await this.budgetRequestsService.initialize(id, userId);

      request.log.info(
        {
          budgetRequestsId: id,
          itemsCreated: result.itemsCreated,
        },
        'Budget request initialized successfully',
      );

      return reply.success(result, result.message);
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestsId: id },
        'Failed to initialize budget request',
      );
      return reply.code(400).error('INITIALIZATION_FAILED', error.message);
    }
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateBudgetRequestsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      request_number: schema.request_number,
      fiscal_year: schema.fiscal_year,
      department_id: schema.department_id,
      status: schema.status,
      total_requested_amount: schema.total_requested_amount,
      justification: schema.justification,
      submitted_by: schema.submitted_by,
      submitted_at: schema.submitted_at,
      dept_reviewed_by: schema.dept_reviewed_by,
      dept_reviewed_at: schema.dept_reviewed_at,
      dept_comments: schema.dept_comments,
      finance_reviewed_by: schema.finance_reviewed_by,
      finance_reviewed_at: schema.finance_reviewed_at,
      finance_comments: schema.finance_comments,
      rejection_reason: schema.rejection_reason,
      deleted_at: schema.deleted_at,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field
    if (request.user?.id) {
      result.created_by = request.user.id;
    }

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateBudgetRequestsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.request_number !== undefined) {
      updateData.request_number = schema.request_number;
    }
    if (schema.fiscal_year !== undefined) {
      updateData.fiscal_year = schema.fiscal_year;
    }
    if (schema.department_id !== undefined) {
      updateData.department_id = schema.department_id;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.total_requested_amount !== undefined) {
      updateData.total_requested_amount = schema.total_requested_amount;
    }
    if (schema.justification !== undefined) {
      updateData.justification = schema.justification;
    }
    if (schema.submitted_by !== undefined) {
      updateData.submitted_by = schema.submitted_by;
    }
    if (schema.submitted_at !== undefined) {
      updateData.submitted_at = schema.submitted_at;
    }
    if (schema.dept_reviewed_by !== undefined) {
      updateData.dept_reviewed_by = schema.dept_reviewed_by;
    }
    if (schema.dept_reviewed_at !== undefined) {
      updateData.dept_reviewed_at = schema.dept_reviewed_at;
    }
    if (schema.dept_comments !== undefined) {
      updateData.dept_comments = schema.dept_comments;
    }
    if (schema.finance_reviewed_by !== undefined) {
      updateData.finance_reviewed_by = schema.finance_reviewed_by;
    }
    if (schema.finance_reviewed_at !== undefined) {
      updateData.finance_reviewed_at = schema.finance_reviewed_at;
    }
    if (schema.finance_comments !== undefined) {
      updateData.finance_comments = schema.finance_comments;
    }
    if (schema.rejection_reason !== undefined) {
      updateData.rejection_reason = schema.rejection_reason;
    }
    if (schema.deleted_at !== undefined) {
      updateData.deleted_at = schema.deleted_at;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
