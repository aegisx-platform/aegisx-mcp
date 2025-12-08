import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { InventoryTransactionsService } from './inventory-transactions.service';
import {
  CreateInventoryTransactions,
  UpdateInventoryTransactions,
} from './inventory-transactions.types';
import {
  CreateInventoryTransactionsSchema,
  UpdateInventoryTransactionsSchema,
  InventoryTransactionsIdParamSchema,
  GetInventoryTransactionsQuerySchema,
  ListInventoryTransactionsQuerySchema,
} from './inventory-transactions.schemas';

/**
 * InventoryTransactions Controller
 * Package: standard
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class InventoryTransactionsController {
  constructor(
    private inventoryTransactionsService: InventoryTransactionsService,
  ) {}

  /**
   * Create new inventoryTransactions
   * POST /inventoryTransactions
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateInventoryTransactionsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating inventoryTransactions');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const inventoryTransactions =
      await this.inventoryTransactionsService.create(createData);

    request.log.info(
      { inventoryTransactionsId: inventoryTransactions.id },
      'InventoryTransactions created successfully',
    );

    return reply
      .code(201)
      .success(
        inventoryTransactions,
        'InventoryTransactions created successfully',
      );
  }

  /**
   * Get inventoryTransactions by ID
   * GET /inventoryTransactions/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof InventoryTransactionsIdParamSchema>;
      Querystring: Static<typeof GetInventoryTransactionsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { inventoryTransactionsId: id },
      'Fetching inventoryTransactions',
    );

    const inventoryTransactions =
      await this.inventoryTransactionsService.findById(id, request.query);

    return reply.success(inventoryTransactions);
  }

  /**
   * Get paginated list of inventoryTransactionss
   * GET /inventoryTransactions
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListInventoryTransactionsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching inventoryTransactions list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'inventory_id', 'created_at'],
      user: [
        'id',
        'inventory_id',
        'id',
        'inventory_id',
        'transaction_type',
        'quantity',
        'unit_cost',
        'reference_id',
        'reference_type',
        'notes',
        'created_by',
        'created_at',
        'created_at',
      ],
      admin: [
        'id',
        'inventory_id',
        'transaction_type',
        'quantity',
        'unit_cost',
        'reference_id',
        'reference_type',
        'notes',
        'created_by',
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

    // Get inventoryTransactions list with field filtering
    const result = await this.inventoryTransactionsService.findMany({
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
      'InventoryTransactions list fetched',
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
   * Update inventoryTransactions
   * PUT /inventoryTransactions/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof InventoryTransactionsIdParamSchema>;
      Body: Static<typeof UpdateInventoryTransactionsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { inventoryTransactionsId: id, body: request.body },
      'Updating inventoryTransactions',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const inventoryTransactions =
      await this.inventoryTransactionsService.update(id, updateData);

    request.log.info(
      { inventoryTransactionsId: id },
      'InventoryTransactions updated successfully',
    );

    return reply.success(
      inventoryTransactions,
      'InventoryTransactions updated successfully',
    );
  }

  /**
   * Delete inventoryTransactions
   * DELETE /inventoryTransactions/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof InventoryTransactionsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { inventoryTransactionsId: id },
      'Deleting inventoryTransactions',
    );

    const deleted = await this.inventoryTransactionsService.delete(id);

    if (!deleted) {
      return reply
        .code(404)
        .error('NOT_FOUND', 'InventoryTransactions not found');
    }

    request.log.info(
      { inventoryTransactionsId: id },
      'InventoryTransactions deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'InventoryTransactions deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateInventoryTransactionsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      inventory_id: schema.inventory_id,
      transaction_type: schema.transaction_type,
      quantity: schema.quantity,
      unit_cost: schema.unit_cost,
      reference_id: schema.reference_id,
      reference_type: schema.reference_type,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field
    if (request.user?.id) {
      result.created_by = request.user.id;
    }

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateInventoryTransactionsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.inventory_id !== undefined) {
      updateData.inventory_id = schema.inventory_id;
    }
    if (schema.transaction_type !== undefined) {
      updateData.transaction_type = schema.transaction_type;
    }
    if (schema.quantity !== undefined) {
      updateData.quantity = schema.quantity;
    }
    if (schema.unit_cost !== undefined) {
      updateData.unit_cost = schema.unit_cost;
    }
    if (schema.reference_id !== undefined) {
      updateData.reference_id = schema.reference_id;
    }
    if (schema.reference_type !== undefined) {
      updateData.reference_type = schema.reference_type;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
