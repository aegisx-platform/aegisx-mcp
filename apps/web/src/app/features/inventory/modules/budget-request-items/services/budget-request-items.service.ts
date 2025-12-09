import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  BudgetRequestItem,
  CreateBudgetRequestItemRequest,
  UpdateBudgetRequestItemRequest,
  ListBudgetRequestItemQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse,
  ImportOptions,
  ValidateImportResponse,
  ExecuteImportRequest,
  ImportJob,
} from '../types/budget-request-items.types';

@Injectable({
  providedIn: 'root',
})
export class BudgetRequestItemService {
  private http = inject(HttpClient);
  private baseUrl = '/inventory/budget/budget-request-items';

  // ===== SIGNALS FOR STATE MANAGEMENT =====

  private budgetRequestItemsListSignal = signal<BudgetRequestItem[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private permissionErrorSignal = signal<boolean>(false);
  private lastErrorStatusSignal = signal<number | null>(null);
  private selectedBudgetRequestItemSignal = signal<BudgetRequestItem | null>(
    null,
  );
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalBudgetRequestItemSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====

  readonly budgetRequestItemsList =
    this.budgetRequestItemsListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly permissionError = this.permissionErrorSignal.asReadonly();
  readonly lastErrorStatus = this.lastErrorStatusSignal.asReadonly();
  readonly selectedBudgetRequestItem =
    this.selectedBudgetRequestItemSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalBudgetRequestItem =
    this.totalBudgetRequestItemSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====

  readonly totalPages = computed(() => {
    const total = this.totalBudgetRequestItemSignal();
    const size = this.pageSizeSignal();
    return Math.ceil(total / size);
  });

  readonly hasNextPage = computed(() => {
    return this.currentPageSignal() < this.totalPages();
  });

  readonly hasPreviousPage = computed(() => {
    return this.currentPageSignal() > 1;
  });

  // ===== ERROR HANDLING HELPER =====

  /**
   * Handle HTTP errors and set appropriate error signals
   * - 400 errors: Don't set error state (validation errors should show toast only)
   * - 403 errors: Set permission error for access denied
   * - 5xx errors: Set error state for server errors (show full page error)
   */
  private handleError(error: any, defaultMessage: string): void {
    const status = error?.status || null;
    this.lastErrorStatusSignal.set(status);

    // Check if error is 403 Forbidden
    if (status === 403) {
      this.permissionErrorSignal.set(true);
      this.errorSignal.set('You do not have permission to perform this action');
    } else if (
      status === 400 ||
      status === 404 ||
      status === 409 ||
      status === 422
    ) {
      // Client errors (validation, not found, conflict) - don't set error state
      // These should be handled by the component showing a toast
      this.permissionErrorSignal.set(false);
      // Don't set errorSignal - let component handle with toast
    } else {
      // Server errors (5xx) or unknown errors - show full page error
      this.permissionErrorSignal.set(false);
      this.errorSignal.set(error.message || defaultMessage);
    }
  }

  /**
   * Clear permission error state
   */
  clearPermissionError(): void {
    this.permissionErrorSignal.set(false);
    this.lastErrorStatusSignal.set(null);
  }

  // ===== STANDARD CRUD OPERATIONS =====

  /**
   * Load budgetRequestItems list with pagination and filters
   */
  async loadBudgetRequestItemList(
    params?: ListBudgetRequestItemQuery,
  ): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Build HTTP params
      let httpParams = new HttpParams();
      if (params?.page)
        httpParams = httpParams.set('page', params.page.toString());
      if (params?.limit)
        httpParams = httpParams.set('limit', params.limit.toString());
      if (params?.sort) httpParams = httpParams.set('sort', params.sort);

      // Handle fields array parameter (multiple values)
      if (params?.fields && params.fields.length > 0) {
        params.fields.forEach((field: string) => {
          httpParams = httpParams.append('fields', field);
        });
      }

      // Add smart filter parameters based on table schema
      // Numeric filtering for budget_request_id
      if (params?.budget_request_id !== undefined)
        httpParams = httpParams.set(
          'budget_request_id',
          params.budget_request_id.toString(),
        );
      if (params?.budget_request_id_min !== undefined)
        httpParams = httpParams.set(
          'budget_request_id_min',
          params.budget_request_id_min.toString(),
        );
      if (params?.budget_request_id_max !== undefined)
        httpParams = httpParams.set(
          'budget_request_id_max',
          params.budget_request_id_max.toString(),
        );
      // Numeric filtering for budget_id
      if (params?.budget_id !== undefined)
        httpParams = httpParams.set('budget_id', params.budget_id.toString());
      if (params?.budget_id_min !== undefined)
        httpParams = httpParams.set(
          'budget_id_min',
          params.budget_id_min.toString(),
        );
      if (params?.budget_id_max !== undefined)
        httpParams = httpParams.set(
          'budget_id_max',
          params.budget_id_max.toString(),
        );
      // Numeric filtering for requested_amount
      if (params?.requested_amount !== undefined)
        httpParams = httpParams.set(
          'requested_amount',
          params.requested_amount.toString(),
        );
      if (params?.requested_amount_min !== undefined)
        httpParams = httpParams.set(
          'requested_amount_min',
          params.requested_amount_min.toString(),
        );
      if (params?.requested_amount_max !== undefined)
        httpParams = httpParams.set(
          'requested_amount_max',
          params.requested_amount_max.toString(),
        );
      // Numeric filtering for q1_qty
      if (params?.q1_qty !== undefined)
        httpParams = httpParams.set('q1_qty', params.q1_qty.toString());
      if (params?.q1_qty_min !== undefined)
        httpParams = httpParams.set('q1_qty_min', params.q1_qty_min.toString());
      if (params?.q1_qty_max !== undefined)
        httpParams = httpParams.set('q1_qty_max', params.q1_qty_max.toString());
      // Numeric filtering for q2_qty
      if (params?.q2_qty !== undefined)
        httpParams = httpParams.set('q2_qty', params.q2_qty.toString());
      if (params?.q2_qty_min !== undefined)
        httpParams = httpParams.set('q2_qty_min', params.q2_qty_min.toString());
      if (params?.q2_qty_max !== undefined)
        httpParams = httpParams.set('q2_qty_max', params.q2_qty_max.toString());
      // Numeric filtering for q3_qty
      if (params?.q3_qty !== undefined)
        httpParams = httpParams.set('q3_qty', params.q3_qty.toString());
      if (params?.q3_qty_min !== undefined)
        httpParams = httpParams.set('q3_qty_min', params.q3_qty_min.toString());
      if (params?.q3_qty_max !== undefined)
        httpParams = httpParams.set('q3_qty_max', params.q3_qty_max.toString());
      // Numeric filtering for q4_qty
      if (params?.q4_qty !== undefined)
        httpParams = httpParams.set('q4_qty', params.q4_qty.toString());
      if (params?.q4_qty_min !== undefined)
        httpParams = httpParams.set('q4_qty_min', params.q4_qty_min.toString());
      if (params?.q4_qty_max !== undefined)
        httpParams = httpParams.set('q4_qty_max', params.q4_qty_max.toString());
      // String filtering for item_justification
      if (params?.item_justification)
        httpParams = httpParams.set(
          'item_justification',
          params.item_justification,
        );
      // Date/DateTime filtering for created_at
      if (params?.created_at)
        httpParams = httpParams.set('created_at', params.created_at);
      if (params?.created_at_min)
        httpParams = httpParams.set('created_at_min', params.created_at_min);
      if (params?.created_at_max)
        httpParams = httpParams.set('created_at_max', params.created_at_max);
      // Date/DateTime filtering for updated_at
      if (params?.updated_at)
        httpParams = httpParams.set('updated_at', params.updated_at);
      if (params?.updated_at_min)
        httpParams = httpParams.set('updated_at_min', params.updated_at_min);
      if (params?.updated_at_max)
        httpParams = httpParams.set('updated_at_max', params.updated_at_max);
      // Numeric filtering for drug_id
      if (params?.drug_id !== undefined)
        httpParams = httpParams.set('drug_id', params.drug_id.toString());
      if (params?.drug_id_min !== undefined)
        httpParams = httpParams.set(
          'drug_id_min',
          params.drug_id_min.toString(),
        );
      if (params?.drug_id_max !== undefined)
        httpParams = httpParams.set(
          'drug_id_max',
          params.drug_id_max.toString(),
        );
      // Numeric filtering for generic_id
      if (params?.generic_id !== undefined)
        httpParams = httpParams.set('generic_id', params.generic_id.toString());
      if (params?.generic_id_min !== undefined)
        httpParams = httpParams.set(
          'generic_id_min',
          params.generic_id_min.toString(),
        );
      if (params?.generic_id_max !== undefined)
        httpParams = httpParams.set(
          'generic_id_max',
          params.generic_id_max.toString(),
        );
      // String filtering for generic_code
      if (params?.generic_code)
        httpParams = httpParams.set('generic_code', params.generic_code);
      // String filtering for generic_name
      if (params?.generic_name)
        httpParams = httpParams.set('generic_name', params.generic_name);
      // String filtering for package_size
      if (params?.package_size)
        httpParams = httpParams.set('package_size', params.package_size);
      // String filtering for unit
      if (params?.unit) httpParams = httpParams.set('unit', params.unit);
      // Numeric filtering for line_number
      if (params?.line_number !== undefined)
        httpParams = httpParams.set(
          'line_number',
          params.line_number.toString(),
        );
      if (params?.line_number_min !== undefined)
        httpParams = httpParams.set(
          'line_number_min',
          params.line_number_min.toString(),
        );
      if (params?.line_number_max !== undefined)
        httpParams = httpParams.set(
          'line_number_max',
          params.line_number_max.toString(),
        );
      // Numeric filtering for avg_usage
      if (params?.avg_usage !== undefined)
        httpParams = httpParams.set('avg_usage', params.avg_usage.toString());
      if (params?.avg_usage_min !== undefined)
        httpParams = httpParams.set(
          'avg_usage_min',
          params.avg_usage_min.toString(),
        );
      if (params?.avg_usage_max !== undefined)
        httpParams = httpParams.set(
          'avg_usage_max',
          params.avg_usage_max.toString(),
        );
      // Numeric filtering for estimated_usage_2569
      if (params?.estimated_usage_2569 !== undefined)
        httpParams = httpParams.set(
          'estimated_usage_2569',
          params.estimated_usage_2569.toString(),
        );
      if (params?.estimated_usage_2569_min !== undefined)
        httpParams = httpParams.set(
          'estimated_usage_2569_min',
          params.estimated_usage_2569_min.toString(),
        );
      if (params?.estimated_usage_2569_max !== undefined)
        httpParams = httpParams.set(
          'estimated_usage_2569_max',
          params.estimated_usage_2569_max.toString(),
        );
      // Numeric filtering for current_stock
      if (params?.current_stock !== undefined)
        httpParams = httpParams.set(
          'current_stock',
          params.current_stock.toString(),
        );
      if (params?.current_stock_min !== undefined)
        httpParams = httpParams.set(
          'current_stock_min',
          params.current_stock_min.toString(),
        );
      if (params?.current_stock_max !== undefined)
        httpParams = httpParams.set(
          'current_stock_max',
          params.current_stock_max.toString(),
        );
      // Numeric filtering for estimated_purchase
      if (params?.estimated_purchase !== undefined)
        httpParams = httpParams.set(
          'estimated_purchase',
          params.estimated_purchase.toString(),
        );
      if (params?.estimated_purchase_min !== undefined)
        httpParams = httpParams.set(
          'estimated_purchase_min',
          params.estimated_purchase_min.toString(),
        );
      if (params?.estimated_purchase_max !== undefined)
        httpParams = httpParams.set(
          'estimated_purchase_max',
          params.estimated_purchase_max.toString(),
        );
      // Numeric filtering for unit_price
      if (params?.unit_price !== undefined)
        httpParams = httpParams.set('unit_price', params.unit_price.toString());
      if (params?.unit_price_min !== undefined)
        httpParams = httpParams.set(
          'unit_price_min',
          params.unit_price_min.toString(),
        );
      if (params?.unit_price_max !== undefined)
        httpParams = httpParams.set(
          'unit_price_max',
          params.unit_price_max.toString(),
        );
      // Numeric filtering for requested_qty
      if (params?.requested_qty !== undefined)
        httpParams = httpParams.set(
          'requested_qty',
          params.requested_qty.toString(),
        );
      if (params?.requested_qty_min !== undefined)
        httpParams = httpParams.set(
          'requested_qty_min',
          params.requested_qty_min.toString(),
        );
      if (params?.requested_qty_max !== undefined)
        httpParams = httpParams.set(
          'requested_qty_max',
          params.requested_qty_max.toString(),
        );
      // Numeric filtering for budget_type_id
      if (params?.budget_type_id !== undefined)
        httpParams = httpParams.set(
          'budget_type_id',
          params.budget_type_id.toString(),
        );
      if (params?.budget_type_id_min !== undefined)
        httpParams = httpParams.set(
          'budget_type_id_min',
          params.budget_type_id_min.toString(),
        );
      if (params?.budget_type_id_max !== undefined)
        httpParams = httpParams.set(
          'budget_type_id_max',
          params.budget_type_id_max.toString(),
        );
      // Numeric filtering for budget_category_id
      if (params?.budget_category_id !== undefined)
        httpParams = httpParams.set(
          'budget_category_id',
          params.budget_category_id.toString(),
        );
      if (params?.budget_category_id_min !== undefined)
        httpParams = httpParams.set(
          'budget_category_id_min',
          params.budget_category_id_min.toString(),
        );
      if (params?.budget_category_id_max !== undefined)
        httpParams = httpParams.set(
          'budget_category_id_max',
          params.budget_category_id_max.toString(),
        );

      const response = await this.http
        .get<
          PaginatedResponse<BudgetRequestItem>
        >(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.budgetRequestItemsListSignal.set(response.data);

        if (response.pagination) {
          this.totalBudgetRequestItemSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.handleError(error, 'Failed to load budgetRequestItems list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single budgetRequestItems by ID
   */
  async loadBudgetRequestItemById(
    id: number,
  ): Promise<BudgetRequestItem | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<BudgetRequestItem>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedBudgetRequestItemSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to load budgetRequestItems');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new budgetRequestItems
   */
  async createBudgetRequestItem(
    data: CreateBudgetRequestItemRequest,
  ): Promise<BudgetRequestItem | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<BudgetRequestItem>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to create budgetRequestItems');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing budgetRequestItems
   */
  async updateBudgetRequestItem(
    id: number,
    data: UpdateBudgetRequestItemRequest,
  ): Promise<BudgetRequestItem | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<BudgetRequestItem>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to update budgetRequestItems');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete budgetRequestItems by ID
   */
  async deleteBudgetRequestItem(id: number): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success) {
        // ✅ Return success without optimistic update
        // List component will refresh via reloadTrigger
        return true;
      }
      return false;
    } catch (error: any) {
      this.handleError(error, 'Failed to delete budgetRequestItems');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS (BULK & DROPDOWN) =====

  /**
   * Get dropdown options for budgetRequestItems
   */
  async getDropdownOptions(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{ value: string; label: string }>;
            total: number;
          }>
        >(`${this.baseUrl}/dropdown`, { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error(
        'Failed to fetch budgetRequestItems dropdown options:',
        error,
      );
      return [];
    }
  }

  /**
   * Get budget_requests dropdown options for budget_request_id field
   */
  async getBudgetRequestsDropdown(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string; disabled?: boolean }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{
              value: string;
              label: string;
              disabled?: boolean;
            }>;
            total: number;
          }>
        >('/budget_requests/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch budget_requests dropdown options:', error);
      return [];
    }
  }

