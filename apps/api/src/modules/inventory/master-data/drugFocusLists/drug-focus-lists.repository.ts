import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugFocusLists,
  type UpdateDrugFocusLists,
  type DrugFocusLists,
  type GetDrugFocusListsQuery,
  type ListDrugFocusListsQuery,
  type DrugFocusListsEntity,
} from './drug-focus-lists.types';

export interface DrugFocusListsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugFocusLists
  list_code?: string;
  list_name?: string;
  description?: string;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  is_active?: boolean;
}

export class DrugFocusListsRepository extends BaseRepository<
  DrugFocusLists,
  CreateDrugFocusLists,
  UpdateDrugFocusLists
> {
  constructor(knex: Knex) {
    super(
      knex,
      'drug_focus_lists',
      [
        // Define searchable fields based on intelligent detection
        'drug_focus_lists.list_name',
        'drug_focus_lists.description',
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
  transformToEntity(dbRow: any): DrugFocusLists {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      list_code: dbRow.list_code,
      list_name: dbRow.list_name,
      description: dbRow.description,
      generic_id: dbRow.generic_id,
      drug_id: dbRow.drug_id,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugFocusLists | UpdateDrugFocusLists,
  ): Partial<DrugFocusListsEntity> {
    const transformed: Partial<DrugFocusListsEntity> = {};

    if ('list_code' in dto && dto.list_code !== undefined) {
      transformed.list_code = dto.list_code;
    }
    if ('list_name' in dto && dto.list_name !== undefined) {
      transformed.list_name = dto.list_name;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('drug_focus_lists').select('drug_focus_lists.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'drug_focus_lists.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugFocusListsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugFocusLists filters based on intelligent field categorization
    if (filters.list_code !== undefined) {
      query.where('drug_focus_lists.list_code', filters.list_code);
    }
    if (filters.list_name !== undefined) {
      query.where('drug_focus_lists.list_name', filters.list_name);
    }
    if (filters.description !== undefined) {
      query.where('drug_focus_lists.description', filters.description);
    }
    if (filters.generic_id !== undefined) {
      query.where('drug_focus_lists.generic_id', filters.generic_id);
    }
    if (filters.generic_id_min !== undefined) {
      query.where('drug_focus_lists.generic_id', '>=', filters.generic_id_min);
    }
    if (filters.generic_id_max !== undefined) {
      query.where('drug_focus_lists.generic_id', '<=', filters.generic_id_max);
    }
    if (filters.drug_id !== undefined) {
      query.where('drug_focus_lists.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where('drug_focus_lists.drug_id', '>=', filters.drug_id_min);
    }
    if (filters.drug_id_max !== undefined) {
      query.where('drug_focus_lists.drug_id', '<=', filters.drug_id_max);
    }
    if (filters.is_active !== undefined) {
      query.where('drug_focus_lists.is_active', filters.is_active);
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
      id: 'drug_focus_lists.id',
      listCode: 'drug_focus_lists.list_code',
      listName: 'drug_focus_lists.list_name',
      description: 'drug_focus_lists.description',
      genericId: 'drug_focus_lists.generic_id',
      drugId: 'drug_focus_lists.drug_id',
      isActive: 'drug_focus_lists.is_active',
      createdAt: 'drug_focus_lists.created_at',
      updatedAt: 'drug_focus_lists.updated_at',
    };

    return sortFields[sortBy] || 'drug_focus_lists.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugFocusListsQuery = {},
  ): Promise<DrugFocusLists | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_focus_lists.id', id);

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
    query: DrugFocusListsListQuery = {},
  ): Promise<PaginatedListResult<DrugFocusLists>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('drug_focus_lists')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugFocusLists[]): Promise<DrugFocusLists[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('drug_focus_lists')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateDrugFocusLists,
  ): Promise<DrugFocusLists> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('drug_focus_lists')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
