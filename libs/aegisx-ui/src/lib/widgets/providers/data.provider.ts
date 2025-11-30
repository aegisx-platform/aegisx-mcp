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
 *     return this.http.get<T>(`/api${endpoint}`, { params: params as any });
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
   * @param params - Optional query parameters
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
