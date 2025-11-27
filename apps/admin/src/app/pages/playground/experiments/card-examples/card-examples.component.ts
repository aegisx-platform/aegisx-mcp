import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
  DoughnutController,
  ArcElement,
} from 'chart.js';
import { CodePreviewComponent } from '../../../../components/code-preview/code-preview.component';

/**
 * Helper function to get CSS custom property value (design token)
 * Reads color values from AegisX Design System at runtime
 * @param propertyName - CSS variable name (e.g., '--ax-info-default')
 * @returns Hex color string
 */
function getCSSVariable(propertyName: string): string {
  const styles = getComputedStyle(document.documentElement);
  return styles.getPropertyValue(propertyName).trim();
}

/**
 * Helper function to convert hex color to rgba with opacity
 * @param hex - Hex color string
 * @param opacity - Opacity value (0-1)
 * @returns rgba color string
 */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * KPI Card Interface
 * Tremor-inspired KPI metrics for dashboard displays
 */
interface KPICard {
  label: string;
  value: string | number;
  change?: number; // Percentage change
  changeLabel?: string; // e.g., "from last month"
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  category?: string;
}

/**
 * Metric Card with Progress
 * Shows capacity, usage, or goal progress
 */
interface MetricCard {
  label: string;
  value: number;
  total: number;
  unit?: string;
  status: 'success' | 'warning' | 'critical' | 'neutral';
  subtitle?: string;
}

/**
 * Status Card
 * System health, alerts, or operational metrics
 */
interface StatusCard {
  title: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  message: string;
  timestamp?: string;
  details?: string;
}

/**
 * Performance Metric
 * Time-series data with comparison
 */
interface PerformanceMetric {
  label: string;
  current: number;
  previous: number;
  unit: string;
  target?: number;
}

@Component({
  selector: 'app-card-examples',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    BaseChartDirective,
    CodePreviewComponent,
  ],
  templateUrl: './card-examples.component.html',
  styleUrl: './card-examples.component.scss',
})
export class CardExamplesComponent implements OnInit, AfterViewInit {
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
      DoughnutController,
      ArcElement,
    );
  }

  ngAfterViewInit(): void {
    // Chart colors are now set directly in the data declarations
    // No need to update them here - they work automatically!
  }

  /**
   * Initialize all chart colors from CSS custom properties
   * Currently disabled - colors are set directly in chart data
   */
  private initializeChartColors(): void {
    // DISABLED: Colors are now hardcoded in chart data declarations
    // This method kept for future theme switching functionality

    // Monthly charts
    this.monthlyUsersData.datasets[0].borderColor =
      getCSSVariable('--ax-info-default');
    this.monthlyUsersData.datasets[0].backgroundColor = hexToRgba(
      getCSSVariable('--ax-info-default'),
      0.1,
    );

    this.monthlySessionsData.datasets[0].borderColor =
      getCSSVariable('--ax-info-default');
    this.monthlySessionsData.datasets[0].backgroundColor = hexToRgba(
      getCSSVariable('--ax-info-default'),
      0.1,
    );

    this.monthlyRevenueData.datasets[0].borderColor =
      getCSSVariable('--ax-info-default');
    this.monthlyRevenueData.datasets[0].backgroundColor = hexToRgba(
      getCSSVariable('--ax-info-default'),
      0.1,
    );

    // Trend comparison charts
    this.callVolumeData.datasets[0].borderColor =
      getCSSVariable('--ax-info-default');
    this.callVolumeData.datasets[0].backgroundColor = hexToRgba(
      getCSSVariable('--ax-info-default'),
      0.1,
    );
    this.callVolumeData.datasets[1].borderColor =
      getCSSVariable('--ax-text-subtle');
    this.callVolumeData.datasets[1].backgroundColor = hexToRgba(
      getCSSVariable('--ax-text-subtle'),
      0.1,
    );

    this.queryVolumeData.datasets[0].borderColor =
      getCSSVariable('--ax-info-default');
    this.queryVolumeData.datasets[0].backgroundColor = hexToRgba(
      getCSSVariable('--ax-info-default'),
      0.1,
    );
    this.queryVolumeData.datasets[1].borderColor =
      getCSSVariable('--ax-text-subtle');
    this.queryVolumeData.datasets[1].backgroundColor = hexToRgba(
      getCSSVariable('--ax-text-subtle'),
      0.1,
    );

    this.etlPerformanceData.datasets[0].borderColor = getCSSVariable(
      '--ax-purple-default',
    );
    this.etlPerformanceData.datasets[0].backgroundColor = hexToRgba(
      getCSSVariable('--ax-purple-default'),
      0.1,
    );
    this.etlPerformanceData.datasets[1].borderColor =
      getCSSVariable('--ax-info-subtle');
    this.etlPerformanceData.datasets[1].backgroundColor = hexToRgba(
      getCSSVariable('--ax-info-subtle'),
      0.1,
    );

    // Donut charts
    this.slaPerformanceData.datasets[0].backgroundColor = [
      getCSSVariable('--ax-info-default'),
      getCSSVariable('--md-sys-error'),
    ];

    this.responseTimeData.datasets[0].backgroundColor = [
      getCSSVariable('--ax-info-default'),
      getCSSVariable('--md-sys-error'),
    ];

    this.cachePerformanceData.datasets[0].backgroundColor = [
      getCSSVariable('--ax-info-default'),
      getCSSVariable('--md-sys-error'),
    ];
  }

  // ============================================
  // Analytics Metrics - Pure HTML Code
  // ============================================
  analyticsMetricsCode = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Card 1: Negative Change -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-lg font-normal text-secondary mb-3">Unique visitors</div>
      <div class="flex items-baseline gap-3">
        <div class="text-3xl font-semibold text-heading">10,450</div>
        <div class="text-sm font-medium text-error">-12.5%</div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Card 2: Positive Change -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-lg font-normal text-secondary mb-3">Bounce rate</div>
      <div class="flex items-baseline gap-3">
        <div class="text-3xl font-semibold text-heading">56.1%</div>
        <div class="text-sm font-medium text-success">+1.8%</div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Card 3: Positive Change -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-lg font-normal text-secondary mb-3">Visit duration</div>
      <div class="flex items-baseline gap-3">
        <div class="text-3xl font-semibold text-heading">5.2min</div>
        <div class="text-sm font-medium text-success">+19.7%</div>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // User Engagement Metrics - Pure HTML Code
  // ============================================
  userEngagementCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Daily Active Users -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-center justify-between mb-3">
        <div class="text-md font-normal text-secondary">Daily active users</div>
        <div class="text-sm font-medium text-success-emphasis bg-success-faint px-2 py-1 rounded">+12.1%</div>
      </div>
      <div class="text-3xl font-semibold text-heading">3,450</div>
    </mat-card-content>
  </mat-card>

  <!-- Weekly Sessions -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-center justify-between mb-3">
        <div class="text-md font-normal text-secondary">Weekly sessions</div>
        <div class="text-sm font-medium text-error bg-error-faint px-2 py-1 rounded">-9.8%</div>
      </div>
      <div class="text-3xl font-semibold text-heading">1,342</div>
    </mat-card-content>
  </mat-card>

  <!-- Duration -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-center justify-between mb-3">
        <div class="text-md font-normal text-secondary">Duration</div>
        <div class="text-sm font-medium text-success-emphasis bg-success-faint px-2 py-1 rounded">+7.7%</div>
      </div>
      <div class="text-3xl font-semibold text-heading">5.2min</div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Business Performance Metrics - Pure HTML Code
  // ============================================
  businessMetricsCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Recurring Revenue -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-start justify-between space-x-2">
        <span class="truncate text-sm text-secondary">Recurring revenue</span>
        <span class="text-sm font-medium text-success">+6.1%</span>
      </div>
      <div class="mt-1 text-3xl font-semibold text-heading">$34.1K</div>
    </mat-card-content>
  </mat-card>

  <!-- Total Users -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-start justify-between space-x-2">
        <span class="truncate text-sm text-secondary">Total users</span>
        <span class="text-sm font-medium text-success">+19.2%</span>
      </div>
      <div class="mt-1 text-3xl font-semibold text-heading">500.1K</div>
    </mat-card-content>
  </mat-card>

  <!-- User Growth -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-start justify-between space-x-2">
        <span class="truncate text-sm text-secondary">User growth</span>
        <span class="text-sm font-medium text-error">-1.2%</span>
      </div>
      <div class="mt-1 text-3xl font-semibold text-heading">11.3%</div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Revenue Metrics with Actions - Pure HTML Code
  // ============================================
  revenueMetricsCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Monthly Recurring Revenue -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-start justify-between mb-2">
        <span class="text-sm text-secondary">Monthly recurring revenue</span>
        <span class="text-sm font-medium text-success">+6.1%</span>
      </div>
      <div class="text-3xl font-semibold text-heading">$34.1K</div>
    </mat-card-content>
    <div class="kpi-card-divider"></div>
    <div class="flex justify-end px-4 py-3">
      <a href="#" class="text-sm font-medium text-info hover:text-info no-underline">
        View more →
      </a>
    </div>
  </mat-card>

  <!-- Users -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-start justify-between mb-2">
        <span class="text-sm text-secondary">Users</span>
        <span class="text-sm font-medium text-success">+19.2%</span>
      </div>
      <div class="text-3xl font-semibold text-heading">500.1K</div>
    </mat-card-content>
    <div class="kpi-card-divider"></div>
    <div class="flex justify-end px-4 py-3">
      <a href="#" class="text-sm font-medium text-info hover:text-info no-underline">
        View more →
      </a>
    </div>
  </mat-card>

  <!-- User Growth -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="flex items-start justify-between mb-2">
        <span class="text-sm text-secondary">User growth</span>
        <span class="text-sm font-medium text-error">-1.2%</span>
      </div>
      <div class="text-3xl font-semibold text-heading">11.3%</div>
    </mat-card-content>
    <div class="kpi-card-divider"></div>
    <div class="flex justify-end px-4 py-3">
      <a href="#" class="text-sm font-medium text-info hover:text-info no-underline">
        View more →
      </a>
    </div>
  </mat-card>
