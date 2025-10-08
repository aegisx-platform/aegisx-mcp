import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  ListNotificationQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse
} from '../types/notification.types';

// ===== SERVICE CONFIGURATION =====

const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/notifications`;

  // ===== SIGNALS FOR STATE MANAGEMENT =====
  
  private notificationsListSignal = signal<Notification[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedNotificationSignal = signal<Notification | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalNotificationSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====
  
  readonly notificationsList = this.notificationsListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedNotification = this.selectedNotificationSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalNotification = this.totalNotificationSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====
  
  readonly totalPages = computed(() => {
    const total = this.totalNotificationSignal();
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
   * Load notifications list with pagination and filters
   */
  async loadNotificationList(params?: ListNotificationQuery): Promise<void> {
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
      // String filtering for user_id
      if (params?.user_id) httpParams = httpParams.set('user_id', params.user_id);
            // String filtering for type
      if (params?.type) httpParams = httpParams.set('type', params.type);
            // String filtering for title
      if (params?.title) httpParams = httpParams.set('title', params.title);
            // String filtering for message
      if (params?.message) httpParams = httpParams.set('message', params.message);
            // String filtering for action_url
      if (params?.action_url) httpParams = httpParams.set('action_url', params.action_url);
            // Boolean filtering for read
      if (params?.read !== undefined) httpParams = httpParams.set('read', params.read.toString());
      // Date/DateTime filtering for read_at
      if (params?.read_at) httpParams = httpParams.set('read_at', params.read_at);
      if (params?.read_at_min) httpParams = httpParams.set('read_at_min', params.read_at_min);
      if (params?.read_at_max) httpParams = httpParams.set('read_at_max', params.read_at_max);
      // Boolean filtering for archived
      if (params?.archived !== undefined) httpParams = httpParams.set('archived', params.archived.toString());
      // Date/DateTime filtering for archived_at
      if (params?.archived_at) httpParams = httpParams.set('archived_at', params.archived_at);
      if (params?.archived_at_min) httpParams = httpParams.set('archived_at_min', params.archived_at_min);
      if (params?.archived_at_max) httpParams = httpParams.set('archived_at_max', params.archived_at_max);
      // String filtering for priority
      if (params?.priority) httpParams = httpParams.set('priority', params.priority);
            // Date/DateTime filtering for expires_at
      if (params?.expires_at) httpParams = httpParams.set('expires_at', params.expires_at);
      if (params?.expires_at_min) httpParams = httpParams.set('expires_at_min', params.expires_at_min);
      if (params?.expires_at_max) httpParams = httpParams.set('expires_at_max', params.expires_at_max);
      // Date/DateTime filtering for created_at
      if (params?.created_at) httpParams = httpParams.set('created_at', params.created_at);
      if (params?.created_at_min) httpParams = httpParams.set('created_at_min', params.created_at_min);
      if (params?.created_at_max) httpParams = httpParams.set('created_at_max', params.created_at_max);
      // Date/DateTime filtering for updated_at
      if (params?.updated_at) httpParams = httpParams.set('updated_at', params.updated_at);
      if (params?.updated_at_min) httpParams = httpParams.set('updated_at_min', params.updated_at_min);
      if (params?.updated_at_max) httpParams = httpParams.set('updated_at_max', params.updated_at_max);

      const response = await this.http
        .get<PaginatedResponse<Notification>>(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.notificationsListSignal.set(response.data);

        if (response.pagination) {
          this.totalNotificationSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load notifications list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single notifications by ID
   */
  async loadNotificationById(id: string): Promise<Notification | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<Notification>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedNotificationSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load notifications');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new notifications
   */
  async createNotification(data: CreateNotificationRequest): Promise<Notification | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<Notification>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: add to list
        this.notificationsListSignal.update((list) => [...list, response.data!]);
        this.totalNotificationSignal.update(total => total + 1);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to create notifications');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing notifications
   */
  async updateNotification(id: string, data: UpdateNotificationRequest): Promise<Notification | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<Notification>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: replace in list
        this.notificationsListSignal.update((list) =>
          list.map((item) => (item.id === id ? response.data! : item))
        );
        // Update selected notifications if it's the same
        if (this.selectedNotificationSignal()?.id === id) {
          this.selectedNotificationSignal.set(response.data);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update notifications');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete notifications by ID
   */
  async deleteNotification(id: string): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success) {
        // Optimistic update: remove from list
        this.notificationsListSignal.update((list) =>
          list.filter((item) => item.id !== id)
        );
        this.totalNotificationSignal.update(total => Math.max(0, total - 1));
        // Clear selected notifications if it's the deleted one
        if (this.selectedNotificationSignal()?.id === id) {
          this.selectedNotificationSignal.set(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete notifications');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS =====

  /**
   * Export notifications data
   */
  async exportNotification(options: {
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
      console.error('Failed to export notifications data:', error);
      throw error;
    }
  }

  /**
   * Get dropdown options for notifications
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
      console.error('Failed to fetch notifications dropdown options:', error);
      return [];
    }
  }

  /**
   * Get users dropdown options for user_id field
   */
  async getUsersDropdown(params: {search?: string, limit?: number} = {}): Promise<Array<{value: string, label: string, disabled?: boolean}>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<ApiResponse<{options: Array<{value: string, label: string, disabled?: boolean}>, total: number}>>('/users/dropdown', { params: httpParams })
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
   * Bulk create notificationss
   */
  async bulkCreateNotification(items: CreateNotificationRequest[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadNotificationList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk create notificationss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update notificationss
   */
  async bulkUpdateNotification(items: Array<{ id: string, data: UpdateNotificationRequest }>): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadNotificationList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk update notificationss');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete notificationss
   */
  async bulkDeleteNotification(ids: string[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadNotificationList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to bulk delete notificationss');
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
   * Select notifications
   */
  selectNotification(notifications: Notification | null): void {
    this.selectedNotificationSignal.set(notifications);
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
    this.notificationsListSignal.set([]);
    this.selectedNotificationSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.totalNotificationSignal.set(0);
  }
}