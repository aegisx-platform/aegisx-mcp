import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateComprehensiveTests,
  type UpdateComprehensiveTests,
  type ComprehensiveTests,
  type GetComprehensiveTestsQuery,
  type ListComprehensiveTestsQuery,
  type ComprehensiveTestsEntity,
} from '../types/comprehensive-tests.types';

export interface ComprehensiveTestsListQuery extends BaseListQuery {
  // Smart field-based filters for ComprehensiveTests
  short_code?: string;
  price_min?: number;
  price_max?: number;
  quantity_min?: number;
  quantity_max?: number;
  weight_min?: number;
  weight_max?: number;
  rating_min?: number;
  rating_max?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_available?: boolean;
  updated_at_min?: Date;
  updated_at_max?: Date;
  published_at_min?: Date;
  published_at_max?: Date;
  expires_at_min?: Date;
  expires_at_max?: Date;
  status?: string;
}

export class ComprehensiveTestsRepository extends BaseRepository<
  ComprehensiveTests,
  CreateComprehensiveTests,
  UpdateComprehensiveTests
> {
  constructor(knex: Knex) {
    super(knex, 'comprehensive_tests', [
      // Define searchable fields based on intelligent detection
      'comprehensive_tests.title',
      'comprehensive_tests.description',
      'comprehensive_tests.content',
      'comprehensive_tests.notes',
    ]);
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): ComprehensiveTests {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      title: dbRow.title,
      description: dbRow.description,
      slug: dbRow.slug,
      short_code: dbRow.short_code,
      price: dbRow.price,
      quantity: dbRow.quantity,
      weight: dbRow.weight,
      rating: dbRow.rating,
      is_active: dbRow.is_active,
      is_featured: dbRow.is_featured,
      is_available: dbRow.is_available,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      published_at: dbRow.published_at,
      expires_at: dbRow.expires_at,
      start_time: dbRow.start_time,
      metadata: dbRow.metadata,
      tags: dbRow.tags,
      ip_address: dbRow.ip_address,
      website_url: dbRow.website_url,
      email_address: dbRow.email_address,
      status: dbRow.status,
      priority: dbRow.priority,
      content: dbRow.content,
      notes: dbRow.notes,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateComprehensiveTests | UpdateComprehensiveTests,
  ): Partial<ComprehensiveTestsEntity> {
    const transformed: Partial<ComprehensiveTestsEntity> = {};

    if ('title' in dto && dto.title !== undefined) {
      transformed.title = dto.title;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('slug' in dto && dto.slug !== undefined) {
      transformed.slug = dto.slug;
    }
    if ('short_code' in dto && dto.short_code !== undefined) {
      transformed.short_code = dto.short_code;
    }
    if ('price' in dto && dto.price !== undefined) {
      transformed.price = dto.price;
    }
    if ('quantity' in dto && dto.quantity !== undefined) {
      transformed.quantity = dto.quantity;
    }
    if ('weight' in dto && dto.weight !== undefined) {
      transformed.weight = dto.weight;
    }
    if ('rating' in dto && dto.rating !== undefined) {
      transformed.rating = dto.rating;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    if ('is_featured' in dto && dto.is_featured !== undefined) {
      transformed.is_featured = dto.is_featured;
    }
    if ('is_available' in dto && dto.is_available !== undefined) {
      transformed.is_available = dto.is_available;
    }
    if ('published_at' in dto && dto.published_at !== undefined) {
      transformed.published_at =
        typeof dto.published_at === 'string'
          ? new Date(dto.published_at)
          : dto.published_at;
    }
    if ('expires_at' in dto && dto.expires_at !== undefined) {
      transformed.expires_at =
        typeof dto.expires_at === 'string'
          ? new Date(dto.expires_at)
          : dto.expires_at;
    }
    if ('start_time' in dto && dto.start_time !== undefined) {
      transformed.start_time = dto.start_time;
    }
    if ('metadata' in dto && dto.metadata !== undefined) {
      transformed.metadata = dto.metadata;
    }
    if ('tags' in dto && dto.tags !== undefined) {
      transformed.tags = dto.tags;
    }
    if ('ip_address' in dto && dto.ip_address !== undefined) {
      transformed.ip_address = dto.ip_address;
    }
    if ('website_url' in dto && dto.website_url !== undefined) {
      transformed.website_url = dto.website_url;
    }
    if ('email_address' in dto && dto.email_address !== undefined) {
      transformed.email_address = dto.email_address;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('priority' in dto && dto.priority !== undefined) {
      transformed.priority = dto.priority;
    }
    if ('content' in dto && dto.content !== undefined) {
      transformed.content = dto.content;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('comprehensive_tests').select('comprehensive_tests.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'comprehensive_tests.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: ComprehensiveTestsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific ComprehensiveTests filters based on intelligent field categorization
    if (filters.short_code !== undefined) {
      query.where('comprehensive_tests.short_code', filters.short_code);
    }
    if (filters.price_min !== undefined) {
      query.where('comprehensive_tests.price', '>=', filters.price_min);
    }
    if (filters.price_max !== undefined) {
      query.where('comprehensive_tests.price', '<=', filters.price_max);
    }
    if (filters.quantity_min !== undefined) {
      query.where('comprehensive_tests.quantity', '>=', filters.quantity_min);
    }
    if (filters.quantity_max !== undefined) {
      query.where('comprehensive_tests.quantity', '<=', filters.quantity_max);
    }
    if (filters.weight_min !== undefined) {
      query.where('comprehensive_tests.weight', '>=', filters.weight_min);
    }
    if (filters.weight_max !== undefined) {
      query.where('comprehensive_tests.weight', '<=', filters.weight_max);
    }
    if (filters.rating_min !== undefined) {
      query.where('comprehensive_tests.rating', '>=', filters.rating_min);
    }
    if (filters.rating_max !== undefined) {
      query.where('comprehensive_tests.rating', '<=', filters.rating_max);
    }
    if (filters.is_active !== undefined) {
      query.where('comprehensive_tests.is_active', filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      query.where('comprehensive_tests.is_featured', filters.is_featured);
    }
    if (filters.is_available !== undefined) {
      query.where('comprehensive_tests.is_available', filters.is_available);
    }
    if (filters.updated_at_min !== undefined) {
      query.where(
        'comprehensive_tests.updated_at',
        '>=',
        filters.updated_at_min,
      );
    }
    if (filters.updated_at_max !== undefined) {
      query.where(
        'comprehensive_tests.updated_at',
        '<=',
        filters.updated_at_max,
      );
    }
    if (filters.published_at_min !== undefined) {
      query.where(
        'comprehensive_tests.published_at',
        '>=',
        filters.published_at_min,
      );
    }
    if (filters.published_at_max !== undefined) {
      query.where(
        'comprehensive_tests.published_at',
        '<=',
        filters.published_at_max,
      );
    }
    if (filters.expires_at_min !== undefined) {
      query.where(
        'comprehensive_tests.expires_at',
        '>=',
        filters.expires_at_min,
      );
    }
    if (filters.expires_at_max !== undefined) {
      query.where(
        'comprehensive_tests.expires_at',
        '<=',
        filters.expires_at_max,
      );
    }
    if (filters.status !== undefined) {
      query.where('comprehensive_tests.status', filters.status);
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
      id: 'comprehensive_tests.id',
      title: 'comprehensive_tests.title',
      description: 'comprehensive_tests.description',
      slug: 'comprehensive_tests.slug',
      shortCode: 'comprehensive_tests.short_code',
      price: 'comprehensive_tests.price',
      quantity: 'comprehensive_tests.quantity',
      weight: 'comprehensive_tests.weight',
      rating: 'comprehensive_tests.rating',
      isActive: 'comprehensive_tests.is_active',
      isFeatured: 'comprehensive_tests.is_featured',
      isAvailable: 'comprehensive_tests.is_available',
      createdAt: 'comprehensive_tests.created_at',
      updatedAt: 'comprehensive_tests.updated_at',
      publishedAt: 'comprehensive_tests.published_at',
      expiresAt: 'comprehensive_tests.expires_at',
      startTime: 'comprehensive_tests.start_time',
      metadata: 'comprehensive_tests.metadata',
      tags: 'comprehensive_tests.tags',
      ipAddress: 'comprehensive_tests.ip_address',
      websiteUrl: 'comprehensive_tests.website_url',
      emailAddress: 'comprehensive_tests.email_address',
      status: 'comprehensive_tests.status',
      priority: 'comprehensive_tests.priority',
      content: 'comprehensive_tests.content',
      notes: 'comprehensive_tests.notes',
    };

    return sortFields[sortBy] || 'comprehensive_tests.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetComprehensiveTestsQuery = {},
  ): Promise<ComprehensiveTests | null> {
    let query = this.getJoinQuery();
    query = query.where('comprehensive_tests.id', id);

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
    query: ComprehensiveTestsListQuery = {},
  ): Promise<PaginatedListResult<ComprehensiveTests>> {
    return super.list(query);
  }

  // Business-specific methods for unique/important fields

  async findByTitle(title: string): Promise<ComprehensiveTests | null> {
    const query = this.getJoinQuery();
    const row = await query.where('comprehensive_tests.title', title).first();
    return row ? this.transformToEntity(row) : null;
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('comprehensive_tests')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateComprehensiveTests[],
  ): Promise<ComprehensiveTests[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('comprehensive_tests')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateComprehensiveTests,
  ): Promise<ComprehensiveTests> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('comprehensive_tests')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
