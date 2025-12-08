import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugs,
  type UpdateDrugs,
  type Drugs,
  type GetDrugsQuery,
  type ListDrugsQuery,
  type DrugsEntity,
} from './drugs.types';

export interface DrugsListQuery extends BaseListQuery {
  // Smart field-based filters for Drugs
  drug_code?: string;
  trade_name?: string;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  manufacturer_id?: number;
  manufacturer_id_min?: number;
  manufacturer_id_max?: number;
  tmt_tpu_id?: number;
  tmt_tpu_id_min?: number;
  tmt_tpu_id_max?: number;
  unit_price?: number;
  unit_price_min?: number;
  unit_price_max?: number;
  package_size?: number;
  package_size_min?: number;
  package_size_max?: number;
  package_unit?: string;
  is_active?: boolean;
}

export class DrugsRepository extends BaseRepository<
  Drugs,
  CreateDrugs,
  UpdateDrugs
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drugs',
      [
        // Define searchable fields based on intelligent detection
        'inventory.drugs.trade_name',
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
  transformToEntity(dbRow: any): Drugs {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      drug_code: dbRow.drug_code,
      trade_name: dbRow.trade_name,
      generic_id: dbRow.generic_id,
      manufacturer_id: dbRow.manufacturer_id,
      tmt_tpu_id: dbRow.tmt_tpu_id,
      nlem_status: dbRow.nlem_status,
      drug_status: dbRow.drug_status,
      product_category: dbRow.product_category,
      status_changed_date: dbRow.status_changed_date,
      unit_price: dbRow.unit_price,
      package_size: dbRow.package_size,
      package_unit: dbRow.package_unit,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateDrugs | UpdateDrugs): Partial<DrugsEntity> {
    const transformed: Partial<DrugsEntity> = {};

    if ('drug_code' in dto && dto.drug_code !== undefined) {
      transformed.drug_code = dto.drug_code;
    }
    if ('trade_name' in dto && dto.trade_name !== undefined) {
      transformed.trade_name = dto.trade_name;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('manufacturer_id' in dto && dto.manufacturer_id !== undefined) {
      transformed.manufacturer_id = dto.manufacturer_id;
    }
    if ('tmt_tpu_id' in dto && dto.tmt_tpu_id !== undefined) {
      transformed.tmt_tpu_id = dto.tmt_tpu_id;
    }
    if ('nlem_status' in dto && dto.nlem_status !== undefined) {
      transformed.nlem_status = dto.nlem_status;
    }
    if ('drug_status' in dto && dto.drug_status !== undefined) {
      transformed.drug_status = dto.drug_status;
    }
    if ('product_category' in dto && dto.product_category !== undefined) {
      transformed.product_category = dto.product_category;
    }
    if ('status_changed_date' in dto && dto.status_changed_date !== undefined) {
      transformed.status_changed_date =
        typeof dto.status_changed_date === 'string'
          ? new Date(dto.status_changed_date)
          : dto.status_changed_date;
    }
    if ('unit_price' in dto && dto.unit_price !== undefined) {
      transformed.unit_price = dto.unit_price;
    }
    if ('package_size' in dto && dto.package_size !== undefined) {
      transformed.package_size = dto.package_size;
    }
    if ('package_unit' in dto && dto.package_unit !== undefined) {
      transformed.package_unit = dto.package_unit;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drugs').select('inventory.drugs.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drugs.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: DrugsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Drugs filters based on intelligent field categorization
    if (filters.drug_code !== undefined) {
      query.where('inventory.drugs.drug_code', filters.drug_code);
    }
    if (filters.trade_name !== undefined) {
      query.where('inventory.drugs.trade_name', filters.trade_name);
    }
    if (filters.generic_id !== undefined) {
      query.where('inventory.drugs.generic_id', filters.generic_id);
    }
    if (filters.generic_id_min !== undefined) {
      query.where('inventory.drugs.generic_id', '>=', filters.generic_id_min);
    }
    if (filters.generic_id_max !== undefined) {
      query.where('inventory.drugs.generic_id', '<=', filters.generic_id_max);
    }
    if (filters.manufacturer_id !== undefined) {
      query.where('inventory.drugs.manufacturer_id', filters.manufacturer_id);
    }
    if (filters.manufacturer_id_min !== undefined) {
      query.where(
        'inventory.drugs.manufacturer_id',
        '>=',
        filters.manufacturer_id_min,
      );
    }
    if (filters.manufacturer_id_max !== undefined) {
      query.where(
        'inventory.drugs.manufacturer_id',
        '<=',
        filters.manufacturer_id_max,
      );
    }
    if (filters.tmt_tpu_id !== undefined) {
      query.where('inventory.drugs.tmt_tpu_id', filters.tmt_tpu_id);
    }
    if (filters.tmt_tpu_id_min !== undefined) {
      query.where('inventory.drugs.tmt_tpu_id', '>=', filters.tmt_tpu_id_min);
    }
    if (filters.tmt_tpu_id_max !== undefined) {
      query.where('inventory.drugs.tmt_tpu_id', '<=', filters.tmt_tpu_id_max);
    }
    if (filters.unit_price !== undefined) {
      query.where('inventory.drugs.unit_price', filters.unit_price);
    }
    if (filters.unit_price_min !== undefined) {
      query.where('inventory.drugs.unit_price', '>=', filters.unit_price_min);
    }
    if (filters.unit_price_max !== undefined) {
      query.where('inventory.drugs.unit_price', '<=', filters.unit_price_max);
    }
    if (filters.package_size !== undefined) {
      query.where('inventory.drugs.package_size', filters.package_size);
    }
    if (filters.package_size_min !== undefined) {
      query.where(
        'inventory.drugs.package_size',
        '>=',
        filters.package_size_min,
      );
    }
    if (filters.package_size_max !== undefined) {
      query.where(
        'inventory.drugs.package_size',
        '<=',
        filters.package_size_max,
      );
    }
    if (filters.package_unit !== undefined) {
      query.where('inventory.drugs.package_unit', filters.package_unit);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.drugs.is_active', filters.is_active);
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
      id: 'inventory.drugs.id',
      drugCode: 'inventory.drugs.drug_code',
      tradeName: 'inventory.drugs.trade_name',
      genericId: 'inventory.drugs.generic_id',
      manufacturerId: 'inventory.drugs.manufacturer_id',
      tmtTpuId: 'inventory.drugs.tmt_tpu_id',
      nlemStatus: 'inventory.drugs.nlem_status',
      drugStatus: 'inventory.drugs.drug_status',
      productCategory: 'inventory.drugs.product_category',
      statusChangedDate: 'inventory.drugs.status_changed_date',
      unitPrice: 'inventory.drugs.unit_price',
      packageSize: 'inventory.drugs.package_size',
      packageUnit: 'inventory.drugs.package_unit',
      isActive: 'inventory.drugs.is_active',
      createdAt: 'inventory.drugs.created_at',
      updatedAt: 'inventory.drugs.updated_at',
    };

    return sortFields[sortBy] || 'inventory.drugs.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugsQuery = {},
  ): Promise<Drugs | null> {
    let query = this.getJoinQuery();
    query = query.where('drugs.id', id);

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
  async list(query: DrugsListQuery = {}): Promise<PaginatedListResult<Drugs>> {
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

    // Check drug_distribution_items references
    const drugDistributionItemsCount = await this.knex(
      'drug_distribution_items',
    )
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugDistributionItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_distribution_items',
        field: 'drug_id',
        count: parseInt((drugDistributionItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_focus_lists references
    const drugFocusListsCount = await this.knex('drug_focus_lists')
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugFocusListsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_focus_lists',
        field: 'drug_id',
        count: parseInt((drugFocusListsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_lots references
    const drugLotsCount = await this.knex('drug_lots')
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugLotsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_lots',
        field: 'drug_id',
        count: parseInt((drugLotsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_pack_ratios references
    const drugPackRatiosCount = await this.knex('drug_pack_ratios')
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugPackRatiosCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_pack_ratios',
        field: 'drug_id',
        count: parseInt((drugPackRatiosCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_return_items references
    const drugReturnItemsCount = await this.knex('drug_return_items')
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugReturnItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_return_items',
        field: 'drug_id',
        count: parseInt((drugReturnItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check hospital_pharmaceutical_products references
    const hospitalPharmaceuticalProductsCount = await this.knex(
      'hospital_pharmaceutical_products',
    )
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (
      parseInt((hospitalPharmaceuticalProductsCount?.count as string) || '0') >
      0
    ) {
      blockedBy.push({
        table: 'hospital_pharmaceutical_products',
        field: 'drug_id',
        count: parseInt(
          (hospitalPharmaceuticalProductsCount?.count as string) || '0',
        ),
        cascade: false,
      });
    }

    // Check inventory references
    const inventoryCount = await this.knex('inventory')
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (parseInt((inventoryCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'inventory',
        field: 'drug_id',
        count: parseInt((inventoryCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check tmt_mappings references
    const tmtMappingsCount = await this.knex('tmt_mappings')
      .where('drug_id', id)
      .count('* as count')
      .first();

    if (parseInt((tmtMappingsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'tmt_mappings',
        field: 'drug_id',
        count: parseInt((tmtMappingsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.drugs')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugs[]): Promise<Drugs[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drugs')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateDrugs): Promise<Drugs> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drugs')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
