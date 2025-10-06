import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateSimpletest,
  type UpdateSimpletest,
  type Simpletest,
  type GetSimpletestQuery,
  type ListSimpletestQuery,
  type SimpletestEntity,
} from '../types/simpletest.types';

export interface SimpletestListQuery extends BaseListQuery {
  // Smart field-based filters for Simpletest
  status?: boolean;
}

export class SimpletestRepository extends BaseRepository<
  Simpletest,
  CreateSimpletest,
  UpdateSimpletest
> {
  constructor(knex: Knex) {
    super(knex, 'simpletest', [
      // Define searchable fields based on intelligent detection
      'simpletest.name',
    ]);
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Simpletest {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      name: dbRow.name,
      status: dbRow.status,
      created_at: dbRow.created_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateSimpletest | UpdateSimpletest,
  ): Partial<SimpletestEntity> {
    const transformed: Partial<SimpletestEntity> = {};

    if ('name' in dto && dto.name !== undefined) {
      transformed.name = dto.name;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('simpletest').select('simpletest.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'simpletest.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: SimpletestListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Simpletest filters based on intelligent field categorization
    if (filters.status !== undefined) {
      query.where('simpletest.status', filters.status);
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
        const mappedField = this.getSortField(sort);
        query.orderBy(mappedField, 'desc');
      }
    } else {
      // Default sort
      query.orderBy(this.getSortField('created_at'), 'desc');
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: 'simpletest.id',
      name: 'simpletest.name',
      status: 'simpletest.status',
      createdAt: 'simpletest.created_at',
    };

    return sortFields[sortBy] || 'simpletest.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetSimpletestQuery = {},
  ): Promise<Simpletest | null> {
    let query = this.getJoinQuery();
    query = query.where('simpletest.id', id);

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
    query: SimpletestListQuery = {},
  ): Promise<PaginatedListResult<Simpletest>> {
    return super.list(query);
  }

  // Business-specific methods for unique/important fields

  async findByName(name: string): Promise<Simpletest | null> {
    const query = this.getJoinQuery();
    const row = await query.where('simpletest.name', name).first();
    return row ? this.transformToEntity(row) : null;
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('simpletest')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateSimpletest[]): Promise<Simpletest[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('simpletest')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateSimpletest): Promise<Simpletest> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('simpletest')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
