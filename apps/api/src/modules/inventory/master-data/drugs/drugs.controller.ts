import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugsService } from './drugs.service';
import { CreateDrugs, UpdateDrugs } from './drugs.types';
import {
  CreateDrugsSchema,
  UpdateDrugsSchema,
  DrugsIdParamSchema,
  GetDrugsQuerySchema,
  ListDrugsQuerySchema,
} from './drugs.schemas';

/**
 * Drugs Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugsController {
  constructor(private drugsService: DrugsService) {}

  /**
   * Create new drugs
   * POST /drugs
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateDrugsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugs');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugs = await this.drugsService.create(createData);

    request.log.info({ drugsId: drugs.id }, 'Drugs created successfully');

    return reply.code(201).success(drugs, 'Drugs created successfully');
  }

  /**
   * Get drugs by ID
   * GET /drugs/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugsIdParamSchema>;
      Querystring: Static<typeof GetDrugsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugsId: id }, 'Fetching drugs');

    const drugs = await this.drugsService.findById(id, request.query);

    return reply.success(drugs);
  }

  /**
   * Get paginated list of drugss
   * GET /drugs
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugs list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'drug_code', 'created_at'],
      user: [
        'id',
        'drug_code',
        'id',
        'drug_code',
        'trade_name',
        'generic_id',
        'manufacturer_id',
        'tmt_tpu_id',
        'nlem_status',
        'drug_status',
        'product_category',
        'status_changed_date',
        'unit_price',
        'package_size',
        'package_unit',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'drug_code',
        'trade_name',
        'generic_id',
        'manufacturer_id',
        'tmt_tpu_id',
        'nlem_status',
        'drug_status',
        'product_category',
        'status_changed_date',
        'unit_price',
        'package_size',
        'package_unit',
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

    // Get drugs list with field filtering
    const result = await this.drugsService.findMany({
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
      'Drugs list fetched',
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
   * Update drugs
   * PUT /drugs/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugsIdParamSchema>;
      Body: Static<typeof UpdateDrugsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugsId: id, body: request.body }, 'Updating drugs');

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugs = await this.drugsService.update(id, updateData);

    request.log.info({ drugsId: id }, 'Drugs updated successfully');

    return reply.success(drugs, 'Drugs updated successfully');
  }

  /**
   * Delete drugs
   * DELETE /drugs/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof DrugsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugsId: id }, 'Deleting drugs');

    const deleted = await this.drugsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Drugs not found');
    }

    request.log.info({ drugsId: id }, 'Drugs deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Drugs deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      drug_code: schema.drug_code,
      trade_name: schema.trade_name,
      generic_id: schema.generic_id,
      manufacturer_id: schema.manufacturer_id,
      tmt_tpu_id: schema.tmt_tpu_id,
      nlem_status: schema.nlem_status,
      drug_status: schema.drug_status,
      product_category: schema.product_category,
      status_changed_date: schema.status_changed_date,
      unit_price: schema.unit_price,
      package_size: schema.package_size,
      package_unit: schema.package_unit,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.drug_code !== undefined) {
      updateData.drug_code = schema.drug_code;
    }
    if (schema.trade_name !== undefined) {
      updateData.trade_name = schema.trade_name;
    }
    if (schema.generic_id !== undefined) {
      updateData.generic_id = schema.generic_id;
    }
    if (schema.manufacturer_id !== undefined) {
      updateData.manufacturer_id = schema.manufacturer_id;
    }
    if (schema.tmt_tpu_id !== undefined) {
      updateData.tmt_tpu_id = schema.tmt_tpu_id;
    }
    if (schema.nlem_status !== undefined) {
      updateData.nlem_status = schema.nlem_status;
    }
    if (schema.drug_status !== undefined) {
      updateData.drug_status = schema.drug_status;
    }
    if (schema.product_category !== undefined) {
      updateData.product_category = schema.product_category;
    }
    if (schema.status_changed_date !== undefined) {
      updateData.status_changed_date = schema.status_changed_date;
    }
    if (schema.unit_price !== undefined) {
      updateData.unit_price = schema.unit_price;
    }
    if (schema.package_size !== undefined) {
      updateData.package_size = schema.package_size;
    }
    if (schema.package_unit !== undefined) {
      updateData.package_unit = schema.package_unit;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
