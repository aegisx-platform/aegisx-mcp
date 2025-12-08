import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateInventoryTransactions,
  type UpdateInventoryTransactions,
  type InventoryTransactions,
  type GetInventoryTransactionsQuery,
  type ListInventoryTransactionsQuery,
  type InventoryTransactionsEntity,
} from './inventory-transactions.types';

export interface InventoryTransactionsListQuery extends BaseListQuery {
  // Smart field-based filters for InventoryTransactions
  inventory_id?: number;
  inventory_id_min?: number;
  inventory_id_max?: number;
  quantity?: number;
  quantity_min?: number;
  quantity_max?: number;
  unit_cost?: number;
  unit_cost_min?: number;
  unit_cost_max?: number;
  reference_id?: number;
  reference_id_min?: number;
  reference_id_max?: number;
  reference_type?: string;
  notes?: string;
  created_by?: string;
}

export class InventoryTransactionsRepository extends BaseRepository<
  InventoryTransactions,
  CreateInventoryTransactions,
  UpdateInventoryTransactions
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.inventory_transactions',
      [
        // Define searchable fields based on intelligent detection
        'inventory.inventory_transactions.notes',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: false,
        hasCreatedBy: true,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): InventoryTransactions {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      inventory_id: dbRow.inventory_id,
      transaction_type: dbRow.transaction_type,
      quantity: dbRow.quantity,
      unit_cost: dbRow.unit_cost,
      reference_id: dbRow.reference_id,
      reference_type: dbRow.reference_type,
      notes: dbRow.notes,
      created_by: dbRow.created_by,
      created_at: dbRow.created_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateInventoryTransactions | UpdateInventoryTransactions,
  ): Partial<InventoryTransactionsEntity> {
    const transformed: Partial<InventoryTransactionsEntity> = {};

    if ('inventory_id' in dto && dto.inventory_id !== undefined) {
      transformed.inventory_id = dto.inventory_id;
    }
    if ('transaction_type' in dto && dto.transaction_type !== undefined) {
      transformed.transaction_type = dto.transaction_type;
    }
    if ('quantity' in dto && dto.quantity !== undefined) {
      transformed.quantity = dto.quantity;
    }
    if ('unit_cost' in dto && dto.unit_cost !== undefined) {
      transformed.unit_cost = dto.unit_cost;
    }
    if ('reference_id' in dto && dto.reference_id !== undefined) {
      transformed.reference_id = dto.reference_id;
    }
    if ('reference_type' in dto && dto.reference_type !== undefined) {
      transformed.reference_type = dto.reference_type;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    if ('created_by' in dto && dto.created_by !== undefined) {
      transformed.created_by = dto.created_by;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.inventory_transactions').select(
      'inventory.inventory_transactions.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.inventory_transactions.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: InventoryTransactionsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific InventoryTransactions filters based on intelligent field categorization
    if (filters.inventory_id !== undefined) {
      query.where(
        'inventory.inventory_transactions.inventory_id',
        filters.inventory_id,
      );
    }
    if (filters.inventory_id_min !== undefined) {
      query.where(
        'inventory.inventory_transactions.inventory_id',
        '>=',
        filters.inventory_id_min,
      );
    }
    if (filters.inventory_id_max !== undefined) {
      query.where(
        'inventory.inventory_transactions.inventory_id',
        '<=',
        filters.inventory_id_max,
      );
    }
    if (filters.quantity !== undefined) {
      query.where(
        'inventory.inventory_transactions.quantity',
        filters.quantity,
      );
    }
    if (filters.quantity_min !== undefined) {
      query.where(
        'inventory.inventory_transactions.quantity',
        '>=',
        filters.quantity_min,
      );
    }
    if (filters.quantity_max !== undefined) {
      query.where(
        'inventory.inventory_transactions.quantity',
        '<=',
        filters.quantity_max,
      );
    }
    if (filters.unit_cost !== undefined) {
      query.where(
        'inventory.inventory_transactions.unit_cost',
        filters.unit_cost,
      );
    }
    if (filters.unit_cost_min !== undefined) {
      query.where(
        'inventory.inventory_transactions.unit_cost',
        '>=',
        filters.unit_cost_min,
      );
    }
    if (filters.unit_cost_max !== undefined) {
      query.where(
        'inventory.inventory_transactions.unit_cost',
        '<=',
        filters.unit_cost_max,
      );
    }
    if (filters.reference_id !== undefined) {
      query.where(
        'inventory.inventory_transactions.reference_id',
        filters.reference_id,
      );
    }
    if (filters.reference_id_min !== undefined) {
      query.where(
        'inventory.inventory_transactions.reference_id',
        '>=',
        filters.reference_id_min,
      );
    }
    if (filters.reference_id_max !== undefined) {
      query.where(
        'inventory.inventory_transactions.reference_id',
        '<=',
        filters.reference_id_max,
      );
    }
    if (filters.reference_type !== undefined) {
      query.where(
        'inventory.inventory_transactions.reference_type',
        filters.reference_type,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.inventory_transactions.notes', filters.notes);
    }
    if (filters.created_by !== undefined) {
      query.where(
        'inventory.inventory_transactions.created_by',
        filters.created_by,
      );
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
      id: 'inventory.inventory_transactions.id',
      inventoryId: 'inventory.inventory_transactions.inventory_id',
      transactionType: 'inventory.inventory_transactions.transaction_type',
      quantity: 'inventory.inventory_transactions.quantity',
      unitCost: 'inventory.inventory_transactions.unit_cost',
      referenceId: 'inventory.inventory_transactions.reference_id',
      referenceType: 'inventory.inventory_transactions.reference_type',
      notes: 'inventory.inventory_transactions.notes',
      createdBy: 'inventory.inventory_transactions.created_by',
      createdAt: 'inventory.inventory_transactions.created_at',
    };

    return sortFields[sortBy] || 'inventory.inventory_transactions.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetInventoryTransactionsQuery = {},
  ): Promise<InventoryTransactions | null> {
    let query = this.getJoinQuery();
    query = query.where('inventory_transactions.id', id);

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
    query: InventoryTransactionsListQuery = {},
  ): Promise<PaginatedListResult<InventoryTransactions>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.inventory_transactions')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateInventoryTransactions[],
  ): Promise<InventoryTransactions[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.inventory_transactions')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateInventoryTransactions,
  ): Promise<InventoryTransactions> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.inventory_transactions')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
