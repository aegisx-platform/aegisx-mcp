# Widget Framework - Usage Guide

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Data Provider](#data-provider)
3. [Storage Provider](#storage-provider)
4. [Using Built-in Widgets](#using-built-in-widgets)
5. [Dashboard Configuration](#dashboard-configuration)
6. [Real-time Updates](#real-time-updates)
7. [Creating Custom Widgets](#creating-custom-widgets)

---

## Installation & Setup

### Basic Setup

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideWidgetFramework } from '@aegisx/ui/widgets';
import { MyDataProvider } from './providers/my-data.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideWidgetFramework({
      dataProvider: MyDataProvider,
    }),
  ],
};
```

### Full Setup with All Providers

```typescript
provideWidgetFramework({
  dataProvider: MyApiDataProvider,
  storageProvider: MyDatabaseStorageProvider, // Optional
  realtimeProvider: MyWebSocketProvider, // Optional
  widgets: [MyCustomWidget], // Optional custom widgets
});
```

---

## Data Provider

Data Provider จัดการการดึงข้อมูลจาก API

### Interface

```typescript
interface WidgetDataProvider {
  fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T>;
  subscribe?<T>(channel: string): Observable<T>; // Optional for real-time
}
```

### Implementation Example

```typescript
// providers/api-data.provider.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetDataProvider } from '@aegisx/ui/widgets';

@Injectable({ providedIn: 'root' })
export class ApiDataProvider implements WidgetDataProvider {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      params: params as any,
    });
  }
}
```

### API Response Formats

Widgets expect specific data formats:

**KPI Widget:**

```json
{
  "value": 125000,
  "change": 12.5,
  "trend": "up"
}
```

**Chart Widget:**

```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr"],
  "series": [{ "name": "Revenue", "data": [100, 150, 120, 180] }]
}
```

**Table Widget:**

```json
{
  "items": [{ "id": "1", "name": "Item 1", "status": "active" }],
  "total": 100
}
```

**List Widget:**

```json
{
  "items": [{ "id": "1", "title": "Task 1", "status": "completed", "icon": "check" }]
}
```

**Progress Widget:**

```json
{
  "value": 75,
  "label": "Storage Used"
}
```

---

## Storage Provider

Storage Provider จัดการการบันทึก dashboard configuration

### Default: LocalStorage

ถ้าไม่ระบุ storageProvider จะใช้ LocalStorageProvider

### Custom API Storage

```typescript
// providers/api-storage.provider.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WidgetStorageProvider, DashboardConfig, DashboardSummary } from '@aegisx/ui/widgets';

@Injectable({ providedIn: 'root' })
export class ApiStorageProvider implements WidgetStorageProvider {
  private http = inject(HttpClient);

  save(dashboard: DashboardConfig): Observable<void> {
    return this.http.put<void>(`/api/dashboards/${dashboard.id}`, dashboard);
  }

  load(id: string): Observable<DashboardConfig | null> {
    return this.http.get<DashboardConfig>(`/api/dashboards/${id}`);
  }

