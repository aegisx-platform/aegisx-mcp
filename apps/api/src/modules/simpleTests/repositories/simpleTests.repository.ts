import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateSimpleTests,
  type UpdateSimpleTests,
  type SimpleTests,
  type GetSimpleTestsQuery,
  type ListSimpleTestsQuery,
  type SimpleTestsEntity,
} from '../types/simpleTests.types';

export interface SimpleTestsListQuery extends BaseListQuery {
  // Smart field-based filters for SimpleTests
  is_active?: boolean;
  date_field_min?: Date;
  date_field_max?: Date;
  datetime_field_min?: Date;
  datetime_field_max?: Date;
  updated_at_min?: Date;
  updated_at_max?: Date;
}

export class SimpleTestsRepository extends BaseRepository<
  SimpleTests,
  CreateSimpleTests,
  UpdateSimpleTests
> {
  constructor(knex: Knex) {
    super(knex, 'simple_tests', [
      // Define searchable fields based on intelligent detection
      'simple_tests.name',
      'simple_tests.description',
    ]);
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): SimpleTests {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      is_active: dbRow.is_active,
      small_number: dbRow.small_number,
      regular_number: dbRow.regular_number,
      big_number: dbRow.big_number,
      decimal_field: dbRow.decimal_field,
      float_field: dbRow.float_field,
      name: dbRow.name,
      description: dbRow.description,
      date_field: dbRow.date_field,
      datetime_field: dbRow.datetime_field,
      json_field: dbRow.json_field,
      uuid_field: dbRow.uuid_field,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateSimpleTests | UpdateSimpleTests,
  ): Partial<SimpleTestsEntity> {
    const transformed: Partial<SimpleTestsEntity> = {};

    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    if ('small_number' in dto && dto.small_number !== undefined) {
      transformed.small_number = dto.small_number;
    }
    if ('regular_number' in dto && dto.regular_number !== undefined) {
      transformed.regular_number = dto.regular_number;
    }
    if ('big_number' in dto && dto.big_number !== undefined) {
      transformed.big_number = dto.big_number;
    }
    if ('decimal_field' in dto && dto.decimal_field !== undefined) {
      transformed.decimal_field = dto.decimal_field;
    }
    if ('float_field' in dto && dto.float_field !== undefined) {
      transformed.float_field = dto.float_field;
    }
    if ('name' in dto && dto.name !== undefined) {
      transformed.name = dto.name;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('date_field' in dto && dto.date_field !== undefined) {
      transformed.date_field =
        typeof dto.date_field === 'string'
          ? new Date(dto.date_field)
          : dto.date_field;
    }
    if ('datetime_field' in dto && dto.datetime_field !== undefined) {
      transformed.datetime_field =
        typeof dto.datetime_field === 'string'
          ? new Date(dto.datetime_field)
          : dto.datetime_field;
    }
    if ('json_field' in dto && dto.json_field !== undefined) {
      transformed.json_field = dto.json_field;
    }
    if ('uuid_field' in dto && dto.uuid_field !== undefined) {
      transformed.uuid_field = dto.uuid_field;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('simple_tests').select('simple_tests.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'simple_tests.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: SimpleTestsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific SimpleTests filters based on intelligent field categorization
    if (filters.is_active !== undefined) {
      query.where('simple_tests.is_active', filters.is_active);
    }
    if (filters.date_field_min !== undefined) {
      query.where('simple_tests.date_field', '>=', filters.date_field_min);
    }
    if (filters.date_field_max !== undefined) {
      query.where('simple_tests.date_field', '<=', filters.date_field_max);
    }
    if (filters.datetime_field_min !== undefined) {
      query.where(
        'simple_tests.datetime_field',
        '>=',
        filters.datetime_field_min,
      );
    }
    if (filters.datetime_field_max !== undefined) {
      query.where(
        'simple_tests.datetime_field',
        '<=',
        filters.datetime_field_max,
      );
    }
    if (filters.updated_at_min !== undefined) {
      query.where('simple_tests.updated_at', '>=', filters.updated_at_min);
    }
    if (filters.updated_at_max !== undefined) {
      query.where('simple_tests.updated_at', '<=', filters.updated_at_max);
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
      id: 'simple_tests.id',
      isActive: 'simple_tests.is_active',
      smallNumber: 'simple_tests.small_number',
      regularNumber: 'simple_tests.regular_number',
      bigNumber: 'simple_tests.big_number',
      decimalField: 'simple_tests.decimal_field',
      floatField: 'simple_tests.float_field',
      name: 'simple_tests.name',
      description: 'simple_tests.description',
      dateField: 'simple_tests.date_field',
      datetimeField: 'simple_tests.datetime_field',
      jsonField: 'simple_tests.json_field',
      uuidField: 'simple_tests.uuid_field',
      createdAt: 'simple_tests.created_at',
      updatedAt: 'simple_tests.updated_at',
    };

    return sortFields[sortBy] || 'simple_tests.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetSimpleTestsQuery = {},
  ): Promise<SimpleTests | null> {
    let query = this.getJoinQuery();
    query = query.where('simple_tests.id', id);

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
    query: SimpleTestsListQuery = {},
  ): Promise<PaginatedListResult<SimpleTests>> {
    return super.list(query);
  }

  // Business-specific methods for unique/important fields

  async findByName(name: string): Promise<SimpleTests | null> {
    const query = this.getJoinQuery();
    const row = await query.where('simple_tests.name', name).first();
    return row ? this.transformToEntity(row) : null;
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('simple_tests')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateSimpleTests[]): Promise<SimpleTests[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('simple_tests')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateSimpleTests): Promise<SimpleTests> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('simple_tests')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
