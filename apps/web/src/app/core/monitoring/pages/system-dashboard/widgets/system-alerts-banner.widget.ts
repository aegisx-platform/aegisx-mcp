import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  DashboardService,
  SystemAlert,
  SystemMetrics,
  DatabasePoolStats,
  CacheStats,
} from '../../../services/dashboard.service';
import { interval, Subscription, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ax-system-alerts-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (alerts().length > 0) {
      <div class="space-y-3">
        @for (alert of visibleAlerts(); track alert.id) {
          <div
            class="rounded-xl border shadow-sm overflow-hidden animate-slideIn"
            [class.bg-red-50]="alert.type === 'error'"
            [class.border-red-200]="alert.type === 'error'"
            [class.bg-amber-50]="alert.type === 'warning'"
            [class.border-amber-200]="alert.type === 'warning'"
            [class.bg-blue-50]="alert.type === 'info'"
            [class.border-blue-200]="alert.type === 'info'"
          >
            <div class="flex items-start gap-4 p-4">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg"
                  [class.bg-red-100]="alert.type === 'error'"
                  [class.bg-amber-100]="alert.type === 'warning'"
                  [class.bg-blue-100]="alert.type === 'info'"
                >
                  <mat-icon
                    [class.text-red-600]="alert.type === 'error'"
                    [class.text-amber-600]="alert.type === 'warning'"
                    [class.text-blue-600]="alert.type === 'info'"
                    class="!text-xl"
                  >
                    @if (alert.type === 'error') {
                      error
                    } @else if (alert.type === 'warning') {
                      warning
                    } @else {
                      info
                    }
                  </mat-icon>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h4
                      class="text-sm font-semibold"
                      [class.text-red-900]="alert.type === 'error'"
                      [class.text-amber-900]="alert.type === 'warning'"
                      [class.text-blue-900]="alert.type === 'info'"
                    >
                      {{ alert.title }}
                    </h4>
                    <p
                      class="text-sm mt-1"
                      [class.text-red-700]="alert.type === 'error'"
                      [class.text-amber-700]="alert.type === 'warning'"
                      [class.text-blue-700]="alert.type === 'info'"
                    >
                      {{ alert.message }}
                    </p>
                    <p class="text-xs text-slate-500 mt-2">
                      {{ formatTimestamp(alert.timestamp) }}
                    </p>
                  </div>

                  <!-- Actions -->
                  <button
                    (click)="acknowledgeAlert(alert.id)"
                    class="flex-shrink-0 p-2 rounded-lg hover:bg-white/50 transition-colors"
                    [class.hover:bg-red-100]="alert.type === 'error'"
                    [class.hover:bg-amber-100]="alert.type === 'warning'"
                    [class.hover:bg-blue-100]="alert.type === 'info'"
                  >
                    <mat-icon
                      class="!text-base text-slate-400 hover:text-slate-600"
                      >close</mat-icon
                    >
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Show More Button (if there are more alerts) -->
        @if (alerts().length > maxVisible()) {
          <button
            (click)="toggleShowAll()"
            class="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900
                   bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors
                   flex items-center justify-center gap-2"
          >
            <span>{{
              showAll()
                ? 'Show Less'
                : 'Show ' + (alerts().length - maxVisible()) + ' More Alerts'
            }}</span>
            <mat-icon class="!text-base">{{
              showAll() ? 'expand_less' : 'expand_more'
            }}</mat-icon>
          </button>
        }
      </div>
    } @else if (!loading()) {
      <!-- No Alerts -->
      <div
        class="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 mx-auto mb-3"
        >
          <mat-icon class="text-emerald-600 !text-2xl">check_circle</mat-icon>
        </div>
        <h4 class="text-sm font-semibold text-emerald-900">
          All Systems Operational
        </h4>
        <p class="text-sm text-emerald-700 mt-1">
          No alerts or warnings at this time
        </p>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-slideIn {
        animation: slideIn 0.3s ease-out;
      }
    `,
  ],
})
export class SystemAlertsBannerWidget implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private alertsSubscription?: Subscription;

  alerts = signal<SystemAlert[]>([]);
  loading = signal(false);
  showAll = signal(false);
  maxVisible = signal(3); // Show only 3 alerts by default

  visibleAlerts = computed(() => {
    const allAlerts = this.alerts();
    return this.showAll() ? allAlerts : allAlerts.slice(0, this.maxVisible());
  });

  ngOnInit() {
    // Load immediately
    this.loadAlerts();

    // Refresh every 10 seconds
    this.alertsSubscription = interval(10000)
      .pipe(
        switchMap(() =>
          forkJoin({
            system: this.dashboardService.getSystemMetrics(),
            db: this.dashboardService.getDatabasePoolStats(),
            cache: this.dashboardService.getCacheStats(),
          }),
        ),
      )
      .subscribe({
        next: (response) => {
          this.updateAlerts(
            response.system.data,
            response.db.data,
            response.cache.data,
          );
        },
        error: (err) => {
          console.error('Failed to refresh alerts:', err);
        },
      });
  }

  ngOnDestroy() {
    this.alertsSubscription?.unsubscribe();
  }

  loadAlerts() {
    this.loading.set(true);

    forkJoin({
      system: this.dashboardService.getSystemMetrics(),
      db: this.dashboardService.getDatabasePoolStats(),
      cache: this.dashboardService.getCacheStats(),
    }).subscribe({
      next: (response) => {
        this.updateAlerts(
          response.system.data,
          response.db.data,
          response.cache.data,
        );
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load alerts:', err);
        this.loading.set(false);
      },
    });
  }

  updateAlerts(
    systemMetrics: SystemMetrics,
    dbStats: DatabasePoolStats,
    cacheStats: CacheStats,
  ) {
    const newAlerts = this.dashboardService.generateSystemAlerts(
      systemMetrics,
      dbStats,
      cacheStats,
    );

    // Merge with existing acknowledged alerts (keep them acknowledged)
    const existingAlerts = this.alerts();
    const mergedAlerts = newAlerts.map((newAlert) => {
      const existing = existingAlerts.find((a) => a.id === newAlert.id);
      return existing || newAlert;
    });

    this.alerts.set(mergedAlerts);
  }

  acknowledgeAlert(alertId: string) {
    this.alerts.update((alerts) =>
      alerts.filter((alert) => alert.id !== alertId),
    );
  }

  toggleShowAll() {
    this.showAll.update((v) => !v);
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleString();
  }
}
