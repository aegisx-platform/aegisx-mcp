import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  ListBookQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse
} from '../types/books.types';

// ===== SERVICE CONFIGURATION =====

const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/books`;

  // ===== SIGNALS FOR STATE MANAGEMENT =====
  
  private booksListSignal = signal<Book[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedBookSignal = signal<Book | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalBookSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====
  
  readonly booksList = this.booksListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedBook = this.selectedBookSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalBook = this.totalBookSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====
  
  readonly totalPages = computed(() => {
    const total = this.totalBookSignal();
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
   * Load books list with pagination and filters
   */
  async loadBookList(params?: ListBookQuery): Promise<void> {
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
            // String filtering for author_id
      if (params?.author_id) httpParams = httpParams.set('author_id', params.author_id);
            // String filtering for isbn
      if (params?.isbn) httpParams = httpParams.set('isbn', params.isbn);
            // Numeric filtering for pages
      if (params?.pages !== undefined) httpParams = httpParams.set('pages', params.pages.toString());
      if (params?.pages_min !== undefined) httpParams = httpParams.set('pages_min', params.pages_min.toString());
      if (params?.pages_max !== undefined) httpParams = httpParams.set('pages_max', params.pages_max.toString());
      // Numeric filtering for price
      if (params?.price !== undefined) httpParams = httpParams.set('price', params.price.toString());
      if (params?.price_min !== undefined) httpParams = httpParams.set('price_min', params.price_min.toString());
      if (params?.price_max !== undefined) httpParams = httpParams.set('price_max', params.price_max.toString());
      // String filtering for genre
      if (params?.genre) httpParams = httpParams.set('genre', params.genre);
            // Boolean filtering for available
      if (params?.available !== undefined) httpParams = httpParams.set('available', params.available.toString());
      // Date/DateTime filtering for created_at
      if (params?.created_at) httpParams = httpParams.set('created_at', params.created_at);
      if (params?.created_at_min) httpParams = httpParams.set('created_at_min', params.created_at_min);
      if (params?.created_at_max) httpParams = httpParams.set('created_at_max', params.created_at_max);
      // Date/DateTime filtering for updated_at
      if (params?.updated_at) httpParams = httpParams.set('updated_at', params.updated_at);
      if (params?.updated_at_min) httpParams = httpParams.set('updated_at_min', params.updated_at_min);
      if (params?.updated_at_max) httpParams = httpParams.set('updated_at_max', params.updated_at_max);

      const response = await this.http
        .get<PaginatedResponse<Book>>(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.booksListSignal.set(response.data);

        if (response.pagination) {
          this.totalBookSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load books list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single books by ID
   */
  async loadBookById(id: string): Promise<Book | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<Book>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedBookSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load books');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new books
   */
  async createBook(data: CreateBookRequest): Promise<Book | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<Book>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: add to list
        this.booksListSignal.update((list) => [...list, response.data!]);
        this.totalBookSignal.update(total => total + 1);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to create books');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing books
   */
  async updateBook(id: string, data: UpdateBookRequest): Promise<Book | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<Book>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: replace in list
        this.booksListSignal.update((list) =>
          list.map((item) => (item.id === id ? response.data! : item))
        );
        // Update selected books if it's the same
        if (this.selectedBookSignal()?.id === id) {
          this.selectedBookSignal.set(response.data);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update books');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete books by ID
   */
  async deleteBook(id: string): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success) {
        // Optimistic update: remove from list
        this.booksListSignal.update((list) =>
          list.filter((item) => item.id !== id)
        );
        this.totalBookSignal.update(total => Math.max(0, total - 1));
        // Clear selected books if it's the deleted one
        if (this.selectedBookSignal()?.id === id) {
          this.selectedBookSignal.set(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete books');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS =====

  /**
   * Export books data
   */
  async exportBook(options: {
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
      console.error('Failed to export books data:', error);
      throw error;
    }
  }

  /**
   * Get dropdown options for books
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
      console.error('Failed to fetch books dropdown options:', error);
      return [];
    }
  }

  /**
   * Get authors dropdown options for author_id field
   */
  async getAuthorsDropdown(params: {search?: string, limit?: number} = {}): Promise<Array<{value: string, label: string, disabled?: boolean}>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<ApiResponse<{options: Array<{value: string, label: string, disabled?: boolean}>, total: number}>>('/authors/dropdown', { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch authors dropdown options:', error);
      return [];
    }
  }


  /**
   * Bulk create bookss
   */
  async bulkCreateBook(items: CreateBookRequest[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBookList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk create bookss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update bookss
   */
  async bulkUpdateBook(items: Array<{ id: string, data: UpdateBookRequest }>): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBookList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk update bookss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete bookss
   */
  async bulkDeleteBook(ids: string[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadBookList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk delete bookss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ADVANCED OPERATIONS (FULL PACKAGE) =====

  /**
   * Validate books data before save
   */
  async validateBook(data: CreateBookRequest): Promise<{valid: boolean, errors?: any[]}> {
    try {
      const response = await this.http
        .post<ApiResponse<{valid: boolean, errors?: any[]}>>(`${this.baseUrl}/validate`, { data })
        .toPromise();

      if (response) {
        return response.data;
      }
      return { valid: false, errors: ['Validation failed'] };
    } catch (error: any) {
      console.error('Failed to validate books:', error);
      return { valid: false, errors: [error.message || 'Validation error'] };
    }
  }

  /**
   * Check field uniqueness
   */
  async checkUniqueness(field: string, value: string, excludeId?: string): Promise<{unique: boolean}> {
    try {
      let params = new HttpParams()
        .set('value', value);
      
      if (excludeId) {
        params = params.set('excludeId', excludeId);
      }

      const response = await this.http
        .get<ApiResponse<{unique: boolean}>>(`${this.baseUrl}/check/${field}`, { params })
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
   * Get books statistics
   */
  async getStats(): Promise<{total: number} | null> {
    try {
      const response = await this.http
        .get<ApiResponse<{total: number}>>(`${this.baseUrl}/stats`)
        .toPromise();

      if (response) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to get books stats:', error);
      return null;
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
   * Select books
   */
  selectBook(books: Book | null): void {
    this.selectedBookSignal.set(books);
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
    this.booksListSignal.set([]);
    this.selectedBookSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.totalBookSignal.set(0);
  }
}