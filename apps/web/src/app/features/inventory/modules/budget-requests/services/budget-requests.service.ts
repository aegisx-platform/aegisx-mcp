import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  BudgetRequest,
  CreateBudgetRequestRequest,
  UpdateBudgetRequestRequest,
  ListBudgetRequestQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse,
  ImportOptions,
  ValidateImportResponse,
  ExecuteImportRequest,
  ImportJob,
} from '../types/budget-requests.types';

@Injectable({
  providedIn: 'root',
})
export class BudgetRequestService {
  private http = inject(HttpClient);
  private baseUrl = '/inventory/budget/budget-requests';

  // ===== SIGNALS FOR STATE MANAGEMENT =====

  private budgetRequestsListSignal = signal<BudgetRequest[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private permissionErrorSignal = signal<boolean>(false);
  private lastErrorStatusSignal = signal<number | null>(null);
  private selectedBudgetRequestSignal = signal<BudgetRequest | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalBudgetRequestSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====

  readonly budgetRequestsList = this.budgetRequestsListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly permissionError = this.permissionErrorSignal.asReadonly();
  readonly lastErrorStatus = this.lastErrorStatusSignal.asReadonly();
  readonly selectedBudgetRequest =
    this.selectedBudgetRequestSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalBudgetRequest = this.totalBudgetRequestSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====

  readonly totalPages = computed(() => {
    const total = this.totalBudgetRequestSignal();
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
   * Load budgetRequests list with pagination and filters
   */
  async loadBudgetRequestList(params?: ListBudgetRequestQuery): Promise<void> {
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
      // String filtering for request_number
      if (params?.request_number)
        httpParams = httpParams.set('request_number', params.request_number);
      // Numeric filtering for fiscal_year
      if (params?.fiscal_year !== undefined)
        httpParams = httpParams.set(
          'fiscal_year',
          params.fiscal_year.toString(),
        );
      if (params?.fiscal_year_min !== undefined)
        httpParams = httpParams.set(
          'fiscal_year_min',
          params.fiscal_year_min.toString(),
        );
      if (params?.fiscal_year_max !== undefined)
        httpParams = httpParams.set(
          'fiscal_year_max',
          params.fiscal_year_max.toString(),
        );
      // Numeric filtering for department_id
      if (params?.department_id !== undefined)
        httpParams = httpParams.set(
          'department_id',
          params.department_id.toString(),
        );
      if (params?.department_id_min !== undefined)
        httpParams = httpParams.set(
          'department_id_min',
          params.department_id_min.toString(),
        );
      if (params?.department_id_max !== undefined)
        httpParams = httpParams.set(
          'department_id_max',
          params.department_id_max.toString(),
        );
      // Numeric filtering for total_requested_amount
      if (params?.total_requested_amount !== undefined)
        httpParams = httpParams.set(
          'total_requested_amount',
          params.total_requested_amount.toString(),
        );
      if (params?.total_requested_amount_min !== undefined)
        httpParams = httpParams.set(
          'total_requested_amount_min',
          params.total_requested_amount_min.toString(),
        );
      if (params?.total_requested_amount_max !== undefined)
        httpParams = httpParams.set(
          'total_requested_amount_max',
          params.total_requested_amount_max.toString(),
        );
      // String filtering for justification
      if (params?.justification)
        httpParams = httpParams.set('justification', params.justification);
      // String filtering for submitted_by
      if (params?.submitted_by)
        httpParams = httpParams.set('submitted_by', params.submitted_by);
      // Date/DateTime filtering for submitted_at
      if (params?.submitted_at)
        httpParams = httpParams.set('submitted_at', params.submitted_at);
      if (params?.submitted_at_min)
        httpParams = httpParams.set(
          'submitted_at_min',
          params.submitted_at_min,
        );
      if (params?.submitted_at_max)
        httpParams = httpParams.set(
          'submitted_at_max',
          params.submitted_at_max,
        );
      // String filtering for dept_reviewed_by
      if (params?.dept_reviewed_by)
        httpParams = httpParams.set(
          'dept_reviewed_by',
          params.dept_reviewed_by,
        );
      // Date/DateTime filtering for dept_reviewed_at
      if (params?.dept_reviewed_at)
        httpParams = httpParams.set(
          'dept_reviewed_at',
          params.dept_reviewed_at,
        );
      if (params?.dept_reviewed_at_min)
        httpParams = httpParams.set(
          'dept_reviewed_at_min',
          params.dept_reviewed_at_min,
        );
      if (params?.dept_reviewed_at_max)
        httpParams = httpParams.set(
          'dept_reviewed_at_max',
          params.dept_reviewed_at_max,
        );
      // String filtering for dept_comments
      if (params?.dept_comments)
        httpParams = httpParams.set('dept_comments', params.dept_comments);
      // String filtering for finance_reviewed_by
      if (params?.finance_reviewed_by)
        httpParams = httpParams.set(
          'finance_reviewed_by',
          params.finance_reviewed_by,
        );
      // Date/DateTime filtering for finance_reviewed_at
      if (params?.finance_reviewed_at)
        httpParams = httpParams.set(
          'finance_reviewed_at',
          params.finance_reviewed_at,
        );
      if (params?.finance_reviewed_at_min)
        httpParams = httpParams.set(
          'finance_reviewed_at_min',
          params.finance_reviewed_at_min,
        );
      if (params?.finance_reviewed_at_max)
        httpParams = httpParams.set(
          'finance_reviewed_at_max',
          params.finance_reviewed_at_max,
        );
      // String filtering for finance_comments
      if (params?.finance_comments)
        httpParams = httpParams.set(
          'finance_comments',
          params.finance_comments,
        );
      // String filtering for rejection_reason
      if (params?.rejection_reason)
        httpParams = httpParams.set(
          'rejection_reason',
          params.rejection_reason,
        );
      // String filtering for created_by
      if (params?.created_by)
        httpParams = httpParams.set('created_by', params.created_by);
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
      // Date/DateTime filtering for deleted_at
      if (params?.deleted_at)
        httpParams = httpParams.set('deleted_at', params.deleted_at);
      if (params?.deleted_at_min)
        httpParams = httpParams.set('deleted_at_min', params.deleted_at_min);
      if (params?.deleted_at_max)
        httpParams = httpParams.set('deleted_at_max', params.deleted_at_max);
      // Boolean filtering for is_active
      if (params?.is_active !== undefined)
        httpParams = httpParams.set('is_active', params.is_active.toString());

      const response = await this.http
        .get<
          PaginatedResponse<BudgetRequest>
        >(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.budgetRequestsListSignal.set(response.data);

        if (response.pagination) {
          this.totalBudgetRequestSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.handleError(error, 'Failed to load budgetRequests list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single budgetRequests by ID
   */
  async loadBudgetRequestById(id: number): Promise<BudgetRequest | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<BudgetRequest>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedBudgetRequestSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to load budgetRequests');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new budgetRequests
   */
  async createBudgetRequest(
    data: CreateBudgetRequestRequest,
  ): Promise<BudgetRequest | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<BudgetRequest>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to create budgetRequests');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing budgetRequests
   */
  async updateBudgetRequest(
    id: number,
    data: UpdateBudgetRequestRequest,
  ): Promise<BudgetRequest | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<BudgetRequest>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to update budgetRequests');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete budgetRequests by ID
   */
  async deleteBudgetRequest(id: number): Promise<boolean> {
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
      this.handleError(error, 'Failed to delete budgetRequests');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS (BULK & DROPDOWN) =====

  /**
   * Get dropdown options for budgetRequests
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
      console.error('Failed to fetch budgetRequests dropdown options:', error);
      return [];
    }
  }

  /**
   * Get departments dropdown options for department_id field
   */
  async getDepartmentsDropdown(
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
        >('/departments/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch departments dropdown options:', error);
      return [];
    }
  }

  /**
   * Bulk create budgetRequestss
   */
  async bulkCreateBudgetRequest(
    items: CreateBudgetRequestRequest[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBudgetRequestList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk create budgetRequestss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update budgetRequestss
   */
  async bulkUpdateBudgetRequest(
    items: Array<{ id: number; data: UpdateBudgetRequestRequest }>,
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBudgetRequestList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk update budgetRequestss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete budgetRequestss
   */
  async bulkDeleteBudgetRequest(ids: number[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBudgetRequestList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk delete budgetRequestss');
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
   * Select budgetRequests
   */
  selectBudgetRequest(budgetRequests: BudgetRequest | null): void {
    this.selectedBudgetRequestSignal.set(budgetRequests);
  }

  /**
   * Submit budget request for approval
   * POST /:id/submit
   * DRAFT → SUBMITTED
   */
  async submitBudgetRequest(id: number): Promise<BudgetRequest | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http
        .post<ApiResponse<BudgetRequest>>(`${this.baseUrl}/${id}/submit`, {})
        .toPromise();

      if (response) {
        this.selectedBudgetRequestSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to submit budget request');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Approve budget request by department head
   * POST /:id/approve-dept
   * SUBMITTED → DEPT_APPROVED
   */
  async approveDepartment(
    id: number,
    comments?: string,
  ): Promise<BudgetRequest | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http
        .post<
          ApiResponse<BudgetRequest>
        >(`${this.baseUrl}/${id}/approve-dept`, { comments })
        .toPromise();

      if (response) {
        this.selectedBudgetRequestSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to approve budget request (department)');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Approve budget request by finance manager
   * POST /:id/approve-finance
   * DEPT_APPROVED → FINANCE_APPROVED
   */
  async approveFinance(
    id: number,
    comments?: string,
  ): Promise<BudgetRequest | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http
        .post<
          ApiResponse<BudgetRequest>
        >(`${this.baseUrl}/${id}/approve-finance`, { comments })
        .toPromise();

      if (response) {
        this.selectedBudgetRequestSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to approve budget request (finance)');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
    this.clearPermissionError();
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.budgetRequestsListSignal.set([]);
    this.selectedBudgetRequestSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.clearPermissionError();
    this.totalBudgetRequestSignal.set(0);
  }

  /**
   * Initialize budget request with drug generics
   * Pull all active drug generics and calculate historical usage data
   */
  async initializeBudgetRequest(id: number): Promise<{
    success: boolean;
    itemsCreated: number;
    message: string;
  }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http
        .post<
          ApiResponse<{
            success: boolean;
            itemsCreated: number;
            message: string;
          }>
        >(`${this.baseUrl}/${id}/initialize`, {})
        .toPromise();

      if (response?.data) {
        return response.data;
      }

      throw new Error('Invalid response from server');
    } catch (error: any) {
      this.handleError(error, 'Failed to initialize budget request');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
