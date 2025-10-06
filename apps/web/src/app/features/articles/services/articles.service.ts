import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  ListArticleQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse,
} from '../types/articles.types';

// ===== SERVICE CONFIGURATION =====

const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/articles`;

  // ===== SIGNALS FOR STATE MANAGEMENT =====

  private articlesListSignal = signal<Article[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedArticleSignal = signal<Article | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalArticleSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====

  readonly articlesList = this.articlesListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedArticle = this.selectedArticleSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalArticle = this.totalArticleSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====

  readonly totalPages = computed(() => {
    const total = this.totalArticleSignal();
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
   * Load articles list with pagination and filters
   */
  async loadArticleList(params?: ListArticleQuery): Promise<void> {
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
      // String filtering for title
      if (params?.title) httpParams = httpParams.set('title', params.title);
      // String filtering for content
      if (params?.content)
        httpParams = httpParams.set('content', params.content);
      // String filtering for author_id
      if (params?.author_id)
        httpParams = httpParams.set('author_id', params.author_id);
      // Boolean filtering for published
      if (params?.published !== undefined)
        httpParams = httpParams.set('published', params.published.toString());
      // Date/DateTime filtering for published_at
      if (params?.published_at)
        httpParams = httpParams.set('published_at', params.published_at);
      if (params?.published_at_min)
        httpParams = httpParams.set(
          'published_at_min',
          params.published_at_min,
        );
      if (params?.published_at_max)
        httpParams = httpParams.set(
          'published_at_max',
          params.published_at_max,
        );
      // Numeric filtering for view_count
      if (params?.view_count !== undefined)
        httpParams = httpParams.set('view_count', params.view_count.toString());
      if (params?.view_count_min !== undefined)
        httpParams = httpParams.set(
          'view_count_min',
          params.view_count_min.toString(),
        );
      if (params?.view_count_max !== undefined)
        httpParams = httpParams.set(
          'view_count_max',
          params.view_count_max.toString(),
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

      const response = await this.http
        .get<PaginatedResponse<Article>>(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.articlesListSignal.set(response.data);

        if (response.pagination) {
          this.totalArticleSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load articles list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single articles by ID
   */
  async loadArticleById(id: string): Promise<Article | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<Article>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedArticleSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load articles');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new articles
   */
  async createArticle(data: CreateArticleRequest): Promise<Article | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<Article>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: add to list
        this.articlesListSignal.update((list) => [...list, response.data!]);
        this.totalArticleSignal.update((total) => total + 1);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to create articles');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing articles
   */
  async updateArticle(
    id: string,
    data: UpdateArticleRequest,
  ): Promise<Article | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<Article>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: replace in list
        this.articlesListSignal.update((list) =>
          list.map((item) => (item.id === id ? response.data! : item)),
        );
        // Update selected articles if it's the same
        if (this.selectedArticleSignal()?.id === id) {
          this.selectedArticleSignal.set(response.data);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update articles');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete articles by ID
   */
  async deleteArticle(id: string): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success) {
        // Optimistic update: remove from list
        this.articlesListSignal.update((list) =>
          list.filter((item) => item.id !== id),
        );
        this.totalArticleSignal.update((total) => Math.max(0, total - 1));
        // Clear selected articles if it's the deleted one
        if (this.selectedArticleSignal()?.id === id) {
          this.selectedArticleSignal.set(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete articles');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS =====

  /**
   * Get dropdown options for articles
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
      console.error('Failed to fetch articles dropdown options:', error);
      return [];
    }
  }

  /**
   * Get users dropdown options for author_id field
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
   * Bulk create articless
   */
  async bulkCreateArticle(
    items: CreateArticleRequest[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadArticleList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk create articless');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update articless
   */
  async bulkUpdateArticle(
    items: Array<{ id: string; data: UpdateArticleRequest }>,
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadArticleList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk update articless');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete articless
   */
  async bulkDeleteArticle(ids: string[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadArticleList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk delete articless');
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
   * Select articles
   */
  selectArticle(articles: Article | null): void {
    this.selectedArticleSignal.set(articles);
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
    this.articlesListSignal.set([]);
    this.selectedArticleSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.totalArticleSignal.set(0);
  }
}
