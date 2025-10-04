import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateArticles,
  type UpdateArticles,
  type Articles,
  type GetArticlesQuery,
  type ListArticlesQuery,
  type ArticlesEntity,
} from '../types/articles.types';

export interface ArticlesListQuery extends BaseListQuery {
  // Smart field-based filters for Articles
  published?: boolean;
  published_at_min?: Date;
  published_at_max?: Date;
  view_count_min?: number;
  view_count_max?: number;
  updated_at_min?: Date;
  updated_at_max?: Date;
}

export class ArticlesRepository extends BaseRepository<
  Articles,
  CreateArticles,
  UpdateArticles
> {
  constructor(knex: Knex) {
    super(
      knex,
      'articles',
      [
        // Define searchable fields based on intelligent detection
        'articles.title',
        'articles.content',
      ],
      [
        // 🛡️ Explicit UUID fields for validation
        'id',
        'author_id',
      ],
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Articles {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      title: dbRow.title,
      content: dbRow.content,
      author_id: dbRow.author_id,
      published: dbRow.published,
      published_at: dbRow.published_at,
      view_count: dbRow.view_count,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateArticles | UpdateArticles): Partial<ArticlesEntity> {
    const transformed: Partial<ArticlesEntity> = {};

    if ('title' in dto && dto.title !== undefined) {
      transformed.title = dto.title;
    }
    if ('content' in dto && dto.content !== undefined) {
      transformed.content = dto.content;
    }
    if ('author_id' in dto && dto.author_id !== undefined) {
      transformed.author_id = dto.author_id;
    }
    if ('published' in dto && dto.published !== undefined) {
      transformed.published = dto.published;
    }
    if ('published_at' in dto && dto.published_at !== undefined) {
      transformed.published_at =
        typeof dto.published_at === 'string'
          ? new Date(dto.published_at)
          : dto.published_at;
    }
    if ('view_count' in dto && dto.view_count !== undefined) {
      transformed.view_count = dto.view_count;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('articles').select('articles.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'articles.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: ArticlesListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Articles filters based on intelligent field categorization
    if (filters.published !== undefined) {
      query.where('articles.published', filters.published);
    }
    if (filters.published_at_min !== undefined) {
      query.where('articles.published_at', '>=', filters.published_at_min);
    }
    if (filters.published_at_max !== undefined) {
      query.where('articles.published_at', '<=', filters.published_at_max);
    }
    if (filters.view_count_min !== undefined) {
      query.where('articles.view_count', '>=', filters.view_count_min);
    }
    if (filters.view_count_max !== undefined) {
      query.where('articles.view_count', '<=', filters.view_count_max);
    }
    if (filters.updated_at_min !== undefined) {
      query.where('articles.updated_at', '>=', filters.updated_at_min);
    }
    if (filters.updated_at_max !== undefined) {
      query.where('articles.updated_at', '<=', filters.updated_at_max);
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
      id: 'articles.id',
      title: 'articles.title',
      content: 'articles.content',
      authorId: 'articles.author_id',
      published: 'articles.published',
      publishedAt: 'articles.published_at',
      viewCount: 'articles.view_count',
      createdAt: 'articles.created_at',
      updatedAt: 'articles.updated_at',
    };

    return sortFields[sortBy] || 'articles.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetArticlesQuery = {},
  ): Promise<Articles | null> {
    let query = this.getJoinQuery();
    query = query.where('articles.id', id);

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
    query: ArticlesListQuery = {},
  ): Promise<PaginatedListResult<Articles>> {
    return super.list(query);
  }

  // Business-specific methods for unique/important fields

  async findByTitle(title: string): Promise<Articles | null> {
    const query = this.getJoinQuery();
    const row = await query.where('articles.title', title).first();
    return row ? this.transformToEntity(row) : null;
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('articles')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateArticles[]): Promise<Articles[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('articles')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateArticles): Promise<Articles> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('articles')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
