import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  Drug,
  CreateDrugRequest,
  UpdateDrugRequest,
  ListDrugQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse,
  ImportOptions,
  ValidateImportResponse,
  ExecuteImportRequest,
  ImportJob,
} from '../types/drugs.types';

// ===== SERVICE CONFIGURATION =====

const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class DrugService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/drugs`;

  // ===== SIGNALS FOR STATE MANAGEMENT =====

  private drugsListSignal = signal<Drug[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private permissionErrorSignal = signal<boolean>(false);
  private lastErrorStatusSignal = signal<number | null>(null);
  private selectedDrugSignal = signal<Drug | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalDrugSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====

  readonly drugsList = this.drugsListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly permissionError = this.permissionErrorSignal.asReadonly();
  readonly lastErrorStatus = this.lastErrorStatusSignal.asReadonly();
  readonly selectedDrug = this.selectedDrugSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalDrug = this.totalDrugSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====

  readonly totalPages = computed(() => {
    const total = this.totalDrugSignal();
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
   * Load drugs list with pagination and filters
   */
  async loadDrugList(params?: ListDrugQuery): Promise<void> {
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
      // String filtering for drug_code
      if (params?.drug_code)
        httpParams = httpParams.set('drug_code', params.drug_code);
      // String filtering for trade_name
      if (params?.trade_name)
        httpParams = httpParams.set('trade_name', params.trade_name);
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
      // Numeric filtering for manufacturer_id
      if (params?.manufacturer_id !== undefined)
        httpParams = httpParams.set(
          'manufacturer_id',
          params.manufacturer_id.toString(),
        );
      if (params?.manufacturer_id_min !== undefined)
        httpParams = httpParams.set(
          'manufacturer_id_min',
          params.manufacturer_id_min.toString(),
        );
      if (params?.manufacturer_id_max !== undefined)
        httpParams = httpParams.set(
          'manufacturer_id_max',
          params.manufacturer_id_max.toString(),
        );
      // Numeric filtering for tmt_tpu_id
      if (params?.tmt_tpu_id !== undefined)
        httpParams = httpParams.set('tmt_tpu_id', params.tmt_tpu_id.toString());
      if (params?.tmt_tpu_id_min !== undefined)
        httpParams = httpParams.set(
          'tmt_tpu_id_min',
          params.tmt_tpu_id_min.toString(),
        );
      if (params?.tmt_tpu_id_max !== undefined)
        httpParams = httpParams.set(
          'tmt_tpu_id_max',
          params.tmt_tpu_id_max.toString(),
        );
      // Date/DateTime filtering for status_changed_date
      if (params?.status_changed_date)
        httpParams = httpParams.set(
          'status_changed_date',
          params.status_changed_date,
        );
      if (params?.status_changed_date_min)
        httpParams = httpParams.set(
          'status_changed_date_min',
          params.status_changed_date_min,
        );
      if (params?.status_changed_date_max)
        httpParams = httpParams.set(
          'status_changed_date_max',
          params.status_changed_date_max,
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
      // Numeric filtering for package_size
      if (params?.package_size !== undefined)
        httpParams = httpParams.set(
          'package_size',
          params.package_size.toString(),
        );
      if (params?.package_size_min !== undefined)
        httpParams = httpParams.set(
          'package_size_min',
          params.package_size_min.toString(),
        );
      if (params?.package_size_max !== undefined)
        httpParams = httpParams.set(
          'package_size_max',
          params.package_size_max.toString(),
        );
      // String filtering for package_unit
      if (params?.package_unit)
        httpParams = httpParams.set('package_unit', params.package_unit);
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
        .get<PaginatedResponse<Drug>>(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.drugsListSignal.set(response.data);

        if (response.pagination) {
          this.totalDrugSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.handleError(error, 'Failed to load drugs list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single drugs by ID
   */
  async loadDrugById(id: number): Promise<Drug | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<Drug>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedDrugSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to load drugs');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new drugs
   */
  async createDrug(data: CreateDrugRequest): Promise<Drug | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<Drug>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to create drugs');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing drugs
   */
  async updateDrug(id: number, data: UpdateDrugRequest): Promise<Drug | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<Drug>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to update drugs');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete drugs by ID
   */
  async deleteDrug(id: number): Promise<boolean> {
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
      this.handleError(error, 'Failed to delete drugs');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS =====

  /**
   * Export drugs data
   */
  async exportDrug(options: {
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
      console.error('Failed to export drugs data:', error);
      throw error;
    }
  }

  /**
   * Get dropdown options for drugs
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
   * Get companies dropdown options for manufacturer_id field
   */
  async getCompaniesDropdown(
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
        >('/companies/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch companies dropdown options:', error);
      return [];
    }
  }

  /**
   * Get tmt_concepts dropdown options for tmt_tpu_id field
   */
  async getTmtConceptsDropdown(
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
        >('/tmt_concepts/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch tmt_concepts dropdown options:', error);
      return [];
    }
  }

  /**
   * Bulk create drugss
   */
  async bulkCreateDrug(
    items: CreateDrugRequest[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadDrugList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk create drugss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update drugss
   */
  async bulkUpdateDrug(
    items: Array<{ id: number; data: UpdateDrugRequest }>,
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadDrugList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk update drugss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete drugss
   */
  async bulkDeleteDrug(ids: number[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadDrugList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk delete drugss');
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
   * Select drugs
   */
  selectDrug(drugs: Drug | null): void {
    this.selectedDrugSignal.set(drugs);
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
    this.drugsListSignal.set([]);
    this.selectedDrugSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.clearPermissionError();
    this.totalDrugSignal.set(0);
  }
}
