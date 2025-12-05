import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreatePurchaseTypes,
  type UpdatePurchaseTypes,
  type PurchaseTypes,
  type GetPurchaseTypesQuery,
  type ListPurchaseTypesQuery,
  type PurchaseTypesEntity,
} from './purchase-types.types';

export interface PurchaseTypesListQuery extends BaseListQuery {
  // Smart field-based filters for PurchaseTypes
  type_code?: string;
  type_name?: string;
  description?: string;
  is_active?: boolean;
}

export class PurchaseTypesRepository extends BaseRepository<
  PurchaseTypes,
  CreatePurchaseTypes,
  UpdatePurchaseTypes
> {
  constructor(knex: Knex) {
    super(
      knex,
      'purchase_types',
      [
        // Define searchable fields based on intelligent detection
        'purchase_types.type_name',
        'purchase_types.description',
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
  transformToEntity(dbRow: any): PurchaseTypes {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      type_code: dbRow.type_code,
      type_name: dbRow.type_name,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreatePurchaseTypes | UpdatePurchaseTypes,
  ): Partial<PurchaseTypesEntity> {
    const transformed: Partial<PurchaseTypesEntity> = {};

    if ('type_code' in dto && dto.type_code !== undefined) {
      transformed.type_code = dto.type_code;
    }
    if ('type_name' in dto && dto.type_name !== undefined) {
      transformed.type_name = dto.type_name;
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
    return this.knex('purchase_types').select('purchase_types.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'purchase_types.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: PurchaseTypesListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific PurchaseTypes filters based on intelligent field categorization
    if (filters.type_code !== undefined) {
      query.where('purchase_types.type_code', filters.type_code);
    }
    if (filters.type_name !== undefined) {
      query.where('purchase_types.type_name', filters.type_name);
    }
    if (filters.description !== undefined) {
      query.where('purchase_types.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('purchase_types.is_active', filters.is_active);
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
      id: 'purchase_types.id',
      typeCode: 'purchase_types.type_code',
      typeName: 'purchase_types.type_name',
      description: 'purchase_types.description',
      isActive: 'purchase_types.is_active',
      createdAt: 'purchase_types.created_at',
      updatedAt: 'purchase_types.updated_at',
    };

    return sortFields[sortBy] || 'purchase_types.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetPurchaseTypesQuery = {},
  ): Promise<PurchaseTypes | null> {
    let query = this.getJoinQuery();
    query = query.where('purchase_types.id', id);

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
    query: PurchaseTypesListQuery = {},
  ): Promise<PaginatedListResult<PurchaseTypes>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('purchase_types')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreatePurchaseTypes[]): Promise<PurchaseTypes[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('purchase_types')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreatePurchaseTypes,
  ): Promise<PurchaseTypes> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('purchase_types')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
