import { BaseService } from '../../../shared/services/base.service';
import { BudgetsRepository } from '../repositories/budgets.repository';
import {
  type Budgets,
  type CreateBudgets,
  type UpdateBudgets,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
  BudgetsErrorCode,
  BudgetsErrorMessages,
} from '../types/budgets.types';

/**
 * Budgets Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class BudgetsService extends BaseService<
  Budgets,
  CreateBudgets,
  UpdateBudgets
> {
  constructor(private budgetsRepository: BudgetsRepository) {
    super(budgetsRepository);
  }

  /**
   * Get budgets by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetBudgetsQuery = {},
  ): Promise<Budgets | null> {
    const budgets = await this.getById(id);

    if (budgets) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return budgets;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListBudgetsQuery = {}): Promise<{
    data: Budgets[];
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
   * Create new budgets
   */
  async create(data: CreateBudgets): Promise<Budgets> {
    const budgets = await super.create(data);

    return budgets;
  }

  /**
   * Update existing budgets
   */
  async update(
    id: string | number,
    data: UpdateBudgets,
  ): Promise<Budgets | null> {
    const budgets = await super.update(id, data);

    return budgets;
  }

  /**
   * Delete budgets
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete budgets with ID:', id);

      // Check if budgets exists first
      const existing = await this.budgetsRepository.findById(id);
      if (!existing) {
        console.log('Budgets not found for deletion:', id);
        return false;
      }

      console.log('Found budgets to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.budgetsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Budgets deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting budgets:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating budgets
   */
  protected async validateCreate(data: CreateBudgets): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // Check for duplicate budget_code
    if (data.budget_code) {
      const existing = await this.budgetsRepository.findByBudgetCode(
        data.budget_code,
      );
      if (existing) {
        const error = new Error(
          BudgetsErrorMessages[BudgetsErrorCode.DUPLICATE_BUDGET_CODE],
        ) as any;
        error.statusCode = 409;
        error.code = BudgetsErrorCode.DUPLICATE_BUDGET_CODE;
        throw error;
      }
    }

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateBudgets): Promise<CreateBudgets> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after budgets creation
   */
  protected async afterCreate(
    budgets: Budgets,
    _originalData: CreateBudgets,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Budgets created:',
      JSON.stringify(budgets),
      '(ID: ' + budgets.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Budgets,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
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
      labelField = 'budget_code',
      valueField = 'id',
    } = options;

    const result = await this.budgetsRepository.list({
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
   * Bulk create multiple budgetss
   */
  async bulkCreate(data: { items: CreateBudgets[] }): Promise<{
    created: Budgets[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Budgets[] = [];
    const errors: any[] = [];

    // Validate and process all items first
    const validItems: CreateBudgets[] = [];
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
          const created = await this.budgetsRepository.create(item);
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
   * Bulk update multiple budgetss
   */
  async bulkUpdate(data: {
    items: Array<{ id: string | number; data: UpdateBudgets }>;
  }): Promise<{
    updated: Budgets[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Budgets[] = [];
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
   * Bulk delete multiple budgetss
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
   * Bulk update status for multiple budgetss
   */
  async bulkUpdateStatus(data: {
    ids: Array<string | number>;
    status: boolean;
  }): Promise<{
    updated: Budgets[];
    summary: { successful: number; failed: number; errors: any[] };
  }> {
    const results: Budgets[] = [];
    const errors: any[] = [];

    for (const id of data.ids) {
      try {
        const updated = await this.update(id, {
          is_active: data.status,
        } as UpdateBudgets);
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
   * Activate budgets
   */
  async activate(
    id: string | number,
    options: any = {},
  ): Promise<Budgets | null> {
    return this.update(id, { is_active: true } as UpdateBudgets);
  }

  /**
   * Deactivate budgets
   */
  async deactivate(
    id: string | number,
    options: any = {},
  ): Promise<Budgets | null> {
    return this.update(id, { is_active: false } as UpdateBudgets);
  }

  /**
   * Toggle budgets status
   */
  async toggle(
    id: string | number,
    options: any = {},
  ): Promise<Budgets | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const newStatus = !current.is_active;
    return this.update(id, { is_active: newStatus } as UpdateBudgets);
  }

  /**
   * Get basic statistics (count only)
   */
  async getStats(): Promise<{
    total: number;
  }> {
    return this.budgetsRepository.getStats();
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
    const result = await this.budgetsRepository.list(query);

    // Return raw data - ExportService will handle formatting
    return result.data;
  }

  /**
   * Format single record for export
   */
  private formatExportRecord(record: Budgets, fields?: string[]): any {
    const formatted: any = {};

    // Define all exportable fields
    const exportableFields: { [key: string]: string | ((value: any) => any) } =
      {
        id: 'Id',
        budget_code: 'Budget code',
        budget_type: 'Budget type',
        budget_category: 'Budget category',
        budget_description: 'Budget description',
        is_active: 'Is active',
        created_at: 'Created at',
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
