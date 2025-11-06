import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateTestCategories,
  type UpdateTestCategories,
  type TestCategories,
  type GetTestCategoriesQuery,
  type ListTestCategoriesQuery,
  type TestCategoriesEntity,
} from '../types/test-categories.types';

export interface TestCategoriesListQuery extends BaseListQuery {
  // Smart field-based filters for TestCategories
  code?: string;
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
  display_order_min?: number;
  display_order_max?: number;
  item_count?: number;
  item_count_min?: number;
  item_count_max?: number;
  discount_rate?: number;
  discount_rate_min?: number;
  discount_rate_max?: number;
  status?: string;
  created_by?: string;
  updated_by?: string;
}

export class TestCategoriesRepository extends BaseRepository<
  TestCategories,
  CreateTestCategories,
  UpdateTestCategories
> {
  constructor(knex: Knex) {
    super(
      knex,
      'test_categories',
      [
        // Define searchable fields based on intelligent detection
        'test_categories.name',
        'test_categories.description',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: true,
        hasUpdatedBy: true,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): TestCategories {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      code: dbRow.code,
      name: dbRow.name,
      slug: dbRow.slug,
      description: dbRow.description,
      is_active: dbRow.is_active,
      is_featured: dbRow.is_featured,
      display_order: dbRow.display_order,
      item_count: dbRow.item_count,
      discount_rate: dbRow.discount_rate,
      metadata: dbRow.metadata,
      settings: dbRow.settings,
      status: dbRow.status,
      created_by: dbRow.created_by,
      updated_by: dbRow.updated_by,
      deleted_at: dbRow.deleted_at,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateTestCategories | UpdateTestCategories,
  ): Partial<TestCategoriesEntity> {
    const transformed: Partial<TestCategoriesEntity> = {};

    if ('code' in dto && dto.code !== undefined) {
      transformed.code = dto.code;
    }
    if ('name' in dto && dto.name !== undefined) {
      transformed.name = dto.name;
    }
    if ('slug' in dto && dto.slug !== undefined) {
      transformed.slug = dto.slug;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    if ('is_featured' in dto && dto.is_featured !== undefined) {
      transformed.is_featured = dto.is_featured;
    }
    if ('display_order' in dto && dto.display_order !== undefined) {
      transformed.display_order = dto.display_order;
    }
    if ('item_count' in dto && dto.item_count !== undefined) {
      transformed.item_count = dto.item_count;
    }
    if ('discount_rate' in dto && dto.discount_rate !== undefined) {
      transformed.discount_rate = dto.discount_rate;
    }
    if ('metadata' in dto && dto.metadata !== undefined) {
      transformed.metadata = dto.metadata;
    }
    if ('settings' in dto && dto.settings !== undefined) {
      transformed.settings = dto.settings;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('created_by' in dto && dto.created_by !== undefined) {
      transformed.created_by = dto.created_by;
    }
    if ('updated_by' in dto && dto.updated_by !== undefined) {
      transformed.updated_by = dto.updated_by;
    }
    if ('deleted_at' in dto && dto.deleted_at !== undefined) {
      transformed.deleted_at =
        typeof dto.deleted_at === 'string'
          ? new Date(dto.deleted_at)
          : dto.deleted_at;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('test_categories').select('test_categories.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'test_categories.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: TestCategoriesListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific TestCategories filters based on intelligent field categorization
    if (filters.code !== undefined) {
      query.where('test_categories.code', filters.code);
    }
    if (filters.name !== undefined) {
      query.where('test_categories.name', filters.name);
    }
    if (filters.slug !== undefined) {
      query.where('test_categories.slug', filters.slug);
    }
    if (filters.description !== undefined) {
      query.where('test_categories.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('test_categories.is_active', filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      query.where('test_categories.is_featured', filters.is_featured);
    }
    if (filters.display_order !== undefined) {
      query.where('test_categories.display_order', filters.display_order);
    }
    if (filters.display_order_min !== undefined) {
      query.where(
        'test_categories.display_order',
        '>=',
        filters.display_order_min,
      );
    }
    if (filters.display_order_max !== undefined) {
      query.where(
        'test_categories.display_order',
        '<=',
        filters.display_order_max,
      );
    }
    if (filters.item_count !== undefined) {
      query.where('test_categories.item_count', filters.item_count);
    }
    if (filters.item_count_min !== undefined) {
      query.where('test_categories.item_count', '>=', filters.item_count_min);
    }
    if (filters.item_count_max !== undefined) {
      query.where('test_categories.item_count', '<=', filters.item_count_max);
    }
    if (filters.discount_rate !== undefined) {
      query.where('test_categories.discount_rate', filters.discount_rate);
    }
    if (filters.discount_rate_min !== undefined) {
      query.where(
        'test_categories.discount_rate',
        '>=',
        filters.discount_rate_min,
      );
    }
    if (filters.discount_rate_max !== undefined) {
      query.where(
        'test_categories.discount_rate',
        '<=',
        filters.discount_rate_max,
      );
    }
    if (filters.status !== undefined) {
      query.where('test_categories.status', filters.status);
    }
    if (filters.created_by !== undefined) {
      query.where('test_categories.created_by', filters.created_by);
    }
    if (filters.updated_by !== undefined) {
      query.where('test_categories.updated_by', filters.updated_by);
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
      id: 'test_categories.id',
      code: 'test_categories.code',
      name: 'test_categories.name',
      slug: 'test_categories.slug',
      description: 'test_categories.description',
      isActive: 'test_categories.is_active',
      isFeatured: 'test_categories.is_featured',
      displayOrder: 'test_categories.display_order',
      itemCount: 'test_categories.item_count',
      discountRate: 'test_categories.discount_rate',
      metadata: 'test_categories.metadata',
      settings: 'test_categories.settings',
      status: 'test_categories.status',
      createdBy: 'test_categories.created_by',
      updatedBy: 'test_categories.updated_by',
      deletedAt: 'test_categories.deleted_at',
      createdAt: 'test_categories.created_at',
      updatedAt: 'test_categories.updated_at',
    };

    return sortFields[sortBy] || 'test_categories.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetTestCategoriesQuery = {},
  ): Promise<TestCategories | null> {
    let query = this.getJoinQuery();
    query = query.where('test_categories.id', id);

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
    query: TestCategoriesListQuery = {},
  ): Promise<PaginatedListResult<TestCategories>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  /**
   * Find by unique field: code
   * Used for duplicate detection before insert/update
   */
  async findByCode(code: string | number): Promise<TestCategories | null> {
    const query = this.getJoinQuery();
    const row = await query.where('test_categories.code', code).first();
    return row ? this.transformToEntity(row) : null;
  }

  /**
   * Find by unique field: name
   * Used for duplicate detection before insert/update
   */
  async findByName(name: string | number): Promise<TestCategories | null> {
    const query = this.getJoinQuery();
    const row = await query.where('test_categories.name', name).first();
    return row ? this.transformToEntity(row) : null;
  }

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('test_categories')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateTestCategories[]): Promise<TestCategories[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('test_categories')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateTestCategories,
  ): Promise<TestCategories> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('test_categories')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
