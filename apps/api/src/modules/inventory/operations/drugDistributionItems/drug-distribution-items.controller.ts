import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugDistributionItemsService } from './drug-distribution-items.service';
import {
  CreateDrugDistributionItems,
  UpdateDrugDistributionItems,
} from './drug-distribution-items.types';
import {
  CreateDrugDistributionItemsSchema,
  UpdateDrugDistributionItemsSchema,
  DrugDistributionItemsIdParamSchema,
  GetDrugDistributionItemsQuerySchema,
  ListDrugDistributionItemsQuerySchema,
} from './drug-distribution-items.schemas';

/**
 * DrugDistributionItems Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class DrugDistributionItemsController {
  constructor(
    private drugDistributionItemsService: DrugDistributionItemsService,
  ) {}

  /**
   * Create new drugDistributionItems
   * POST /drugDistributionItems
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateDrugDistributionItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating drugDistributionItems');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugDistributionItems =
      await this.drugDistributionItemsService.create(createData);

    request.log.info(
      { drugDistributionItemsId: drugDistributionItems.id },
      'DrugDistributionItems created successfully',
    );

    return reply
      .code(201)
      .success(
        drugDistributionItems,
        'DrugDistributionItems created successfully',
      );
  }

  /**
   * Get drugDistributionItems by ID
   * GET /drugDistributionItems/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugDistributionItemsIdParamSchema>;
      Querystring: Static<typeof GetDrugDistributionItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugDistributionItemsId: id },
      'Fetching drugDistributionItems',
    );

    const drugDistributionItems =
      await this.drugDistributionItemsService.findById(id, request.query);

    return reply.success(drugDistributionItems);
  }

  /**
   * Get paginated list of drugDistributionItemss
   * GET /drugDistributionItems
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListDrugDistributionItemsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching drugDistributionItems list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'distribution_id', 'created_at'],
      user: [
        'id',
        'distribution_id',
        'id',
        'distribution_id',
        'item_number',
        'drug_id',
        'lot_number',
        'quantity_dispensed',
        'unit_cost',
        'expiry_date',
        'created_at',
        'created_at',
      ],
      admin: [
        'id',
        'distribution_id',
        'item_number',
        'drug_id',
        'lot_number',
        'quantity_dispensed',
        'unit_cost',
        'expiry_date',
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

    // Get drugDistributionItems list with field filtering
    const result = await this.drugDistributionItemsService.findMany({
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
      'DrugDistributionItems list fetched',
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
   * Update drugDistributionItems
   * PUT /drugDistributionItems/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugDistributionItemsIdParamSchema>;
      Body: Static<typeof UpdateDrugDistributionItemsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugDistributionItemsId: id, body: request.body },
      'Updating drugDistributionItems',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const drugDistributionItems =
      await this.drugDistributionItemsService.update(id, updateData);

    request.log.info(
      { drugDistributionItemsId: id },
      'DrugDistributionItems updated successfully',
    );

    return reply.success(
      drugDistributionItems,
      'DrugDistributionItems updated successfully',
    );
  }

  /**
   * Delete drugDistributionItems
   * DELETE /drugDistributionItems/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof DrugDistributionItemsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { drugDistributionItemsId: id },
      'Deleting drugDistributionItems',
    );

    const deleted = await this.drugDistributionItemsService.delete(id);

    if (!deleted) {
      return reply
        .code(404)
        .error('NOT_FOUND', 'DrugDistributionItems not found');
    }

    request.log.info(
      { drugDistributionItemsId: id },
      'DrugDistributionItems deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'DrugDistributionItems deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateDrugDistributionItemsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      distribution_id: schema.distribution_id,
      item_number: schema.item_number,
      drug_id: schema.drug_id,
      lot_number: schema.lot_number,
      quantity_dispensed: schema.quantity_dispensed,
      unit_cost: schema.unit_cost,
      expiry_date: schema.expiry_date,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateDrugDistributionItemsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.distribution_id !== undefined) {
      updateData.distribution_id = schema.distribution_id;
    }
    if (schema.item_number !== undefined) {
      updateData.item_number = schema.item_number;
    }
    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.lot_number !== undefined) {
      updateData.lot_number = schema.lot_number;
    }
    if (schema.quantity_dispensed !== undefined) {
      updateData.quantity_dispensed = schema.quantity_dispensed;
    }
    if (schema.unit_cost !== undefined) {
      updateData.unit_cost = schema.unit_cost;
    }
    if (schema.expiry_date !== undefined) {
      updateData.expiry_date = schema.expiry_date;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
