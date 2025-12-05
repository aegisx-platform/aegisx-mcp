import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { PurchaseTypesService } from './purchase-types.service';
import {
  CreatePurchaseTypes,
  UpdatePurchaseTypes,
} from './purchase-types.types';
import {
  CreatePurchaseTypesSchema,
  UpdatePurchaseTypesSchema,
  PurchaseTypesIdParamSchema,
  GetPurchaseTypesQuerySchema,
  ListPurchaseTypesQuerySchema,
} from './purchase-types.schemas';

/**
 * PurchaseTypes Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class PurchaseTypesController {
  constructor(private purchaseTypesService: PurchaseTypesService) {}

  /**
   * Create new purchaseTypes
   * POST /purchaseTypes
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreatePurchaseTypesSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating purchaseTypes');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const purchaseTypes = await this.purchaseTypesService.create(createData);

    request.log.info(
      { purchaseTypesId: purchaseTypes.id },
      'PurchaseTypes created successfully',
    );

    return reply
      .code(201)
      .success(purchaseTypes, 'PurchaseTypes created successfully');
  }

  /**
   * Get purchaseTypes by ID
   * GET /purchaseTypes/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseTypesIdParamSchema>;
      Querystring: Static<typeof GetPurchaseTypesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ purchaseTypesId: id }, 'Fetching purchaseTypes');

    const purchaseTypes = await this.purchaseTypesService.findById(
      id,
      request.query,
    );

    return reply.success(purchaseTypes);
  }

  /**
   * Get paginated list of purchaseTypess
   * GET /purchaseTypes
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListPurchaseTypesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching purchaseTypes list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'type_code', 'created_at'],
      user: [
        'id',
        'type_code',
        'id',
        'type_code',
        'type_name',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'type_code',
        'type_name',
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

    // Get purchaseTypes list with field filtering
    const result = await this.purchaseTypesService.findMany({
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
      'PurchaseTypes list fetched',
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
   * Update purchaseTypes
   * PUT /purchaseTypes/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseTypesIdParamSchema>;
      Body: Static<typeof UpdatePurchaseTypesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { purchaseTypesId: id, body: request.body },
      'Updating purchaseTypes',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const purchaseTypes = await this.purchaseTypesService.update(
      id,
      updateData,
    );

    request.log.info(
      { purchaseTypesId: id },
      'PurchaseTypes updated successfully',
    );

    return reply.success(purchaseTypes, 'PurchaseTypes updated successfully');
  }

  /**
   * Delete purchaseTypes
   * DELETE /purchaseTypes/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof PurchaseTypesIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ purchaseTypesId: id }, 'Deleting purchaseTypes');

    const deleted = await this.purchaseTypesService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'PurchaseTypes not found');
    }

    request.log.info(
      { purchaseTypesId: id },
      'PurchaseTypes deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'PurchaseTypes deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreatePurchaseTypesSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      type_code: schema.type_code,
      type_name: schema.type_name,
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
    schema: Static<typeof UpdatePurchaseTypesSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.type_code !== undefined) {
      updateData.type_code = schema.type_code;
    }
    if (schema.type_name !== undefined) {
      updateData.type_name = schema.type_name;
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
