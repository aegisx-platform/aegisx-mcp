import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  ComprehensiveTest,
  CreateComprehensiveTestRequest,
  UpdateComprehensiveTestRequest,
  ListComprehensiveTestQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse
} from '../types/comprehensive-tests.types';

// ===== SERVICE CONFIGURATION =====

const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class ComprehensiveTestService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/comprehensive-tests`;

  // ===== SIGNALS FOR STATE MANAGEMENT =====
  
  private comprehensiveTestsListSignal = signal<ComprehensiveTest[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedComprehensiveTestSignal = signal<ComprehensiveTest | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalComprehensiveTestSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====
  
  readonly comprehensiveTestsList = this.comprehensiveTestsListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedComprehensiveTest = this.selectedComprehensiveTestSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalComprehensiveTest = this.totalComprehensiveTestSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====
  
  readonly totalPages = computed(() => {
    const total = this.totalComprehensiveTestSignal();
    const size = this.pageSizeSignal();
    return Math.ceil(total / size);
  });

  readonly hasNextPage = computed(() => {
    return this.currentPageSignal() < this.totalPages();
  });

  readonly hasPreviousPage = computed(() => {
    return this.currentPageSignal() > 1;
  });

  // ===== STANDARD CRUD OPERATIONS =====

  /**
   * Load comprehensiveTests list with pagination and filters
   */
  async loadComprehensiveTestList(params?: ListComprehensiveTestQuery): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Build HTTP params
      let httpParams = new HttpParams();
      if (params?.page) httpParams = httpParams.set('page', params.page.toString());
      if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params?.search) httpParams = httpParams.set('search', params.search);
      if (params?.sort) httpParams = httpParams.set('sort', params.sort);
      
      // Handle fields array parameter (multiple values)
      if (params?.fields && params.fields.length > 0) {
        params.fields.forEach((field: string) => {
          httpParams = httpParams.append('fields', field);
        });
      }
      
      // Add smart filter parameters based on table schema
      // String filtering for title
      if (params?.title) httpParams = httpParams.set('title', params.title);
            // String filtering for description
      if (params?.description) httpParams = httpParams.set('description', params.description);
            // String filtering for slug
      if (params?.slug) httpParams = httpParams.set('slug', params.slug);
            // String filtering for short_code
      if (params?.short_code) httpParams = httpParams.set('short_code', params.short_code);
            // Numeric filtering for price
      if (params?.price !== undefined) httpParams = httpParams.set('price', params.price.toString());
      if (params?.price_min !== undefined) httpParams = httpParams.set('price_min', params.price_min.toString());
      if (params?.price_max !== undefined) httpParams = httpParams.set('price_max', params.price_max.toString());
      // Numeric filtering for quantity
      if (params?.quantity !== undefined) httpParams = httpParams.set('quantity', params.quantity.toString());
      if (params?.quantity_min !== undefined) httpParams = httpParams.set('quantity_min', params.quantity_min.toString());
      if (params?.quantity_max !== undefined) httpParams = httpParams.set('quantity_max', params.quantity_max.toString());
      // Numeric filtering for weight
      if (params?.weight !== undefined) httpParams = httpParams.set('weight', params.weight.toString());
      if (params?.weight_min !== undefined) httpParams = httpParams.set('weight_min', params.weight_min.toString());
      if (params?.weight_max !== undefined) httpParams = httpParams.set('weight_max', params.weight_max.toString());
      // Numeric filtering for rating
      if (params?.rating !== undefined) httpParams = httpParams.set('rating', params.rating.toString());
      if (params?.rating_min !== undefined) httpParams = httpParams.set('rating_min', params.rating_min.toString());
      if (params?.rating_max !== undefined) httpParams = httpParams.set('rating_max', params.rating_max.toString());
      // Boolean filtering for is_active
      if (params?.is_active !== undefined) httpParams = httpParams.set('is_active', params.is_active.toString());
      // Boolean filtering for is_featured
      if (params?.is_featured !== undefined) httpParams = httpParams.set('is_featured', params.is_featured.toString());
      // Boolean filtering for is_available
      if (params?.is_available !== undefined) httpParams = httpParams.set('is_available', params.is_available.toString());
      // Date/DateTime filtering for created_at
      if (params?.created_at) httpParams = httpParams.set('created_at', params.created_at);
      if (params?.created_at_min) httpParams = httpParams.set('created_at_min', params.created_at_min);
      if (params?.created_at_max) httpParams = httpParams.set('created_at_max', params.created_at_max);
      // Date/DateTime filtering for updated_at
      if (params?.updated_at) httpParams = httpParams.set('updated_at', params.updated_at);
      if (params?.updated_at_min) httpParams = httpParams.set('updated_at_min', params.updated_at_min);
      if (params?.updated_at_max) httpParams = httpParams.set('updated_at_max', params.updated_at_max);
      // Date/DateTime filtering for published_at
      if (params?.published_at) httpParams = httpParams.set('published_at', params.published_at);
      if (params?.published_at_min) httpParams = httpParams.set('published_at_min', params.published_at_min);
      if (params?.published_at_max) httpParams = httpParams.set('published_at_max', params.published_at_max);
      // String filtering for start_time
      if (params?.start_time) httpParams = httpParams.set('start_time', params.start_time);
            // String filtering for website_url
      if (params?.website_url) httpParams = httpParams.set('website_url', params.website_url);
            // String filtering for email_address
      if (params?.email_address) httpParams = httpParams.set('email_address', params.email_address);
            // String filtering for status
      if (params?.status) httpParams = httpParams.set('status', params.status);
            // String filtering for priority
      if (params?.priority) httpParams = httpParams.set('priority', params.priority);
            // String filtering for content
      if (params?.content) httpParams = httpParams.set('content', params.content);
            // String filtering for notes
      if (params?.notes) httpParams = httpParams.set('notes', params.notes);
      
      const response = await this.http
        .get<PaginatedResponse<ComprehensiveTest>>(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.comprehensiveTestsListSignal.set(response.data);

        if (response.pagination) {
          this.totalComprehensiveTestSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load comprehensiveTests list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single comprehensiveTests by ID
   */
  async loadComprehensiveTestById(id: string): Promise<ComprehensiveTest | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<ComprehensiveTest>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedComprehensiveTestSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load comprehensiveTests');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new comprehensiveTests
   */
  async createComprehensiveTest(data: CreateComprehensiveTestRequest): Promise<ComprehensiveTest | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<ComprehensiveTest>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: add to list
        this.comprehensiveTestsListSignal.update((list) => [...list, response.data!]);
        this.totalComprehensiveTestSignal.update(total => total + 1);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to create comprehensiveTests');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing comprehensiveTests
   */
  async updateComprehensiveTest(id: string, data: UpdateComprehensiveTestRequest): Promise<ComprehensiveTest | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<ComprehensiveTest>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: replace in list
        this.comprehensiveTestsListSignal.update((list) =>
          list.map((item) => (item.id === id ? response.data! : item))
        );
        // Update selected comprehensiveTests if it's the same
        if (this.selectedComprehensiveTestSignal()?.id === id) {
          this.selectedComprehensiveTestSignal.set(response.data);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update comprehensiveTests');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete comprehensiveTests by ID
   */
  async deleteComprehensiveTest(id: string): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success) {
        // Optimistic update: remove from list
        this.comprehensiveTestsListSignal.update((list) =>
          list.filter((item) => item.id !== id)
        );
        this.totalComprehensiveTestSignal.update(total => Math.max(0, total - 1));
        // Clear selected comprehensiveTests if it's the deleted one
        if (this.selectedComprehensiveTestSignal()?.id === id) {
          this.selectedComprehensiveTestSignal.set(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete comprehensiveTests');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS =====

  /**
   * Export comprehensiveTests data
   */
  async exportComprehensiveTest(options: {
    format: 'csv' | 'excel' | 'pdf';
    ids?: string[];
    filters?: Record<string, any>;
    fields?: string[];
    filename?: string;
    applyFilters?: boolean;
    includeMetadata?: boolean;
  }): Promise<Blob> {
    try {
      let httpParams = new HttpParams()
        .set('format', options.format);

      if (options.ids && options.ids.length > 0) {
        options.ids.forEach(id => {
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
        options.fields.forEach(field => {
          httpParams = httpParams.append('fields', field);
        });
      }

      if (options.filename) {
        httpParams = httpParams.set('filename', options.filename);
      }

      if (options.applyFilters !== undefined) {
        httpParams = httpParams.set('applyFilters', String(options.applyFilters));
      }

      if (options.includeMetadata !== undefined) {
        httpParams = httpParams.set('includeMetadata', String(options.includeMetadata));
      }

      const response = await this.http
        .get(`${this.baseUrl}/export`, {
          params: httpParams,
          responseType: 'blob'
        })
        .toPromise();

      if (response) {
        return response;
      }

      throw new Error('Export failed - no response received');
    } catch (error: any) {
      console.error('Failed to export comprehensiveTests data:', error);
      throw error;
    }
  }

  /**
   * Get dropdown options for comprehensiveTests
   */
  async getDropdownOptions(params: {search?: string, limit?: number} = {}): Promise<Array<{value: string, label: string}>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<ApiResponse<{options: Array<{value: string, label: string}>, total: number}>>(`${this.baseUrl}/dropdown`, { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch comprehensiveTests dropdown options:', error);
      return [];
    }
  }


  /**
   * Bulk create comprehensiveTestss
   */
  async bulkCreateComprehensiveTest(items: CreateComprehensiveTestRequest[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadComprehensiveTestList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk create comprehensiveTestss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update comprehensiveTestss
   */
  async bulkUpdateComprehensiveTest(items: Array<{ id: string, data: UpdateComprehensiveTestRequest }>): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadComprehensiveTestList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk update comprehensiveTestss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete comprehensiveTestss
   */
  async bulkDeleteComprehensiveTest(ids: string[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadComprehensiveTestList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk delete comprehensiveTestss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
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
   * Select comprehensiveTests
   */
  selectComprehensiveTest(comprehensiveTests: ComprehensiveTest | null): void {
    this.selectedComprehensiveTestSignal.set(comprehensiveTests);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.comprehensiveTestsListSignal.set([]);
    this.selectedComprehensiveTestSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.totalComprehensiveTestSignal.set(0);
  }
}