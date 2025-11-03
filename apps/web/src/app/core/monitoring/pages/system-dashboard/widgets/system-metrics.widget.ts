import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  DashboardService,
  SystemMetrics,
} from '../../../services/dashboard.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ax-system-metrics-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"
          >
            <mat-icon class="text-blue-600 !text-xl">speed</mat-icon>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">
              System Metrics
            </h3>
            <p class="text-xs text-slate-600">Real-time monitoring</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
            ></span>
          </span>
          <span class="text-xs text-slate-500">Live</span>
        </div>
      </div>

      <!-- Content -->
      @if (loading() && !metrics()) {
        <div class="px-6 py-12 text-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
          ></div>
          <p class="mt-3 text-sm text-slate-500">Loading metrics...</p>
        </div>
      } @else if (error()) {
        <div class="px-6 py-8 text-center">
          <mat-icon class="text-red-500 !text-4xl mb-2">error_outline</mat-icon>
          <p class="text-sm text-slate-600">{{ error() }}</p>
        </div>
      } @else if (metrics()) {
        <div class="p-6 space-y-4">
          <!-- CPU Usage -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <mat-icon class="text-blue-600 !text-lg">memory</mat-icon>
                <span class="text-sm font-medium text-slate-700"
                  >CPU Usage</span
                >
              </div>
              <span
                class="text-sm font-bold"
                [class.text-red-600]="cpuUsage() > 80"
                [class.text-amber-600]="cpuUsage() > 60 && cpuUsage() <= 80"
                [class.text-emerald-600]="cpuUsage() <= 60"
              >
                {{ cpuUsage() }}%
              </span>
            </div>
            <div class="flex h-3 rounded-full overflow-hidden bg-slate-100">
              <div
                class="transition-all duration-500"
                [style.width.%]="cpuUsage()"
                [class.bg-red-500]="cpuUsage() > 80"
                [class.bg-amber-500]="cpuUsage() > 60 && cpuUsage() <= 80"
                [class.bg-emerald-500]="cpuUsage() <= 60"
              ></div>
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ metrics()!.cpu.cores }} cores • Load:
              {{ metrics()!.cpu.loadAverage[0].toFixed(2) }}
            </div>
          </div>

          <!-- Memory Usage -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <mat-icon class="text-purple-600 !text-lg">storage</mat-icon>
                <span class="text-sm font-medium text-slate-700">Memory</span>
              </div>
              <span
                class="text-sm font-bold"
                [class.text-red-600]="memoryUsagePercent() > 85"
                [class.text-amber-600]="
                  memoryUsagePercent() > 70 && memoryUsagePercent() <= 85
                "
                [class.text-emerald-600]="memoryUsagePercent() <= 70"
              >
                {{ memoryUsagePercent() }}%
              </span>
            </div>
            <div class="flex h-3 rounded-full overflow-hidden bg-slate-100">
              <div
                class="transition-all duration-500"
                [style.width.%]="memoryUsagePercent()"
                [class.bg-red-500]="memoryUsagePercent() > 85"
                [class.bg-amber-500]="
                  memoryUsagePercent() > 70 && memoryUsagePercent() <= 85
                "
                [class.bg-purple-500]="memoryUsagePercent() <= 70"
              ></div>
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ formatBytes(metrics()!.memory.used) }} /
              {{ formatBytes(metrics()!.memory.total) }}
            </div>
          </div>

          <!-- Process Info -->
          <div class="pt-3 border-t border-slate-200">
            <div class="grid grid-cols-2 gap-3">
              <div class="flex items-center gap-2">
                <mat-icon class="text-slate-400 !text-base">timer</mat-icon>
                <div>
                  <div class="text-xs text-slate-500">Uptime</div>
                  <div class="text-sm font-semibold text-slate-700">
                    {{ formatUptime(metrics()!.process.uptime) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <mat-icon class="text-slate-400 !text-base">insights</mat-icon>
                <div>
                  <div class="text-xs text-slate-500">Process</div>
                  <div class="text-sm font-semibold text-slate-700">
                    {{ formatBytes(metrics()!.process.memoryUsage) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-slate-200 bg-slate-50">
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span>Updated: {{ formatTimestamp(metrics()!.timestamp) }}</span>
            <span>Refreshes every 5s</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SystemMetricsWidget implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private metricsSubscription?: Subscription;

  metrics = signal<SystemMetrics | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    // Load immediately
    this.loadMetrics();

    // Refresh every 5 seconds
    this.metricsSubscription = interval(5000)
      .pipe(switchMap(() => this.dashboardService.getSystemMetrics()))
      .subscribe({
        next: (response) => {
          this.metrics.set(response.data);
          this.error.set(null);
        },
        error: (err) => {
          console.error('Failed to load system metrics:', err);
          this.error.set('Failed to load system metrics');
        },
      });
  }

  ngOnDestroy() {
    this.metricsSubscription?.unsubscribe();
  }

  loadMetrics() {
    this.loading.set(true);
    this.dashboardService.getSystemMetrics().subscribe({
      next: (response) => {
        this.metrics.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load system metrics:', err);
        this.error.set('Failed to load system metrics');
        this.loading.set(false);
      },
    });
  }

  cpuUsage(): number {
    return Math.round(this.metrics()?.cpu.usage || 0);
  }

  memoryUsagePercent(): number {
    return Math.round(this.metrics()?.memory.usagePercent || 0);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  }
}
