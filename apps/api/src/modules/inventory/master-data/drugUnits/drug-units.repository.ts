import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugUnits,
  type UpdateDrugUnits,
  type DrugUnits,
  type GetDrugUnitsQuery,
  type ListDrugUnitsQuery,
  type DrugUnitsEntity,
} from './drug-units.types';

export interface DrugUnitsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugUnits
  unit_code?: string;
  unit_name?: string;
  unit_name_en?: string;
  description?: string;
  is_active?: boolean;
}

export class DrugUnitsRepository extends BaseRepository<
  DrugUnits,
  CreateDrugUnits,
  UpdateDrugUnits
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drug_units',
      [
        // Define searchable fields based on intelligent detection
        'inventory.drug_units.unit_name',
        'inventory.drug_units.unit_name_en',
        'inventory.drug_units.description',
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
  transformToEntity(dbRow: any): DrugUnits {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      unit_code: dbRow.unit_code,
      unit_name: dbRow.unit_name,
      unit_name_en: dbRow.unit_name_en,
      unit_type: dbRow.unit_type,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugUnits | UpdateDrugUnits,
  ): Partial<DrugUnitsEntity> {
    const transformed: Partial<DrugUnitsEntity> = {};

    if ('unit_code' in dto && dto.unit_code !== undefined) {
      transformed.unit_code = dto.unit_code;
    }
    if ('unit_name' in dto && dto.unit_name !== undefined) {
      transformed.unit_name = dto.unit_name;
    }
    if ('unit_name_en' in dto && dto.unit_name_en !== undefined) {
      transformed.unit_name_en = dto.unit_name_en;
    }
    if ('unit_type' in dto && dto.unit_type !== undefined) {
      transformed.unit_type = dto.unit_type;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drug_units').select('inventory.drug_units.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drug_units.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: DrugUnitsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugUnits filters based on intelligent field categorization
    if (filters.unit_code !== undefined) {
      query.where('inventory.drug_units.unit_code', filters.unit_code);
    }
    if (filters.unit_name !== undefined) {
      query.where('inventory.drug_units.unit_name', filters.unit_name);
    }
    if (filters.unit_name_en !== undefined) {
      query.where('inventory.drug_units.unit_name_en', filters.unit_name_en);
    }
    if (filters.description !== undefined) {
      query.where('inventory.drug_units.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.drug_units.is_active', filters.is_active);
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
      id: 'inventory.drug_units.id',
      unitCode: 'inventory.drug_units.unit_code',
      unitName: 'inventory.drug_units.unit_name',
      unitNameEn: 'inventory.drug_units.unit_name_en',
      unitType: 'inventory.drug_units.unit_type',
      description: 'inventory.drug_units.description',
      isActive: 'inventory.drug_units.is_active',
      createdAt: 'inventory.drug_units.created_at',
      updatedAt: 'inventory.drug_units.updated_at',
    };

    return sortFields[sortBy] || 'inventory.drug_units.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugUnitsQuery = {},
  ): Promise<DrugUnits | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_units.id', id);

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
    query: DrugUnitsListQuery = {},
  ): Promise<PaginatedListResult<DrugUnits>> {
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

    // Check drug_generics references
    const drugGenericsCount = await this.knex('drug_generics')
      .where('strength_unit_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugGenericsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_generics',
        field: 'strength_unit_id',
        count: parseInt((drugGenericsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.drug_units')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugUnits[]): Promise<DrugUnits[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drug_units')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateDrugUnits): Promise<DrugUnits> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drug_units')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
