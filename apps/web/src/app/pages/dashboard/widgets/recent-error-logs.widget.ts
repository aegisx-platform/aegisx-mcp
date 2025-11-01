import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { interval, Subscription, switchMap } from 'rxjs';

interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  userId?: string;
  endpoint?: string;
}

interface ErrorLogsResponse {
  data: ErrorLog[];
  total: number;
}

@Component({
  selector: 'ax-recent-error-logs-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <!-- Card Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50"
          >
            <mat-icon class="text-red-600 !text-xl">bug_report</mat-icon>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">
              Recent Errors
            </h3>
            <p class="text-xs text-slate-600">Last 10 errors</p>
          </div>
        </div>
        <button
          (click)="loadErrors()"
          [disabled]="loading()"
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          [class.opacity-50]="loading()"
          [class.cursor-not-allowed]="loading()"
        >
          <mat-icon class="!text-base">refresh</mat-icon>
        </button>
      </div>

      <!-- Card Content -->
      <div class="p-6">
        @if (loading() && !errors()) {
          <!-- Loading State -->
          <div class="flex items-center justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
            ></div>
          </div>
        } @else if (error()) {
          <!-- Error State -->
          <div class="text-center py-8">
            <mat-icon class="text-red-500 !text-4xl mb-2">error</mat-icon>
            <p class="text-sm text-slate-600 mb-4">{{ error() }}</p>
            <button
              (click)="loadErrors()"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        } @else if (errors() && errors()!.length === 0) {
          <!-- Empty State -->
          <div class="text-center py-8">
            <mat-icon class="text-green-500 !text-4xl mb-2"
              >check_circle</mat-icon
            >
            <p class="text-sm font-medium text-slate-900 mb-1">
              No Recent Errors
            </p>
            <p class="text-xs text-slate-600">System running smoothly</p>
          </div>
        } @else if (errors()) {
          <!-- Error Logs List -->
          <div class="space-y-2 max-h-96 overflow-y-auto">
            @for (log of errors(); track log.id) {
              <div
                class="flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer"
                [class.border-red-200]="log.level === 'error'"
                [class.bg-red-50]="log.level === 'error'"
                [class.border-yellow-200]="log.level === 'warning'"
                [class.bg-yellow-50]="log.level === 'warning'"
                [class.border-blue-200]="log.level === 'info'"
                [class.bg-blue-50]="log.level === 'info'"
                (click)="navigateToErrorLogs()"
              >
                <!-- Icon -->
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  [class.bg-red-100]="log.level === 'error'"
                  [class.bg-yellow-100]="log.level === 'warning'"
                  [class.bg-blue-100]="log.level === 'info'"
                >
                  <mat-icon
                    class="!text-base"
                    [class.text-red-600]="log.level === 'error'"
                    [class.text-yellow-600]="log.level === 'warning'"
                    [class.text-blue-600]="log.level === 'info'"
                  >
                    {{
                      log.level === 'error'
                        ? 'error'
                        : log.level === 'warning'
                          ? 'warning'
                          : 'info'
                    }}
                  </mat-icon>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 truncate">
                    {{ log.message }}
                  </p>
                  <div
                    class="flex items-center gap-3 mt-1 text-xs text-slate-500"
                  >
                    <span>{{ timeAgo(log.timestamp) }}</span>
                    @if (log.endpoint) {
                      <span class="font-mono">{{ log.endpoint }}</span>
                    }
                  </div>
                </div>

                <!-- Level Badge -->
                <div
                  class="flex-shrink-0 px-2 py-1 rounded text-xs font-medium"
                  [class.bg-red-100]="log.level === 'error'"
                  [class.text-red-700]="log.level === 'error'"
                  [class.bg-yellow-100]="log.level === 'warning'"
                  [class.text-yellow-700]="log.level === 'warning'"
                  [class.bg-blue-100]="log.level === 'info'"
                  [class.text-blue-700]="log.level === 'info'"
                >
                  {{ log.level.toUpperCase() }}
                </div>
              </div>
            }
          </div>

          <!-- Live Indicator -->
          <div class="flex items-center gap-2 text-xs text-slate-500 mt-4">
            <span
              class="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
            ></span>
            <span>Live updates every 15 seconds</span>
          </div>
        }
      </div>

      <!-- Card Footer -->
      <div
        class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between"
      >
        <button
          (click)="navigateToErrorLogs()"
          class="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          View All Errors
        </button>
        <span class="text-xs text-slate-500">
          {{ totalErrors() }} total errors
        </span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      /* Custom scrollbar */
      .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
      }

      .overflow-y-auto::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }

      .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `,
  ],
})
export class RecentErrorLogsWidget implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private errorsSubscription?: Subscription;

  errors = signal<ErrorLog[] | null>(null);
  totalErrors = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadErrors();

    // Auto-refresh every 15 seconds
    this.errorsSubscription = interval(15000)
      .pipe(switchMap(() => this.dashboardService.getRecentErrorLogs()))
      .subscribe({
        next: (response) => {
          this.errors.set(response.data);
          this.totalErrors.set(response.total);
          this.error.set(null);
        },
        error: (err) => {
          console.error('Failed to load error logs:', err);
          this.error.set('Failed to load error logs');
        },
      });
  }

  ngOnDestroy() {
    this.errorsSubscription?.unsubscribe();
  }

  loadErrors() {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getRecentErrorLogs().subscribe({
      next: (response) => {
        this.errors.set(response.data);
        this.totalErrors.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load error logs:', err);
        this.error.set('Failed to load error logs');
        this.loading.set(false);
      },
    });
  }

  timeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  navigateToErrorLogs() {
    this.router.navigate(['/monitoring/error-logs']);
  }
}
