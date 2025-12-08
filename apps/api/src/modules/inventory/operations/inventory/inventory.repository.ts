import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateInventory,
  type UpdateInventory,
  type Inventory,
  type GetInventoryQuery,
  type ListInventoryQuery,
  type InventoryEntity,
} from './inventory.types';

export interface InventoryListQuery extends BaseListQuery {
  // Smart field-based filters for Inventory
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  location_id?: number;
  location_id_min?: number;
  location_id_max?: number;
  quantity_on_hand?: number;
  quantity_on_hand_min?: number;
  quantity_on_hand_max?: number;
  min_level?: number;
  min_level_min?: number;
  min_level_max?: number;
  max_level?: number;
  max_level_min?: number;
  max_level_max?: number;
  reorder_point?: number;
  reorder_point_min?: number;
  reorder_point_max?: number;
  average_cost?: number;
  average_cost_min?: number;
  average_cost_max?: number;
  last_cost?: number;
  last_cost_min?: number;
  last_cost_max?: number;
}

export class InventoryRepository extends BaseRepository<
  Inventory,
  CreateInventory,
  UpdateInventory
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.inventory',
      [
        // Define searchable fields based on intelligent detection
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
  transformToEntity(dbRow: any): Inventory {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      drug_id: dbRow.drug_id,
      location_id: dbRow.location_id,
      quantity_on_hand: dbRow.quantity_on_hand,
      min_level: dbRow.min_level,
      max_level: dbRow.max_level,
      reorder_point: dbRow.reorder_point,
      average_cost: dbRow.average_cost,
      last_cost: dbRow.last_cost,
      last_updated: dbRow.last_updated,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateInventory | UpdateInventory,
  ): Partial<InventoryEntity> {
    const transformed: Partial<InventoryEntity> = {};

    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('location_id' in dto && dto.location_id !== undefined) {
      transformed.location_id = dto.location_id;
    }
    if ('quantity_on_hand' in dto && dto.quantity_on_hand !== undefined) {
      transformed.quantity_on_hand = dto.quantity_on_hand;
    }
    if ('min_level' in dto && dto.min_level !== undefined) {
      transformed.min_level = dto.min_level;
    }
    if ('max_level' in dto && dto.max_level !== undefined) {
      transformed.max_level = dto.max_level;
    }
    if ('reorder_point' in dto && dto.reorder_point !== undefined) {
      transformed.reorder_point = dto.reorder_point;
    }
    if ('average_cost' in dto && dto.average_cost !== undefined) {
      transformed.average_cost = dto.average_cost;
    }
    if ('last_cost' in dto && dto.last_cost !== undefined) {
      transformed.last_cost = dto.last_cost;
    }
    if ('last_updated' in dto && dto.last_updated !== undefined) {
      transformed.last_updated =
        typeof dto.last_updated === 'string'
          ? new Date(dto.last_updated)
          : dto.last_updated;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.inventory').select('inventory.inventory.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.inventory.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: InventoryListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Inventory filters based on intelligent field categorization
    if (filters.drug_id !== undefined) {
      query.where('inventory.inventory.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where('inventory.inventory.drug_id', '>=', filters.drug_id_min);
    }
    if (filters.drug_id_max !== undefined) {
      query.where('inventory.inventory.drug_id', '<=', filters.drug_id_max);
    }
    if (filters.location_id !== undefined) {
      query.where('inventory.inventory.location_id', filters.location_id);
    }
    if (filters.location_id_min !== undefined) {
      query.where(
        'inventory.inventory.location_id',
        '>=',
        filters.location_id_min,
      );
    }
    if (filters.location_id_max !== undefined) {
      query.where(
        'inventory.inventory.location_id',
        '<=',
        filters.location_id_max,
      );
    }
    if (filters.quantity_on_hand !== undefined) {
      query.where(
        'inventory.inventory.quantity_on_hand',
        filters.quantity_on_hand,
      );
    }
    if (filters.quantity_on_hand_min !== undefined) {
      query.where(
        'inventory.inventory.quantity_on_hand',
        '>=',
        filters.quantity_on_hand_min,
      );
    }
    if (filters.quantity_on_hand_max !== undefined) {
      query.where(
        'inventory.inventory.quantity_on_hand',
        '<=',
        filters.quantity_on_hand_max,
      );
    }
    if (filters.min_level !== undefined) {
      query.where('inventory.inventory.min_level', filters.min_level);
    }
    if (filters.min_level_min !== undefined) {
      query.where('inventory.inventory.min_level', '>=', filters.min_level_min);
    }
    if (filters.min_level_max !== undefined) {
      query.where('inventory.inventory.min_level', '<=', filters.min_level_max);
    }
    if (filters.max_level !== undefined) {
      query.where('inventory.inventory.max_level', filters.max_level);
    }
    if (filters.max_level_min !== undefined) {
      query.where('inventory.inventory.max_level', '>=', filters.max_level_min);
    }
    if (filters.max_level_max !== undefined) {
      query.where('inventory.inventory.max_level', '<=', filters.max_level_max);
    }
    if (filters.reorder_point !== undefined) {
      query.where('inventory.inventory.reorder_point', filters.reorder_point);
    }
    if (filters.reorder_point_min !== undefined) {
      query.where(
        'inventory.inventory.reorder_point',
        '>=',
        filters.reorder_point_min,
      );
    }
    if (filters.reorder_point_max !== undefined) {
      query.where(
        'inventory.inventory.reorder_point',
        '<=',
        filters.reorder_point_max,
      );
    }
    if (filters.average_cost !== undefined) {
      query.where('inventory.inventory.average_cost', filters.average_cost);
    }
    if (filters.average_cost_min !== undefined) {
      query.where(
        'inventory.inventory.average_cost',
        '>=',
        filters.average_cost_min,
      );
    }
    if (filters.average_cost_max !== undefined) {
      query.where(
        'inventory.inventory.average_cost',
        '<=',
        filters.average_cost_max,
      );
    }
    if (filters.last_cost !== undefined) {
      query.where('inventory.inventory.last_cost', filters.last_cost);
    }
    if (filters.last_cost_min !== undefined) {
      query.where('inventory.inventory.last_cost', '>=', filters.last_cost_min);
    }
    if (filters.last_cost_max !== undefined) {
      query.where('inventory.inventory.last_cost', '<=', filters.last_cost_max);
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
      id: 'inventory.inventory.id',
      drugId: 'inventory.inventory.drug_id',
      locationId: 'inventory.inventory.location_id',
      quantityOnHand: 'inventory.inventory.quantity_on_hand',
      minLevel: 'inventory.inventory.min_level',
      maxLevel: 'inventory.inventory.max_level',
      reorderPoint: 'inventory.inventory.reorder_point',
      averageCost: 'inventory.inventory.average_cost',
      lastCost: 'inventory.inventory.last_cost',
      lastUpdated: 'inventory.inventory.last_updated',
      createdAt: 'inventory.inventory.created_at',
      updatedAt: 'inventory.inventory.updated_at',
    };

    return sortFields[sortBy] || 'inventory.inventory.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetInventoryQuery = {},
  ): Promise<Inventory | null> {
    let query = this.getJoinQuery();
    query = query.where('inventory.id', id);

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
    query: InventoryListQuery = {},
  ): Promise<PaginatedListResult<Inventory>> {
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

    // Check inventory_transactions references
    const inventoryTransactionsCount = await this.knex('inventory_transactions')
      .where('inventory_id', id)
      .count('* as count')
      .first();

    if (parseInt((inventoryTransactionsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'inventory_transactions',
        field: 'inventory_id',
        count: parseInt((inventoryTransactionsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.inventory')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateInventory[]): Promise<Inventory[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.inventory')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateInventory): Promise<Inventory> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.inventory')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
