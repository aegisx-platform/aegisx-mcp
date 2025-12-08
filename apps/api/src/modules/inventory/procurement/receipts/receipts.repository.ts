import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateReceipts,
  type UpdateReceipts,
  type Receipts,
  type GetReceiptsQuery,
  type ListReceiptsQuery,
  type ReceiptsEntity,
} from './receipts.types';

export interface ReceiptsListQuery extends BaseListQuery {
  // Smart field-based filters for Receipts
  receipt_number?: string;
  po_id?: number;
  po_id_min?: number;
  po_id_max?: number;
  location_id?: number;
  location_id_min?: number;
  location_id_max?: number;
  delivery_note_number?: string;
  invoice_number?: string;
  total_amount?: number;
  total_amount_min?: number;
  total_amount_max?: number;
  notes?: string;
  received_by?: string;
  inspected_by?: string;
  is_active?: boolean;
}

export class ReceiptsRepository extends BaseRepository<
  Receipts,
  CreateReceipts,
  UpdateReceipts
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.receipts',
      [
        // Define searchable fields based on intelligent detection
        'inventory.receipts.delivery_note_number',
        'inventory.receipts.notes',
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
  transformToEntity(dbRow: any): Receipts {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      receipt_number: dbRow.receipt_number,
      po_id: dbRow.po_id,
      location_id: dbRow.location_id,
      receipt_date: dbRow.receipt_date,
      delivery_note_number: dbRow.delivery_note_number,
      invoice_number: dbRow.invoice_number,
      invoice_date: dbRow.invoice_date,
      status: dbRow.status,
      total_amount: dbRow.total_amount,
      notes: dbRow.notes,
      received_by: dbRow.received_by,
      inspected_by: dbRow.inspected_by,
      inspected_at: dbRow.inspected_at,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateReceipts | UpdateReceipts): Partial<ReceiptsEntity> {
    const transformed: Partial<ReceiptsEntity> = {};

    if ('receipt_number' in dto && dto.receipt_number !== undefined) {
      transformed.receipt_number = dto.receipt_number;
    }
    if ('po_id' in dto && dto.po_id !== undefined) {
      transformed.po_id = dto.po_id;
    }
    if ('location_id' in dto && dto.location_id !== undefined) {
      transformed.location_id = dto.location_id;
    }
    if ('receipt_date' in dto && dto.receipt_date !== undefined) {
      transformed.receipt_date =
        typeof dto.receipt_date === 'string'
          ? new Date(dto.receipt_date)
          : dto.receipt_date;
    }
    if (
      'delivery_note_number' in dto &&
      dto.delivery_note_number !== undefined
    ) {
      transformed.delivery_note_number = dto.delivery_note_number;
    }
    if ('invoice_number' in dto && dto.invoice_number !== undefined) {
      transformed.invoice_number = dto.invoice_number;
    }
    if ('invoice_date' in dto && dto.invoice_date !== undefined) {
      transformed.invoice_date =
        typeof dto.invoice_date === 'string'
          ? new Date(dto.invoice_date)
          : dto.invoice_date;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('total_amount' in dto && dto.total_amount !== undefined) {
      transformed.total_amount = dto.total_amount;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    if ('received_by' in dto && dto.received_by !== undefined) {
      transformed.received_by = dto.received_by;
    }
    if ('inspected_by' in dto && dto.inspected_by !== undefined) {
      transformed.inspected_by = dto.inspected_by;
    }
    if ('inspected_at' in dto && dto.inspected_at !== undefined) {
      transformed.inspected_at =
        typeof dto.inspected_at === 'string'
          ? new Date(dto.inspected_at)
          : dto.inspected_at;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.receipts').select('inventory.receipts.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.receipts.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: ReceiptsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Receipts filters based on intelligent field categorization
    if (filters.receipt_number !== undefined) {
      query.where('inventory.receipts.receipt_number', filters.receipt_number);
    }
    if (filters.po_id !== undefined) {
      query.where('inventory.receipts.po_id', filters.po_id);
    }
    if (filters.po_id_min !== undefined) {
      query.where('inventory.receipts.po_id', '>=', filters.po_id_min);
    }
    if (filters.po_id_max !== undefined) {
      query.where('inventory.receipts.po_id', '<=', filters.po_id_max);
    }
    if (filters.location_id !== undefined) {
      query.where('inventory.receipts.location_id', filters.location_id);
    }
    if (filters.location_id_min !== undefined) {
      query.where(
        'inventory.receipts.location_id',
        '>=',
        filters.location_id_min,
      );
    }
    if (filters.location_id_max !== undefined) {
      query.where(
        'inventory.receipts.location_id',
        '<=',
        filters.location_id_max,
      );
    }
    if (filters.delivery_note_number !== undefined) {
      query.where(
        'inventory.receipts.delivery_note_number',
        filters.delivery_note_number,
      );
    }
    if (filters.invoice_number !== undefined) {
      query.where('inventory.receipts.invoice_number', filters.invoice_number);
    }
    if (filters.total_amount !== undefined) {
      query.where('inventory.receipts.total_amount', filters.total_amount);
    }
    if (filters.total_amount_min !== undefined) {
      query.where(
        'inventory.receipts.total_amount',
        '>=',
        filters.total_amount_min,
      );
    }
    if (filters.total_amount_max !== undefined) {
      query.where(
        'inventory.receipts.total_amount',
        '<=',
        filters.total_amount_max,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.receipts.notes', filters.notes);
    }
    if (filters.received_by !== undefined) {
      query.where('inventory.receipts.received_by', filters.received_by);
    }
    if (filters.inspected_by !== undefined) {
      query.where('inventory.receipts.inspected_by', filters.inspected_by);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.receipts.is_active', filters.is_active);
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
      id: 'inventory.receipts.id',
      receiptNumber: 'inventory.receipts.receipt_number',
      poId: 'inventory.receipts.po_id',
      locationId: 'inventory.receipts.location_id',
      receiptDate: 'inventory.receipts.receipt_date',
      deliveryNoteNumber: 'inventory.receipts.delivery_note_number',
      invoiceNumber: 'inventory.receipts.invoice_number',
      invoiceDate: 'inventory.receipts.invoice_date',
      status: 'inventory.receipts.status',
      totalAmount: 'inventory.receipts.total_amount',
      notes: 'inventory.receipts.notes',
      receivedBy: 'inventory.receipts.received_by',
      inspectedBy: 'inventory.receipts.inspected_by',
      inspectedAt: 'inventory.receipts.inspected_at',
      isActive: 'inventory.receipts.is_active',
      createdAt: 'inventory.receipts.created_at',
      updatedAt: 'inventory.receipts.updated_at',
    };

    return sortFields[sortBy] || 'inventory.receipts.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetReceiptsQuery = {},
  ): Promise<Receipts | null> {
    let query = this.getJoinQuery();
    query = query.where('receipts.id', id);

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
    query: ReceiptsListQuery = {},
  ): Promise<PaginatedListResult<Receipts>> {
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

    // Check drug_lots references
    const drugLotsCount = await this.knex('drug_lots')
      .where('receipt_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugLotsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_lots',
        field: 'receipt_id',
        count: parseInt((drugLotsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check payment_documents references
    const paymentDocumentsCount = await this.knex('payment_documents')
      .where('receipt_id', id)
      .count('* as count')
      .first();

    if (parseInt((paymentDocumentsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'payment_documents',
        field: 'receipt_id',
        count: parseInt((paymentDocumentsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check receipt_inspectors references
    const receiptInspectorsCount = await this.knex('receipt_inspectors')
      .where('receipt_id', id)
      .count('* as count')
      .first();

    if (parseInt((receiptInspectorsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'receipt_inspectors',
        field: 'receipt_id',
        count: parseInt((receiptInspectorsCount?.count as string) || '0'),
        cascade: true,
      });
    }

    // Check receipt_items references
    const receiptItemsCount = await this.knex('receipt_items')
      .where('receipt_id', id)
      .count('* as count')
      .first();

    if (parseInt((receiptItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'receipt_items',
        field: 'receipt_id',
        count: parseInt((receiptItemsCount?.count as string) || '0'),
        cascade: true,
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
    const stats: any = await this.knex('inventory.receipts')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateReceipts[]): Promise<Receipts[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.receipts')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateReceipts): Promise<Receipts> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.receipts')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
