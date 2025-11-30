import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { DashboardConfig, DashboardSummary } from '../../core/widget.types';
import { WidgetStorageProvider } from '../storage.provider';

const STORAGE_KEY = 'ax-dashboards';

/**
 * LocalStorage implementation of WidgetStorageProvider.
 * Useful for prototyping and demos.
 *
 * For production, implement your own provider using API.
 */
@Injectable()
export class LocalStorageProvider implements WidgetStorageProvider {
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  save(dashboard: DashboardConfig): Observable<void> {
    if (!this.isBrowser) {
      return of(undefined);
    }

    try {
      const dashboards = this.getAllDashboards();
      const index = dashboards.findIndex((d) => d.id === dashboard.id);

      dashboard.updatedAt = new Date().toISOString();

      if (index >= 0) {
        dashboards[index] = dashboard;
      } else {
        dashboard.createdAt = dashboard.createdAt || new Date().toISOString();
        dashboards.push(dashboard);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
      return of(undefined);
    } catch (_error) {
      return throwError(() => new Error('Failed to save dashboard'));
    }
  }

  load(id: string): Observable<DashboardConfig | null> {
    if (!this.isBrowser) {
      return of(null);
    }

    const dashboards = this.getAllDashboards();
    const dashboard = dashboards.find((d) => d.id === id) || null;
    return of(dashboard);
  }

  list(): Observable<DashboardSummary[]> {
    if (!this.isBrowser) {
      return of([]);
    }

    const dashboards = this.getAllDashboards();
    const summaries: DashboardSummary[] = dashboards.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      widgetCount: d.widgets.length,
      updatedAt: d.updatedAt,
      createdBy: d.createdBy,
    }));

    return of(summaries);
  }

  delete(id: string): Observable<void> {
    if (!this.isBrowser) {
      return of(undefined);
    }

    try {
      const dashboards = this.getAllDashboards().filter((d) => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
      return of(undefined);
    } catch (_error) {
      return throwError(() => new Error('Failed to delete dashboard'));
    }
  }

  private getAllDashboards(): DashboardConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
