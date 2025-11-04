import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { TestCategoriesService } from '../services/test-categories.service';
import {
  CreateTestCategories,
  UpdateTestCategories,
} from '../types/test-categories.types';
import {
  CreateTestCategoriesSchema,
  UpdateTestCategoriesSchema,
  TestCategoriesIdParamSchema,
  GetTestCategoriesQuerySchema,
  ListTestCategoriesQuerySchema,
} from '../schemas/test-categories.schemas';

/**
 * TestCategories Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class TestCategoriesController {
  constructor(private testCategoriesService: TestCategoriesService) {}

  /**
   * Create new testCategories
   * POST /testCategories
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateTestCategoriesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating testCategories');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const testCategories = await this.testCategoriesService.create(createData);

    request.log.info(
      { testCategoriesId: testCategories.id },
      'TestCategories created successfully',
    );

    return reply
      .code(201)
      .success(testCategories, 'TestCategories created successfully');
  }

  /**
   * Get testCategories by ID
   * GET /testCategories/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof TestCategoriesIdParamSchema>;
      Querystring: Static<typeof GetTestCategoriesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ testCategoriesId: id }, 'Fetching testCategories');

    const testCategories = await this.testCategoriesService.findById(
      id,
      request.query,
    );

    return reply.success(testCategories);
  }

  /**
   * Get paginated list of testCategoriess
   * GET /testCategories
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListTestCategoriesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching testCategories list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'code', 'created_at'],
      user: [
        'id',
        'code',
        'id',
        'code',
        'name',
        'slug',
        'description',
        'is_active',
        'is_featured',
        'display_order',
        'item_count',
        'discount_rate',
        'metadata',
        'settings',
        'status',
        'created_by',
        'updated_by',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'code',
        'name',
        'slug',
        'description',
        'is_active',
        'is_featured',
        'display_order',
        'item_count',
        'discount_rate',
        'metadata',
        'settings',
        'status',
        'created_by',
        'updated_by',
        'deleted_at',
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

    // Get testCategories list with field filtering
    const result = await this.testCategoriesService.findMany({
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
      'TestCategories list fetched',
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
   * Update testCategories
   * PUT /testCategories/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof TestCategoriesIdParamSchema>;
      Body: Static<typeof UpdateTestCategoriesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { testCategoriesId: id, body: request.body },
      'Updating testCategories',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const testCategories = await this.testCategoriesService.update(
      id,
      updateData,
    );

    request.log.info(
      { testCategoriesId: id },
      'TestCategories updated successfully',
    );

    return reply.success(testCategories, 'TestCategories updated successfully');
  }

  /**
   * Delete testCategories
   * DELETE /testCategories/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof TestCategoriesIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ testCategoriesId: id }, 'Deleting testCategories');

    const deleted = await this.testCategoriesService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'TestCategories not found');
    }

    request.log.info(
      { testCategoriesId: id },
      'TestCategories deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'TestCategories deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateTestCategoriesSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      code: schema.code,
      name: schema.name,
      slug: schema.slug,
      description: schema.description,
      is_active: schema.is_active,
      is_featured: schema.is_featured,
      display_order: schema.display_order,
      item_count: schema.item_count,
      discount_rate: schema.discount_rate,
      metadata: schema.metadata,
      settings: schema.settings,
      status: schema.status,
      deleted_at: schema.deleted_at,
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
    schema: Static<typeof UpdateTestCategoriesSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.code !== undefined) {
      updateData.code = schema.code;
    }
    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.slug !== undefined) {
      updateData.slug = schema.slug;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    if (schema.is_featured !== undefined) {
      updateData.is_featured = schema.is_featured;
    }
    if (schema.display_order !== undefined) {
      updateData.display_order = schema.display_order;
    }
    if (schema.item_count !== undefined) {
      updateData.item_count = schema.item_count;
    }
    if (schema.discount_rate !== undefined) {
      updateData.discount_rate = schema.discount_rate;
    }
    if (schema.metadata !== undefined) {
      updateData.metadata = schema.metadata;
    }
    if (schema.settings !== undefined) {
      updateData.settings = schema.settings;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.deleted_at !== undefined) {
      updateData.deleted_at = schema.deleted_at;
    }

    // Auto-fill updated_by from JWT if table has this field
    if (request.user?.id) {
      updateData.updated_by = request.user.id;
    }

    return updateData;
  }
}
