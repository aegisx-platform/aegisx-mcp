import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugGenericsService } from './drug-generics.service';
import { CreateDrugGenerics, UpdateDrugGenerics } from './drug-generics.types';
import {
  CreateDrugGenericsSchema,
  UpdateDrugGenericsSchema,
  DrugGenericsIdParamSchema,
  GetDrugGenericsQuerySchema,
  ListDrugGenericsQuerySchema,
} from './drug-generics.schemas';

/**
 * DrugGenerics Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugGenericsController {
  constructor(private drugGenericsService: DrugGenericsService) {}

  /**
   * Create new drugGenerics
   * POST /drugGenerics
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateDrugGenericsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugGenerics');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugGenerics = await this.drugGenericsService.create(createData);

    request.log.info(
      { drugGenericsId: drugGenerics.id },
      'DrugGenerics created successfully',
    );

    return reply
      .code(201)
      .success(drugGenerics, 'DrugGenerics created successfully');
  }

  /**
   * Get drugGenerics by ID
   * GET /drugGenerics/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugGenericsIdParamSchema>;
      Querystring: Static<typeof GetDrugGenericsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugGenericsId: id }, 'Fetching drugGenerics');

    const drugGenerics = await this.drugGenericsService.findById(
      id,
      request.query,
    );

    return reply.success(drugGenerics);
  }

  /**
   * Get paginated list of drugGenericss
   * GET /drugGenerics
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugGenericsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugGenerics list');

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
        'generic_name',
        'dosage_form',
        'strength_unit',
        'dosage_form_id',
        'strength_unit_id',
        'strength_value',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'working_code',
        'generic_name',
        'dosage_form',
        'strength_unit',
        'dosage_form_id',
        'strength_unit_id',
        'strength_value',
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

    // Get drugGenerics list with field filtering
    const result = await this.drugGenericsService.findMany({
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
      'DrugGenerics list fetched',
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
   * Update drugGenerics
   * PUT /drugGenerics/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugGenericsIdParamSchema>;
      Body: Static<typeof UpdateDrugGenericsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugGenericsId: id, body: request.body },
      'Updating drugGenerics',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugGenerics = await this.drugGenericsService.update(id, updateData);

    request.log.info(
      { drugGenericsId: id },
      'DrugGenerics updated successfully',
    );

    return reply.success(drugGenerics, 'DrugGenerics updated successfully');
  }

  /**
   * Delete drugGenerics
   * DELETE /drugGenerics/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DrugGenericsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugGenericsId: id }, 'Deleting drugGenerics');

    const deleted = await this.drugGenericsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugGenerics not found');
    }

    request.log.info(
      { drugGenericsId: id },
      'DrugGenerics deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugGenerics deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugGenericsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      working_code: schema.working_code,
      generic_name: schema.generic_name,
      dosage_form: schema.dosage_form,
      strength_unit: schema.strength_unit,
      dosage_form_id: schema.dosage_form_id,
      strength_unit_id: schema.strength_unit_id,
      strength_value: schema.strength_value,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugGenericsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.working_code !== undefined) {
      updateData.working_code = schema.working_code;
    }
    if (schema.generic_name !== undefined) {
      updateData.generic_name = schema.generic_name;
    }
    if (schema.dosage_form !== undefined) {
      updateData.dosage_form = schema.dosage_form;
    }
    if (schema.strength_unit !== undefined) {
      updateData.strength_unit = schema.strength_unit;
    }
    if (schema.dosage_form_id !== undefined) {
      updateData.dosage_form_id = schema.dosage_form_id;
    }
    if (schema.strength_unit_id !== undefined) {
      updateData.strength_unit_id = schema.strength_unit_id;
    }
    if (schema.strength_value !== undefined) {
      updateData.strength_value = schema.strength_value;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
