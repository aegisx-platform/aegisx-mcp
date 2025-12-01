import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../components/docs';
import { CodeTab, ComponentToken } from '../../../../types/docs.types';

@Component({
  selector: 'ax-ngx-charts-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    NgxChartsModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="ngx-charts-doc">
      <ax-doc-header
        title="NGX Charts"
        icon="bar_chart"
        description="Declarative charting framework for Angular using D3.js. Create beautiful, responsive, and animated data visualizations."
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'NGX Charts' },
        ]"
        status="stable"
        version="23.1.0"
        importStatement="import { NgxChartsModule } from '@swimlane/ngx-charts';"
      ></ax-doc-header>

      <!-- Library Reference -->
      <div class="library-reference">
        <mat-icon>info</mat-icon>
        <span>
          This integration uses
          <a
            href="https://github.com/swimlane/ngx-charts"
            target="_blank"
            rel="noopener"
          >
            &#64;swimlane/ngx-charts
          </a>
          library by Swimlane (MIT License)
        </span>
      </div>

      <mat-tab-group class="ngx-charts-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="ngx-charts-doc__tab-content">
            <section class="ngx-charts-doc__section">
              <h2>Line Chart</h2>
              <p>Display trends over time with smooth animated line charts.</p>

              <ax-live-preview variant="bordered" minHeight="350px">
                <div class="chart-container">
                  <ngx-charts-line-chart
                    [results]="lineChartData"
                    [xAxis]="true"
                    [yAxis]="true"
                    [showXAxisLabel]="true"
                    [showYAxisLabel]="true"
                    xAxisLabel="Month"
                    yAxisLabel="Sales"
                    [legend]="showLegend()"
                    [gradient]="gradient()"
                    [animations]="true"
                    [scheme]="colorScheme()"
                  >
                  </ngx-charts-line-chart>
                </div>
              </ax-live-preview>

              <div class="demo-controls">
                <mat-slide-toggle
                  [checked]="showLegend()"
                  (change)="showLegend.set($event.checked)"
                >
                  Show Legend
                </mat-slide-toggle>

                <mat-slide-toggle
                  [checked]="gradient()"
                  (change)="gradient.set($event.checked)"
                >
                  Gradient Fill
                </mat-slide-toggle>

                <mat-form-field appearance="outline">
                  <mat-label>Color Scheme</mat-label>
                  <mat-select
                    [value]="colorScheme()"
                    (selectionChange)="colorScheme.set($event.value)"
                  >
                    <mat-option value="vivid">Vivid</mat-option>
                    <mat-option value="natural">Natural</mat-option>
                    <mat-option value="cool">Cool</mat-option>
                    <mat-option value="fire">Fire</mat-option>
                    <mat-option value="solar">Solar</mat-option>
                    <mat-option value="nightLights">Night Lights</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <ax-code-tabs [tabs]="lineChartCode"></ax-code-tabs>
            </section>

            <section class="ngx-charts-doc__section">
              <h2>Bar Charts</h2>
              <p>Compare categories with vertical or horizontal bar charts.</p>

              <div class="chart-grid">
                <div class="chart-card">
                  <h4>Vertical Bar Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="300px">
                    <div class="chart-container-sm">
                      <ngx-charts-bar-vertical
                        [results]="barChartData"
                        [xAxis]="true"
                        [yAxis]="true"
                        [legend]="false"
                        [gradient]="true"
                        [scheme]="'vivid'"
                      >
                      </ngx-charts-bar-vertical>
                    </div>
                  </ax-live-preview>
                </div>

                <div class="chart-card">
                  <h4>Grouped Bar Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="300px">
                    <div class="chart-container-sm">
                      <ngx-charts-bar-vertical-2d
                        [results]="groupedBarData"
                        [xAxis]="true"
                        [yAxis]="true"
                        [legend]="true"
                        [scheme]="'cool'"
                      >
                      </ngx-charts-bar-vertical-2d>
                    </div>
                  </ax-live-preview>
                </div>
              </div>

              <ax-code-tabs [tabs]="barChartCode"></ax-code-tabs>
            </section>

            <section class="ngx-charts-doc__section">
              <h2>Pie & Donut Charts</h2>
              <p>Show proportions and percentages with circular charts.</p>

              <div class="chart-grid">
                <div class="chart-card">
                  <h4>Pie Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="300px">
                    <div class="chart-container-sm">
                      <ngx-charts-pie-chart
                        [results]="pieChartData"
                        [legend]="true"
                        [labels]="true"
                        [scheme]="'vivid'"
                        [doughnut]="false"
                      >
                      </ngx-charts-pie-chart>
                    </div>
                  </ax-live-preview>
                </div>

                <div class="chart-card">
                  <h4>Donut Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="300px">
                    <div class="chart-container-sm">
                      <ngx-charts-pie-chart
                        [results]="pieChartData"
                        [legend]="true"
                        [labels]="false"
                        [scheme]="'cool'"
                        [doughnut]="true"
                        [arcWidth]="0.4"
                      >
                      </ngx-charts-pie-chart>
                    </div>
                  </ax-live-preview>
                </div>
              </div>

              <ax-code-tabs [tabs]="pieChartCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="ngx-charts-doc__tab-content">
            <section class="ngx-charts-doc__section">
              <h2>Area Chart</h2>
              <p>Stacked area charts for showing cumulative values.</p>

              <ax-live-preview variant="bordered" minHeight="350px">
                <div class="chart-container">
                  <ngx-charts-area-chart-stacked
                    [results]="areaChartData"
                    [xAxis]="true"
                    [yAxis]="true"
                    [legend]="true"
                    [scheme]="'cool'"
                  >
                  </ngx-charts-area-chart-stacked>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="areaChartCode"></ax-code-tabs>
            </section>

            <section class="ngx-charts-doc__section">
              <h2>Gauge Chart</h2>
              <p>Display single values as gauges for KPIs and metrics.</p>

              <div class="chart-grid three-cols">
                <div class="chart-card">
                  <h4>Simple Gauge</h4>
                  <ax-live-preview variant="bordered" minHeight="250px">
                    <div class="gauge-container">
                      <ngx-charts-gauge
                        [results]="gaugeData"
                        [min]="0"
                        [max]="100"
                        [units]="'%'"
                        [scheme]="'vivid'"
                        [showAxis]="true"
                        [angleSpan]="240"
                        [startAngle]="-120"
                      >
                      </ngx-charts-gauge>
                    </div>
                  </ax-live-preview>
                </div>

                <div class="chart-card">
                  <h4>Number Card</h4>
                  <ax-live-preview variant="bordered" minHeight="250px">
                    <div class="gauge-container">
                      <ngx-charts-number-card
                        [results]="numberCardData"
                        [scheme]="'cool'"
                      >
                      </ngx-charts-number-card>
                    </div>
                  </ax-live-preview>
                </div>

                <div class="chart-card">
                  <h4>Linear Gauge</h4>
                  <ax-live-preview variant="bordered" minHeight="250px">
                    <div class="gauge-container">
                      <ngx-charts-linear-gauge
                        [value]="75"
                        [min]="0"
                        [max]="100"
                        [units]="'Progress'"
                        [scheme]="'fire'"
                      >
                      </ngx-charts-linear-gauge>
                    </div>
                  </ax-live-preview>
                </div>
              </div>

              <ax-code-tabs [tabs]="gaugeChartCode"></ax-code-tabs>
            </section>

            <section class="ngx-charts-doc__section">
              <h2>Real-time Data</h2>
              <p>Charts automatically animate when data changes.</p>

              <ax-live-preview variant="bordered" minHeight="300px">
                <div class="chart-container">
                  <ngx-charts-line-chart
                    [results]="realtimeData()"
                    [xAxis]="true"
                    [yAxis]="true"
                    [legend]="false"
                    [scheme]="'vivid'"
                    [animations]="true"
                  >
                  </ngx-charts-line-chart>
                </div>
              </ax-live-preview>

              <div class="demo-controls">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="updateRealtimeData()"
                >
                  <mat-icon>refresh</mat-icon>
                  Update Data
                </button>
              </div>

              <ax-code-tabs [tabs]="realtimeCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="ngx-charts-doc__tab-content">
            <section class="ngx-charts-doc__section">
              <h2>Common Inputs</h2>
              <p>These inputs are shared across most chart types.</p>

              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>results</code></td>
                      <td>any[]</td>
                      <td>-</td>
                      <td>Data to display (required)</td>
                    </tr>
                    <tr>
                      <td><code>scheme</code></td>
                      <td>string | ColorScheme</td>
                      <td>'vivid'</td>
                      <td>Color scheme name or custom scheme</td>
                    </tr>
                    <tr>
                      <td><code>legend</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show/hide legend</td>
                    </tr>
                    <tr>
                      <td><code>legendTitle</code></td>
                      <td>string</td>
                      <td>'Legend'</td>
                      <td>Title of the legend</td>
                    </tr>
                    <tr>
                      <td><code>xAxis</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show/hide x-axis</td>
                    </tr>
                    <tr>
                      <td><code>yAxis</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show/hide y-axis</td>
                    </tr>
                    <tr>
                      <td><code>showXAxisLabel</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show x-axis label</td>
                    </tr>
                    <tr>
                      <td><code>showYAxisLabel</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Show y-axis label</td>
                    </tr>
                    <tr>
                      <td><code>xAxisLabel</code></td>
                      <td>string</td>
                      <td>''</td>
                      <td>X-axis label text</td>
                    </tr>
                    <tr>
                      <td><code>yAxisLabel</code></td>
                      <td>string</td>
                      <td>''</td>
                      <td>Y-axis label text</td>
                    </tr>
                    <tr>
                      <td><code>gradient</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Enable gradient fill</td>
                    </tr>
                    <tr>
                      <td><code>animations</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Enable/disable animations</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="ngx-charts-doc__section">
              <h2>Data Format</h2>
              <p>Data format varies by chart type.</p>

              <ax-code-tabs [tabs]="dataFormatCode"></ax-code-tabs>
            </section>

            <section class="ngx-charts-doc__section">
              <h2>Color Schemes</h2>
              <p>Built-in color schemes available.</p>

              <div class="color-schemes">
                @for (scheme of colorSchemes; track scheme.name) {
                  <div class="color-scheme">
                    <span class="scheme-name">{{ scheme.name }}</span>
                    <div class="scheme-colors">
                      @for (color of scheme.colors; track color) {
                        <div
                          class="color-swatch"
                          [style.background]="color"
                        ></div>
                      }
                    </div>
                  </div>
                }
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="ngx-charts-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="ngx-charts-doc__tab-content">
            <section class="ngx-charts-doc__section">
              <h2>Chart Selection Guide</h2>

              <div class="chart-guide">
                <div class="guide-item">
                  <mat-icon>show_chart</mat-icon>
                  <div>
                    <strong>Line Chart</strong>
                    <p>Use for trends over time, continuous data</p>
                  </div>
                </div>
                <div class="guide-item">
                  <mat-icon>bar_chart</mat-icon>
                  <div>
                    <strong>Bar Chart</strong>
                    <p>Use for comparing categories, discrete data</p>
                  </div>
                </div>
                <div class="guide-item">
                  <mat-icon>pie_chart</mat-icon>
                  <div>
                    <strong>Pie/Donut Chart</strong>
                    <p>Use for parts of a whole, max 5-7 segments</p>
                  </div>
                </div>
                <div class="guide-item">
                  <mat-icon>area_chart</mat-icon>
                  <div>
                    <strong>Area Chart</strong>
                    <p>Use for cumulative totals, volume over time</p>
                  </div>
                </div>
                <div class="guide-item">
                  <mat-icon>speed</mat-icon>
                  <div>
                    <strong>Gauge Chart</strong>
                    <p>Use for single KPI values, progress indicators</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="ngx-charts-doc__section">
              <h2>Best Practices</h2>

              <div class="guidelines-grid">
                <div class="guideline guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use appropriate chart type for your data</li>
                    <li>Keep legends clear and concise</li>
                    <li>Use consistent color schemes</li>
                    <li>Add axis labels for clarity</li>
                    <li>Enable animations for better UX</li>
                  </ul>
                </div>

                <div class="guideline guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Overload with too many data series</li>
                    <li>Use 3D effects (prefer flat design)</li>
                    <li>Use pie charts for many categories</li>
                    <li>Disable animations unless necessary</li>
                    <li>Use rainbow color schemes</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .ngx-charts-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .library-reference {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--ax-info-faint);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;

        mat-icon {
          color: var(--ax-info-default);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        a {
          color: var(--ax-brand-default);
          font-weight: 500;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .ngx-charts-doc__tabs {
        margin-top: 1rem;
      }

      .ngx-charts-doc__tab-content {
        padding: 1.5rem 0;
      }

      .ngx-charts-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
      }

      .chart-container {
        width: 100%;
        height: 300px;
      }

      .chart-container-sm {
        width: 100%;
        height: 250px;
      }

      .gauge-container {
        width: 100%;
        height: 200px;
      }

      .chart-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        &.three-cols {
          grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 768px) {
          grid-template-columns: 1fr;

          &.three-cols {
            grid-template-columns: 1fr;
          }
        }
      }

      .chart-card {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
        padding: 1rem;

        h4 {
          margin: 0 0 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }
      }

      .demo-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        margin: 1rem 0;

        mat-form-field {
          min-width: 150px;
        }
      }

      .api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;

          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--ax-border-default);
          }

          th {
            font-weight: 600;
            color: var(--ax-text-heading);
            background: var(--ax-background-subtle);
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-size: 0.8125rem;
          }

          tr:last-child td {
            border-bottom: none;
          }
        }
      }

      .color-schemes {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .color-scheme {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: var(--ax-background-subtle);
        border-radius: 8px;
      }

      .scheme-name {
        min-width: 120px;
        font-weight: 500;
        color: var(--ax-text-heading);
      }

      .scheme-colors {
        display: flex;
        gap: 4px;
      }

      .color-swatch {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .chart-guide {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .guide-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: 8px;

        mat-icon {
          color: var(--ax-brand-default);
        }

        strong {
          display: block;
          color: var(--ax-text-heading);
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      .guidelines-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .guideline {
        padding: 1rem;
        border-radius: 12px;

        h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.75rem;
          font-weight: 600;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: 1.25rem;

          li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
        }
      }

      .guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }

        li {
          color: var(--ax-success-emphasis);
        }
      }

      .guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }

        li {
          color: var(--ax-error-emphasis);
        }
      }
    `,
  ],
})
export class NgxChartsDocComponent {
  // Demo state
  showLegend = signal(true);
  gradient = signal(false);
  colorScheme = signal('vivid');

  // Sample data
  lineChartData = [
    {
      name: 'Revenue',
      series: [
        { name: 'Jan', value: 42000 },
        { name: 'Feb', value: 38000 },
        { name: 'Mar', value: 45000 },
        { name: 'Apr', value: 51000 },
        { name: 'May', value: 48000 },
        { name: 'Jun', value: 55000 },
      ],
    },
    {
      name: 'Expenses',
      series: [
        { name: 'Jan', value: 28000 },
        { name: 'Feb', value: 32000 },
        { name: 'Mar', value: 30000 },
        { name: 'Apr', value: 35000 },
        { name: 'May', value: 33000 },
        { name: 'Jun', value: 38000 },
      ],
    },
  ];

  barChartData = [
    { name: 'Q1', value: 125000 },
    { name: 'Q2', value: 148000 },
    { name: 'Q3', value: 135000 },
    { name: 'Q4', value: 162000 },
  ];

  groupedBarData = [
    {
      name: '2023',
      series: [
        { name: 'Q1', value: 105000 },
        { name: 'Q2', value: 128000 },
        { name: 'Q3', value: 115000 },
        { name: 'Q4', value: 142000 },
      ],
    },
    {
      name: '2024',
      series: [
        { name: 'Q1', value: 125000 },
        { name: 'Q2', value: 148000 },
        { name: 'Q3', value: 135000 },
        { name: 'Q4', value: 162000 },
      ],
    },
  ];

  pieChartData = [
    { name: 'Electronics', value: 40 },
    { name: 'Clothing', value: 25 },
    { name: 'Food', value: 20 },
    { name: 'Other', value: 15 },
  ];

  areaChartData = this.lineChartData;

  gaugeData = [{ name: 'CPU Usage', value: 75 }];

  numberCardData = [
    { name: 'Users', value: 12847 },
    { name: 'Revenue', value: 125840 },
    { name: 'Orders', value: 3842 },
  ];

  realtimeData = signal([
    {
      name: 'Live Data',
      series: [
        { name: '0s', value: 50 },
        { name: '1s', value: 55 },
        { name: '2s', value: 48 },
        { name: '3s', value: 62 },
        { name: '4s', value: 58 },
      ],
    },
  ]);

  colorSchemes = [
    {
      name: 'vivid',
      colors: ['#647c8a', '#3f51b5', '#2196f3', '#00bcd4', '#009688'],
    },
    {
      name: 'natural',
      colors: ['#bf9d76', '#e99450', '#d89f59', '#f2dfa7', '#a5d7c6'],
    },
    {
      name: 'cool',
      colors: ['#a8385d', '#7aa3e5', '#a27ea8', '#aae3f5', '#adcded'],
    },
    {
      name: 'fire',
      colors: ['#ff3d00', '#bf360c', '#ff6e40', '#ff9e80', '#ffccbc'],
    },
    {
      name: 'solar',
      colors: ['#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28'],
    },
  ];

  designTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Primary chart colors',
    },
    {
      category: 'Colors',
      cssVar: '--ax-success-default',
      usage: 'Positive values',
    },
    {
      category: 'Colors',
      cssVar: '--ax-error-default',
      usage: 'Negative values',
    },
    {
      category: 'Typography',
      cssVar: '--ax-text-secondary',
      usage: 'Axis labels',
    },
    { category: 'Spacing', cssVar: '--ax-spacing-md', usage: 'Chart padding' },
  ];

  updateRealtimeData() {
    const newValue = Math.floor(Math.random() * 50) + 30;
    const current = this.realtimeData();
    const series = current[0].series.slice(1);
    series.push({ name: `${series.length}s`, value: newValue });
    this.realtimeData.set([{ name: 'Live Data', series }]);
  }

  // Code examples
  readonly lineChartCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ngx-charts-line-chart
  [results]="lineChartData"
  [xAxis]="true"
  [yAxis]="true"
  [showXAxisLabel]="true"
  [showYAxisLabel]="true"
  xAxisLabel="Month"
  yAxisLabel="Sales"
  [legend]="true"
  [scheme]="'vivid'"
>
</ngx-charts-line-chart>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  imports: [NgxChartsModule],
  ...
})
export class MyComponent {
  lineChartData = [
    {
      name: 'Revenue',
      series: [
        { name: 'Jan', value: 42000 },
        { name: 'Feb', value: 38000 },
        { name: 'Mar', value: 45000 },
      ]
    }
  ];
}`,
    },
  ];

  readonly barChartCode: CodeTab[] = [
    {
      label: 'Vertical',
      language: 'html',
      code: `<ngx-charts-bar-vertical
  [results]="barChartData"
  [xAxis]="true"
  [yAxis]="true"
  [legend]="false"
  [gradient]="true"
>
</ngx-charts-bar-vertical>`,
    },
    {
      label: 'Grouped',
      language: 'html',
      code: `<ngx-charts-bar-vertical-2d
  [results]="groupedBarData"
  [xAxis]="true"
  [yAxis]="true"
  [legend]="true"
>
</ngx-charts-bar-vertical-2d>`,
    },
  ];

  readonly pieChartCode: CodeTab[] = [
    {
      label: 'Pie',
      language: 'html',
      code: `<ngx-charts-pie-chart
  [results]="pieChartData"
  [legend]="true"
  [labels]="true"
  [doughnut]="false"
>
</ngx-charts-pie-chart>`,
    },
    {
      label: 'Donut',
      language: 'html',
      code: `<ngx-charts-pie-chart
  [results]="pieChartData"
  [legend]="true"
  [doughnut]="true"
  [arcWidth]="0.4"
>
</ngx-charts-pie-chart>`,
    },
  ];

  readonly areaChartCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ngx-charts-area-chart-stacked
  [results]="areaChartData"
  [xAxis]="true"
  [yAxis]="true"
  [legend]="true"
  [scheme]="'cool'"
