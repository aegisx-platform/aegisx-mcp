import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ReturnReasonsService } from './return-reasons.service';
import {
  CreateReturnReasons,
  UpdateReturnReasons,
} from './return-reasons.types';
import {
  CreateReturnReasonsSchema,
  UpdateReturnReasonsSchema,
  ReturnReasonsIdParamSchema,
  GetReturnReasonsQuerySchema,
  ListReturnReasonsQuerySchema,
} from './return-reasons.schemas';

/**
 * ReturnReasons Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ReturnReasonsController {
  constructor(private returnReasonsService: ReturnReasonsService) {}

  /**
   * Create new returnReasons
   * POST /returnReasons
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateReturnReasonsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating returnReasons');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const returnReasons = await this.returnReasonsService.create(createData);

    request.log.info(
      { returnReasonsId: returnReasons.id },
      'ReturnReasons created successfully',
    );

    return reply
      .code(201)
      .success(returnReasons, 'ReturnReasons created successfully');
  }

  /**
   * Get returnReasons by ID
   * GET /returnReasons/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ReturnReasonsIdParamSchema>;
      Querystring: Static<typeof GetReturnReasonsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ returnReasonsId: id }, 'Fetching returnReasons');

    const returnReasons = await this.returnReasonsService.findById(
      id,
      request.query,
    );

    return reply.success(returnReasons);
  }

  /**
   * Get paginated list of returnReasonss
   * GET /returnReasons
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListReturnReasonsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching returnReasons list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'reason_code', 'created_at'],
      user: [
        'id',
        'reason_code',
        'id',
        'reason_code',
        'reason_name',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'reason_code',
        'reason_name',
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

    // Get returnReasons list with field filtering
    const result = await this.returnReasonsService.findMany({
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
      'ReturnReasons list fetched',
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
   * Update returnReasons
   * PUT /returnReasons/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ReturnReasonsIdParamSchema>;
      Body: Static<typeof UpdateReturnReasonsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { returnReasonsId: id, body: request.body },
      'Updating returnReasons',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const returnReasons = await this.returnReasonsService.update(
      id,
      updateData,
    );

    request.log.info(
      { returnReasonsId: id },
      'ReturnReasons updated successfully',
    );

    return reply.success(returnReasons, 'ReturnReasons updated successfully');
  }

  /**
   * Delete returnReasons
   * DELETE /returnReasons/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof ReturnReasonsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ returnReasonsId: id }, 'Deleting returnReasons');

    const deleted = await this.returnReasonsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'ReturnReasons not found');
    }

    request.log.info(
      { returnReasonsId: id },
      'ReturnReasons deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'ReturnReasons deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateReturnReasonsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      reason_code: schema.reason_code,
      reason_name: schema.reason_name,
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
    schema: Static<typeof UpdateReturnReasonsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.reason_code !== undefined) {
      updateData.reason_code = schema.reason_code;
    }
    if (schema.reason_name !== undefined) {
      updateData.reason_name = schema.reason_name;
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
