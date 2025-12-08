import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugReturnItemsService } from './drug-return-items.service';
import {
  CreateDrugReturnItems,
  UpdateDrugReturnItems,
} from './drug-return-items.types';
import {
  CreateDrugReturnItemsSchema,
  UpdateDrugReturnItemsSchema,
  DrugReturnItemsIdParamSchema,
  GetDrugReturnItemsQuerySchema,
  ListDrugReturnItemsQuerySchema,
} from './drug-return-items.schemas';

/**
 * DrugReturnItems Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugReturnItemsController {
  constructor(private drugReturnItemsService: DrugReturnItemsService) {}

  /**
   * Create new drugReturnItems
   * POST /drugReturnItems
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateDrugReturnItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugReturnItems');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugReturnItems =
      await this.drugReturnItemsService.create(createData);

    request.log.info(
      { drugReturnItemsId: drugReturnItems.id },
      'DrugReturnItems created successfully',
    );

    return reply
      .code(201)
      .success(drugReturnItems, 'DrugReturnItems created successfully');
  }

  /**
   * Get drugReturnItems by ID
   * GET /drugReturnItems/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugReturnItemsIdParamSchema>;
      Querystring: Static<typeof GetDrugReturnItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugReturnItemsId: id }, 'Fetching drugReturnItems');

    const drugReturnItems = await this.drugReturnItemsService.findById(
      id,
      request.query,
    );

    return reply.success(drugReturnItems);
  }

  /**
   * Get paginated list of drugReturnItemss
   * GET /drugReturnItems
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugReturnItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching drugReturnItems list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'return_id', 'created_at'],
      user: [
        'id',
        'return_id',
        'id',
        'return_id',
        'drug_id',
        'total_quantity',
        'good_quantity',
        'damaged_quantity',
        'lot_number',
        'expiry_date',
        'return_type',
        'location_id',
        'action_id',
        'notes',
        'created_at',
        'created_at',
      ],
      admin: [
        'id',
        'return_id',
        'drug_id',
        'total_quantity',
        'good_quantity',
        'damaged_quantity',
        'lot_number',
        'expiry_date',
        'return_type',
        'location_id',
        'action_id',
        'notes',
        'created_at',
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

    // Get drugReturnItems list with field filtering
    const result = await this.drugReturnItemsService.findMany({
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
      'DrugReturnItems list fetched',
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
   * Update drugReturnItems
   * PUT /drugReturnItems/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugReturnItemsIdParamSchema>;
      Body: Static<typeof UpdateDrugReturnItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugReturnItemsId: id, body: request.body },
      'Updating drugReturnItems',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugReturnItems = await this.drugReturnItemsService.update(
      id,
      updateData,
    );

    request.log.info(
      { drugReturnItemsId: id },
      'DrugReturnItems updated successfully',
    );

    return reply.success(
      drugReturnItems,
      'DrugReturnItems updated successfully',
    );
  }

  /**
   * Delete drugReturnItems
   * DELETE /drugReturnItems/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DrugReturnItemsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugReturnItemsId: id }, 'Deleting drugReturnItems');

    const deleted = await this.drugReturnItemsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'DrugReturnItems not found');
    }

    request.log.info(
      { drugReturnItemsId: id },
      'DrugReturnItems deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugReturnItems deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugReturnItemsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      return_id: schema.return_id,
      drug_id: schema.drug_id,
      total_quantity: schema.total_quantity,
      good_quantity: schema.good_quantity,
      damaged_quantity: schema.damaged_quantity,
      lot_number: schema.lot_number,
      expiry_date: schema.expiry_date,
      return_type: schema.return_type,
      location_id: schema.location_id,
      action_id: schema.action_id,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugReturnItemsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.return_id !== undefined) {
      updateData.return_id = schema.return_id;
    }
    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.total_quantity !== undefined) {
      updateData.total_quantity = schema.total_quantity;
    }
    if (schema.good_quantity !== undefined) {
      updateData.good_quantity = schema.good_quantity;
    }
    if (schema.damaged_quantity !== undefined) {
      updateData.damaged_quantity = schema.damaged_quantity;
    }
    if (schema.lot_number !== undefined) {
      updateData.lot_number = schema.lot_number;
    }
    if (schema.expiry_date !== undefined) {
      updateData.expiry_date = schema.expiry_date;
    }
    if (schema.return_type !== undefined) {
      updateData.return_type = schema.return_type;
    }
    if (schema.location_id !== undefined) {
      updateData.location_id = schema.location_id;
    }
    if (schema.action_id !== undefined) {
      updateData.action_id = schema.action_id;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
