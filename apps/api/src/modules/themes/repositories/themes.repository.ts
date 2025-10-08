import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateThemes,
  type UpdateThemes,
  type Themes,
  type GetThemesQuery,
  type ListThemesQuery,
  type ThemesEntity,
} from '../types/themes.types';

export interface ThemesListQuery extends BaseListQuery {
  // Smart field-based filters for Themes
  is_active?: boolean;
  is_default?: boolean;
  updated_at_min?: Date;
  updated_at_max?: Date;
}

export class ThemesRepository extends BaseRepository<
  Themes,
  CreateThemes,
  UpdateThemes
> {
  constructor(knex: Knex) {
    super(knex, 'themes', [
      // Define searchable fields based on intelligent detection
      'themes.name',
      'themes.display_name',
      'themes.description',
    ]);
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Themes {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      name: dbRow.name,
      display_name: dbRow.display_name,
      description: dbRow.description,
      preview_image_url: dbRow.preview_image_url,
      color_palette: dbRow.color_palette,
      css_variables: dbRow.css_variables,
      is_active: dbRow.is_active,
      is_default: dbRow.is_default,
      sort_order: dbRow.sort_order,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateThemes | UpdateThemes): Partial<ThemesEntity> {
    const transformed: Partial<ThemesEntity> = {};

    if ('name' in dto && dto.name !== undefined) {
      transformed.name = dto.name;
    }
    if ('display_name' in dto && dto.display_name !== undefined) {
      transformed.display_name = dto.display_name;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('preview_image_url' in dto && dto.preview_image_url !== undefined) {
      transformed.preview_image_url = dto.preview_image_url;
    }
    if ('color_palette' in dto && dto.color_palette !== undefined) {
      transformed.color_palette = dto.color_palette;
    }
    if ('css_variables' in dto && dto.css_variables !== undefined) {
      transformed.css_variables = dto.css_variables;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    if ('is_default' in dto && dto.is_default !== undefined) {
      transformed.is_default = dto.is_default;
    }
    if ('sort_order' in dto && dto.sort_order !== undefined) {
      transformed.sort_order = dto.sort_order;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('themes').select('themes.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'themes.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: ThemesListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Themes filters based on intelligent field categorization
    if (filters.is_active !== undefined) {
      query.where('themes.is_active', filters.is_active);
    }
    if (filters.is_default !== undefined) {
      query.where('themes.is_default', filters.is_default);
    }
    if (filters.updated_at_min !== undefined) {
      query.where('themes.updated_at', '>=', filters.updated_at_min);
    }
    if (filters.updated_at_max !== undefined) {
      query.where('themes.updated_at', '<=', filters.updated_at_max);
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
      id: 'themes.id',
      name: 'themes.name',
      displayName: 'themes.display_name',
      description: 'themes.description',
      previewImageUrl: 'themes.preview_image_url',
      colorPalette: 'themes.color_palette',
      cssVariables: 'themes.css_variables',
      isActive: 'themes.is_active',
      isDefault: 'themes.is_default',
      sortOrder: 'themes.sort_order',
      createdAt: 'themes.created_at',
      updatedAt: 'themes.updated_at',
    };

    return sortFields[sortBy] || 'themes.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetThemesQuery = {},
  ): Promise<Themes | null> {
    let query = this.getJoinQuery();
    query = query.where('themes.id', id);

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
    query: ThemesListQuery = {},
  ): Promise<PaginatedListResult<Themes>> {
    return super.list(query);
  }

  // Business-specific methods for unique/important fields

  async findByName(name: string): Promise<Themes | null> {
    const query = this.getJoinQuery();
    const row = await query.where('themes.name', name).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByDisplayName(displayName: string): Promise<Themes | null> {
    const query = this.getJoinQuery();
    const row = await query.where('themes.display_name', displayName).first();
    return row ? this.transformToEntity(row) : null;
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('themes')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateThemes[]): Promise<Themes[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('themes')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateThemes): Promise<Themes> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('themes').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}
