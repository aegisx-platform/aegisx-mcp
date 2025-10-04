import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ArticlesService } from '../services/articles.service';
import { CreateArticles, UpdateArticles } from '../types/articles.types';
import {
  CreateArticlesSchema,
  UpdateArticlesSchema,
  ArticlesIdParamSchema,
  GetArticlesQuerySchema,
  ListArticlesQuerySchema,
} from '../schemas/articles.schemas';

/**
 * Articles Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  /**
   * Create new articles
   * POST /articles
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateArticlesSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating articles');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const articles = await this.articlesService.create(createData);

    request.log.info(
      { articlesId: articles.id },
      'Articles created successfully',
    );

    return reply.code(201).success(articles, 'Articles created successfully');
  }

  /**
   * Get articles by ID
   * GET /articles/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ArticlesIdParamSchema>;
      Querystring: Static<typeof GetArticlesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ articlesId: id }, 'Fetching articles');

    const articles = await this.articlesService.findById(id, request.query);

    return reply.success(articles);
  }

  /**
   * Get paginated list of articless
   * GET /articles
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListArticlesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching articles list');

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
        'content',
        'author_id',
        'published',
        'published_at',
        'view_count',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'title',
        'content',
        'author_id',
        'published',
        'published_at',
        'view_count',
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

    // Get articles list with field filtering
    const result = await this.articlesService.findMany({
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
      'Articles list fetched',
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
   * Update articles
   * PUT /articles/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ArticlesIdParamSchema>;
      Body: Static<typeof UpdateArticlesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { articlesId: id, body: request.body },
      'Updating articles',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const articles = await this.articlesService.update(id, updateData);

    request.log.info({ articlesId: id }, 'Articles updated successfully');

    return reply.success(articles, 'Articles updated successfully');
  }

  /**
   * Delete articles
   * DELETE /articles/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof ArticlesIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ articlesId: id }, 'Deleting articles');

    const deleted = await this.articlesService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Articles not found');
    }

    request.log.info({ articlesId: id }, 'Articles deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Articles deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateArticlesSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      title: schema.title,
      content: schema.content,
      author_id: schema.author_id,
      published: schema.published,
      published_at: schema.published_at,
      view_count: schema.view_count,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateArticlesSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.title !== undefined) {
      updateData.title = schema.title;
    }
    if (schema.content !== undefined) {
      updateData.content = schema.content;
    }
    if (schema.author_id !== undefined) {
      updateData.author_id = schema.author_id;
    }
    if (schema.published !== undefined) {
      updateData.published = schema.published;
    }
    if (schema.published_at !== undefined) {
      updateData.published_at = schema.published_at;
    }
    if (schema.view_count !== undefined) {
      updateData.view_count = schema.view_count;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
