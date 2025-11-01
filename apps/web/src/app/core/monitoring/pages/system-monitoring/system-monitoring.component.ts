import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreadcrumbComponent, AegisxNavigationItem } from '@aegisx/ui';
import { MonitoringService } from '../../services/monitoring.service';
import { MetricsGuideDialogComponent } from '../../components/metrics-guide-dialog/metrics-guide-dialog.component';
import Chart from 'chart.js/auto';

interface MetricCard {
  title: string;
  icon: string;
  color: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
}

@Component({
  selector: 'app-system-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule,
    MatDialogModule,
    BreadcrumbComponent,
  ],
  template: `
    <div class="monitoring-dashboard p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            System Monitoring
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Real-time system metrics and performance monitoring
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            mat-raised-button
            color="accent"
            (click)="openGuide()"
            matTooltip="เปิดคู่มือการใช้งานฉบับภาษาไทย"
          >
            <mat-icon>school</mat-icon>
            คู่มือการใช้งาน
          </button>
          <button
            mat-raised-button
            [color]="autoRefresh() ? 'accent' : 'primary'"
            (click)="toggleAutoRefresh()"
            [matTooltip]="
              autoRefresh() ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'
            "
          >
            <mat-icon>{{
              autoRefresh() ? 'pause_circle' : 'play_circle'
            }}</mat-icon>
            {{ autoRefresh() ? 'Stop Auto-Refresh' : 'Start Auto-Refresh' }}
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="refresh()"
            [disabled]="loading()"
          >
            <mat-icon>refresh</mat-icon>
            Refresh Now
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center py-12">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-4">
        <mat-card appearance="outlined" class="border-l-4 border-red-500">
          <mat-card-content class="flex items-center gap-3">
            <mat-icon class="text-red-500">error</mat-icon>
            <div>
              <h3 class="font-semibold text-red-700">Error Loading Metrics</h3>
              <p class="text-sm text-gray-600">{{ error() }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Dashboard Content -->
      <div [hidden]="loading() || error()" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <mat-card
            appearance="outlined"
            *ngFor="let card of metricCards()"
            [class]="'border-l-4 border-' + card.color + '-500'"
          >
            <mat-card-content class="p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <mat-icon [class]="'text-' + card.color + '-500'">{{
                      card.icon
                    }}</mat-icon>
                    <h3 class="text-sm font-medium text-gray-600">
                      {{ card.title }}
                    </h3>
                  </div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ card.value }}
                  </p>
                  <p *ngIf="card.subtitle" class="text-xs text-gray-500 mt-1">
                    {{ card.subtitle }}
                  </p>
                </div>
                <div
                  *ngIf="card.trend"
                  [class]="
                    'px-2 py-1 rounded text-xs font-medium ' +
                    (card.trend === 'up'
                      ? 'bg-green-100 text-green-700'
                      : card.trend === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700')
                  "
                >
                  <mat-icon class="text-xs">{{
                    card.trend === 'up'
                      ? 'trending_up'
                      : card.trend === 'down'
                        ? 'trending_down'
                        : 'trending_flat'
                  }}</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- CPU & Memory Chart -->
          <mat-card appearance="outlined">
            <mat-card-header class="pb-4">
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-blue-500">memory</mat-icon>
                CPU & Memory Usage
                <mat-icon
                  class="text-gray-400 text-lg cursor-help"
                  [matTooltip]="cpuMemoryTooltip"
                  matTooltipPosition="right"
                  >info</mat-icon
                >
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="h-64">
                <canvas #cpuMemoryChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Database Connections Chart -->
          <mat-card appearance="outlined">
            <mat-card-header class="pb-4">
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-green-500">storage</mat-icon>
                Database Connection Pool
                <mat-icon
                  class="text-gray-400 text-lg cursor-help"
                  [matTooltip]="databaseTooltip"
                  matTooltipPosition="right"
                  >info</mat-icon
                >
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="h-64">
                <canvas #databaseChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Redis Cache Chart -->
          <mat-card appearance="outlined">
            <mat-card-header class="pb-4">
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-red-500">cached</mat-icon>
                Redis Cache Performance
                <mat-icon
                  class="text-gray-400 text-lg cursor-help"
                  [matTooltip]="redisTooltip"
                  matTooltipPosition="right"
                  >info</mat-icon
                >
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="h-64">
                <canvas #redisChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- API Performance Chart -->
          <mat-card appearance="outlined">
            <mat-card-header class="pb-4">
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-purple-500">speed</mat-icon>
                API Response Times
                <mat-icon
                  class="text-gray-400 text-lg cursor-help"
                  [matTooltip]="apiResponseTooltip"
                  matTooltipPosition="right"
                  >info</mat-icon
                >
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="h-64">
                <canvas #apiChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Active Sessions & Request Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-orange-500">people</mat-icon>
                Active Sessions
                <mat-icon
                  class="text-gray-400 text-lg cursor-help"
                  [matTooltip]="activeSessionsTooltip"
                  matTooltipPosition="right"
                  >info</mat-icon
                >
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Total Sessions</span>
                  <span class="text-2xl font-bold text-gray-900">{{
                    activeSessions()?.total || 0
                  }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Unique Users</span>
                  <span class="text-2xl font-bold text-gray-900">{{
                    activeSessions()?.users || 0
                  }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-teal-500">analytics</mat-icon>
                Request Throughput
                <mat-icon
                  class="text-gray-400 text-lg cursor-help"
                  [matTooltip]="requestThroughputTooltip"
                  matTooltipPosition="right"
                  >info</mat-icon
                >
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Requests/Second</span>
                  <span class="text-2xl font-bold text-indigo-600">{{
                    apiPerformance()?.throughput?.requestsPerSecond || 0
                  }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Requests/Minute</span>
                  <span class="text-xl font-semibold text-gray-700">{{
                    apiPerformance()?.throughput?.requestsPerMinute || 0
                  }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Avg Response Time</span>
                  <span class="text-2xl font-bold text-gray-900"
                    >{{
                      apiPerformance()?.responseTime?.average?.toFixed(2) || 0
                    }}ms</span
                  >
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Last Updated Info -->
        <div class="text-center text-sm text-gray-500">
          <mat-icon class="text-xs align-middle">schedule</mat-icon>
          Last updated: {{ lastUpdated() | date: 'medium' }}
          <span *ngIf="autoRefresh()" class="ml-2">
            " Auto-refreshing every 30 seconds
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .monitoring-dashboard {
        max-width: 1400px;
        margin: 0 auto;
      }

      canvas {
        max-height: 100%;
      }
    `,
  ],
})
export class SystemMonitoringComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private monitoringService = inject(MonitoringService);
  private dialog = inject(MatDialog);

  // Breadcrumb items
  breadcrumbItems: AegisxNavigationItem[] = [
    { id: 'home', title: 'Home', type: 'basic', link: '/', icon: 'home' },
    {
      id: 'system-monitoring',
      title: 'System Monitoring',
      type: 'basic',
      link: '/monitoring/system',
      icon: 'monitoring',
    },
  ];

  // View child references for charts
  @ViewChild('cpuMemoryChart', { static: false })
  cpuMemoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('databaseChart', { static: false })
  databaseChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('redisChart', { static: false })
  redisChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('apiChart', { static: false })
  apiChartRef!: ElementRef<HTMLCanvasElement>;

  // Chart instances
  private cpuMemoryChart?: Chart;
  private databaseChart?: Chart;
  private redisChart?: Chart;
  private apiChart?: Chart;

  // Tooltip explanations for info icons
  readonly cpuMemoryTooltip = `System Resource Usage:
• CPU Usage: % of processing capacity in use
• Memory Usage: % of RAM allocated to applications
• Available: % of system resources still free`;

  readonly databaseTooltip = `Database Connection Pool Status:
• Active: Connections currently executing queries
• Idle: Available connections ready for use
• Total: Maximum configured connections (Active + Idle)`;

  readonly redisTooltip = `Redis Cache Performance Metrics:
• Hits: Requests served from cache (fast)
• Misses: Requests requiring database lookup (slower)
• Hit Rate: % of cache hits (higher is better, target >90%)`;

  readonly apiResponseTooltip = `API Response Time Statistics (milliseconds):
• Min: Fastest request (best-case scenario)
• Average: Mean response time (affected by outliers)
• Median (P50): Middle value, 50% faster/50% slower
• P95: 95% of requests are faster than this
• P99: 99% of requests are faster (worst-case threshold)
• Max: Slowest request (absolute worst-case)`;

  readonly activeSessionsTooltip = `Active User Session Tracking:
• Total Sessions: Number of active user sessions across all devices
• Unique Users: Number of individual users currently logged in`;

  readonly requestThroughputTooltip = `API Request Performance Metrics:
• Requests/Second: Number of API requests processed per second (primary metric)
• Requests/Minute: Total API requests processed per minute
• Avg Response Time: Average time to process and respond to requests`;

  // State signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  autoRefresh = signal<boolean>(false);
  lastUpdated = signal<Date>(new Date());

  // Data signals from monitoring service
  systemMetrics = computed(() => this.monitoringService.systemMetrics());
  apiPerformance = computed(() => this.monitoringService.apiPerformance());
  databaseStats = computed(() => this.monitoringService.databaseStats());
  redisStats = computed(() => this.monitoringService.redisStats());
  activeSessions = computed(() => this.monitoringService.activeSessions());
  requestMetrics = computed(() => this.monitoringService.requestMetrics());

  // Auto-refresh interval
  private refreshInterval?: ReturnType<typeof setInterval>;

  // Metric cards computed signal
  metricCards = computed<MetricCard[]>(() => {
    const system = this.systemMetrics();
    const db = this.databaseStats();
    const redis = this.redisStats();
    const sessions = this.activeSessions();

    return [
      {
        title: 'CPU Usage',
        icon: 'developer_board',
        color: 'blue',
        value: system ? `${system.cpu.usage.toFixed(1)}%` : 'N/A',
        subtitle: system ? `${system.cpu.cores} cores` : undefined,
        trend: 'stable',
      },
      {
        title: 'Memory Usage',
        icon: 'memory',
        color: 'green',
        value: system ? `${system.memory.usagePercent.toFixed(1)}%` : 'N/A',
        subtitle: system
          ? `${(system.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / ${(system.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB`
          : undefined,
        trend: 'up',
      },
      {
        title: 'DB Connections',
        icon: 'storage',
        color: 'purple',
        value: db ? `${db.pool.active}/${db.pool.total}` : 'N/A',
        subtitle: db ? `${db.pool.idle} idle` : undefined,
        trend: 'stable',
      },
      {
        title: 'Cache Hit Rate',
        icon: 'cached',
        color: 'orange',
        value: redis ? `${redis.cache.hitRate.toFixed(1)}%` : 'N/A',
        subtitle: redis
          ? `${redis.cache.hits} hits / ${redis.cache.misses} misses`
          : undefined,
        trend: 'up',
      },
    ];
  });

  ngOnInit(): void {
    this.loadAllMetrics();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
      // Update charts with loaded data if available
      this.updateCharts();
    }, 100); // Small delay to ensure ViewChild refs are ready
  }

  ngOnDestroy(): void {
    // Clean up auto-refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Destroy charts
    this.destroyCharts();
  }

  loadAllMetrics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.monitoringService.loadAllMetrics().subscribe({
      next: () => {
        this.loading.set(false);
        this.lastUpdated.set(new Date());
        this.updateCharts();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load monitoring data');
        console.error('Failed to load metrics:', err);
      },
    });
  }

  refresh(): void {
    this.loadAllMetrics();
  }

  toggleAutoRefresh(): void {
    const newState = !this.autoRefresh();
    this.autoRefresh.set(newState);

    if (newState) {
      // Start auto-refresh (every 30 seconds)
      this.refreshInterval = setInterval(() => {
        this.loadAllMetrics();
      }, 30000);
    } else {
      // Stop auto-refresh
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = undefined;
      }
    }
  }

  openGuide(): void {
    this.dialog.open(MetricsGuideDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: true,
    });
  }

  private initializeCharts(): void {
    this.createCpuMemoryChart();
    this.createDatabaseChart();
    this.createRedisChart();
    this.createApiChart();
  }

  private updateCharts(): void {
    console.log('🔄 updateCharts called', {
      cpuChart: !!this.cpuMemoryChart,
      dbChart: !!this.databaseChart,
      redisChart: !!this.redisChart,
      apiChart: !!this.apiChart,
      cpuRef: !!this.cpuMemoryChartRef,
      dbRef: !!this.databaseChartRef,
      redisRef: !!this.redisChartRef,
      apiRef: !!this.apiChartRef,
    });

    // If charts don't exist yet, try to create them
    if (!this.cpuMemoryChart && this.cpuMemoryChartRef) {
      console.log('📊 Creating CPU chart');
      this.createCpuMemoryChart();
    } else if (this.cpuMemoryChart) {
      console.log('🔄 Updating CPU chart');
      this.updateCpuMemoryChart();
    }

    if (!this.databaseChart && this.databaseChartRef) {
      console.log('📊 Creating DB chart');
      this.createDatabaseChart();
    } else if (this.databaseChart) {
      console.log('🔄 Updating DB chart');
      this.updateDatabaseChart();
    }

    if (!this.redisChart && this.redisChartRef) {
      console.log('📊 Creating Redis chart');
      this.createRedisChart();
    } else if (this.redisChart) {
      console.log('🔄 Updating Redis chart');
      this.updateRedisChart();
    }

    if (!this.apiChart && this.apiChartRef) {
      console.log('📊 Creating API chart');
      this.createApiChart();
    } else if (this.apiChart) {
      console.log('🔄 Updating API chart');
      this.updateApiChart();
    }
  }

  private destroyCharts(): void {
    this.cpuMemoryChart?.destroy();
    this.databaseChart?.destroy();
    this.redisChart?.destroy();
    this.apiChart?.destroy();
  }

  private createCpuMemoryChart(): void {
    if (!this.cpuMemoryChartRef) return;

    // Destroy existing chart if it exists
    if (this.cpuMemoryChart) {
      this.cpuMemoryChart.destroy();
      this.cpuMemoryChart = undefined;
    }

    const ctx = this.cpuMemoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const system = this.systemMetrics();
    this.cpuMemoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['CPU Usage', 'Memory Usage', 'Available'],
        datasets: [
          {
            data: [
              system ? system.cpu.usage : 0,
              system ? system.memory.usagePercent : 0,
              system ? 100 - system.memory.usagePercent : 100,
            ],
            backgroundColor: ['#3B82F6', '#10B981', '#E5E7EB'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  private createDatabaseChart(): void {
    if (!this.databaseChartRef) return;

    // Destroy existing chart if it exists
    if (this.databaseChart) {
      this.databaseChart.destroy();
      this.databaseChart = undefined;
    }

    const ctx = this.databaseChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const db = this.databaseStats();
    this.databaseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Active', 'Idle', 'Total'],
        datasets: [
          {
            label: 'Connections',
            data: [
              db?.pool.active || 0,
              db?.pool.idle || 0,
              db?.pool.total || 0,
            ],
            backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
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
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  private createRedisChart(): void {
    if (!this.redisChartRef) return;

    // Destroy existing chart if it exists
    if (this.redisChart) {
      this.redisChart.destroy();
      this.redisChart = undefined;
    }

    const ctx = this.redisChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const redis = this.redisStats();
    this.redisChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Hits', 'Misses'],
        datasets: [
          {
            data: [redis?.cache.hits || 0, redis?.cache.misses || 0],
            backgroundColor: ['#10B981', '#EF4444'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  private createApiChart(): void {
    if (!this.apiChartRef) return;

    // Destroy existing chart if it exists
    if (this.apiChart) {
      this.apiChart.destroy();
      this.apiChart = undefined;
    }

    const ctx = this.apiChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const api = this.apiPerformance();
    this.apiChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Min', 'Average', 'Median', 'P95', 'P99', 'Max'],
        datasets: [
          {
            label: 'Response Time (ms)',
            data: [
              api?.responseTime.min || 0,
              api?.responseTime.average || 0,
              api?.responseTime.median || 0,
              api?.responseTime.p95 || 0,
              api?.responseTime.p99 || 0,
              api?.responseTime.max || 0,
            ],
            backgroundColor: '#8B5CF6',
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
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  private updateCpuMemoryChart(): void {
    const system = this.systemMetrics();
    if (this.cpuMemoryChart && system) {
      this.cpuMemoryChart.data.datasets[0].data = [
        system.cpu.usage,
        system.memory.usagePercent,
        100 - system.memory.usagePercent,
      ];
      this.cpuMemoryChart.update();
    }
  }

  private updateDatabaseChart(): void {
    const db = this.databaseStats();
    if (this.databaseChart && db) {
      this.databaseChart.data.datasets[0].data = [
        db.pool.active,
        db.pool.idle,
        db.pool.total,
      ];
      this.databaseChart.update();
    }
  }

  private updateRedisChart(): void {
    const redis = this.redisStats();
    if (this.redisChart && redis) {
      this.redisChart.data.datasets[0].data = [
        redis.cache.hits,
        redis.cache.misses,
      ];
      this.redisChart.update();
    }
  }

  private updateApiChart(): void {
    const api = this.apiPerformance();
    if (this.apiChart && api) {
      this.apiChart.data.datasets[0].data = [
        api.responseTime.min,
        api.responseTime.average,
        api.responseTime.median,
        api.responseTime.p95,
        api.responseTime.p99,
        api.responseTime.max,
      ];
      this.apiChart.update();
    }
  }
}
