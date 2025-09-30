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
      if (params?.page)
        httpParams = httpParams.set('page', params.page.toString());
      if (params?.limit)
        httpParams = httpParams.set('limit', params.limit.toString());
      if (params?.search) httpParams = httpParams.set('search', params.search);
      if (params?.id !== undefined)
        httpParams = httpParams.set('id', params.id.toString());
      if (params?.user_id !== undefined)
        httpParams = httpParams.set('user_id', params.user_id.toString());
      if (params?.type !== undefined)
        httpParams = httpParams.set('type', params.type.toString());
      if (params?.title !== undefined)
        httpParams = httpParams.set('title', params.title.toString());
      if (params?.message !== undefined)
        httpParams = httpParams.set('message', params.message.toString());
      if (params?.data !== undefined)
        httpParams = httpParams.set('data', params.data.toString());
      if (params?.action_url !== undefined)
        httpParams = httpParams.set('action_url', params.action_url.toString());
      if (params?.read !== undefined)
        httpParams = httpParams.set('read', params.read.toString());
      if (params?.read_at !== undefined)
        httpParams = httpParams.set('read_at', params.read_at.toString());
      if (params?.archived !== undefined)
        httpParams = httpParams.set('archived', params.archived.toString());
      if (params?.archived_at !== undefined)
        httpParams = httpParams.set(
          'archived_at',
          params.archived_at.toString(),
        );
      if (params?.priority !== undefined)
        httpParams = httpParams.set('priority', params.priority.toString());
      if (params?.expires_at !== undefined)
        httpParams = httpParams.set('expires_at', params.expires_at.toString());
      if (params?.created_at !== undefined)
        httpParams = httpParams.set('created_at', params.created_at.toString());
      if (params?.updated_at !== undefined)
        httpParams = httpParams.set('updated_at', params.updated_at.toString());

      const response = await this.http
        .get<ApiResponse<Notification[]>>(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response?.success && response.data) {
        this.notificationsListSignal.set(response.data);

        if (response.pagination) {
          this.totalNotificationSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.errorSignal.set(
        error.message || 'Failed to load notifications list',
      );
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

      if (response?.success && response.data) {
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
  async createNotification(
    data: CreateNotificationRequest,
  ): Promise<Notification | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<Notification>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response?.success && response.data) {
        // Optimistic update: add to list
        this.notificationsListSignal.update((list) => [
          ...list,
          response.data!,
        ]);
        this.totalNotificationSignal.update((total) => total + 1);
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
  async updateNotification(
    id: string,
    data: UpdateNotificationRequest,
  ): Promise<Notification | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<Notification>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response?.success && response.data) {
        // Optimistic update: replace in list
        this.notificationsListSignal.update((list) =>
          list.map((item) => (item.id === id ? response.data! : item)),
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
          list.filter((item) => item.id !== id),
        );
        this.totalNotificationSignal.update((total) => Math.max(0, total - 1));
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
   * Get dropdown options for notifications
   */
  async getDropdownOptions(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await this.http
        .get<
          ApiResponse<Array<{ value: string; label: string }>>
        >(`${this.baseUrl}/dropdown`)
        .toPromise();

      if (response?.success && response.data) {
        return response.data;
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
   * Bulk create notificationss
   */
  async bulkCreateNotification(
    items: CreateNotificationRequest[],
  ): Promise<BulkResponse<Notification> | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse<Notification>>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response?.success && response.data) {
        // Refresh list after bulk operation
        await this.loadNotificationList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(
        error.message || 'Failed to bulk create notificationss',
      );
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update notificationss
   */
  async bulkUpdateNotification(
    items: Array<{ id: string; data: UpdateNotificationRequest }>,
  ): Promise<BulkResponse<Notification> | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse<Notification>>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response?.success && response.data) {
        // Refresh list after bulk operation
        await this.loadNotificationList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(
        error.message || 'Failed to bulk update notificationss',
      );
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete notificationss
   */
  async bulkDeleteNotification(
    ids: string[],
  ): Promise<BulkResponse<Notification> | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<
          BulkResponse<Notification>
        >(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response?.success && response.data) {
        // Refresh list after bulk operation
        await this.loadNotificationList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(
        error.message || 'Failed to bulk delete notificationss',
      );
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ADVANCED OPERATIONS (FULL PACKAGE) =====

  /**
   * Validate notifications data before save
   */
  async validateNotification(
    data: CreateNotificationRequest,
  ): Promise<{ valid: boolean; errors?: any[] }> {
    try {
      const response = await this.http
        .post<
          ApiResponse<{ valid: boolean; errors?: any[] }>
        >(`${this.baseUrl}/validate`, { data })
        .toPromise();

      if (response?.success && response.data) {
        return response.data;
      }
      return { valid: false, errors: ['Validation failed'] };
    } catch (error: any) {
      console.error('Failed to validate notifications:', error);
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

      if (response?.success && response.data) {
        return response.data;
      }
      return { unique: false };
    } catch (error: any) {
      console.error('Failed to check uniqueness:', error);
      return { unique: false };
    }
  }

  /**
   * Get notifications statistics
   */
  async getStats(): Promise<{ total: number } | null> {
    try {
      const response = await this.http
        .get<ApiResponse<{ total: number }>>(`${this.baseUrl}/stats`)
        .toPromise();

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to get notifications stats:', error);
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
