import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateContractItems,
  type UpdateContractItems,
  type ContractItems,
  type GetContractItemsQuery,
  type ListContractItemsQuery,
  type ContractItemsEntity,
} from './contract-items.types';

export interface ContractItemsListQuery extends BaseListQuery {
  // Smart field-based filters for ContractItems
  contract_id?: number;
  contract_id_min?: number;
  contract_id_max?: number;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  agreed_unit_price?: number;
  agreed_unit_price_min?: number;
  agreed_unit_price_max?: number;
  quantity_limit?: number;
  quantity_limit_min?: number;
  quantity_limit_max?: number;
  quantity_used?: number;
  quantity_used_min?: number;
  quantity_used_max?: number;
  notes?: string;
}

export class ContractItemsRepository extends BaseRepository<
  ContractItems,
  CreateContractItems,
  UpdateContractItems
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.contract_items',
      [
        // Define searchable fields based on intelligent detection
        'inventory.contract_items.notes',
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
  transformToEntity(dbRow: any): ContractItems {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      contract_id: dbRow.contract_id,
      generic_id: dbRow.generic_id,
      agreed_unit_price: dbRow.agreed_unit_price,
      quantity_limit: dbRow.quantity_limit,
      quantity_used: dbRow.quantity_used,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateContractItems | UpdateContractItems,
  ): Partial<ContractItemsEntity> {
    const transformed: Partial<ContractItemsEntity> = {};

    if ('contract_id' in dto && dto.contract_id !== undefined) {
      transformed.contract_id = dto.contract_id;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('agreed_unit_price' in dto && dto.agreed_unit_price !== undefined) {
      transformed.agreed_unit_price = dto.agreed_unit_price;
    }
    if ('quantity_limit' in dto && dto.quantity_limit !== undefined) {
      transformed.quantity_limit = dto.quantity_limit;
    }
    if ('quantity_used' in dto && dto.quantity_used !== undefined) {
      transformed.quantity_used = dto.quantity_used;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.contract_items').select(
      'inventory.contract_items.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.contract_items.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: ContractItemsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific ContractItems filters based on intelligent field categorization
    if (filters.contract_id !== undefined) {
      query.where('inventory.contract_items.contract_id', filters.contract_id);
    }
    if (filters.contract_id_min !== undefined) {
      query.where(
        'inventory.contract_items.contract_id',
        '>=',
        filters.contract_id_min,
      );
    }
    if (filters.contract_id_max !== undefined) {
      query.where(
        'inventory.contract_items.contract_id',
        '<=',
        filters.contract_id_max,
      );
    }
    if (filters.generic_id !== undefined) {
      query.where('inventory.contract_items.generic_id', filters.generic_id);
    }
    if (filters.generic_id_min !== undefined) {
      query.where(
        'inventory.contract_items.generic_id',
        '>=',
        filters.generic_id_min,
      );
    }
    if (filters.generic_id_max !== undefined) {
      query.where(
        'inventory.contract_items.generic_id',
        '<=',
        filters.generic_id_max,
      );
    }
    if (filters.agreed_unit_price !== undefined) {
      query.where(
        'inventory.contract_items.agreed_unit_price',
        filters.agreed_unit_price,
      );
    }
    if (filters.agreed_unit_price_min !== undefined) {
      query.where(
        'inventory.contract_items.agreed_unit_price',
        '>=',
        filters.agreed_unit_price_min,
      );
    }
    if (filters.agreed_unit_price_max !== undefined) {
      query.where(
        'inventory.contract_items.agreed_unit_price',
        '<=',
        filters.agreed_unit_price_max,
      );
    }
    if (filters.quantity_limit !== undefined) {
      query.where(
        'inventory.contract_items.quantity_limit',
        filters.quantity_limit,
      );
    }
    if (filters.quantity_limit_min !== undefined) {
      query.where(
        'inventory.contract_items.quantity_limit',
        '>=',
        filters.quantity_limit_min,
      );
    }
    if (filters.quantity_limit_max !== undefined) {
      query.where(
        'inventory.contract_items.quantity_limit',
        '<=',
        filters.quantity_limit_max,
      );
    }
    if (filters.quantity_used !== undefined) {
      query.where(
        'inventory.contract_items.quantity_used',
        filters.quantity_used,
      );
    }
    if (filters.quantity_used_min !== undefined) {
      query.where(
        'inventory.contract_items.quantity_used',
        '>=',
        filters.quantity_used_min,
      );
    }
    if (filters.quantity_used_max !== undefined) {
      query.where(
        'inventory.contract_items.quantity_used',
        '<=',
        filters.quantity_used_max,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.contract_items.notes', filters.notes);
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
      id: 'inventory.contract_items.id',
      contractId: 'inventory.contract_items.contract_id',
      genericId: 'inventory.contract_items.generic_id',
      agreedUnitPrice: 'inventory.contract_items.agreed_unit_price',
      quantityLimit: 'inventory.contract_items.quantity_limit',
      quantityUsed: 'inventory.contract_items.quantity_used',
      notes: 'inventory.contract_items.notes',
      createdAt: 'inventory.contract_items.created_at',
      updatedAt: 'inventory.contract_items.updated_at',
    };

    return sortFields[sortBy] || 'inventory.contract_items.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetContractItemsQuery = {},
  ): Promise<ContractItems | null> {
    let query = this.getJoinQuery();
    query = query.where('contract_items.id', id);

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
    query: ContractItemsListQuery = {},
  ): Promise<PaginatedListResult<ContractItems>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.contract_items')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateContractItems[]): Promise<ContractItems[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.contract_items')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateContractItems,
  ): Promise<ContractItems> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.contract_items')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