</div>`;

  // ============================================
  // Segmented Progress Distribution - Pure HTML Code
  // ============================================
  segmentedProgressCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Current Tickets -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Current Tickets</div>
      <div class="text-3xl font-semibold text-heading mb-4">247</div>

      <!-- Segmented Progress Bar -->
      <div class="flex gap-0.5 w-full h-2 mb-3 rounded-sm overflow-hidden">
        <div class="bg-info" style="width: 82%"></div>
        <div class="bg-text-secondary" style="width: 13%"></div>
        <div class="bg-error" style="width: 5%"></div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">82%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-info"></div>
            <span class="text-secondary">Resolved</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">13%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-text-secondary"></div>
            <span class="text-secondary">Progress</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">5%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-error"></div>
            <span class="text-secondary">Escalated</span>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Database Queries -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Database Queries</div>
      <div class="text-3xl font-semibold text-heading mb-4">44757</div>

      <!-- Segmented Progress Bar -->
      <div class="flex gap-0.5 w-full h-2 mb-3 rounded-sm overflow-hidden">
        <div class="bg-info" style="width: 57%"></div>
        <div class="bg-text-secondary" style="width: 12%"></div>
        <div class="bg-error" style="width: 31%"></div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">57%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-info"></div>
            <span class="text-secondary">Optimized</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">12%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-text-secondary"></div>
            <span class="text-secondary">Editing</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">31%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-error"></div>
            <span class="text-secondary">Slow</span>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Query Latency -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Query Latency</div>
      <div class="text-3xl font-semibold text-heading mb-4">1,247ms</div>

      <!-- Segmented Progress Bar -->
      <div class="flex gap-0.5 w-full h-2 mb-3 rounded-sm overflow-hidden">
        <div class="bg-info" style="width: 75%"></div>
        <div class="bg-text-secondary" style="width: 20%"></div>
        <div class="bg-error" style="width: 5%"></div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">75%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-info"></div>
            <span class="text-secondary">Fast</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">20%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-text-secondary"></div>
            <span class="text-secondary">Medium</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-heading font-medium">5%</span>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-sm bg-error"></div>
            <span class="text-secondary">Slow</span>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Stock Cards with Sparklines - Pure HTML Code
  // ============================================
  stockCardsCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Stock 1: Negative -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Baer Limited (BAL)</div>
      <div class="flex items-baseline justify-between mb-3">
        <div class="text-3xl font-semibold text-heading">$49.33</div>
        <div class="text-sm font-medium text-error">-9.85 (-1.9%)</div>
      </div>
      <div class="h-16">
        <canvas baseChart [data]="stockData1" [options]="sparklineOptions" [type]="'line'"></canvas>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Stock 2: Positive -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">QuantData Holding (QDH)</div>
      <div class="flex items-baseline justify-between mb-3">
        <div class="text-3xl font-semibold text-heading">$129.10</div>
        <div class="text-sm font-medium text-success">+12.10 (+7.1%)</div>
      </div>
      <div class="h-16">
        <canvas baseChart [data]="stockData2" [options]="sparklineOptions" [type]="'line'"></canvas>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Stock 3: Positive -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Not Normal, Inc. (NNO)</div>
      <div class="flex items-baseline justify-between mb-3">
        <div class="text-3xl font-semibold text-heading">$89.80</div>
        <div class="text-sm font-medium text-success">+7.50 (+1.2%)</div>
      </div>
      <div class="h-16">
        <canvas baseChart [data]="stockData3" [options]="sparklineOptions" [type]="'line'"></canvas>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // Stock sparkline data with theme-aware colors
  stockData1: ChartConfiguration['data'] = {
    labels: Array(30).fill(''),
    datasets: [
      {
        data: [
          52, 51, 53, 50, 52, 51, 49, 48, 50, 49, 51, 50, 48, 49, 47, 48, 50,
          49, 48, 47, 49, 48, 50, 49, 48, 49, 50, 48, 49, 49.33,
        ],
        fill: true,
        tension: 0.4,
        borderColor: '#dc2626', // Error red - Material Design 3
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  stockData2: ChartConfiguration['data'] = {
    labels: Array(30).fill(''),
    datasets: [
      {
        data: [
          115, 117, 116, 118, 120, 119, 121, 120, 122, 121, 123, 122, 124, 123,
          125, 124, 126, 125, 127, 126, 125, 127, 126, 128, 127, 128, 126, 127,
          128, 129.1,
        ],
        fill: true,
        tension: 0.4,
        borderColor: '#16a34a', // Success green - Material Design success color
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  stockData3: ChartConfiguration['data'] = {
    labels: Array(30).fill(''),
    datasets: [
      {
        data: [
          82, 83, 82, 84, 83, 85, 84, 86, 85, 84, 86, 85, 87, 86, 85, 87, 86,
          88, 87, 86, 88, 87, 89, 88, 87, 88, 89, 88, 89, 89.8,
        ],
        fill: true,
        tension: 0.4,
        borderColor: '#16a34a', // Success green - Material Design success color
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  // ============================================
  // Usage/Quota Cards - Pure HTML Code
  // ============================================
  usageCardsCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Requests -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Requests</div>
      <div class="text-3xl font-semibold text-heading mb-3">996</div>
      <mat-progress-bar mode="determinate" [value]="9.96" class="mb-2"></mat-progress-bar>
      <div class="flex justify-between text-sm">
        <span class="font-medium text-blue-600">9.96%</span>
        <span class="text-secondary">996 of 10,000</span>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Credits -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Credits</div>
      <div class="text-3xl font-semibold text-heading mb-3">$672</div>
      <mat-progress-bar mode="determinate" [value]="67.2" class="mb-2"></mat-progress-bar>
      <div class="flex justify-between text-sm">
        <span class="font-medium text-blue-600">67.2%</span>
        <span class="text-secondary">$672 of $1,000</span>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Storage -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Storage</div>
      <div class="text-3xl font-semibold text-heading mb-3">1.85</div>
      <mat-progress-bar mode="determinate" [value]="18.5" class="mb-2"></mat-progress-bar>
      <div class="flex justify-between text-sm">
        <span class="font-medium text-blue-600">18.5%</span>
        <span class="text-secondary">1.85 of 10GB</span>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Resource Usage Alternative - Pure HTML Code
  // ============================================
  resourceUsageCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Requests -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Requests</div>
      <div class="text-3xl font-semibold text-heading mb-3">996</div>
      <mat-progress-bar mode="determinate" [value]="9.96" class="mb-2"></mat-progress-bar>
      <div class="flex justify-between text-sm">
        <span class="font-medium text-blue-600">9.96%</span>
        <span class="text-secondary">996 of 10,000</span>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Credits -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Credits</div>
      <div class="text-3xl font-semibold text-heading mb-3">$672</div>
      <mat-progress-bar mode="determinate" [value]="67.2" class="mb-2"></mat-progress-bar>
      <div class="flex justify-between text-sm">
        <span class="font-medium text-blue-600">67.2%</span>
        <span class="text-secondary">$672 of $1,000</span>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Storage -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Storage</div>
      <div class="text-3xl font-semibold text-heading mb-3">1.85</div>
      <mat-progress-bar mode="determinate" [value]="18.5" class="mb-2"></mat-progress-bar>
      <div class="flex justify-between text-sm">
        <span class="font-medium text-blue-600">18.5%</span>
        <span class="text-secondary">1.85 of 10GB</span>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Sales Channel Distribution - Pure HTML Code
  // ============================================
  salesDistributionCode = `<div class="max-w-4xl">
  <!-- Header -->
  <div class="mb-6">
    <div class="text-sm text-secondary mb-2">Total sales</div>
    <div class="text-4xl font-semibold text-heading mb-4">$292,400</div>
    <div class="text-sm text-secondary mb-3">Sales channel distribution</div>

    <!-- Segmented Progress Bar -->
    <div class="flex gap-1 w-full h-3 rounded-full overflow-hidden">
      <div class="bg-info" style="width: 34.4%"></div>
      <div class="bg-warning" style="width: 30.6%"></div>
      <div class="bg-cyan" style="width: 20.9%"></div>
      <div class="bg-text-secondary" style="width: 14.1%"></div>
    </div>
  </div>

  <!-- Breakdown Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Direct sales -->
    <mat-card class="kpi-card cursor-pointer hover:shadow-md transition-shadow">
      <mat-card-content class="flex items-start justify-between">
        <div class="flex items-start gap-2">
          <div class="w-3 h-3 rounded-sm bg-info mt-1.5"></div>
          <div>
            <div class="text-sm text-secondary mb-1">Direct sales</div>
            <div class="text-lg font-semibold text-heading">34.4% · $100.5K</div>
          </div>
        </div>
        <mat-icon class="text-subtle">arrow_forward</mat-icon>
      </mat-card-content>
    </mat-card>

    <!-- Retail stores -->
    <mat-card class="kpi-card cursor-pointer hover:shadow-md transition-shadow">
      <mat-card-content class="flex items-start justify-between">
        <div class="flex items-start gap-2">
          <div class="w-3 h-3 rounded-sm bg-warning mt-1.5"></div>
          <div>
            <div class="text-sm text-secondary mb-1">Retail stores</div>
            <div class="text-lg font-semibold text-heading">30.6% · $89.5K</div>
          </div>
        </div>
        <mat-icon class="text-subtle">arrow_forward</mat-icon>
      </mat-card-content>
    </mat-card>

    <!-- E-commerce -->
    <mat-card class="kpi-card cursor-pointer hover:shadow-md transition-shadow">
      <mat-card-content class="flex items-start justify-between">
        <div class="flex items-start gap-2">
          <div class="w-3 h-3 rounded-sm bg-cyan mt-1.5"></div>
          <div>
            <div class="text-sm text-secondary mb-1">E-commerce</div>
            <div class="text-lg font-semibold text-heading">20.9% · $61.2K</div>
          </div>
        </div>
        <mat-icon class="text-subtle">arrow_forward</mat-icon>
      </mat-card-content>
    </mat-card>

    <!-- Wholesale -->
    <mat-card class="kpi-card cursor-pointer hover:shadow-md transition-shadow">
      <mat-card-content class="flex items-start justify-between">
        <div class="flex items-start gap-2">
          <div class="w-3 h-3 rounded-sm bg-text-secondary mt-1.5"></div>
          <div>
            <div class="text-sm text-secondary mb-1">Wholesale</div>
            <div class="text-lg font-semibold text-heading">14.1% · $41.2K</div>
          </div>
        </div>
        <mat-icon class="text-subtle">arrow_forward</mat-icon>
      </mat-card-content>
    </mat-card>
  </div>
