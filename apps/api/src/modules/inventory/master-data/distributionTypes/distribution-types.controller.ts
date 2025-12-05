import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DistributionTypesService } from './distribution-types.service';
import {
  CreateDistributionTypes,
  UpdateDistributionTypes,
} from './distribution-types.types';
import {
  CreateDistributionTypesSchema,
  UpdateDistributionTypesSchema,
  DistributionTypesIdParamSchema,
  GetDistributionTypesQuerySchema,
  ListDistributionTypesQuerySchema,
} from './distribution-types.schemas';

/**
 * DistributionTypes Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DistributionTypesController {
  constructor(private distributionTypesService: DistributionTypesService) {}

  /**
   * Create new distributionTypes
   * POST /distributionTypes
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateDistributionTypesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating distributionTypes');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const distributionTypes =
      await this.distributionTypesService.create(createData);

    request.log.info(
      { distributionTypesId: distributionTypes.id },
      'DistributionTypes created successfully',
    );

    return reply
      .code(201)
      .success(distributionTypes, 'DistributionTypes created successfully');
  }

  /**
   * Get distributionTypes by ID
   * GET /distributionTypes/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DistributionTypesIdParamSchema>;
      Querystring: Static<typeof GetDistributionTypesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ distributionTypesId: id }, 'Fetching distributionTypes');

    const distributionTypes = await this.distributionTypesService.findById(
      id,
      request.query,
    );

    return reply.success(distributionTypes);
  }

  /**
   * Get paginated list of distributionTypess
   * GET /distributionTypes
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDistributionTypesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching distributionTypes list',
    );

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

    // Get distributionTypes list with field filtering
    const result = await this.distributionTypesService.findMany({
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
      'DistributionTypes list fetched',
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
   * Update distributionTypes
   * PUT /distributionTypes/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DistributionTypesIdParamSchema>;
      Body: Static<typeof UpdateDistributionTypesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { distributionTypesId: id, body: request.body },
      'Updating distributionTypes',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const distributionTypes = await this.distributionTypesService.update(
      id,
      updateData,
    );

    request.log.info(
      { distributionTypesId: id },
      'DistributionTypes updated successfully',
    );

    return reply.success(
      distributionTypes,
      'DistributionTypes updated successfully',
    );
  }

  /**
   * Delete distributionTypes
   * DELETE /distributionTypes/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DistributionTypesIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ distributionTypesId: id }, 'Deleting distributionTypes');

    const deleted = await this.distributionTypesService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DistributionTypes not found');
    }

    request.log.info(
      { distributionTypesId: id },
      'DistributionTypes deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DistributionTypes deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDistributionTypesSchema>,
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
    schema: Static<typeof UpdateDistributionTypesSchema>,
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
