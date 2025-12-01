import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { CodeTabsComponent } from '../../../../../../components/docs';
import { CodeTab } from '../../../../../../types/docs.types';
import {
  KpiWidgetComponent,
  KpiWidgetConfig,
  KpiWidgetData,
  ProgressWidgetComponent,
  ProgressWidgetConfig,
  ProgressWidgetData,
  ChartWidgetComponent,
  ChartWidgetConfig,
  ChartWidgetData,
  TableWidgetComponent,
  TableWidgetConfig,
  TableWidgetData,
  ListWidgetComponent,
  ListWidgetConfig,
  ListWidgetData,
} from '@aegisx/ui';

type WidgetType = 'kpi' | 'progress' | 'chart' | 'table' | 'list';

@Component({
  selector: 'ax-widget-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatTabsModule,
    CodeTabsComponent,
    KpiWidgetComponent,
    ProgressWidgetComponent,
    ChartWidgetComponent,
    TableWidgetComponent,
    ListWidgetComponent,
  ],
  template: `
    <div class="widget-showcase">
      <!-- Widget Type Selector -->
      <div class="widget-showcase__selector">
        <mat-form-field appearance="outline">
          <mat-label>Select Widget Type</mat-label>
          <mat-select
            [value]="selectedWidget()"
            (selectionChange)="selectedWidget.set($event.value)"
          >
            <mat-option value="kpi">
              <mat-icon>analytics</mat-icon>
              KPI Widget
            </mat-option>
            <mat-option value="progress">
              <mat-icon>donut_large</mat-icon>
              Progress Widget
            </mat-option>
            <mat-option value="chart">
              <mat-icon>bar_chart</mat-icon>
              Chart Widget
            </mat-option>
            <mat-option value="table">
              <mat-icon>table_chart</mat-icon>
              Table Widget
            </mat-option>
            <mat-option value="list">
              <mat-icon>list</mat-icon>
              List Widget
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="widget-showcase__layout">
        <!-- Live Preview -->
        <div class="widget-showcase__preview">
          <div class="panel-header">
            <mat-icon>visibility</mat-icon>
            <h3>Live Preview</h3>
          </div>
          <div class="preview-container">
            @switch (selectedWidget()) {
              @case ('kpi') {
                <div class="preview-widget preview-widget--kpi">
                  <ax-kpi-widget
                    [instanceId]="'kpi-showcase'"
                    [config]="kpiConfig()"
                    [initialData]="kpiData()"
                  ></ax-kpi-widget>
                </div>
              }
              @case ('progress') {
                <div class="preview-widget preview-widget--progress">
                  <ax-progress-widget
                    [instanceId]="'progress-showcase'"
                    [config]="progressConfig()"
                    [initialData]="progressData()"
                  ></ax-progress-widget>
                </div>
              }
              @case ('chart') {
                <div class="preview-widget preview-widget--chart">
                  <ax-chart-widget
                    [instanceId]="'chart-showcase'"
                    [config]="chartConfig()"
                    [initialData]="chartData()"
                  ></ax-chart-widget>
                </div>
              }
              @case ('table') {
                <div class="preview-widget preview-widget--table">
                  <ax-table-widget
                    [instanceId]="'table-showcase'"
                    [config]="tableConfig()"
                    [initialData]="tableData()"
                  ></ax-table-widget>
                </div>
              }
              @case ('list') {
                <div class="preview-widget preview-widget--list">
                  <ax-list-widget
                    [instanceId]="'list-showcase'"
                    [config]="listConfig()"
                    [initialData]="listData()"
                  ></ax-list-widget>
                </div>
              }
            }
          </div>
        </div>

        <!-- Configuration Panel -->
        <div class="widget-showcase__config">
          <div class="panel-header">
            <mat-icon>settings</mat-icon>
            <h3>Configuration</h3>
          </div>

          @switch (selectedWidget()) {
            <!-- KPI Config -->
            @case ('kpi') {
              <div class="config-form">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input
                    matInput
                    [ngModel]="kpiTitle()"
                    (ngModelChange)="kpiTitle.set($event)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Subtitle</mat-label>
                  <input
                    matInput
                    [ngModel]="kpiSubtitle()"
                    (ngModelChange)="kpiSubtitle.set($event)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Icon</mat-label>
                  <mat-select
                    [ngModel]="kpiIcon()"
                    (ngModelChange)="kpiIcon.set($event)"
                  >
                    <mat-option value="attach_money">attach_money</mat-option>
                    <mat-option value="people">people</mat-option>
                    <mat-option value="shopping_cart">shopping_cart</mat-option>
                    <mat-option value="trending_up">trending_up</mat-option>
                    <mat-option value="inventory">inventory</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Format</mat-label>
                  <mat-select
                    [ngModel]="kpiFormat()"
                    (ngModelChange)="kpiFormat.set($event)"
                  >
                    <mat-option value="number">Number</mat-option>
                    <mat-option value="currency">Currency</mat-option>
                    <mat-option value="percent">Percent</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Color</mat-label>
                  <mat-select
                    [ngModel]="kpiColor()"
                    (ngModelChange)="kpiColor.set($event)"
                  >
                    <mat-option value="primary">Primary</mat-option>
                    <mat-option value="success">Success</mat-option>
                    <mat-option value="warning">Warning</mat-option>
                    <mat-option value="error">Error</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Value</mat-label>
                  <input
                    matInput
                    type="number"
                    [ngModel]="kpiValue()"
                    (ngModelChange)="kpiValue.set($event)"
                  />
                </mat-form-field>

                <mat-slide-toggle
                  [ngModel]="kpiShowTrend()"
                  (ngModelChange)="kpiShowTrend.set($event)"
                >
                  Show Trend
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="kpiCompact()"
                  (ngModelChange)="kpiCompact.set($event)"
                >
                  Compact Mode
                </mat-slide-toggle>
              </div>
            }

            <!-- Progress Config -->
            @case ('progress') {
              <div class="config-form">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input
                    matInput
                    [ngModel]="progressTitle()"
                    (ngModelChange)="progressTitle.set($event)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select
                    [ngModel]="progressType()"
                    (ngModelChange)="progressType.set($event)"
                  >
                    <mat-option value="circular">Circular</mat-option>
                    <mat-option value="gauge">Gauge</mat-option>
                    <mat-option value="linear">Linear</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Color</mat-label>
                  <mat-select
                    [ngModel]="progressColor()"
                    (ngModelChange)="progressColor.set($event)"
                  >
                    <mat-option value="primary">Primary</mat-option>
                    <mat-option value="success">Success</mat-option>
                    <mat-option value="warning">Warning</mat-option>
                    <mat-option value="error">Error</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Value (0-100)</mat-label>
                  <input
                    matInput
                    type="number"
                    min="0"
                    max="100"
                    [ngModel]="progressValue()"
                    (ngModelChange)="progressValue.set($event)"
                  />
                </mat-form-field>

                <mat-slide-toggle
                  [ngModel]="progressShowPercent()"
                  (ngModelChange)="progressShowPercent.set($event)"
                >
                  Show Percent
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="progressShowLabel()"
                  (ngModelChange)="progressShowLabel.set($event)"
                >
                  Show Label
                </mat-slide-toggle>
              </div>
            }

            <!-- Chart Config -->
            @case ('chart') {
              <div class="config-form">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input
                    matInput
                    [ngModel]="chartTitle()"
                    (ngModelChange)="chartTitle.set($event)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Chart Type</mat-label>
                  <mat-select
                    [ngModel]="chartType()"
                    (ngModelChange)="chartType.set($event)"
                  >
                    <mat-option value="line">Line</mat-option>
                    <mat-option value="bar">Bar</mat-option>
                    <mat-option value="donut">Donut</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-slide-toggle
                  [ngModel]="chartShowLegend()"
                  (ngModelChange)="chartShowLegend.set($event)"
                >
                  Show Legend
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="chartCompact()"
                  (ngModelChange)="chartCompact.set($event)"
                >
                  Compact Mode
                </mat-slide-toggle>
              </div>
            }

            <!-- Table Config -->
            @case ('table') {
              <div class="config-form">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input
                    matInput
                    [ngModel]="tableTitle()"
                    (ngModelChange)="tableTitle.set($event)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Page Size</mat-label>
                  <mat-select
                    [ngModel]="tablePageSize()"
                    (ngModelChange)="tablePageSize.set($event)"
                  >
                    <mat-option [value]="3">3 rows</mat-option>
                    <mat-option [value]="5">5 rows</mat-option>
                    <mat-option [value]="10">10 rows</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-slide-toggle
                  [ngModel]="tableSortable()"
                  (ngModelChange)="tableSortable.set($event)"
                >
                  Sortable
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="tableStriped()"
                  (ngModelChange)="tableStriped.set($event)"
                >
                  Striped Rows
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="tableCompact()"
                  (ngModelChange)="tableCompact.set($event)"
                >
                  Compact Mode
                </mat-slide-toggle>
              </div>
            }

            <!-- List Config -->
            @case ('list') {
              <div class="config-form">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input
                    matInput
                    [ngModel]="listTitle()"
                    (ngModelChange)="listTitle.set($event)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Max Items</mat-label>
                  <mat-select
                    [ngModel]="listMaxItems()"
                    (ngModelChange)="listMaxItems.set($event)"
                  >
                    <mat-option [value]="3">3 items</mat-option>
                    <mat-option [value]="5">5 items</mat-option>
                    <mat-option [value]="10">10 items</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-slide-toggle
                  [ngModel]="listShowIcons()"
                  (ngModelChange)="listShowIcons.set($event)"
                >
                  Show Icons
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="listShowMeta()"
                  (ngModelChange)="listShowMeta.set($event)"
                >
                  Show Meta
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="listDivided()"
                  (ngModelChange)="listDivided.set($event)"
                >
                  Show Dividers
                </mat-slide-toggle>

                <mat-slide-toggle
                  [ngModel]="listCompact()"
                  (ngModelChange)="listCompact.set($event)"
                >
                  Compact Mode
                </mat-slide-toggle>
              </div>
            }
          }
        </div>
      </div>

      <!-- Code Output -->
      <div class="widget-showcase__code">
        <div class="panel-header">
          <mat-icon>code</mat-icon>
          <h3>Generated Code</h3>
          <button
            mat-icon-button
            matTooltip="Copy to clipboard"
            (click)="copyCode()"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
        <ax-code-tabs [tabs]="generatedCodeTabs()"></ax-code-tabs>
      </div>
    </div>
  `,
  styles: [
    `
      .widget-showcase {
        margin-top: var(--ax-spacing-lg, 1rem);
      }

      .widget-showcase__selector {
        margin-bottom: var(--ax-spacing-lg, 1rem);

        mat-form-field {
          width: 300px;
        }

        mat-icon {
          margin-right: 8px;
          font-size: 20px;
          width: 20px;
          height: 20px;
          vertical-align: middle;
        }
      }

      .widget-showcase__layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: var(--ax-spacing-lg, 1rem);
        margin-bottom: var(--ax-spacing-lg, 1rem);

        @media (max-width: 1024px) {
          grid-template-columns: 1fr;
        }
      }

      .widget-showcase__preview,
      .widget-showcase__config,
      .widget-showcase__code {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg, 0.75rem);
        padding: var(--ax-spacing-lg, 1rem);
      }

      .panel-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        margin-bottom: var(--ax-spacing-md, 0.75rem);
        padding-bottom: var(--ax-spacing-sm, 0.5rem);
        border-bottom: 1px solid var(--ax-border-muted);

        mat-icon {
          color: var(--ax-primary-default);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        h3 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          flex: 1;
        }

        button {
          margin-left: auto;
        }
      }

      .preview-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
        padding: var(--ax-spacing-lg, 1rem);
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md, 0.5rem);
      }

      .preview-widget {
        &--kpi {
          width: 280px;
        }

        &--progress {
          width: 240px;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &--chart {
          width: 100%;
          max-width: 500px;
          height: 280px;
        }

        &--table {
          width: 100%;
          max-width: 600px;
        }

        &--list {
          width: 100%;
          max-width: 400px;
        }
      }

      .config-form {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-sm, 0.5rem);

        mat-form-field {
          width: 100%;
        }

        mat-slide-toggle {
          margin: var(--ax-spacing-xs, 0.25rem) 0;
        }
      }

      .widget-showcase__code {
        margin-top: var(--ax-spacing-lg, 1rem);
      }
    `,
  ],
})
export class WidgetShowcaseComponent {
  // Selected widget type
  selectedWidget = signal<WidgetType>('kpi');