</div>`;

  // ============================================
  // Overview Metrics with Visual Indicators - Pure HTML Code
  // ============================================
  overviewMetricsCode = `<div class="max-w-5xl">
  <mat-card class="kpi-card">
    <mat-card-content>
      <h3 class="text-xl font-semibold text-heading mb-6">Overview</h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Lead-to-Quote Ratio -->
        <div>
          <div class="text-sm text-secondary mb-3">Lead-to-Quote Ratio</div>
          <div class="flex items-center gap-3 mb-2">
            <div class="flex gap-0.5">
              <div class="w-1 h-6 bg-warning rounded-sm"></div>
              <div class="w-1 h-6 bg-warning rounded-sm"></div>
              <div class="w-1 h-6 bg-border rounded-sm"></div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-semibold text-heading">59.8%</span>
              <span class="text-lg text-subtle">- 450/752</span>
            </div>
          </div>
        </div>

        <!-- Project Load -->
        <div>
          <div class="text-sm text-secondary mb-3">Project Load</div>
          <div class="flex items-center gap-3 mb-2">
            <div class="flex gap-0.5">
              <div class="w-1 h-6 bg-error rounded-sm"></div>
              <div class="w-1 h-6 bg-error rounded-sm"></div>
              <div class="w-1 h-6 bg-error rounded-sm"></div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-semibold text-heading">12.9%</span>
              <span class="text-lg text-subtle">- 129/1K</span>
            </div>
          </div>
        </div>

        <!-- Win Probability -->
        <div>
          <div class="text-sm text-secondary mb-3">Win Probability</div>
          <div class="flex items-center gap-3 mb-2">
            <div class="flex gap-0.5">
              <div class="w-1 h-6 bg-success rounded-sm"></div>
              <div class="w-1 h-6 bg-success rounded-sm"></div>
              <div class="w-1 h-6 bg-border rounded-sm"></div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-semibold text-heading">85.1%</span>
              <span class="text-lg text-subtle">- 280/329</span>
            </div>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // KPI Cards - Business Metrics
  // ============================================
  kpiCards: KPICard[] = [
    {
      label: 'Total Revenue',
      value: '$2,456,789',
      change: 12.5,
      changeLabel: 'from last month',
      icon: 'payments',
      trend: 'up',
      category: 'Sales',
    },
    {
      label: 'Active Users',
      value: '45,231',
      change: 8.3,
      changeLabel: 'from last week',
      icon: 'people',
      trend: 'up',
      category: 'Users',
    },
    {
      label: 'Conversion Rate',
      value: '3.24%',
      change: -2.1,
      changeLabel: 'from last month',
      icon: 'trending_up',
      trend: 'down',
      category: 'Marketing',
    },
    {
      label: 'Support Tickets',
      value: '142',
      change: -15.7,
      changeLabel: 'from yesterday',
      icon: 'support',
      trend: 'up', // Less tickets is good, but showing as "improvement"
      category: 'Support',
    },
  ];

  // ============================================
  // Metric Cards - Progress & Capacity
  // ============================================
  metricCards: MetricCard[] = [
    {
      label: 'Storage Used',
      value: 45.8,
      total: 100,
      unit: 'GB',
      status: 'neutral',
      subtitle: 'of 100 GB allocated',
    },
    {
      label: 'API Rate Limit',
      value: 892,
      total: 1000,
      unit: 'calls',
      status: 'warning',
      subtitle: 'Resets in 4 hours',
    },
    {
      label: 'Database Capacity',
      value: 87.4,
      total: 100,
      unit: '%',
      status: 'critical',
      subtitle: 'Action required soon',
    },
    {
      label: 'Monthly Goal',
      value: 68,
      total: 100,
      unit: '%',
      status: 'success',
      subtitle: '22 days remaining',
    },
  ];

  // ============================================
  // Status Cards - System Health
  // ============================================
  statusCards: StatusCard[] = [
    {
      title: 'API Services',
      status: 'operational',
      message: 'All systems operational',
      timestamp: '2 minutes ago',
      details: '99.98% uptime this month',
    },
    {
      title: 'Database Cluster',
      status: 'degraded',
      message: 'Experiencing high latency',
      timestamp: '15 minutes ago',
      details: 'Team is investigating',
    },
    {
      title: 'Payment Gateway',
      status: 'maintenance',
      message: 'Scheduled maintenance',
      timestamp: 'Started 1 hour ago',
      details: 'Expected completion: 2:00 PM',
    },
    {
      title: 'Email Service',
      status: 'outage',
      message: 'Service unavailable',
      timestamp: '5 minutes ago',
      details: 'Failover in progress',
    },
  ];

  // ============================================
  // Performance Metrics - Comparisons
  // ============================================
  performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Page Load Time',
      current: 1.24,
      previous: 1.58,
      unit: 's',
      target: 1.5,
    },
    {
      label: 'Response Time (p95)',
      current: 245,
      previous: 189,
      unit: 'ms',
      target: 200,
    },
    {
      label: 'Error Rate',
      current: 0.12,
      previous: 0.08,
      unit: '%',
      target: 0.1,
    },
    {
      label: 'Throughput',
      current: 1247,
      previous: 1089,
      unit: 'req/s',
      target: 1200,
    },
  ];

  /**
   * Get status color class based on status type
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      operational: 'status-success',
      degraded: 'status-warning',
      outage: 'status-error',
      maintenance: 'status-info',
      success: 'status-success',
      warning: 'status-warning',
      critical: 'status-error',
      neutral: 'status-neutral',
    };
    return colors[status] || 'status-neutral';
  }

  /**
   * Get status icon based on status type
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      operational: 'check_circle',
      degraded: 'warning',
      outage: 'error',
      maintenance: 'build',
      success: 'check_circle',
      warning: 'warning',
      critical: 'error',
      neutral: 'info',
    };
    return icons[status] || 'info';
  }

  /**
   * Calculate percentage for progress bars
   */
  getPercentage(value: number, total: number): number {
    return Math.min((value / total) * 100, 100);
  }

  /**
   * Calculate performance change percentage
   */
  getPerformanceChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Determine if performance change is positive (depends on metric type)
   */
  isPerformanceImprovement(
    label: string,
    current: number,
    previous: number,
  ): boolean {
    // For error rate and response time, lower is better
    const lowerIsBetter =
      label.toLowerCase().includes('error') ||
      label.toLowerCase().includes('time');
    return lowerIsBetter ? current < previous : current > previous;
  }

  // ============================================
  // Trend Cards - Sparkline Charts
  // ============================================

  // ============================================
  // Trend Comparison Cards - Pure HTML Code
  // ============================================
  trendComparisonCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Call Volume Trends -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-base font-semibold text-heading mb-4">Call Volume Trends</div>

      <div class="mb-4">
        <!-- Today -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 bg-info rounded-sm"></div>
          <span class="text-xs text-secondary">Today</span>
        </div>
        <div class="text-3xl font-semibold text-heading mb-3">573</div>

        <!-- Yesterday -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 bg-gray-400 rounded-sm"></div>
          <span class="text-xs text-secondary">Yesterday</span>
        </div>
        <div class="text-3xl font-semibold text-heading">451</div>
      </div>

      <!-- Chart -->
      <div class="h-24 mb-2">
        <canvas baseChart [data]="callVolumeData" [options]="comparisonChartOptions" [type]="'line'"></canvas>
      </div>

      <!-- Time Range -->
      <div class="flex justify-between text-xs text-secondary">
        <span>0:00 AM</span>
        <span>11:59 AM</span>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Query Volume Trends -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-base font-semibold text-heading mb-4">Query Volume Trends</div>

      <div class="mb-4">
        <!-- Today -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 bg-info rounded-sm"></div>
          <span class="text-xs text-secondary">Today</span>
        </div>
        <div class="text-3xl font-semibold text-heading mb-3">5,730</div>

        <!-- Yesterday -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 bg-gray-400 rounded-sm"></div>
          <span class="text-xs text-secondary">Yesterday</span>
        </div>
        <div class="text-3xl font-semibold text-heading">4,510</div>
      </div>

      <!-- Chart -->
      <div class="h-24 mb-2">
        <canvas baseChart [data]="queryVolumeData" [options]="comparisonChartOptions" [type]="'line'"></canvas>
      </div>

      <!-- Time Range -->
      <div class="flex justify-between text-xs text-secondary">
        <span>0:00 AM</span>
        <span>11:59 AM</span>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- ETL Pipeline Performance -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-base font-semibold text-heading mb-4">ETL Pipeline Performance</div>

      <div class="mb-4">
        <!-- Processing (ms) -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 bg-purple rounded-sm"></div>
          <span class="text-xs text-secondary">Processing (ms)</span>
        </div>
        <div class="text-3xl font-semibold text-heading mb-3">4,200</div>

        <!-- Volume (MB) -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <span class="text-xs text-secondary">Volume (MB)</span>
        </div>
        <div class="text-3xl font-semibold text-heading">3,000</div>
      </div>

      <!-- Chart -->
      <div class="h-24 mb-2">
        <canvas baseChart [data]="etlPerformanceData" [options]="comparisonChartOptions" [type]="'line'"></canvas>
      </div>

      <!-- Time Range -->
      <div class="flex justify-between text-xs text-secondary">
        <span>0:00 AM</span>
        <span>11:59 AM</span>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // Shared sparkline options for all trend cards
  sparklineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Smooth curves
        borderWidth: 2,
      },
      point: {
        radius: 0, // No points on the line
      },
    },
  };

  // Monthly users data (12 months)
  monthlyUsersData: ChartConfiguration['data'] = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        data: [245, 268, 289, 312, 298, 285, 305, 322, 310, 295, 287, 275],
        fill: true,
        borderColor: '#3b82f6', // Info blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  // Monthly sessions data (12 months)
  monthlySessionsData: ChartConfiguration['data'] = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        data: [
          1240, 1368, 1489, 1612, 1598, 1685, 1805, 1922, 2010, 2095, 2187,
          2240,
        ],
        fill: true,
        borderColor: '#3b82f6', // Info blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  // Monthly revenue data (12 months)
  monthlyRevenueData: ChartConfiguration['data'] = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        data: [
          24500, 26800, 28900, 31200, 29800, 28500, 30500, 32200, 31000, 29500,
          28700, 27500,
        ],
        fill: true,
        borderColor: '#3b82f6', // Info blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  // ============================================
  // Trend Comparison Charts - Dual Line Data
  // ============================================

  // Shared options for comparison charts
  comparisonChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 0,
      },
    },
  };

  // Call Volume: Today vs Yesterday
  callVolumeData: ChartConfiguration['data'] = {
    labels: Array(24).fill(''),
    datasets: [
      {
        label: 'Today',
        data: [
          120, 145, 165, 180, 195, 210, 235, 260, 290, 320, 355, 390, 425, 460,
          485, 510, 535, 555, 570, 575, 573, 573, 573, 573,
        ],
        fill: true,
        borderColor: '#3b82f6', // Info blue - primary metric
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
      {
        label: 'Yesterday',
        data: [
          95, 115, 135, 150, 170, 185, 205, 225, 250, 270, 295, 315, 340, 360,
          380, 400, 420, 435, 445, 450, 451, 451, 451, 451,
        ],
        fill: true,
        borderColor: '#94a3b8', // Subtle gray - comparison metric
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  // Query Volume: Today vs Yesterday
  queryVolumeData: ChartConfiguration['data'] = {
    labels: Array(24).fill(''),
    datasets: [
      {
        label: 'Today',
        data: [
          1200, 1450, 1850, 2200, 2500, 2850, 3100, 3450, 3800, 4100, 4350,
          4650, 4900, 5100, 5300, 5450, 5600, 5690, 5720, 5730, 5730, 5730,
          5730, 5730,
        ],
        fill: true,
        borderColor: '#3b82f6', // Info blue - primary metric
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
      {
        label: 'Yesterday',
        data: [
          950, 1200, 1500, 1800, 2050, 2300, 2600, 2850, 3100, 3300, 3500, 3700,
          3900, 4050, 4200, 4320, 4420, 4480, 4500, 4510, 4510, 4510, 4510,
          4510,
        ],
        fill: true,
        borderColor: '#94a3b8', // Subtle gray - comparison metric
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  // ETL Performance: Processing time vs Volume
  etlPerformanceData: ChartConfiguration['data'] = {
    labels: Array(24).fill(''),
    datasets: [
      {
        label: 'Processing (ms)',
        data: [
          3200, 3350, 3500, 3650, 3800, 3900, 4000, 4100, 4200, 4250, 4300,
          4350, 4380, 4400, 4350, 4300, 4250, 4220, 4200, 4200, 4200, 4200,
          4200, 4200,
        ],
        fill: true,
        borderColor: '#a855f7', // Purple - processing metric
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
      },
      {
        label: 'Volume (MB)',
        data: [
          1800, 2000, 2200, 2350, 2500, 2600, 2700, 2750, 2800, 2850, 2900,
          2920, 2950, 2980, 2990, 3000, 3000, 3000, 3000, 3000, 3000, 3000,
          3000, 3000,
        ],
        fill: true,
        borderColor: '#3b82f6', // Info blue - volume metric
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
    ],
  };

  // ============================================
  // Donut Charts - Performance Metrics
  // ============================================
  donutChartsCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- SLA Performance -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="text-base font-semibold text-heading mb-4">SLA Performance</div>

        <!-- Within SLA -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 bg-info rounded-sm"></div>
            <span class="text-xs text-secondary">Within SLA</span>
          </div>
          <div class="text-3xl font-semibold text-heading">83.3%</div>
        </div>

        <!-- SLA Breached -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 bg-error rounded-sm"></div>
            <span class="text-xs text-secondary">SLA Breached</span>
          </div>
          <div class="text-3xl font-semibold text-heading">16.7%</div>
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="w-32 h-32 flex-shrink-0">
        <canvas baseChart [data]="slaPerformanceData" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Response Time -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="text-base font-semibold text-heading mb-4">Response Time</div>

        <!-- Under Threshold -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 bg-info rounded-sm"></div>
            <span class="text-xs text-secondary">Under Threshold</span>
          </div>
          <div class="text-3xl font-semibold text-heading">95.8%</div>
        </div>

        <!-- Over Threshold -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 bg-error rounded-sm"></div>
            <span class="text-xs text-secondary">Over Threshold</span>
          </div>
          <div class="text-3xl font-semibold text-heading">4.2%</div>
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="w-32 h-32 flex-shrink-0">
        <canvas baseChart [data]="responseTimeData" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Cache Performance -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="text-base font-semibold text-heading mb-4">Cache Performance</div>

        <!-- Cache Hits -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 bg-info rounded-sm"></div>
            <span class="text-xs text-secondary">Cache Hits</span>
          </div>
          <div class="text-3xl font-semibold text-heading">78.4%</div>
        </div>

        <!-- Cache Misses -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 bg-error rounded-sm"></div>
            <span class="text-xs text-secondary">Cache Misses</span>
          </div>
          <div class="text-3xl font-semibold text-heading">21.6%</div>
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="w-32 h-32 flex-shrink-0">
        <canvas baseChart [data]="cachePerformanceData" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // Donut chart options
  // Note: Using 'any' type because 'cutout' is specific to DoughnutController
  // and not available in generic ChartConfiguration['options']
  donutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Creates donut hole (70% of chart radius)
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  // SLA Performance Data
  slaPerformanceData: ChartConfiguration['data'] = {
    labels: ['Within SLA', 'SLA Breached'],
    datasets: [
      {
        data: [83.3, 16.7],
        backgroundColor: [
          '#3b82f6', // Info blue - success/within SLA
          '#e2e8f0', // Very light gray (Slate 200) - failure/breached
        ],
        borderWidth: 0,
      },
    ],
  };

  // Response Time Data
  responseTimeData: ChartConfiguration['data'] = {
    labels: ['Under Threshold', 'Over Threshold'],
    datasets: [
      {
        data: [95.8, 4.2],
        backgroundColor: [
          '#3b82f6', // Info blue - success/under threshold
          '#e2e8f0', // Very light gray (Slate 200) - failure/over threshold
        ],
        borderWidth: 0,
      },
    ],
  };

  // Cache Performance Data
  cachePerformanceData: ChartConfiguration['data'] = {
    labels: ['Cache Hits', 'Cache Misses'],
    datasets: [
      {
        data: [78.4, 21.6],
        backgroundColor: [
          '#3b82f6', // Info blue - success/cache hits
          '#e2e8f0', // Very light gray (Slate 200) - failure/cache misses
        ],
        borderWidth: 0,
      },
    ],
  };

  // ============================================
  // Token Usage Cards - Pure HTML Code
  // ============================================
  tokenUsageCode = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Average tokens per request -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Average tokes per requests</div>
      <div class="text-4xl font-semibold text-heading mb-4">341</div>

      <!-- Segmented Progress Bar -->
      <div class="flex gap-0 w-full h-2 mb-3 rounded-sm overflow-hidden">
        <div class="bg-cyan" style="width: 39.9%"></div>
        <div class="bg-purple" style="width: 60.1%"></div>
      </div>

      <!-- Legend -->
      <div class="flex gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-cyan"></div>
          <span class="text-heading font-medium">136</span>
          <span class="text-secondary">Completion tokens</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-purple"></div>
          <span class="text-heading font-medium">205</span>
          <span class="text-secondary">Prompt tokens</span>
        </div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Total tokens -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-2">Total tokens</div>
      <div class="text-4xl font-semibold text-heading mb-4">4,229</div>

      <!-- Segmented Progress Bar -->
      <div class="flex gap-0 w-full h-2 mb-3 rounded-sm overflow-hidden">
        <div class="bg-cyan" style="width: 35%"></div>
        <div class="bg-purple" style="width: 65%"></div>
      </div>

      <!-- Legend -->
      <div class="flex gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-cyan"></div>
          <span class="text-heading font-medium">1,480</span>
          <span class="text-secondary">Completion tokens</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-purple"></div>
          <span class="text-heading font-medium">2,749</span>
          <span class="text-secondary">Prompt tokens</span>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Web Vitals Score Cards - Pure HTML Code
  // ============================================
  webVitalsCode = `<div class="max-w-6xl">
  <!-- Header with Legend -->
  <div class="mb-6">
    <div class="flex items-start justify-between mb-2">
      <div>
        <h3 class="text-xl font-semibold text-heading mb-2">Web vitals scores</h3>
        <p class="text-sm text-secondary">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</p>
      </div>
      <!-- Color Legend -->
      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 bg-error rounded-sm"></div>
          <span class="text-secondary">0-50</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 bg-warning rounded-sm"></div>
          <span class="text-secondary">50-75</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 bg-success rounded-sm"></div>
          <span class="text-secondary">75-100</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Score Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Performance -->
    <mat-card class="kpi-card">
      <mat-card-content class="flex items-center justify-between">
        <div>
          <div class="text-sm text-secondary mb-2">Performance</div>
          <div class="flex items-baseline gap-1">
            <span class="text-5xl font-semibold text-heading">91</span>
            <span class="text-xl text-secondary">/100</span>
          </div>
        </div>
        <!-- Circular Progress (91%) -->
        <div class="relative w-20 h-20">
          <svg class="transform -rotate-90" width="80" height="80">
            <circle cx="40" cy="40" r="32" fill="none" class="svg-stroke-track" stroke-width="8"></circle>
            <circle cx="40" cy="40" r="32" fill="none" class="svg-stroke-info" stroke-width="8"
              stroke-dasharray="201" stroke-dashoffset="18.1" stroke-linecap="round"></circle>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-sm font-semibold text-heading">91</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Accessibility -->
    <mat-card class="kpi-card">
      <mat-card-content class="flex items-center justify-between">
        <div>
          <div class="text-sm text-secondary mb-2">Accessibility</div>
          <div class="flex items-baseline gap-1">
            <span class="text-5xl font-semibold text-heading">65</span>
            <span class="text-xl text-secondary">/100</span>
          </div>
        </div>
        <!-- Circular Progress (65%) -->
        <div class="relative w-20 h-20">
          <svg class="transform -rotate-90" width="80" height="80">
            <circle cx="40" cy="40" r="32" fill="none" class="svg-stroke-track" stroke-width="8"></circle>
            <circle cx="40" cy="40" r="32" fill="none" class="svg-stroke-info" stroke-width="8"
              stroke-dasharray="201" stroke-dashoffset="70.35" stroke-linecap="round"></circle>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-sm font-semibold text-heading">65</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- SEO -->
    <mat-card class="kpi-card">
      <mat-card-content class="flex items-center justify-between">
        <div>
          <div class="text-sm text-secondary mb-2">SEO</div>
          <div class="flex items-baseline gap-1">
            <span class="text-5xl font-semibold text-heading">43</span>
            <span class="text-xl text-secondary">/100</span>
          </div>
        </div>
        <!-- Circular Progress (43%) -->
        <div class="relative w-20 h-20">
          <svg class="transform -rotate-90" width="80" height="80">
            <circle cx="40" cy="40" r="32" fill="none" class="svg-stroke-track" stroke-width="8"></circle>
            <circle cx="40" cy="40" r="32" fill="none" class="svg-stroke-info-muted" stroke-width="8"
              stroke-dasharray="201" stroke-dashoffset="114.57" stroke-linecap="round"></circle>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-sm font-semibold text-heading">43</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  </div>
</div>`;

  // ============================================
  // Horizontal Progress Bars - Pure HTML Code
  // ============================================
  horizontalBarsCode = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Average tokens per request -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-3">Average tokes per requests</div>
      <div class="text-4xl font-semibold text-heading mb-6">341</div>

      <!-- Completion token -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-secondary">Completion token</span>
          <span class="text-sm font-medium text-heading">136 (40%)</span>
        </div>
        <div class="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
          <div class="h-full bg-info rounded-full" style="width: 40%"></div>
        </div>
      </div>

      <!-- Prompt token -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-secondary">Prompt token</span>
          <span class="text-sm font-medium text-heading">205 (60%)</span>
        </div>
        <div class="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
          <div class="h-full bg-info rounded-full" style="width: 60%"></div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Total tokens -->
  <mat-card class="kpi-card">
    <mat-card-content>
      <div class="text-sm text-secondary mb-3">Total tokens</div>
      <div class="text-4xl font-semibold text-heading mb-6">4,229</div>

      <!-- Completion token -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-secondary">Completion token</span>
          <span class="text-sm font-medium text-heading">1,480 (35%)</span>
        </div>
        <div class="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
          <div class="h-full bg-info rounded-full" style="width: 35%"></div>
        </div>
      </div>

      <!-- Prompt token -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-secondary">Prompt token</span>
          <span class="text-sm font-medium text-heading">2,749 (65%)</span>
        </div>
        <div class="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
          <div class="h-full bg-info rounded-full" style="width: 65%"></div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Ring Charts - Pure HTML/SVG Code
  // ============================================
  ringChartsCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- SLA Performance -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex items-start justify-between">
      <div class="flex-1">
        <div class="text-base font-semibold text-heading mb-6">SLA Performance</div>

        <!-- Within SLA -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 bg-info rounded-sm"></div>
            <span class="text-sm text-secondary">Within SLA</span>
          </div>
          <div class="text-3xl font-semibold text-heading">83.3%</div>
        </div>

        <!-- SLA Breached -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 bg-error rounded-sm"></div>
            <span class="text-sm text-secondary">SLA Breached</span>
          </div>
          <div class="text-3xl font-semibold text-heading">16.7%</div>
        </div>
      </div>

      <!-- Ring Chart (83.3%) -->
      <div class="w-32 h-32 flex-shrink-0">
        <svg class="transform -rotate-90" width="90" height="90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="52" fill="none" class="svg-stroke-track" stroke-width="10"></circle>
          <circle cx="64" cy="64" r="52" fill="none" class="svg-stroke-info" stroke-width="10"
            stroke-dasharray="327" stroke-dashoffset="54.6" stroke-linecap="round"></circle>
        </svg>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Response Time -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex items-start justify-between">
      <div class="flex-1">
        <div class="text-base font-semibold text-heading mb-6">Response Time</div>

        <!-- Under Threshold -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 bg-info rounded-sm"></div>
            <span class="text-sm text-secondary">Under Threshold</span>
          </div>
          <div class="text-3xl font-semibold text-heading">95.8%</div>
        </div>

        <!-- Over Threshold -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 bg-error rounded-sm"></div>
            <span class="text-sm text-secondary">Over Threshold</span>
          </div>
          <div class="text-3xl font-semibold text-heading">4.2%</div>
        </div>
      </div>

      <!-- Ring Chart (95.8%) -->
      <div class="w-32 h-32 flex-shrink-0">
        <svg class="transform -rotate-90" width="90" height="90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="52" fill="none" class="svg-stroke-track" stroke-width="10"></circle>
          <circle cx="64" cy="64" r="52" fill="none" class="svg-stroke-info" stroke-width="10"
            stroke-dasharray="327" stroke-dashoffset="13.7" stroke-linecap="round"></circle>
        </svg>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Cache Performance -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex items-start justify-between">
      <div class="flex-1">
        <div class="text-base font-semibold text-heading mb-6">Cache Performance</div>

        <!-- Cache Hits -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 bg-info rounded-sm"></div>
            <span class="text-sm text-secondary">Cache Hits</span>
          </div>
          <div class="text-3xl font-semibold text-heading">78.4%</div>
        </div>

        <!-- Cache Misses -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 bg-error rounded-sm"></div>
            <span class="text-sm text-secondary">Cache Misses</span>
          </div>
          <div class="text-3xl font-semibold text-heading">21.6%</div>
        </div>
      </div>

      <!-- Ring Chart (78.4%) -->
      <div class="w-32 h-32 flex-shrink-0">
        <svg class="transform -rotate-90" width="90" height="90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="52" fill="none" class="svg-stroke-track" stroke-width="10"></circle>
          <circle cx="64" cy="64" r="52" fill="none" class="svg-stroke-info" stroke-width="10"
            stroke-dasharray="327" stroke-dashoffset="70.6" stroke-linecap="round"></circle>
        </svg>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  // ============================================
  // Color Accent Metrics - Pure HTML Code
  // ============================================
  colorAccentCode = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Monthly active users -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex gap-4">
      <!-- Color Accent Bar -->
      <div class="w-1 bg-info rounded-full flex-shrink-0"></div>

      <!-- Content -->
      <div class="flex-1">
        <div class="flex items-start justify-between mb-3">
          <span class="text-sm text-secondary">Monthly active users</span>
          <span class="text-sm font-medium text-success">+1.3%</span>
        </div>
        <div class="text-4xl font-semibold text-heading">996</div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Monthly sessions -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex gap-4">
      <!-- Color Accent Bar -->
      <div class="w-1 bg-purple rounded-full flex-shrink-0"></div>

      <!-- Content -->
      <div class="flex-1">
        <div class="flex items-start justify-between mb-3">
          <span class="text-sm text-secondary">Monthly sessions</span>
          <span class="text-sm font-medium text-success">+9.1%</span>
        </div>
        <div class="text-4xl font-semibold text-heading">1,672</div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Monthly user growth -->
  <mat-card class="kpi-card">
    <mat-card-content class="flex gap-4">
      <!-- Color Accent Bar -->
      <div class="w-1 bg-pink-500 rounded-full flex-shrink-0"></div>

      <!-- Content -->
      <div class="flex-1">
        <div class="flex items-start justify-between mb-3">
          <span class="text-sm text-secondary">Monthly user growth</span>
          <span class="text-sm font-medium text-red-600">-4.8%</span>
        </div>
        <div class="text-4xl font-semibold text-heading">5.1%</div>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  /**
   * Scroll to a specific section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Scroll to top of page
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Expose Math for template
  Math = Math;

  // ============================================
  // Code Preview Examples
  // ============================================

  basicStatsCode = `<!-- Basic Stats with Change Indicator (Material + Tailwind) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <mat-card>
    <mat-card-content>
      <div class="flex items-center gap-3 mb-2">
        <mat-icon class="text-secondary dark:text-subtle">payments</mat-icon>
        <p class="text-sm font-medium text-secondary dark:text-subtle">Total Revenue</p>
      </div>
      <h3 class="text-3xl font-semibold mb-2">$2,456,789</h3>
      <p class="text-sm font-medium text-success">
        <span>+12.5%</span>
        <span class="text-secondary ml-1">from last month</span>
      </p>
    </mat-card-content>
  </mat-card>
</div>`;

  badgedChangeCode = `<!-- Badged Change Pattern with Colored Chips -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <mat-card>
    <mat-card-content>
      <div class="flex items-center justify-between mb-3">
        <mat-icon class="text-secondary dark:text-subtle">people</mat-icon>
        <mat-chip class="!text-xs !h-6 !px-2 !bg-green-100 !text-green-700">
          +8.3%
        </mat-chip>
      </div>
      <p class="text-sm font-medium text-secondary dark:text-subtle mb-2">Active Users</p>
      <h3 class="text-2xl font-semibold">45,231</h3>
    </mat-card-content>
  </mat-card>
</div>`;

  valueFirstCode = `<!-- Value-First Layout - Inverted Hierarchy -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <mat-card>
    <mat-card-content>
      <h3 class="text-4xl font-bold mb-3">$2,456,789</h3>
      <p class="text-base font-medium text-primary dark:text-gray-300 mb-2">Total Revenue</p>
      <p class="text-sm font-medium text-success">
        ↑ 12.5% from last month
      </p>
    </mat-card-content>
  </mat-card>
</div>`;

  footerActionCode = `<!-- Card with Footer Action Link -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <mat-card>
    <mat-card-content>
      <div class="flex items-center gap-3 mb-2">
        <mat-icon class="text-secondary dark:text-subtle">payments</mat-icon>
        <p class="text-sm font-medium text-secondary dark:text-subtle">Total Revenue</p>
      </div>
      <h3 class="text-3xl font-semibold mb-1">$2,456,789</h3>
      <p class="text-sm text-secondary mb-4">+12.5% from last month</p>
    </mat-card-content>
    <mat-divider></mat-divider>
    <mat-card-actions class="!p-3">
      <button mat-button color="primary" class="!text-sm">
        View details
        <mat-icon class="!w-4 !h-4 !text-base ml-1">arrow_forward</mat-icon>
      </button>
    </mat-card-actions>
  </mat-card>
</div>`;

  comparisonCode = `<!-- Period Comparison Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <mat-card>
    <mat-card-content>
      <p class="text-sm font-medium text-secondary dark:text-subtle mb-3">Page Load Time</p>
      <div class="flex items-baseline gap-2 mb-2">
        <h3 class="text-3xl font-semibold">1.24</h3>
        <span class="text-sm text-secondary">s</span>
      </div>
      <p class="text-sm text-secondary dark:text-subtle">
        from <span class="font-medium">1.58 s</span>
      </p>
      <p class="text-sm font-medium mt-1 text-success">-21.5%</p>
    </mat-card-content>
  </mat-card>
</div>`;

  statusIndicatorCode = `<!-- Colored Status Indicators with Border -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <mat-card class="!border-l-4 !border-l-green-500">
    <mat-card-content>
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <mat-icon class="text-success">check_circle</mat-icon>
          <h3 class="text-lg font-semibold">API Services</h3>
        </div>
        <mat-chip class="!text-xs !h-6 !px-2 !bg-green-100 !text-green-700">
          operational
        </mat-chip>
      </div>
      <p class="text-sm font-medium mb-2">All systems operational</p>
      <p class="text-xs text-secondary mb-1">2 minutes ago</p>
      <p class="text-xs text-secondary dark:text-subtle">99.98% uptime this month</p>
    </mat-card-content>
  </mat-card>
</div>`;

  progressBarCode = `<!-- Resource Usage with Progress Bar -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <mat-card>
    <mat-card-content>
      <p class="text-sm font-medium text-secondary dark:text-subtle mb-3">Storage Used</p>
      <div class="flex items-baseline gap-2 mb-3">
        <h3 class="text-2xl font-semibold">45.8</h3>
        <span class="text-sm text-secondary">GB</span>
      </div>
      <mat-progress-bar
        mode="determinate"
        [value]="45.8"
        class="mb-2 !h-2 !rounded-full !bg-gray-200 ![&>div]:!bg-blue-600"
      ></mat-progress-bar>
      <div class="flex justify-between items-center text-xs">
        <span class="text-secondary dark:text-subtle">45.8%</span>
        <span class="text-secondary">of 100 GB allocated</span>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  sparklineCode = `<!-- Sparkline Chart with Trend (Chart.js) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <mat-card>
    <mat-card-content class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-secondary dark:text-subtle mb-2">
          Monthly Active Users
        </div>
        <div class="text-3xl font-semibold">275</div>
        <div class="text-sm text-red-600 font-medium mt-1">-17.2% this month</div>
      </div>
      <div class="w-32 h-16 flex-shrink-0">
        <canvas baseChart [data]="chartData" [options]="chartOptions" [type]="'line'"></canvas>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  distributionCode = `<!-- Token Distribution with Multi-Segment Bar -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <mat-card>
    <mat-card-content>
      <p class="text-sm font-medium text-secondary dark:text-subtle mb-2">Input Tokens</p>
      <h3 class="text-2xl font-semibold mb-3">45.2K</h3>
      <div class="flex h-2 rounded-full overflow-hidden mb-3">
        <div class="bg-info" style="width: 72%"></div>
        <div class="bg-border dark:bg-gray-600" style="width: 28%"></div>
      </div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-secondary dark:text-subtle">Used</span>
          <span class="font-medium">45.2K (72%)</span>
        </div>
        <div class="flex justify-between">
          <span class="text-secondary dark:text-subtle">Available</span>
          <span class="font-medium">17.5K (28%)</span>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>`;

  minimalStyleCode = `<!-- Minimal Style - Borderless with Subtle Border -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <mat-card class="!shadow-none !border !border-gray-200 dark:!border-gray-700">
    <mat-card-content>
      <p class="text-sm text-secondary dark:text-subtle mb-1">Revenue</p>
      <h3 class="text-3xl font-semibold">$2.4M</h3>
    </mat-card-content>
  </mat-card>
</div>`;
}
