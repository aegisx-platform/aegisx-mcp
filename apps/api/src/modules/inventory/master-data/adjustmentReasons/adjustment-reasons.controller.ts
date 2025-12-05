import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { AdjustmentReasonsService } from './adjustment-reasons.service';
import {
  CreateAdjustmentReasons,
  UpdateAdjustmentReasons,
} from './adjustment-reasons.types';
import {
  CreateAdjustmentReasonsSchema,
  UpdateAdjustmentReasonsSchema,
  AdjustmentReasonsIdParamSchema,
  GetAdjustmentReasonsQuerySchema,
  ListAdjustmentReasonsQuerySchema,
} from './adjustment-reasons.schemas';

/**
 * AdjustmentReasons Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class AdjustmentReasonsController {
  constructor(private adjustmentReasonsService: AdjustmentReasonsService) {}

  /**
   * Create new adjustmentReasons
   * POST /adjustmentReasons
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateAdjustmentReasonsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating adjustmentReasons');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const adjustmentReasons =
      await this.adjustmentReasonsService.create(createData);

    request.log.info(
      { adjustmentReasonsId: adjustmentReasons.id },
      'AdjustmentReasons created successfully',
    );

    return reply
      .code(201)
      .success(adjustmentReasons, 'AdjustmentReasons created successfully');
  }

  /**
   * Get adjustmentReasons by ID
   * GET /adjustmentReasons/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof AdjustmentReasonsIdParamSchema>;
      Querystring: Static<typeof GetAdjustmentReasonsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ adjustmentReasonsId: id }, 'Fetching adjustmentReasons');

    const adjustmentReasons = await this.adjustmentReasonsService.findById(
      id,
      request.query,
    );

    return reply.success(adjustmentReasons);
  }

  /**
   * Get paginated list of adjustmentReasonss
   * GET /adjustmentReasons
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListAdjustmentReasonsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching adjustmentReasons list',
    );

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
        'adjustment_type',
        'requires_approval',
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
        'adjustment_type',
        'requires_approval',
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

    // Get adjustmentReasons list with field filtering
    const result = await this.adjustmentReasonsService.findMany({
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
      'AdjustmentReasons list fetched',
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
   * Update adjustmentReasons
   * PUT /adjustmentReasons/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof AdjustmentReasonsIdParamSchema>;
      Body: Static<typeof UpdateAdjustmentReasonsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { adjustmentReasonsId: id, body: request.body },
      'Updating adjustmentReasons',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const adjustmentReasons = await this.adjustmentReasonsService.update(
      id,
      updateData,
    );

    request.log.info(
      { adjustmentReasonsId: id },
      'AdjustmentReasons updated successfully',
    );

    return reply.success(
      adjustmentReasons,
      'AdjustmentReasons updated successfully',
    );
  }

  /**
   * Delete adjustmentReasons
   * DELETE /adjustmentReasons/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof AdjustmentReasonsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ adjustmentReasonsId: id }, 'Deleting adjustmentReasons');

    const deleted = await this.adjustmentReasonsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'AdjustmentReasons not found');
    }

    request.log.info(
      { adjustmentReasonsId: id },
      'AdjustmentReasons deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'AdjustmentReasons deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateAdjustmentReasonsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      reason_code: schema.reason_code,
      reason_name: schema.reason_name,
      adjustment_type: schema.adjustment_type,
      requires_approval: schema.requires_approval,
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
    schema: Static<typeof UpdateAdjustmentReasonsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.reason_code !== undefined) {
      updateData.reason_code = schema.reason_code;
    }
    if (schema.reason_name !== undefined) {
      updateData.reason_name = schema.reason_name;
    }
    if (schema.adjustment_type !== undefined) {
      updateData.adjustment_type = schema.adjustment_type;
    }
    if (schema.requires_approval !== undefined) {
      updateData.requires_approval = schema.requires_approval;
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
