import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivityLogService } from '../../../../user-profile/components/activity-log/activity-log.service';
import { ActivityLog } from '../../../../user-profile/components/activity-log/activity-log.types';

interface Activity {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info';
}

@Component({
  selector: 'ax-user-activity-timeline-widget',
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
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50"
          >
            <mat-icon class="text-purple-600 !text-xl">timeline</mat-icon>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">
              Activity Timeline
            </h3>
            <p class="text-xs text-slate-600">Recent user actions</p>
          </div>
        </div>
      </div>

      <!-- Card Content -->
      <div class="p-6">
        <div class="space-y-4 max-h-96 overflow-y-auto">
          @for (
            activity of activities();
            track activity.id;
            let isLast = $last
          ) {
            <div class="flex gap-3">
              <!-- Timeline Line -->
              <div class="flex flex-col items-center">
                <!-- Icon Circle -->
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  [class.bg-blue-100]="activity.color === 'primary'"
                  [class.bg-green-100]="activity.color === 'success'"
                  [class.bg-yellow-100]="activity.color === 'warning'"
                  [class.bg-cyan-100]="activity.color === 'info'"
                >
                  <mat-icon
                    class="!text-base"
                    [class.text-blue-600]="activity.color === 'primary'"
                    [class.text-green-600]="activity.color === 'success'"
                    [class.text-yellow-600]="activity.color === 'warning'"
                    [class.text-cyan-600]="activity.color === 'info'"
                  >
                    {{ activity.icon }}
                  </mat-icon>
                </div>
                <!-- Vertical Line (if not last) -->
                @if (!isLast) {
                  <div class="w-px h-full bg-slate-200 mt-1"></div>
                }
              </div>

              <!-- Content -->
              <div class="flex-1 pb-4">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <h4 class="text-sm font-medium text-slate-900">
                    {{ activity.action }}
                  </h4>
                  <span class="text-xs text-slate-500 whitespace-nowrap">
                    {{ timeAgo(activity.timestamp) }}
                  </span>
                </div>
                <p class="text-xs text-slate-600 mb-1">
                  {{ activity.description }}
                </p>
                <div class="flex items-center gap-2">
                  <div
                    class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center"
                  >
                    <mat-icon class="text-slate-600 !text-xs">person</mat-icon>
                  </div>
                  <span class="text-xs text-slate-700 font-medium">{{
                    activity.user
                  }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Card Footer -->
      <div
        class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between"
      >
        <button
          class="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          View Full Timeline
        </button>
        <span class="text-xs text-slate-500">
          {{ activities().length }} recent activities
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
export class UserActivityTimelineWidget implements OnInit {
  private activityLogService = inject(ActivityLogService);
  activities = signal<Activity[]>([]);

  ngOnInit() {
    this.loadUserActivity();
  }

  loadUserActivity() {
    this.activityLogService
      .loadActivities({
        limit: 10,
        page: 1,
      })
      .subscribe({
        next: (response) => {
          const activities: Activity[] = response.activities.map((log) =>
            this.mapActivityLogToActivity(log),
          );
          this.activities.set(activities);
        },
        error: (error) => {
          console.error('Failed to load user activity:', error);
          // Keep empty array on error
          this.activities.set([]);
        },
      });
  }

  private mapActivityLogToActivity(log: ActivityLog): Activity {
    return {
      id: log.id,
      user: 'User', // API doesn't return user name, would need to fetch from user_id
      action: this.formatAction(log.action),
      description: log.description,
      timestamp: log.created_at,
      icon: this.getIconForAction(log.action),
      color: this.getColorForSeverity(log.severity),
    };
  }

  private formatAction(action: string): string {
    // Convert snake_case to Title Case
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getIconForAction(action: string): string {
    const iconMap: Record<string, string> = {
      profile_view: 'visibility',
      profile_update: 'account_circle',
      password_change: 'lock',
      login: 'login',
      logout: 'logout',
      api_access: 'api',
      api_error: 'error',
      settings_change: 'settings',
      avatar_update: 'account_circle',
      preferences_update: 'tune',
      security_event: 'shield',
    };
    return iconMap[action] || 'info';
  }

  private getColorForSeverity(
    severity: 'info' | 'warning' | 'error' | 'critical',
  ): 'primary' | 'success' | 'warning' | 'info' {
    const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> =
      {
        info: 'info',
        warning: 'warning',
        error: 'warning',
        critical: 'warning',
      };
    return colorMap[severity] || 'info';
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
}
