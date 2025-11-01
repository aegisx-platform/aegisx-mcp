import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface AuthActivity {
  id: number;
  type: 'login' | 'logout' | 'failed_login' | 'register';
  user: string;
  email?: string;
  timestamp: string;
  ip?: string;
  success: boolean;
}

@Component({
  selector: 'ax-auth-activity-widget',
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
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50"
          >
            <mat-icon class="text-indigo-600 !text-xl">lock</mat-icon>
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900">
              Authentication Activity
            </h3>
            <p class="text-xs text-slate-600">Recent auth events</p>
          </div>
        </div>
        <div
          class="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium"
        >
          MOCK DATA
        </div>
      </div>

      <!-- Card Content -->
      <div class="p-6">
        <div class="space-y-2 max-h-96 overflow-y-auto">
          @for (activity of activities(); track activity.id) {
            <div
              class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <!-- Icon -->
              <div
                class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                [class.bg-green-100]="
                  activity.type === 'login' && activity.success
                "
                [class.bg-blue-100]="activity.type === 'register'"
                [class.bg-slate-100]="activity.type === 'logout'"
                [class.bg-red-100]="
                  activity.type === 'failed_login' || !activity.success
                "
              >
                <mat-icon
                  class="!text-base"
                  [class.text-green-600]="
                    activity.type === 'login' && activity.success
                  "
                  [class.text-blue-600]="activity.type === 'register'"
                  [class.text-slate-600]="activity.type === 'logout'"
                  [class.text-red-600]="
                    activity.type === 'failed_login' || !activity.success
                  "
                >
                  {{
                    activity.type === 'login'
                      ? 'login'
                      : activity.type === 'logout'
                        ? 'logout'
                        : activity.type === 'register'
                          ? 'person_add'
                          : 'lock'
                  }}
                </mat-icon>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900">
                  {{ getActivityTitle(activity) }}
                </p>
                <div
                  class="flex items-center gap-3 mt-1 text-xs text-slate-500"
                >
                  <span>{{ timeAgo(activity.timestamp) }}</span>
                  @if (activity.ip) {
                    <span class="font-mono">{{ activity.ip }}</span>
                  }
                </div>
              </div>

              <!-- Status Badge -->
              <div
                class="flex-shrink-0 px-2 py-1 rounded text-xs font-medium"
                [class.bg-green-100]="activity.success"
                [class.text-green-700]="activity.success"
                [class.bg-red-100]="!activity.success"
                [class.text-red-700]="!activity.success"
              >
                {{ activity.success ? 'SUCCESS' : 'FAILED' }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Card Footer -->
      <div
        class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between"
      >
        <span class="text-xs text-slate-500"
          >{{ successCount() }} successful / {{ failedCount() }} failed</span
        >
        <span class="text-xs text-indigo-600 font-medium"> Last 24 hours </span>
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
export class AuthActivityWidget implements OnInit {
  activities = signal<AuthActivity[]>([]);

  ngOnInit() {
    this.loadMockData();
  }

  loadMockData() {
    // Mock data - will be replaced with real API call
    const mockActivities: AuthActivity[] = [
      {
        id: 1,
        type: 'login',
        user: 'admin',
        email: 'admin@aegisx.local',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        ip: '192.168.1.100',
        success: true,
      },
      {
        id: 2,
        type: 'failed_login',
        user: 'unknown',
        email: 'test@example.com',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        ip: '10.0.0.25',
        success: false,
      },
      {
        id: 3,
        type: 'register',
        user: 'newuser',
        email: 'newuser@example.com',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        ip: '192.168.1.50',
        success: true,
      },
      {
        id: 4,
        type: 'logout',
        user: 'admin',
        email: 'admin@aegisx.local',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ip: '192.168.1.100',
        success: true,
      },
      {
        id: 5,
        type: 'login',
        user: 'manager',
        email: 'manager@aegisx.local',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        ip: '192.168.1.75',
        success: true,
      },
      {
        id: 6,
        type: 'failed_login',
        user: 'admin',
        email: 'admin@aegisx.local',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        ip: '203.0.113.45',
        success: false,
      },
      {
        id: 7,
        type: 'login',
        user: 'developer',
        email: 'dev@aegisx.local',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        ip: '192.168.1.120',
        success: true,
      },
      {
        id: 8,
        type: 'logout',
        user: 'manager',
        email: 'manager@aegisx.local',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        ip: '192.168.1.75',
        success: true,
      },
    ];

    this.activities.set(mockActivities);
  }

  getActivityTitle(activity: AuthActivity): string {
    switch (activity.type) {
      case 'login':
        return `${activity.user} logged in`;
      case 'logout':
        return `${activity.user} logged out`;
      case 'register':
        return `${activity.user} registered`;
      case 'failed_login':
        return `Failed login attempt for ${activity.user}`;
      default:
        return 'Unknown activity';
    }
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

  successCount(): number {
    return this.activities().filter((a) => a.success).length;
  }

  failedCount(): number {
    return this.activities().filter((a) => !a.success).length;
  }
}
