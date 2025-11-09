import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  ActivitySession,
  SessionFilters,
  SessionPagination,
  SessionsResponse,
  SessionStats,
  ApiResponse,
} from './sessions.types';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private http = inject(HttpClient);
  private adminBaseUrl = '/activity-logs/sessions';

  // Track if we're in admin mode (viewing specific user)
  private adminModeSignal = signal<boolean>(false);
  private userIdSignal = signal<string | null>(null);

  // Signals for state management
  private sessionsSignal = signal<ActivitySession[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private statsSignal = signal<SessionStats | null>(null);
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
  private filtersSubject = new BehaviorSubject<SessionFilters>({
    page: 1,
    limit: 10,
  });

  // Public readonly signals
  readonly sessions = this.sessionsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly stats = this.statsSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly filters = this.filtersSubject.asObservable();

  // Computed signals
  readonly hasSessions = computed(() => {
    const sessions = this.sessionsSignal();
    return Array.isArray(sessions) && sessions.length > 0;
  });
  readonly totalSessions = computed(() => this.paginationSignal()?.total ?? 0);
  readonly currentPage = computed(() => this.paginationSignal()?.page ?? 1);
  readonly totalPages = computed(() => this.paginationSignal()?.pages ?? 1);
  readonly hasNextPage = computed(
    () => this.paginationSignal()?.hasNext ?? false,
  );
  readonly hasPrevPage = computed(
    () => this.paginationSignal()?.hasPrev ?? false,
  );

  /**
   * Load sessions with optional filters
   * If userId is provided, uses admin endpoint to view specific user's sessions
   */
  loadSessions(
    filters?: SessionFilters & { userId?: string },
  ): Observable<SessionsResponse> {
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
    if (filterParams.status)
      httpParams = httpParams.set('status', filterParams.status);
    if (filterParams.deviceType)
      httpParams = httpParams.set('device_type', filterParams.deviceType);
    if (filterParams.dateFrom)
      httpParams = httpParams.set('date_from', filterParams.dateFrom);
    if (filterParams.dateTo)
      httpParams = httpParams.set('date_to', filterParams.dateTo);

    // Add userId to params for admin endpoint
    if (userId) {
      httpParams = httpParams.set('user_id', userId);
    }

    // Update filters (without userId)
    this.filtersSubject.next(filterParams);

    return this.http
      .get<{
        success: boolean;
        data: ActivitySession[];
        pagination: SessionPagination;
      }>(this.adminBaseUrl, { params: httpParams })
      .pipe(
        tap((response) => {
          if (!response.success || !response.data) {
            this.errorSignal.set('Failed to load sessions');
            this.loadingSignal.set(false);
            return;
          }
          console.log('✅ Sessions loaded successfully', response.data);
          this.sessionsSignal.set(response.data);
          this.paginationSignal.set(response.pagination);
          this.loadingSignal.set(false);
        }),
        map(
          (response) =>
            ({
              sessions: response.data,
              pagination: response.pagination,
            }) as SessionsResponse,
        ),
        catchError((error) => {
          // Extract error message from various possible locations
          let errorMessage = 'Failed to load sessions';

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
   * Load session statistics
   * If userId is provided, loads stats for that specific user (admin mode)
   */
  loadStats(
    forceRefresh: boolean = false,
    userId?: string,
  ): Observable<SessionStats> {
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
      console.log('✅ Session stats already loaded, skipping duplicate call');
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

    return this.http
      .get<ApiResponse<SessionStats>>('/activity-logs/stats', {
        params: httpParams,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to load session stats');
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
   * Update filters and reload sessions
   */
  updateFilters(filters: Partial<SessionFilters>): void {
    const currentFilters = this.filtersSubject.value;
    const newFilters = {
      ...currentFilters,
      ...filters,
      page: filters.page ?? 1, // Reset to first page when filters change
    };

    this.loadSessions(newFilters).subscribe();
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
    this.filtersSubject.next({ page: 1, limit: 10 });
    this.loadSessions({ page: 1, limit: 10 }).subscribe();
  }

  /**
   * Refresh current page
   */
  refresh(): void {
    const currentFilters = this.filtersSubject.value;
    this.loadSessions(currentFilters).subscribe();
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
    this.sessionsSignal.set([]);
    this.statsSignal.set(null);
    this.paginationSignal.set(null);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
    this.statsLoadingSignal.set(false);
    this.statsLoadedOnceSignal.set(false);
    this.filtersSubject.next({ page: 1, limit: 10 });
  }

  /**
   * Get current filters value
   */
  getCurrentFilters(): SessionFilters {
    return this.filtersSubject.value;
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const sessionTime = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - sessionTime.getTime()) / 1000,
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
      return sessionTime.toLocaleDateString();
    }
  }

  /**
   * Format duration between two timestamps
   */
  formatDuration(startTime: string, endTime?: string): string {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }
}
