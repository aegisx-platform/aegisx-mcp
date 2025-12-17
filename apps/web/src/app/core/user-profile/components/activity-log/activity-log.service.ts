import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  ActivityLog,
  ActivityLogFilters,
  ActivityLogPagination,
  ActivityLogResponse,
  ActivityLogStats,
  ApiResponse,
} from './activity-log.types';

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  private http = inject(HttpClient);
  private baseUrl = '/v1/platform/profile/activity';
  private adminBaseUrl = '/activity-logs';

  // Track if we're in admin mode (viewing specific user)
  private adminModeSignal = signal<boolean>(false);
  private userIdSignal = signal<string | null>(null);

  // Signals for state management
  private activitiesSignal = signal<ActivityLog[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private statsSignal = signal<ActivityLogStats | null>(null);
  private statsLoadingSignal = signal<boolean>(false);
  private statsLoadedOnceSignal = signal<boolean>(false); // Prevent duplicate stats calls
  private paginationSignal = signal<{
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Filter state
  private filtersSubject = new BehaviorSubject<ActivityLogFilters>({
    page: 1,
    limit: 20,
  });

  // Public readonly signals
  readonly activities = this.activitiesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly stats = this.statsSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly filters = this.filtersSubject.asObservable();

  // Computed signals
  readonly hasActivities = computed(() => {
    const activities = this.activitiesSignal();
    return Array.isArray(activities) && activities.length > 0;
  });
  readonly totalActivities = computed(
    () => this.paginationSignal()?.total ?? 0,
  );
  readonly currentPage = computed(() => this.paginationSignal()?.page ?? 1);
  readonly totalPages = computed(() => this.paginationSignal()?.pages ?? 1);
  readonly hasNextPage = computed(
    () => this.paginationSignal()?.hasNext ?? false,
  );
  readonly hasPrevPage = computed(
    () => this.paginationSignal()?.hasPrev ?? false,
  );

  /**
   * Load activity logs with optional filters
   * If userId is provided, uses admin endpoint to view specific user's activities
   */
  loadActivities(
    filters?: ActivityLogFilters & { userId?: string },
  ): Observable<ActivityLogResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Extract userId if provided
    const userId = filters?.userId;
    if (userId) {
      this.userIdSignal.set(userId);
      this.adminModeSignal.set(true);
    }

    // Build HTTP params
    let httpParams = new HttpParams();
    const currentFilters = { ...this.filtersSubject.value, ...filters };

    // Remove userId from filters before passing to API
    const { userId: _, ...filterParams } = currentFilters;

    if (filterParams.page)
      httpParams = httpParams.set('page', filterParams.page.toString());
    if (filterParams.limit)
      httpParams = httpParams.set('limit', filterParams.limit.toString());
    if (filterParams.action)
      httpParams = httpParams.set('action', filterParams.action);
    if (filterParams.severity)
      httpParams = httpParams.set('severity', filterParams.severity);
    if (filterParams.search)
      httpParams = httpParams.set('search', filterParams.search);
    if (filterParams.dateFrom)
      httpParams = httpParams.set('dateFrom', filterParams.dateFrom);
    if (filterParams.dateTo)
      httpParams = httpParams.set('dateTo', filterParams.dateTo);
    if (filterParams.sessionId)
      httpParams = httpParams.set('session_id', filterParams.sessionId);

    // Add userId to params for admin endpoint
    if (userId) {
      httpParams = httpParams.set('user_id', userId);
    }

    // Update filters (without userId)
    this.filtersSubject.next(filterParams);

    // Choose endpoint based on admin mode
    const endpoint = userId ? this.adminBaseUrl : this.baseUrl;

    return this.http
      .get<{
        success: boolean;
        data: ActivityLog[];
        pagination: ActivityLogPagination;
      }>(endpoint, { params: httpParams })
      .pipe(
        tap((response) => {
          if (!response.success || !response.data) {
            this.errorSignal.set('Failed to load activities');
            this.loadingSignal.set(false);
            return;
          }
          console.log('✅ Activities loaded successfully', response.data);
          this.activitiesSignal.set(response.data);
          this.paginationSignal.set(response.pagination);
          this.loadingSignal.set(false);
        }),
        map(
          (response) =>
            ({
              activities: response.data,
              pagination: response.pagination,
            }) as ActivityLogResponse,
        ),
        catchError((error) => {
          // Extract error message from various possible locations
          let errorMessage = 'Failed to load activities';

          if (typeof error.error?.error === 'string') {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.errorSignal.set(errorMessage);
          this.loadingSignal.set(false);
          throw error;
        }),
      );
  }

  /**
   * Load activity statistics
   * If userId is provided, loads stats for that specific user (admin mode)
   * Otherwise loads stats for current user
   */
  loadStats(
    forceRefresh: boolean = false,
    userId?: string,
  ): Observable<ActivityLogStats> {
    // Set admin mode and userId if provided
    if (userId) {
      this.userIdSignal.set(userId);
      this.adminModeSignal.set(true);
    }

    // Don't load if already loaded and not forcing refresh
    if (
      this.statsLoadedOnceSignal() &&
      !forceRefresh &&
      !this.statsLoadingSignal()
    ) {
      console.log('✅ Activity stats already loaded, skipping duplicate call');
      const currentStats = this.statsSignal();
      if (currentStats) {
        return new Observable((subscriber) => {
          subscriber.next(currentStats);
          subscriber.complete();
        });
      }
    }

    this.statsLoadingSignal.set(true);

    // Build params for admin endpoint if in admin mode
    let httpParams = new HttpParams();
    const effectiveUserId = userId || this.userIdSignal();
    if (effectiveUserId) {
      httpParams = httpParams.set('user_id', effectiveUserId);
    }

    // Choose endpoint based on admin mode
    const endpoint = effectiveUserId
      ? `${this.adminBaseUrl}/stats`
      : `${this.baseUrl}/stats`;

    return this.http
      .get<ApiResponse<ActivityLogStats>>(endpoint, { params: httpParams })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to load activity stats');
          }
          return response.data;
        }),
        tap((stats) => {
          this.statsSignal.set(stats);
          this.statsLoadedOnceSignal.set(true);
          this.statsLoadingSignal.set(false);
        }),
        catchError((error) => {
          // Extract error message from various possible locations
          let errorMessage = 'Failed to load stats';

          if (typeof error.error?.error === 'string') {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.errorSignal.set(errorMessage);
          this.statsLoadingSignal.set(false);
          throw error;
        }),
      );
  }

  /**
   * Update filters and reload activities
   */
  updateFilters(filters: Partial<ActivityLogFilters>): void {
    const currentFilters = this.filtersSubject.value;
    const newFilters = {
      ...currentFilters,
      ...filters,
      page: filters.page ?? 1, // Reset to first page when filters change (except page itself)
    };

    this.loadActivities(newFilters).subscribe();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    this.updateFilters({ page });
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    const pagination = this.paginationSignal();
    if (pagination?.hasNext) {
      this.goToPage(pagination.page + 1);
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    const pagination = this.paginationSignal();
    if (pagination?.hasPrev) {
      this.goToPage(pagination.page - 1);
    }
  }

  /**
   * Change page size
   */
  changePageSize(limit: number): void {
    this.updateFilters({ limit, page: 1 });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filtersSubject.next({ page: 1, limit: 20 });
    this.loadActivities({ page: 1, limit: 20 }).subscribe();
  }

  /**
   * Refresh current page
   */
  refresh(): void {
    const currentFilters = this.filtersSubject.value;
    this.loadActivities(currentFilters).subscribe();
  }

  /**
   * Refresh stats (force reload)
   */
  refreshStats(): void {
    this.statsLoadedOnceSignal.set(false);
    this.loadStats(true).subscribe();
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
    this.activitiesSignal.set([]);
    this.statsSignal.set(null);
    this.paginationSignal.set(null);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
    this.statsLoadingSignal.set(false);
    this.statsLoadedOnceSignal.set(false); // Reset stats loaded flag
    this.filtersSubject.next({ page: 1, limit: 20 });
  }

  /**
   * Get current filters value
   */
  getCurrentFilters(): ActivityLogFilters {
    return this.filtersSubject.value;
  }

  /**
   * Format activity timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - activityTime.getTime()) / 1000,
    );

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  }
}
