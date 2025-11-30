import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { WidgetDataProvider } from '../data.provider';

/**
 * Mock data provider for demos and testing.
 * Returns sample data for common widget types.
 */
@Injectable()
export class MockDataProvider implements WidgetDataProvider {
  private mockDelay = 500; // ms

  fetch<T>(endpoint: string, _params?: Record<string, unknown>): Observable<T> {
    const data = this.getMockData(endpoint);
    return of(data as T).pipe(delay(this.mockDelay));
  }

  private getMockData(endpoint: string): unknown {
    // KPI data
    if (endpoint.includes('kpi') || endpoint.includes('stats')) {
      return {
        value: Math.floor(Math.random() * 100000),
        change: (Math.random() * 20 - 10).toFixed(1),
        trend: Math.random() > 0.5 ? 'up' : 'down',
      };
    }

    // Chart data
    if (endpoint.includes('chart') || endpoint.includes('trend')) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Series A',
            data: Array.from({ length: 6 }, () =>
              Math.floor(Math.random() * 100),
            ),
          },
        ],
      };
    }

    // Table data
    if (endpoint.includes('table') || endpoint.includes('list')) {
      return {
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `item-${i + 1}`,
          name: `Item ${i + 1}`,
          status: ['active', 'pending', 'completed'][
            Math.floor(Math.random() * 3)
          ],
          value: Math.floor(Math.random() * 1000),
          date: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })),
        total: 100,
      };
    }

    // Progress data
    if (endpoint.includes('progress')) {
      return {
        value: Math.floor(Math.random() * 100),
        max: 100,
        label: 'Progress',
      };
    }

    // Default
    return { message: 'Mock data', endpoint };
  }
}
