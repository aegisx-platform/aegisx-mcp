import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugLotsService } from './drug-lots.service';
import { CreateDrugLots, UpdateDrugLots } from './drug-lots.types';
import {
  CreateDrugLotsSchema,
  UpdateDrugLotsSchema,
  DrugLotsIdParamSchema,
  GetDrugLotsQuerySchema,
  ListDrugLotsQuerySchema,
} from './drug-lots.schemas';

/**
 * DrugLots Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugLotsController {
  constructor(private drugLotsService: DrugLotsService) {}

  /**
   * Create new drugLots
   * POST /drugLots
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateDrugLotsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugLots');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugLots = await this.drugLotsService.create(createData);

    request.log.info(
      { drugLotsId: drugLots.id },
      'DrugLots created successfully',
    );

    return reply.code(201).success(drugLots, 'DrugLots created successfully');
  }

  /**
   * Get drugLots by ID
   * GET /drugLots/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugLotsIdParamSchema>;
      Querystring: Static<typeof GetDrugLotsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugLotsId: id }, 'Fetching drugLots');

    const drugLots = await this.drugLotsService.findById(id, request.query);

    return reply.success(drugLots);
  }

  /**
   * Get paginated list of drugLotss
   * GET /drugLots
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugLotsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugLots list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'drug_id', 'created_at'],
      user: [
        'id',
        'drug_id',
        'id',
        'drug_id',
        'location_id',
        'lot_number',
        'expiry_date',
        'quantity_available',
        'unit_cost',
        'received_date',
        'receipt_id',
        'is_active',
        'notes',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'drug_id',
        'location_id',
        'lot_number',
        'expiry_date',
        'quantity_available',
        'unit_cost',
        'received_date',
        'receipt_id',
        'is_active',
        'notes',
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

    // Get drugLots list with field filtering
    const result = await this.drugLotsService.findMany({
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
      'DrugLots list fetched',
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
   * Update drugLots
   * PUT /drugLots/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugLotsIdParamSchema>;
      Body: Static<typeof UpdateDrugLotsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugLotsId: id, body: request.body },
      'Updating drugLots',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugLots = await this.drugLotsService.update(id, updateData);

    request.log.info({ drugLotsId: id }, 'DrugLots updated successfully');

    return reply.success(drugLots, 'DrugLots updated successfully');
  }

  /**
   * Delete drugLots
   * DELETE /drugLots/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof DrugLotsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugLotsId: id }, 'Deleting drugLots');

    const deleted = await this.drugLotsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugLots not found');
    }

    request.log.info({ drugLotsId: id }, 'DrugLots deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugLots deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugLotsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      drug_id: schema.drug_id,
      location_id: schema.location_id,
      lot_number: schema.lot_number,
      expiry_date: schema.expiry_date,
      quantity_available: schema.quantity_available,
      unit_cost: schema.unit_cost,
      received_date: schema.received_date,
      receipt_id: schema.receipt_id,
      is_active: schema.is_active,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugLotsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.location_id !== undefined) {
      updateData.location_id = schema.location_id;
    }
    if (schema.lot_number !== undefined) {
      updateData.lot_number = schema.lot_number;
    }
    if (schema.expiry_date !== undefined) {
      updateData.expiry_date = schema.expiry_date;
    }
    if (schema.quantity_available !== undefined) {
      updateData.quantity_available = schema.quantity_available;
    }
    if (schema.unit_cost !== undefined) {
      updateData.unit_cost = schema.unit_cost;
    }
    if (schema.received_date !== undefined) {
      updateData.received_date = schema.received_date;
    }
    if (schema.receipt_id !== undefined) {
      updateData.receipt_id = schema.receipt_id;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
