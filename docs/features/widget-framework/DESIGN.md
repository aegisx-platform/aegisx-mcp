# AegisX Widget Framework - Design Document

> **Version**: 1.0.0
> **Status**: Draft
> **Last Updated**: 2024-01-29

## 1. Overview

### 1.1 Purpose

สร้าง Widget Framework สำหรับ aegisx-ui library ที่:

- Admin สร้าง/จัด dashboard ได้ (drag-drop)
- User ดู dashboard (read-only)
- รองรับ HIS, ERP, Finance dashboards
- Reusable ข้าม projects

### 1.2 Key Decisions

| Decision        | Choice                     | Rationale                        |
| --------------- | -------------------------- | -------------------------------- |
| User Editing    | Admin-Only                 | ลดความซับซ้อน, ควบคุม layout ได้ |
| Data Source     | REST + WebSocket           | Initial load + real-time updates |
| Widget Priority | Generic First              | สร้าง base แล้วค่อย specialize   |
| Charts          | SVG + Optional Lib         | เบา + powerful option            |
| Storage         | LocalStorage + API Example | Quick start + production guide   |

---

## 2. Architecture

### 2.1 Layer Diagram

```
┌─────────────────────────────────────────────────┐
│              APPLICATION (Consumer)              │
│  • Custom Widgets    • Data Providers           │
│  • Business Logic    • API Integration          │
└─────────────────────────────────────────────────┘
                       │
                       ▼ provideWidgetFramework()
┌─────────────────────────────────────────────────┐
│              AEGISX-UI (Library)                 │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Dashboard Components                       │ │
│  │ • Builder (Admin)  • Viewer (User)        │ │
│  │ • Widget Host      • Properties Panel     │ │
│  └───────────────────────────────────────────┘ │
│                       │                         │
│  ┌───────────────────────────────────────────┐ │
│  │ Built-in Widgets                          │ │
│  │ • KPI  • Chart  • Table  • List           │ │
│  │ • Progress  • Calendar  • Action          │ │
│  └───────────────────────────────────────────┘ │
│                       │                         │
│  ┌───────────────────────────────────────────┐ │
│  │ Core Framework                            │ │
│  │ • Interfaces  • Tokens  • Base Classes   │ │
│  │ • Default Providers (optional)            │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 2.2 Provider Pattern

Library กำหนด interfaces, App implement:

```typescript
// Library defines
interface WidgetDataProvider {
  fetch<T>(endpoint: string, params?: object): Observable<T>;
  subscribe?<T>(channel: string): Observable<T>;
}

// App implements
class MyApiDataProvider implements WidgetDataProvider {
  fetch(endpoint, params) {
    return this.http.get(`/api${endpoint}`, { params });
  }
}
```

---

## 3. File Structure

```
libs/aegisx-ui/src/lib/widgets/
├── core/                      # Core framework
│   ├── widget.types.ts        # Type definitions
│   ├── widget.tokens.ts       # Injection tokens
│   ├── base-widget.ts         # Base component class
│   ├── widget-registry.ts     # Widget registration
│   └── index.ts
│
├── providers/                 # Provider interfaces + defaults
│   ├── data.provider.ts       # Data fetching interface
│   ├── storage.provider.ts    # Config storage interface
│   ├── realtime.provider.ts   # WebSocket interface
│   ├── defaults/              # Optional default implementations
│   │   ├── local-storage.provider.ts
│   │   └── mock-data.provider.ts
│   └── index.ts
│
├── widgets/                   # Built-in widgets
│   ├── kpi/
│   ├── chart/
│   ├── table/
│   ├── list/
│   ├── progress/
│   └── index.ts
│
├── dashboard/                 # Dashboard components
│   ├── builder/               # Admin editor
│   ├── viewer/                # User view
│   ├── widget-host/           # Widget container
│   └── index.ts
│
├── provide-widgets.ts         # Setup function
└── index.ts                   # Public API
```

---

## 4. Core Types

### 4.1 Widget Definition

```typescript
interface WidgetDefinition {
  id: string; // 'ax-kpi-widget'
  name: string; // 'KPI Card'
  description: string;
  icon: string; // Material icon
  category: WidgetCategory; // 'display' | 'chart' | 'data' | 'action'

  // Component
  component: Type<BaseWidget>;

  // Size constraints
  minSize: { cols: number; rows: number };
  maxSize?: { cols: number; rows: number };
  defaultSize: { cols: number; rows: number };

  // Configuration schema (JSON Schema)
  configSchema: object;
}

type WidgetCategory = 'display' | 'chart' | 'data' | 'action' | 'custom';
```

### 4.2 Dashboard Configuration

```typescript
interface DashboardConfig {
  id: string;
  name: string;
  description?: string;

  // Grid settings
  columns: number; // Default: 4
  rowHeight: number; // Default: 160
  gap: number; // Default: 16

