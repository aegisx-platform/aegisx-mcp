import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Filler,
  CategoryScale,
} from 'chart.js';
import { CodePreviewComponent } from '../../../../components/code-preview/code-preview.component';

/**
 * Stock Ticker Interface
 */
interface StockTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  data: number[];
}

/**
 * KPI Metric Interface
 */
interface KPIMetric {
  label: string;
  value: string | number;
  change: number;
  changePercent: number;
  data: number[];
}

@Component({
  selector: 'app-spark-charts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    BaseChartDirective,
    CodePreviewComponent,
  ],
  templateUrl: './spark-charts.component.html',
  styleUrl: './spark-charts.component.scss',
})
export class SparkChartsComponent implements OnInit {
  ngOnInit(): void {
    // Register Chart.js components
    Chart.register(
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Title,
      Filler,
    );
  }

  // Stock Tickers Data
  stockTickers: StockTicker[] = [
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 3234.45,
      change: 45.67,
      changePercent: 1.43,
      data: [3180, 3195, 3210, 3188, 3205, 3220, 3234],
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 742.12,
      change: -8.34,
      changePercent: -1.11,
      data: [755, 752, 748, 750, 745, 743, 742],
    },
    {
      symbol: 'GOOG',
      name: 'Alphabet Inc.',
      price: 2789.34,
      change: 23.45,
      changePercent: 0.85,
      data: [2765, 2770, 2775, 2780, 2782, 2785, 2789],
    },
  ];

  // KPI Metrics Data
  kpiMetrics: KPIMetric[] = [
    {
      label: 'Monthly active users',
      value: '45,231',
      change: 3420,
      changePercent: 8.2,
      data: [38000, 39500, 41200, 42800, 43500, 44200, 45231],
    },
    {
      label: 'Monthly sessions',
      value: '2,240',
      change: 180,
      changePercent: 8.7,
      data: [1800, 1900, 2000, 2050, 2100, 2180, 2240],
    },
    {
      label: 'Monthly growth',
      value: '8.2%',
      change: 1.5,
      changePercent: 22.4,
      data: [5.5, 6.2, 6.8, 7.1, 7.5, 7.8, 8.2],
    },
  ];

  // Company Performance Data
  companyPerformance = [
    {
      name: 'Doorbell, Inc.',
      change: 2.3,
      data: [100, 102, 101, 103, 105, 104, 106],
    },
    {
      name: 'Solid Bit Holding',
      change: -0.9,
      data: [100, 99, 98, 99, 98, 97, 96],
    },
    {
      name: 'Off Running AG',
      change: 4.1,
      data: [100, 101, 103, 102, 104, 105, 107],
    },
  ];

  /**
   * Get sparkline chart configuration
   */
  getSparklineConfig(
    data: number[],
    color: string = '#3B82F6',
    fillOpacity: number = 0.1,
  ): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: data.map((_, i) => i.toString()),
        datasets: [
          {
            data: data,
            borderColor: color,
            backgroundColor: `${color}${Math.round(fillOpacity * 255)
              .toString(16)
              .padStart(2, '0')}`,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            display: false,
            grid: { display: false },
          },
          y: {
            display: false,
            grid: { display: false },
          },
        },
      },
    };
  }

  /**
   * Get color based on positive/negative change
   */
  getChangeColor(change: number): string {
    return change >= 0 ? '#10B981' : '#EF4444';
  }

  /**
   * Format currency
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  /**
   * Format percentage
   */
  formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  /**
   * Scroll to section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Code Examples
  stockTickerCode = `<!-- Stock Ticker Card with Sparkline (Material + Tailwind Grid) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <mat-card>
    <mat-card-content class="flex items-center justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline justify-between mb-2">
          <span class="text-lg font-bold">AMZN</span>
          <span class="text-lg font-semibold">$3,234.45</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400 truncate">Amazon.com Inc.</span>
          <span class="text-sm font-medium text-green-600 whitespace-nowrap">
            +$45.67 (+1.43%)
          </span>
        </div>
      </div>
      <div class="w-20 h-10 flex-shrink-0">
        <canvas baseChart [data]="chartData" [options]="sparkOptions"></canvas>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  kpiMetricCode = `<!-- KPI Metric with Trend Chart (Tremor Style) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <mat-card>
    <mat-card-content class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Monthly active users
        </div>
        <div class="text-3xl font-semibold">45,231</div>
      </div>
      <div class="w-32 h-16 flex-shrink-0">
        <canvas baseChart [data]="chartData" [options]="sparkOptions"></canvas>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  companyPerformanceCode = `<!-- Company Performance Card (Tremor Style) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <mat-card>
    <mat-card-content class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="text-base font-semibold mb-1">Doorbell, Inc.</div>
        <div class="text-sm font-medium text-green-600">+2.3%</div>
      </div>
      <div class="w-32 h-16 flex-shrink-0">
        <canvas baseChart [data]="chartData" [options]="sparkOptions"></canvas>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  chartConfigCode = `// Chart.js Configuration for Sparklines
chartData: ChartConfiguration['data'] = {
  labels: data.map((_, i) => i.toString()),
  datasets: [{
    data: [3180, 3195, 3210, 3188, 3205, 3220, 3234],
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    fill: true,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 0
  }]
};

sparkOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  },
  scales: {
    x: { display: false },
    y: { display: false }
  }
};`;
}