  list(): Observable<DashboardSummary[]> {
    return this.http.get<DashboardSummary[]>('/api/dashboards');
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/dashboards/${id}`);
  }
}
```

---

## Using Built-in Widgets

### KPI Widget

```typescript
// Widget config
{
  title: 'Total Revenue',
  format: 'currency',        // 'number' | 'currency' | 'percent' | 'compact'
  currency: 'USD',
  showTrend: true,
  color: 'success',          // 'default' | 'primary' | 'success' | 'warning' | 'error'
}

// Data source
{
  endpoint: '/dashboard/revenue',
  refreshInterval: 30000     // Auto-refresh every 30s
}
```

### Chart Widget

```typescript
// Widget config
{
  title: 'Monthly Sales',
  type: 'bar',               // 'line' | 'bar' | 'donut'
  showLegend: true,
  showGrid: true,
  smooth: true,              // For line charts
}

// Data source
{
  endpoint: '/dashboard/sales-chart',
  wsChannel: 'dashboard.sales'  // Real-time updates
}
```

### Table Widget

```typescript
// Widget config
{
  title: 'Recent Orders',
  columns: [
    { key: 'id', label: 'Order ID', width: '100px' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', type: 'status' }
  ],
  pageSize: 5,
  sortable: true,
}
```

### List Widget

```typescript
// Widget config
{
  title: 'Recent Activities',
  maxItems: 5,
  showIcons: true,
  divided: true,
  clickable: true,
}
```

### Progress Widget

```typescript
// Widget config
{
  title: 'Storage Usage',
  type: 'circular',          // 'circular' | 'linear' | 'gauge'
  max: 100,
  showPercent: true,
  autoColor: true,           // Green < 70%, Yellow < 90%, Red >= 90%
}
```

---

## Dashboard Configuration

### Dashboard Config Structure

```typescript
interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  columns: number; // Grid columns (default: 4)
  rowHeight: number; // Row height in px (default: 160)
  gap: number; // Gap between widgets (default: 16)
  widgets: WidgetInstance[];
}

interface WidgetInstance {
  instanceId: string; // Unique ID
  widgetId: string; // Widget type (e.g., 'ax-kpi-widget')
  position: {
    x: number;
    y: number;
    cols: number;
    rows: number;
  };
  config: object; // Widget-specific config
  dataSource?: {
    endpoint?: string;
    wsChannel?: string;
    refreshInterval?: number;
  };
}
```

### Example Dashboard Config

```json
{
  "id": "finance-dashboard",
  "name": "Finance Overview",
  "columns": 4,
  "rowHeight": 160,
  "gap": 16,
  "widgets": [
    {
      "instanceId": "w1",
      "widgetId": "ax-kpi-widget",
      "position": { "x": 0, "y": 0, "cols": 1, "rows": 1 },
      "config": {
        "title": "Revenue",
        "format": "currency",
        "color": "success"
      },
      "dataSource": {
        "endpoint": "/dashboard/revenue"
      }
    },
    {
      "instanceId": "w2",
      "widgetId": "ax-chart-widget",
      "position": { "x": 1, "y": 0, "cols": 2, "rows": 2 },
      "config": {
        "title": "Monthly Trend",
        "type": "line"
      },
      "dataSource": {
        "endpoint": "/dashboard/trend"
      }
    }
  ]
}
```

---

## Real-time Updates

### WebSocket Provider

```typescript
// providers/websocket.provider.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { WidgetRealtimeProvider, RealtimeConnectionStatus } from '@aegisx/ui/widgets';

@Injectable({ providedIn: 'root' })
export class SocketIoRealtimeProvider implements WidgetRealtimeProvider {
  private socket: Socket | null = null;
  private status$ = new BehaviorSubject<RealtimeConnectionStatus>('disconnected');

  connectionStatus$ = this.status$.asObservable();

  connect(): void {
    this.socket = io('wss://your-api.com');
    this.socket.on('connect', () => this.status$.next('connected'));
    this.socket.on('disconnect', () => this.status$.next('disconnected'));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.status$.next('disconnected');
  }

  subscribe<T>(channel: string): Observable<T> {
    return new Observable((subscriber) => {
      this.socket?.on(channel, (data: T) => subscriber.next(data));
      return () => this.socket?.off(channel);
    });
  }
}
```

### Setup with Real-time

```typescript
provideWidgetFramework({
  dataProvider: ApiDataProvider,
  realtimeProvider: SocketIoRealtimeProvider,
});
```

### Widget Data Source with WebSocket

```typescript
{
  "dataSource": {
    "endpoint": "/dashboard/orders",      // Initial load
    "wsChannel": "dashboard.orders",      // Real-time updates
    "refreshInterval": 0                  // Disable polling (using WS)
  }
}
```

---

## Creating Custom Widgets

### 1. Define Types

```typescript
// my-widget.types.ts
export interface MyWidgetConfig {
  title: string;
  customOption: string;
}

export interface MyWidgetData {
  items: { id: string; value: number }[];
}

export const MY_WIDGET_DEFAULTS: MyWidgetConfig = {
  title: 'My Widget',
  customOption: 'default',
};
```

### 2. Create Component

```typescript
// my-widget.component.ts
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseWidgetComponent } from '@aegisx/ui/widgets';
import { MyWidgetConfig, MyWidgetData, MY_WIDGET_DEFAULTS } from './my-widget.types';

@Component({
  selector: 'app-my-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-widget">
      <h3>{{ mergedConfig().title }}</h3>
      @if (loading()) {
        <p>Loading...</p>
      }
      @if (data()) {
        <ul>
          @for (item of data()!.items; track item.id) {
            <li>{{ item.id }}: {{ item.value }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class MyWidgetComponent extends BaseWidgetComponent<MyWidgetConfig, MyWidgetData> {
  mergedConfig = computed(() => ({
    ...MY_WIDGET_DEFAULTS,
    ...this.config(),
  }));

  getDefaultConfig(): MyWidgetConfig {
    return MY_WIDGET_DEFAULTS;
  }
}
```

### 3. Create Definition

```typescript
// my-widget.definition.ts
import { WidgetDefinition } from '@aegisx/ui/widgets';
import { MyWidgetComponent } from './my-widget.component';
import { MY_WIDGET_DEFAULTS } from './my-widget.types';

export const MY_WIDGET_DEFINITION: WidgetDefinition = {
  id: 'app-my-widget',
  name: 'My Custom Widget',
  description: 'A custom widget for my app',
  icon: 'star',
  category: 'custom',
  component: MyWidgetComponent,
  sizes: {
    minSize: { cols: 1, rows: 1 },
    maxSize: { cols: 2, rows: 2 },
    defaultSize: { cols: 1, rows: 1 },
  },
  defaultConfig: MY_WIDGET_DEFAULTS,
  tags: ['custom'],
};
```

### 4. Register Widget

```typescript
// app.config.ts
provideWidgetFramework({
  dataProvider: MyDataProvider,
  widgets: [MY_WIDGET_DEFINITION],
});
```

---

## Best Practices

### 1. API Design

- ใช้ endpoint ที่สื่อความหมาย: `/dashboard/revenue`, `/dashboard/orders`
- Return data ในรูปแบบที่ widget ต้องการ
- Support pagination สำหรับ table widgets

### 2. Performance

- ใช้ `refreshInterval` แทน polling ถ้าไม่มี WebSocket
- ตั้ง `refreshInterval: 0` ถ้าใช้ WebSocket
- Cache data ที่ไม่เปลี่ยนบ่อย

### 3. Error Handling

- Widgets แสดง error state อัตโนมัติ
- Implement retry logic ใน data provider
- Log errors สำหรับ debugging

### 4. Security

- Validate dashboard config ก่อน save
- Check permissions ก่อนแสดง widgets
- Sanitize data ก่อนแสดงผล
