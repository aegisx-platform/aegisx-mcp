import { Injectable, signal, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import {
  ActivityLog,
  ActivityLogsQuery,
  ActivityStats,
  CleanupQuery,
  ActivityLogsState,
  ActivityLogsListResponse,
  ActivityStatsResponse,
  CleanupResponse,
  ApiErrorResponse,
} from '../models/monitoring.types';

/**
 * Activity Logs Service
 *
 * Provides methods to manage and view activity logs including:
 * - Query activity logs with filters (admin only)
 * - Get activity statistics
 * - Delete activity logs (future)
 * - Cleanup old activity logs (future)
 * - Export activity logs
 *
 * Note: This service uses admin endpoints at /activity-logs
 * For user's own activity logs, use UserProfileService
 */
@Injectable({
  providedIn: 'root',
})
export class ActivityLogsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/activity-logs';

  // Signal-based state management
  private _state = signal<ActivityLogsState>({
    activityLogs: [],
    activityStats: null,
    loading: false,
    error: null,
    pagination: null,
  });

  // Read-only state signals
  readonly state = this._state.asReadonly();
  readonly activityLogs = () => this._state().activityLogs;
  readonly activityStats = () => this._state().activityStats;
  readonly loading = () => this._state().loading;
  readonly error = () => this._state().error;
  readonly pagination = () => this._state().pagination;

  /**
   * Get activity logs with optional filters (admin only)
   */
  getActivityLogs(query?: ActivityLogsQuery): Observable<{
    activities: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<ActivityLogsListResponse>(`${this.baseUrl}`, { params })
      .pipe(
        map((response) => response.data),
        tap(({ activities, pagination }) => {
          this.updateState({
            activityLogs: activities,
            pagination: pagination,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Get activity statistics (admin only)
   */
  getActivityStats(): Observable<ActivityStats> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ActivityStatsResponse>(`${this.baseUrl}/stats`).pipe(
      map((response) => response.data),
      tap((stats) => {
        this.updateState({
          activityStats: stats,
          loading: false,
        });
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.setLoading(false)),
    );
  }

  /**
   * Get a single activity log by ID
   */
  getActivityLog(id: string): Observable<ActivityLog> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<{
        success: true;
        data: ActivityLog;
      }>(`${this.baseUrl}/${id}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Delete a single activity log (future implementation)
   */
  deleteActivityLog(id: string): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .delete<{ success: true; message: string }>(`${this.baseUrl}/${id}`)
      .pipe(
        map(() => undefined),
        tap(() => {
          // Remove from state
          const currentLogs = this.activityLogs();
          const updatedLogs = currentLogs.filter((log) => log.id !== id);
          this.updateState({
            activityLogs: updatedLogs,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Cleanup old activity logs (future implementation)
   */
  cleanupLogs(query: CleanupQuery): Observable<{ deletedCount: number }> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http
      .delete<CleanupResponse>(`${this.baseUrl}/cleanup`, { params })
      .pipe(
        map((response) => response.data),
        tap(({ deletedCount }) => {
          console.log(`Deleted ${deletedCount} activity logs`);
          this.updateState({ loading: false });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Export activity logs (returns blob for download)
   */
  exportLogs(query?: ActivityLogsQuery): Observable<Blob> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get(`${this.baseUrl}/export`, {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          // Extract filename from Content-Disposition header if available
          const contentDisposition = response.headers.get(
            'Content-Disposition',
          );
          let filename = 'activity-logs.csv';
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
              contentDisposition,
            );
            if (matches && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          // Create download link
          const blob = response.body!;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);

          return blob;
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Refresh activity logs
   */
  refresh(query?: ActivityLogsQuery): void {
    this.getActivityLogs(query).subscribe({
      next: () => console.log('Activity logs refreshed'),
      error: (error) =>
        console.error('Failed to refresh activity logs:', error),
    });
  }

  // Private helper methods

  private updateState(partialState: Partial<ActivityLogsState>): void {
    this._state.update((current) => ({ ...current, ...partialState }));
  }

  private setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  private clearError(): void {
    this.updateState({ error: null });
  }

  private setError(error: string): void {
    this.updateState({ error, loading: false });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as ApiErrorResponse;
      errorMessage = apiError.error?.message || 'An unexpected error occurred';
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
    }

    this.setError(errorMessage);

    console.error('Activity Logs API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