  // Widget instances
  widgets: WidgetInstance[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface WidgetInstance {
  instanceId: string; // Unique per dashboard
  widgetId: string; // Reference to WidgetDefinition.id

  // Position in grid
  position: {
    x: number;
    y: number;
    cols: number;
    rows: number;
  };

  // Widget-specific config
  config: Record<string, unknown>;

  // Data source (optional)
  dataSource?: {
    endpoint?: string;
    wsChannel?: string;
    refreshInterval?: number; // ms, 0 = no auto-refresh
  };
}
```

### 4.3 Base Widget Component

```typescript
@Directive()
abstract class BaseWidget<TConfig = unknown, TData = unknown> {
  // Inputs from host
  instanceId = input.required<string>();
  config = input.required<TConfig>();
  data = input<TData>();
  isEditing = input(false);

  // Outputs
  configChange = output<Partial<TConfig>>();

  // State
  loading = signal(false);
  error = signal<string | null>(null);

  // Abstract - must implement
  abstract getDefaultConfig(): TConfig;
}
```

---

## 5. Provider Interfaces

### 5.1 Data Provider

```typescript
interface WidgetDataProvider {
  /**
   * Fetch data from API
   */
  fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T>;

  /**
   * Subscribe to real-time updates (optional)
   */
  subscribe?<T>(channel: string): Observable<T>;
}
```

### 5.2 Storage Provider

```typescript
interface WidgetStorageProvider {
  /**
   * Save dashboard configuration
   */
  save(dashboard: DashboardConfig): Observable<void>;

  /**
   * Load dashboard by ID
   */
  load(id: string): Observable<DashboardConfig | null>;

  /**
   * List all dashboards
   */
  list(): Observable<DashboardSummary[]>;

  /**
   * Delete dashboard
   */
  delete(id: string): Observable<void>;
}

interface DashboardSummary {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
}
```

### 5.3 Realtime Provider

```typescript
interface WidgetRealtimeProvider {
  /**
   * Connect to realtime service
   */
  connect(): void;

  /**
   * Disconnect from realtime service
   */
  disconnect(): void;

  /**
   * Subscribe to channel
   */
  subscribe<T>(channel: string): Observable<T>;

  /**
   * Connection status
   */
  connected$: Observable<boolean>;
}
```

---

## 6. Built-in Widgets

### Phase 1: Core Widgets

| Widget             | Description           | Config Options                           |
| ------------------ | --------------------- | ---------------------------------------- |
| **KpiWidget**      | Single metric display | title, value, trend, icon, color, format |
| **ChartWidget**    | Line/Bar/Pie (SVG)    | type, data, colors, legend, axis         |
| **TableWidget**    | Data table            | columns, pageSize, sortable              |
| **ListWidget**     | Simple list           | items, icon, maxItems                    |
| **ProgressWidget** | Circular/Linear       | type, value, max, color                  |

### Phase 2: Extended Widgets

| Widget             | Description               |
| ------------------ | ------------------------- |
| **CalendarWidget** | Mini calendar with events |
| **ActionWidget**   | Quick action buttons      |
| **TimelineWidget** | Event timeline            |

### Phase 3: Domain Widgets (App-level)

Apps create their own domain-specific widgets:

- HIS: PatientStats, BedOccupancy, QueueStatus
- ERP: Revenue, Inventory, OrderPipeline
- Finance: Balance, Transactions, Portfolio

---

## 7. Setup API

### 7.1 Provider Function

```typescript
// libs/aegisx-ui/src/lib/widgets/provide-widgets.ts

export interface WidgetFrameworkConfig {
  dataProvider: Type<WidgetDataProvider>;
  storageProvider?: Type<WidgetStorageProvider>;
  realtimeProvider?: Type<WidgetRealtimeProvider>;
  widgets?: WidgetDefinition[];
}

export function provideWidgetFramework(config: WidgetFrameworkConfig) {
  return [
    { provide: WIDGET_DATA_PROVIDER, useClass: config.dataProvider },
    {
      provide: WIDGET_STORAGE_PROVIDER,
      useClass: config.storageProvider ?? LocalStorageProvider,
    },
    {
      provide: WIDGET_REALTIME_PROVIDER,
      useClass: config.realtimeProvider ?? NoopRealtimeProvider,
    },
    {
      provide: WIDGET_REGISTRY,
      useFactory: () => {
        const registry = new WidgetRegistry();
        BUILTIN_WIDGETS.forEach((w) => registry.register(w));
        config.widgets?.forEach((w) => registry.register(w));
        return registry;
      },
    },
  ];
}
```

### 7.2 Usage Example

```typescript
// apps/my-app/src/app/app.config.ts
import { provideWidgetFramework } from '@AegisX/aegisx-ui/widgets';
import { MyDataProvider } from './providers/data.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWidgetFramework({
      dataProvider: MyDataProvider,
      widgets: [MyCustomWidget],
    }),
  ],
};
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Core types (`widget.types.ts`)
- [ ] Injection tokens (`widget.tokens.ts`)
- [ ] Provider interfaces
- [ ] Base widget class
- [ ] Widget registry

### Phase 2: Default Providers (Week 1)

- [ ] LocalStorage provider
- [ ] Mock data provider
- [ ] Noop realtime provider
- [ ] `provideWidgetFramework()` function

### Phase 3: Built-in Widgets (Week 2)

- [ ] KPI Widget
- [ ] Chart Widget (SVG)
- [ ] Table Widget
- [ ] List Widget
- [ ] Progress Widget

### Phase 4: Dashboard Components (Week 2-3)

- [ ] Widget Host (container)
- [ ] Dashboard Viewer (user)
- [ ] Dashboard Builder (admin)
- [ ] Widget Palette
- [ ] Properties Panel

### Phase 5: Documentation & Examples (Week 3)

- [ ] API documentation
- [ ] Usage examples
- [ ] API provider example
- [ ] Custom widget guide

---

## 9. Open Questions

1. **Chart Library**: ใช้ ngx-charts หรือ chart.js สำหรับ advanced charts?
2. **Grid Library**: ใช้ angular-gridster2 (มีอยู่แล้ว) หรือ alternative?
3. **Schema Validation**: ใช้ JSON Schema หรือ Zod สำหรับ config validation?

---

## 10. References

- Existing: `libs/aegisx-ui/src/lib/components/launcher/` - Gridster integration
- Existing: `libs/aegisx-ui/src/lib/components/data-display/` - KPI, Stats components
- Angular Gridster2: https://github.com/tiberiuzuld/angular-gridster2
