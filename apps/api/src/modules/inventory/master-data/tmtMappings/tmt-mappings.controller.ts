import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { TmtMappingsService } from './tmt-mappings.service';
import { CreateTmtMappings, UpdateTmtMappings } from './tmt-mappings.types';
import {
  CreateTmtMappingsSchema,
  UpdateTmtMappingsSchema,
  TmtMappingsIdParamSchema,
  GetTmtMappingsQuerySchema,
  ListTmtMappingsQuerySchema,
} from './tmt-mappings.schemas';

/**
 * TmtMappings Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class TmtMappingsController {
  constructor(private tmtMappingsService: TmtMappingsService) {}

  /**
   * Create new tmtMappings
   * POST /tmtMappings
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateTmtMappingsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating tmtMappings');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const tmtMappings = await this.tmtMappingsService.create(createData);

    request.log.info(
      { tmtMappingsId: tmtMappings.id },
      'TmtMappings created successfully',
    );

    return reply
      .code(201)
      .success(tmtMappings, 'TmtMappings created successfully');
  }

  /**
   * Get tmtMappings by ID
   * GET /tmtMappings/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof TmtMappingsIdParamSchema>;
      Querystring: Static<typeof GetTmtMappingsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ tmtMappingsId: id }, 'Fetching tmtMappings');

    const tmtMappings = await this.tmtMappingsService.findById(
      id,
      request.query,
    );

    return reply.success(tmtMappings);
  }

  /**
   * Get paginated list of tmtMappingss
   * GET /tmtMappings
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListTmtMappingsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching tmtMappings list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'working_code', 'created_at'],
      user: [
        'id',
        'working_code',
        'id',
        'working_code',
        'drug_code',
        'generic_id',
        'drug_id',
        'tmt_level',
        'tmt_concept_id',
        'tmt_id',
        'is_verified',
        'verified_by',
        'verified_at',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'working_code',
        'drug_code',
        'generic_id',
        'drug_id',
        'tmt_level',
        'tmt_concept_id',
        'tmt_id',
        'is_verified',
        'verified_by',
        'verified_at',
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

    // Get tmtMappings list with field filtering
    const result = await this.tmtMappingsService.findMany({
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
      'TmtMappings list fetched',
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
   * Update tmtMappings
   * PUT /tmtMappings/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof TmtMappingsIdParamSchema>;
      Body: Static<typeof UpdateTmtMappingsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { tmtMappingsId: id, body: request.body },
      'Updating tmtMappings',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const tmtMappings = await this.tmtMappingsService.update(id, updateData);

    request.log.info({ tmtMappingsId: id }, 'TmtMappings updated successfully');

    return reply.success(tmtMappings, 'TmtMappings updated successfully');
  }

  /**
   * Delete tmtMappings
   * DELETE /tmtMappings/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof TmtMappingsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ tmtMappingsId: id }, 'Deleting tmtMappings');

    const deleted = await this.tmtMappingsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'TmtMappings not found');
    }

    request.log.info({ tmtMappingsId: id }, 'TmtMappings deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'TmtMappings deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateTmtMappingsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      working_code: schema.working_code,
      drug_code: schema.drug_code,
      generic_id: schema.generic_id,
      drug_id: schema.drug_id,
      tmt_level: schema.tmt_level,
      tmt_concept_id: schema.tmt_concept_id,
      tmt_id: schema.tmt_id,
      is_verified: schema.is_verified,
      verified_by: schema.verified_by,
      verified_at: schema.verified_at,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateTmtMappingsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.working_code !== undefined) {
      updateData.working_code = schema.working_code;
    }
    if (schema.drug_code !== undefined) {
      updateData.drug_code = schema.drug_code;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.tmt_level !== undefined) {
      updateData.tmt_level = schema.tmt_level;
    }
    if (schema.tmt_concept_id !== undefined) {
      updateData.tmt_concept_id = schema.tmt_concept_id;
    }
    if (schema.tmt_id !== undefined) {
      updateData.tmt_id = schema.tmt_id;
    }
    if (schema.is_verified !== undefined) {
      updateData.is_verified = schema.is_verified;
    }
    if (schema.verified_by !== undefined) {
      updateData.verified_by = schema.verified_by;
    }
    if (schema.verified_at !== undefined) {
      updateData.verified_at = schema.verified_at;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
