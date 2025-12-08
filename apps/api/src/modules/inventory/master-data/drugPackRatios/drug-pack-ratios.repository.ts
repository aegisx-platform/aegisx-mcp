import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugPackRatios,
  type UpdateDrugPackRatios,
  type DrugPackRatios,
  type GetDrugPackRatiosQuery,
  type ListDrugPackRatiosQuery,
  type DrugPackRatiosEntity,
} from './drug-pack-ratios.types';

export interface DrugPackRatiosListQuery extends BaseListQuery {
  // Smart field-based filters for DrugPackRatios
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  company_id?: number;
  company_id_min?: number;
  company_id_max?: number;
  pack_size?: number;
  pack_size_min?: number;
  pack_size_max?: number;
  pack_unit?: string;
  unit_per_pack?: number;
  unit_per_pack_min?: number;
  unit_per_pack_max?: number;
  pack_price?: number;
  pack_price_min?: number;
  pack_price_max?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export class DrugPackRatiosRepository extends BaseRepository<
  DrugPackRatios,
  CreateDrugPackRatios,
  UpdateDrugPackRatios
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drug_pack_ratios',
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
  transformToEntity(dbRow: any): DrugPackRatios {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      drug_id: dbRow.drug_id,
      company_id: dbRow.company_id,
      pack_size: dbRow.pack_size,
      pack_unit: dbRow.pack_unit,
      unit_per_pack: dbRow.unit_per_pack,
      pack_price: dbRow.pack_price,
      is_default: dbRow.is_default,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugPackRatios | UpdateDrugPackRatios,
  ): Partial<DrugPackRatiosEntity> {
    const transformed: Partial<DrugPackRatiosEntity> = {};

    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('company_id' in dto && dto.company_id !== undefined) {
      transformed.company_id = dto.company_id;
    }
    if ('pack_size' in dto && dto.pack_size !== undefined) {
      transformed.pack_size = dto.pack_size;
    }
    if ('pack_unit' in dto && dto.pack_unit !== undefined) {
      transformed.pack_unit = dto.pack_unit;
    }
    if ('unit_per_pack' in dto && dto.unit_per_pack !== undefined) {
      transformed.unit_per_pack = dto.unit_per_pack;
    }
    if ('pack_price' in dto && dto.pack_price !== undefined) {
      transformed.pack_price = dto.pack_price;
    }
    if ('is_default' in dto && dto.is_default !== undefined) {
      transformed.is_default = dto.is_default;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drug_pack_ratios').select(
      'inventory.drug_pack_ratios.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drug_pack_ratios.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugPackRatiosListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugPackRatios filters based on intelligent field categorization
    if (filters.drug_id !== undefined) {
      query.where('inventory.drug_pack_ratios.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.drug_id',
        '>=',
        filters.drug_id_min,
      );
    }
    if (filters.drug_id_max !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.drug_id',
        '<=',
        filters.drug_id_max,
      );
    }
    if (filters.company_id !== undefined) {
      query.where('inventory.drug_pack_ratios.company_id', filters.company_id);
    }
    if (filters.company_id_min !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.company_id',
        '>=',
        filters.company_id_min,
      );
    }
    if (filters.company_id_max !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.company_id',
        '<=',
        filters.company_id_max,
      );
    }
    if (filters.pack_size !== undefined) {
      query.where('inventory.drug_pack_ratios.pack_size', filters.pack_size);
    }
    if (filters.pack_size_min !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.pack_size',
        '>=',
        filters.pack_size_min,
      );
    }
    if (filters.pack_size_max !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.pack_size',
        '<=',
        filters.pack_size_max,
      );
    }
    if (filters.pack_unit !== undefined) {
      query.where('inventory.drug_pack_ratios.pack_unit', filters.pack_unit);
    }
    if (filters.unit_per_pack !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.unit_per_pack',
        filters.unit_per_pack,
      );
    }
    if (filters.unit_per_pack_min !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.unit_per_pack',
        '>=',
        filters.unit_per_pack_min,
      );
    }
    if (filters.unit_per_pack_max !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.unit_per_pack',
        '<=',
        filters.unit_per_pack_max,
      );
    }
    if (filters.pack_price !== undefined) {
      query.where('inventory.drug_pack_ratios.pack_price', filters.pack_price);
    }
    if (filters.pack_price_min !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.pack_price',
        '>=',
        filters.pack_price_min,
      );
    }
    if (filters.pack_price_max !== undefined) {
      query.where(
        'inventory.drug_pack_ratios.pack_price',
        '<=',
        filters.pack_price_max,
      );
    }
    if (filters.is_default !== undefined) {
      query.where('inventory.drug_pack_ratios.is_default', filters.is_default);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.drug_pack_ratios.is_active', filters.is_active);
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
      id: 'inventory.drug_pack_ratios.id',
      drugId: 'inventory.drug_pack_ratios.drug_id',
      companyId: 'inventory.drug_pack_ratios.company_id',
      packSize: 'inventory.drug_pack_ratios.pack_size',
      packUnit: 'inventory.drug_pack_ratios.pack_unit',
      unitPerPack: 'inventory.drug_pack_ratios.unit_per_pack',
      packPrice: 'inventory.drug_pack_ratios.pack_price',
      isDefault: 'inventory.drug_pack_ratios.is_default',
      isActive: 'inventory.drug_pack_ratios.is_active',
      createdAt: 'inventory.drug_pack_ratios.created_at',
      updatedAt: 'inventory.drug_pack_ratios.updated_at',
    };

    return sortFields[sortBy] || 'inventory.drug_pack_ratios.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugPackRatiosQuery = {},
  ): Promise<DrugPackRatios | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_pack_ratios.id', id);

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
    query: DrugPackRatiosListQuery = {},
  ): Promise<PaginatedListResult<DrugPackRatios>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.drug_pack_ratios')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugPackRatios[]): Promise<DrugPackRatios[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drug_pack_ratios')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateDrugPackRatios,
  ): Promise<DrugPackRatios> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drug_pack_ratios')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
