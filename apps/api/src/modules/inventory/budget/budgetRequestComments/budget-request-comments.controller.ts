import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { BudgetRequestCommentsService } from './budget-request-comments.service';
import {
  CreateBudgetRequestComments,
  UpdateBudgetRequestComments,
} from './budget-request-comments.types';
import {
  CreateBudgetRequestCommentsSchema,
  UpdateBudgetRequestCommentsSchema,
  BudgetRequestCommentsIdParamSchema,
  GetBudgetRequestCommentsQuerySchema,
  ListBudgetRequestCommentsQuerySchema,
} from './budget-request-comments.schemas';

/**
 * BudgetRequestComments Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class BudgetRequestCommentsController {
  constructor(
    private budgetRequestCommentsService: BudgetRequestCommentsService,
  ) {}

  /**
   * Create new budgetRequestComments
   * POST /budgetRequestComments
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateBudgetRequestCommentsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating budgetRequestComments');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const budgetRequestComments =
      await this.budgetRequestCommentsService.create(createData);

    request.log.info(
      { budgetRequestCommentsId: budgetRequestComments.id },
      'BudgetRequestComments created successfully',
    );

    return reply
      .code(201)
      .success(
        budgetRequestComments,
        'BudgetRequestComments created successfully',
      );
  }

  /**
   * Get budgetRequestComments by ID
   * GET /budgetRequestComments/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestCommentsIdParamSchema>;
      Querystring: Static<typeof GetBudgetRequestCommentsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { budgetRequestCommentsId: id },
      'Fetching budgetRequestComments',
    );

    const budgetRequestComments =
      await this.budgetRequestCommentsService.findById(id, request.query);

    return reply.success(budgetRequestComments);
  }

  /**
   * Get paginated list of budgetRequestCommentss
   * GET /budgetRequestComments
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListBudgetRequestCommentsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching budgetRequestComments list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'budget_request_id', 'created_at'],
      user: [
        'id',
        'budget_request_id',
        'id',
        'budget_request_id',
        'parent_id',
        'comment',
        'created_by',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'budget_request_id',
        'parent_id',
        'comment',
        'created_by',
        'created_at',
        'updated_at',
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

    // Get budgetRequestComments list with field filtering
    const result = await this.budgetRequestCommentsService.findMany({
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
      'BudgetRequestComments list fetched',
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
   * Update budgetRequestComments
   * PUT /budgetRequestComments/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestCommentsIdParamSchema>;
      Body: Static<typeof UpdateBudgetRequestCommentsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { budgetRequestCommentsId: id, body: request.body },
      'Updating budgetRequestComments',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const budgetRequestComments =
      await this.budgetRequestCommentsService.update(id, updateData);

    request.log.info(
      { budgetRequestCommentsId: id },
      'BudgetRequestComments updated successfully',
    );

    return reply.success(
      budgetRequestComments,
      'BudgetRequestComments updated successfully',
    );
  }

  /**
   * Delete budgetRequestComments
   * DELETE /budgetRequestComments/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof BudgetRequestCommentsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { budgetRequestCommentsId: id },
      'Deleting budgetRequestComments',
    );

    const deleted = await this.budgetRequestCommentsService.delete(id);

    if (!deleted) {
      return reply
        .code(404)
        .error('NOT_FOUND', 'BudgetRequestComments not found');
    }

    request.log.info(
      { budgetRequestCommentsId: id },
      'BudgetRequestComments deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'BudgetRequestComments deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateBudgetRequestCommentsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      budget_request_id: schema.budget_request_id,
      parent_id: schema.parent_id,
      comment: schema.comment,
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
    schema: Static<typeof UpdateBudgetRequestCommentsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.budget_request_id !== undefined) {
      updateData.budget_request_id = schema.budget_request_id;
    }
    if (schema.parent_id !== undefined) {
      updateData.parent_id = schema.parent_id;
    }
    if (schema.comment !== undefined) {
      updateData.comment = schema.comment;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
