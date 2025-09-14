import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  ActivityLog,
  ActivityLogResponse,
  ActivityLogStats,
  ActivityLogFilters,
  ApiResponse,
} from './activity-log.types';

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/profile/activity`;

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
  readonly hasActivities = computed(() => this.activitiesSignal().length > 0);
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
   */
  loadActivities(
    filters?: ActivityLogFilters,
  ): Observable<ActivityLogResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Build HTTP params
    let httpParams = new HttpParams();
    const currentFilters = { ...this.filtersSubject.value, ...filters };

    if (currentFilters.page)
      httpParams = httpParams.set('page', currentFilters.page.toString());
    if (currentFilters.limit)
      httpParams = httpParams.set('limit', currentFilters.limit.toString());
    if (currentFilters.action)
      httpParams = httpParams.set('action', currentFilters.action);
    if (currentFilters.severity)
      httpParams = httpParams.set('severity', currentFilters.severity);
    if (currentFilters.search)
      httpParams = httpParams.set('search', currentFilters.search);
    if (currentFilters.dateFrom)
      httpParams = httpParams.set('dateFrom', currentFilters.dateFrom);
    if (currentFilters.dateTo)
      httpParams = httpParams.set('dateTo', currentFilters.dateTo);

    // Update filters
    this.filtersSubject.next(currentFilters);

    return this.http
      .get<
        ApiResponse<ActivityLogResponse>
      >(this.baseUrl, { params: httpParams })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to load activities');
          }
          return response.data;
        }),
        tap((data) => {
          this.activitiesSignal.set(data.activities);
          this.paginationSignal.set(data.pagination);
          this.loadingSignal.set(false);
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.error || error.message || 'Failed to load activities';
          this.errorSignal.set(errorMessage);
          this.loadingSignal.set(false);
          throw error;
        }),
      );
  }

  /**
   * Load activity statistics
   */
  loadStats(forceRefresh: boolean = false): Observable<ActivityLogStats> {
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

    return this.http
      .get<ApiResponse<ActivityLogStats>>(`${this.baseUrl}/stats`)
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
          const errorMessage =
            error.error?.error || error.message || 'Failed to load stats';
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
