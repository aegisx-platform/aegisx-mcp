import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreatePurchaseOrderItems,
  type UpdatePurchaseOrderItems,
  type PurchaseOrderItems,
  type GetPurchaseOrderItemsQuery,
  type ListPurchaseOrderItemsQuery,
  type PurchaseOrderItemsEntity,
} from './purchase-order-items.types';

export interface PurchaseOrderItemsListQuery extends BaseListQuery {
  // Smart field-based filters for PurchaseOrderItems
  po_id?: number;
  po_id_min?: number;
  po_id_max?: number;
  pr_item_id?: number;
  pr_item_id_min?: number;
  pr_item_id_max?: number;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  quantity?: number;
  quantity_min?: number;
  quantity_max?: number;
  unit?: string;
  unit_price?: number;
  unit_price_min?: number;
  unit_price_max?: number;
  discount_percent?: number;
  discount_percent_min?: number;
  discount_percent_max?: number;
  discount_amount?: number;
  discount_amount_min?: number;
  discount_amount_max?: number;
  total_price?: number;
  total_price_min?: number;
  total_price_max?: number;
  notes?: string;
}

export class PurchaseOrderItemsRepository extends BaseRepository<
  PurchaseOrderItems,
  CreatePurchaseOrderItems,
  UpdatePurchaseOrderItems
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.purchase_order_items',
      [
        // Define searchable fields based on intelligent detection
        'inventory.purchase_order_items.notes',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: false,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): PurchaseOrderItems {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      po_id: dbRow.po_id,
      pr_item_id: dbRow.pr_item_id,
      generic_id: dbRow.generic_id,
      quantity: dbRow.quantity,
      unit: dbRow.unit,
      unit_price: dbRow.unit_price,
      discount_percent: dbRow.discount_percent,
      discount_amount: dbRow.discount_amount,
      total_price: dbRow.total_price,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreatePurchaseOrderItems | UpdatePurchaseOrderItems,
  ): Partial<PurchaseOrderItemsEntity> {
    const transformed: Partial<PurchaseOrderItemsEntity> = {};

    if ('po_id' in dto && dto.po_id !== undefined) {
      transformed.po_id = dto.po_id;
    }
    if ('pr_item_id' in dto && dto.pr_item_id !== undefined) {
      transformed.pr_item_id = dto.pr_item_id;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('quantity' in dto && dto.quantity !== undefined) {
      transformed.quantity = dto.quantity;
    }
    if ('unit' in dto && dto.unit !== undefined) {
      transformed.unit = dto.unit;
    }
    if ('unit_price' in dto && dto.unit_price !== undefined) {
      transformed.unit_price = dto.unit_price;
    }
    if ('discount_percent' in dto && dto.discount_percent !== undefined) {
      transformed.discount_percent = dto.discount_percent;
    }
    if ('discount_amount' in dto && dto.discount_amount !== undefined) {
      transformed.discount_amount = dto.discount_amount;
    }
    if ('total_price' in dto && dto.total_price !== undefined) {
      transformed.total_price = dto.total_price;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.purchase_order_items').select(
      'inventory.purchase_order_items.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.purchase_order_items.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: PurchaseOrderItemsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific PurchaseOrderItems filters based on intelligent field categorization
    if (filters.po_id !== undefined) {
      query.where('inventory.purchase_order_items.po_id', filters.po_id);
    }
    if (filters.po_id_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.po_id',
        '>=',
        filters.po_id_min,
      );
    }
    if (filters.po_id_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.po_id',
        '<=',
        filters.po_id_max,
      );
    }
    if (filters.pr_item_id !== undefined) {
      query.where(
        'inventory.purchase_order_items.pr_item_id',
        filters.pr_item_id,
      );
    }
    if (filters.pr_item_id_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.pr_item_id',
        '>=',
        filters.pr_item_id_min,
      );
    }
    if (filters.pr_item_id_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.pr_item_id',
        '<=',
        filters.pr_item_id_max,
      );
    }
    if (filters.generic_id !== undefined) {
      query.where(
        'inventory.purchase_order_items.generic_id',
        filters.generic_id,
      );
    }
    if (filters.generic_id_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.generic_id',
        '>=',
        filters.generic_id_min,
      );
    }
    if (filters.generic_id_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.generic_id',
        '<=',
        filters.generic_id_max,
      );
    }
    if (filters.quantity !== undefined) {
      query.where('inventory.purchase_order_items.quantity', filters.quantity);
    }
    if (filters.quantity_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.quantity',
        '>=',
        filters.quantity_min,
      );
    }
    if (filters.quantity_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.quantity',
        '<=',
        filters.quantity_max,
      );
    }
    if (filters.unit !== undefined) {
      query.where('inventory.purchase_order_items.unit', filters.unit);
    }
    if (filters.unit_price !== undefined) {
      query.where(
        'inventory.purchase_order_items.unit_price',
        filters.unit_price,
      );
    }
    if (filters.unit_price_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.unit_price',
        '>=',
        filters.unit_price_min,
      );
    }
    if (filters.unit_price_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.unit_price',
        '<=',
        filters.unit_price_max,
      );
    }
    if (filters.discount_percent !== undefined) {
      query.where(
        'inventory.purchase_order_items.discount_percent',
        filters.discount_percent,
      );
    }
    if (filters.discount_percent_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.discount_percent',
        '>=',
        filters.discount_percent_min,
      );
    }
    if (filters.discount_percent_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.discount_percent',
        '<=',
        filters.discount_percent_max,
      );
    }
    if (filters.discount_amount !== undefined) {
      query.where(
        'inventory.purchase_order_items.discount_amount',
        filters.discount_amount,
      );
    }
    if (filters.discount_amount_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.discount_amount',
        '>=',
        filters.discount_amount_min,
      );
    }
    if (filters.discount_amount_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.discount_amount',
        '<=',
        filters.discount_amount_max,
      );
    }
    if (filters.total_price !== undefined) {
      query.where(
        'inventory.purchase_order_items.total_price',
        filters.total_price,
      );
    }
    if (filters.total_price_min !== undefined) {
      query.where(
        'inventory.purchase_order_items.total_price',
        '>=',
        filters.total_price_min,
      );
    }
    if (filters.total_price_max !== undefined) {
      query.where(
        'inventory.purchase_order_items.total_price',
        '<=',
        filters.total_price_max,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.purchase_order_items.notes', filters.notes);
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
      id: 'inventory.purchase_order_items.id',
      poId: 'inventory.purchase_order_items.po_id',
      prItemId: 'inventory.purchase_order_items.pr_item_id',
      genericId: 'inventory.purchase_order_items.generic_id',
      quantity: 'inventory.purchase_order_items.quantity',
      unit: 'inventory.purchase_order_items.unit',
      unitPrice: 'inventory.purchase_order_items.unit_price',
      discountPercent: 'inventory.purchase_order_items.discount_percent',
      discountAmount: 'inventory.purchase_order_items.discount_amount',
      totalPrice: 'inventory.purchase_order_items.total_price',
      notes: 'inventory.purchase_order_items.notes',
      createdAt: 'inventory.purchase_order_items.created_at',
      updatedAt: 'inventory.purchase_order_items.updated_at',
    };

    return sortFields[sortBy] || 'inventory.purchase_order_items.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetPurchaseOrderItemsQuery = {},
  ): Promise<PurchaseOrderItems | null> {
    let query = this.getJoinQuery();
    query = query.where('purchase_order_items.id', id);

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
    query: PurchaseOrderItemsListQuery = {},
  ): Promise<PaginatedListResult<PurchaseOrderItems>> {
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

    // Check receipt_items references
    const receiptItemsCount = await this.knex('receipt_items')
      .where('po_item_id', id)
      .count('* as count')
      .first();

    if (parseInt((receiptItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'receipt_items',
        field: 'po_item_id',
        count: parseInt((receiptItemsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.purchase_order_items')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreatePurchaseOrderItems[],
  ): Promise<PurchaseOrderItems[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.purchase_order_items')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreatePurchaseOrderItems,
  ): Promise<PurchaseOrderItems> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.purchase_order_items')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
