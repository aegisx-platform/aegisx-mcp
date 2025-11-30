import { Observable } from 'rxjs';
import { DashboardConfig, DashboardSummary } from '../core/widget.types';

/**
 * Interface for dashboard configuration storage.
 * Applications can implement this to persist dashboards to API, localStorage, etc.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class ApiStorageProvider implements WidgetStorageProvider {
 *   constructor(private http: HttpClient) {}
 *
 *   save(dashboard: DashboardConfig): Observable<void> {
 *     return this.http.put(`/api/dashboards/${dashboard.id}`, dashboard);
 *   }
 *
 *   load(id: string): Observable<DashboardConfig | null> {
 *     return this.http.get<DashboardConfig>(`/api/dashboards/${id}`);
 *   }
 *
 *   list(): Observable<DashboardSummary[]> {
 *     return this.http.get<DashboardSummary[]>('/api/dashboards');
 *   }
 *
 *   delete(id: string): Observable<void> {
 *     return this.http.delete<void>(`/api/dashboards/${id}`);
 *   }
 * }
 * ```
 */
export interface WidgetStorageProvider {
  /**
   * Save dashboard configuration
   * @param dashboard - Dashboard config to save
   */
  save(dashboard: DashboardConfig): Observable<void>;

  /**
   * Load dashboard by ID
   * @param id - Dashboard ID
   * @returns Dashboard config or null if not found
   */
  load(id: string): Observable<DashboardConfig | null>;

  /**
   * List all dashboards
   * @returns Array of dashboard summaries
   */
  list(): Observable<DashboardSummary[]>;

  /**
   * Delete dashboard
   * @param id - Dashboard ID to delete
   */
  delete(id: string): Observable<void>;
}
