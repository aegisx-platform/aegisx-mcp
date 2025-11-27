import { AxKpiCardComponent, AxSparklineComponent } from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-sparkline-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    AxSparklineComponent,
    AxKpiCardComponent,
  ],
  template: `
    <div class="docs-page">
      <!-- Page Header -->
      <div class="docs-header">
        <h1 class="docs-title">Sparkline Component</h1>
        <p class="docs-subtitle">
          Lightweight SVG-based sparkline charts for displaying trends inline
          with metrics. Perfect for dashboards and KPI cards.
        </p>
      </div>

      <!-- Pattern 1: Stock Price Trends -->
      <div class="section-header">
        <h2>Pattern 1: Stock Price / Revenue Trends</h2>
        <p>Inline sparklines with KPI values.</p>
      </div>

      <section>
        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✨ New: ax-sparkline Component
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Revenue -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-baseline justify-between mb-2">
                <span class="text-sm text-secondary">Revenue</span>
                <span class="text-sm font-medium text-success">+12.5%</span>
              </div>
              <div class="text-3xl font-semibold text-heading mb-3">
                $45,231
              </div>
              <ax-sparkline
                [data]="revenueData"
                variant="area"
                size="lg"
                color="var(--ax-success-default)"
                [fillOpacity]="0.2"
                class="w-full"
              >
              </ax-sparkline>
            </mat-card-content>
          </mat-card>

          <!-- Users -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-baseline justify-between mb-2">
                <span class="text-sm text-secondary">Active Users</span>
                <span class="text-sm font-medium text-info">+8.3%</span>
              </div>
              <div class="text-3xl font-semibold text-heading mb-3">2,543</div>
              <ax-sparkline
                [data]="usersData"
                variant="area"
                size="lg"
                color="var(--ax-info-default)"
                [fillOpacity]="0.2"
                class="w-full"
              >
              </ax-sparkline>
            </mat-card-content>
          </mat-card>

          <!-- Orders -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-baseline justify-between mb-2">
                <span class="text-sm text-secondary">Orders</span>
                <span class="text-sm font-medium text-error">-3.2%</span>
              </div>
              <div class="text-3xl font-semibold text-heading mb-3">892</div>
              <ax-sparkline
                [data]="ordersData"
                variant="area"
                size="lg"
                color="var(--ax-error)"
                [fillOpacity]="0.2"
                class="w-full"
              >
              </ax-sparkline>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Pattern 2: Line vs Area Variants -->
      <div class="section-header">
        <h2>Pattern 2: Line vs Area Variants</h2>
        <p>Different visual styles for sparklines.</p>
      </div>

      <section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Line Variant -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm font-medium mb-3">Line Variant</div>
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <div class="text-2xl font-semibold text-heading">$2,845</div>
                  <div class="text-xs text-secondary mt-1">Daily average</div>
                </div>
                <ax-sparkline
                  [data]="trendData"
                  variant="line"
                  size="md"
                  color="var(--ax-info-default)"
                  [strokeWidth]="2"
                >
                </ax-sparkline>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Area Variant -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm font-medium mb-3">Area Variant</div>
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <div class="text-2xl font-semibold text-heading">$2,845</div>
                  <div class="text-xs text-secondary mt-1">Daily average</div>
                </div>
                <ax-sparkline
                  [data]="trendData"
                  variant="area"
                  size="md"
                  color="var(--ax-info-default)"
                  [fillOpacity]="0.3"
                >
                </ax-sparkline>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Pattern 3: Size Variants -->
      <div class="section-header">
        <h2>Pattern 3: Size Variants</h2>
        <p>Small, medium, and large sparklines.</p>
      </div>

      <section>
        <div class="space-y-4">
          <!-- Small -->
          <div class="flex items-center gap-4">
            <div class="w-32">
              <div class="text-sm font-medium">Small (60x24)</div>
            </div>
            <ax-sparkline
              [data]="sampleData"
              variant="line"
              size="sm"
              color="var(--ax-info-default)"
            >
            </ax-sparkline>
          </div>

          <!-- Medium -->
          <div class="flex items-center gap-4">
            <div class="w-32">
              <div class="text-sm font-medium">Medium (100x40)</div>
            </div>
            <ax-sparkline
              [data]="sampleData"
              variant="line"
              size="md"
              color="var(--ax-info-default)"
            >
            </ax-sparkline>
          </div>

          <!-- Large -->
          <div class="flex items-center gap-4">
            <div class="w-32">
              <div class="text-sm font-medium">Large (150x60)</div>
            </div>
            <ax-sparkline
              [data]="sampleData"
              variant="line"
              size="lg"
              color="var(--ax-info-default)"
            >
            </ax-sparkline>
          </div>
        </div>
      </section>

      <!-- Pattern 4: Color Variants -->
      <div class="section-header">
        <h2>Pattern 4: Color Variants</h2>
        <p>Different colors for different metric types.</p>
      </div>

      <section>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="text-center">
            <ax-sparkline
              [data]="sampleData"
              variant="area"
              size="md"
              color="var(--ax-info-default)"
            >
            </ax-sparkline>
            <div class="text-xs text-secondary mt-2">Info</div>
          </div>

          <div class="text-center">
            <ax-sparkline
              [data]="sampleData"
              variant="area"
              size="md"
              color="var(--ax-success-default)"
            >
            </ax-sparkline>
            <div class="text-xs text-secondary mt-2">Success</div>
          </div>

          <div class="text-center">
            <ax-sparkline
              [data]="sampleData"
              variant="area"
              size="md"
              color="var(--ax-warning-default)"
            >
            </ax-sparkline>
            <div class="text-xs text-secondary mt-2">Warning</div>
          </div>

          <div class="text-center">
            <ax-sparkline
              [data]="sampleData"
              variant="area"
              size="md"
              color="var(--ax-error)"
            >
            </ax-sparkline>
            <div class="text-xs text-secondary mt-2">Error</div>
          </div>

          <div class="text-center">
            <ax-sparkline
              [data]="sampleData"
              variant="area"
              size="md"
              color="var(--ax-purple-default)"
            >
            </ax-sparkline>
            <div class="text-xs text-secondary mt-2">Purple</div>
          </div>
        </div>
      </section>

      <!-- Pattern 5: Smooth vs Linear -->
      <div class="section-header">
        <h2>Pattern 5: Smooth Curves vs Straight Lines</h2>
        <p>Toggle between smooth curves and linear interpolation.</p>
      </div>

      <section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Smooth -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm font-medium mb-3">Smooth Curves</div>
              <ax-sparkline
                [data]="volatileData"
                variant="line"
                size="lg"
                color="var(--ax-info-default)"
                [smooth]="true"
                [strokeWidth]="2"
              >
              </ax-sparkline>
            </mat-card-content>
          </mat-card>

          <!-- Linear -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm font-medium mb-3">Straight Lines</div>
              <ax-sparkline
                [data]="volatileData"
                variant="line"
                size="lg"
                color="var(--ax-info-default)"
                [smooth]="false"
                [strokeWidth]="2"
              >
              </ax-sparkline>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Pattern 6: With Data Points -->
      <div class="section-header">
        <h2>Pattern 6: Data Point Indicators</h2>
        <p>Show dots on data points (visible on hover).</p>
      </div>

      <section>
        <mat-card class="kpi-card max-w-md">
          <mat-card-content>
            <div class="text-sm font-medium mb-3">Hover to see data points</div>
            <ax-sparkline
              [data]="sampleData"
              variant="area"
              size="lg"
              color="var(--ax-info-default)"
              [showDots]="false"
              [dotRadius]="4"
              [fillOpacity]="0.2"
            >
            </ax-sparkline>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Pattern 7: Stock Ticker Cards -->
      <div class="section-header">
        <h2>Pattern 7: Stock Ticker Cards</h2>
        <p>
          Complete stock ticker cards with company info, price, change, and
          sparkline trend.
        </p>
      </div>

      <section>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Amazon Stock -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-center justify-between gap-4">
                <!-- Left: Company Info -->
                <div class="flex-shrink-0">
                  <div class="text-sm font-semibold text-heading">AMZN</div>
                  <div class="text-xs text-secondary">Amazon.com Inc.</div>
                </div>

                <!-- Right: Price + Sparkline -->
                <div class="flex items-center gap-3 flex-1 justify-end">
                  <div class="text-right">
                    <div class="text-lg font-semibold text-heading">
                      $178.25
                    </div>
                    <div class="text-xs font-medium text-success">
                      +$4.75 (+2.74%)
                    </div>
                  </div>
                  <ax-sparkline
                    [data]="amznData"
                    variant="area"
                    size="sm"
                    color="var(--ax-success-default)"
                    [fillOpacity]="0.15"
                    [smooth]="true"
                  >
                  </ax-sparkline>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Tesla Stock -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-center justify-between gap-4">
                <!-- Left: Company Info -->
                <div class="flex-shrink-0">
                  <div class="text-sm font-semibold text-heading">TSLA</div>
                  <div class="text-xs text-secondary">Tesla Inc.</div>
                </div>

                <!-- Right: Price + Sparkline -->
                <div class="flex items-center gap-3 flex-1 justify-end">
                  <div class="text-right">
                    <div class="text-lg font-semibold text-heading">
                      $231.75
                    </div>
                    <div class="text-xs font-medium text-error">
                      -$6.25 (-2.62%)
                    </div>
                  </div>
                  <ax-sparkline
                    [data]="tslaData"
                    variant="area"
                    size="sm"
                    color="var(--ax-error)"
                    [fillOpacity]="0.15"
                    [smooth]="true"
                  >
                  </ax-sparkline>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Google Stock -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-center justify-between gap-4">
                <!-- Left: Company Info -->
                <div class="flex-shrink-0">
                  <div class="text-sm font-semibold text-heading">GOOGL</div>
                  <div class="text-xs text-secondary">Alphabet Inc.</div>
                </div>

                <!-- Right: Price + Sparkline -->
                <div class="flex items-center gap-3 flex-1 justify-end">
                  <div class="text-right">
                    <div class="text-lg font-semibold text-heading">
                      $149.85
                    </div>
                    <div class="text-xs font-medium text-success">
                      +$3.65 (+2.50%)
                    </div>
                  </div>
                  <ax-sparkline
                    [data]="googlData"
                    variant="area"
                    size="sm"
                    color="var(--ax-success-default)"
                    [fillOpacity]="0.15"
                    [smooth]="true"
                  >
                  </ax-sparkline>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Pattern 8: Custom Width Examples -->
      <div class="section-header">
        <h2>Pattern 8: Custom Width Examples</h2>
        <p class="text-secondary">
          Sparklines with custom widths using customWidth input
        </p>
      </div>

      <section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Fixed 200px Width -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex flex-col gap-2">
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-secondary"
                    >Fixed Width (200px)</span
                  >
                  <span class="text-lg font-semibold text-heading"
                    >$45,678</span
                  >
                </div>
                <ax-sparkline
                  [data]="revenueData"
                  variant="area"
                  size="md"
                  color="var(--ax-info-default)"
                  [fillOpacity]="0.2"
                  customWidth="200px"
                >
                </ax-sparkline>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Fixed 300px Width -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex flex-col gap-2">
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-secondary"
                    >Fixed Width (300px)</span
                  >
                  <span class="text-lg font-semibold text-heading">12,345</span>
                </div>
                <ax-sparkline
                  [data]="userActivityData"
                  variant="line"
                  size="md"
                  color="var(--ax-success-default)"
                  [strokeWidth]="2"
                  customWidth="300px"
                >
                </ax-sparkline>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- 50% Width -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex flex-col gap-2">
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-secondary">50% Width</span>
                  <span class="text-lg font-semibold text-heading">98.5%</span>
                </div>
                <ax-sparkline
                  [data]="systemHealthData"
                  variant="area"
                  size="sm"
                  color="var(--ax-success-default)"
                  [fillOpacity]="0.15"
                  customWidth="50%"
                >
                </ax-sparkline>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- 75% Width -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex flex-col gap-2">
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-secondary">75% Width</span>
                  <span class="text-lg font-semibold text-heading">234ms</span>
                </div>
                <ax-sparkline
                  [data]="responseTimeData"
                  variant="line"
                  size="sm"
                  color="var(--ax-warning-default)"
                  [strokeWidth]="2"
                  customWidth="75%"
                >
                </ax-sparkline>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Code Example -->
        <mat-card class="kpi-card mt-6">
          <mat-card-content>
            <h3 class="text-lg font-semibold mb-3">Usage Example</h3>
            <pre
              class="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto"
            ><code>&lt;!-- Default: 100% width --&gt;
&lt;ax-sparkline [data]="revenueData" variant="area" size="md"&gt;&lt;/ax-sparkline&gt;

&lt;!-- Fixed pixel width --&gt;
&lt;ax-sparkline [data]="revenueData" variant="area" size="md" customWidth="200px"&gt;&lt;/ax-sparkline&gt;

&lt;!-- Percentage width --&gt;
&lt;ax-sparkline [data]="revenueData" variant="area" size="md" customWidth="50%"&gt;&lt;/ax-sparkline&gt;</code></pre>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- Benefits Summary -->
      <div class="section-header">
        <h2>Component Benefits</h2>
      </div>

      <section>
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">✨ Features</h3>
                <ul class="space-y-2 text-sm">
                  <li>✅ SVG-based (lightweight)</li>
                  <li>✅ Line and area variants</li>
                  <li>✅ 3 size options (sm, md, lg)</li>
                  <li>✅ Smooth curves or linear interpolation</li>
                  <li>✅ Optional data point dots</li>
                  <li>✅ Custom colors via design tokens</li>
                  <li>✅ Automatic scaling</li>
                  <li>
                    ✅ <strong>Custom width support</strong> (100%, 200px, 50%,
                    etc.)
                  </li>
                  <li>✅ Full dark mode support</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-3">🎨 Use Cases</h3>
                <ul class="space-y-2 text-sm">
                  <li>• Stock price trends</li>
                  <li>• Revenue/sales trends</li>
                  <li>• User activity patterns</li>
                  <li>• Server metrics (CPU, memory)</li>
                  <li>• Response time trends</li>
                  <li>• Dashboard KPIs</li>
                </ul>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
  styles: [
    `
      .kpi-card {
        background-color: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        transition: all 0.2s ease;
      }

      .kpi-card:hover {
        box-shadow: var(--ax-shadow-sm);
      }

      /* Make sparkline full width */
      .w-full {
        width: 100%;
      }

      ax-sparkline {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class SparklineDemoComponent {
  // Sample data for demos
  revenueData = [28000, 32000, 29500, 35000, 38000, 36000, 40000, 42000, 45231];
  usersData = [1800, 1950, 2100, 2050, 2200, 2300, 2400, 2500, 2543];
  ordersData = [950, 920, 900, 880, 910, 905, 895, 900, 892];
  trendData = [1500, 2100, 1800, 2400, 2800, 2600, 3000, 2845];
  sampleData = [10, 30, 20, 50, 40, 60, 55, 70];
  volatileData = [20, 45, 28, 60, 35, 75, 40, 85, 50, 90, 65, 95];

  // Stock ticker data (Pattern 7)
  // Amazon - Positive trend
  amznData = [165.5, 167.2, 169.8, 171.5, 170.3, 173.8, 175.2, 176.5, 178.25];
  amznPrice = 178.25;
  amznChange = 4.75;
  amznChangePercent = 2.74;

  // Tesla - Negative trend
  tslaData = [248.5, 245.3, 242.8, 240.5, 238.2, 236.5, 234.8, 233.2, 231.75];
  tslaPrice = 231.75;
  tslaChange = 6.25;
  tslaChangePercent = -2.62;

  // Google - Positive trend
  googlData = [138.5, 140.2, 139.8, 142.5, 143.8, 145.2, 146.8, 148.5, 149.85];
  googlPrice = 149.85;
  googlChange = 3.65;
  googlChangePercent = 2.5;

  // Additional data for Pattern 8 (Custom Width Examples)
  userActivityData = [
    8500, 9200, 10100, 9800, 11200, 12300, 11800, 13100, 12345,
  ];
  systemHealthData = [95.5, 96.2, 97.1, 96.8, 97.5, 98.2, 97.9, 98.8, 98.5];
  responseTimeData = [245, 238, 251, 242, 235, 228, 233, 239, 234];
}
