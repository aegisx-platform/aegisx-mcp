import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { AuthorsService } from '../services/authors.service';
import { CreateAuthors, UpdateAuthors } from '../types/authors.types';
import {
  CreateAuthorsSchema,
  UpdateAuthorsSchema,
  AuthorsIdParamSchema,
  GetAuthorsQuerySchema,
  ListAuthorsQuerySchema,
} from '../schemas/authors.schemas';

/**
 * Authors Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class AuthorsController {
  constructor(private authorsService: AuthorsService) {}

  /**
   * Create new authors
   * POST /authors
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateAuthorsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating authors');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const authors = await this.authorsService.create(createData);

    request.log.info({ authorsId: authors.id }, 'Authors created successfully');

    return reply.code(201).success(authors, 'Authors created successfully');
  }

  /**
   * Get authors by ID
   * GET /authors/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof AuthorsIdParamSchema>;
      Querystring: Static<typeof GetAuthorsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ authorsId: id }, 'Fetching authors');

    const authors = await this.authorsService.findById(id, request.query);

    return reply.success(authors);
  }

  /**
   * Get paginated list of authorss
   * GET /authors
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListAuthorsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching authors list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'name', 'created_at'],
      user: [
        'id',
        'name',
        'id',
        'name',
        'email',
        'bio',
        'birth_date',
        'country',
        'active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'name',
        'email',
        'bio',
        'birth_date',
        'country',
        'active',
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

    // Get authors list with field filtering
    const result = await this.authorsService.findMany({
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
      'Authors list fetched',
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
   * Update authors
   * PUT /authors/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof AuthorsIdParamSchema>;
      Body: Static<typeof UpdateAuthorsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ authorsId: id, body: request.body }, 'Updating authors');

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const authors = await this.authorsService.update(id, updateData);

    request.log.info({ authorsId: id }, 'Authors updated successfully');

    return reply.success(authors, 'Authors updated successfully');
  }

  /**
   * Delete authors
   * DELETE /authors/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof AuthorsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ authorsId: id }, 'Deleting authors');

    const deleted = await this.authorsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Authors not found');
    }

    request.log.info({ authorsId: id }, 'Authors deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Authors deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateAuthorsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      name: schema.name,
      email: schema.email,
      bio: schema.bio,
      birth_date: schema.birth_date,
      country: schema.country,
      active: schema.active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateAuthorsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.email !== undefined) {
      updateData.email = schema.email;
    }
    if (schema.bio !== undefined) {
      updateData.bio = schema.bio;
    }
    if (schema.birth_date !== undefined) {
      updateData.birth_date = schema.birth_date;
    }
    if (schema.country !== undefined) {
      updateData.country = schema.country;
    }
    if (schema.active !== undefined) {
      updateData.active = schema.active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
