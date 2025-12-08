import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateReceiptItems,
  type UpdateReceiptItems,
  type ReceiptItems,
  type GetReceiptItemsQuery,
  type ListReceiptItemsQuery,
  type ReceiptItemsEntity,
} from './receipt-items.types';

export interface ReceiptItemsListQuery extends BaseListQuery {
  // Smart field-based filters for ReceiptItems
  receipt_id?: number;
  receipt_id_min?: number;
  receipt_id_max?: number;
  po_item_id?: number;
  po_item_id_min?: number;
  po_item_id_max?: number;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  quantity_ordered?: number;
  quantity_ordered_min?: number;
  quantity_ordered_max?: number;
  quantity_received?: number;
  quantity_received_min?: number;
  quantity_received_max?: number;
  quantity_accepted?: number;
  quantity_accepted_min?: number;
  quantity_accepted_max?: number;
  quantity_rejected?: number;
  quantity_rejected_min?: number;
  quantity_rejected_max?: number;
  rejection_reason?: string;
  unit_price?: number;
  unit_price_min?: number;
  unit_price_max?: number;
  total_price?: number;
  total_price_min?: number;
  total_price_max?: number;
  lot_number?: string;
  notes?: string;
}

export class ReceiptItemsRepository extends BaseRepository<
  ReceiptItems,
  CreateReceiptItems,
  UpdateReceiptItems
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.receipt_items',
      [
        // Define searchable fields based on intelligent detection
        'inventory.receipt_items.notes',
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
  transformToEntity(dbRow: any): ReceiptItems {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      receipt_id: dbRow.receipt_id,
      po_item_id: dbRow.po_item_id,
      generic_id: dbRow.generic_id,
      quantity_ordered: dbRow.quantity_ordered,
      quantity_received: dbRow.quantity_received,
      quantity_accepted: dbRow.quantity_accepted,
      quantity_rejected: dbRow.quantity_rejected,
      rejection_reason: dbRow.rejection_reason,
      unit_price: dbRow.unit_price,
      total_price: dbRow.total_price,
      lot_number: dbRow.lot_number,
      manufacture_date: dbRow.manufacture_date,
      expiry_date: dbRow.expiry_date,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateReceiptItems | UpdateReceiptItems,
  ): Partial<ReceiptItemsEntity> {
    const transformed: Partial<ReceiptItemsEntity> = {};

    if ('receipt_id' in dto && dto.receipt_id !== undefined) {
      transformed.receipt_id = dto.receipt_id;
    }
    if ('po_item_id' in dto && dto.po_item_id !== undefined) {
      transformed.po_item_id = dto.po_item_id;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('quantity_ordered' in dto && dto.quantity_ordered !== undefined) {
      transformed.quantity_ordered = dto.quantity_ordered;
    }
    if ('quantity_received' in dto && dto.quantity_received !== undefined) {
      transformed.quantity_received = dto.quantity_received;
    }
    if ('quantity_accepted' in dto && dto.quantity_accepted !== undefined) {
      transformed.quantity_accepted = dto.quantity_accepted;
    }
    if ('quantity_rejected' in dto && dto.quantity_rejected !== undefined) {
      transformed.quantity_rejected = dto.quantity_rejected;
    }
    if ('rejection_reason' in dto && dto.rejection_reason !== undefined) {
      transformed.rejection_reason = dto.rejection_reason;
    }
    if ('unit_price' in dto && dto.unit_price !== undefined) {
      transformed.unit_price = dto.unit_price;
    }
    if ('total_price' in dto && dto.total_price !== undefined) {
      transformed.total_price = dto.total_price;
    }
    if ('lot_number' in dto && dto.lot_number !== undefined) {
      transformed.lot_number = dto.lot_number;
    }
    if ('manufacture_date' in dto && dto.manufacture_date !== undefined) {
      transformed.manufacture_date =
        typeof dto.manufacture_date === 'string'
          ? new Date(dto.manufacture_date)
          : dto.manufacture_date;
    }
    if ('expiry_date' in dto && dto.expiry_date !== undefined) {
      transformed.expiry_date =
        typeof dto.expiry_date === 'string'
          ? new Date(dto.expiry_date)
          : dto.expiry_date;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.receipt_items').select(
      'inventory.receipt_items.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.receipt_items.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: ReceiptItemsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific ReceiptItems filters based on intelligent field categorization
    if (filters.receipt_id !== undefined) {
      query.where('inventory.receipt_items.receipt_id', filters.receipt_id);
    }
    if (filters.receipt_id_min !== undefined) {
      query.where(
        'inventory.receipt_items.receipt_id',
        '>=',
        filters.receipt_id_min,
      );
    }
    if (filters.receipt_id_max !== undefined) {
      query.where(
        'inventory.receipt_items.receipt_id',
        '<=',
        filters.receipt_id_max,
      );
    }
    if (filters.po_item_id !== undefined) {
      query.where('inventory.receipt_items.po_item_id', filters.po_item_id);
    }
    if (filters.po_item_id_min !== undefined) {
      query.where(
        'inventory.receipt_items.po_item_id',
        '>=',
        filters.po_item_id_min,
      );
    }
    if (filters.po_item_id_max !== undefined) {
      query.where(
        'inventory.receipt_items.po_item_id',
        '<=',
        filters.po_item_id_max,
      );
    }
    if (filters.generic_id !== undefined) {
      query.where('inventory.receipt_items.generic_id', filters.generic_id);
    }
    if (filters.generic_id_min !== undefined) {
      query.where(
        'inventory.receipt_items.generic_id',
        '>=',
        filters.generic_id_min,
      );
    }
    if (filters.generic_id_max !== undefined) {
      query.where(
        'inventory.receipt_items.generic_id',
        '<=',
        filters.generic_id_max,
      );
    }
    if (filters.quantity_ordered !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_ordered',
        filters.quantity_ordered,
      );
    }
    if (filters.quantity_ordered_min !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_ordered',
        '>=',
        filters.quantity_ordered_min,
      );
    }
    if (filters.quantity_ordered_max !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_ordered',
        '<=',
        filters.quantity_ordered_max,
      );
    }
    if (filters.quantity_received !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_received',
        filters.quantity_received,
      );
    }
    if (filters.quantity_received_min !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_received',
        '>=',
        filters.quantity_received_min,
      );
    }
    if (filters.quantity_received_max !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_received',
        '<=',
        filters.quantity_received_max,
      );
    }
    if (filters.quantity_accepted !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_accepted',
        filters.quantity_accepted,
      );
    }
    if (filters.quantity_accepted_min !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_accepted',
        '>=',
        filters.quantity_accepted_min,
      );
    }
    if (filters.quantity_accepted_max !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_accepted',
        '<=',
        filters.quantity_accepted_max,
      );
    }
    if (filters.quantity_rejected !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_rejected',
        filters.quantity_rejected,
      );
    }
    if (filters.quantity_rejected_min !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_rejected',
        '>=',
        filters.quantity_rejected_min,
      );
    }
    if (filters.quantity_rejected_max !== undefined) {
      query.where(
        'inventory.receipt_items.quantity_rejected',
        '<=',
        filters.quantity_rejected_max,
      );
    }
    if (filters.rejection_reason !== undefined) {
      query.where(
        'inventory.receipt_items.rejection_reason',
        filters.rejection_reason,
      );
    }
    if (filters.unit_price !== undefined) {
      query.where('inventory.receipt_items.unit_price', filters.unit_price);
    }
    if (filters.unit_price_min !== undefined) {
      query.where(
        'inventory.receipt_items.unit_price',
        '>=',
        filters.unit_price_min,
      );
    }
    if (filters.unit_price_max !== undefined) {
      query.where(
        'inventory.receipt_items.unit_price',
        '<=',
        filters.unit_price_max,
      );
    }
    if (filters.total_price !== undefined) {
      query.where('inventory.receipt_items.total_price', filters.total_price);
    }
    if (filters.total_price_min !== undefined) {
      query.where(
        'inventory.receipt_items.total_price',
        '>=',
        filters.total_price_min,
      );
    }
    if (filters.total_price_max !== undefined) {
      query.where(
        'inventory.receipt_items.total_price',
        '<=',
        filters.total_price_max,
      );
    }
    if (filters.lot_number !== undefined) {
      query.where('inventory.receipt_items.lot_number', filters.lot_number);
    }
    if (filters.notes !== undefined) {
      query.where('inventory.receipt_items.notes', filters.notes);
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
      id: 'inventory.receipt_items.id',
      receiptId: 'inventory.receipt_items.receipt_id',
      poItemId: 'inventory.receipt_items.po_item_id',
      genericId: 'inventory.receipt_items.generic_id',
      quantityOrdered: 'inventory.receipt_items.quantity_ordered',
      quantityReceived: 'inventory.receipt_items.quantity_received',
      quantityAccepted: 'inventory.receipt_items.quantity_accepted',
      quantityRejected: 'inventory.receipt_items.quantity_rejected',
      rejectionReason: 'inventory.receipt_items.rejection_reason',
      unitPrice: 'inventory.receipt_items.unit_price',
      totalPrice: 'inventory.receipt_items.total_price',
      lotNumber: 'inventory.receipt_items.lot_number',
      manufactureDate: 'inventory.receipt_items.manufacture_date',
      expiryDate: 'inventory.receipt_items.expiry_date',
      notes: 'inventory.receipt_items.notes',
      createdAt: 'inventory.receipt_items.created_at',
      updatedAt: 'inventory.receipt_items.updated_at',
    };

    return sortFields[sortBy] || 'inventory.receipt_items.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetReceiptItemsQuery = {},
  ): Promise<ReceiptItems | null> {
    let query = this.getJoinQuery();
    query = query.where('receipt_items.id', id);

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
    query: ReceiptItemsListQuery = {},
  ): Promise<PaginatedListResult<ReceiptItems>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.receipt_items')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateReceiptItems[]): Promise<ReceiptItems[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.receipt_items')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateReceiptItems): Promise<ReceiptItems> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.receipt_items')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
