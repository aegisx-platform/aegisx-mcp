import {
  Component,
  signal,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Chart, registerables } from 'chart.js';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../components/docs';
import { CodeTab, ComponentToken } from '../../../../types/docs.types';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'ax-chartjs-doc',
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
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="chartjs-doc">
      <ax-doc-header
        title="Chart.js"
        icon="ssid_chart"
        description="Simple yet flexible JavaScript charting library. Create responsive, animated charts with a simple API."
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'Chart.js' },
        ]"
        status="stable"
        version="4.4.x"
        importStatement="import { Chart } from 'chart.js';"
      ></ax-doc-header>

      <!-- Library Reference -->
      <div class="library-reference">
        <mat-icon>info</mat-icon>
        <span>
          This integration uses
          <a href="https://www.chartjs.org/" target="_blank" rel="noopener">
            Chart.js
          </a>
          library (MIT License)
        </span>
      </div>

      <mat-tab-group class="chartjs-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="chartjs-doc__tab-content">
            <section class="chartjs-doc__section">
              <h2>Line Chart</h2>
              <p>Visualize data trends over time with smooth line charts.</p>

              <ax-live-preview variant="bordered" minHeight="350px">
                <div class="chart-wrapper">
                  <canvas #lineChart></canvas>
                </div>
              </ax-live-preview>

              <div class="demo-controls">
                <mat-slide-toggle
                  [checked]="showFill()"
                  (change)="toggleFill($event.checked)"
                >
                  Fill Area
                </mat-slide-toggle>

                <mat-slide-toggle
                  [checked]="smoothCurves()"
                  (change)="toggleSmooth($event.checked)"
                >
                  Smooth Curves
                </mat-slide-toggle>
              </div>

              <ax-code-tabs [tabs]="lineChartCode"></ax-code-tabs>
            </section>

            <section class="chartjs-doc__section">
              <h2>Bar Charts</h2>
              <p>Compare categories with vertical or horizontal bars.</p>

              <div class="chart-grid">
                <div class="chart-card">
                  <h4>Vertical Bar Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="280px">
                    <div class="chart-wrapper-sm">
                      <canvas #barChart></canvas>
                    </div>
                  </ax-live-preview>
                </div>

                <div class="chart-card">
                  <h4>Horizontal Bar Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="280px">
                    <div class="chart-wrapper-sm">
                      <canvas #horizontalBarChart></canvas>
                    </div>
                  </ax-live-preview>
                </div>
              </div>

              <ax-code-tabs [tabs]="barChartCode"></ax-code-tabs>
            </section>

            <section class="chartjs-doc__section">
              <h2>Pie & Doughnut Charts</h2>
              <p>Display proportional data with circular charts.</p>

              <div class="chart-grid">
                <div class="chart-card">
                  <h4>Pie Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="280px">
                    <div class="chart-wrapper-sm">
                      <canvas #pieChart></canvas>
                    </div>
                  </ax-live-preview>
                </div>

                <div class="chart-card">
                  <h4>Doughnut Chart</h4>
                  <ax-live-preview variant="bordered" minHeight="280px">
                    <div class="chart-wrapper-sm">
                      <canvas #doughnutChart></canvas>
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
          <div class="chartjs-doc__tab-content">
            <section class="chartjs-doc__section">
              <h2>Radar Chart</h2>
              <p>Compare multiple variables on a radial grid.</p>

              <ax-live-preview variant="bordered" minHeight="350px">
                <div class="chart-wrapper">
                  <canvas #radarChart></canvas>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="radarChartCode"></ax-code-tabs>
            </section>

            <section class="chartjs-doc__section">
              <h2>Polar Area Chart</h2>
              <p>Similar to pie but with varying radius based on value.</p>

              <ax-live-preview variant="bordered" minHeight="350px">
                <div class="chart-wrapper">
                  <canvas #polarChart></canvas>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="polarChartCode"></ax-code-tabs>
            </section>

            <section class="chartjs-doc__section">
              <h2>Mixed Chart Types</h2>
              <p>Combine different chart types in one visualization.</p>

              <ax-live-preview variant="bordered" minHeight="350px">
                <div class="chart-wrapper">
                  <canvas #mixedChart></canvas>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="mixedChartCode"></ax-code-tabs>
            </section>

            <section class="chartjs-doc__section">
              <h2>Real-time Updates</h2>
              <p>Charts can be updated dynamically with new data.</p>

              <ax-live-preview variant="bordered" minHeight="300px">
                <div class="chart-wrapper">
                  <canvas #realtimeChart></canvas>
                </div>
              </ax-live-preview>

              <div class="demo-controls">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="addDataPoint()"
                >
                  <mat-icon>add</mat-icon>
                  Add Data Point
                </button>
                <button mat-stroked-button (click)="resetRealtimeChart()">
                  <mat-icon>refresh</mat-icon>
                  Reset
                </button>
              </div>

              <ax-code-tabs [tabs]="realtimeCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="chartjs-doc__tab-content">
            <section class="chartjs-doc__section">
              <h2>Chart Configuration</h2>
              <p>Main configuration options for Chart.js.</p>

              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>type</code></td>
                      <td>string</td>
                      <td>
                        Chart type: 'line', 'bar', 'pie', 'doughnut', 'radar',
                        etc.
                      </td>
                    </tr>
                    <tr>
                      <td><code>data</code></td>
                      <td>object</td>
                      <td>Data configuration with labels and datasets</td>
                    </tr>
                    <tr>
                      <td><code>options</code></td>
                      <td>object</td>
                      <td>Chart options (responsive, plugins, scales, etc.)</td>
                    </tr>
                    <tr>
                      <td><code>plugins</code></td>
                      <td>array</td>
                      <td>Array of plugin objects to register</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="chartjs-doc__section">
              <h2>Dataset Properties</h2>
              <p>Common dataset configuration options.</p>

              <div class="api-table">
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
                      <td><code>label</code></td>
                      <td>string</td>
                      <td>Dataset label shown in legend</td>
                    </tr>
                    <tr>
                      <td><code>data</code></td>
                      <td>number[]</td>
                      <td>Array of data values</td>
                    </tr>
                    <tr>
                      <td><code>backgroundColor</code></td>
                      <td>Color | Color[]</td>
                      <td>Fill color(s) for the dataset</td>
                    </tr>
                    <tr>
                      <td><code>borderColor</code></td>
                      <td>Color | Color[]</td>
                      <td>Border/line color(s)</td>
                    </tr>
                    <tr>
                      <td><code>borderWidth</code></td>
                      <td>number</td>
                      <td>Border line width in pixels</td>
                    </tr>
                    <tr>
                      <td><code>fill</code></td>
                      <td>boolean | object</td>
                      <td>Fill area under line/between datasets</td>
                    </tr>
                    <tr>
                      <td><code>tension</code></td>
                      <td>number</td>
                      <td>Bezier curve tension (0 = straight lines)</td>
                    </tr>
                    <tr>
                      <td><code>pointRadius</code></td>
                      <td>number</td>
                      <td>Point radius (0 to hide)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="chartjs-doc__section">
              <h2>Methods</h2>
              <p>Chart instance methods for interaction.</p>

              <ax-code-tabs [tabs]="methodsCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="chartjs-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="chartjs-doc__tab-content">
            <section class="chartjs-doc__section">
              <h2>Chart.js vs NGX-Charts</h2>
              <p>When to use each library.</p>

              <div class="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Chart.js</th>
                      <th>NGX-Charts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Rendering</td>
                      <td>Canvas</td>
                      <td>SVG (D3.js)</td>
                    </tr>
                    <tr>
                      <td>Performance</td>
                      <td>Better for large datasets</td>
                      <td>Better for interactivity</td>
                    </tr>
                    <tr>
                      <td>Angular Integration</td>
                      <td>Manual</td>
                      <td>Native</td>
                    </tr>
                    <tr>
                      <td>Customization</td>
                      <td>Plugin-based</td>
                      <td>Component-based</td>
                    </tr>
                    <tr>
                      <td>Bundle Size</td>
                      <td>~60KB</td>
                      <td>~200KB</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="chartjs-doc__section">
              <h2>Best Practices</h2>

              <div class="guidelines-grid">
                <div class="guideline guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use responsive: true for mobile support</li>
                    <li>Destroy charts on component destroy</li>
                    <li>Use animation duration 0 for many updates</li>
                    <li>Keep datasets under 1000 points</li>
                    <li>Use tree-shaking for smaller bundles</li>
                  </ul>
                </div>

                <div class="guideline guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Create new Chart without destroying old one</li>
                    <li>Mix too many chart types</li>
                    <li>Use heavy animations with real-time data</li>
                    <li>Forget to register required components</li>
                    <li>Override all default tooltips unnecessarily</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="chartjs-doc__section">
              <h2>Angular Integration Pattern</h2>
              <p>Recommended pattern for using Chart.js in Angular.</p>

              <ax-code-tabs [tabs]="angularPatternCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .chartjs-doc {
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

      .chartjs-doc__tabs {
        margin-top: 1rem;
      }

      .chartjs-doc__tab-content {
        padding: 1.5rem 0;
      }

      .chartjs-doc__section {
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

      .chart-wrapper {
        width: 100%;
        height: 300px;
        position: relative;
      }

      .chart-wrapper-sm {
        width: 100%;
        height: 230px;
        position: relative;
      }

      .chart-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
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
      }

      .api-table,
      .comparison-table {
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
export class ChartjsDocComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('horizontalBarChart')
  horizontalBarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('polarChart') polarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mixedChart') mixedChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('realtimeChart') realtimeChartRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private lineChart?: Chart;
  private realtimeChart?: Chart;

  // Demo state
  showFill = signal(false);
  smoothCurves = signal(true);

  // Design tokens
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
      cssVar: '--ax-font-family',
      usage: 'Chart labels font',
    },
    { category: 'Spacing', cssVar: '--ax-spacing-md', usage: 'Chart padding' },
  ];

  ngAfterViewInit() {
    // Delay chart creation to ensure canvas elements are ready
    setTimeout(() => {
      this.createAllCharts();
    }, 100);
  }

  ngOnDestroy() {
    this.charts.forEach((chart) => chart.destroy());
  }

  private createAllCharts() {
    this.createLineChart();
    this.createBarChart();
    this.createHorizontalBarChart();
    this.createPieChart();
    this.createDoughnutChart();
    this.createRadarChart();
    this.createPolarChart();
    this.createMixedChart();
    this.createRealtimeChart();
  }

  private createLineChart() {
    if (!this.lineChartRef) return;

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [42000, 38000, 45000, 51000, 48000, 55000],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: this.showFill(),
            tension: this.smoothCurves() ? 0.4 : 0,
          },
          {
            label: 'Expenses',
            data: [28000, 32000, 30000, 35000, 33000, 38000],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: this.showFill(),
            tension: this.smoothCurves() ? 0.4 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });
    this.charts.push(this.lineChart);
  }

  private createBarChart() {
    if (!this.barChartRef) return;

    const chart = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: 'Sales',
            data: [125000, 148000, 135000, 162000],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
    this.charts.push(chart);
  }

  private createHorizontalBarChart() {
    if (!this.horizontalBarChartRef) return;

    const chart = new Chart(this.horizontalBarChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Electronics', 'Clothing', 'Food', 'Services'],
        datasets: [
          {
            label: 'Revenue',
            data: [85000, 62000, 45000, 38000],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
    this.charts.push(chart);
  }

  private createPieChart() {
    if (!this.pieChartRef) return;

    const chart = new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Electronics', 'Clothing', 'Food', 'Other'],
        datasets: [
          {
            data: [40, 25, 20, 15],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
    this.charts.push(chart);
  }

  private createDoughnutChart() {
    if (!this.doughnutChartRef) return;

    const chart = new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [
          {
            data: [65, 25, 10],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(156, 163, 175, 0.8)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
      },
    });
    this.charts.push(chart);
  }

  private createRadarChart() {
    if (!this.radarChartRef) return;

    const chart = new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency'],
        datasets: [
          {
            label: 'Model A',
            data: [85, 90, 80, 95, 75],
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          },
          {
            label: 'Model B',
            data: [75, 85, 90, 80, 85],
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
    this.charts.push(chart);
  }

  private createPolarChart() {
    if (!this.polarChartRef) return;

    const chart = new Chart(this.polarChartRef.nativeElement, {
      type: 'polarArea',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [
          {
            data: [11, 16, 7, 14, 9],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(139, 92, 246, 0.8)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
    this.charts.push(chart);
  }

  private createMixedChart() {
    if (!this.mixedChartRef) return;

    const chart = new Chart(this.mixedChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            type: 'line',
            label: 'Trend',
            data: [30, 35, 32, 38, 42, 45],
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'transparent',
            tension: 0.4,
            yAxisID: 'y1',
          },
          {
            type: 'bar',
            label: 'Sales',
            data: [28, 32, 30, 35, 40, 42],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            position: 'left',
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });
    this.charts.push(chart);
  }

  private createRealtimeChart() {
    if (!this.realtimeChartRef) return;

    this.realtimeChart = new Chart(this.realtimeChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['0s', '1s', '2s', '3s', '4s'],
        datasets: [
          {
            label: 'Live Data',
            data: [50, 55, 48, 62, 58],
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
        },
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });
    this.charts.push(this.realtimeChart);
  }

  toggleFill(checked: boolean) {
    this.showFill.set(checked);
    if (this.lineChart) {
      this.lineChart.data.datasets.forEach((dataset) => {
        (dataset as any).fill = checked;
      });
      this.lineChart.update();
    }
  }

  toggleSmooth(checked: boolean) {
    this.smoothCurves.set(checked);
    if (this.lineChart) {
      this.lineChart.data.datasets.forEach((dataset) => {
        (dataset as any).tension = checked ? 0.4 : 0;
      });
      this.lineChart.update();
    }
  }

  addDataPoint() {
    if (!this.realtimeChart) return;

    const data = this.realtimeChart.data;
    const labels = data.labels as string[];
    const dataset = data.datasets[0].data as number[];

    // Add new point
    const newValue = Math.floor(Math.random() * 50) + 25;
    labels.push(`${labels.length}s`);
    dataset.push(newValue);

    // Keep last 10 points
    if (labels.length > 10) {
      labels.shift();
      dataset.shift();
    }

    this.realtimeChart.update();
  }

  resetRealtimeChart() {
    if (!this.realtimeChart) return;

    this.realtimeChart.data.labels = ['0s', '1s', '2s', '3s', '4s'];
    this.realtimeChart.data.datasets[0].data = [50, 55, 48, 62, 58];
    this.realtimeChart.update();
  }

  // Code examples
  readonly lineChartCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Chart, registerables } from 'chart.js';

// Register all components
Chart.register(...registerables);

// Create line chart
const chart = new Chart(canvas, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [42000, 38000, 45000, 51000, 48000, 55000],
      borderColor: '#3b82f6',
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});`,
    },
  ];

  readonly barChartCode: CodeTab[] = [
    {
      label: 'Vertical',
      language: 'typescript',
      code: `new Chart(canvas, {
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Sales',
      data: [125000, 148000, 135000, 162000],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    }]
  }
});`,
    },
    {
      label: 'Horizontal',
      language: 'typescript',
      code: `new Chart(canvas, {
  type: 'bar',
  data: { /* ... */ },
  options: {
    indexAxis: 'y', // Makes bars horizontal
    responsive: true
  }
});`,
    },
  ];

  readonly pieChartCode: CodeTab[] = [
    {
      label: 'Pie',
      language: 'typescript',
      code: `new Chart(canvas, {
  type: 'pie',
  data: {
    labels: ['Electronics', 'Clothing', 'Food', 'Other'],
    datasets: [{
      data: [40, 25, 20, 15],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    }]
  }
});`,
    },
    {
      label: 'Doughnut',
      language: 'typescript',
      code: `new Chart(canvas, {
  type: 'doughnut',
  data: { /* ... */ },
  options: {
    cutout: '60%' // Inner radius percentage
  }
});`,
    },
  ];

  readonly radarChartCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `new Chart(canvas, {
  type: 'radar',
  data: {
    labels: ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency'],
    datasets: [
      {
        label: 'Model A',
        data: [85, 90, 80, 95, 75],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)'
      },
      {
        label: 'Model B',
        data: [75, 85, 90, 80, 85],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)'
      }
    ]
  },
  options: {
    scales: {
      r: { beginAtZero: true, max: 100 }
    }
  }
});`,
    },
  ];

  readonly polarChartCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `new Chart(canvas, {
  type: 'polarArea',
  data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
    datasets: [{
      data: [11, 16, 7, 14, 9],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  }
});`,
    },
  ];

  readonly mixedChartCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `new Chart(canvas, {
  type: 'bar', // Base type
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        type: 'line', // Override to line
        label: 'Trend',
        data: [30, 35, 32, 38, 42, 45],
        borderColor: 'rgba(239, 68, 68, 1)',
        yAxisID: 'y1'
      },
      {
        type: 'bar', // Explicit bar
        label: 'Sales',
        data: [28, 32, 30, 35, 40, 42],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        yAxisID: 'y'
      }
    ]
  },
  options: {
    scales: {
      y: { type: 'linear', position: 'left' },
      y1: { type: 'linear', position: 'right' }
    }
  }
});`,
    },
  ];

  readonly realtimeCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `// Update chart data dynamically
