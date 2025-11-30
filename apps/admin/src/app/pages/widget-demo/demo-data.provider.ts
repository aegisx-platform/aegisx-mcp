import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { WidgetDataProvider } from '@aegisx/ui/widgets';

/**
 * Demo data provider with mock data for widget showcase
 */
@Injectable({ providedIn: 'root' })
export class DemoDataProvider implements WidgetDataProvider {
  private mockDelay = 300;

  fetch<T>(endpoint: string, _params?: Record<string, unknown>): Observable<T> {
    const data = this.getMockData(endpoint);
    return of(data as T).pipe(delay(this.mockDelay));
  }

  private getMockData(endpoint: string): unknown {
    // KPI endpoints
    if (endpoint.includes('revenue')) {
      return {
        value: 689372,
        change: 5.2,
        changeIsPercent: true,
        trend: 'up',
        previousLabel: 'vs last month',
      };
    }

    if (endpoint.includes('users')) {
      return {
        value: 12847,
        change: 12.5,
        changeIsPercent: true,
        trend: 'up',
        previousLabel: 'vs last month',
      };
    }

    if (endpoint.includes('orders')) {
      return {
        value: 1243,
        change: -3.2,
        changeIsPercent: true,
        trend: 'down',
        previousLabel: 'vs last month',
      };
    }

    if (endpoint.includes('conversion')) {
      return {
        value: 0.0342,
        change: 0.5,
        changeIsPercent: true,
        trend: 'up',
        previousLabel: 'vs last month',
      };
    }

    // Chart endpoints
    if (endpoint.includes('monthly-trend')) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
          {
            name: 'Revenue',
            data: [42000, 38000, 45000, 51000, 48000, 55000],
          },
          {
            name: 'Expenses',
            data: [28000, 32000, 30000, 35000, 33000, 38000],
          },
        ],
      };
    }

    if (endpoint.includes('category-breakdown')) {
      return {
        labels: ['Electronics', 'Clothing', 'Food', 'Services', 'Other'],
        series: [
          {
            name: 'Sales',
            data: [35, 25, 20, 15, 5],
          },
        ],
      };
    }

    if (endpoint.includes('weekly-sales')) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [
          {
            name: 'This Week',
            data: [120, 150, 180, 140, 200, 250, 180],
          },
        ],
      };
    }

    // Table endpoint
    if (endpoint.includes('recent-transactions')) {
      return {
        items: [
          {
            id: 'TXN001',
            customer: 'John Doe',
            amount: 1250.0,
            status: 'completed',
            date: '2024-01-15',
          },
          {
            id: 'TXN002',
            customer: 'Jane Smith',
            amount: 890.5,
            status: 'pending',
            date: '2024-01-15',
          },
          {
            id: 'TXN003',
            customer: 'Bob Wilson',
            amount: 2100.0,
            status: 'completed',
            date: '2024-01-14',
          },
          {
            id: 'TXN004',
            customer: 'Alice Brown',
            amount: 450.75,
            status: 'failed',
            date: '2024-01-14',
          },
          {
            id: 'TXN005',
            customer: 'Charlie Davis',
            amount: 3200.0,
            status: 'completed',
            date: '2024-01-13',
          },
          {
            id: 'TXN006',
            customer: 'Diana Evans',
            amount: 780.25,
            status: 'pending',
            date: '2024-01-13',
          },
          {
            id: 'TXN007',
            customer: 'Frank Garcia',
            amount: 1560.0,
            status: 'completed',
            date: '2024-01-12',
          },
        ],
        total: 156,
      };
    }

    // List endpoint
    if (endpoint.includes('recent-activities')) {
      return {
        items: [
          {
            id: '1',
            title: 'New order #1234',
            subtitle: '2 minutes ago',
            icon: 'shopping_cart',
            status: 'active',
          },
          {
            id: '2',
            title: 'Payment received',
            subtitle: '15 minutes ago',
            icon: 'payments',
            status: 'completed',
          },
          {
            id: '3',
            title: 'New user registered',
            subtitle: '1 hour ago',
            icon: 'person_add',
            status: 'completed',
          },
          {
            id: '4',
            title: 'Order shipped #1230',
            subtitle: '2 hours ago',
            icon: 'local_shipping',
            status: 'completed',
          },
          {
            id: '5',
            title: 'Refund requested',
            subtitle: '3 hours ago',
            icon: 'undo',
            status: 'pending',
          },
          {
            id: '6',
            title: 'Low stock alert',
            subtitle: '4 hours ago',
            icon: 'warning',
            status: 'warning',
          },
        ],
      };
    }

    // Progress endpoints
    if (endpoint.includes('storage-usage')) {
      return {
        value: 72,
        label: 'Storage',
        secondaryValue: 72,
        secondaryLabel: 'GB of 100 GB',
      };
    }

    if (endpoint.includes('monthly-target')) {
      return {
        value: 85,
        label: 'Target',
        secondaryValue: 850000,
        secondaryLabel: 'of $1M goal',
      };
    }

    // Default
    return { message: 'Mock data', endpoint };
  }
}
