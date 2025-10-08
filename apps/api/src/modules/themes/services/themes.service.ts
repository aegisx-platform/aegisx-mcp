import { BaseService } from '../../../shared/services/base.service';
import { ThemesRepository } from '../repositories/themes.repository';
import {
  type Themes,
  type CreateThemes,
  type UpdateThemes,
  type GetThemesQuery,
  type ListThemesQuery,
} from '../types/themes.types';

/**
 * Themes Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ThemesService extends BaseService<
  Themes,
  CreateThemes,
  UpdateThemes
> {
  constructor(private themesRepository: ThemesRepository) {
    super(themesRepository);
  }

  /**
   * Get themes by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetThemesQuery = {},
  ): Promise<Themes | null> {
    const themes = await this.getById(id);

    if (themes) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return themes;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListThemesQuery = {}): Promise<{
    data: Themes[];
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
   * Create new themes
   */
  async create(data: CreateThemes): Promise<Themes> {
    const themes = await super.create(data);

    return themes;
  }

  /**
   * Update existing themes
   */
  async update(
    id: string | number,
    data: UpdateThemes,
  ): Promise<Themes | null> {
    const themes = await super.update(id, data);

    return themes;
  }

  /**
   * Delete themes
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete themes with ID:', id);

      // Check if themes exists first
      const existing = await this.themesRepository.findById(id);
      if (!existing) {
        console.log('Themes not found for deletion:', id);
        return false;
      }

      console.log('Found themes to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.themesRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Themes deleted successfully:', {
          id,
          name: existing.name,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting themes:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating themes
   */
  protected async validateCreate(data: CreateThemes): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateThemes): Promise<CreateThemes> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after themes creation
   */
  protected async afterCreate(
    themes: Themes,
    _originalData: CreateThemes,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Themes created:',
      JSON.stringify(themes),
      '(ID: ' + themes.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: Themes,
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
      labelField = 'name',
      valueField = 'id',
    } = options;

    const result = await this.themesRepository.list({
      limit,
      search,
      sort: `${labelField}:asc`,
    });

    const dropdownOptions = result.data.map((item) => ({
      value: item[valueField],
      label: item[labelField] || `${item.id}`,
      disabled: item.is_active === false,
    }));

    return {
      options: dropdownOptions,
      total: result.pagination.total,
    };
  }

  /**
   * Bulk create multiple themess
   */
  async bulkCreate(data: { items: CreateThemes[] }): Promise<{
    created: Themes[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Themes[] = [];
    const errors: any[] = [];

    // Validate and process all items first
    const validItems: CreateThemes[] = [];
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
          const created = await this.themesRepository.create(item);
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
   * Bulk update multiple themess
   */
  async bulkUpdate(data: {
    items: Array<{ id: string | number; data: UpdateThemes }>;
  }): Promise<{
    updated: Themes[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Themes[] = [];
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
   * Bulk delete multiple themess
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
   * Bulk update status for multiple themess
   */
  async bulkUpdateStatus(data: {
    ids: Array<string | number>;
    status: boolean;
  }): Promise<{
    updated: Themes[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Themes[] = [];
    const errors: any[] = [];

    for (const id of data.ids) {
      try {
        const updated = await this.update(id, {
          is_active: data.status,
        } as UpdateThemes);
        if (updated) {
          results.push(updated);
        }
      } catch (error) {
        errors.push({
          id,
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
   * Activate themes
   */
  async activate(
    id: string | number,
    options: any = {},
  ): Promise<Themes | null> {
    return this.update(id, { is_active: true } as UpdateThemes);
  }

  /**
   * Deactivate themes
   */
  async deactivate(
    id: string | number,
    options: any = {},
  ): Promise<Themes | null> {
    return this.update(id, { is_active: false } as UpdateThemes);
  }

  /**
   * Toggle themes status
   */
  async toggle(id: string | number, options: any = {}): Promise<Themes | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const newStatus = !current.is_active;
    return this.update(id, { is_active: newStatus } as UpdateThemes);
  }

  /**
   * Get basic statistics (count only)
   */
  async getStats(): Promise<{
    total: number;
  }> {
    return this.themesRepository.getStats();
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
    const result = await this.themesRepository.list(query);

    // Return raw data - ExportService will handle formatting
    return result.data;
  }

  /**
   * Format single record for export
   */
  private formatExportRecord(record: Themes, fields?: string[]): any {
    const formatted: any = {};

    // Define all exportable fields
    const exportableFields: { [key: string]: string | ((value: any) => any) } =
      {
        id: 'Id',
        name: 'Name',
        display_name: 'Display name',
        description: 'Description',
        preview_image_url: 'Preview image url',
        color_palette: 'Color palette',
        css_variables: 'Css variables',
        is_active: 'Is active',
        is_default: 'Is default',
        sort_order: 'Sort order',
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