>
</ngx-charts-area-chart-stacked>`,
    },
  ];

  readonly gaugeChartCode: CodeTab[] = [
    {
      label: 'Gauge',
      language: 'html',
      code: `<ngx-charts-gauge
  [results]="gaugeData"
  [min]="0"
  [max]="100"
  [units]="'%'"
  [angleSpan]="240"
  [startAngle]="-120"
>
</ngx-charts-gauge>`,
    },
    {
      label: 'Number Card',
      language: 'html',
      code: `<ngx-charts-number-card
  [results]="numberCardData"
  [scheme]="'cool'"
>
</ngx-charts-number-card>`,
    },
    {
      label: 'Linear',
      language: 'html',
      code: `<ngx-charts-linear-gauge
  [value]="75"
  [min]="0"
  [max]="100"
  [units]="'Progress'"
>
</ngx-charts-linear-gauge>`,
    },
  ];

  readonly realtimeCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `// Real-time data updates
realtimeData = signal([...]);

updateData() {
  const newValue = Math.random() * 100;
  const series = this.realtimeData()[0].series.slice(1);
  series.push({ name: 'now', value: newValue });
  this.realtimeData.set([{ name: 'Live', series }]);
}

// Use interval for auto-updates
ngOnInit() {
  interval(1000).subscribe(() => this.updateData());
}`,
    },
  ];

  readonly dataFormatCode: CodeTab[] = [
    {
      label: 'Single Series',
      language: 'typescript',
      code: `// For bar, pie charts
const data = [
  { name: 'Category A', value: 100 },
  { name: 'Category B', value: 200 },
];`,
    },
    {
      label: 'Multi Series',
      language: 'typescript',
      code: `// For line, area charts
const data = [
  {
    name: 'Series 1',
    series: [
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 150 },
    ]
  },
  {
    name: 'Series 2',
    series: [
      { name: 'Jan', value: 80 },
      { name: 'Feb', value: 120 },
    ]
  }
];`,
    },
  ];
}