addDataPoint() {
  const chart = this.chart;
  const labels = chart.data.labels;
  const dataset = chart.data.datasets[0].data;

  // Add new point
  labels.push(\`\${labels.length}s\`);
  dataset.push(Math.random() * 50 + 25);

  // Keep last 10 points
  if (labels.length > 10) {
    labels.shift();
    dataset.shift();
  }

  chart.update(); // Trigger re-render
}

// For real-time: use interval
ngOnInit() {
  setInterval(() => this.addDataPoint(), 1000);
}`,
    },
  ];

  readonly methodsCode: CodeTab[] = [
    {
      label: 'Methods',
      language: 'typescript',
      code: `// Update chart after data changes
chart.update();

// Update with animation mode
chart.update('none'); // No animation
chart.update('active'); // Only active elements

// Destroy chart instance
chart.destroy();

// Reset to original state
chart.reset();

// Resize chart
chart.resize();

// Get data from click event
canvas.onclick = (evt) => {
  const points = chart.getElementsAtEventForMode(
    evt, 'nearest', { intersect: true }, true
  );
  if (points.length) {
    const firstPoint = points[0];
    const label = chart.data.labels[firstPoint.index];
    const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
    console.log(label, value);
  }
};`,
    },
  ];

  readonly angularPatternCode: CodeTab[] = [
    {
      label: 'Component',
      language: 'typescript',
      code: `import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-my-chart',
  template: \`<canvas #chartCanvas></canvas>\`,
  styles: [\`:host { display: block; height: 300px; }\`]
})
export class MyChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngAfterViewInit() {
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: { /* ... */ },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  ngOnDestroy() {
    this.chart?.destroy(); // Important: prevent memory leaks
  }

  updateData(newData: number[]) {
    if (this.chart) {
      this.chart.data.datasets[0].data = newData;
      this.chart.update();
    }
  }
}`,
    },
  ];
}
