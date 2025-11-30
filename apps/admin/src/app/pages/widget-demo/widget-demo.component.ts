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
            <!-- Viewer Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>visibility</mat-icon>
                <span>Dashboard Viewer</span>
              </ng-template>
              <div class="tab-content">
                <div class="info-banner">
                  <mat-icon>info</mat-icon>
                  <span
                    >User View - Read-only dashboard display for end users</span
                  >
                </div>
                <div class="placeholder-area">
                  <mat-icon>widgets</mat-icon>
                  <h3>Dashboard Viewer Coming Soon</h3>
                  <p>Widget components are under development</p>
                  <button mat-stroked-button color="primary">
                    <mat-icon>notifications</mat-icon>
                    Notify Me
                  </button>
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

      .widget-section {
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
}
