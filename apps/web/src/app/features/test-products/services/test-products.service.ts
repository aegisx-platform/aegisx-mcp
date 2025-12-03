import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  TestProduct,
  CreateTestProductRequest,
  UpdateTestProductRequest,
  ListTestProductQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse,
  ImportOptions,
  ValidateImportResponse,
  ExecuteImportRequest,
  ImportJob,
} from '../types/test-products.types';

// ===== SERVICE CONFIGURATION =====

const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class TestProductService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/test-products`;

  // ===== SIGNALS FOR STATE MANAGEMENT =====

  private testProductsListSignal = signal<TestProduct[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private permissionErrorSignal = signal<boolean>(false);
  private lastErrorStatusSignal = signal<number | null>(null);
  private selectedTestProductSignal = signal<TestProduct | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalTestProductSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====

  readonly testProductsList = this.testProductsListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly permissionError = this.permissionErrorSignal.asReadonly();
  readonly lastErrorStatus = this.lastErrorStatusSignal.asReadonly();
  readonly selectedTestProduct = this.selectedTestProductSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalTestProduct = this.totalTestProductSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====

  readonly totalPages = computed(() => {
    const total = this.totalTestProductSignal();
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
   * Load testProducts list with pagination and filters
   */
  async loadTestProductList(params?: ListTestProductQuery): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Build HTTP params
      let httpParams = new HttpParams();
      if (params?.page)
        httpParams = httpParams.set('page', params.page.toString());
      if (params?.limit)
        httpParams = httpParams.set('limit', params.limit.toString());
      if (params?.search) httpParams = httpParams.set('search', params.search);
      if (params?.sort) httpParams = httpParams.set('sort', params.sort);

      // Handle fields array parameter (multiple values)
      if (params?.fields && params.fields.length > 0) {
        params.fields.forEach((field: string) => {
          httpParams = httpParams.append('fields', field);
        });
      }

      // Add smart filter parameters based on table schema
      // String filtering for code
      if (params?.code) httpParams = httpParams.set('code', params.code);
      // String filtering for name
      if (params?.name) httpParams = httpParams.set('name', params.name);
      // String filtering for slug
      if (params?.slug) httpParams = httpParams.set('slug', params.slug);
      // String filtering for description
      if (params?.description)
        httpParams = httpParams.set('description', params.description);
      // Boolean filtering for is_active
      if (params?.is_active !== undefined)
        httpParams = httpParams.set('is_active', params.is_active.toString());
      // Boolean filtering for is_featured
      if (params?.is_featured !== undefined)
        httpParams = httpParams.set(
          'is_featured',
          params.is_featured.toString(),
        );
      // Numeric filtering for display_order
      if (params?.display_order !== undefined)
        httpParams = httpParams.set(
          'display_order',
          params.display_order.toString(),
        );
      if (params?.display_order_min !== undefined)
        httpParams = httpParams.set(
          'display_order_min',
          params.display_order_min.toString(),
        );
      if (params?.display_order_max !== undefined)
        httpParams = httpParams.set(
          'display_order_max',
          params.display_order_max.toString(),
        );
      // Numeric filtering for item_count
      if (params?.item_count !== undefined)
        httpParams = httpParams.set('item_count', params.item_count.toString());
      if (params?.item_count_min !== undefined)
        httpParams = httpParams.set(
          'item_count_min',
          params.item_count_min.toString(),
        );
      if (params?.item_count_max !== undefined)
        httpParams = httpParams.set(
          'item_count_max',
          params.item_count_max.toString(),
        );
      // Numeric filtering for discount_rate
      if (params?.discount_rate !== undefined)
        httpParams = httpParams.set(
          'discount_rate',
          params.discount_rate.toString(),
        );
      if (params?.discount_rate_min !== undefined)
        httpParams = httpParams.set(
          'discount_rate_min',
          params.discount_rate_min.toString(),
        );
      if (params?.discount_rate_max !== undefined)
        httpParams = httpParams.set(
          'discount_rate_max',
          params.discount_rate_max.toString(),
        );
      // String filtering for status
      if (params?.status) httpParams = httpParams.set('status', params.status);
      // String filtering for created_by
      if (params?.created_by)
        httpParams = httpParams.set('created_by', params.created_by);
      // String filtering for updated_by
      if (params?.updated_by)
        httpParams = httpParams.set('updated_by', params.updated_by);
      // Date/DateTime filtering for deleted_at
      if (params?.deleted_at)
        httpParams = httpParams.set('deleted_at', params.deleted_at);
      if (params?.deleted_at_min)
        httpParams = httpParams.set('deleted_at_min', params.deleted_at_min);
      if (params?.deleted_at_max)
        httpParams = httpParams.set('deleted_at_max', params.deleted_at_max);
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
          PaginatedResponse<TestProduct>
        >(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.testProductsListSignal.set(response.data);

        if (response.pagination) {
          this.totalTestProductSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.handleError(error, 'Failed to load testProducts list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single testProducts by ID
   */
  async loadTestProductById(id: string): Promise<TestProduct | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<TestProduct>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedTestProductSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to load testProducts');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new testProducts
   */
  async createTestProduct(
    data: CreateTestProductRequest,
  ): Promise<TestProduct | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<TestProduct>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to create testProducts');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing testProducts
   */
  async updateTestProduct(
    id: string,
    data: UpdateTestProductRequest,
  ): Promise<TestProduct | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<TestProduct>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // ✅ Return data without optimistic update
        // List component will refresh via reloadTrigger
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to update testProducts');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete testProducts by ID
   */
  async deleteTestProduct(id: string): Promise<boolean> {
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
      this.handleError(error, 'Failed to delete testProducts');
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
   * Select testProducts
   */
  selectTestProduct(testProducts: TestProduct | null): void {
    this.selectedTestProductSignal.set(testProducts);
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
    this.testProductsListSignal.set([]);
    this.selectedTestProductSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.clearPermissionError();
    this.totalTestProductSignal.set(0);
  }
}
