import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  DashboardService,
  DatabasePoolStats,
  CacheStats,
} from '../../../services/dashboard.service';
import { interval, Subscription, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ax-database-performance-widget',
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
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50"
          >
            <mat-icon class="text-emerald-600 !text-xl">storage</mat-icon>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">
              Database & Cache
            </h3>
            <p class="text-xs text-slate-600">Performance metrics</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      @if (loading() && !dbStats()) {
        <div class="px-6 py-12 text-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
          ></div>
          <p class="mt-3 text-sm text-slate-500">Loading stats...</p>
        </div>
      } @else if (error()) {
        <div class="px-6 py-8 text-center">
          <mat-icon class="text-red-500 !text-4xl mb-2">error_outline</mat-icon>
          <p class="text-sm text-slate-600">{{ error() }}</p>
        </div>
      } @else if (dbStats() && cacheStats()) {
        <div class="p-6 space-y-6">
          <!-- Database Connection Pool -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <mat-icon class="text-emerald-600 !text-lg">hub</mat-icon>
              <h4 class="text-sm font-semibold text-slate-900">
                Connection Pool
              </h4>
            </div>

            <!-- Pool Stats Grid -->
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div class="bg-slate-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-slate-900">
                  {{ dbStats()!.pool.total }}
                </div>
                <div class="text-xs text-slate-600 mt-1">Total</div>
              </div>
              <div class="bg-emerald-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-emerald-700">
                  {{ dbStats()!.pool.active }}
                </div>
                <div class="text-xs text-emerald-600 mt-1">Active</div>
              </div>
              <div class="bg-blue-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-blue-700">
                  {{ dbStats()!.pool.idle }}
                </div>
                <div class="text-xs text-blue-600 mt-1">Idle</div>
              </div>
            </div>

            <!-- Pool Usage Bar -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-slate-600">Pool Usage</span>
                <span
                  class="text-xs font-semibold"
                  [class.text-red-600]="poolUsagePercent() > 90"
                  [class.text-amber-600]="
                    poolUsagePercent() > 70 && poolUsagePercent() <= 90
                  "
                  [class.text-emerald-600]="poolUsagePercent() <= 70"
                >
                  {{ poolUsagePercent() }}%
                </span>
              </div>
              <div class="flex h-2 rounded-full overflow-hidden bg-slate-100">
                <div
                  class="transition-all duration-500"
                  [style.width.%]="poolUsagePercent()"
                  [class.bg-red-500]="poolUsagePercent() > 90"
                  [class.bg-amber-500]="
                    poolUsagePercent() > 70 && poolUsagePercent() <= 90
                  "
                  [class.bg-emerald-500]="poolUsagePercent() <= 70"
                ></div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-200"></div>

          <!-- Redis Cache Stats -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <mat-icon class="text-red-600 !text-lg">flash_on</mat-icon>
              <h4 class="text-sm font-semibold text-slate-900">Redis Cache</h4>
            </div>

            <!-- Hit Rate Circle -->
            <div class="flex items-center gap-4 mb-4">
              <div class="relative">
                <svg class="w-20 h-20 transform -rotate-90">
                  <!-- Background circle -->
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    stroke-width="6"
                    fill="none"
                    class="text-slate-100"
                  />
                  <!-- Progress circle -->
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    stroke-width="6"
                    fill="none"
                    [attr.stroke-dasharray]="'201.06'"
                    [attr.stroke-dashoffset]="circleOffset()"
                    [class.text-emerald-500]="hitRate() >= 80"
                    [class.text-amber-500]="hitRate() >= 50 && hitRate() < 80"
                    [class.text-red-500]="hitRate() < 50"
                    class="transition-all duration-500"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-lg font-bold text-slate-900"
                    >{{ hitRate() }}%</span
                  >
                </div>
              </div>

              <div class="flex-1">
                <div class="text-xs font-semibold text-slate-700 mb-2">
                  Cache Hit Rate
                </div>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-emerald-600">Hits</span>
                    <span class="font-semibold text-slate-700">{{
                      formatNumber(cacheStats()!.cache.hits)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-red-600">Misses</span>
                    <span class="font-semibold text-slate-700">{{
                      formatNumber(cacheStats()!.cache.misses)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cache Details Grid -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-1">
                  <mat-icon class="text-slate-600 !text-sm">key</mat-icon>
                  <span class="text-xs text-slate-600">Keys</span>
                </div>
                <div class="text-lg font-bold text-slate-900">
                  {{ formatNumber(cacheStats()!.cache.keys) }}
                </div>
              </div>
              <div class="bg-slate-50 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-1">
                  <mat-icon class="text-slate-600 !text-sm">memory</mat-icon>
                  <span class="text-xs text-slate-600">Memory</span>
                </div>
                <div class="text-lg font-bold text-slate-900">
                  {{ formatBytes(cacheStats()!.cache.memory) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-slate-200 bg-slate-50">
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span
              >Last updated: {{ formatTimestamp(dbStats()!.timestamp) }}</span
            >
            <button
              (click)="loadStats()"
              class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <mat-icon class="!text-sm">refresh</mat-icon>
              <span>Refresh</span>
            </button>
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
export class DatabasePerformanceWidget implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private statsSubscription?: Subscription;

  dbStats = signal<DatabasePoolStats | null>(null);
  cacheStats = signal<CacheStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    // Load immediately
    this.loadStats();

    // Refresh every 10 seconds
    this.statsSubscription = interval(10000)
      .pipe(
        switchMap(() =>
          forkJoin({
            db: this.dashboardService.getDatabasePoolStats(),
            cache: this.dashboardService.getCacheStats(),
          }),
        ),
      )
      .subscribe({
        next: (response) => {
          this.dbStats.set(response.db.data);
          this.cacheStats.set(response.cache.data);
          this.error.set(null);
        },
        error: (err) => {
          console.error('Failed to refresh database stats:', err);
        },
      });
  }

  ngOnDestroy() {
    this.statsSubscription?.unsubscribe();
  }

  loadStats() {
    this.loading.set(true);

    forkJoin({
      db: this.dashboardService.getDatabasePoolStats(),
      cache: this.dashboardService.getCacheStats(),
    }).subscribe({
      next: (response) => {
        this.dbStats.set(response.db.data);
        this.cacheStats.set(response.cache.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load database stats:', err);
        this.error.set('Failed to load database statistics');
        this.loading.set(false);
      },
    });
  }

  poolUsagePercent(): number {
    const db = this.dbStats();
    if (!db || db.pool.total === 0) return 0;
    return Math.round((db.pool.active / db.pool.total) * 100);
  }

  hitRate(): number {
    return Math.round(this.cacheStats()?.cache.hitRate || 0);
  }

  circleOffset(): number {
    const percentage = this.hitRate();
    const circumference = 2 * Math.PI * 32; // r = 32
    return circumference - (percentage / 100) * circumference;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }
}