  // ============================================================
  // KPI Widget Configuration
  // ============================================================
  kpiTitle = signal('Revenue');
  kpiSubtitle = signal('This month');
  kpiIcon = signal('attach_money');
  kpiFormat = signal<'number' | 'currency' | 'percent'>('currency');
  kpiColor = signal<'primary' | 'success' | 'warning' | 'error'>('primary');
  kpiValue = signal(125750);
  kpiShowTrend = signal(true);
  kpiCompact = signal(false);

  kpiConfig = computed<KpiWidgetConfig>(() => {
    const config: KpiWidgetConfig = {
      title: this.kpiTitle(),
      subtitle: this.kpiSubtitle(),
      icon: this.kpiIcon(),
      format: this.kpiFormat(),
      color: this.kpiColor(),
      showTrend: this.kpiShowTrend(),
      compact: this.kpiCompact(),
    };
    return config;
  });

  kpiData = computed<KpiWidgetData>(() => ({
    value: this.kpiValue(),
    change: 12.5,
    changeIsPercent: true,
    trend: 'up' as const,
    previousLabel: 'vs last month',
  }));

  // ============================================================
  // Progress Widget Configuration
  // ============================================================
  progressTitle = signal('Storage Used');
  progressType = signal<'circular' | 'gauge' | 'linear'>('circular');
  progressColor = signal<'primary' | 'success' | 'warning' | 'error'>(
    'primary',
  );
  progressValue = signal(68);
  progressShowPercent = signal(true);
  progressShowLabel = signal(true);

