import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import {
  SystemMetrics,
  APIPerformance,
  DatabaseStats,
  RedisStats,
  ActiveSessions,
  RequestMetrics,
  MonitoringState,
  ApiErrorResponse,
} from '../models/monitoring.types';

/**
 * Monitoring Service
 *
 * Provides methods to fetch system monitoring data including:
 * - System metrics (CPU, memory, process)
 * - API performance (response times, throughput)
 * - Database statistics (connection pool, queries)
 * - Redis statistics (cache hit rate, memory)
 * - Active sessions
 * - Request metrics by endpoint
 */
@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/monitoring';

  // Signal-based state management
  private _state = signal<MonitoringState>({
    systemMetrics: null,
    apiPerformance: null,
    databaseStats: null,
    redisStats: null,
    activeSessions: null,
    requestMetrics: null,
    loading: false,
    error: null,
  });

  // Read-only state signals
  readonly state = this._state.asReadonly();
  readonly systemMetrics = () => this._state().systemMetrics;
  readonly apiPerformance = () => this._state().apiPerformance;
  readonly databaseStats = () => this._state().databaseStats;
  readonly redisStats = () => this._state().redisStats;
  readonly activeSessions = () => this._state().activeSessions;
  readonly requestMetrics = () => this._state().requestMetrics;
  readonly loading = () => this._state().loading;
  readonly error = () => this._state().error;

  /**
   * Get system metrics (CPU, memory, process stats)
   */
  getSystemMetrics(): Observable<SystemMetrics> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<{
        success: true;
        data: SystemMetrics;
        message: string;
      }>(`${this.baseUrl}/system-metrics`)
      .pipe(
        map((response) => response.data),
        tap((metrics) => {
          this.updateState({
            systemMetrics: metrics,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Get API performance metrics (response times, throughput)
   */
  getAPIPerformance(): Observable<APIPerformance> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<{
        success: true;
        data: APIPerformance;
        message: string;
      }>(`${this.baseUrl}/api-performance`)
      .pipe(
        map((response) => response.data),
        tap((performance) => {
          this.updateState({
            apiPerformance: performance,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Get database statistics (connection pool, queries)
   */
  getDatabaseStats(): Observable<DatabaseStats> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<{
        success: true;
        data: DatabaseStats;
        message: string;
      }>(`${this.baseUrl}/database-pool`)
      .pipe(
        map((response) => response.data),
        tap((stats) => {
          this.updateState({
            databaseStats: stats,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Get Redis statistics (cache hit rate, memory)
   */
  getRedisStats(): Observable<RedisStats> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<{
        success: true;
        data: RedisStats;
        message: string;
      }>(`${this.baseUrl}/cache-stats`)
      .pipe(
        map((response) => response.data),
        tap((stats) => {
          this.updateState({
            redisStats: stats,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Get active sessions count
   */
  getActiveSessions(): Observable<ActiveSessions> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<{
        success: true;
        data: ActiveSessions;
        message: string;
      }>(`${this.baseUrl}/active-sessions`)
      .pipe(
        map((response) => response.data),
        tap((sessions) => {
          this.updateState({
            activeSessions: sessions,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Get request metrics by endpoint
   */
  getRequestMetrics(): Observable<RequestMetrics> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<{
        success: true;
        data: RequestMetrics;
        message: string;
      }>(`${this.baseUrl}/request-metrics`)
      .pipe(
        map((response) => response.data),
        tap((metrics) => {
          this.updateState({
            requestMetrics: metrics,
            loading: false,
          });
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this.setLoading(false)),
      );
  }

  /**
   * Load all monitoring data at once
   */
  loadAllMetrics(): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return new Observable((observer) => {
      Promise.all([
        this.getSystemMetrics().toPromise(),
        this.getAPIPerformance().toPromise(),
        this.getDatabaseStats().toPromise(),
        this.getRedisStats().toPromise(),
        this.getActiveSessions().toPromise(),
        this.getRequestMetrics().toPromise(),
      ])
        .then(() => {
          this.setLoading(false);
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error);
          observer.error(error);
        });
    });
  }

  /**
   * Refresh monitoring data
   */
  refresh(): void {
    this.loadAllMetrics().subscribe({
      next: () => console.log('Monitoring data refreshed'),
      error: (error) =>
        console.error('Failed to refresh monitoring data:', error),
    });
  }

  // Private helper methods

  private updateState(partialState: Partial<MonitoringState>): void {
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

    console.error('Monitoring API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
