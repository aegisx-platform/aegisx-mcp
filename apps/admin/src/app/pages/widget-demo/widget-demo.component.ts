import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import {
  AxEnterpriseLayoutComponent,
  AxNavigationItem,
  AxBreadcrumbComponent,
  BreadcrumbItem,
  // Widget components
  KpiWidgetComponent,
  KpiWidgetConfig,
  KpiWidgetData,
  ChartWidgetComponent,
  ChartWidgetConfig,
  ChartWidgetData,
  TableWidgetComponent,
  TableWidgetConfig,
  TableWidgetData,
  ListWidgetComponent,
  ListWidgetConfig,
  ListWidgetData,
  ProgressWidgetComponent,
  ProgressWidgetConfig,
  ProgressWidgetData,
} from '@aegisx/ui';

@Component({
  selector: 'app-widget-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    AxEnterpriseLayoutComponent,
    AxBreadcrumbComponent,
    // Widget components
    KpiWidgetComponent,
    ChartWidgetComponent,
    TableWidgetComponent,
    ListWidgetComponent,
    ProgressWidgetComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="'Widget Framework'"
      [navigation]="navigation"
      [showFooter]="true"
      [appTheme]="'default'"
      [contentBackground]="'gray'"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <a
          mat-icon-button
          matTooltip="Documentation"
          routerLink="/docs/components/aegisx/dashboard/widget-framework"
        >
          <mat-icon>menu_book</mat-icon>
        </a>
        <button mat-icon-button matTooltip="Settings">
          <mat-icon>settings</mat-icon>
        </button>
      </ng-template>

      <!-- Main Content -->
      <div class="widget-content">
        <!-- Breadcrumb -->
        <ax-breadcrumb
          [items]="breadcrumbItems"
          separatorIcon="chevron_right"
          size="sm"
        ></ax-breadcrumb>

        <!-- Page Header -->
        <div class="page-header">
          <div class="page-title">
            <h1>Widget Framework Demo</h1>
            <p>
              Enterprise dashboard widget system for HIS, ERP, Finance
              applications
            </p>
          </div>
          <div class="page-actions">
            <button mat-stroked-button>
              <mat-icon>code</mat-icon>
              View Source
            </button>
            <button mat-flat-button color="primary">
              <mat-icon>add</mat-icon>
              New Dashboard
            </button>
          </div>
        </div>

        <!-- Demo Tabs -->
        <mat-card appearance="outlined" class="demo-card">
          <mat-tab-group class="widget-tabs" animationDuration="200ms">
            <!-- Live Widgets Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>widgets</mat-icon>
                <span>Live Widgets</span>
              </ng-template>
              <div class="tab-content">
                <div class="info-banner">
                  <mat-icon>info</mat-icon>
                  <span>Live widget components from @aegisx/ui library</span>
                </div>

                <!-- KPI Widgets Section -->
                <div class="widget-section">
                  <div class="section-header">
                    <mat-icon>analytics</mat-icon>
                    <h3>KPI Widgets</h3>
                  </div>
                  <div class="kpi-grid">
                    @for (kpi of kpiWidgets; track kpi.instanceId) {
                      <ax-kpi-widget
                        [instanceId]="kpi.instanceId"
                        [config]="kpi.config"
                        [initialData]="kpi.data"
                      ></ax-kpi-widget>
                    }
                  </div>
                </div>

                <!-- Chart Widgets Section -->
                <div class="widget-section">
                  <div class="section-header">
                    <mat-icon>bar_chart</mat-icon>
                    <h3>Chart Widgets</h3>
                  </div>
                  <div class="chart-grid">
                    @for (chart of chartWidgets; track chart.instanceId) {
                      <ax-chart-widget
                        [instanceId]="chart.instanceId"
                        [config]="chart.config"
                        [initialData]="chart.data"
                      ></ax-chart-widget>
                    }
                  </div>
                </div>

                <!-- Table Widget Section -->
                <div class="widget-section">
                  <div class="section-header">
                    <mat-icon>table_chart</mat-icon>
                    <h3>Table Widget</h3>
                  </div>
                  <div class="table-container">
                    <ax-table-widget
                      [instanceId]="'table-demo'"
                      [config]="tableConfig"
                      [initialData]="tableData"
                    ></ax-table-widget>
                  </div>
                </div>

                <!-- List & Progress Section -->
                <div class="widget-section">
                  <div class="section-header">
                    <mat-icon>view_list</mat-icon>
                    <h3>List & Progress Widgets</h3>
                  </div>
                  <div class="mixed-grid">
                    <ax-list-widget
                      [instanceId]="'list-demo'"
                      [config]="listConfig"
                      [initialData]="listData"
                    ></ax-list-widget>
                    @for (progress of progressWidgets; track progress.instanceId) {
                      <ax-progress-widget
                        [instanceId]="progress.instanceId"
                        [config]="progress.config"
                        [initialData]="progress.data"
                      ></ax-progress-widget>
                    }
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Builder Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>edit</mat-icon>
                <span>Dashboard Builder</span>
              </ng-template>
              <div class="tab-content tab-content--builder">
                <div class="info-banner info-banner--warning">
                  <mat-icon>construction</mat-icon>
                  <span
                    >Admin View - Drag & drop to customize dashboard
                    layout</span
                  >
                </div>
                <div class="placeholder-area">
                  <mat-icon>dashboard_customize</mat-icon>
                  <h3>Dashboard Builder Coming Soon</h3>
                  <p>Drag and drop widget builder is under development</p>
                  <button mat-stroked-button color="primary">
                    <mat-icon>notifications</mat-icon>
                    Notify Me
                  </button>
                </div>
              </div>
            </mat-tab>

            <!-- Widgets Showcase -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>grid_view</mat-icon>
                <span>Widget Showcase</span>
              </ng-template>
              <div class="tab-content">
                <div class="showcase">
                  <h2>Built-in Widgets</h2>
                  <p class="showcase-desc">
                    Pre-built widgets ready to use in your dashboards
                  </p>

                  <div class="widgets-grid">
                    <!-- KPI Widgets -->
                    <div class="widget-section">
                      <div class="section-header">
                        <mat-icon>analytics</mat-icon>
                        <h3>KPI Widget</h3>
                      </div>
                      <div class="widget-row">
                        <div class="widget-card">
                          <mat-icon>trending_up</mat-icon>
                          <span>Value</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>compare_arrows</mat-icon>
                          <span>Comparison</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>show_chart</mat-icon>
                          <span>Sparkline</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>target</mat-icon>
                          <span>Goal</span>
                        </div>
                      </div>
                    </div>

                    <!-- Chart Widgets -->
                    <div class="widget-section">
                      <div class="section-header">
                        <mat-icon>bar_chart</mat-icon>
                        <h3>Chart Widget</h3>
                      </div>
                      <div class="widget-row">
                        <div class="widget-card">
                          <mat-icon>show_chart</mat-icon>
                          <span>Line</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>bar_chart</mat-icon>
                          <span>Bar</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>donut_large</mat-icon>
                          <span>Donut</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>area_chart</mat-icon>
                          <span>Area</span>
                        </div>
                      </div>
                    </div>

                    <!-- Data Widgets -->
                    <div class="widget-section">
                      <div class="section-header">
                        <mat-icon>table_chart</mat-icon>
                        <h3>Data Widget</h3>
                      </div>
                      <div class="widget-row">
                        <div class="widget-card">
                          <mat-icon>table_rows</mat-icon>
                          <span>Table</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>format_list_bulleted</mat-icon>
                          <span>List</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>timeline</mat-icon>
                          <span>Timeline</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>calendar_today</mat-icon>
                          <span>Calendar</span>
                        </div>
                      </div>
                    </div>

                    <!-- Progress Widgets -->
                    <div class="widget-section">
                      <div class="section-header">
                        <mat-icon>speed</mat-icon>
                        <h3>Progress Widget</h3>
                      </div>
                      <div class="widget-row">
                        <div class="widget-card">
                          <mat-icon>radio_button_checked</mat-icon>
                          <span>Circular</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>speed</mat-icon>
                          <span>Gauge</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>linear_scale</mat-icon>
                          <span>Linear</span>
                        </div>
                        <div class="widget-card">
                          <mat-icon>stacked_bar_chart</mat-icon>
                          <span>Segmented</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>Widget Framework - AegisX Platform</span>
        <span class="footer-version">v1.0.0</span>
      </ng-template>
    </ax-enterprise-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .widget-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Page Header */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .page-title h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .page-title p {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
      }

      .page-actions {
        display: flex;
        gap: 0.75rem;
      }

      /* Demo Card */
      .demo-card {
        overflow: hidden;
      }

      .widget-tabs {
        ::ng-deep .mat-mdc-tab {
          min-width: 160px;
        }

        ::ng-deep .mat-mdc-tab-labels {
          background: var(--ax-background-subtle);
          border-bottom: 1px solid var(--ax-border-muted);
        }

        ::ng-deep .mat-mdc-tab .mdc-tab__content {
          gap: 0.5rem;
        }

        ::ng-deep .mat-mdc-tab mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .tab-content {
        padding: 1.5rem;
        min-height: 500px;

        &--builder {
          min-height: 600px;
        }
      }

      /* Info Banner */
      .info-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        margin-bottom: 1.5rem;
        background: var(--ax-info-faint);
        border-radius: var(--ax-radius-lg);
        color: var(--ax-info-700);
        font-size: 0.875rem;
        font-weight: 500;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &--warning {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }
      }

      /* Widget Section */
      .widget-section {
        margin-bottom: 2rem;

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--ax-border-muted);

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: var(--ax-primary-default);
          }

          h3 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--ax-text-heading);
          }
        }
      }

      /* KPI Grid */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      /* Chart Grid */
      .chart-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1rem;
      }

      /* Table Container */
      .table-container {
        max-width: 100%;
        overflow-x: auto;
      }

      /* Mixed Grid for List & Progress */
      .mixed-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
      }

      /* Placeholder Area */
      .placeholder-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 4rem 2rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-xl);
        border: 2px dashed var(--ax-border-default);
        text-align: center;

        > mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: var(--ax-text-muted);
        }

        h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          color: var(--ax-text-secondary);
        }
      }

      /* Showcase */
      .showcase {
        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        .showcase-desc {
          margin: 0.25rem 0 1.5rem;
          color: var(--ax-text-secondary);
          font-size: 0.875rem;
        }
      }

      .widgets-grid {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .widget-row {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
      }

      .widget-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1.5rem 1rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--ax-primary-default);
          background: var(--ax-primary-faint);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-primary-default);
        }

        span {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ax-text-secondary);
        }
      }

      /* Footer */
      .footer-version {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }
    `,
  ],
})
export class WidgetDemoComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Widget Framework', url: '/widget-demo' },
    { label: 'Demo' },
  ];

  navigation: AxNavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      link: '/widget-demo',
      icon: 'dashboard',
    },
    {
      id: 'viewer',
      title: 'Viewer',
      link: '/widget-demo',
      icon: 'visibility',
    },
    {
      id: 'builder',
      title: 'Builder',
      link: '/widget-demo',
      icon: 'edit',
    },
    {
      id: 'widgets',
      title: 'Widgets',
      link: '/widget-demo',
      icon: 'widgets',
    },
    {
      id: 'settings',
      title: 'Settings',
      link: '/widget-demo',
      icon: 'settings',
    },
  ];

  // KPI Widgets
  kpiWidgets: {
    instanceId: string;
    config: KpiWidgetConfig;
    data: KpiWidgetData;
  }[] = [
    {
      instanceId: 'kpi-revenue',
      config: {
        title: 'Total Revenue',
        subtitle: 'This month',
        icon: 'attach_money',
        format: 'currency',
        currency: 'USD',
        showTrend: true,
        color: 'primary',
      },
      data: {
        value: 125840,
        change: 12.5,
        trend: 'up',
        previousLabel: 'vs last month',
      },
    },
    {
      instanceId: 'kpi-users',
      config: {
        title: 'Active Users',
        subtitle: 'Currently online',
        icon: 'people',
        format: 'compact',
        showTrend: true,
        color: 'success',
      },
      data: {
        value: 2847,
        change: 8.2,
        trend: 'up',
        previousLabel: 'vs yesterday',
      },
    },
    {
      instanceId: 'kpi-orders',
      config: {
        title: 'Orders',
        subtitle: 'This week',
        icon: 'shopping_cart',
        format: 'number',
        showTrend: true,
        color: 'info',
      },
      data: {
        value: 1284,
        change: -3.1,
        trend: 'down',
        previousLabel: 'vs last week',
      },
    },
    {
      instanceId: 'kpi-conversion',
      config: {
        title: 'Conversion',
        subtitle: 'Last 30 days',
        icon: 'trending_up',
        format: 'percent',
        decimals: 1,
        showTrend: true,
        color: 'warning',
      },
      data: {
        value: 0.0342,
        change: 0.5,
        trend: 'up',
        previousLabel: 'vs previous period',
      },
    },
  ];

  // Chart Widgets
  chartWidgets: {
    instanceId: string;
    config: ChartWidgetConfig;
    data: ChartWidgetData;
  }[] = [
    {
      instanceId: 'chart-revenue',
      config: {
        title: 'Revenue Trend',
        type: 'line',
        showLegend: true,
        showGrid: true,
        smooth: true,
      },
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
          {
            name: 'Revenue',
            data: [65000, 72000, 68000, 85000, 92000, 125840],
            color: '#3b82f6',
          },
          {
            name: 'Target',
            data: [70000, 75000, 80000, 85000, 90000, 100000],
            color: '#10b981',
          },
        ],
      },
    },
    {
      instanceId: 'chart-sales',
      config: {
        title: 'Sales by Category',
        type: 'donut',
        showLegend: true,
      },
      data: {
        labels: ['Electronics', 'Clothing', 'Food', 'Books', 'Other'],
        series: [
          {
            name: 'Sales',
            data: [35, 25, 20, 12, 8],
          },
        ],
      },
    },
    {
      instanceId: 'chart-orders',
      config: {
        title: 'Weekly Orders',
        type: 'bar',
        showLegend: false,
        showGrid: true,
      },
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [
          {
            name: 'Orders',
            data: [120, 150, 180, 165, 200, 250, 220],
            color: '#8b5cf6',
          },
        ],
      },
    },
  ];

  // Table Widget
  tableConfig: TableWidgetConfig = {
    title: 'Recent Transactions',
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'customer', label: 'Customer', width: '150px' },
      { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
      { key: 'status', label: 'Status', type: 'status', align: 'center' },
      { key: 'date', label: 'Date', type: 'date', width: '120px' },
    ],
    pageSize: 5,
    showPagination: true,
    striped: true,
  };

  tableData: TableWidgetData = {
    items: [
      {
        id: 'TXN001',
        customer: 'John Smith',
        amount: 1250.0,
        status: 'completed',
        date: '2024-01-15',
      },
      {
        id: 'TXN002',
        customer: 'Jane Doe',
        amount: 890.5,
        status: 'pending',
        date: '2024-01-14',
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
        amount: 450.25,
        status: 'error',
        date: '2024-01-13',
      },
      {
        id: 'TXN005',
        customer: 'Charlie Davis',
        amount: 1780.0,
        status: 'completed',
        date: '2024-01-12',
      },
    ],
    total: 25,
  };

  // List Widget
  listConfig: ListWidgetConfig = {
    title: 'Recent Activities',
    maxItems: 5,
    showIcons: true,
    showMeta: true,
    clickable: true,
    divided: true,
  };

  listData: ListWidgetData = {
    items: [
      {
        id: '1',
        title: 'New order received',
        subtitle: 'Order #12345 from John Smith',
        icon: 'shopping_cart',
        iconColor: '#3b82f6',
        meta: '2 min ago',
        status: 'active',
      },
      {
        id: '2',
        title: 'Payment processed',
        subtitle: '$1,250.00 via Credit Card',
        icon: 'payment',
        iconColor: '#10b981',
        meta: '15 min ago',
        status: 'completed',
      },
      {
        id: '3',
        title: 'User registered',
        subtitle: 'jane.doe@example.com',
        icon: 'person_add',
        iconColor: '#8b5cf6',
        meta: '1 hour ago',
        status: 'active',
      },
      {
        id: '4',
        title: 'Stock alert',
        subtitle: 'Product SKU-001 is low',
        icon: 'warning',
        iconColor: '#f59e0b',
        meta: '2 hours ago',
        status: 'warning',
      },
      {
        id: '5',
        title: 'Report generated',
        subtitle: 'Monthly sales report',
        icon: 'description',
        iconColor: '#06b6d4',
        meta: '3 hours ago',
        status: 'completed',
      },
    ],
  };

  // Progress Widgets
  progressWidgets: {
    instanceId: string;
    config: ProgressWidgetConfig;
    data: ProgressWidgetData;
  }[] = [
    {
      instanceId: 'progress-storage',
      config: {
        title: 'Storage Used',
        type: 'circular',
        max: 100,
        showLabel: true,
        showPercent: true,
        color: 'primary',
      },
      data: {
        value: 68,
        label: '68 GB of 100 GB',
      },
    },
    {
      instanceId: 'progress-target',
      config: {
        title: 'Monthly Target',
        type: 'gauge',
        max: 100,
        showLabel: true,
        showPercent: true,
        autoColor: true,
        thresholds: { warning: 70, error: 90 },
      },
      data: {
        value: 85,
        label: '$85K of $100K',
      },
    },
  ];
}
