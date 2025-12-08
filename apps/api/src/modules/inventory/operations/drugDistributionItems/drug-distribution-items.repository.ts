import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugDistributionItems,
  type UpdateDrugDistributionItems,
  type DrugDistributionItems,
  type GetDrugDistributionItemsQuery,
  type ListDrugDistributionItemsQuery,
  type DrugDistributionItemsEntity,
} from './drug-distribution-items.types';

export interface DrugDistributionItemsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugDistributionItems
  distribution_id?: number;
  distribution_id_min?: number;
  distribution_id_max?: number;
  item_number?: number;
  item_number_min?: number;
  item_number_max?: number;
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  lot_number?: string;
  quantity_dispensed?: number;
  quantity_dispensed_min?: number;
  quantity_dispensed_max?: number;
  unit_cost?: number;
  unit_cost_min?: number;
  unit_cost_max?: number;
}

export class DrugDistributionItemsRepository extends BaseRepository<
  DrugDistributionItems,
  CreateDrugDistributionItems,
  UpdateDrugDistributionItems
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drug_distribution_items',
      [
        // Define searchable fields based on intelligent detection
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
  transformToEntity(dbRow: any): DrugDistributionItems {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      distribution_id: dbRow.distribution_id,
      item_number: dbRow.item_number,
      drug_id: dbRow.drug_id,
      lot_number: dbRow.lot_number,
      quantity_dispensed: dbRow.quantity_dispensed,
      unit_cost: dbRow.unit_cost,
      expiry_date: dbRow.expiry_date,
      created_at: dbRow.created_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugDistributionItems | UpdateDrugDistributionItems,
  ): Partial<DrugDistributionItemsEntity> {
    const transformed: Partial<DrugDistributionItemsEntity> = {};

    if ('distribution_id' in dto && dto.distribution_id !== undefined) {
      transformed.distribution_id = dto.distribution_id;
    }
    if ('item_number' in dto && dto.item_number !== undefined) {
      transformed.item_number = dto.item_number;
    }
    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('lot_number' in dto && dto.lot_number !== undefined) {
      transformed.lot_number = dto.lot_number;
    }
    if ('quantity_dispensed' in dto && dto.quantity_dispensed !== undefined) {
      transformed.quantity_dispensed = dto.quantity_dispensed;
    }
    if ('unit_cost' in dto && dto.unit_cost !== undefined) {
      transformed.unit_cost = dto.unit_cost;
    }
    if ('expiry_date' in dto && dto.expiry_date !== undefined) {
      transformed.expiry_date =
        typeof dto.expiry_date === 'string'
          ? new Date(dto.expiry_date)
          : dto.expiry_date;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drug_distribution_items').select(
      'inventory.drug_distribution_items.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drug_distribution_items.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugDistributionItemsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugDistributionItems filters based on intelligent field categorization
    if (filters.distribution_id !== undefined) {
      query.where(
        'inventory.drug_distribution_items.distribution_id',
        filters.distribution_id,
      );
    }
    if (filters.distribution_id_min !== undefined) {
      query.where(
        'inventory.drug_distribution_items.distribution_id',
        '>=',
        filters.distribution_id_min,
      );
    }
    if (filters.distribution_id_max !== undefined) {
      query.where(
        'inventory.drug_distribution_items.distribution_id',
        '<=',
        filters.distribution_id_max,
      );
    }
    if (filters.item_number !== undefined) {
      query.where(
        'inventory.drug_distribution_items.item_number',
        filters.item_number,
      );
    }
    if (filters.item_number_min !== undefined) {
      query.where(
        'inventory.drug_distribution_items.item_number',
        '>=',
        filters.item_number_min,
      );
    }
    if (filters.item_number_max !== undefined) {
      query.where(
        'inventory.drug_distribution_items.item_number',
        '<=',
        filters.item_number_max,
      );
    }
    if (filters.drug_id !== undefined) {
      query.where('inventory.drug_distribution_items.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where(
        'inventory.drug_distribution_items.drug_id',
        '>=',
        filters.drug_id_min,
      );
    }
    if (filters.drug_id_max !== undefined) {
      query.where(
        'inventory.drug_distribution_items.drug_id',
        '<=',
        filters.drug_id_max,
      );
    }
    if (filters.lot_number !== undefined) {
      query.where(
        'inventory.drug_distribution_items.lot_number',
        filters.lot_number,
      );
    }
    if (filters.quantity_dispensed !== undefined) {
      query.where(
        'inventory.drug_distribution_items.quantity_dispensed',
        filters.quantity_dispensed,
      );
    }
    if (filters.quantity_dispensed_min !== undefined) {
      query.where(
        'inventory.drug_distribution_items.quantity_dispensed',
        '>=',
        filters.quantity_dispensed_min,
      );
    }
    if (filters.quantity_dispensed_max !== undefined) {
      query.where(
        'inventory.drug_distribution_items.quantity_dispensed',
        '<=',
        filters.quantity_dispensed_max,
      );
    }
    if (filters.unit_cost !== undefined) {
      query.where(
        'inventory.drug_distribution_items.unit_cost',
        filters.unit_cost,
      );
    }
    if (filters.unit_cost_min !== undefined) {
      query.where(
        'inventory.drug_distribution_items.unit_cost',
        '>=',
        filters.unit_cost_min,
      );
    }
    if (filters.unit_cost_max !== undefined) {
      query.where(
        'inventory.drug_distribution_items.unit_cost',
        '<=',
        filters.unit_cost_max,
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
      id: 'inventory.drug_distribution_items.id',
      distributionId: 'inventory.drug_distribution_items.distribution_id',
      itemNumber: 'inventory.drug_distribution_items.item_number',
      drugId: 'inventory.drug_distribution_items.drug_id',
      lotNumber: 'inventory.drug_distribution_items.lot_number',
      quantityDispensed: 'inventory.drug_distribution_items.quantity_dispensed',
      unitCost: 'inventory.drug_distribution_items.unit_cost',
      expiryDate: 'inventory.drug_distribution_items.expiry_date',
      createdAt: 'inventory.drug_distribution_items.created_at',
    };

    return sortFields[sortBy] || 'inventory.drug_distribution_items.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugDistributionItemsQuery = {},
  ): Promise<DrugDistributionItems | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_distribution_items.id', id);

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
    query: DrugDistributionItemsListQuery = {},
  ): Promise<PaginatedListResult<DrugDistributionItems>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.drug_distribution_items')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateDrugDistributionItems[],
  ): Promise<DrugDistributionItems[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drug_distribution_items')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateDrugDistributionItems,
  ): Promise<DrugDistributionItems> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drug_distribution_items')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
