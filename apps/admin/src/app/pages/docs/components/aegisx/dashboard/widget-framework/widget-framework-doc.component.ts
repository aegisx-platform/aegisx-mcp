import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-widget-framework-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="widget-framework-doc">
      <ax-doc-header
        title="Widget Framework"
        icon="dashboard"
        description="Enterprise dashboard widget system for building configurable dashboards with drag-and-drop layout editing. Designed for HIS, ERP, and Finance applications."
        [breadcrumbs]="[
          { label: 'Dashboard', link: '/docs/components/aegisx/dashboard' },
          { label: 'Widget Framework' },
        ]"
        status="beta"
        version="1.0.0"
        importStatement="import { provideWidgetFramework, DashboardViewerComponent, DashboardBuilderComponent } from '@aegisx/ui/widgets';"
      ></ax-doc-header>

      <mat-tab-group
        class="widget-framework-doc__tabs"
        animationDuration="150ms"
      >
        <!-- ============================================================== -->
        <!-- OVERVIEW TAB -->
        <!-- ============================================================== -->
        <mat-tab label="Overview">
          <div class="widget-framework-doc__tab-content">
            <!-- Introduction -->
            <section class="widget-framework-doc__section">
              <h2>Overview</h2>
              <p>
                The Widget Framework provides a complete solution for building
                enterprise dashboards. It includes a widget registry, data
                providers, dashboard viewer, and drag-and-drop builder. Designed
                with a provider pattern for flexibility and easy customization.
              </p>

              <div class="widget-framework-doc__features">
                <div class="feature-card">
                  <mat-icon>widgets</mat-icon>
                  <h4>Built-in Widgets</h4>
                  <p>
                    5 pre-built widgets: KPI, Chart, Table, List, and Progress
                  </p>
                </div>
                <div class="feature-card">
                  <mat-icon>drag_indicator</mat-icon>
                  <h4>Drag & Drop Builder</h4>
                  <p>Admin interface for creating and customizing dashboards</p>
                </div>
                <div class="feature-card">
                  <mat-icon>api</mat-icon>
                  <h4>Provider Pattern</h4>
                  <p>Pluggable data, storage, and realtime providers</p>
                </div>
                <div class="feature-card">
                  <mat-icon>extension</mat-icon>
                  <h4>Extensible</h4>
                  <p>Easy to create custom widgets with base class</p>
                </div>
              </div>

              <div class="widget-framework-doc__demo-link">
                <a href="/widget-demo" class="demo-button">
                  <mat-icon>play_arrow</mat-icon>
                  <span>View Live Demo</span>
                </a>
              </div>
            </section>

            <!-- Quick Start -->
            <section class="widget-framework-doc__section">
              <h2>Quick Start</h2>
              <p>
                Get started with the Widget Framework in three simple steps:
              </p>

              <div class="widget-framework-doc__steps">
                <div class="step">
                  <span class="step-number">1</span>
                  <div class="step-content">
                    <h4>Configure Providers</h4>
                    <p>Set up your data provider in app.config.ts</p>
                  </div>
                </div>
                <div class="step">
                  <span class="step-number">2</span>
                  <div class="step-content">
                    <h4>Add Dashboard Viewer</h4>
                    <p>Use ax-dashboard-viewer to display dashboards</p>
                  </div>
                </div>
                <div class="step">
                  <span class="step-number">3</span>
                  <div class="step-content">
                    <h4>Enable Builder (Optional)</h4>
                    <p>Add ax-dashboard-builder for admin editing</p>
                  </div>
                </div>
              </div>

              <ax-code-tabs [tabs]="quickStartCode"></ax-code-tabs>
            </section>

            <!-- Architecture -->
            <section class="widget-framework-doc__section">
              <h2>Architecture</h2>
              <p>
                The framework is built around a provider pattern that separates
                concerns and allows for easy customization of data sources,
                storage, and real-time updates.
              </p>

              <div class="widget-framework-doc__architecture">
                <div class="arch-layer">
                  <h4>Presentation Layer</h4>
                  <div class="arch-items">
                    <span class="arch-item">DashboardViewer</span>
                    <span class="arch-item">DashboardBuilder</span>
                    <span class="arch-item">WidgetHost</span>
                  </div>
                </div>
                <div class="arch-layer">
                  <h4>Widget Layer</h4>
                  <div class="arch-items">
                    <span class="arch-item">KPI Widget</span>
                    <span class="arch-item">Chart Widget</span>
                    <span class="arch-item">Table Widget</span>
                    <span class="arch-item">List Widget</span>
                    <span class="arch-item">Progress Widget</span>
                  </div>
                </div>
                <div class="arch-layer">
                  <h4>Core Layer</h4>
                  <div class="arch-items">
                    <span class="arch-item">Widget Registry</span>
                    <span class="arch-item">Base Widget</span>
                    <span class="arch-item">Types & Tokens</span>
                  </div>
                </div>
                <div class="arch-layer">
                  <h4>Provider Layer</h4>
                  <div class="arch-items">
                    <span class="arch-item">Data Provider</span>
                    <span class="arch-item">Storage Provider</span>
                    <span class="arch-item">Realtime Provider</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- ============================================================== -->
        <!-- WIDGETS TAB -->
        <!-- ============================================================== -->
        <mat-tab label="Widgets">
          <div class="widget-framework-doc__tab-content">
            <!-- KPI Widget -->
            <section class="widget-framework-doc__section">
              <h2>KPI Widget</h2>
              <p>
                Display key performance indicators with value, trend indicator,
                and optional sparkline. Perfect for metric cards at the top of
                dashboards.
              </p>

              <div class="widget-framework-doc__widget-preview">
                <div class="widget-preview-card">
                  <div class="widget-preview-header">
                    <mat-icon>attach_money</mat-icon>
                    <span>Total Revenue</span>
                  </div>
                  <div class="widget-preview-value">$689,372</div>
                  <div class="widget-preview-trend positive">
                    <mat-icon>trending_up</mat-icon>
                    +5.2% vs last month
                  </div>
                </div>
              </div>

              <ax-code-tabs [tabs]="kpiWidgetCode"></ax-code-tabs>
            </section>

            <!-- Chart Widget -->
            <section class="widget-framework-doc__section">
              <h2>Chart Widget</h2>
              <p>
                SVG-based charts supporting line, bar, and donut chart types.
                Lightweight and dependency-free visualization.
              </p>

              <div class="widget-framework-doc__chart-types">
                <div class="chart-type">
                  <mat-icon>show_chart</mat-icon>
                  <span>Line Chart</span>
                </div>
                <div class="chart-type">
                  <mat-icon>bar_chart</mat-icon>
                  <span>Bar Chart</span>
                </div>
                <div class="chart-type">
                  <mat-icon>donut_large</mat-icon>
                  <span>Donut Chart</span>
                </div>
              </div>

              <ax-code-tabs [tabs]="chartWidgetCode"></ax-code-tabs>
            </section>

            <!-- Table Widget -->
            <section class="widget-framework-doc__section">
              <h2>Table Widget</h2>
              <p>
                Data table with configurable columns, sorting, and pagination.
                Ideal for displaying transaction lists or recent activity.
              </p>

              <ax-code-tabs [tabs]="tableWidgetCode"></ax-code-tabs>
            </section>

            <!-- List Widget -->
            <section class="widget-framework-doc__section">
              <h2>List Widget</h2>
              <p>
                Activity feed showing items with icons, titles, and status
                indicators. Perfect for notifications and recent events.
              </p>

              <ax-code-tabs [tabs]="listWidgetCode"></ax-code-tabs>
            </section>

            <!-- Progress Widget -->
            <section class="widget-framework-doc__section">
              <h2>Progress Widget</h2>
              <p>
                Progress indicators in circular, gauge, or linear format. Great
                for showing completion rates and quotas.
              </p>

              <div class="widget-framework-doc__progress-types">
                <div class="progress-type">
                  <mat-icon>donut_large</mat-icon>
                  <span>Circular</span>
                </div>
                <div class="progress-type">
                  <mat-icon>speed</mat-icon>
                  <span>Gauge</span>
                </div>
                <div class="progress-type">
                  <mat-icon>linear_scale</mat-icon>
                  <span>Linear</span>
                </div>
              </div>

              <ax-code-tabs [tabs]="progressWidgetCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- ============================================================== -->
        <!-- PROVIDERS TAB -->
        <!-- ============================================================== -->
        <mat-tab label="Providers">
          <div class="widget-framework-doc__tab-content">
            <!-- Data Provider -->
            <section class="widget-framework-doc__section">
              <h2>Data Provider</h2>
              <p>
                The Data Provider interface defines how widgets fetch data.
                Implement this to connect to your REST API.
              </p>

              <ax-code-tabs [tabs]="dataProviderCode"></ax-code-tabs>
            </section>

            <!-- Storage Provider -->
            <section class="widget-framework-doc__section">
              <h2>Storage Provider</h2>
              <p>
                Storage Provider handles saving and loading dashboard
                configurations. Default uses localStorage; implement for backend
                persistence.
              </p>

              <ax-code-tabs [tabs]="storageProviderCode"></ax-code-tabs>
            </section>

            <!-- Realtime Provider -->
            <section class="widget-framework-doc__section">
              <h2>Realtime Provider</h2>
              <p>
                Realtime Provider enables WebSocket connections for live data
                updates. Optional - widgets work fine with polling if not
                configured.
              </p>

              <ax-code-tabs [tabs]="realtimeProviderCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- ============================================================== -->
        <!-- API TAB -->
        <!-- ============================================================== -->
        <mat-tab label="API">
          <div class="widget-framework-doc__tab-content">
            <!-- DashboardConfig -->
            <section class="widget-framework-doc__section">
              <h2>DashboardConfig</h2>
              <div class="widget-framework-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>id</code></td>
                      <td><code>string</code></td>
                      <td>Unique dashboard identifier</td>
                    </tr>
                    <tr>
                      <td><code>name</code></td>
                      <td><code>string</code></td>
                      <td>Dashboard display name</td>
                    </tr>
                    <tr>
                      <td><code>columns</code></td>
                      <td><code>number</code></td>
                      <td>Grid columns (default: 4)</td>
                    </tr>
                    <tr>
                      <td><code>rowHeight</code></td>
                      <td><code>number</code></td>
                      <td>Row height in pixels (default: 160)</td>
                    </tr>
                    <tr>
                      <td><code>gap</code></td>
                      <td><code>number</code></td>
                      <td>Gap between widgets in pixels (default: 16)</td>
                    </tr>
                    <tr>
                      <td><code>widgets</code></td>
                      <td><code>WidgetInstance[]</code></td>
                      <td>Array of widget instances</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- WidgetInstance -->
            <section class="widget-framework-doc__section">
              <h2>WidgetInstance</h2>
              <div class="widget-framework-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>instanceId</code></td>
                      <td><code>string</code></td>
                      <td>Unique instance ID</td>
                    </tr>
                    <tr>
                      <td><code>widgetId</code></td>
                      <td><code>string</code></td>
                      <td>Widget type ID (e.g., 'kpi', 'chart')</td>
                    </tr>
                    <tr>
                      <td><code>position</code></td>
                      <td><code>WidgetPosition</code></td>
                      <td>Grid position (x, y, cols, rows)</td>
                    </tr>
                    <tr>
                      <td><code>config</code></td>
                      <td><code>object</code></td>
                      <td>Widget-specific configuration</td>
                    </tr>
                    <tr>
                      <td><code>dataSource</code></td>
                      <td><code>WidgetDataSource</code></td>
                      <td>Optional data source configuration</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- DashboardViewer Inputs -->
            <section class="widget-framework-doc__section">
              <h2>DashboardViewer</h2>
              <div class="widget-framework-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>dashboardId</code></td>
                      <td><code>string</code></td>
                      <td>ID to load from storage</td>
                    </tr>
                    <tr>
                      <td><code>config</code></td>
                      <td><code>DashboardConfig</code></td>
                      <td>Direct config (bypasses storage)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- DashboardBuilder Inputs -->
            <section class="widget-framework-doc__section">
              <h2>DashboardBuilder</h2>
              <div class="widget-framework-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input/Output</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>dashboardId</code></td>
                      <td><code>string</code></td>
                      <td>ID to load from storage</td>
                    </tr>
                    <tr>
                      <td><code>initialConfig</code></td>
                      <td><code>DashboardConfig</code></td>
                      <td>Initial config for new dashboard</td>
                    </tr>
                    <tr>
                      <td><code>(saved)</code></td>
                      <td><code>DashboardConfig</code></td>
                      <td>Emits when dashboard is saved</td>
                    </tr>
                    <tr>
                      <td><code>(saveError)</code></td>
                      <td><code>string</code></td>
                      <td>Emits on save error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- ============================================================== -->
        <!-- CUSTOM WIDGETS TAB -->
        <!-- ============================================================== -->
        <mat-tab label="Custom Widgets">
          <div class="widget-framework-doc__tab-content">
            <section class="widget-framework-doc__section">
              <h2>Creating Custom Widgets</h2>
              <p>
                Extend the BaseWidgetComponent to create your own widgets.
                Register them with the widget registry to use in dashboards.
              </p>

              <ax-code-tabs [tabs]="customWidgetCode"></ax-code-tabs>
            </section>

            <section class="widget-framework-doc__section">
              <h2>Widget Registration</h2>
              <p>
                Register your custom widget with the registry to make it
                available in the dashboard builder.
              </p>

              <ax-code-tabs [tabs]="widgetRegistrationCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- ============================================================== -->
        <!-- TOKENS TAB -->
        <!-- ============================================================== -->
        <mat-tab label="Tokens">
          <div class="widget-framework-doc__tab-content">
            <ax-component-tokens [tokens]="widgetTokens"></ax-component-tokens>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .widget-framework-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .widget-framework-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .widget-framework-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .widget-framework-doc__section {
        margin-bottom: var(--ax-spacing-3xl, 3rem);

        h2 {
          font-size: var(--ax-text-xl, 1.25rem);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;
        }

        > p {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin: 0 0 var(--ax-spacing-lg, 1rem) 0;
          max-width: 700px;
        }
      }

      /* Features Grid */
      .widget-framework-doc__features {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--ax-spacing-lg, 1rem);
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .feature-card {
        padding: var(--ax-spacing-lg, 1rem);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg, 0.75rem);
        text-align: center;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-primary-default);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }

        h4 {
          font-size: var(--ax-text-sm, 0.875rem);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 var(--ax-spacing-xs, 0.25rem) 0;
        }

        p {
          font-size: var(--ax-text-xs, 0.75rem);
          color: var(--ax-text-secondary);
          margin: 0;
        }
      }

      /* Demo Link */
      .widget-framework-doc__demo-link {
        margin-top: var(--ax-spacing-xl, 1.5rem);
        text-align: center;

        .demo-button {
          display: inline-flex;
          align-items: center;
          gap: var(--ax-spacing-sm, 0.5rem);
          padding: var(--ax-spacing-md, 0.75rem) var(--ax-spacing-xl, 1.5rem);
          background: var(--ax-primary-default);
          color: white;
          border-radius: var(--ax-radius-lg, 0.75rem);
          text-decoration: none;
          font-weight: 600;
          font-size: var(--ax-text-base, 1rem);
          transition: all 0.2s ease;

          &:hover {
            background: var(--ax-primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }

      /* Quick Start Steps */
      .widget-framework-doc__steps {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md, 0.75rem);
        margin-bottom: var(--ax-spacing-lg, 1rem);
      }

      .step {
        display: flex;
        align-items: flex-start;
        gap: var(--ax-spacing-md, 0.75rem);
      }

      .step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: var(--ax-primary-default);
        color: white;
        border-radius: 50%;
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 600;
        flex-shrink: 0;
      }

      .step-content {
        h4 {
          font-size: var(--ax-text-sm, 0.875rem);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 var(--ax-spacing-xs, 0.25rem) 0;
        }

        p {
          font-size: var(--ax-text-xs, 0.75rem);
          color: var(--ax-text-secondary);
          margin: 0;
        }
      }

      /* Architecture Diagram */
      .widget-framework-doc__architecture {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md, 0.75rem);
        padding: var(--ax-spacing-lg, 1rem);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg, 0.75rem);
      }

      .arch-layer {
        h4 {
          font-size: var(--ax-text-xs, 0.75rem);
          font-weight: 600;
          color: var(--ax-text-muted);
          text-transform: uppercase;
          margin: 0 0 var(--ax-spacing-xs, 0.25rem) 0;
        }
      }

      .arch-items {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ax-spacing-xs, 0.25rem);
      }

      .arch-item {
        padding: 4px 12px;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-full, 9999px);
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-primary);
      }

      /* Widget Preview */
      .widget-framework-doc__widget-preview {
        margin-bottom: var(--ax-spacing-lg, 1rem);
      }

      .widget-preview-card {
        width: 280px;
        padding: var(--ax-spacing-lg, 1rem);
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg, 0.75rem);
        box-shadow: var(--ax-shadow-sm);
      }

      .widget-preview-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs, 0.25rem);
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);
        margin-bottom: var(--ax-spacing-sm, 0.5rem);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .widget-preview-value {
        font-size: var(--ax-text-2xl, 1.5rem);
        font-weight: 600;
        color: var(--ax-text-heading);
        margin-bottom: var(--ax-spacing-xs, 0.25rem);
      }

      .widget-preview-trend {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs, 0.25rem);
        font-size: var(--ax-text-xs, 0.75rem);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }

        &.positive {
          color: var(--ax-success-default);
        }

        &.negative {
          color: var(--ax-error-default);
        }
      }

      /* Chart Types */
      .widget-framework-doc__chart-types,
      .widget-framework-doc__progress-types {
        display: flex;
        gap: var(--ax-spacing-lg, 1rem);
        margin-bottom: var(--ax-spacing-lg, 1rem);
      }

      .chart-type,
      .progress-type {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md, 0.5rem);
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-primary);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: var(--ax-primary-default);
        }
      }

      /* API Table */
      .widget-framework-doc__api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg, 0.75rem);

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          text-align: left;
          padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
          border-bottom: 1px solid var(--ax-border-default);
        }

        th {
          background: var(--ax-background-subtle);
          font-size: var(--ax-text-xs, 0.75rem);
          font-weight: 600;
          color: var(--ax-text-secondary);
          text-transform: uppercase;
        }

        td {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-primary);
        }

        td code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs, 0.75rem);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm, 0.25rem);
        }

        tr:last-child td {
          border-bottom: none;
        }
      }

      @media (max-width: 1024px) {
        .widget-framework-doc__features {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 640px) {
        .widget-framework-doc__features {
          grid-template-columns: 1fr;
        }

        .widget-framework-doc__chart-types,
        .widget-framework-doc__progress-types {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class WidgetFrameworkDocComponent {
  // ============================================================
  // QUICK START CODE
  // ============================================================
  quickStartCode = [
    {
      label: 'app.config.ts',
      language: 'typescript' as const,
      code: `import { ApplicationConfig } from '@angular/core';
import { provideWidgetFramework } from '@aegisx/ui/widgets';
import { MyDataProvider } from './providers/my-data.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideWidgetFramework({
      dataProvider: MyDataProvider,
      // Optional: custom storage provider
      // storageProvider: MyStorageProvider,
    }),
  ],
};`,
    },
    {
      label: 'dashboard.component.ts',
      language: 'typescript' as const,
      code: `import { Component, signal } from '@angular/core';
import {
  DashboardViewerComponent,
  DashboardConfig,
} from '@aegisx/ui/widgets';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardViewerComponent],
  template: \`
    <ax-dashboard-viewer [config]="dashboardConfig()" />
  \`,
})
export class DashboardComponent {
  dashboardConfig = signal<DashboardConfig>({
    id: 'main-dashboard',
    name: 'Overview',
    columns: 4,
    rowHeight: 160,
    gap: 16,
    widgets: [
      {
        instanceId: 'kpi-1',
        widgetId: 'kpi',
        position: { x: 0, y: 0, cols: 1, rows: 1 },
        config: {
          title: 'Revenue',
          endpoint: '/api/kpi/revenue',
          format: 'currency',
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}`,
    },
  ];

  // ============================================================
  // WIDGET CODE EXAMPLES
  // ============================================================
  kpiWidgetCode = [
    {
      label: 'Config',
      language: 'typescript' as const,
      code: `{
  instanceId: 'revenue-kpi',
  widgetId: 'kpi',
  position: { x: 0, y: 0, cols: 1, rows: 1 },
  config: {
    title: 'Total Revenue',
    endpoint: '/api/kpi/revenue',
    format: 'currency',      // 'number' | 'currency' | 'percent'
    icon: 'attach_money',
    showSparkline: true,     // Optional sparkline
  },
}`,
    },
    {
      label: 'API Response',
      language: 'json' as const,
      code: `{
  "value": 689372,
  "change": 5.2,
  "changeIsPercent": true,
  "trend": "up",
  "previousLabel": "vs last month",
  "sparkline": [42, 38, 45, 51, 48, 55]
}`,
    },
  ];

  chartWidgetCode = [
    {
      label: 'Config',
      language: 'typescript' as const,
      code: `{
  instanceId: 'sales-chart',
  widgetId: 'chart',
  position: { x: 0, y: 1, cols: 2, rows: 2 },
  config: {
    title: 'Monthly Sales',
    chartType: 'line',       // 'line' | 'bar' | 'donut'
    endpoint: '/api/charts/monthly-sales',
    colors: ['#3b82f6', '#10b981'],
    showLegend: true,
  },
}`,
    },
    {
      label: 'API Response',
      language: 'json' as const,
      code: `{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "series": [
    {
      "name": "Revenue",
      "data": [42000, 38000, 45000, 51000, 48000, 55000]
    },
    {
      "name": "Expenses",
      "data": [28000, 32000, 30000, 35000, 33000, 38000]
    }
  ]
}`,
    },
  ];

  tableWidgetCode = [
    {
      label: 'Config',
      language: 'typescript' as const,
      code: `{
  instanceId: 'transactions-table',
  widgetId: 'table',
  position: { x: 0, y: 3, cols: 2, rows: 2 },
  config: {
    title: 'Recent Transactions',
    endpoint: '/api/tables/recent-transactions',
    columns: [
      { key: 'id', label: 'ID', width: 80 },
      { key: 'customer', label: 'Customer' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'status', label: 'Status' },
    ],
    pageSize: 5,
    sortable: true,
  },
}`,
    },
  ];

  listWidgetCode = [
    {
      label: 'Config',
      language: 'typescript' as const,
      code: `{
  instanceId: 'activities-list',
  widgetId: 'list',
  position: { x: 2, y: 3, cols: 2, rows: 2 },
  config: {
    title: 'Recent Activities',
    endpoint: '/api/lists/recent-activities',
    maxItems: 6,
    showIcon: true,
    showStatus: true,
  },
}`,
    },
  ];

  progressWidgetCode = [
    {
      label: 'Config',
      language: 'typescript' as const,
      code: `// Circular Progress
{
  instanceId: 'storage-progress',
  widgetId: 'progress',
  position: { x: 0, y: 0, cols: 1, rows: 1 },
  config: {
    title: 'Storage Usage',
    progressType: 'circular',  // 'circular' | 'gauge' | 'linear'
    endpoint: '/api/progress/storage',
    // Or static value:
    // value: 72,
    // label: 'Storage',
  },
}`,
    },
  ];

  // ============================================================
  // PROVIDER CODE EXAMPLES
  // ============================================================
  dataProviderCode = [
    {
      label: 'Interface',
      language: 'typescript' as const,
      code: `import { Observable } from 'rxjs';

export interface WidgetDataProvider {
  /**
   * Fetch data from an endpoint
   * @param endpoint - API endpoint path
   * @param params - Optional query parameters
   */
  fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T>;
}`,
    },
    {
      label: 'Implementation',
      language: 'typescript' as const,
      code: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetDataProvider } from '@aegisx/ui/widgets';

@Injectable({ providedIn: 'root' })
export class ApiDataProvider implements WidgetDataProvider {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  fetch<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    return this.http.get<T>(url, { params: params as any });
  }
}`,
    },
  ];

  storageProviderCode = [
    {
      label: 'Interface',
      language: 'typescript' as const,
      code: `import { Observable } from 'rxjs';
import { DashboardConfig, DashboardSummary } from '@aegisx/ui/widgets';

export interface WidgetStorageProvider {
  /** Load a dashboard by ID */
  load(id: string): Observable<DashboardConfig | null>;

  /** Save a dashboard */
  save(config: DashboardConfig): Observable<void>;

  /** Delete a dashboard */
  delete(id: string): Observable<void>;

  /** List all dashboards */
  list(): Observable<DashboardSummary[]>;
}`,
    },
    {
      label: 'Backend Implementation',
      language: 'typescript' as const,
      code: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WidgetStorageProvider,
  DashboardConfig,
  DashboardSummary,
} from '@aegisx/ui/widgets';

@Injectable({ providedIn: 'root' })
export class BackendStorageProvider implements WidgetStorageProvider {
  private http = inject(HttpClient);
  private baseUrl = '/api/dashboards';

  load(id: string): Observable<DashboardConfig | null> {
    return this.http.get<DashboardConfig>(\`\${this.baseUrl}/\${id}\`);
  }

  save(config: DashboardConfig): Observable<void> {
    return this.http.put<void>(\`\${this.baseUrl}/\${config.id}\`, config);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(\`\${this.baseUrl}/\${id}\`);
  }

  list(): Observable<DashboardSummary[]> {
    return this.http.get<DashboardSummary[]>(this.baseUrl);
  }
}`,
    },
  ];

  realtimeProviderCode = [
    {
      label: 'Interface',
      language: 'typescript' as const,
      code: `import { Observable } from 'rxjs';

export interface WidgetRealtimeProvider {
  /** Subscribe to a WebSocket channel */
  subscribe<T>(channel: string): Observable<T>;

  /** Unsubscribe from a channel */
  unsubscribe(channel: string): void;

  /** Connection status */
  connected$: Observable<boolean>;
}`,
    },
    {
      label: 'WebSocket Implementation',
      language: 'typescript' as const,
      code: `import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, BehaviorSubject, filter, map } from 'rxjs';
import { WidgetRealtimeProvider } from '@aegisx/ui/widgets';

@Injectable({ providedIn: 'root' })
export class WebSocketRealtimeProvider implements WidgetRealtimeProvider {
  private socket$: WebSocketSubject<any>;
  private connected$ = new BehaviorSubject(false);

  constructor() {
    this.socket$ = webSocket('wss://your-api.com/ws');
    this.socket$.subscribe({
      next: () => this.connected$.next(true),
      error: () => this.connected$.next(false),
    });
  }

  subscribe<T>(channel: string): Observable<T> {
    this.socket$.next({ action: 'subscribe', channel });
    return this.socket$.pipe(
      filter((msg) => msg.channel === channel),
      map((msg) => msg.data as T)
    );
  }

  unsubscribe(channel: string): void {
    this.socket$.next({ action: 'unsubscribe', channel });
  }
}`,
    },
  ];

  // ============================================================
  // CUSTOM WIDGET CODE
  // ============================================================
  customWidgetCode = [
    {
      label: 'weather-widget.component.ts',
      language: 'typescript' as const,
      code: `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseWidgetComponent } from '@aegisx/ui/widgets';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  icon: string;
}

interface WeatherConfig {
  title: string;
  endpoint: string;
  unit: 'celsius' | 'fahrenheit';
}

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: \`
    <div class="weather-widget">
      @if (loading()) {
        <div class="loading">Loading...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (data()) {
        <div class="weather-content">
          <mat-icon>{{ data()!.icon }}</mat-icon>
          <div class="temperature">
            {{ data()!.temperature }}°{{ config()?.unit === 'fahrenheit' ? 'F' : 'C' }}
          </div>
          <div class="condition">{{ data()!.condition }}</div>
          <div class="location">{{ data()!.location }}</div>
        </div>
      }
    </div>
  \`,
})
export class WeatherWidgetComponent
  extends BaseWidgetComponent<WeatherData, WeatherConfig>
  implements OnInit
{
  ngOnInit(): void {
    // BaseWidgetComponent handles data fetching automatically
    // Just call refresh() if you need to trigger a refresh
    this.refresh();
  }
}`,
    },
  ];

  widgetRegistrationCode = [
    {
      label: 'Register Widget',
      language: 'typescript' as const,
      code: `import { inject } from '@angular/core';
import { WidgetRegistry, WidgetDefinition } from '@aegisx/ui/widgets';
import { WeatherWidgetComponent } from './weather-widget.component';

// Define your widget
const weatherWidget: WidgetDefinition = {
  id: 'weather',
  name: 'Weather',
  description: 'Display current weather conditions',
  icon: 'cloud',
  category: 'display',
  component: WeatherWidgetComponent,
  sizes: {
    minSize: { cols: 1, rows: 1 },
    maxSize: { cols: 2, rows: 2 },
    defaultSize: { cols: 1, rows: 1 },
  },
  defaultConfig: {
    title: 'Weather',
    endpoint: '/api/weather',
    unit: 'celsius',
  },
};

// Register in your app initialization
export function registerCustomWidgets() {
  const registry = inject(WidgetRegistry);
  registry.register(weatherWidget);
}`,
    },
  ];

  // ============================================================
  // TOKENS
  // ============================================================
  widgetTokens: ComponentToken[] = [
    {
      category: 'Layout',
      cssVar: '--ax-background-default',
      usage: 'Widget card background',
    },
    {
      category: 'Layout',
      cssVar: '--ax-background-subtle',
      usage: 'Dashboard grid background',
    },
    {
      category: 'Layout',
      cssVar: '--ax-border-default',
      usage: 'Widget border',
    },
    {
      category: 'Layout',
      cssVar: '--ax-radius-lg',
      usage: 'Widget corner radius',
    },
    { category: 'Layout', cssVar: '--ax-shadow-md', usage: 'Widget shadow' },
    {
      category: 'Typography',
      cssVar: '--ax-text-heading',
      usage: 'Widget title color',
    },
    {
      category: 'Typography',
      cssVar: '--ax-text-primary',
      usage: 'Widget value color',
    },
    {
      category: 'Typography',
      cssVar: '--ax-text-secondary',
      usage: 'Widget label color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-default',
      usage: 'Positive trend indicator',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-default',
      usage: 'Negative trend indicator',
    },
    {
      category: 'Colors',
      cssVar: '--ax-primary-default',
      usage: 'Primary accent color',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-md',
      usage: 'Internal widget padding',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-spacing-lg',
      usage: 'Content spacing',
    },
  ];
}
