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
  GetBudgetRequestsStatsQuerySchema,
  RecentBudgetRequestsQuerySchema,
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

    // Get userId from authenticated user for department auto-population
    const userId = request.user?.id;

    const budgetRequests = await this.budgetRequestsService.create(
      createData,
      userId,
    );

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
   * Get aggregated budget request stats for dashboard
   * GET /budgetRequests/stats/total
   */
  async getStats(
    request: FastifyRequest<{
      Querystring: Static<typeof GetBudgetRequestsStatsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const user = request.user as {
      id: string;
      permissions?: string[];
    };

    if (!user || !user.id) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    const stats = await this.budgetRequestsService.getStats(
      user,
      request.query,
    );

    return reply.success(stats);
  }

  /**
   * Get budget requests pending the current user's action
   * GET /budgetRequests/my-pending-actions
   */
  async getMyPendingActions(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as {
      id: string;
      permissions?: string[];
    };

    if (!user || !user.id) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    const result = await this.budgetRequestsService.getMyPendingActions(user);

    return reply.success(result);
  }

  /**
   * Get most recent budget requests
   * GET /budgetRequests/recent
   */
  async getRecent(
    request: FastifyRequest<{
      Querystring: Static<typeof RecentBudgetRequestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching recent requests');
    const user = request.user as {
      id: string;
      permissions?: string[];
    };

    if (!user || !user.id) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    const result = await this.budgetRequestsService.getRecent(
      user,
      request.query,
    );

    return reply.success(result);
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
   * Validate budget request before submission
   * POST /budgetRequests/:id/validate
   */
  async validate(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetRequestsId: id }, 'Validating budget request');

    const validationResult =
      await this.budgetRequestsService.validateForSubmit(id);

    return reply.send(validationResult);
  }

  /**
   * Check if drugs in request are in budget plan
   * POST /budgetRequests/:id/check-drugs-in-plan
   */
  async checkDrugsInPlan(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: { drug_ids: string[] };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { drug_ids } = request.body;

    request.log.info(
      { budgetRequestId: id, drugCount: drug_ids.length },
      'Checking drugs in plan',
    );

    try {
      const result = await this.budgetRequestsService.checkDrugsInPlan(
        id,
        drug_ids,
      );
      return reply.success(result);
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id },
        'Failed to check drugs in plan',
      );
      if (error.statusCode === 404) {
        return reply.code(404).error('NOT_FOUND', error.message);
      }
      return reply.code(500).error('CHECK_FAILED', error.message);
    }
  }

  /**
   * Check budget availability for request
   * POST /budgetRequests/:id/check-budget-availability
   */
  async checkBudgetAvailability(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    request.log.info({ budgetRequestId: id }, 'Checking budget availability');

    try {
      const result =
        await this.budgetRequestsService.checkBudgetAvailability(id);
      return reply.success(result);
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id },
        'Failed to check budget availability',
      );
      if (error.statusCode === 404) {
        return reply.code(404).error('NOT_FOUND', error.message);
      }
      return reply.code(500).error('CHECK_FAILED', error.message);
    }
  }

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

  /**
   * Initialize from Drug Master (no calculation)
   * POST /budgetRequests/:id/initialize-from-master
   */
  async initializeFromMaster(
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
      'Initializing budget request from drug master (no calculation)',
    );

    try {
      const result = await this.budgetRequestsService.initializeFromMaster(
        id,
        userId,
      );

      request.log.info(
        {
          budgetRequestsId: id,
          itemsCreated: result.itemsCreated,
        },
        'Budget request initialized from drug master successfully',
      );

      return reply.success(result, result.message);
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestsId: id },
        'Failed to initialize budget request from drug master',
      );
      return reply.code(400).error('INITIALIZATION_FAILED', error.message);
    }
  }

  /**
   * Import Excel/CSV file for budget request items
   * POST /budgetRequests/:id/import-excel
   */
  async importExcel(
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

    try {
      // Use @aegisx/fastify-multipart clean API
      const { files, fields } = await request.parseMultipart();

      if (!files || files.length === 0) {
        return reply.code(400).error('FILE_REQUIRED', 'File is required');
      }

      const file = files[0];

      // Validate file type
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return reply
          .code(422)
          .error(
            'INVALID_FILE_FORMAT',
            'File must be Excel (.xlsx, .xls) or CSV (.csv) format',
          );
      }

      // Validate file size (5 MB limit)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
      const buffer = await file.toBuffer();

      if (buffer.length > MAX_FILE_SIZE) {
        return reply
          .code(422)
          .error('FILE_TOO_LARGE', 'File size must be less than 5 MB');
      }

      // Get import options from multipart data
      // Support both legacy 'replace_all' and new 'mode' field
      const mode =
        (fields?.mode as string) ||
        (fields?.replace_all === 'true' ? 'replace' : 'append');
      const skipErrors = fields?.skipErrors === 'true';

      request.log.info(
        {
          budgetRequestsId: id,
          userId,
          filename: file.filename,
          mimetype: file.mimetype,
          size: buffer.length,
          mode,
          skipErrors,
        },
        'Importing Excel/CSV file for budget request items',
      );

      // Call service method with new options
      const result = await this.budgetRequestsService.importExcel(
        id,
        buffer,
        { mode: mode as 'append' | 'replace' | 'update', skipErrors },
        userId,
      );

      request.log.info(
        {
          budgetRequestsId: id,
          imported: result.imported,
          updated: result.updated,
          skipped: result.skipped,
          errors: result.errors.length,
        },
        'Excel/CSV import completed',
      );

      return reply.success(result, 'Import completed');
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestsId: id },
        'Failed to import Excel/CSV file',
      );
      return reply.code(400).error('IMPORT_FAILED', error.message);
    }
  }

  /**
   * Export budget request items to SSCJ Excel format
   * GET /budgetRequests/:id/export-sscj
   */
  async exportSSCJ(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Querystring: { format?: 'xlsx' | 'csv' };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const format = request.query.format || 'xlsx';

    request.log.info(
      { budgetRequestId: id, format },
      'Exporting budget request to SSCJ format',
    );

    try {
      // Get budget request to generate filename
      const budgetRequest = await this.budgetRequestsService.findById(
        id,
        {} as any,
      );

      if (!budgetRequest) {
        return reply.code(404).error('NOT_FOUND', 'Budget request not found');
      }

      // Generate Excel buffer
      const buffer = await this.budgetRequestsService.exportSSCJ(id);

      // Generate filename
      const requestNumber = budgetRequest.request_number || id;
      const fiscalYear = budgetRequest.fiscal_year || '2569';
      const filename = `แผนงบประมาณยา_ปี${fiscalYear}_${requestNumber}.xlsx`;

      request.log.info(
        { budgetRequestId: id, filename, size: buffer.length },
        'SSCJ export successful',
      );

      // Set response headers for file download
      reply.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      reply.header(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(filename)}"`,
      );
      reply.header('Content-Length', buffer.length);

      return reply.send(buffer);
    } catch (error: any) {
      request.log.error(
        { budgetRequestId: id, error: error.message },
        'Failed to export SSCJ',
      );
      return reply.code(500).error('EXPORT_FAILED', error.message);
    }
  }

  async reopen(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: { reason: string };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { reason } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestId: id, userId, reason },
      'Reopening budget request',
    );

    try {
      const budgetRequest = await this.budgetRequestsService.reopen(
        id,
        reason,
        userId,
      );

      request.log.info(
        { budgetRequestId: id, status: budgetRequest.status },
        'Budget request reopened successfully',
      );

      return reply.success(
        budgetRequest,
        'Budget request reopened successfully',
      );
    } catch (error: any) {
      request.log.error(
        { budgetRequestId: id, error: error.message, code: error.code },
        'Failed to reopen budget request',
      );

      if (error.statusCode === 404) {
        return reply.code(404).error('NOT_FOUND', error.message);
      }

      if (error.statusCode === 422) {
        return reply
          .code(422)
          .error(error.code || 'UNPROCESSABLE_ENTITY', error.message);
      }

      return reply.code(500).error('REOPEN_FAILED', error.message);
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

  // ===== ITEM MANAGEMENT METHODS =====

  /**
   * Add drug item to budget request
   * POST /budget-requests/:id/items
   */
  async addItem(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: {
        generic_id: number;
        estimated_usage_2569?: number;
        requested_qty: number;
        unit_price?: number;
        budget_qty?: number;
        fund_qty?: number;
        q1_qty?: number;
        q2_qty?: number;
        q3_qty?: number;
        q4_qty?: number;
        notes?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestId: id, genericId: request.body.generic_id },
      'Adding item to budget request',
    );

    try {
      const item = await this.budgetRequestsService.addItem(
        id,
        request.body,
        userId,
      );

      request.log.info(
        { budgetRequestId: id, itemId: item.id },
        'Item added successfully',
      );

      return reply.code(201).success(item, 'Item added successfully');
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id },
        'Failed to add item',
      );
      return reply.error('ADD_ITEM_FAILED', error.message, 422);
    }
  }

  /**
   * Update budget request item
   * PUT /budget-requests/:id/items/:itemId
   */
  async updateItem(
    request: FastifyRequest<{
      Params: { id: string | number; itemId: string | number };
      Body: {
        estimated_usage_2569?: number;
        requested_qty?: number;
        unit_price?: number;
        budget_qty?: number;
        fund_qty?: number;
        q1_qty?: number;
        q2_qty?: number;
        q3_qty?: number;
        q4_qty?: number;
        notes?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { id, itemId } = request.params;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestId: id, itemId },
      'Updating budget request item',
    );

    try {
      const item = await this.budgetRequestsService.updateItem(
        id,
        itemId,
        request.body,
        userId,
      );

      request.log.info(
        { budgetRequestId: id, itemId },
        'Item updated successfully',
      );

      return reply.success(item, 'Item updated successfully');
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id, itemId },
        'Failed to update item',
      );
      return reply.code(400).error('UPDATE_ITEM_FAILED', error.message);
    }
  }

  /**
   * Batch update budget request items
   * PUT /budget-requests/:id/items/batch
   */
  async batchUpdateItems(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: {
        items: Array<{
          id: number;
          estimated_usage_2569?: number;
          requested_qty?: number;
          unit_price?: number;
          budget_qty?: number;
          fund_qty?: number;
          q1_qty?: number;
          q2_qty?: number;
          q3_qty?: number;
          q4_qty?: number;
          notes?: string;
          // Historical usage fields (editable)
          historical_usage?: Record<string, number>;
          avg_usage?: number;
          current_stock?: number;
        }>;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { items } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestId: id, itemCount: items.length },
      'Batch updating budget request items',
    );

    try {
      const result = await this.budgetRequestsService.batchUpdateItems(
        id,
        items,
        userId,
      );

      request.log.info(
        {
          budgetRequestId: id,
          updated: result.updated,
          failed: result.failed,
        },
        'Batch update completed',
      );

      return reply.send({
        success: true,
        data: result,
        message: `Updated ${result.updated} items successfully`,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id },
        'Failed to batch update items',
      );
      return reply.code(400).error('BATCH_UPDATE_FAILED', error.message);
    }
  }

  /**
   * Delete budget request item
   * DELETE /budget-requests/:id/items/:itemId
   */
  async deleteItem(
    request: FastifyRequest<{
      Params: { id: string | number; itemId: string | number };
    }>,
    reply: FastifyReply,
  ) {
    const { id, itemId } = request.params;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    request.log.info(
      { budgetRequestId: id, itemId },
      'Deleting budget request item',
    );

    try {
      const deleted = await this.budgetRequestsService.deleteItem(
        id,
        itemId,
        userId,
      );

      if (!deleted) {
        return reply.code(404).error('NOT_FOUND', 'Item not found');
      }

      request.log.info(
        { budgetRequestId: id, itemId },
        'Item deleted successfully',
      );

      return reply.success(
        { id: itemId, deleted: true },
        'Item deleted successfully',
      );
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id, itemId },
        'Failed to delete item',
      );
      return reply.code(400).error('DELETE_ITEM_FAILED', error.message);
    }
  }

  /**
   * Bulk delete selected budget request items
   * POST /budget-requests/:id/items/bulk-delete
   */
  async bulkDeleteItems(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestsIdParamSchema>;
      Body: { itemIds: number[] };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { itemIds } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).error('UNAUTHORIZED', 'User not authenticated');
    }

    if (!itemIds || itemIds.length === 0) {
      return reply.code(400).error('INVALID_REQUEST', 'No item IDs provided');
    }

    request.log.info(
      { budgetRequestId: id, itemIds, userId },
      'Bulk deleting budget request items',
    );

    try {
      const result = await this.budgetRequestsService.bulkDeleteItems(
        id,
        itemIds,
        userId,
      );

      request.log.info(
        { budgetRequestId: id, deletedCount: result.deletedCount },
        'Items deleted successfully',
      );

      return reply.success(result, `Deleted ${result.deletedCount} items`);
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id },
        'Failed to bulk delete items',
      );
      return reply.code(400).error('BULK_DELETE_FAILED', error.message);
    }
  }

  /**
   * Delete ALL budget request items (bulk delete)
   * DELETE /budget-requests/:id/items
   */
  async deleteAllItems(
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
      { budgetRequestId: id, userId },
      'Deleting all budget request items',
    );

    try {
      const result = await this.budgetRequestsService.deleteAllItems(
        id,
        userId,
      );

      request.log.info(
        { budgetRequestId: id, deletedCount: result.deletedCount },
        'All items deleted successfully',
      );

      return reply.success(result, `Deleted ${result.deletedCount} items`);
    } catch (error: any) {
      request.log.error(
        { error: error.message, budgetRequestId: id },
        'Failed to delete all items',
      );
      return reply.code(400).error('DELETE_ALL_ITEMS_FAILED', error.message);
    }
  }
}
