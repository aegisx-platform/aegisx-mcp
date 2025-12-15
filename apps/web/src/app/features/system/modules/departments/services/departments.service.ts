import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  ListDepartmentQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse,
  ImportOptions,
  ValidateImportResponse,
  ExecuteImportRequest,
  ImportJob,
} from '../types/departments.types';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private http = inject(HttpClient);
  private baseUrl = '/v1/platform/departments';

  // ===== SIGNALS FOR STATE MANAGEMENT =====

  private departmentsListSignal = signal<Department[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private permissionErrorSignal = signal<boolean>(false);
  private lastErrorStatusSignal = signal<number | null>(null);
  private selectedDepartmentSignal = signal<Department | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalDepartmentSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====

  readonly departmentsList = this.departmentsListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly permissionError = this.permissionErrorSignal.asReadonly();
  readonly lastErrorStatus = this.lastErrorStatusSignal.asReadonly();
  readonly selectedDepartment = this.selectedDepartmentSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalDepartment = this.totalDepartmentSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====

  readonly totalPages = computed(() => {
    const total = this.totalDepartmentSignal();
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
   * Load departments list with pagination and filters
   */
  async loadDepartmentList(params?: ListDepartmentQuery): Promise<void> {
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
      // String filtering for dept_code
      if (params?.dept_code)
        httpParams = httpParams.set('dept_code', params.dept_code);
      // String filtering for dept_name
      if (params?.dept_name)
        httpParams = httpParams.set('dept_name', params.dept_name);
      // String filtering for his_code
      if (params?.his_code)
        httpParams = httpParams.set('his_code', params.his_code);
      // Numeric filtering for parent_id
      if (params?.parent_id !== undefined)
        httpParams = httpParams.set('parent_id', params.parent_id.toString());
      if (params?.parent_id_min !== undefined)
        httpParams = httpParams.set(
          'parent_id_min',
          params.parent_id_min.toString(),
        );
      if (params?.parent_id_max !== undefined)
        httpParams = httpParams.set(
          'parent_id_max',
          params.parent_id_max.toString(),
        );
      // Boolean filtering for is_active
      if (params?.is_active !== undefined)
        httpParams = httpParams.set('is_active', params.is_active.toString());
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

      const response = await this.http
        .get<
          PaginatedResponse<Department>
        >(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.departmentsListSignal.set(response.data);

        if (response.pagination) {
          this.totalDepartmentSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.handleError(error, 'Failed to load departments list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single departments by ID
   */
  async loadDepartmentById(id: number): Promise<Department | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<Department>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedDepartmentSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to load departments');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new departments
   */
  async createDepartment(
    data: CreateDepartmentRequest,
  ): Promise<Department | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<Department>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to create departments');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing departments
   */
  async updateDepartment(
    id: number,
    data: UpdateDepartmentRequest,
  ): Promise<Department | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<Department>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to update departments');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete departments by ID
   */
  async deleteDepartment(id: number): Promise<boolean> {
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
      this.handleError(error, 'Failed to delete departments');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load all departments for hierarchy view (no pagination)
   */
  async loadDepartmentHierarchy(): Promise<Department[]> {
    try {
      const response = await this.http
        .get<PaginatedResponse<Department>>(this.baseUrl, {
          params: new HttpParams().set('limit', '1000'), // Get all departments
        })
        .toPromise();

      if (response && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to load department hierarchy:', error);
      return [];
    }
  }

  /**
   * Get departments dropdown for parent selection
   */
  async getDepartmentsForDropdown(): Promise<Department[]> {
    try {
      const response = await this.http
        .get<PaginatedResponse<Department>>(this.baseUrl, {
          params: new HttpParams().set('limit', '1000').set('is_active', 'true'),
        })
        .toPromise();

      if (response && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to load departments dropdown:', error);
      return [];
    }
  }

  // ===== EXPORT OPERATIONS =====

  /**
   * Export departments data
   */
  async exportDepartment(options: {
    format: 'csv' | 'excel' | 'pdf';
    ids?: number[];
    filters?: Record<string, any>;
    fields?: string[];
    filename?: string;
    applyFilters?: boolean;
    includeMetadata?: boolean;
  }): Promise<Blob> {
    try {
      let httpParams = new HttpParams().set('format', options.format);

      if (options.ids && options.ids.length > 0) {
        options.ids.forEach((id) => {
          httpParams = httpParams.append('ids', id);
        });
      }

      if (options.filters && options.applyFilters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            httpParams = httpParams.set(`filters[${key}]`, String(value));
          }
        });
      }

      if (options.fields && options.fields.length > 0) {
        options.fields.forEach((field) => {
          httpParams = httpParams.append('fields', field);
        });
      }

      if (options.filename) {
        httpParams = httpParams.set('filename', options.filename);
      }

      if (options.applyFilters !== undefined) {
        httpParams = httpParams.set(
          'applyFilters',
          String(options.applyFilters),
        );
      }

      if (options.includeMetadata !== undefined) {
        httpParams = httpParams.set(
          'includeMetadata',
          String(options.includeMetadata),
        );
      }

      const response = await this.http
        .get(`${this.baseUrl}/export`, {
          params: httpParams,
          responseType: 'blob',
        })
        .toPromise();

      if (response) {
        return response;
      }

      throw new Error('Export failed - no response received');
    } catch (error: any) {
      console.error('Failed to export departments data:', error);
      throw error;
    }
  }

  // ===== ENHANCED OPERATIONS (BULK & DROPDOWN) =====

  /**
   * Get dropdown options for departments
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
      console.error('Failed to fetch departments dropdown options:', error);
      return [];
    }
  }

  /**
   * Get departments dropdown options for parent_id field
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
   * Bulk create departmentss
   */
  async bulkCreateDepartment(
    items: CreateDepartmentRequest[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadDepartmentList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk create departmentss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update departmentss
   */
  async bulkUpdateDepartment(
    items: Array<{ id: number; data: UpdateDepartmentRequest }>,
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadDepartmentList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk update departmentss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete departmentss
   */
  async bulkDeleteDepartment(ids: number[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadDepartmentList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk delete departmentss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ADVANCED OPERATIONS (FULL PACKAGE) =====

  /**
   * Validate departments data before save
   */
  async validateDepartment(
    data: CreateDepartmentRequest,
  ): Promise<{ valid: boolean; errors?: any[] }> {
    try {
      const response = await this.http
        .post<
          ApiResponse<{ valid: boolean; errors?: any[] }>
        >(`${this.baseUrl}/validate`, { data })
        .toPromise();

      if (response) {
        return response.data;
      }
      return { valid: false, errors: ['Validation failed'] };
    } catch (error: any) {
      console.error('Failed to validate departments:', error);
      return { valid: false, errors: [error.message || 'Validation error'] };
    }
  }

  /**
   * Check field uniqueness
   */
  async checkUniqueness(
    field: string,
    value: string,
    excludeId?: number,
  ): Promise<{ unique: boolean }> {
    try {
      let params = new HttpParams().set('value', value);

      if (excludeId) {
        params = params.set('excludeId', excludeId);
      }

      const response = await this.http
        .get<
          ApiResponse<{ unique: boolean }>
        >(`${this.baseUrl}/check/${field}`, { params })
        .toPromise();

      if (response) {
        return response.data;
      }
      return { unique: false };
    } catch (error: any) {
      console.error('Failed to check uniqueness:', error);
      return { unique: false };
    }
  }

  /**
   * Get departments statistics
   */
  async getStats(): Promise<{ total: number } | null> {
    try {
      const response = await this.http
        .get<ApiResponse<{ total: number }>>(`${this.baseUrl}/stats`)
        .toPromise();

      if (response) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to get departments stats:', error);
      return null;
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
   * Select departments
   */
  selectDepartment(departments: Department | null): void {
    this.selectedDepartmentSignal.set(departments);
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
    this.departmentsListSignal.set([]);
    this.selectedDepartmentSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.clearPermissionError();
    this.totalDepartmentSignal.set(0);
  }
}
