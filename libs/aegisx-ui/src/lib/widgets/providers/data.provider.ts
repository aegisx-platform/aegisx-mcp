import { Observable } from 'rxjs';

/**
 * Interface for widget data fetching.
 * Applications must implement this to provide data to widgets.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MyApiDataProvider implements WidgetDataProvider {
 *   constructor(private http: HttpClient) {}
 *
 *   fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
 *     const httpParams = new HttpParams();
 *     if (params) {
 *       Object.entries(params).forEach(([key, value]) => {
 *         httpParams = httpParams.set(key, String(value));
 *       });
 *     }
 *     return this.http.get<T>(`/api${endpoint}`, { params: httpParams });
 *   }
 *
 *   subscribe<T>(channel: string): Observable<T> {
 *     return this.wsService.listen<T>(channel);
 *   }
 * }
 * ```
 */
export interface WidgetDataProvider {
  /**
   * Fetch data from API endpoint
   * @param endpoint - API endpoint path (e.g., '/dashboard/stats')
   * @param params - Optional query parameters as key-value pairs
   * @returns Observable of response data
   */
  fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T>;

  /**
   * Subscribe to real-time data updates (optional)
   * @param channel - WebSocket channel name
   * @returns Observable of real-time data
   */
  subscribe?<T>(channel: string): Observable<T>;
}
