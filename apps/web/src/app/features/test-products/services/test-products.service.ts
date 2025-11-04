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
   */
  private handleError(error: any, defaultMessage: string): void {
    const status = error?.status || null;
    this.lastErrorStatusSignal.set(status);

    // Check if error is 403 Forbidden
    if (status === 403) {
      this.permissionErrorSignal.set(true);
      this.errorSignal.set('You do not have permission to perform this action');
    } else {
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
      // String filtering for sku
      if (params?.sku) httpParams = httpParams.set('sku', params.sku);
      // String filtering for name
      if (params?.name) httpParams = httpParams.set('name', params.name);
      // String filtering for barcode
      if (params?.barcode)
        httpParams = httpParams.set('barcode', params.barcode);
      // String filtering for manufacturer
      if (params?.manufacturer)
        httpParams = httpParams.set('manufacturer', params.manufacturer);
      // String filtering for description
      if (params?.description)
        httpParams = httpParams.set('description', params.description);
      // String filtering for long_description
      if (params?.long_description)
        httpParams = httpParams.set(
          'long_description',
          params.long_description,
        );
      // String filtering for specifications
      if (params?.specifications)
        httpParams = httpParams.set('specifications', params.specifications);
      // Numeric filtering for quantity
      if (params?.quantity !== undefined)
        httpParams = httpParams.set('quantity', params.quantity.toString());
      if (params?.quantity_min !== undefined)
        httpParams = httpParams.set(
          'quantity_min',
          params.quantity_min.toString(),
        );
      if (params?.quantity_max !== undefined)
        httpParams = httpParams.set(
          'quantity_max',
          params.quantity_max.toString(),
        );
      // Numeric filtering for min_quantity
      if (params?.min_quantity !== undefined)
        httpParams = httpParams.set(
          'min_quantity',
          params.min_quantity.toString(),
        );
      if (params?.min_quantity_min !== undefined)
        httpParams = httpParams.set(
          'min_quantity_min',
          params.min_quantity_min.toString(),
        );
      if (params?.min_quantity_max !== undefined)
        httpParams = httpParams.set(
          'min_quantity_max',
          params.min_quantity_max.toString(),
        );
      // Numeric filtering for max_quantity
      if (params?.max_quantity !== undefined)
        httpParams = httpParams.set(
          'max_quantity',
          params.max_quantity.toString(),
        );
      if (params?.max_quantity_min !== undefined)
        httpParams = httpParams.set(
          'max_quantity_min',
          params.max_quantity_min.toString(),
        );
      if (params?.max_quantity_max !== undefined)
        httpParams = httpParams.set(
          'max_quantity_max',
          params.max_quantity_max.toString(),
        );
      // Numeric filtering for price
      if (params?.price !== undefined)
        httpParams = httpParams.set('price', params.price.toString());
      if (params?.price_min !== undefined)
        httpParams = httpParams.set('price_min', params.price_min.toString());
      if (params?.price_max !== undefined)
        httpParams = httpParams.set('price_max', params.price_max.toString());
      // Numeric filtering for cost
      if (params?.cost !== undefined)
        httpParams = httpParams.set('cost', params.cost.toString());
      if (params?.cost_min !== undefined)
        httpParams = httpParams.set('cost_min', params.cost_min.toString());
      if (params?.cost_max !== undefined)
        httpParams = httpParams.set('cost_max', params.cost_max.toString());
      // Numeric filtering for weight
      if (params?.weight !== undefined)
        httpParams = httpParams.set('weight', params.weight.toString());
      if (params?.weight_min !== undefined)
        httpParams = httpParams.set('weight_min', params.weight_min.toString());
      if (params?.weight_max !== undefined)
        httpParams = httpParams.set('weight_max', params.weight_max.toString());
      // Numeric filtering for discount_percentage
      if (params?.discount_percentage !== undefined)
        httpParams = httpParams.set(
          'discount_percentage',
          params.discount_percentage.toString(),
        );
      if (params?.discount_percentage_min !== undefined)
        httpParams = httpParams.set(
          'discount_percentage_min',
          params.discount_percentage_min.toString(),
        );
      if (params?.discount_percentage_max !== undefined)
        httpParams = httpParams.set(
          'discount_percentage_max',
          params.discount_percentage_max.toString(),
        );
      // Boolean filtering for is_active
      if (params?.is_active !== undefined)
        httpParams = httpParams.set('is_active', params.is_active.toString());
      // Boolean filtering for is_featured
      if (params?.is_featured !== undefined)
        httpParams = httpParams.set(
          'is_featured',
          params.is_featured.toString(),
        );
      // Boolean filtering for is_taxable
      if (params?.is_taxable !== undefined)
        httpParams = httpParams.set('is_taxable', params.is_taxable.toString());
      // Boolean filtering for is_shippable
      if (params?.is_shippable !== undefined)
        httpParams = httpParams.set(
          'is_shippable',
          params.is_shippable.toString(),
        );
      // Boolean filtering for allow_backorder
      if (params?.allow_backorder !== undefined)
        httpParams = httpParams.set(
          'allow_backorder',
          params.allow_backorder.toString(),
        );
      // String filtering for status
      if (params?.status) httpParams = httpParams.set('status', params.status);
      // String filtering for condition
      if (params?.condition)
        httpParams = httpParams.set('condition', params.condition);
      // String filtering for availability
      if (params?.availability)
        httpParams = httpParams.set('availability', params.availability);
      // Date/DateTime filtering for launch_date
      if (params?.launch_date)
        httpParams = httpParams.set('launch_date', params.launch_date);
      if (params?.launch_date_min)
        httpParams = httpParams.set('launch_date_min', params.launch_date_min);
      if (params?.launch_date_max)
        httpParams = httpParams.set('launch_date_max', params.launch_date_max);
      // Date/DateTime filtering for discontinued_date
      if (params?.discontinued_date)
        httpParams = httpParams.set(
          'discontinued_date',
          params.discontinued_date,
        );
      if (params?.discontinued_date_min)
        httpParams = httpParams.set(
          'discontinued_date_min',
          params.discontinued_date_min,
        );
      if (params?.discontinued_date_max)
        httpParams = httpParams.set(
          'discontinued_date_max',
          params.discontinued_date_max,
        );
      // Date/DateTime filtering for last_stock_check
      if (params?.last_stock_check)
        httpParams = httpParams.set(
          'last_stock_check',
          params.last_stock_check,
        );
      if (params?.last_stock_check_min)
        httpParams = httpParams.set(
          'last_stock_check_min',
          params.last_stock_check_min,
        );
      if (params?.last_stock_check_max)
        httpParams = httpParams.set(
          'last_stock_check_max',
          params.last_stock_check_max,
        );
      // Date/DateTime filtering for next_restock_date
      if (params?.next_restock_date)
        httpParams = httpParams.set(
          'next_restock_date',
          params.next_restock_date,
        );
      if (params?.next_restock_date_min)
        httpParams = httpParams.set(
          'next_restock_date_min',
          params.next_restock_date_min,
        );
      if (params?.next_restock_date_max)
        httpParams = httpParams.set(
          'next_restock_date_max',
          params.next_restock_date_max,
        );
      // String filtering for category_id
      if (params?.category_id)
        httpParams = httpParams.set('category_id', params.category_id);
      // String filtering for parent_product_id
      if (params?.parent_product_id)
        httpParams = httpParams.set(
          'parent_product_id',
          params.parent_product_id,
        );
      // String filtering for supplier_id
      if (params?.supplier_id)
        httpParams = httpParams.set('supplier_id', params.supplier_id);
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

  // ===== ENHANCED OPERATIONS =====

  /**
   * Export testProducts data
   */
  async exportTestProduct(options: {
    format: 'csv' | 'excel' | 'pdf';
    ids?: string[];
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
      console.error('Failed to export testProducts data:', error);
      throw error;
    }
  }

  /**
   * Get dropdown options for testProducts
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
      console.error('Failed to fetch testProducts dropdown options:', error);
      return [];
    }
  }

  /**
   * Get test_categories dropdown options for category_id field
   */
  async getTestCategoriesDropdown(
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
        >('/test_categories/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch test_categories dropdown options:', error);
      return [];
    }
  }

  /**
   * Get test_products dropdown options for parent_product_id field
   */
  async getTestProductsDropdown(
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
        >('/test_products/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch test_products dropdown options:', error);
      return [];
    }
  }

  /**
   * Get users dropdown options for supplier_id field
   */
  async getUsersDropdown(
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
        >('/users/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch users dropdown options:', error);
      return [];
    }
  }

  /**
   * Bulk create testProductss
   */
  async bulkCreateTestProduct(
    items: CreateTestProductRequest[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadTestProductList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk create testProductss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update testProductss
   */
  async bulkUpdateTestProduct(
    items: Array<{ id: string; data: UpdateTestProductRequest }>,
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadTestProductList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk update testProductss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete testProductss
   */
  async bulkDeleteTestProduct(ids: string[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadTestProductList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk delete testProductss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ADVANCED OPERATIONS (FULL PACKAGE) =====

  /**
   * Validate testProducts data before save
   */
  async validateTestProduct(
    data: CreateTestProductRequest,
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
      console.error('Failed to validate testProducts:', error);
      return { valid: false, errors: [error.message || 'Validation error'] };
    }
  }

  /**
   * Check field uniqueness
   */
  async checkUniqueness(
    field: string,
    value: string,
    excludeId?: string,
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
   * Get testProducts statistics
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
      console.error('Failed to get testProducts stats:', error);
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
