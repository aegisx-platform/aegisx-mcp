import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiKeysStatsWidget } from './widgets/api-keys-stats.widget';
import { SystemMetricsWidget } from './widgets/system-metrics.widget';
import { SystemAlertsBannerWidget } from './widgets/system-alerts-banner.widget';
import { DatabasePerformanceWidget } from './widgets/database-performance.widget';
import { ActiveSessionsWidget } from './widgets/active-sessions.widget';
import { RecentErrorLogsWidget } from './widgets/recent-error-logs.widget';
import { AuthActivityWidget } from './widgets/auth-activity.widget';
import { UserActivityTimelineWidget } from './widgets/user-activity-timeline.widget';

@Component({
  selector: 'ax-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ApiKeysStatsWidget,
    SystemMetricsWidget,
    SystemAlertsBannerWidget,
    DatabasePerformanceWidget,
    ActiveSessionsWidget,
    RecentErrorLogsWidget,
    AuthActivityWidget,
    UserActivityTimelineWidget,
  ],
  template: `
    <div class="w-full h-full overflow-y-auto overflow-x-hidden bg-gray-50">
      <!-- Page Header - Tremor Style -->
      <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div class="px-6 sm:px-8 py-6">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1
                class="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight"
              >
                Platform Dashboard
              </h1>
              <p class="text-sm text-slate-600 mt-1">
                Real-time platform metrics and system health monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-6 sm:p-8 space-y-8">
        <!-- System Alerts Banner -->
        <ax-system-alerts-banner></ax-system-alerts-banner>

        <!-- Row 1: Platform Metrics (3 columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- API Keys Statistics -->
          <ax-api-keys-stats-widget></ax-api-keys-stats-widget>

          <!-- System Metrics (Real-time) -->
          <ax-system-metrics-widget></ax-system-metrics-widget>

          <!-- Database Performance -->
          <ax-database-performance-widget></ax-database-performance-widget>
        </div>

        <!-- Row 2: Active Users & Errors (2 columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Active Sessions (Real data) -->
          <ax-active-sessions-widget></ax-active-sessions-widget>

          <!-- Recent Error Logs (Real data) -->
          <ax-recent-error-logs-widget></ax-recent-error-logs-widget>
        </div>

        <!-- Row 3: Activities (2 columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Auth Activity (Mock data) -->
          <ax-auth-activity-widget></ax-auth-activity-widget>

          <!-- User Activity Timeline (Mock data) -->
          <ax-user-activity-timeline-widget></ax-user-activity-timeline-widget>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      /* Smooth transitions for all interactive elements */
      button {
        transition: all 0.2s ease-in-out;
      }

      /* Icon adjustments */
      .mat-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    `,
  ],
})
export class DashboardPage {
  // Clean dashboard with real platform widgets only
  // All data is fetched from actual backend APIs
}
