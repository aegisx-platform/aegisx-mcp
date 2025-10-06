import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ComprehensiveTestsService } from '../services/comprehensive-tests.service';
import {
  CreateComprehensiveTests,
  UpdateComprehensiveTests,
} from '../types/comprehensive-tests.types';
import {
  CreateComprehensiveTestsSchema,
  UpdateComprehensiveTestsSchema,
  ComprehensiveTestsIdParamSchema,
  GetComprehensiveTestsQuerySchema,
  ListComprehensiveTestsQuerySchema,
} from '../schemas/comprehensive-tests.schemas';

/**
 * ComprehensiveTests Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ComprehensiveTestsController {
  constructor(private comprehensiveTestsService: ComprehensiveTestsService) {}

  /**
   * Create new comprehensiveTests
   * POST /comprehensiveTests
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateComprehensiveTestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating comprehensiveTests');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const comprehensiveTests =
      await this.comprehensiveTestsService.create(createData);

    request.log.info(
      { comprehensiveTestsId: comprehensiveTests.id },
      'ComprehensiveTests created successfully',
    );

    return reply
      .code(201)
      .success(comprehensiveTests, 'ComprehensiveTests created successfully');
  }

  /**
   * Get comprehensiveTests by ID
   * GET /comprehensiveTests/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
      Querystring: Static<typeof GetComprehensiveTestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id },
      'Fetching comprehensiveTests',
    );

    const comprehensiveTests = await this.comprehensiveTestsService.findById(
      id,
      request.query,
    );

    return reply.success(comprehensiveTests);
  }

  /**
   * Get paginated list of comprehensiveTestss
   * GET /comprehensiveTests
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListComprehensiveTestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching comprehensiveTests list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'title', 'created_at'],
      user: [
        'id',
        'title',
        'id',
        'title',
        'description',
        'slug',
        'short_code',
        'price',
        'quantity',
        'weight',
        'rating',
        'is_active',
        'is_featured',
        'is_available',
        'created_at',
        'updated_at',
        'published_at',
        'expires_at',
        'start_time',
        'metadata',
        'tags',
        'ip_address',
        'website_url',
        'email_address',
        'status',
        'priority',
        'content',
        'notes',
        'created_at',
      ],
      admin: [
        'id',
        'title',
        'description',
        'slug',
        'short_code',
        'price',
        'quantity',
        'weight',
        'rating',
        'is_active',
        'is_featured',
        'is_available',
        'created_at',
        'updated_at',
        'published_at',
        'expires_at',
        'start_time',
        'metadata',
        'tags',
        'ip_address',
        'website_url',
        'email_address',
        'status',
        'priority',
        'content',
        'notes',
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

    // Get comprehensiveTests list with field filtering
    const result = await this.comprehensiveTestsService.findMany({
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
      'ComprehensiveTests list fetched',
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
   * Update comprehensiveTests
   * PUT /comprehensiveTests/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
      Body: Static<typeof UpdateComprehensiveTestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id, body: request.body },
      'Updating comprehensiveTests',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const comprehensiveTests = await this.comprehensiveTestsService.update(
      id,
      updateData,
    );

    request.log.info(
      { comprehensiveTestsId: id },
      'ComprehensiveTests updated successfully',
    );

    return reply.success(
      comprehensiveTests,
      'ComprehensiveTests updated successfully',
    );
  }

  /**
   * Delete comprehensiveTests
   * DELETE /comprehensiveTests/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id },
      'Deleting comprehensiveTests',
    );

    const deleted = await this.comprehensiveTestsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'ComprehensiveTests not found');
    }

    request.log.info(
      { comprehensiveTestsId: id },
      'ComprehensiveTests deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'ComprehensiveTests deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateComprehensiveTestsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      title: schema.title,
      description: schema.description,
      slug: schema.slug,
      short_code: schema.short_code,
      price: schema.price,
      quantity: schema.quantity,
      weight: schema.weight,
      rating: schema.rating,
      is_active: schema.is_active,
      is_featured: schema.is_featured,
      is_available: schema.is_available,
      published_at: schema.published_at,
      expires_at: schema.expires_at,
      start_time: schema.start_time,
      metadata: schema.metadata,
      tags: schema.tags,
      ip_address: schema.ip_address,
      website_url: schema.website_url,
      email_address: schema.email_address,
      status: schema.status,
      priority: schema.priority,
      content: schema.content,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateComprehensiveTestsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.title !== undefined) {
      updateData.title = schema.title;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.slug !== undefined) {
      updateData.slug = schema.slug;
    }
    if (schema.short_code !== undefined) {
      updateData.short_code = schema.short_code;
    }
    if (schema.price !== undefined) {
      updateData.price = schema.price;
    }
    if (schema.quantity !== undefined) {
      updateData.quantity = schema.quantity;
    }
    if (schema.weight !== undefined) {
      updateData.weight = schema.weight;
    }
    if (schema.rating !== undefined) {
      updateData.rating = schema.rating;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    if (schema.is_featured !== undefined) {
      updateData.is_featured = schema.is_featured;
    }
    if (schema.is_available !== undefined) {
      updateData.is_available = schema.is_available;
    }
    if (schema.published_at !== undefined) {
      updateData.published_at = schema.published_at;
    }
    if (schema.expires_at !== undefined) {
      updateData.expires_at = schema.expires_at;
    }
    if (schema.start_time !== undefined) {
      updateData.start_time = schema.start_time;
    }
    if (schema.metadata !== undefined) {
      updateData.metadata = schema.metadata;
    }
    if (schema.tags !== undefined) {
      updateData.tags = schema.tags;
    }
    if (schema.ip_address !== undefined) {
      updateData.ip_address = schema.ip_address;
    }
    if (schema.website_url !== undefined) {
      updateData.website_url = schema.website_url;
    }
    if (schema.email_address !== undefined) {
      updateData.email_address = schema.email_address;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.priority !== undefined) {
      updateData.priority = schema.priority;
    }
    if (schema.content !== undefined) {
      updateData.content = schema.content;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
