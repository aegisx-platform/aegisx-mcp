import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateReceiptInspectors,
  type UpdateReceiptInspectors,
  type ReceiptInspectors,
  type GetReceiptInspectorsQuery,
  type ListReceiptInspectorsQuery,
  type ReceiptInspectorsEntity,
} from './receipt-inspectors.types';

export interface ReceiptInspectorsListQuery extends BaseListQuery {
  // Smart field-based filters for ReceiptInspectors
  receipt_id?: number;
  receipt_id_min?: number;
  receipt_id_max?: number;
  inspector_id?: string;
  notes?: string;
}

export class ReceiptInspectorsRepository extends BaseRepository<
  ReceiptInspectors,
  CreateReceiptInspectors,
  UpdateReceiptInspectors
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.receipt_inspectors',
      [
        // Define searchable fields based on intelligent detection
        'inventory.receipt_inspectors.notes',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: false,
        hasCreatedBy: false,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): ReceiptInspectors {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      receipt_id: dbRow.receipt_id,
      inspector_id: dbRow.inspector_id,
      inspector_role: dbRow.inspector_role,
      inspected_at: dbRow.inspected_at,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateReceiptInspectors | UpdateReceiptInspectors,
  ): Partial<ReceiptInspectorsEntity> {
    const transformed: Partial<ReceiptInspectorsEntity> = {};

    if ('receipt_id' in dto && dto.receipt_id !== undefined) {
      transformed.receipt_id = dto.receipt_id;
    }
    if ('inspector_id' in dto && dto.inspector_id !== undefined) {
      transformed.inspector_id = dto.inspector_id;
    }
    if ('inspector_role' in dto && dto.inspector_role !== undefined) {
      transformed.inspector_role = dto.inspector_role;
    }
    if ('inspected_at' in dto && dto.inspected_at !== undefined) {
      transformed.inspected_at =
        typeof dto.inspected_at === 'string'
          ? new Date(dto.inspected_at)
          : dto.inspected_at;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.receipt_inspectors').select(
      'inventory.receipt_inspectors.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.receipt_inspectors.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: ReceiptInspectorsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific ReceiptInspectors filters based on intelligent field categorization
    if (filters.receipt_id !== undefined) {
      query.where(
        'inventory.receipt_inspectors.receipt_id',
        filters.receipt_id,
      );
    }
    if (filters.receipt_id_min !== undefined) {
      query.where(
        'inventory.receipt_inspectors.receipt_id',
        '>=',
        filters.receipt_id_min,
      );
    }
    if (filters.receipt_id_max !== undefined) {
      query.where(
        'inventory.receipt_inspectors.receipt_id',
        '<=',
        filters.receipt_id_max,
      );
    }
    if (filters.inspector_id !== undefined) {
      query.where(
        'inventory.receipt_inspectors.inspector_id',
        filters.inspector_id,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.receipt_inspectors.notes', filters.notes);
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
      id: 'inventory.receipt_inspectors.id',
      receiptId: 'inventory.receipt_inspectors.receipt_id',
      inspectorId: 'inventory.receipt_inspectors.inspector_id',
      inspectorRole: 'inventory.receipt_inspectors.inspector_role',
      inspectedAt: 'inventory.receipt_inspectors.inspected_at',
      notes: 'inventory.receipt_inspectors.notes',
      createdAt: 'inventory.receipt_inspectors.created_at',
    };

    return sortFields[sortBy] || 'inventory.receipt_inspectors.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetReceiptInspectorsQuery = {},
  ): Promise<ReceiptInspectors | null> {
    let query = this.getJoinQuery();
    query = query.where('receipt_inspectors.id', id);

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
    query: ReceiptInspectorsListQuery = {},
  ): Promise<PaginatedListResult<ReceiptInspectors>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.receipt_inspectors')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateReceiptInspectors[],
  ): Promise<ReceiptInspectors[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.receipt_inspectors')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateReceiptInspectors,
  ): Promise<ReceiptInspectors> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.receipt_inspectors')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
