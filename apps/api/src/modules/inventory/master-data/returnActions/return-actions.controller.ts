import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ReturnActionsService } from './return-actions.service';
import {
  CreateReturnActions,
  UpdateReturnActions,
} from './return-actions.types';
import {
  CreateReturnActionsSchema,
  UpdateReturnActionsSchema,
  ReturnActionsIdParamSchema,
  GetReturnActionsQuerySchema,
  ListReturnActionsQuerySchema,
} from './return-actions.schemas';

/**
 * ReturnActions Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ReturnActionsController {
  constructor(private returnActionsService: ReturnActionsService) {}

  /**
   * Create new returnActions
   * POST /returnActions
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateReturnActionsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating returnActions');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const returnActions = await this.returnActionsService.create(createData);

    request.log.info(
      { returnActionsId: returnActions.id },
      'ReturnActions created successfully',
    );

    return reply
      .code(201)
      .success(returnActions, 'ReturnActions created successfully');
  }

  /**
   * Get returnActions by ID
   * GET /returnActions/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ReturnActionsIdParamSchema>;
      Querystring: Static<typeof GetReturnActionsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ returnActionsId: id }, 'Fetching returnActions');

    const returnActions = await this.returnActionsService.findById(
      id,
      request.query,
    );

    return reply.success(returnActions);
  }

  /**
   * Get paginated list of returnActionss
   * GET /returnActions
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListReturnActionsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching returnActions list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'action_code', 'created_at'],
      user: [
        'id',
        'action_code',
        'id',
        'action_code',
        'action_name',
        'action_type',
        'requires_vendor_approval',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'action_code',
        'action_name',
        'action_type',
        'requires_vendor_approval',
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

    // Get returnActions list with field filtering
    const result = await this.returnActionsService.findMany({
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
      'ReturnActions list fetched',
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
   * Update returnActions
   * PUT /returnActions/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ReturnActionsIdParamSchema>;
      Body: Static<typeof UpdateReturnActionsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { returnActionsId: id, body: request.body },
      'Updating returnActions',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const returnActions = await this.returnActionsService.update(
      id,
      updateData,
    );

    request.log.info(
      { returnActionsId: id },
      'ReturnActions updated successfully',
    );

    return reply.success(returnActions, 'ReturnActions updated successfully');
  }

  /**
   * Delete returnActions
   * DELETE /returnActions/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof ReturnActionsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ returnActionsId: id }, 'Deleting returnActions');

    const deleted = await this.returnActionsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'ReturnActions not found');
    }

    request.log.info(
      { returnActionsId: id },
      'ReturnActions deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'ReturnActions deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateReturnActionsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      action_code: schema.action_code,
      action_name: schema.action_name,
      action_type: schema.action_type,
      requires_vendor_approval: schema.requires_vendor_approval,
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
    schema: Static<typeof UpdateReturnActionsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.action_code !== undefined) {
      updateData.action_code = schema.action_code;
    }
    if (schema.action_name !== undefined) {
      updateData.action_name = schema.action_name;
    }
    if (schema.action_type !== undefined) {
      updateData.action_type = schema.action_type;
    }
    if (schema.requires_vendor_approval !== undefined) {
      updateData.requires_vendor_approval = schema.requires_vendor_approval;
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
