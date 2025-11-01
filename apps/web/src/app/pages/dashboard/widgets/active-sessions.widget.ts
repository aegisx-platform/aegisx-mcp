import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../services/dashboard.service';
import { interval, Subscription, switchMap } from 'rxjs';

interface ActiveSessionsStats {
  total: number;
  users: number;
  sessions: Array<{
    userId: string;
    lastActivity: string;
  }>;
  timestamp: string;
}

@Component({
  selector: 'ax-active-sessions-widget',
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
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50"
          >
            <mat-icon class="text-green-600 !text-xl">people</mat-icon>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">
              Active Sessions
            </h3>
            <p class="text-xs text-slate-600">Currently online</p>
          </div>
        </div>
        <button
          (click)="loadStats()"
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
        @if (loading() && !stats()) {
          <!-- Loading State -->
          <div class="flex items-center justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"
            ></div>
          </div>
        } @else if (error()) {
          <!-- Error State -->
          <div class="text-center py-8">
            <mat-icon class="text-red-500 !text-4xl mb-2">error</mat-icon>
            <p class="text-sm text-slate-600 mb-4">{{ error() }}</p>
            <button
              (click)="loadStats()"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        } @else if (stats()) {
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <!-- Total Sessions -->
            <div class="p-4 bg-green-50 rounded-lg">
              <div class="flex items-center gap-2 mb-1">
                <mat-icon class="text-green-600 !text-base">analytics</mat-icon>
                <span class="text-xs font-medium text-green-900"
                  >Total Sessions</span
                >
              </div>
              <div class="text-2xl font-bold text-green-900">
                {{ stats()!.total }}
              </div>
            </div>

            <!-- Unique Users -->
            <div class="p-4 bg-emerald-50 rounded-lg">
              <div class="flex items-center gap-2 mb-1">
                <mat-icon class="text-emerald-600 !text-base">people</mat-icon>
                <span class="text-xs font-medium text-emerald-900"
                  >Active Users</span
                >
              </div>
              <div class="text-2xl font-bold text-emerald-900">
                {{ stats()!.users }}
              </div>
            </div>
          </div>

          <!-- Live Indicator -->
          <div class="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span
              class="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"
            ></span>
            <span>Live updates every 10 seconds</span>
          </div>

          <!-- Recent Sessions (Top 5) -->
          @if (stats()!.sessions.length > 0) {
            <div class="space-y-2">
              <h4 class="text-xs font-medium text-slate-700 mb-2">
                Recent Activity
              </h4>
              @for (session of recentSessions(); track session.userId) {
                <div class="flex items-center justify-between py-2 text-xs">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"
                    >
                      <mat-icon class="text-green-600 !text-sm"
                        >person</mat-icon
                      >
                    </div>
                    <span class="text-slate-700 font-mono">{{
                      truncateUserId(session.userId)
                    }}</span>
                  </div>
                  <span class="text-slate-500">{{
                    timeAgo(session.lastActivity)
                  }}</span>
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- Card Footer -->
      <div
        class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between"
      >
        <span class="text-xs text-slate-500"
          >Last updated: {{ lastUpdated() }}</span
        >
        <span class="text-xs text-green-600 font-medium">
          {{ stats()?.users || 0 }} online
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
    `,
  ],
})
export class ActiveSessionsWidget implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private statsSubscription?: Subscription;

  stats = signal<ActiveSessionsStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadStats();

    // Auto-refresh every 10 seconds
    this.statsSubscription = interval(10000)
      .pipe(switchMap(() => this.dashboardService.getActiveSessions()))
      .subscribe({
        next: (response) => {
          this.stats.set(response.data);
          this.error.set(null);
        },
        error: (err) => {
          console.error('Failed to load active sessions:', err);
          this.error.set('Failed to load active sessions');
        },
      });
  }

  ngOnDestroy() {
    this.statsSubscription?.unsubscribe();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getActiveSessions().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load active sessions:', err);
        this.error.set('Failed to load active sessions');
        this.loading.set(false);
      },
    });
  }

  recentSessions() {
    return this.stats()?.sessions.slice(0, 5) || [];
  }

  truncateUserId(userId: string): string {
    if (userId.length <= 12) return userId;
    return userId.substring(0, 8) + '...';
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

  lastUpdated(): string {
    const timestamp = this.stats()?.timestamp;
    if (!timestamp) return 'Never';
    return this.timeAgo(timestamp);
  }
}
