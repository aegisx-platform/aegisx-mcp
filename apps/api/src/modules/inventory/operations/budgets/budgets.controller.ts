import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { BudgetsService } from './budgets.service';
import { CreateBudgets, UpdateBudgets } from './budgets.types';
import {
  CreateBudgetsSchema,
  UpdateBudgetsSchema,
  BudgetsIdParamSchema,
  GetBudgetsQuerySchema,
  ListBudgetsQuerySchema,
} from './budgets.schemas';

/**
 * Budgets Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  /**
   * Create new budgets
   * POST /budgets
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateBudgetsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating budgets');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const budgets = await this.budgetsService.create(createData);

    request.log.info({ budgetsId: budgets.id }, 'Budgets created successfully');

    return reply.code(201).success(budgets, 'Budgets created successfully');
  }

  /**
   * Get budgets by ID
   * GET /budgets/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof BudgetsIdParamSchema>;
      Querystring: Static<typeof GetBudgetsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id }, 'Fetching budgets');

    const budgets = await this.budgetsService.findById(id, request.query);

    return reply.success(budgets);
  }

  /**
   * Get paginated list of budgetss
   * GET /budgets
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListBudgetsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching budgets list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'budget_type_id', 'created_at'],
      user: [
        'id',
        'budget_type_id',
        'id',
        'budget_type_id',
        'budget_category_id',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'budget_type_id',
        'budget_category_id',
        'description',
        'is_active',
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

    // Get budgets list with field filtering
    const result = await this.budgetsService.findMany({
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
      'Budgets list fetched',
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
   * Update budgets
   * PUT /budgets/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof BudgetsIdParamSchema>;
      Body: Static<typeof UpdateBudgetsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id, body: request.body }, 'Updating budgets');

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const budgets = await this.budgetsService.update(id, updateData);

    request.log.info({ budgetsId: id }, 'Budgets updated successfully');

    return reply.success(budgets, 'Budgets updated successfully');
  }

  /**
   * Delete budgets
   * DELETE /budgets/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof BudgetsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id }, 'Deleting budgets');

    const deleted = await this.budgetsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Budgets not found');
    }

    request.log.info({ budgetsId: id }, 'Budgets deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Budgets deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateBudgetsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      budget_type_id: schema.budget_type_id,
      budget_category_id: schema.budget_category_id,
      description: schema.description,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateBudgetsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.budget_type_id !== undefined) {
      updateData.budget_type_id = schema.budget_type_id;
    }
    if (schema.budget_category_id !== undefined) {
      updateData.budget_category_id = schema.budget_category_id;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
