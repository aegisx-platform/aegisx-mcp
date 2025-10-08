import { BaseService } from '../../../shared/services/base.service';
import { ArticlesRepository } from '../repositories/articles.repository';
import {
  type Articles,
  type CreateArticles,
  type UpdateArticles,
  type GetArticlesQuery,
  type ListArticlesQuery,
} from '../types/articles.types';

/**
 * Articles Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ArticlesService extends BaseService<
  Articles,
  CreateArticles,
  UpdateArticles
> {
  constructor(private articlesRepository: ArticlesRepository) {
    super(articlesRepository);
  }

  /**
   * Get articles by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetArticlesQuery = {},
  ): Promise<Articles | null> {
    const articles = await this.getById(id);

    if (articles) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return articles;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListArticlesQuery = {}): Promise<{
    data: Articles[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);

    return result;
  }

  /**
   * Create new articles
   */
  async create(data: CreateArticles): Promise<Articles> {
    const articles = await super.create(data);

    return articles;
  }

  /**
   * Update existing articles
   */
  async update(
    id: string | number,
    data: UpdateArticles,
  ): Promise<Articles | null> {
    const articles = await super.update(id, data);

    return articles;
  }

  /**
   * Delete articles
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete articles with ID:', id);

      // Check if articles exists first
      const existing = await this.articlesRepository.findById(id);
      if (!existing) {
        console.log('Articles not found for deletion:', id);
        return false;
      }

      console.log('Found articles to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.articlesRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Articles deleted successfully:', {
          id,
          name: existing.title,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting articles:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating articles
   */
  protected async validateCreate(data: CreateArticles): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateArticles): Promise<CreateArticles> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after articles creation
   */
  protected async afterCreate(
    articles: Articles,
    _originalData: CreateArticles,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Articles created:',
      JSON.stringify(articles),
      '(ID: ' + articles.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: Articles,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options for UI components
   */
  async getDropdownOptions(options: any = {}): Promise<{
    options: Array<{
      value: string | number;
      label: string;
      disabled?: boolean;
    }>;
    total: number;
  }> {
    const {
      limit = 100,
      search,
      labelField = 'title',
      valueField = 'id',
    } = options;

    const result = await this.articlesRepository.list({
      limit,
      search,
      sort: `${labelField}:asc`,
    });

    const dropdownOptions = result.data.map((item) => ({
      value: item[valueField],
      label: item[labelField] || `${item.id}`,
      disabled: false,
    }));

    return {
      options: dropdownOptions,
      total: result.pagination.total,
    };
  }

  /**
   * Bulk create multiple articless
   */
  async bulkCreate(data: { items: CreateArticles[] }): Promise<{
    created: Articles[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Articles[] = [];
    const errors: any[] = [];

    // Validate and process all items first
    const validItems: CreateArticles[] = [];
    for (const item of data.items) {
      try {
        await this.validateCreate(item);
        const processed = await this.beforeCreate(item);
        validItems.push(processed);
      } catch (error) {
        errors.push({
          item,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Bulk create valid items
    if (validItems.length > 0) {
      try {
        // Use individual creates instead of createMany for debugging
        for (const item of validItems) {
          const created = await this.articlesRepository.create(item);
          results.push(created);
        }

        // Call afterCreate for each created item
        for (let i = 0; i < results.length; i++) {
          try {
            await this.afterCreate(results[i], validItems[i]);
          } catch (error) {
            console.warn('Error in afterCreate:', error);
          }
        }
      } catch (error) {
        errors.push({
          item: 'bulk_operation',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      created: results,
      summary: {
        successful: results.length,
        failed: errors.length,
        errors,
      },
    };
  }

  /**
   * Bulk update multiple articless
   */
  async bulkUpdate(data: {
    items: Array<{ id: string | number; data: UpdateArticles }>;
  }): Promise<{
    updated: Articles[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Articles[] = [];
    const errors: any[] = [];

    for (const item of data.items) {
      try {
        const updated = await this.update(item.id, item.data);
        if (updated) {
          results.push(updated);
        }
      } catch (error) {
        errors.push({
          item,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      updated: results,
      summary: {
        successful: results.length,
        failed: errors.length,
        errors,
      },
    };
  }

  /**
   * Bulk delete multiple articless
   */
  async bulkDelete(data: { ids: Array<string | number> }): Promise<{
    deleted: Array<string | number>;
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Array<string | number> = [];
    const errors: any[] = [];

    for (const id of data.ids) {
      try {
        const deleted = await this.delete(id);
        if (deleted) {
          results.push(id);
        }
      } catch (error) {
        errors.push({
          id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      deleted: results,
      summary: {
        successful: results.length,
        failed: errors.length,
        errors,
      },
    };
  }

  /**
   * Get basic statistics (count only)
   */
  async getStats(): Promise<{
    total: number;
  }> {
    return this.articlesRepository.getStats();
  }

  /**
   * Get data for export with formatting
   */
  async getExportData(
    queryParams: any = {},
    fields?: string[],
  ): Promise<any[]> {
    // Get specific IDs if provided
    if (queryParams.ids && queryParams.ids.length > 0) {
      // Get specific records by IDs
      const records = await Promise.all(
        queryParams.ids.map((id: string) => this.getById(id)),
      );

      // Return raw data - ExportService will handle formatting
      return records.filter((record) => record !== null);
    }

    // Separate filters from pagination parameters to avoid SQL errors
    const { limit, offset, page, ...filters } = queryParams;

    // Build query parameters for data retrieval with proper pagination
    const query: any = {
      ...filters, // Only include actual filter parameters
      limit: limit || 50000, // Max export limit for performance
      page: 1, // Always start from first page for exports
    };

    // Get filtered data
    const result = await this.articlesRepository.list(query);

    // Return raw data - ExportService will handle formatting
    return result.data;
  }

  /**
   * Format single record for export
   */
  private formatExportRecord(record: Articles, fields?: string[]): any {
    const formatted: any = {};

    // Define all exportable fields
    const exportableFields: { [key: string]: string | ((value: any) => any) } =
      {
        id: 'Id',
        title: 'Title',
        content: 'Content',
        author_id: 'Author id',
        published: 'Published',
        published_at: 'Published at',
        view_count: 'View count',
        created_at: 'Created at',
        updated_at: 'Updated at',
      };

    // If specific fields requested, use only those
    const fieldsToExport =
      fields && fields.length > 0
        ? fields.filter((field) => exportableFields.hasOwnProperty(field))
        : Object.keys(exportableFields);

    // Format each field
    fieldsToExport.forEach((field) => {
      const fieldConfig = exportableFields[field];
      let value = (record as any)[field];

      // Apply field-specific formatting
      if (typeof fieldConfig === 'function') {
        value = fieldConfig(value);
      } else {
        // Apply default formatting based on field type
      }

      // Use field label as key for export
      const exportKey = typeof fieldConfig === 'string' ? fieldConfig : field;
      formatted[exportKey] = value;
    });

    return formatted;
  }
}
