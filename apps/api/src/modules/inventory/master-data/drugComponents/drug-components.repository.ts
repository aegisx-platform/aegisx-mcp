import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugComponents,
  type UpdateDrugComponents,
  type DrugComponents,
  type GetDrugComponentsQuery,
  type ListDrugComponentsQuery,
  type DrugComponentsEntity,
} from './drug-components.types';

export interface DrugComponentsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugComponents
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  component_name?: string;
  strength?: string;
  strength_value?: number;
  strength_value_min?: number;
  strength_value_max?: number;
  strength_unit?: string;
  is_active?: boolean;
}

export class DrugComponentsRepository extends BaseRepository<
  DrugComponents,
  CreateDrugComponents,
  UpdateDrugComponents
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drug_components',
      [
        // Define searchable fields based on intelligent detection
        'inventory.drug_components.component_name',
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
  transformToEntity(dbRow: any): DrugComponents {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      generic_id: dbRow.generic_id,
      component_name: dbRow.component_name,
      strength: dbRow.strength,
      strength_value: dbRow.strength_value,
      strength_unit: dbRow.strength_unit,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugComponents | UpdateDrugComponents,
  ): Partial<DrugComponentsEntity> {
    const transformed: Partial<DrugComponentsEntity> = {};

    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('component_name' in dto && dto.component_name !== undefined) {
      transformed.component_name = dto.component_name;
    }
    if ('strength' in dto && dto.strength !== undefined) {
      transformed.strength = dto.strength;
    }
    if ('strength_value' in dto && dto.strength_value !== undefined) {
      transformed.strength_value = dto.strength_value;
    }
    if ('strength_unit' in dto && dto.strength_unit !== undefined) {
      transformed.strength_unit = dto.strength_unit;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drug_components').select(
      'inventory.drug_components.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drug_components.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugComponentsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugComponents filters based on intelligent field categorization
    if (filters.generic_id !== undefined) {
      query.where('inventory.drug_components.generic_id', filters.generic_id);
    }
    if (filters.generic_id_min !== undefined) {
      query.where(
        'inventory.drug_components.generic_id',
        '>=',
        filters.generic_id_min,
      );
    }
    if (filters.generic_id_max !== undefined) {
      query.where(
        'inventory.drug_components.generic_id',
        '<=',
        filters.generic_id_max,
      );
    }
    if (filters.component_name !== undefined) {
      query.where(
        'inventory.drug_components.component_name',
        filters.component_name,
      );
    }
    if (filters.strength !== undefined) {
      query.where('inventory.drug_components.strength', filters.strength);
    }
    if (filters.strength_value !== undefined) {
      query.where(
        'inventory.drug_components.strength_value',
        filters.strength_value,
      );
    }
    if (filters.strength_value_min !== undefined) {
      query.where(
        'inventory.drug_components.strength_value',
        '>=',
        filters.strength_value_min,
      );
    }
    if (filters.strength_value_max !== undefined) {
      query.where(
        'inventory.drug_components.strength_value',
        '<=',
        filters.strength_value_max,
      );
    }
    if (filters.strength_unit !== undefined) {
      query.where(
        'inventory.drug_components.strength_unit',
        filters.strength_unit,
      );
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.drug_components.is_active', filters.is_active);
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
      id: 'inventory.drug_components.id',
      genericId: 'inventory.drug_components.generic_id',
      componentName: 'inventory.drug_components.component_name',
      strength: 'inventory.drug_components.strength',
      strengthValue: 'inventory.drug_components.strength_value',
      strengthUnit: 'inventory.drug_components.strength_unit',
      isActive: 'inventory.drug_components.is_active',
      createdAt: 'inventory.drug_components.created_at',
      updatedAt: 'inventory.drug_components.updated_at',
    };

    return sortFields[sortBy] || 'inventory.drug_components.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugComponentsQuery = {},
  ): Promise<DrugComponents | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_components.id', id);

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
    query: DrugComponentsListQuery = {},
  ): Promise<PaginatedListResult<DrugComponents>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.drug_components')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugComponents[]): Promise<DrugComponents[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drug_components')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateDrugComponents,
  ): Promise<DrugComponents> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drug_components')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
