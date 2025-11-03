import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoginAttemptsService } from '../../../../audit/services/login-attempts.service';
import { LoginAttempt } from '../../../../audit/models/audit.types';

interface AuthActivity {
  id: string;
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
  private loginAttemptsService = inject(LoginAttemptsService);
  activities = signal<AuthActivity[]>([]);

  ngOnInit() {
    this.loadAuthActivity();
  }

  loadAuthActivity() {
    // Get login attempts from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.loginAttemptsService
      .getLoginAttempts({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      .subscribe({
        next: ({ data }) => {
          const activities: AuthActivity[] = data.map((attempt) =>
            this.mapLoginAttemptToActivity(attempt),
          );
          this.activities.set(activities);
        },
        error: (error) => {
          console.error('Failed to load auth activity:', error);
          // Keep empty array on error
          this.activities.set([]);
        },
      });
  }

  private mapLoginAttemptToActivity(attempt: LoginAttempt): AuthActivity {
    return {
      id: attempt.id,
      type: attempt.success ? 'login' : 'failed_login',
      user: attempt.email || attempt.username || 'Unknown',
      email: attempt.email,
      timestamp: attempt.createdAt,
      ip: attempt.ipAddress,
      success: attempt.success,
    };
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