  progressConfig = computed<ProgressWidgetConfig>(() => ({
    title: this.progressTitle(),
    type: this.progressType(),
    color: this.progressColor(),
    showPercent: this.progressShowPercent(),
    showLabel: this.progressShowLabel(),
  }));

  progressData = computed<ProgressWidgetData>(() => ({
    value: this.progressValue(),
    max: 100,
    label: `${this.progressValue()} GB of 100 GB`,
  }));

  // ============================================================
  // Chart Widget Configuration
  // ============================================================
  chartTitle = signal('Monthly Sales');
  chartType = signal<'line' | 'bar' | 'donut'>('line');
  chartShowLegend = signal(true);
  chartCompact = signal(false);

  chartConfig = computed<ChartWidgetConfig>(() => ({
    title: this.chartTitle(),
    type: this.chartType(),
    showLegend: this.chartShowLegend(),
  }));

  chartData = computed<ChartWidgetData>(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      {
        name: 'Revenue',
        data: [42000, 38000, 45000, 51000, 48000, 55000],
        color: '#6366f1',
      },
      {
        name: 'Expenses',
        data: [28000, 32000, 30000, 35000, 33000, 38000],
        color: '#f59e0b',
      },
    ],
  }));

  // ============================================================
  // Table Widget Configuration
  // ============================================================
  tableTitle = signal('Recent Transactions');
  tablePageSize = signal(5);
  tableSortable = signal(true);
  tableStriped = signal(false);
  tableCompact = signal(false);

  tableConfig = computed<TableWidgetConfig>(() => ({
    title: this.tableTitle(),
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'customer', label: 'Customer' },
      { key: 'amount', label: 'Amount', align: 'right' as const },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
    pageSize: this.tablePageSize(),
    sortable: this.tableSortable(),
    striped: this.tableStriped(),
    compact: this.tableCompact(),
  }));

  tableData = computed<TableWidgetData>(() => ({
    items: [
      {
        id: 'TXN001',
        customer: 'John Smith',
        amount: '$1,250.00',
        status: 'completed',
        date: '1/15/2024',
      },
      {
        id: 'TXN002',
        customer: 'Jane Doe',
        amount: '$890.50',
        status: 'pending',
        date: '1/14/2024',
      },
      {
        id: 'TXN003',
        customer: 'Bob Wilson',
        amount: '$2,100.00',
        status: 'completed',
        date: '1/14/2024',
      },
      {
        id: 'TXN004',
        customer: 'Alice Brown',
        amount: '$450.25',
        status: 'error',
        date: '1/13/2024',
      },
      {
        id: 'TXN005',
        customer: 'Charlie Davis',
        amount: '$1,780.00',
        status: 'completed',
        date: '1/12/2024',
      },
    ],
    total: 5,
  }));

  // ============================================================
  // List Widget Configuration
  // ============================================================
  listTitle = signal('Recent Activities');
  listMaxItems = signal(5);
  listShowIcons = signal(true);
  listShowMeta = signal(true);
  listDivided = signal(true);
  listCompact = signal(false);

  listConfig = computed<ListWidgetConfig>(() => ({
    title: this.listTitle(),
    maxItems: this.listMaxItems(),
    showIcons: this.listShowIcons(),
    showMeta: this.listShowMeta(),
    divided: this.listDivided(),
    compact: this.listCompact(),
  }));

  listData = computed<ListWidgetData>(() => ({
    items: [
      {
        id: '1',
        title: 'New order received',
        subtitle: 'Order #12345 from John Smith',
        icon: 'shopping_cart',
        iconColor: '#6366f1',
        status: 'active' as const,
        meta: '2 min ago',
      },
      {
        id: '2',
        title: 'Payment processed',
        subtitle: '$1,250.00 via Credit Card',
        icon: 'payment',
        iconColor: '#10b981',
        status: 'completed' as const,
        meta: '15 min ago',
      },
      {
        id: '3',
        title: 'User registered',
        subtitle: 'jane.doe@example.com',
        icon: 'person_add',
        iconColor: '#6366f1',
        status: 'active' as const,
        meta: '1 hour ago',
      },
      {
        id: '4',
        title: 'Stock alert',
        subtitle: 'Product SKU-001 is low',
        icon: 'warning',
        iconColor: '#f59e0b',
        status: 'warning' as const,
        meta: '2 hours ago',
      },
      {
        id: '5',
        title: 'Report generated',
        subtitle: 'Monthly sales report',
        icon: 'description',
        iconColor: '#10b981',
        status: 'completed' as const,
        meta: '3 hours ago',
      },
    ],
  }));

  // ============================================================
  // Generated Code - All computed for reactivity
  // ============================================================
  kpiCodeTabs = computed<CodeTab[]>(() => [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// KPI Widget Configuration
import { KpiWidgetConfig, KpiWidgetData } from '@aegisx/ui';

const config: KpiWidgetConfig = ${JSON.stringify(this.kpiConfig(), null, 2)};

const data: KpiWidgetData = ${JSON.stringify(this.kpiData(), null, 2)};`,
    },
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-kpi-widget
  [instanceId]="'my-kpi'"
  [config]="config"
  [initialData]="data"
></ax-kpi-widget>`,
    },
  ]);

  progressCodeTabs = computed<CodeTab[]>(() => [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// Progress Widget Configuration
import { ProgressWidgetConfig, ProgressWidgetData } from '@aegisx/ui';

const config: ProgressWidgetConfig = ${JSON.stringify(this.progressConfig(), null, 2)};

const data: ProgressWidgetData = ${JSON.stringify(this.progressData(), null, 2)};`,
    },
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-progress-widget
  [instanceId]="'my-progress'"
  [config]="config"
  [initialData]="data"
></ax-progress-widget>`,
    },
  ]);

  chartCodeTabs = computed<CodeTab[]>(() => [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// Chart Widget Configuration
import { ChartWidgetConfig, ChartWidgetData } from '@aegisx/ui';

const config: ChartWidgetConfig = ${JSON.stringify(this.chartConfig(), null, 2)};

const data: ChartWidgetData = ${JSON.stringify(this.chartData(), null, 2)};`,
    },
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-chart-widget
  [instanceId]="'my-chart'"
  [config]="config"
  [initialData]="data"
></ax-chart-widget>`,
    },
  ]);

  tableCodeTabs = computed<CodeTab[]>(() => [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// Table Widget Configuration
import { TableWidgetConfig, TableWidgetData } from '@aegisx/ui';

const config: TableWidgetConfig = ${JSON.stringify(this.tableConfig(), null, 2)};

const data: TableWidgetData = ${JSON.stringify(this.tableData(), null, 2)};`,
    },
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-table-widget
  [instanceId]="'my-table'"
  [config]="config"
  [initialData]="data"
></ax-table-widget>`,
    },
  ]);

  listCodeTabs = computed<CodeTab[]>(() => [
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `// List Widget Configuration
import { ListWidgetConfig, ListWidgetData } from '@aegisx/ui';

const config: ListWidgetConfig = ${JSON.stringify(this.listConfig(), null, 2)};

const data: ListWidgetData = ${JSON.stringify(this.listData(), null, 2)};`,
    },
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-list-widget
  [instanceId]="'my-list'"
  [config]="config"
  [initialData]="data"
></ax-list-widget>`,
    },
  ]);

  // Main computed that switches between widget types
  generatedCodeTabs = computed<CodeTab[]>(() => {
    switch (this.selectedWidget()) {
      case 'kpi':
        return this.kpiCodeTabs();
      case 'progress':
        return this.progressCodeTabs();
      case 'chart':
        return this.chartCodeTabs();
      case 'table':
        return this.tableCodeTabs();
      case 'list':
        return this.listCodeTabs();
      default:
        return [];
    }
  });

  copyCode(): void {
    const tabs = this.generatedCodeTabs();
    const fullCode = tabs.map((t) => `// ${t.label}\n${t.code}`).join('\n\n');
    navigator.clipboard.writeText(fullCode);
  }
}
