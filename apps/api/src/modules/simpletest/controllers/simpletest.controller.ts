import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { SimpletestService } from '../services/simpletest.service';
import { CreateSimpletest, UpdateSimpletest } from '../types/simpletest.types';
import {
  CreateSimpletestSchema,
  UpdateSimpletestSchema,
  SimpletestIdParamSchema,
  GetSimpletestQuerySchema,
  ListSimpletestQuerySchema,
} from '../schemas/simpletest.schemas';

/**
 * Simpletest Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class SimpletestController {
  constructor(private simpletestService: SimpletestService) {}

  /**
   * Create new simpletest
   * POST /simpletest
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateSimpletestSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating simpletest');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const simpletest = await this.simpletestService.create(createData);

    request.log.info(
      { simpletestId: simpletest.id },
      'Simpletest created successfully',
    );

    return reply
      .code(201)
      .success(simpletest, 'Simpletest created successfully');
  }

  /**
   * Get simpletest by ID
   * GET /simpletest/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof SimpletestIdParamSchema>;
      Querystring: Static<typeof GetSimpletestQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ simpletestId: id }, 'Fetching simpletest');

    const simpletest = await this.simpletestService.findById(id, request.query);

    return reply.success(simpletest);
  }

  /**
   * Get paginated list of simpletests
   * GET /simpletest
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListSimpletestQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching simpletest list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'name', 'created_at'],
      user: ['id', 'name', 'id', 'name', 'status', 'created_at', 'created_at'],
      admin: ['id', 'name', 'status', 'created_at'],
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

    // Get simpletest list with field filtering
    const result = await this.simpletestService.findMany({
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
      'Simpletest list fetched',
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
   * Update simpletest
   * PUT /simpletest/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof SimpletestIdParamSchema>;
      Body: Static<typeof UpdateSimpletestSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { simpletestId: id, body: request.body },
      'Updating simpletest',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const simpletest = await this.simpletestService.update(id, updateData);

    request.log.info({ simpletestId: id }, 'Simpletest updated successfully');

    return reply.success(simpletest, 'Simpletest updated successfully');
  }

  /**
   * Delete simpletest
   * DELETE /simpletest/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof SimpletestIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ simpletestId: id }, 'Deleting simpletest');

    const deleted = await this.simpletestService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Simpletest not found');
    }

    request.log.info({ simpletestId: id }, 'Simpletest deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Simpletest deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateSimpletestSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      name: schema.name,
      status: schema.status,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateSimpletestSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
