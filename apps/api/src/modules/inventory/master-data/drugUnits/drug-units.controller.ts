import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugUnitsService } from './drug-units.service';
import { CreateDrugUnits, UpdateDrugUnits } from './drug-units.types';
import {
  CreateDrugUnitsSchema,
  UpdateDrugUnitsSchema,
  DrugUnitsIdParamSchema,
  GetDrugUnitsQuerySchema,
  ListDrugUnitsQuerySchema,
} from './drug-units.schemas';

/**
 * DrugUnits Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugUnitsController {
  constructor(private drugUnitsService: DrugUnitsService) {}

  /**
   * Create new drugUnits
   * POST /drugUnits
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateDrugUnitsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugUnits');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugUnits = await this.drugUnitsService.create(createData);

    request.log.info(
      { drugUnitsId: drugUnits.id },
      'DrugUnits created successfully',
    );

    return reply.code(201).success(drugUnits, 'DrugUnits created successfully');
  }

  /**
   * Get drugUnits by ID
   * GET /drugUnits/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugUnitsIdParamSchema>;
      Querystring: Static<typeof GetDrugUnitsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugUnitsId: id }, 'Fetching drugUnits');

    const drugUnits = await this.drugUnitsService.findById(id, request.query);

    return reply.success(drugUnits);
  }

  /**
   * Get paginated list of drugUnitss
   * GET /drugUnits
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugUnitsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugUnits list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'unit_code', 'created_at'],
      user: [
        'id',
        'unit_code',
        'id',
        'unit_code',
        'unit_name',
        'unit_name_en',
        'unit_type',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'unit_code',
        'unit_name',
        'unit_name_en',
        'unit_type',
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

    // Get drugUnits list with field filtering
    const result = await this.drugUnitsService.findMany({
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
      'DrugUnits list fetched',
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
   * Update drugUnits
   * PUT /drugUnits/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugUnitsIdParamSchema>;
      Body: Static<typeof UpdateDrugUnitsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugUnitsId: id, body: request.body },
      'Updating drugUnits',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugUnits = await this.drugUnitsService.update(id, updateData);

    request.log.info({ drugUnitsId: id }, 'DrugUnits updated successfully');

    return reply.success(drugUnits, 'DrugUnits updated successfully');
  }

  /**
   * Delete drugUnits
   * DELETE /drugUnits/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof DrugUnitsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugUnitsId: id }, 'Deleting drugUnits');

    const deleted = await this.drugUnitsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugUnits not found');
    }

    request.log.info({ drugUnitsId: id }, 'DrugUnits deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugUnits deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugUnitsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      unit_code: schema.unit_code,
      unit_name: schema.unit_name,
      unit_name_en: schema.unit_name_en,
      unit_type: schema.unit_type,
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
    schema: Static<typeof UpdateDrugUnitsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.unit_code !== undefined) {
      updateData.unit_code = schema.unit_code;
    }
    if (schema.unit_name !== undefined) {
      updateData.unit_name = schema.unit_name;
    }
    if (schema.unit_name_en !== undefined) {
      updateData.unit_name_en = schema.unit_name_en;
    }
    if (schema.unit_type !== undefined) {
      updateData.unit_type = schema.unit_type;
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
