import { BaseService } from '../../../shared/services/base.service';
import { BooksRepository } from '../repositories/books.repository';
import {
  type Books,
  type CreateBooks,
  type UpdateBooks,
  type GetBooksQuery,
  type ListBooksQuery,
} from '../types/books.types';

/**
 * Books Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class BooksService extends BaseService<Books, CreateBooks, UpdateBooks> {
  constructor(private booksRepository: BooksRepository) {
    super(booksRepository);
  }

  /**
   * Get books by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetBooksQuery = {},
  ): Promise<Books | null> {
    const books = await this.getById(id);

    if (books) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return books;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListBooksQuery = {}): Promise<{
    data: Books[];
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
   * Create new books
   */
  async create(data: CreateBooks): Promise<Books> {
    const books = await super.create(data);

    return books;
  }

  /**
   * Update existing books
   */
  async update(id: string | number, data: UpdateBooks): Promise<Books | null> {
    const books = await super.update(id, data);

    return books;
  }

  /**
   * Delete books
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete books with ID:', id);

      // Check if books exists first
      const existing = await this.booksRepository.findById(id);
      if (!existing) {
        console.log('Books not found for deletion:', id);
        return false;
      }

      console.log('Found books to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.booksRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Books deleted successfully:', {
          id,
          name: existing.title,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting books:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating books
   */
  protected async validateCreate(data: CreateBooks): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateBooks): Promise<CreateBooks> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after books creation
   */
  protected async afterCreate(
    books: Books,
    _originalData: CreateBooks,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Books created:',
      JSON.stringify(books),
      '(ID: ' + books.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: Books,
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

    const result = await this.booksRepository.list({
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
   * Bulk create multiple bookss
   */
  async bulkCreate(data: { items: CreateBooks[] }): Promise<{
    created: Books[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Books[] = [];
    const errors: any[] = [];

    // Validate and process all items first
    const validItems: CreateBooks[] = [];
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
          const created = await this.booksRepository.create(item);
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
   * Bulk update multiple bookss
   */
  async bulkUpdate(data: {
    items: Array<{ id: string | number; data: UpdateBooks }>;
  }): Promise<{
    updated: Books[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Books[] = [];
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
   * Bulk delete multiple bookss
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
    return this.booksRepository.getStats();
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
    const result = await this.booksRepository.list(query);

    // Return raw data - ExportService will handle formatting
    return result.data;
  }

  /**
   * Format single record for export
   */
  private formatExportRecord(record: Books, fields?: string[]): any {
    const formatted: any = {};

    // Define all exportable fields
    const exportableFields: { [key: string]: string | ((value: any) => any) } =
      {
        id: 'Id',
        title: 'Title',
        description: 'Description',
        author_id: 'Author id',
        isbn: 'Isbn',
        pages: 'Pages',
        published_date: 'Published date',
        price: 'Price',
        genre: 'Genre',
        available: 'Available',
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
