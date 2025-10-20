import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateAuthors,
  type UpdateAuthors,
  type Authors,
  type GetAuthorsQuery,
  type ListAuthorsQuery,
  type AuthorsEntity,
} from '../types/authors.types';

export interface AuthorsListQuery extends BaseListQuery {
  // Smart field-based filters for Authors
  name?: string;
  email?: string;
  birth_date_min?: Date;
  birth_date_max?: Date;
  country?: string;
  active?: boolean;
  updated_at_min?: Date;
  updated_at_max?: Date;
}

export class AuthorsRepository extends BaseRepository<
  Authors,
  CreateAuthors,
  UpdateAuthors
> {
  constructor(knex: Knex) {
    super(knex, 'authors', [
      // Define searchable fields based on intelligent detection
      'authors.name',
    ]);
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Authors {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      name: dbRow.name,
      email: dbRow.email,
      bio: dbRow.bio,
      birth_date: dbRow.birth_date,
      country: dbRow.country,
      active: dbRow.active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateAuthors | UpdateAuthors): Partial<AuthorsEntity> {
    const transformed: Partial<AuthorsEntity> = {};

    if ('name' in dto && dto.name !== undefined) {
      transformed.name = dto.name;
    }
    if ('email' in dto && dto.email !== undefined) {
      transformed.email = dto.email;
    }
    if ('bio' in dto && dto.bio !== undefined) {
      transformed.bio = dto.bio;
    }
    if ('birth_date' in dto && dto.birth_date !== undefined) {
      transformed.birth_date =
        typeof dto.birth_date === 'string'
          ? new Date(dto.birth_date)
          : dto.birth_date;
    }
    if ('country' in dto && dto.country !== undefined) {
      transformed.country = dto.country;
    }
    if ('active' in dto && dto.active !== undefined) {
      transformed.active = dto.active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('authors').select('authors.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'authors.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: AuthorsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Authors filters based on intelligent field categorization
    if (filters.name !== undefined) {
      query.where('authors.name', filters.name);
    }
    if (filters.email !== undefined) {
      query.where('authors.email', filters.email);
    }
    if (filters.birth_date_min !== undefined) {
      query.where('authors.birth_date', '>=', filters.birth_date_min);
    }
    if (filters.birth_date_max !== undefined) {
      query.where('authors.birth_date', '<=', filters.birth_date_max);
    }
    if (filters.country !== undefined) {
      query.where('authors.country', filters.country);
    }
    if (filters.active !== undefined) {
      query.where('authors.active', filters.active);
    }
    if (filters.updated_at_min !== undefined) {
      query.where('authors.updated_at', '>=', filters.updated_at_min);
    }
    if (filters.updated_at_max !== undefined) {
      query.where('authors.updated_at', '<=', filters.updated_at_max);
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
      id: 'authors.id',
      name: 'authors.name',
      email: 'authors.email',
      bio: 'authors.bio',
      birthDate: 'authors.birth_date',
      country: 'authors.country',
      active: 'authors.active',
      createdAt: 'authors.created_at',
      updatedAt: 'authors.updated_at',
    };

    return sortFields[sortBy] || 'authors.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetAuthorsQuery = {},
  ): Promise<Authors | null> {
    let query = this.getJoinQuery();
    query = query.where('authors.id', id);

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
    query: AuthorsListQuery = {},
  ): Promise<PaginatedListResult<Authors>> {
    return super.list(query);
  }

  // Business-specific methods for unique/important fields

  async findByName(name: string): Promise<Authors | null> {
    const query = this.getJoinQuery();
    const row = await query.where('authors.name', name).first();
    return row ? this.transformToEntity(row) : null;
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('authors')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateAuthors[]): Promise<Authors[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('authors')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateAuthors): Promise<Authors> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('authors').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}
