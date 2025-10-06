import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { SimpleTestsService } from '../services/simpleTests.service';
import {
  CreateSimpleTests,
  UpdateSimpleTests,
} from '../types/simpleTests.types';
import {
  CreateSimpleTestsSchema,
  UpdateSimpleTestsSchema,
  SimpleTestsIdParamSchema,
  GetSimpleTestsQuerySchema,
  ListSimpleTestsQuerySchema,
} from '../schemas/simpleTests.schemas';

/**
 * SimpleTests Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class SimpleTestsController {
  constructor(private simpleTestsService: SimpleTestsService) {}

  /**
   * Create new simpleTests
   * POST /simpleTests
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateSimpleTestsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating simpleTests');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const simpleTests = await this.simpleTestsService.create(createData);

    request.log.info(
      { simpleTestsId: simpleTests.id },
      'SimpleTests created successfully',
    );

    return reply
      .code(201)
      .success(simpleTests, 'SimpleTests created successfully');
  }

  /**
   * Get simpleTests by ID
   * GET /simpleTests/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof SimpleTestsIdParamSchema>;
      Querystring: Static<typeof GetSimpleTestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ simpleTestsId: id }, 'Fetching simpleTests');

    const simpleTests = await this.simpleTestsService.findById(
      id,
      request.query,
    );

    return reply.success(simpleTests);
  }

  /**
   * Get paginated list of simpleTestss
   * GET /simpleTests
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListSimpleTestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching simpleTests list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'is_active', 'created_at'],
      user: [
        'id',
        'is_active',
        'id',
        'is_active',
        'small_number',
        'regular_number',
        'big_number',
        'decimal_field',
        'float_field',
        'name',
        'description',
        'date_field',
        'datetime_field',
        'json_field',
        'uuid_field',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'is_active',
        'small_number',
        'regular_number',
        'big_number',
        'decimal_field',
        'float_field',
        'name',
        'description',
        'date_field',
        'datetime_field',
        'json_field',
        'uuid_field',
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

    // Get simpleTests list with field filtering
    const result = await this.simpleTestsService.findMany({
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
      'SimpleTests list fetched',
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
   * Update simpleTests
   * PUT /simpleTests/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof SimpleTestsIdParamSchema>;
      Body: Static<typeof UpdateSimpleTestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { simpleTestsId: id, body: request.body },
      'Updating simpleTests',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const simpleTests = await this.simpleTestsService.update(id, updateData);

    request.log.info({ simpleTestsId: id }, 'SimpleTests updated successfully');

    return reply.success(simpleTests, 'SimpleTests updated successfully');
  }

  /**
   * Delete simpleTests
   * DELETE /simpleTests/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof SimpleTestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ simpleTestsId: id }, 'Deleting simpleTests');

    const deleted = await this.simpleTestsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'SimpleTests not found');
    }

    request.log.info({ simpleTestsId: id }, 'SimpleTests deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'SimpleTests deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateSimpleTestsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      is_active: schema.is_active,
      small_number: schema.small_number,
      regular_number: schema.regular_number,
      big_number: schema.big_number,
      decimal_field: schema.decimal_field,
      float_field: schema.float_field,
      name: schema.name,
      description: schema.description,
      date_field: schema.date_field,
      datetime_field: schema.datetime_field,
      json_field: schema.json_field,
      uuid_field: schema.uuid_field,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateSimpleTestsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    if (schema.small_number !== undefined) {
      updateData.small_number = schema.small_number;
    }
    if (schema.regular_number !== undefined) {
      updateData.regular_number = schema.regular_number;
    }
    if (schema.big_number !== undefined) {
      updateData.big_number = schema.big_number;
    }
    if (schema.decimal_field !== undefined) {
      updateData.decimal_field = schema.decimal_field;
    }
    if (schema.float_field !== undefined) {
      updateData.float_field = schema.float_field;
    }
    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.date_field !== undefined) {
      updateData.date_field = schema.date_field;
    }
    if (schema.datetime_field !== undefined) {
      updateData.datetime_field = schema.datetime_field;
    }
    if (schema.json_field !== undefined) {
      updateData.json_field = schema.json_field;
    }
    if (schema.uuid_field !== undefined) {
      updateData.uuid_field = schema.uuid_field;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
