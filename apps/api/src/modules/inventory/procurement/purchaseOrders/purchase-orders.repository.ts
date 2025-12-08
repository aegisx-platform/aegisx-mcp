import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreatePurchaseOrders,
  type UpdatePurchaseOrders,
  type PurchaseOrders,
  type GetPurchaseOrdersQuery,
  type ListPurchaseOrdersQuery,
  type PurchaseOrdersEntity,
} from './purchase-orders.types';

export interface PurchaseOrdersListQuery extends BaseListQuery {
  // Smart field-based filters for PurchaseOrders
  po_number?: string;
  pr_id?: number;
  pr_id_min?: number;
  pr_id_max?: number;
  vendor_id?: number;
  vendor_id_min?: number;
  vendor_id_max?: number;
  contract_id?: number;
  contract_id_min?: number;
  contract_id_max?: number;
  total_amount?: number;
  total_amount_min?: number;
  total_amount_max?: number;
  vat_amount?: number;
  vat_amount_min?: number;
  vat_amount_max?: number;
  grand_total?: number;
  grand_total_min?: number;
  grand_total_max?: number;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  created_by?: string;
  approved_by?: string;
  is_active?: boolean;
}

export class PurchaseOrdersRepository extends BaseRepository<
  PurchaseOrders,
  CreatePurchaseOrders,
  UpdatePurchaseOrders
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.purchase_orders',
      [
        // Define searchable fields based on intelligent detection
        'inventory.purchase_orders.notes',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: true,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): PurchaseOrders {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      po_number: dbRow.po_number,
      pr_id: dbRow.pr_id,
      vendor_id: dbRow.vendor_id,
      contract_id: dbRow.contract_id,
      po_date: dbRow.po_date,
      delivery_date: dbRow.delivery_date,
      total_amount: dbRow.total_amount,
      vat_amount: dbRow.vat_amount,
      grand_total: dbRow.grand_total,
      status: dbRow.status,
      payment_terms: dbRow.payment_terms,
      shipping_address: dbRow.shipping_address,
      billing_address: dbRow.billing_address,
      notes: dbRow.notes,
      created_by: dbRow.created_by,
      approved_by: dbRow.approved_by,
      approved_at: dbRow.approved_at,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreatePurchaseOrders | UpdatePurchaseOrders,
  ): Partial<PurchaseOrdersEntity> {
    const transformed: Partial<PurchaseOrdersEntity> = {};

    if ('po_number' in dto && dto.po_number !== undefined) {
      transformed.po_number = dto.po_number;
    }
    if ('pr_id' in dto && dto.pr_id !== undefined) {
      transformed.pr_id = dto.pr_id;
    }
    if ('vendor_id' in dto && dto.vendor_id !== undefined) {
      transformed.vendor_id = dto.vendor_id;
    }
    if ('contract_id' in dto && dto.contract_id !== undefined) {
      transformed.contract_id = dto.contract_id;
    }
    if ('po_date' in dto && dto.po_date !== undefined) {
      transformed.po_date =
        typeof dto.po_date === 'string' ? new Date(dto.po_date) : dto.po_date;
    }
    if ('delivery_date' in dto && dto.delivery_date !== undefined) {
      transformed.delivery_date =
        typeof dto.delivery_date === 'string'
          ? new Date(dto.delivery_date)
          : dto.delivery_date;
    }
    if ('total_amount' in dto && dto.total_amount !== undefined) {
      transformed.total_amount = dto.total_amount;
    }
    if ('vat_amount' in dto && dto.vat_amount !== undefined) {
      transformed.vat_amount = dto.vat_amount;
    }
    if ('grand_total' in dto && dto.grand_total !== undefined) {
      transformed.grand_total = dto.grand_total;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('payment_terms' in dto && dto.payment_terms !== undefined) {
      transformed.payment_terms = dto.payment_terms;
    }
    if ('shipping_address' in dto && dto.shipping_address !== undefined) {
      transformed.shipping_address = dto.shipping_address;
    }
    if ('billing_address' in dto && dto.billing_address !== undefined) {
      transformed.billing_address = dto.billing_address;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    if ('created_by' in dto && dto.created_by !== undefined) {
      transformed.created_by = dto.created_by;
    }
    if ('approved_by' in dto && dto.approved_by !== undefined) {
      transformed.approved_by = dto.approved_by;
    }
    if ('approved_at' in dto && dto.approved_at !== undefined) {
      transformed.approved_at =
        typeof dto.approved_at === 'string'
          ? new Date(dto.approved_at)
          : dto.approved_at;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.purchase_orders').select(
      'inventory.purchase_orders.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.purchase_orders.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: PurchaseOrdersListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific PurchaseOrders filters based on intelligent field categorization
    if (filters.po_number !== undefined) {
      query.where('inventory.purchase_orders.po_number', filters.po_number);
    }
    if (filters.pr_id !== undefined) {
      query.where('inventory.purchase_orders.pr_id', filters.pr_id);
    }
    if (filters.pr_id_min !== undefined) {
      query.where('inventory.purchase_orders.pr_id', '>=', filters.pr_id_min);
    }
    if (filters.pr_id_max !== undefined) {
      query.where('inventory.purchase_orders.pr_id', '<=', filters.pr_id_max);
    }
    if (filters.vendor_id !== undefined) {
      query.where('inventory.purchase_orders.vendor_id', filters.vendor_id);
    }
    if (filters.vendor_id_min !== undefined) {
      query.where(
        'inventory.purchase_orders.vendor_id',
        '>=',
        filters.vendor_id_min,
      );
    }
    if (filters.vendor_id_max !== undefined) {
      query.where(
        'inventory.purchase_orders.vendor_id',
        '<=',
        filters.vendor_id_max,
      );
    }
    if (filters.contract_id !== undefined) {
      query.where('inventory.purchase_orders.contract_id', filters.contract_id);
    }
    if (filters.contract_id_min !== undefined) {
      query.where(
        'inventory.purchase_orders.contract_id',
        '>=',
        filters.contract_id_min,
      );
    }
    if (filters.contract_id_max !== undefined) {
      query.where(
        'inventory.purchase_orders.contract_id',
        '<=',
        filters.contract_id_max,
      );
    }
    if (filters.total_amount !== undefined) {
      query.where(
        'inventory.purchase_orders.total_amount',
        filters.total_amount,
      );
    }
    if (filters.total_amount_min !== undefined) {
      query.where(
        'inventory.purchase_orders.total_amount',
        '>=',
        filters.total_amount_min,
      );
    }
    if (filters.total_amount_max !== undefined) {
      query.where(
        'inventory.purchase_orders.total_amount',
        '<=',
        filters.total_amount_max,
      );
    }
    if (filters.vat_amount !== undefined) {
      query.where('inventory.purchase_orders.vat_amount', filters.vat_amount);
    }
    if (filters.vat_amount_min !== undefined) {
      query.where(
        'inventory.purchase_orders.vat_amount',
        '>=',
        filters.vat_amount_min,
      );
    }
    if (filters.vat_amount_max !== undefined) {
      query.where(
        'inventory.purchase_orders.vat_amount',
        '<=',
        filters.vat_amount_max,
      );
    }
    if (filters.grand_total !== undefined) {
      query.where('inventory.purchase_orders.grand_total', filters.grand_total);
    }
    if (filters.grand_total_min !== undefined) {
      query.where(
        'inventory.purchase_orders.grand_total',
        '>=',
        filters.grand_total_min,
      );
    }
    if (filters.grand_total_max !== undefined) {
      query.where(
        'inventory.purchase_orders.grand_total',
        '<=',
        filters.grand_total_max,
      );
    }
    if (filters.shipping_address !== undefined) {
      query.where(
        'inventory.purchase_orders.shipping_address',
        filters.shipping_address,
      );
    }
    if (filters.billing_address !== undefined) {
      query.where(
        'inventory.purchase_orders.billing_address',
        filters.billing_address,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.purchase_orders.notes', filters.notes);
    }
    if (filters.created_by !== undefined) {
      query.where('inventory.purchase_orders.created_by', filters.created_by);
    }
    if (filters.approved_by !== undefined) {
      query.where('inventory.purchase_orders.approved_by', filters.approved_by);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.purchase_orders.is_active', filters.is_active);
    }
  }

  // Apply multiple sort parsing
  protected applyMultipleSort(query: any, sort?: string): void {
    if (sort) {
      if (sort.includes(',')) {
        // Multiple sort format: field1:desc,field2:asc,field3:desc
        const sortPairs = sort.split(',');
        sortPairs.forEach((pair) => {
          const [field, direction] = pair.split(':');
          const mappedField = this.getSortField(field.trim());
          const sortDirection =
            direction?.trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
          query.orderBy(mappedField, sortDirection);
        });
      } else {
        // Single sort field
        const [field, direction] = sort.split(':');
        const mappedField = this.getSortField(field.trim());
        const sortDirection =
          direction?.trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
        query.orderBy(mappedField, sortDirection);
      }
    } else {
      // Default sort
      query.orderBy(this.getSortField('created_at'), 'desc');
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: 'inventory.purchase_orders.id',
      poNumber: 'inventory.purchase_orders.po_number',
      prId: 'inventory.purchase_orders.pr_id',
      vendorId: 'inventory.purchase_orders.vendor_id',
      contractId: 'inventory.purchase_orders.contract_id',
      poDate: 'inventory.purchase_orders.po_date',
      deliveryDate: 'inventory.purchase_orders.delivery_date',
      totalAmount: 'inventory.purchase_orders.total_amount',
      vatAmount: 'inventory.purchase_orders.vat_amount',
      grandTotal: 'inventory.purchase_orders.grand_total',
      status: 'inventory.purchase_orders.status',
      paymentTerms: 'inventory.purchase_orders.payment_terms',
      shippingAddress: 'inventory.purchase_orders.shipping_address',
      billingAddress: 'inventory.purchase_orders.billing_address',
      notes: 'inventory.purchase_orders.notes',
      createdBy: 'inventory.purchase_orders.created_by',
      approvedBy: 'inventory.purchase_orders.approved_by',
      approvedAt: 'inventory.purchase_orders.approved_at',
      isActive: 'inventory.purchase_orders.is_active',
      createdAt: 'inventory.purchase_orders.created_at',
      updatedAt: 'inventory.purchase_orders.updated_at',
    };

    return sortFields[sortBy] || 'inventory.purchase_orders.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetPurchaseOrdersQuery = {},
  ): Promise<PurchaseOrders | null> {
    let query = this.getJoinQuery();
    query = query.where('purchase_orders.id', id);

    // Handle include options
    if (options.include) {
      const includes = Array.isArray(options.include)
        ? options.include
        : [options.include];
      includes.forEach((relation) => {
        // TODO: Add join logic for relationships
        // Example: if (relation === 'category') query.leftJoin('categories', 'items.category_id', 'categories.id');
      });
    }

    const row = await query.first();
    return row ? this.transformToEntity(row) : null;
  }

  // Extended list method with specific query type
  async list(
    query: PurchaseOrdersListQuery = {},
  ): Promise<PaginatedListResult<PurchaseOrders>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  /**
   * Check if record can be deleted
   * Returns foreign key references that would prevent deletion
   */
  async canBeDeleted(id: string | number): Promise<{
    canDelete: boolean;
    blockedBy: Array<{
      table: string;
      field: string;
      count: number;
      cascade: boolean;
    }>;
  }> {
    const blockedBy: Array<{
      table: string;
      field: string;
      count: number;
      cascade: boolean;
    }> = [];

    // Check approval_documents references
    const approvalDocumentsCount = await this.knex('approval_documents')
      .where('po_id', id)
      .count('* as count')
      .first();

    if (parseInt((approvalDocumentsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'approval_documents',
        field: 'po_id',
        count: parseInt((approvalDocumentsCount?.count as string) || '0'),
        cascade: true,
      });
    }

    // Check purchase_order_items references
    const purchaseOrderItemsCount = await this.knex('purchase_order_items')
      .where('po_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseOrderItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_order_items',
        field: 'po_id',
        count: parseInt((purchaseOrderItemsCount?.count as string) || '0'),
        cascade: true,
      });
    }

    // Check receipts references
    const receiptsCount = await this.knex('receipts')
      .where('po_id', id)
      .count('* as count')
      .first();

    if (parseInt((receiptsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'receipts',
        field: 'po_id',
        count: parseInt((receiptsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    return {
      canDelete:
        blockedBy.length === 0 || blockedBy.every((ref) => ref.cascade),
      blockedBy,
    };
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.purchase_orders')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreatePurchaseOrders[]): Promise<PurchaseOrders[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.purchase_orders')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreatePurchaseOrders,
  ): Promise<PurchaseOrders> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.purchase_orders')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
