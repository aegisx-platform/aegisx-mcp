import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { InventoryService } from './inventory.service';
import { CreateInventory, UpdateInventory } from './inventory.types';
import {
  CreateInventorySchema,
  UpdateInventorySchema,
  InventoryIdParamSchema,
  GetInventoryQuerySchema,
  ListInventoryQuerySchema,
} from './inventory.schemas';

/**
 * Inventory Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  /**
   * Create new inventory
   * POST /inventory
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateInventorySchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating inventory');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const inventory = await this.inventoryService.create(createData);

    request.log.info(
      { inventoryId: inventory.id },
      'Inventory created successfully',
    );

    return reply.code(201).success(inventory, 'Inventory created successfully');
  }

  /**
   * Get inventory by ID
   * GET /inventory/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof InventoryIdParamSchema>;
      Querystring: Static<typeof GetInventoryQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ inventoryId: id }, 'Fetching inventory');

    const inventory = await this.inventoryService.findById(id, request.query);

    return reply.success(inventory);
  }

  /**
   * Get paginated list of inventorys
   * GET /inventory
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListInventoryQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching inventory list');

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
        'quantity_on_hand',
        'min_level',
        'max_level',
        'reorder_point',
        'average_cost',
        'last_cost',
        'last_updated',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'drug_id',
        'location_id',
        'quantity_on_hand',
        'min_level',
        'max_level',
        'reorder_point',
        'average_cost',
        'last_cost',
        'last_updated',
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

    // Get inventory list with field filtering
    const result = await this.inventoryService.findMany({
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
      'Inventory list fetched',
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
   * Update inventory
   * PUT /inventory/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof InventoryIdParamSchema>;
      Body: Static<typeof UpdateInventorySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { inventoryId: id, body: request.body },
      'Updating inventory',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const inventory = await this.inventoryService.update(id, updateData);

    request.log.info({ inventoryId: id }, 'Inventory updated successfully');

    return reply.success(inventory, 'Inventory updated successfully');
  }

  /**
   * Delete inventory
   * DELETE /inventory/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof InventoryIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ inventoryId: id }, 'Deleting inventory');

    const deleted = await this.inventoryService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Inventory not found');
    }

    request.log.info({ inventoryId: id }, 'Inventory deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Inventory deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateInventorySchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      drug_id: schema.drug_id,
      location_id: schema.location_id,
      quantity_on_hand: schema.quantity_on_hand,
      min_level: schema.min_level,
      max_level: schema.max_level,
      reorder_point: schema.reorder_point,
      average_cost: schema.average_cost,
      last_cost: schema.last_cost,
      last_updated: schema.last_updated,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateInventorySchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.drug_id !== undefined) {
      updateData.drug_id = schema.drug_id;
    }
    if (schema.location_id !== undefined) {
      updateData.location_id = schema.location_id;
    }
    if (schema.quantity_on_hand !== undefined) {
      updateData.quantity_on_hand = schema.quantity_on_hand;
    }
    if (schema.min_level !== undefined) {
      updateData.min_level = schema.min_level;
    }
    if (schema.max_level !== undefined) {
      updateData.max_level = schema.max_level;
    }
    if (schema.reorder_point !== undefined) {
      updateData.reorder_point = schema.reorder_point;
    }
    if (schema.average_cost !== undefined) {
      updateData.average_cost = schema.average_cost;
    }
    if (schema.last_cost !== undefined) {
      updateData.last_cost = schema.last_cost;
    }
    if (schema.last_updated !== undefined) {
      updateData.last_updated = schema.last_updated;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
