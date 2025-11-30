# AegisX Widget Framework

> **Enterprise-grade customizable dashboard widget system for Angular applications**

## Overview

Widget Framework ช่วยให้คุณสร้าง dashboard แบบ drag-and-drop สำหรับ enterprise applications เช่น HIS, ERP, Finance dashboards โดยไม่ต้อง code ใหม่ทุกครั้ง

### Features

- **5 Built-in Widgets**: KPI, Chart, Table, List, Progress
- **Drag & Drop Builder**: Admin สร้าง layout ได้ง่าย
- **SVG-based Charts**: เบา ไม่ต้องพึ่ง external library
- **Real-time Support**: REST + WebSocket
- **Customizable**: สร้าง custom widgets ได้
- **Type-safe**: Full TypeScript support

## Quick Start

### 1. Setup Provider

```typescript
// app.config.ts
import { provideWidgetFramework } from '@aegisx/ui/widgets';
import { MyDataProvider } from './providers/my-data.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWidgetFramework({
      dataProvider: MyDataProvider,
      // storageProvider: optional (defaults to localStorage)
      // realtimeProvider: optional (defaults to noop)
    }),
  ],
};
```

### 2. Create Data Provider

```typescript
// my-data.provider.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetDataProvider } from '@aegisx/ui/widgets';

@Injectable({ providedIn: 'root' })
export class MyDataProvider implements WidgetDataProvider {
  private http = inject(HttpClient);

  fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    return this.http.get<T>(`/api${endpoint}`, { params: params as any });
  }
}
```

### 3. Use Dashboard Viewer (User)

```typescript
import { Component } from '@angular/core';
import { DashboardViewerComponent } from '@aegisx/ui/widgets';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [DashboardViewerComponent],
  template: ` <ax-dashboard-viewer [dashboardId]="'main-dashboard'" /> `,
})
export class UserDashboardPage {}
```

### 4. Use Dashboard Builder (Admin)

```typescript
import { Component } from '@angular/core';
import { DashboardBuilderComponent } from '@aegisx/ui/widgets';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DashboardBuilderComponent],
  template: ` <ax-dashboard-builder [dashboardId]="'main-dashboard'" (saved)="onSaved($event)" /> `,
})
export class AdminDashboardPage {
  onSaved(config: DashboardConfig) {
    console.log('Dashboard saved:', config);
  }
}
```

## Documentation

- [Usage Guide](./USAGE_GUIDE.md) - Complete usage documentation
- [Design Document](./DESIGN.md) - Architecture and design decisions
- [Custom Widgets](./CUSTOM_WIDGETS.md) - How to create custom widgets

## Built-in Widgets

| Widget              | Description                | Best For               |
| ------------------- | -------------------------- | ---------------------- |
| **KPI Widget**      | Single metric with trend   | Revenue, Users, Orders |
| **Chart Widget**    | Line, Bar, Donut charts    | Trends, Comparisons    |
| **Table Widget**    | Data table with pagination | Transactions, Records  |
| **List Widget**     | Item list with status      | Activities, Tasks      |
| **Progress Widget** | Circular, Linear, Gauge    | Goals, Quotas          |

## File Structure

```
libs/aegisx-ui/src/lib/widgets/
├── core/                    # Core framework
├── providers/               # Provider interfaces
├── widgets/                 # Built-in widgets
├── dashboard/               # Dashboard components
└── provide-widgets.ts       # Setup function
```
