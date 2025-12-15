# Application Architecture

> Architectural overview of AegisX Admin application

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AegisX Admin App                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Routing Layer                        ││
│  │  app.routes.ts → Route definitions with lazy loading    ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Layout Layer                         ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       ││
│  │  │ Compact │ │Classic  │ │Enterprise│ │ Empty   │       ││
│  │  │ Layout  │ │ Layout  │ │  Layout  │ │ Layout  │       ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Page Layer                           ││
│  │  /docs/* │ /playground/* │ /tools/* │ /examples/*      ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Component Layer                        ││
│  │  ┌─────────────────┐  ┌─────────────────┐              ││
│  │  │  AegisX UI      │  │  Angular Material│              ││
│  │  │  @aegisx/ui     │  │  @angular/material│             ││
│  │  └─────────────────┘  └─────────────────┘              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Service Layer                         ││
│  │  HTTP Services │ State Management │ Utilities          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
apps/admin/src/
├── app/
│   ├── components/              # Shared components
│   │   ├── docs/               # Documentation helpers
│   │   │   ├── doc-header/
│   │   │   ├── live-preview/
│   │   │   ├── code-tabs/
│   │   │   ├── component-tokens/
│   │   │   └── index.ts
│   │   ├── code-block/
│   │   ├── code-preview/
│   │   ├── props-table/
│   │   └── example-box/
│   │
│   ├── config/                  # App configuration
│   │   ├── navigation.config.ts # Navigation structure
│   │   └── layout.config.ts     # Layout settings
│   │
│   ├── pages/                   # Page components
│   │   ├── docs/               # Documentation pages
│   │   │   ├── getting-started/
│   │   │   ├── foundations/
│   │   │   ├── components/
│   │   │   │   └── aegisx/
│   │   │   │       ├── data-display/
│   │   │   │       ├── forms/
│   │   │   │       ├── feedback/
│   │   │   │       ├── navigation/
│   │   │   │       ├── layout/
│   │   │   │       └── auth/
│   │   │   ├── integrations/
│   │   │   ├── material/
│   │   │   ├── patterns/
│   │   │   └── architecture/
│   │   ├── playground/         # Demo & experiments
│   │   │   ├── pages/
│   │   │   └── experiments/
│   │   ├── tools/              # Admin tools
│   │   └── examples/           # Page examples
│   │
│   ├── routes/                  # Route definitions
│   │   ├── docs/
│   │   │   ├── components-aegisx.routes.ts
│   │   │   ├── foundations.routes.ts
│   │   │   ├── getting-started.routes.ts
│   │   │   ├── integrations.routes.ts
│   │   │   ├── material.routes.ts
│   │   │   └── patterns-architecture.routes.ts
│   │   ├── examples/
│   │   ├── playground/
│   │   ├── standalone/
│   │   ├── tools/
│   │   └── redirects/
│   │
│   ├── types/                   # TypeScript types
│   │   └── docs.types.ts
│   │
│   ├── app.ts                   # Root component
│   ├── app.config.ts            # App configuration
│   ├── app.routes.ts            # Main routes
│   └── app.html                 # Root template
│
├── styles.scss                  # Global styles
├── main.ts                      # Entry point
└── index.html                   # HTML template
```

---

## Route Architecture

### Route Hierarchy

```
/                                       # Root redirect
│
├── /docs/                              # Documentation
│   ├── /getting-started/
│   │   ├── /introduction
│   │   ├── /installation
│   │   └── /quick-start
│   │
│   ├── /foundations/
│   │   ├── /overview
│   │   ├── /design-tokens
│   │   ├── /colors
│   │   ├── /typography
│   │   ├── /spacing
│   │   ├── /shadows
│   │   ├── /motion
│   │   ├── /accessibility
│   │   └── /theming
│   │
│   ├── /components/aegisx/
│   │   ├── /overview
│   │   ├── /data-display/
│   │   │   ├── /card
│   │   │   ├── /badge
│   │   │   ├── /avatar
│   │   │   ├── /kpi-card
│   │   │   ├── /stats-card
│   │   │   ├── /list
│   │   │   ├── /timeline
│   │   │   └── ...
│   │   ├── /forms/
│   │   │   ├── /date-picker
│   │   │   ├── /input-otp
│   │   │   ├── /scheduler
│   │   │   └── ...
│   │   ├── /feedback/
│   │   ├── /navigation/
│   │   ├── /layout/
│   │   └── /auth/
│   │
│   ├── /integrations/
│   │   ├── /overview
│   │   ├── /gridster
│   │   ├── /chartjs
│   │   └── ...
│   │
│   ├── /material/
│   │   ├── /overview
│   │   ├── /button
│   │   ├── /table
│   │   └── ...
│   │
│   ├── /patterns/
│   │   ├── /form-sizes
│   │   └── /form-layouts
│   │
│   └── /architecture/
│       ├── /multi-app
│       └── /shell-pattern
│
├── /playground/                        # Demo area
│   ├── /pages/
│   └── /experiments/
│
├── /tools/                             # Admin tools
│   └── /theme-builder
│
├── /examples/                          # Page examples
│   ├── /error/
│   ├── /account/
│   ├── /dashboard/
│   └── /auth/
│
└── /[standalone demos]/                # Demo apps
    ├── /app-launcher-demo
    ├── /gridster-demo
    ├── /enterprise-demo
    ├── /inventory-demo
    └── /his-demo
```

### Route Definition Pattern

```typescript
// routes/docs/components-aegisx.routes.ts
import { Route } from '@angular/router';

export const components_AEGISX_ROUTES: Route[] = [
  {
    path: 'overview',
    loadComponent: () => import('../../pages/docs/components/aegisx/overview/overview.component').then((m) => m.ComponentsOverviewComponent),
    data: { title: 'Overview' },
  },
  {
    path: 'data-display/badge',
    loadComponent: () => import('../../pages/docs/components/aegisx/data-display/badge/badge-doc.component').then((m) => m.BadgeDocComponent),
    data: { title: 'Badge' },
  },
  // ... more routes
];
```

---

## Component Architecture

### Documentation Component Pattern

```
ComponentDocComponent
├── Template
│   ├── DocHeader (title, description)
│   ├── LivePreview (interactive example)
│   ├── CodeTabs (HTML/TS examples)
│   ├── PropsTable (API documentation)
│   └── UsageGuidelines (best practices)
│
├── Properties
│   ├── properties[] (for PropsTable)
│   ├── events[] (for PropsTable)
│   └── codeExamples{} (for CodeTabs)
│
└── Methods
    └── Component-specific methods
```

### Example Documentation Component

```typescript
@Component({
  selector: 'app-badge-doc',
  standalone: true,
  imports: [CommonModule, DocHeaderComponent, LivePreviewComponent, CodeTabsComponent, PropsTableComponent, AxBadgeComponent],
  template: `
    <app-doc-header title="Badge" description="Display status indicators, counts, or labels"> </app-doc-header>

    <app-live-preview>
      <ax-badge color="success">Active</ax-badge>
      <ax-badge color="warning">Pending</ax-badge>
      <ax-badge color="danger">Error</ax-badge>
    </app-live-preview>

    <app-code-tabs [tabs]="codeTabs"></app-code-tabs>

    <app-props-table [properties]="properties" [events]="events"> </app-props-table>
  `,
})
export class BadgeDocComponent {
  properties = [
    { name: 'color', type: 'string', default: "'primary'", description: 'Badge color' },
    { name: 'variant', type: 'string', default: "'filled'", description: 'Badge variant' },
  ];

  events = [{ name: 'click', type: 'EventEmitter<void>', description: 'Emitted on click' }];

  codeTabs = [
    { label: 'HTML', language: 'html', code: '<ax-badge color="success">Active</ax-badge>' },
    { label: 'TypeScript', language: 'typescript', code: 'import { AxBadgeComponent } from "@aegisx/ui";' },
  ];
}
```

---

## Navigation Architecture

### Navigation Configuration

```typescript
// config/navigation.config.ts

export interface AxNavigationItem {
  id: string;
  title: string;
  type?: 'item' | 'collapsible' | 'group';
  icon?: string;
  link?: string;
  badge?: { content: string; type: string };
  children?: AxNavigationItem[];
  defaultOpen?: boolean;
}

// Compact navigation (with icons)
export const COMPACT_NAVIGATION: AxNavigationItem[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    type: 'collapsible',
    icon: 'rocket_launch',
    children: [...],
  },
  // ...
];

// Docs navigation (text-only, shadcn/ui style)
export const DOCS_NAVIGATION: AxNavigationItem[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    defaultOpen: true,
    children: [...],
  },
  // ...
];
```

### Navigation Structure

```
COMPACT_NAVIGATION                    DOCS_NAVIGATION
├── Getting Started (collapsible)     ├── Getting Started
│   ├── Introduction                  │   ├── Introduction
│   ├── Installation                  │   ├── Installation
│   └── Quick Start                   │   └── Quick Start
├── Foundations (collapsible)         ├── Foundations
├── Components (collapsible)          ├── Components
│   ├── Overview                      │   ├── Overview
│   ├── Data Display (collapsible)    │   ├── Data Display
│   ├── Forms (collapsible)           │   ├── Forms
│   └── ...                           │   └── ...
└── ...                               └── ...
```

---

## Layout System

### Available Layouts

| Layout                 | Use Case           | Features                       |
| ---------------------- | ------------------ | ------------------------------ |
| `ax-compact-layout`    | Main documentation | Collapsible sidebar, icons     |
| `ax-classic-layout`    | Traditional apps   | Fixed sidebar                  |
| `ax-enterprise-layout` | Complex apps       | Multi-level nav, notifications |
| `ax-empty-layout`      | Auth pages         | Minimal, centered content      |

### Layout Selection

```typescript
// app.routes.ts
export const appRoutes: Route[] = [
  {
    path: 'docs',
    component: DocsLayoutComponent,  // Uses ax-compact-layout
    children: [...],
  },
  {
    path: 'examples/auth',
    component: EmptyLayoutComponent,  // Uses ax-empty-layout
    children: [...],
  },
];
```

---

## State Management

### Signal-based State

```typescript
// Using signals for component state
@Component({...})
export class MyComponent {
  // Local state
  loading = signal(false);
  data = signal<Data[]>([]);

  // Computed state
  isEmpty = computed(() => this.data().length === 0);
  totalCount = computed(() => this.data().length);

  // Actions
  async loadData() {
    this.loading.set(true);
    try {
      const result = await this.service.getData();
      this.data.set(result);
    } finally {
      this.loading.set(false);
    }
  }
}
```

### App-level Store

```typescript
// stores/app.store.ts
@Injectable({ providedIn: 'root' })
export class AppStore {
  private state = signal<AppState>({
    theme: 'light',
    sidebarCollapsed: false,
  });

  // Selectors
  theme = computed(() => this.state().theme);
  sidebarCollapsed = computed(() => this.state().sidebarCollapsed);

  // Actions
  toggleTheme() {
    this.state.update((s) => ({
      ...s,
      theme: s.theme === 'light' ? 'dark' : 'light',
    }));
  }
}
```

---

## Styling Architecture

### Style Layers

```
┌─────────────────────────────────────┐
│           Global Styles             │
│         styles.scss                 │
├─────────────────────────────────────┤
│         TailwindCSS                 │
│     Utility-first classes           │
├─────────────────────────────────────┤
│       Angular Material              │
│     Component theming               │
├─────────────────────────────────────┤
│         AegisX UI                   │
│     CSS Variables (--ax-*)          │
├─────────────────────────────────────┤
│      Component Styles               │
│     Scoped SCSS/CSS                 │
└─────────────────────────────────────┘
```

### CSS Variable Convention

```scss
// AegisX UI uses --ax- prefix
:root {
  // Colors
  --ax-primary: #3b82f6;
  --ax-success: #22c55e;
  --ax-warning: #f59e0b;
  --ax-danger: #ef4444;

  // Surfaces
  --ax-surface-background: #ffffff;
  --ax-surface-card: #ffffff;

  // Text
  --ax-text-primary: #1f2937;
  --ax-text-secondary: #6b7280;

  // Spacing
  --ax-spacing-sm: 0.5rem;
  --ax-spacing-md: 1rem;
  --ax-spacing-lg: 1.5rem;
}
```

---

## Build & Deployment

### Build Configuration

```json
// project.json
{
  "targets": {
    "build": {
      "executor": "@angular-devkit/build-angular:browser",
      "configurations": {
        "production": {
          "budgets": [{ "type": "initial", "maximumWarning": "2mb", "maximumError": "2.5mb" }],
          "outputHashing": "all"
        },
        "gh-pages": {
          "baseHref": "/aegisx-ui/"
        }
      }
    }
  }
}
```

### Deployment Targets

| Target       | Command                   | Output             |
| ------------ | ------------------------- | ------------------ |
| Production   | `nx build admin`          | `dist/apps/admin/` |
| GitHub Pages | `nx build admin:gh-pages` | With base href     |
| Static Serve | `nx serve-static admin`   | Port 4201          |

---

## Related Documentation

- [README.md](./README.md) - Overview & Quick Start
- [components.md](./components.md) - UI Components Reference
- [development.md](./development.md) - Development Guide
- [PATTERNS.md](./PATTERNS.md) - Development Patterns