  /**
   * Get budgets dropdown options for budget_id field
   */
  async getBudgetsDropdown(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string; disabled?: boolean }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{
              value: string;
              label: string;
              disabled?: boolean;
            }>;
            total: number;
          }>
        >('/budgets/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch budgets dropdown options:', error);
      return [];
    }
  }

  /**
   * Get drugs dropdown options for drug_id field
   */
  async getDrugsDropdown(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string; disabled?: boolean }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{
              value: string;
              label: string;
              disabled?: boolean;
            }>;
            total: number;
          }>
        >('/drugs/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch drugs dropdown options:', error);
      return [];
    }
  }

  /**
   * Get drug_generics dropdown options for generic_id field
   */
  async getDrugGenericsDropdown(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string; disabled?: boolean }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{
              value: string;
              label: string;
              disabled?: boolean;
            }>;
            total: number;
          }>
        >('/drug_generics/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch drug_generics dropdown options:', error);
      return [];
    }
  }

  /**
   * Get budget_types dropdown options for budget_type_id field
   */
  async getBudgetTypesDropdown(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string; disabled?: boolean }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{
              value: string;
              label: string;
              disabled?: boolean;
            }>;
            total: number;
          }>
        >('/budget_types/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch budget_types dropdown options:', error);
      return [];
    }
  }

  /**
   * Get budget_categories dropdown options for budget_category_id field
   */
  async getBudgetCategoriesDropdown(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string; disabled?: boolean }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{
              value: string;
              label: string;
              disabled?: boolean;
            }>;
            total: number;
          }>
        >('/budget_categories/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error(
        'Failed to fetch budget_categories dropdown options:',
        error,
      );
      return [];
    }
  }

  /**
   * Bulk create budgetRequestItemss
   */
  async bulkCreateBudgetRequestItem(
    items: CreateBudgetRequestItemRequest[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBudgetRequestItemList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk create budgetRequestItemss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update budgetRequestItemss
   */
  async bulkUpdateBudgetRequestItem(
    items: Array<{ id: number; data: UpdateBudgetRequestItemRequest }>,
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBudgetRequestItemList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk update budgetRequestItemss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete budgetRequestItemss
   */
  async bulkDeleteBudgetRequestItem(
    ids: number[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBudgetRequestItemList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk delete budgetRequestItemss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== BULK IMPORT OPERATIONS =====

  /**
   * Download import template
   */
  downloadImportTemplate(
    format: 'csv' | 'excel' = 'excel',
    includeExample: boolean = true,
  ): Observable<Blob> {
    const httpParams = new HttpParams()
      .set('format', format)
      .set('includeExample', includeExample.toString());

    return this.http.get(`${this.baseUrl}/import/template`, {
      params: httpParams,
      responseType: 'blob',
    });
  }

  /**
   * Validate import file
   */
  async validateImportFile(
    file: File,
    options?: ImportOptions,
  ): Promise<ApiResponse<ValidateImportResponse> | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (options) {
        formData.append('options', JSON.stringify(options));
      }

      const response = await this.http
        .post<
          ApiResponse<ValidateImportResponse>
        >(`${this.baseUrl}/import/validate`, formData)
        .toPromise();

      return response || null;
    } catch (error: any) {
      this.handleError(error, 'Failed to validate import file');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Execute import with validated session
   */
  async executeImport(
    sessionId: string,
    options?: ImportOptions,
  ): Promise<ApiResponse<ImportJob> | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const requestBody: ExecuteImportRequest = {
        sessionId,
        options,
      };

      const response = await this.http
        .post<
          ApiResponse<ImportJob>
        >(`${this.baseUrl}/import/execute`, requestBody)
        .toPromise();

      return response || null;
    } catch (error: any) {
      this.handleError(error, 'Failed to execute import');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Get import job status
   */
  async getImportStatus(jobId: string): Promise<ApiResponse<ImportJob> | null> {
    try {
      const response = await this.http
        .get<ApiResponse<ImportJob>>(`${this.baseUrl}/import/status/${jobId}`)
        .toPromise();

      return response || null;
    } catch (error: any) {
      console.error('Failed to get import status:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Set current page
   */
  setCurrentPage(page: number): void {
    this.currentPageSignal.set(page);
  }

  /**
   * Set page size and reset to first page
   */
  setPageSize(size: number): void {
    this.pageSizeSignal.set(size);
    this.currentPageSignal.set(1);
  }

  /**
   * Select budgetRequestItems
   */
  selectBudgetRequestItem(budgetRequestItems: BudgetRequestItem | null): void {
    this.selectedBudgetRequestItemSignal.set(budgetRequestItems);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
    this.clearPermissionError();
  }

  /**
   * Batch update budget request items (Mode 1 - for editing 2000-3000 items)
   * POST /budget-request-items/batch-update
   * Max 100 items per request, only works on DRAFT status items
   */
  async batchUpdateBudgetRequestItems(
    items: Array<{
      id: number;
      estimated_usage_2569?: number;
      unit_price?: number;
      requested_qty?: number;
      q1_qty?: number;
      q2_qty?: number;
      q3_qty?: number;
      q4_qty?: number;
    }>,
  ): Promise<{
    success: boolean;
    updated: number;
    failed: number;
    errors?: Array<{ id: number; error: string }>;
  } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http
        .post<
          ApiResponse<{
            updated: number;
            failed: number;
            errors?: Array<{ id: number; error: string }>;
          }>
        >(`${this.baseUrl}/batch-update`, { items })
        .toPromise();

      if (response) {
        return {
          success: response.success,
          ...response.data,
        };
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to batch update budget request items');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.budgetRequestItemsListSignal.set([]);
    this.selectedBudgetRequestItemSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.clearPermissionError();
    this.totalBudgetRequestItemSignal.set(0);
  }
}
