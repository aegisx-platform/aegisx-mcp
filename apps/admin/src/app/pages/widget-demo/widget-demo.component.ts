import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { CodeTabsComponent } from '../../components/docs/code-tabs/code-tabs.component';
import { CodeTab } from '../../types/docs.types';
import {
  AxEnterpriseLayoutComponent,
  AxNavigationItem,
  AxBreadcrumbComponent,
  BreadcrumbItem,
  // Widget components
  KpiWidgetComponent,
  KpiWidgetConfig,
  KpiWidgetData,
  KpiFormat,
  KpiColor,
  KpiTrend,
  ChartWidgetComponent,
  ChartWidgetConfig,
  ChartWidgetData,
  ChartType,
  TableWidgetComponent,
  TableWidgetConfig,
  TableWidgetData,
  ListWidgetComponent,
  ListWidgetConfig,
  ListWidgetData,
  ProgressWidgetComponent,
  ProgressWidgetConfig,
  ProgressWidgetData,
  ProgressType,
  ProgressColor,
} from '@aegisx/ui';

type ConfigurableWidgetType = 'kpi' | 'progress' | 'chart' | 'table' | 'list';

@Component({
  selector: 'app-widget-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDividerModule,
    AxEnterpriseLayoutComponent,
    AxBreadcrumbComponent,
    // Widget components
    KpiWidgetComponent,
    ChartWidgetComponent,
    TableWidgetComponent,
    ListWidgetComponent,
    ProgressWidgetComponent,
    // Code tabs
    CodeTabsComponent,
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

            <!-- Widget Configurator Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>tune</mat-icon>
                <span>Configurator</span>
              </ng-template>
              <div class="tab-content">
                <div class="info-banner">
                  <mat-icon>edit</mat-icon>
                  <span>Configure widgets in real-time and see changes instantly</span>
                </div>

                <div class="configurator-layout">
                  <!-- Preview Panel (Left) -->
                  <div class="preview-panel">
                    <div class="panel-header">
                      <mat-icon>visibility</mat-icon>
                      <h3>Live Preview</h3>
                    </div>

                    <div class="preview-container">
                      @switch (selectedWidgetType()) {
                        @case ('kpi') {
                          <div class="preview-widget preview-widget--kpi">
                            <ax-kpi-widget
                              [instanceId]="'kpi-configurator'"
                              [config]="kpiConfig()"
                              [initialData]="kpiData()"
                            ></ax-kpi-widget>
                          </div>
                        }
                        @case ('progress') {
                          <div class="preview-widget preview-widget--progress">
                            <ax-progress-widget
                              [instanceId]="'progress-configurator'"
                              [config]="progressConfig()"
                              [initialData]="progressData()"
                            ></ax-progress-widget>
                          </div>
                        }
                        @case ('chart') {
                          <div class="preview-widget preview-widget--chart">
                            <ax-chart-widget
                              [instanceId]="'chart-configurator'"
                              [config]="chartConfigSignal()"
                              [initialData]="chartDataSignal()"
                            ></ax-chart-widget>
                          </div>
                        }
                        @case ('table') {
                          <div class="preview-widget preview-widget--table">
                            <ax-table-widget
                              [instanceId]="'table-configurator'"
                              [config]="tableConfigSignal()"
                              [initialData]="tableDataSignal()"
                            ></ax-table-widget>
                          </div>
                        }
                        @case ('list') {
                          <div class="preview-widget preview-widget--list">
                            <ax-list-widget
                              [instanceId]="'list-configurator'"
                              [config]="listConfigSignal()"
                              [initialData]="listDataSignal()"
                            ></ax-list-widget>
                          </div>
                        }
                      }
                    </div>

                    <!-- Code Preview using CodeTabsComponent -->
                    <ax-code-tabs [tabs]="configCodeTabs()"></ax-code-tabs>
                  </div>

                  <!-- Config Panel (Right) -->
                  <div class="config-panel">
                    <div class="panel-header">
                      <mat-icon>settings</mat-icon>
                      <h3>Widget Configuration</h3>
                    </div>

                    <!-- Widget Type Selector -->
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Widget Type</mat-label>
                      <mat-select [value]="selectedWidgetType()" (selectionChange)="selectedWidgetType.set($event.value)">
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

                    <mat-divider></mat-divider>

                    <!-- KPI Config -->
                    @if (selectedWidgetType() === 'kpi') {
                      <div class="config-section">
                        <h4>Display Settings</h4>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Title</mat-label>
                          <input matInput [value]="kpiConfig().title" (input)="updateKpiConfig('title', $any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Subtitle</mat-label>
                          <input matInput [value]="kpiConfig().subtitle || ''" (input)="updateKpiConfig('subtitle', $any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Icon</mat-label>
                          <mat-select [value]="kpiConfig().icon" (selectionChange)="updateKpiConfig('icon', $event.value)">
                            <mat-option value="attach_money">attach_money</mat-option>
                            <mat-option value="people">people</mat-option>
                            <mat-option value="shopping_cart">shopping_cart</mat-option>
                            <mat-option value="trending_up">trending_up</mat-option>
                            <mat-option value="analytics">analytics</mat-option>
                            <mat-option value="bar_chart">bar_chart</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Format</mat-label>
                          <mat-select [value]="kpiConfig().format" (selectionChange)="updateKpiConfig('format', $event.value)">
                            <mat-option value="number">Number</mat-option>
                            <mat-option value="currency">Currency</mat-option>
                            <mat-option value="percent">Percent</mat-option>
                            <mat-option value="compact">Compact</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Color</mat-label>
                          <mat-select [value]="kpiConfig().color" (selectionChange)="updateKpiConfig('color', $event.value)">
                            <mat-option value="default">Default</mat-option>
                            <mat-option value="primary">Primary</mat-option>
                            <mat-option value="success">Success</mat-option>
                            <mat-option value="warning">Warning</mat-option>
                            <mat-option value="error">Error</mat-option>
                            <mat-option value="info">Info</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-slide-toggle
                          [checked]="kpiConfig().showTrend"
                          (change)="updateKpiConfig('showTrend', $event.checked)"
                        >
                          Show Trend
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="kpiConfig().compact"
                          (change)="updateKpiConfig('compact', $event.checked)"
                        >
                          Compact Mode
                        </mat-slide-toggle>
                      </div>

                      <mat-divider></mat-divider>

                      <div class="config-section">
                        <h4>Data Settings</h4>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Value</mat-label>
                          <input matInput type="number" [value]="kpiData().value" (input)="updateKpiData('value', +$any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Change (%)</mat-label>
                          <input matInput type="number" step="0.1" [value]="kpiData().change" (input)="updateKpiData('change', +$any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Trend</mat-label>
                          <mat-select [value]="kpiData().trend" (selectionChange)="updateKpiData('trend', $event.value)">
                            <mat-option value="up">Up</mat-option>
                            <mat-option value="down">Down</mat-option>
                            <mat-option value="neutral">Neutral</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    }

                    <!-- Progress Config -->
                    @if (selectedWidgetType() === 'progress') {
                      <div class="config-section">
                        <h4>Display Settings</h4>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Title</mat-label>
                          <input matInput [value]="progressConfig().title" (input)="updateProgressConfig('title', $any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Type</mat-label>
                          <mat-select [value]="progressConfig().type" (selectionChange)="updateProgressConfig('type', $event.value)">
                            <mat-option value="circular">Circular</mat-option>
                            <mat-option value="linear">Linear</mat-option>
                            <mat-option value="gauge">Gauge</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Color</mat-label>
                          <mat-select [value]="progressConfig().color" (selectionChange)="updateProgressConfig('color', $event.value)">
                            <mat-option value="primary">Primary</mat-option>
                            <mat-option value="success">Success</mat-option>
                            <mat-option value="warning">Warning</mat-option>
                            <mat-option value="error">Error</mat-option>
                            <mat-option value="info">Info</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-slide-toggle
                          [checked]="progressConfig().showPercent"
                          (change)="updateProgressConfig('showPercent', $event.checked)"
                        >
                          Show Percent
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="progressConfig().showLabel"
                          (change)="updateProgressConfig('showLabel', $event.checked)"
                        >
                          Show Label
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="progressConfig().autoColor"
                          (change)="updateProgressConfig('autoColor', $event.checked)"
                        >
                          Auto Color (by threshold)
                        </mat-slide-toggle>
                      </div>

                      <mat-divider></mat-divider>

                      <div class="config-section">
                        <h4>Data Settings</h4>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Value (0-100)</mat-label>
                          <input matInput type="number" min="0" max="100" [value]="progressData().value" (input)="updateProgressData('value', +$any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Label</mat-label>
                          <input matInput [value]="progressData().label || ''" (input)="updateProgressData('label', $any($event.target).value)" />
                        </mat-form-field>

                        <div class="slider-container">
                          <label>Value: {{ progressData().value }}%</label>
                          <mat-slider min="0" max="100" step="1" discrete>
                            <input matSliderThumb [value]="progressData().value" (valueChange)="updateProgressData('value', $event)" />
                          </mat-slider>
                        </div>
                      </div>
                    }

                    <!-- Chart Config -->
                    @if (selectedWidgetType() === 'chart') {
                      <div class="config-section">
                        <h4>Display Settings</h4>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Title</mat-label>
                          <input matInput [value]="chartConfigSignal().title" (input)="updateChartConfig('title', $any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Chart Type</mat-label>
                          <mat-select [value]="chartConfigSignal().type" (selectionChange)="updateChartConfig('type', $event.value)">
                            <mat-option value="line">Line</mat-option>
                            <mat-option value="bar">Bar</mat-option>
                            <mat-option value="donut">Donut</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-slide-toggle
                          [checked]="chartConfigSignal().showLegend"
                          (change)="updateChartConfig('showLegend', $event.checked)"
                        >
                          Show Legend
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="chartConfigSignal().showGrid"
                          (change)="updateChartConfig('showGrid', $event.checked)"
                        >
                          Show Grid
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="chartConfigSignal().smooth"
                          (change)="updateChartConfig('smooth', $event.checked)"
                        >
                          Smooth Line
                        </mat-slide-toggle>
                      </div>
                    }

                    <!-- Table Config -->
                    @if (selectedWidgetType() === 'table') {
                      <div class="config-section">
                        <h4>Display Settings</h4>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Title</mat-label>
                          <input matInput [value]="tableConfigSignal().title" (input)="updateTableConfig('title', $any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Page Size</mat-label>
                          <mat-select [value]="tableConfigSignal().pageSize" (selectionChange)="updateTableConfig('pageSize', $event.value)">
                            <mat-option [value]="3">3 rows</mat-option>
                            <mat-option [value]="5">5 rows</mat-option>
                            <mat-option [value]="10">10 rows</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-slide-toggle
                          [checked]="tableConfigSignal().showPagination"
                          (change)="updateTableConfig('showPagination', $event.checked)"
                        >
                          Show Pagination
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="tableConfigSignal().striped"
                          (change)="updateTableConfig('striped', $event.checked)"
                        >
                          Striped Rows
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="tableConfigSignal().sortable"
                          (change)="updateTableConfig('sortable', $event.checked)"
                        >
                          Sortable
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="tableConfigSignal().compact"
                          (change)="updateTableConfig('compact', $event.checked)"
                        >
                          Compact Mode
                        </mat-slide-toggle>
                      </div>
                    }

                    <!-- List Config -->
                    @if (selectedWidgetType() === 'list') {
                      <div class="config-section">
                        <h4>Display Settings</h4>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Title</mat-label>
                          <input matInput [value]="listConfigSignal().title" (input)="updateListConfig('title', $any($event.target).value)" />
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Max Items</mat-label>
                          <mat-select [value]="listConfigSignal().maxItems" (selectionChange)="updateListConfig('maxItems', $event.value)">
                            <mat-option [value]="3">3 items</mat-option>
                            <mat-option [value]="5">5 items</mat-option>
                            <mat-option [value]="10">10 items</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-slide-toggle
                          [checked]="listConfigSignal().showIcons"
                          (change)="updateListConfig('showIcons', $event.checked)"
                        >
                          Show Icons
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="listConfigSignal().showMeta"
                          (change)="updateListConfig('showMeta', $event.checked)"
                        >
                          Show Meta
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="listConfigSignal().divided"
                          (change)="updateListConfig('divided', $event.checked)"
                        >
                          Show Dividers
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="listConfigSignal().clickable"
                          (change)="updateListConfig('clickable', $event.checked)"
                        >
                          Clickable
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="listConfigSignal().compact"
                          (change)="updateListConfig('compact', $event.checked)"
                        >
                          Compact Mode
                        </mat-slide-toggle>
                      </div>
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
          min-width: 140px;
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

      /* Configurator Layout - Preview left, Config right */
      .configurator-layout {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 1.5rem;

        @media (max-width: 1024px) {
          grid-template-columns: 1fr;
        }
      }

      .config-panel,
      .preview-panel {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        padding: 1.25rem;
      }

      .panel-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--ax-border-muted);

        mat-icon {
          color: var(--ax-primary-default);
        }

        h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }
      }

      .config-section {
        margin: 1rem 0;

        h4 {
          margin: 0 0 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .full-width {
        width: 100%;
        margin-bottom: 0.5rem;
      }

      mat-slide-toggle {
        display: block;
        margin: 0.75rem 0;
      }

      .slider-container {
        margin: 1rem 0;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }

        mat-slider {
          width: 100%;
        }
      }

      /* Preview Panel */
      .preview-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 280px;
        padding: 2rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        margin-bottom: 1.5rem;
      }

      .preview-widget {
        &--kpi {
          width: 280px;
        }

        &--progress {
          width: 240px;
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &--chart {
          width: 100%;
          max-width: 500px;
          height: 300px;
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

  // ============================================================================
  // Configurator State
  // ============================================================================

  selectedWidgetType = signal<ConfigurableWidgetType>('kpi');

  // KPI Configurator
  kpiConfig = signal<KpiWidgetConfig>({
    title: 'Revenue',
    subtitle: 'This month',
    icon: 'attach_money',
    format: 'currency',
    currency: 'USD',
    showTrend: true,
    color: 'primary',
    compact: false,
  });

  kpiData = signal<KpiWidgetData>({
    value: 125840,
    change: 12.5,
    trend: 'up',
    previousLabel: 'vs last month',
  });

  // Progress Configurator
  progressConfig = signal<ProgressWidgetConfig>({
    title: 'Storage Used',
    type: 'circular',
    max: 100,
    showLabel: true,
    showPercent: true,
    color: 'primary',
    autoColor: false,
    thresholds: { warning: 70, error: 90 },
  });

  progressData = signal<ProgressWidgetData>({
    value: 68,
    label: '68 GB of 100 GB',
  });

  // Chart Configurator
  chartConfigSignal = signal<ChartWidgetConfig>({
    title: 'Monthly Sales',
    type: 'line',
    showLegend: true,
    showGrid: true,
    smooth: true,
  });

  chartDataSignal = signal<ChartWidgetData>({
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
  });

  // Table Configurator
  tableConfigSignal = signal<TableWidgetConfig>({
    title: 'Recent Transactions',
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'customer', label: 'Customer' },
      { key: 'amount', label: 'Amount', align: 'right' as const },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
    pageSize: 5,
    showPagination: true,
    striped: true,
    sortable: true,
    compact: false,
  });

  tableDataSignal = signal<TableWidgetData>({
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
  });

  // List Configurator
  listConfigSignal = signal<ListWidgetConfig>({
    title: 'Recent Activities',
    maxItems: 5,
    showIcons: true,
    showMeta: true,
    clickable: true,
    divided: true,
    compact: false,
  });

  listDataSignal = signal<ListWidgetData>({
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
  });

  // Config code tabs output - supports all widget types
  configCodeTabs = computed<CodeTab[]>(() => {
    switch (this.selectedWidgetType()) {
      case 'kpi':
        return [
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `// KPI Widget Configuration
const config: KpiWidgetConfig = ${JSON.stringify(this.kpiConfig(), null, 2)};

const data: KpiWidgetData = ${JSON.stringify(this.kpiData(), null, 2)};`,
          },
          {
            label: 'HTML',
            language: 'html',
            code: `<ax-kpi-widget
  [instanceId]="'my-kpi'"
  [config]="config"
  [initialData]="data"
></ax-kpi-widget>`,
          },
        ];
      case 'progress':
        return [
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `// Progress Widget Configuration
const config: ProgressWidgetConfig = ${JSON.stringify(this.progressConfig(), null, 2)};

const data: ProgressWidgetData = ${JSON.stringify(this.progressData(), null, 2)};`,
          },
          {
            label: 'HTML',
            language: 'html',
            code: `<ax-progress-widget
  [instanceId]="'my-progress'"
  [config]="config"
  [initialData]="data"
></ax-progress-widget>`,
          },
        ];
      case 'chart':
        return [
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `// Chart Widget Configuration
const config: ChartWidgetConfig = ${JSON.stringify(this.chartConfigSignal(), null, 2)};

const data: ChartWidgetData = ${JSON.stringify(this.chartDataSignal(), null, 2)};`,
          },
          {
            label: 'HTML',
            language: 'html',
            code: `<ax-chart-widget
  [instanceId]="'my-chart'"
  [config]="config"
  [initialData]="data"
></ax-chart-widget>`,
          },
        ];
      case 'table':
        return [
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `// Table Widget Configuration
const config: TableWidgetConfig = ${JSON.stringify(this.tableConfigSignal(), null, 2)};

const data: TableWidgetData = ${JSON.stringify(this.tableDataSignal(), null, 2)};`,
          },
          {
            label: 'HTML',
            language: 'html',
            code: `<ax-table-widget
  [instanceId]="'my-table'"
  [config]="config"
  [initialData]="data"
></ax-table-widget>`,
          },
        ];
      case 'list':
        return [
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `// List Widget Configuration
const config: ListWidgetConfig = ${JSON.stringify(this.listConfigSignal(), null, 2)};

const data: ListWidgetData = ${JSON.stringify(this.listDataSignal(), null, 2)};`,
          },
          {
            label: 'HTML',
            language: 'html',
            code: `<ax-list-widget
  [instanceId]="'my-list'"
  [config]="config"
  [initialData]="data"
></ax-list-widget>`,
          },
        ];
      default:
        return [];
    }
  });

  updateKpiConfig<K extends keyof KpiWidgetConfig>(
    key: K,
    value: KpiWidgetConfig[K],
  ): void {
    this.kpiConfig.update((config) => ({ ...config, [key]: value }));
  }

  updateKpiData<K extends keyof KpiWidgetData>(
    key: K,
    value: KpiWidgetData[K],
  ): void {
    this.kpiData.update((data) => ({ ...data, [key]: value }));
  }

  updateProgressConfig<K extends keyof ProgressWidgetConfig>(
    key: K,
    value: ProgressWidgetConfig[K],
  ): void {
    this.progressConfig.update((config) => ({ ...config, [key]: value }));
  }

  updateProgressData<K extends keyof ProgressWidgetData>(
    key: K,
    value: ProgressWidgetData[K],
  ): void {
    this.progressData.update((data) => ({ ...data, [key]: value }));
  }

  updateChartConfig<K extends keyof ChartWidgetConfig>(
    key: K,
    value: ChartWidgetConfig[K],
  ): void {
    this.chartConfigSignal.update((config) => ({ ...config, [key]: value }));
  }

  updateTableConfig<K extends keyof TableWidgetConfig>(
    key: K,
    value: TableWidgetConfig[K],
  ): void {
    this.tableConfigSignal.update((config) => ({ ...config, [key]: value }));
  }

  updateListConfig<K extends keyof ListWidgetConfig>(
    key: K,
    value: ListWidgetConfig[K],
  ): void {
    this.listConfigSignal.update((config) => ({ ...config, [key]: value }));
  }

  // ============================================================================
  // Static Demo Data
  // ============================================================================

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
