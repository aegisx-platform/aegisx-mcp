import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateHospitalPharmaceuticalProducts,
  type UpdateHospitalPharmaceuticalProducts,
  type HospitalPharmaceuticalProducts,
  type GetHospitalPharmaceuticalProductsQuery,
  type ListHospitalPharmaceuticalProductsQuery,
  type HospitalPharmaceuticalProductsEntity,
} from './hospital-pharmaceutical-products.types';

export interface HospitalPharmaceuticalProductsListQuery extends BaseListQuery {
  // Smart field-based filters for HospitalPharmaceuticalProducts
  hpp_code?: string;
  product_name?: string;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  base_product_id?: number;
  base_product_id_min?: number;
  base_product_id_max?: number;
  tmt_code?: string;
  is_outsourced?: boolean;
  is_active?: boolean;
}

export class HospitalPharmaceuticalProductsRepository extends BaseRepository<
  HospitalPharmaceuticalProducts,
  CreateHospitalPharmaceuticalProducts,
  UpdateHospitalPharmaceuticalProducts
> {
  constructor(knex: Knex) {
    super(
      knex,
      'hospital_pharmaceutical_products',
      [
        // Define searchable fields based on intelligent detection
        'hospital_pharmaceutical_products.product_name',
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
  transformToEntity(dbRow: any): HospitalPharmaceuticalProducts {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      hpp_code: dbRow.hpp_code,
      hpp_type: dbRow.hpp_type,
      product_name: dbRow.product_name,
      generic_id: dbRow.generic_id,
      drug_id: dbRow.drug_id,
      base_product_id: dbRow.base_product_id,
      tmt_code: dbRow.tmt_code,
      is_outsourced: dbRow.is_outsourced,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto:
      | CreateHospitalPharmaceuticalProducts
      | UpdateHospitalPharmaceuticalProducts,
  ): Partial<HospitalPharmaceuticalProductsEntity> {
    const transformed: Partial<HospitalPharmaceuticalProductsEntity> = {};

    if ('hpp_code' in dto && dto.hpp_code !== undefined) {
      transformed.hpp_code = dto.hpp_code;
    }
    if ('hpp_type' in dto && dto.hpp_type !== undefined) {
      transformed.hpp_type = dto.hpp_type;
    }
    if ('product_name' in dto && dto.product_name !== undefined) {
      transformed.product_name = dto.product_name;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('base_product_id' in dto && dto.base_product_id !== undefined) {
      transformed.base_product_id = dto.base_product_id;
    }
    if ('tmt_code' in dto && dto.tmt_code !== undefined) {
      transformed.tmt_code = dto.tmt_code;
    }
    if ('is_outsourced' in dto && dto.is_outsourced !== undefined) {
      transformed.is_outsourced = dto.is_outsourced;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('hospital_pharmaceutical_products').select(
      'hospital_pharmaceutical_products.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'hospital_pharmaceutical_products.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: HospitalPharmaceuticalProductsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific HospitalPharmaceuticalProducts filters based on intelligent field categorization
    if (filters.hpp_code !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.hpp_code',
        filters.hpp_code,
      );
    }
    if (filters.product_name !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.product_name',
        filters.product_name,
      );
    }
    if (filters.generic_id !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.generic_id',
        filters.generic_id,
      );
    }
    if (filters.generic_id_min !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.generic_id',
        '>=',
        filters.generic_id_min,
      );
    }
    if (filters.generic_id_max !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.generic_id',
        '<=',
        filters.generic_id_max,
      );
    }
    if (filters.drug_id !== undefined) {
      query.where('hospital_pharmaceutical_products.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.drug_id',
        '>=',
        filters.drug_id_min,
      );
    }
    if (filters.drug_id_max !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.drug_id',
        '<=',
        filters.drug_id_max,
      );
    }
    if (filters.base_product_id !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.base_product_id',
        filters.base_product_id,
      );
    }
    if (filters.base_product_id_min !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.base_product_id',
        '>=',
        filters.base_product_id_min,
      );
    }
    if (filters.base_product_id_max !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.base_product_id',
        '<=',
        filters.base_product_id_max,
      );
    }
    if (filters.tmt_code !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.tmt_code',
        filters.tmt_code,
      );
    }
    if (filters.is_outsourced !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.is_outsourced',
        filters.is_outsourced,
      );
    }
    if (filters.is_active !== undefined) {
      query.where(
        'hospital_pharmaceutical_products.is_active',
        filters.is_active,
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
      id: 'hospital_pharmaceutical_products.id',
      hppCode: 'hospital_pharmaceutical_products.hpp_code',
      hppType: 'hospital_pharmaceutical_products.hpp_type',
      productName: 'hospital_pharmaceutical_products.product_name',
      genericId: 'hospital_pharmaceutical_products.generic_id',
      drugId: 'hospital_pharmaceutical_products.drug_id',
      baseProductId: 'hospital_pharmaceutical_products.base_product_id',
      tmtCode: 'hospital_pharmaceutical_products.tmt_code',
      isOutsourced: 'hospital_pharmaceutical_products.is_outsourced',
      isActive: 'hospital_pharmaceutical_products.is_active',
      createdAt: 'hospital_pharmaceutical_products.created_at',
      updatedAt: 'hospital_pharmaceutical_products.updated_at',
    };

    return sortFields[sortBy] || 'hospital_pharmaceutical_products.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetHospitalPharmaceuticalProductsQuery = {},
  ): Promise<HospitalPharmaceuticalProducts | null> {
    let query = this.getJoinQuery();
    query = query.where('hospital_pharmaceutical_products.id', id);

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
    query: HospitalPharmaceuticalProductsListQuery = {},
  ): Promise<PaginatedListResult<HospitalPharmaceuticalProducts>> {
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

    // Check hospital_pharmaceutical_products references
    const hospitalPharmaceuticalProductsCount = await this.knex(
      'hospital_pharmaceutical_products',
    )
      .where('base_product_id', id)
      .count('* as count')
      .first();

    if (
      parseInt((hospitalPharmaceuticalProductsCount?.count as string) || '0') >
      0
    ) {
      blockedBy.push({
        table: 'hospital_pharmaceutical_products',
        field: 'base_product_id',
        count: parseInt(
          (hospitalPharmaceuticalProductsCount?.count as string) || '0',
        ),
        cascade: false,
      });
    }

    // Check hpp_formulations references
    const hppFormulationsCount = await this.knex('hpp_formulations')
      .where('hpp_id', id)
      .count('* as count')
      .first();

    if (parseInt((hppFormulationsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'hpp_formulations',
        field: 'hpp_id',
        count: parseInt((hppFormulationsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('hospital_pharmaceutical_products')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateHospitalPharmaceuticalProducts[],
  ): Promise<HospitalPharmaceuticalProducts[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('hospital_pharmaceutical_products')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateHospitalPharmaceuticalProducts,
  ): Promise<HospitalPharmaceuticalProducts> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('hospital_pharmaceutical_products')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
