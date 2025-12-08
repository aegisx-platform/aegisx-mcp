import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugReturnItems,
  type UpdateDrugReturnItems,
  type DrugReturnItems,
  type GetDrugReturnItemsQuery,
  type ListDrugReturnItemsQuery,
  type DrugReturnItemsEntity,
} from './drug-return-items.types';

export interface DrugReturnItemsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugReturnItems
  return_id?: number;
  return_id_min?: number;
  return_id_max?: number;
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  total_quantity?: number;
  total_quantity_min?: number;
  total_quantity_max?: number;
  good_quantity?: number;
  good_quantity_min?: number;
  good_quantity_max?: number;
  damaged_quantity?: number;
  damaged_quantity_min?: number;
  damaged_quantity_max?: number;
  lot_number?: string;
  location_id?: number;
  location_id_min?: number;
  location_id_max?: number;
  action_id?: number;
  action_id_min?: number;
  action_id_max?: number;
  notes?: string;
}

export class DrugReturnItemsRepository extends BaseRepository<
  DrugReturnItems,
  CreateDrugReturnItems,
  UpdateDrugReturnItems
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drug_return_items',
      [
        // Define searchable fields based on intelligent detection
        'inventory.drug_return_items.notes',
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
  transformToEntity(dbRow: any): DrugReturnItems {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      return_id: dbRow.return_id,
      drug_id: dbRow.drug_id,
      total_quantity: dbRow.total_quantity,
      good_quantity: dbRow.good_quantity,
      damaged_quantity: dbRow.damaged_quantity,
      lot_number: dbRow.lot_number,
      expiry_date: dbRow.expiry_date,
      return_type: dbRow.return_type,
      location_id: dbRow.location_id,
      action_id: dbRow.action_id,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugReturnItems | UpdateDrugReturnItems,
  ): Partial<DrugReturnItemsEntity> {
    const transformed: Partial<DrugReturnItemsEntity> = {};

    if ('return_id' in dto && dto.return_id !== undefined) {
      transformed.return_id = dto.return_id;
    }
    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('total_quantity' in dto && dto.total_quantity !== undefined) {
      transformed.total_quantity = dto.total_quantity;
    }
    if ('good_quantity' in dto && dto.good_quantity !== undefined) {
      transformed.good_quantity = dto.good_quantity;
    }
    if ('damaged_quantity' in dto && dto.damaged_quantity !== undefined) {
      transformed.damaged_quantity = dto.damaged_quantity;
    }
    if ('lot_number' in dto && dto.lot_number !== undefined) {
      transformed.lot_number = dto.lot_number;
    }
    if ('expiry_date' in dto && dto.expiry_date !== undefined) {
      transformed.expiry_date =
        typeof dto.expiry_date === 'string'
          ? new Date(dto.expiry_date)
          : dto.expiry_date;
    }
    if ('return_type' in dto && dto.return_type !== undefined) {
      transformed.return_type = dto.return_type;
    }
    if ('location_id' in dto && dto.location_id !== undefined) {
      transformed.location_id = dto.location_id;
    }
    if ('action_id' in dto && dto.action_id !== undefined) {
      transformed.action_id = dto.action_id;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drug_return_items').select(
      'inventory.drug_return_items.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drug_return_items.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugReturnItemsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugReturnItems filters based on intelligent field categorization
    if (filters.return_id !== undefined) {
      query.where('inventory.drug_return_items.return_id', filters.return_id);
    }
    if (filters.return_id_min !== undefined) {
      query.where(
        'inventory.drug_return_items.return_id',
        '>=',
        filters.return_id_min,
      );
    }
    if (filters.return_id_max !== undefined) {
      query.where(
        'inventory.drug_return_items.return_id',
        '<=',
        filters.return_id_max,
      );
    }
    if (filters.drug_id !== undefined) {
      query.where('inventory.drug_return_items.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where(
        'inventory.drug_return_items.drug_id',
        '>=',
        filters.drug_id_min,
      );
    }
    if (filters.drug_id_max !== undefined) {
      query.where(
        'inventory.drug_return_items.drug_id',
        '<=',
        filters.drug_id_max,
      );
    }
    if (filters.total_quantity !== undefined) {
      query.where(
        'inventory.drug_return_items.total_quantity',
        filters.total_quantity,
      );
    }
    if (filters.total_quantity_min !== undefined) {
      query.where(
        'inventory.drug_return_items.total_quantity',
        '>=',
        filters.total_quantity_min,
      );
    }
    if (filters.total_quantity_max !== undefined) {
      query.where(
        'inventory.drug_return_items.total_quantity',
        '<=',
        filters.total_quantity_max,
      );
    }
    if (filters.good_quantity !== undefined) {
      query.where(
        'inventory.drug_return_items.good_quantity',
        filters.good_quantity,
      );
    }
    if (filters.good_quantity_min !== undefined) {
      query.where(
        'inventory.drug_return_items.good_quantity',
        '>=',
        filters.good_quantity_min,
      );
    }
    if (filters.good_quantity_max !== undefined) {
      query.where(
        'inventory.drug_return_items.good_quantity',
        '<=',
        filters.good_quantity_max,
      );
    }
    if (filters.damaged_quantity !== undefined) {
      query.where(
        'inventory.drug_return_items.damaged_quantity',
        filters.damaged_quantity,
      );
    }
    if (filters.damaged_quantity_min !== undefined) {
      query.where(
        'inventory.drug_return_items.damaged_quantity',
        '>=',
        filters.damaged_quantity_min,
      );
    }
    if (filters.damaged_quantity_max !== undefined) {
      query.where(
        'inventory.drug_return_items.damaged_quantity',
        '<=',
        filters.damaged_quantity_max,
      );
    }
    if (filters.lot_number !== undefined) {
      query.where('inventory.drug_return_items.lot_number', filters.lot_number);
    }
    if (filters.location_id !== undefined) {
      query.where(
        'inventory.drug_return_items.location_id',
        filters.location_id,
      );
    }
    if (filters.location_id_min !== undefined) {
      query.where(
        'inventory.drug_return_items.location_id',
        '>=',
        filters.location_id_min,
      );
    }
    if (filters.location_id_max !== undefined) {
      query.where(
        'inventory.drug_return_items.location_id',
        '<=',
        filters.location_id_max,
      );
    }
    if (filters.action_id !== undefined) {
      query.where('inventory.drug_return_items.action_id', filters.action_id);
    }
    if (filters.action_id_min !== undefined) {
      query.where(
        'inventory.drug_return_items.action_id',
        '>=',
        filters.action_id_min,
      );
    }
    if (filters.action_id_max !== undefined) {
      query.where(
        'inventory.drug_return_items.action_id',
        '<=',
        filters.action_id_max,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.drug_return_items.notes', filters.notes);
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
      id: 'inventory.drug_return_items.id',
      returnId: 'inventory.drug_return_items.return_id',
      drugId: 'inventory.drug_return_items.drug_id',
      totalQuantity: 'inventory.drug_return_items.total_quantity',
      goodQuantity: 'inventory.drug_return_items.good_quantity',
      damagedQuantity: 'inventory.drug_return_items.damaged_quantity',
      lotNumber: 'inventory.drug_return_items.lot_number',
      expiryDate: 'inventory.drug_return_items.expiry_date',
      returnType: 'inventory.drug_return_items.return_type',
      locationId: 'inventory.drug_return_items.location_id',
      actionId: 'inventory.drug_return_items.action_id',
      notes: 'inventory.drug_return_items.notes',
      createdAt: 'inventory.drug_return_items.created_at',
    };

    return sortFields[sortBy] || 'inventory.drug_return_items.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugReturnItemsQuery = {},
  ): Promise<DrugReturnItems | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_return_items.id', id);

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
    query: DrugReturnItemsListQuery = {},
  ): Promise<PaginatedListResult<DrugReturnItems>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.drug_return_items')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugReturnItems[]): Promise<DrugReturnItems[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drug_return_items')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateDrugReturnItems,
  ): Promise<DrugReturnItems> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drug_return_items')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
