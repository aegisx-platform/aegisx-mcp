import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DosageFormsService } from './dosage-forms.service';
import { CreateDosageForms, UpdateDosageForms } from './dosage-forms.types';
import {
  CreateDosageFormsSchema,
  UpdateDosageFormsSchema,
  DosageFormsIdParamSchema,
  GetDosageFormsQuerySchema,
  ListDosageFormsQuerySchema,
} from './dosage-forms.schemas';

/**
 * DosageForms Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DosageFormsController {
  constructor(private dosageFormsService: DosageFormsService) {}

  /**
   * Create new dosageForms
   * POST /dosageForms
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateDosageFormsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating dosageForms');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const dosageForms = await this.dosageFormsService.create(createData);

    request.log.info(
      { dosageFormsId: dosageForms.id },
      'DosageForms created successfully',
    );

    return reply
      .code(201)
      .success(dosageForms, 'DosageForms created successfully');
  }

  /**
   * Get dosageForms by ID
   * GET /dosageForms/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DosageFormsIdParamSchema>;
      Querystring: Static<typeof GetDosageFormsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ dosageFormsId: id }, 'Fetching dosageForms');

    const dosageForms = await this.dosageFormsService.findById(
      id,
      request.query,
    );

    return reply.success(dosageForms);
  }

  /**
   * Get paginated list of dosageFormss
   * GET /dosageForms
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDosageFormsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching dosageForms list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'form_code', 'created_at'],
      user: [
        'id',
        'form_code',
        'id',
        'form_code',
        'form_name',
        'form_name_en',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'form_code',
        'form_name',
        'form_name_en',
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

    // Get dosageForms list with field filtering
    const result = await this.dosageFormsService.findMany({
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
      'DosageForms list fetched',
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
   * Update dosageForms
   * PUT /dosageForms/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DosageFormsIdParamSchema>;
      Body: Static<typeof UpdateDosageFormsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { dosageFormsId: id, body: request.body },
      'Updating dosageForms',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const dosageForms = await this.dosageFormsService.update(id, updateData);

    request.log.info({ dosageFormsId: id }, 'DosageForms updated successfully');

    return reply.success(dosageForms, 'DosageForms updated successfully');
  }

  /**
   * Delete dosageForms
   * DELETE /dosageForms/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DosageFormsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ dosageFormsId: id }, 'Deleting dosageForms');

    const deleted = await this.dosageFormsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DosageForms not found');
    }

    request.log.info({ dosageFormsId: id }, 'DosageForms deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DosageForms deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDosageFormsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      form_code: schema.form_code,
      form_name: schema.form_name,
      form_name_en: schema.form_name_en,
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
    schema: Static<typeof UpdateDosageFormsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.form_code !== undefined) {
      updateData.form_code = schema.form_code;
    }
    if (schema.form_name !== undefined) {
      updateData.form_name = schema.form_name;
    }
    if (schema.form_name_en !== undefined) {
      updateData.form_name_en = schema.form_name_en;
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
