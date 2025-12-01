import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DocHeaderComponent } from '../../../../components/docs/doc-header/doc-header.component';
import { CodeTabsComponent } from '../../../../components/docs/code-tabs/code-tabs.component';
import { PropsTableComponent } from '../../../../components/props-table/props-table.component';
import { CodeTab } from '../../../../types/docs.types';

@Component({
  selector: 'ax-multi-app-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    DocHeaderComponent,
    CodeTabsComponent,
    PropsTableComponent,
  ],
  template: `
    <article class="docs-article">
      <!-- Header -->
      <ax-doc-header
        title="Multi-App Architecture"
        description="A flexible configuration-driven architecture for building enterprise applications with multiple sub-apps, dynamic navigation, and app-specific theming."
        category="Architecture"
      />

      <!-- Overview -->
      <section class="doc-section">
        <h2 class="section-title">Overview</h2>
        <p class="prose">
          Multi-App Architecture เป็นรูปแบบการออกแบบที่ช่วยให้สามารถสร้าง
          enterprise applications ขนาดใหญ่ที่มีหลาย modules/sub-apps
          ในโปรเจกต์เดียว โดยแต่ละ sub-app มี navigation, theme และ
          configuration เป็นของตัวเอง
        </p>

        <div class="feature-grid">
          <div class="feature-item">
            <mat-icon class="feature-icon">settings</mat-icon>
            <h4>Configuration-Driven</h4>
            <p>กำหนดโครงสร้าง app ผ่าน config file ง่ายต่อการจัดการ</p>
          </div>
          <div class="feature-item">
            <mat-icon class="feature-icon">apps</mat-icon>
            <h4>Multiple Sub-Apps</h4>
            <p>รองรับหลาย sub-apps เช่น Dashboard, Warehouse, Receiving</p>
          </div>
          <div class="feature-item">
            <mat-icon class="feature-icon">palette</mat-icon>
            <h4>App-Specific Themes</h4>
            <p>แต่ละ app มี theme ของตัวเองจาก Enterprise Layout presets</p>
          </div>
          <div class="feature-item">
            <mat-icon class="feature-icon">menu</mat-icon>
            <h4>Dynamic Navigation</h4>
            <p>Navigation เปลี่ยนตาม sub-app ที่ active อยู่</p>
          </div>
        </div>
      </section>

      <!-- Architecture Diagram -->
      <section class="doc-section">
        <h2 class="section-title">Architecture Diagram</h2>
        <div class="architecture-diagram">
          <div class="diagram-row">
            <div class="diagram-box main-app">
              <span class="box-label">Main Application</span>
              <span class="box-detail">apps/web/</span>
            </div>
          </div>
          <div class="diagram-arrow">
            <mat-icon>arrow_downward</mat-icon>
          </div>
          <div class="diagram-row">
            <div class="diagram-box feature">
              <span class="box-label">Feature Module</span>
              <span class="box-detail">features/inventory/</span>
            </div>
          </div>
          <div class="diagram-arrow">
            <mat-icon>arrow_downward</mat-icon>
          </div>
          <div class="diagram-row multi">
            <div class="diagram-box shell">
              <span class="box-label">Shell Component</span>
              <span class="box-detail">inventory-shell.component.ts</span>
            </div>
            <div class="diagram-box config">
              <span class="box-label">App Config</span>
              <span class="box-detail">inventory.config.ts</span>
            </div>
          </div>
          <div class="diagram-arrow">
            <mat-icon>arrow_downward</mat-icon>
          </div>
          <div class="diagram-row multi">
            <div class="diagram-box sub-app">
              <span class="box-label">Dashboard</span>
              <span class="box-detail">Sub-App</span>
            </div>
            <div class="diagram-box sub-app">
              <span class="box-label">Warehouse</span>
              <span class="box-detail">Sub-App</span>
            </div>
            <div class="diagram-box sub-app">
              <span class="box-label">Receiving</span>
              <span class="box-detail">Sub-App</span>
            </div>
            <div class="diagram-box sub-app">
              <span class="box-label">Shipping</span>
              <span class="box-detail">Sub-App</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Concepts -->
      <section class="doc-section">
        <h2 class="section-title">Core Concepts</h2>

        <h3 class="subsection-title">1. AppConfig Interface</h3>
        <p class="prose">
          กำหนดโครงสร้างหลักของแต่ละ Feature App รวมถึง sub-apps และ global
          settings
        </p>
        <ax-code-tabs [tabs]="appConfigCode" />

        <h3 class="subsection-title">2. SubAppConfig Interface</h3>
        <p class="prose">กำหนดโครงสร้างของแต่ละ sub-app ภายใน Feature App</p>
        <ax-code-tabs [tabs]="subAppConfigCode" />

        <h3 class="subsection-title">3. HeaderAction Interface</h3>
        <p class="prose">กำหนด action buttons ที่ header ของ app</p>
        <ax-code-tabs [tabs]="headerActionCode" />
      </section>

      <!-- Implementation Guide -->
      <section class="doc-section">
        <h2 class="section-title">Implementation Guide</h2>

        <h3 class="subsection-title">Step 1: Create Feature Directory</h3>
        <ax-code-tabs [tabs]="directoryStructureCode" />

        <h3 class="subsection-title">Step 2: Create App Configuration</h3>
        <ax-code-tabs [tabs]="configImplementationCode" />

        <h3 class="subsection-title">Step 3: Create Shell Component</h3>
        <ax-code-tabs [tabs]="shellComponentCode" />

        <h3 class="subsection-title">Step 4: Create Sub-App Routes</h3>
        <ax-code-tabs [tabs]="routesCode" />

        <h3 class="subsection-title">Step 5: Register in Main App Routes</h3>
        <ax-code-tabs [tabs]="mainRoutesCode" />
      </section>

      <!-- API Reference -->
      <section class="doc-section">
        <h2 class="section-title">API Reference</h2>

        <h3 class="subsection-title">AppConfig Properties</h3>
        <ax-props-table [properties]="appConfigProps" />

        <h3 class="subsection-title">SubAppConfig Properties</h3>
        <ax-props-table [properties]="subAppConfigProps" />

        <h3 class="subsection-title">HeaderAction Properties</h3>
        <ax-props-table [properties]="headerActionProps" />
      </section>

      <!-- Use Cases -->
      <section class="doc-section">
        <h2 class="section-title">Use Cases</h2>
        <div class="use-case-grid">
          <div class="use-case-item">
            <mat-icon class="use-case-icon">inventory_2</mat-icon>
            <h4>Inventory Management</h4>
            <p>Dashboard, Warehouse, Receiving, Shipping sub-apps</p>
            <span class="theme-badge inventory">inventory theme</span>
          </div>
          <div class="use-case-item">
            <mat-icon class="use-case-icon">local_hospital</mat-icon>
            <h4>Hospital Information System (HIS)</h4>
            <p>Patients, Appointments, Pharmacy, Lab sub-apps</p>
            <span class="theme-badge medical">medical theme</span>
          </div>
          <div class="use-case-item">
            <mat-icon class="use-case-icon">account_balance</mat-icon>
            <h4>ERP / Finance</h4>
            <p>Accounting, Invoicing, Reports, Settings sub-apps</p>
            <span class="theme-badge finance">finance theme</span>
          </div>
          <div class="use-case-item">
            <mat-icon class="use-case-icon">people</mat-icon>
            <h4>HR Management</h4>
            <p>Employees, Payroll, Leave, Performance sub-apps</p>
            <span class="theme-badge hr">hr theme</span>
          </div>
        </div>
      </section>

      <!-- Best Practices -->
      <section class="doc-section">
        <h2 class="section-title">Best Practices</h2>
        <div class="usage-comparison">
          <div class="usage-column do">
            <h4><mat-icon>check_circle</mat-icon> Do:</h4>
            <ul>
              <li>Use configuration files for app structure</li>
              <li>Keep sub-apps modular and lazy-loaded</li>
              <li>Use Enterprise Layout presets for theming</li>
              <li>Define permissions per sub-app</li>
              <li>Use computed signals for dynamic navigation</li>
              <li>Keep shell component simple - only layout logic</li>
            </ul>
          </div>
          <div class="usage-column dont">
            <h4><mat-icon>cancel</mat-icon> Don't:</h4>
            <ul>
              <li>Don't hardcode navigation in shell component</li>
              <li>Don't create separate Nx apps for each sub-app</li>
              <li>Don't mix business logic in shell component</li>
              <li>Don't skip lazy loading for sub-app modules</li>
              <li>Don't use different layout components per sub-app</li>
              <li>Don't ignore TypeScript types in configs</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Related -->
      <section class="doc-section">
        <h2 class="section-title">Related Documentation</h2>
        <div class="related-links">
          <a
            mat-stroked-button
            routerLink="/docs/components/aegisx/layout/enterprise"
          >
            <mat-icon>web</mat-icon>
            Enterprise Layout
          </a>
          <a mat-stroked-button routerLink="/docs/architecture/shell-pattern">
            <mat-icon>layers</mat-icon>
            Shell Pattern & Routing
          </a>
          <a mat-stroked-button routerLink="/inventory-demo">
            <mat-icon>inventory_2</mat-icon>
            Inventory Demo
          </a>
        </div>
      </section>
    </article>
  `,
  styles: [
    `
      /* Article Layout - Prose Style */
      .docs-article {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
      }

      .doc-section {
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--ax-border-default);

        &:last-child {
          border-bottom: none;
        }
      }

      .section-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        margin: 0 0 1rem 0;
        line-height: 1.3;
      }

      .subsection-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 2rem 0 0.75rem 0;
        line-height: 1.4;
      }

      .prose {
        font-size: 1rem;
        line-height: 1.75;
        color: var(--ax-text-secondary);
        margin-bottom: 1.5rem;
      }

      /* Feature Grid */
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
      }

      .feature-item {
        padding: 1.25rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0.75rem 0 0.5rem 0;
        }

        p {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin: 0;
          line-height: 1.5;
        }
      }

      .feature-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: var(--ax-brand-default);
      }

      /* Architecture Diagram */
      .architecture-diagram {
        padding: 2rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .diagram-row {
        display: flex;
        gap: 1rem;
        justify-content: center;
        width: 100%;

        &.multi {
          flex-wrap: wrap;
        }
      }

      .diagram-box {
        padding: 1rem 1.5rem;
        border-radius: var(--ax-radius-md);
        text-align: center;
        min-width: 140px;

        .box-label {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .box-detail {
          display: block;
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.25rem;
        }
      }

      .diagram-box.main-app {
        background: var(--ax-brand-default);
        color: white;
      }

      .diagram-box.feature {
        background: var(--ax-success-default);
        color: white;
      }

      .diagram-box.shell {
        background: var(--ax-warning-default);
        color: var(--ax-text-heading);
      }

      .diagram-box.config {
        background: var(--ax-info-default);
        color: white;
      }

      .diagram-box.sub-app {
        background: var(--ax-background-surface);
        border: 2px solid var(--ax-brand-default);
        color: var(--ax-text-heading);
      }

      .diagram-arrow {
        color: var(--ax-text-subtle);
      }

      /* Use Case Grid */
      .use-case-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .use-case-item {
        padding: 1.5rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0.75rem 0 0.5rem 0;
        }

        p {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin: 0 0 0.75rem 0;
        }
      }

      .use-case-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        color: var(--ax-brand-default);
      }

      .theme-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 500;

        &.inventory {
          background: #f3e8ff;
          color: #7c3aed;
        }

        &.medical {
          background: #ecfeff;
          color: #0891b2;
        }

        &.finance {
          background: #f0fdfa;
          color: #0d9488;
        }

        &.hr {
          background: #fdf2f8;
          color: #ec4899;
        }
      }

      /* Usage Comparison */
      .usage-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .usage-column {
        padding: 1.25rem;
        border-radius: var(--ax-radius-lg);

        h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            padding: 0.5rem 0;
            font-size: 0.9375rem;
            color: var(--ax-text-primary);
            border-bottom: 1px solid var(--ax-border-default);

            &:last-child {
              border-bottom: none;
            }
          }
        }

        &.do {
          background: var(--ax-success-faint);
          border: 1px solid var(--ax-success-200);

          h4 {
            color: var(--ax-success-700);

            mat-icon {
              color: var(--ax-success-default);
            }
          }
        }

        &.dont {
          background: var(--ax-error-faint);
          border: 1px solid var(--ax-error-200);

          h4 {
            color: var(--ax-error-700);

            mat-icon {
              color: var(--ax-error-default);
            }
          }
        }
      }

      /* Related Links */
      .related-links {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;

        a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      code {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.875em;
        padding: 0.125rem 0.375rem;
        background-color: var(--ax-background-muted);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-sm);
        color: var(--ax-text-heading);
      }
    `,
  ],
})
export class MultiAppDocComponent {
  // AppConfig interface code
  appConfigCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'AppConfig Interface',
      code: `import { EnterprisePresetTheme, EnterpriseAppTheme, AxNavigationItem } from '@aegisx/ui';

export interface AppConfig {
  id: string;                                    // Unique app identifier
  name: string;                                  // Display name
  description?: string;                          // App description
  theme: EnterprisePresetTheme | EnterpriseAppTheme;  // Theme preset or custom
  baseRoute: string;                             // Base route path
  defaultRoute: string;                          // Default redirect route
  subApps: SubAppConfig[];                       // List of sub-apps
  headerActions?: HeaderAction[];                // Global header actions
  showFooter?: boolean;                          // Show footer
  footerContent?: string;                        // Footer text
  roles?: string[];                              // Required roles
  permissions?: string[];                        // Required permissions
}`,
    },
  ];

  // SubAppConfig interface code
  subAppConfigCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'SubAppConfig Interface',
      code: `export interface SubAppConfig {
  id: string;                        // Unique sub-app identifier
  name: string;                      // Display name (shown in tabs)
  icon: string;                      // Material icon name
  route: string;                     // Route path
  navigation: AxNavigationItem[];    // Sidebar navigation items
  subNavigation?: AxNavigationItem[];  // Secondary navigation
  headerActions?: HeaderAction[];    // Sub-app specific actions
  roles?: string[];                  // Required roles
  permissions?: string[];            // Required permissions
  isDefault?: boolean;               // Is default sub-app
  description?: string;              // Sub-app description
}`,
    },
  ];

  // HeaderAction interface code
  headerActionCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'HeaderAction Interface',
      code: `export interface HeaderAction {
  id: string;           // Unique action identifier
  icon: string;         // Material icon name
  tooltip: string;      // Tooltip text
  action: string;       // Method name to call
  badge?: number;       // Badge count (optional)
  badgeColor?: string;  // Badge color (optional)
}`,
    },
  ];

  // Directory structure code
  directoryStructureCode: CodeTab[] = [
    {
      language: 'bash' as const,
      label: 'Directory Structure',
      code: `apps/web/src/app/features/inventory/
├── inventory.config.ts          # App configuration
├── inventory-shell.component.ts # Shell component
├── inventory.routes.ts          # Main routes
├── index.ts                     # Barrel export
└── modules/
    ├── dashboard/
    │   ├── dashboard.routes.ts
    │   └── dashboard.page.ts
    ├── warehouse/
    │   ├── warehouse.routes.ts
    │   └── warehouse.page.ts
    ├── receiving/
    │   ├── receiving.routes.ts
    │   └── receiving.page.ts
    └── shipping/
        ├── shipping.routes.ts
        └── shipping.page.ts`,
    },
  ];

  // Config implementation code
  configImplementationCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'inventory.config.ts',
      code: `import { AxNavigationItem } from '@aegisx/ui';
import { AppConfig } from '../../shared/multi-app';

// Dashboard Navigation
const dashboardNavigation: AxNavigationItem[] = [
  { id: 'overview', title: 'Overview', icon: 'dashboard', link: '/inventory/dashboard', exactMatch: true },
  { id: 'kpis', title: 'KPI Metrics', icon: 'analytics', link: '/inventory/dashboard/kpis' },
  { id: 'alerts', title: 'Stock Alerts', icon: 'notifications_active', link: '/inventory/dashboard/alerts' },
];

// Warehouse Navigation
const warehouseNavigation: AxNavigationItem[] = [
  { id: 'stock-overview', title: 'Stock Overview', icon: 'inventory_2', link: '/inventory/warehouse', exactMatch: true },
  { id: 'locations', title: 'Locations', icon: 'location_on', link: '/inventory/warehouse/locations' },
  { id: 'transfers', title: 'Transfers', icon: 'swap_horiz', link: '/inventory/warehouse/transfers' },
];

export const INVENTORY_APP_CONFIG: AppConfig = {
  id: 'inventory',
  name: 'Inventory Management',
  description: 'Warehouse and inventory management system',
  theme: 'inventory',  // Uses inventory preset theme
  baseRoute: '/inventory',
  defaultRoute: '/inventory/dashboard',
  showFooter: true,
  footerContent: 'Inventory Management System - AegisX Platform',

  headerActions: [
    { id: 'scan', icon: 'qr_code_scanner', tooltip: 'Scan Barcode', action: 'onScanBarcode' },
    { id: 'notifications', icon: 'notifications', tooltip: 'Notifications', badge: 5, action: 'onNotifications' },
    { id: 'settings', icon: 'settings', tooltip: 'Settings', action: 'onSettings' },
  ],

  subApps: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'dashboard',
      route: '/inventory/dashboard',
      navigation: dashboardNavigation,
      isDefault: true,
      description: 'Overview and KPIs',
    },
    {
      id: 'warehouse',
      name: 'Warehouse',
      icon: 'warehouse',
      route: '/inventory/warehouse',
      navigation: warehouseNavigation,
      description: 'Stock management',
      permissions: ['inventory.warehouse.read'],
    },
    // ... more sub-apps
  ],
};`,
    },
  ];

  // Shell component code
  shellComponentCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'inventory-shell.component.ts',
      code: `import { Component, OnInit, inject, computed } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AxEnterpriseLayoutComponent, AxNavigationItem, EnterprisePresetTheme } from '@aegisx/ui';
import { INVENTORY_APP_CONFIG } from './inventory.config';
import { SubAppConfig, HeaderAction } from '../../shared/multi-app';

@Component({
  selector: 'app-inventory-shell',
  standalone: true,
  imports: [RouterOutlet, AxEnterpriseLayoutComponent, /* ... */],
  template: \`
    <ax-enterprise-layout
      [appName]="appName"
      [appTheme]="appTheme"
      [navigation]="currentNavigation()"
      [subNavigation]="subAppNavigation()"
      [showFooter]="config.showFooter ?? true"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        @for (action of appHeaderActions; track action.id) {
          <button mat-icon-button [matTooltip]="action.tooltip" (click)="handleAction(action)">
            @if (action.badge) {
              <mat-icon [matBadge]="action.badge" matBadgeColor="warn">{{ action.icon }}</mat-icon>
            } @else {
              <mat-icon>{{ action.icon }}</mat-icon>
            }
          </button>
        }
      </ng-template>

      <!-- Router Outlet for Sub-App Pages -->
      <router-outlet></router-outlet>
    </ax-enterprise-layout>
  \`,
})
export class InventoryShellComponent implements OnInit {
  private readonly router = inject(Router);

  readonly config = INVENTORY_APP_CONFIG;
  readonly appName = this.config.name;
  readonly appTheme: EnterprisePresetTheme = 'inventory';
  readonly appHeaderActions: HeaderAction[] = this.config.headerActions || [];

  private _activeSubAppId = 'dashboard';

  // Computed: Sub-app navigation tabs
  readonly subAppNavigation = computed<AxNavigationItem[]>(() => {
    return this.config.subApps.map((subApp: SubAppConfig) => ({
      id: subApp.id,
      title: subApp.name,
      icon: subApp.icon,
      link: subApp.route,
    }));
  });

  // Computed: Current navigation based on active sub-app
  readonly currentNavigation = computed<AxNavigationItem[]>(() => {
    const activeSubApp = this.getActiveSubApp();
    return activeSubApp?.navigation || [];
  });

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateActiveSubApp((event as NavigationEnd).url);
      });
    this.updateActiveSubApp(this.router.url);
  }

  private updateActiveSubApp(url: string): void {
    const subApp = this.config.subApps.find((s: SubAppConfig) => url.startsWith(s.route));
    if (subApp) this._activeSubAppId = subApp.id;
  }

  private getActiveSubApp(): SubAppConfig | undefined {
    return this.config.subApps.find((s: SubAppConfig) => s.id === this._activeSubAppId);
  }

  handleAction(action: HeaderAction): void {
    // Handle header actions...
  }
}`,
    },
  ];

  // Routes code
  routesCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'inventory.routes.ts',
      code: `import { Routes } from '@angular/router';
import { InventoryShellComponent } from './inventory-shell.component';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.routes')
          .then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'warehouse',
        loadChildren: () => import('./modules/warehouse/warehouse.routes')
          .then((m) => m.WAREHOUSE_ROUTES),
      },
      {
        path: 'receiving',
        loadChildren: () => import('./modules/receiving/receiving.routes')
          .then((m) => m.RECEIVING_ROUTES),
      },
      {
        path: 'shipping',
        loadChildren: () => import('./modules/shipping/shipping.routes')
          .then((m) => m.SHIPPING_ROUTES),
      },
    ],
  },
];`,
    },
  ];

  // Main routes code
  mainRoutesCode: CodeTab[] = [
    {
      language: 'typescript' as const,
      label: 'app.routes.ts',
      code: `import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth';

export const appRoutes: Routes = [
  // ... other routes

  // Feature Apps with Multi-App Architecture
  {
    path: 'inventory',
    loadChildren: () =>
      import('./features/inventory/inventory.routes')
        .then((m) => m.INVENTORY_ROUTES),
    canActivate: [AuthGuard],
    data: {
      title: 'Inventory Management',
      description: 'Warehouse and Inventory Management System',
      requiredPermissions: ['inventory.read', 'admin.*'],
    },
  },

  // ... more feature apps
];`,
    },
  ];

  // API Reference Tables
  appConfigProps = [
    {
      name: 'id',
      type: 'string',
      default: '-',
      description: 'Unique app identifier',
    },
    {
      name: 'name',
      type: 'string',
      default: '-',
      description: 'Display name shown in header',
    },
    {
      name: 'description',
      type: 'string',
      default: 'undefined',
      description: 'App description',
    },
    {
      name: 'theme',
      type: 'EnterprisePresetTheme | EnterpriseAppTheme',
      default: "'default'",
      description: 'Theme preset or custom theme object',
    },
    {
      name: 'baseRoute',
      type: 'string',
      default: '-',
      description: 'Base route path (e.g., /inventory)',
    },
    {
      name: 'defaultRoute',
      type: 'string',
      default: '-',
      description: 'Default redirect route',
    },
    {
      name: 'subApps',
      type: 'SubAppConfig[]',
      default: '[]',
      description: 'List of sub-app configurations',
    },
    {
      name: 'headerActions',
      type: 'HeaderAction[]',
      default: '[]',
      description: 'Global header action buttons',
    },
    {
      name: 'showFooter',
      type: 'boolean',
      default: 'true',
      description: 'Show footer section',
    },
    {
      name: 'footerContent',
      type: 'string',
      default: 'undefined',
      description: 'Footer text content',
    },
  ];

  subAppConfigProps = [
    {
      name: 'id',
      type: 'string',
      default: '-',
      description: 'Unique sub-app identifier',
    },
    {
      name: 'name',
      type: 'string',
      default: '-',
      description: 'Display name shown in tabs',
    },
    {
      name: 'icon',
      type: 'string',
      default: '-',
      description: 'Material icon name',
    },
    { name: 'route', type: 'string', default: '-', description: 'Route path' },
    {
      name: 'navigation',
      type: 'AxNavigationItem[]',
      default: '[]',
      description: 'Sidebar navigation items',
    },
    {
      name: 'isDefault',
      type: 'boolean',
      default: 'false',
      description: 'Is default sub-app',
    },
    {
      name: 'permissions',
      type: 'string[]',
      default: '[]',
      description: 'Required permissions',
    },
  ];

  headerActionProps = [
    {
      name: 'id',
      type: 'string',
      default: '-',
      description: 'Unique action identifier',
    },
    {
      name: 'icon',
      type: 'string',
      default: '-',
      description: 'Material icon name',
    },
    {
      name: 'tooltip',
      type: 'string',
      default: '-',
      description: 'Tooltip text',
    },
    {
      name: 'action',
      type: 'string',
      default: '-',
      description: 'Method name to call on click',
    },
    {
      name: 'badge',
      type: 'number',
      default: 'undefined',
      description: 'Badge count',
    },
  ];
}
