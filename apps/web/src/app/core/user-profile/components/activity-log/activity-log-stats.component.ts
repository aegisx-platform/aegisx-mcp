import { Component, input, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { ActivityLogStats, SEVERITY_CONFIG } from './activity-log.types';
import { ActivityLogService } from './activity-log.service';

@Component({
  selector: 'ax-activity-log-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="stats-container">
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Activities -->
        <mat-card class="stat-card">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Activities
                </p>
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="mt-2"></mat-spinner>
                } @else {
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ stats()?.total_activities || 0 | number }}
                  </p>
                }
              </div>
              <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <mat-icon class="text-blue-600 dark:text-blue-400">timeline</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Today's Activities -->
        <mat-card class="stat-card">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Today
                </p>
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="mt-2"></mat-spinner>
                } @else {
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ stats()?.recent_activities_count?.today || 0 | number }}
                  </p>
                }
              </div>
              <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <mat-icon class="text-green-600 dark:text-green-400">today</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- This Week -->
        <mat-card class="stat-card">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Week
                </p>
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="mt-2"></mat-spinner>
                } @else {
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ stats()?.recent_activities_count?.this_week || 0 | number }}
                  </p>
                }
              </div>
              <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <mat-icon class="text-purple-600 dark:text-purple-400">date_range</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Unique Devices -->
        <mat-card class="stat-card">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Devices
                </p>
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="mt-2"></mat-spinner>
                } @else {
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ stats()?.unique_devices || 0 | number }}
                  </p>
                }
              </div>
              <div class="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <mat-icon class="text-orange-600 dark:text-orange-400">devices</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Detailed Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 sm:px-0">
        <!-- Activity by Action -->
        <mat-card class="h-fit">
          <mat-card-header class="pb-2">
            <mat-card-title class="flex items-center">
              <mat-icon class="mr-2">category</mat-icon>
              Activities by Action
            </mat-card-title>
            <mat-card-subtitle>
              Breakdown of activities by action type
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="px-6 pb-6">
            @if (isLoading()) {
              <div class="flex justify-center py-8">
                <mat-spinner diameter="32"></mat-spinner>
              </div>
            } @else if (actionEntries().length === 0) {
              <div class="text-center py-8">
                <mat-icon class="text-gray-400 mb-2" style="font-size: 32px; height: 32px; width: 32px;">
                  category
                </mat-icon>
                <p class="text-gray-500 dark:text-gray-400">No activity data available</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (entry of actionEntries(); track entry.action) {
                  <div class="flex items-center justify-between py-2">
                    <div class="flex items-center flex-1">
                      <div class="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {{ formatActionName(entry.action) }}
                      </span>
                    </div>
                    <div class="flex items-center ml-4">
                      <span class="text-sm font-bold text-gray-900 dark:text-gray-100 mr-3 min-w-[2rem] text-right">
                        {{ entry.count | number }}
                      </span>
                      <div 
                        class="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                        [matTooltip]="entry.percentage + '%'"
                      >
                        <div 
                          class="h-full bg-blue-500 transition-all duration-300"
                          [style.width.%]="entry.percentage"
                        ></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Activity by Severity -->
        <mat-card class="h-fit">
          <mat-card-header class="pb-2">
            <mat-card-title class="flex items-center">
              <mat-icon class="mr-2">priority_high</mat-icon>
              Activities by Severity
            </mat-card-title>
            <mat-card-subtitle>
              Breakdown of activities by severity level
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="px-6 pb-6">
            @if (isLoading()) {
              <div class="flex justify-center py-8">
                <mat-spinner diameter="32"></mat-spinner>
              </div>
            } @else if (severityEntries().length === 0) {
              <div class="text-center py-8">
                <mat-icon class="text-gray-400 mb-2" style="font-size: 32px; height: 32px; width: 32px;">
                  priority_high
                </mat-icon>
                <p class="text-gray-500 dark:text-gray-400">No severity data available</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (entry of severityEntries(); track entry.severity) {
                  <div class="flex items-center justify-between py-2">
                    <div class="flex items-center flex-1">
                      <mat-icon 
                        [class]="getSeverityIconClass(entry.severity)"
                        class="mr-3 text-lg flex-shrink-0"
                      >
                        {{ getSeverityIcon(entry.severity) }}
                      </mat-icon>
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {{ getSeverityLabel(entry.severity) }}
                      </span>
                    </div>
                    <div class="flex items-center ml-4">
                      <span class="text-sm font-bold text-gray-900 dark:text-gray-100 mr-3 min-w-[2rem] text-right">
                        {{ entry.count | number }}
                      </span>
                      <div 
                        class="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                        [matTooltip]="entry.percentage + '%'"
                      >
                        <div 
                          [class]="getSeverityBarClass(entry.severity)"
                          class="h-full transition-all duration-300"
                          [style.width.%]="entry.percentage"
                        ></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Last Activity -->
      @if (stats()?.last_activity) {
        <mat-card class="mt-6">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <mat-icon class="mr-3 text-gray-600 dark:text-gray-400">access_time</mat-icon>
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Last Activity
                  </p>
                  <p class="text-sm text-gray-900 dark:text-gray-100">
                    {{ formatLastActivity() }}
                  </p>
                </div>
              </div>
              <button 
                mat-icon-button 
                (click)="refresh()" 
                [disabled]="isLoading()"
                matTooltip="Refresh statistics"
              >
                <mat-icon [class.animate-spin]="isLoading()">refresh</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .stats-container {
      width: 100%;
      padding: 0 16px;
    }

    @media (min-width: 640px) {
      .stats-container {
        padding: 0;
      }
    }

    .stat-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Improved Material card styling */
    ::ng-deep .mat-mdc-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 0;
    }

    ::ng-deep .mat-mdc-card-header {
      padding: 20px 24px 8px 24px;
    }

    ::ng-deep .mat-mdc-card-content {
      padding: 0 24px 24px 24px;
    }

    ::ng-deep .mat-mdc-card-content:last-child {
      padding-bottom: 24px;
    }

    /* Enhanced responsive spacing */
    @media (max-width: 1023px) {
      ::ng-deep .mat-mdc-card-content {
        padding: 0 20px 20px 20px;
      }
      
      ::ng-deep .mat-mdc-card-header {
        padding: 16px 20px 8px 20px;
      }
    }

    /* Progress bar hover effects */
    .space-y-4 > div:hover .bg-blue-500,
    .space-y-4 > div:hover .bg-red-500,
    .space-y-4 > div:hover .bg-yellow-500,
    .space-y-4 > div:hover .bg-gray-500 {
      opacity: 0.8;
    }
  `]
})
export class ActivityLogStatsComponent implements OnInit, OnDestroy {
  private activityLogService = inject(ActivityLogService);
  private destroy$ = new Subject<void>();

  // Input signals
  stats = input<ActivityLogStats | null>(null);
  autoRefresh = input<boolean>(false);

  // Internal signals
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed signals for action breakdown
  actionEntries = computed(() => {
    const stats = this.stats();
    if (!stats?.activities_by_action) return [];

    const total = stats.total_activities || 1;
    return Object.entries(stats.activities_by_action)
      .map(([action, count]) => ({
        action,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  });

  // Computed signals for severity breakdown
  severityEntries = computed(() => {
    const stats = this.stats();
    if (!stats?.activities_by_severity) return [];

    const total = stats.total_activities || 1;
    return Object.entries(stats.activities_by_severity)
      .map(([severity, count]) => ({
        severity: severity as keyof typeof SEVERITY_CONFIG,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .filter(entry => entry.count > 0)
      .sort((a, b) => b.count - a.count);
  });

  ngOnInit(): void {
    // Load initial stats if not provided via input
    if (!this.stats()) {
      this.loadStats();
    }

    // Set up auto-refresh if enabled
    if (this.autoRefresh()) {
      this.setupAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStats(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.activityLogService.loadStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (error) => {
          this.error.set(error.message || 'Failed to load statistics');
          this.isLoading.set(false);
        }
      });
  }

  private setupAutoRefresh(): void {
    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      if (!this.isLoading()) {
        this.loadStats();
      }
    }, 30000);

    // Cleanup interval on destroy
    this.destroy$.subscribe(() => {
      clearInterval(interval);
    });
  }

  refresh(): void {
    this.loadStats();
  }

  formatActionName(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getSeverityLabel(severity: string): string {
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG]?.label || severity;
  }

  getSeverityIcon(severity: string): string {
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG]?.icon || 'help';
  }

  getSeverityIconClass(severity: string): string {
    const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
    switch (severity) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  getSeverityBarClass(severity: string): string {
    switch (severity) {
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  formatLastActivity(): string {
    const lastActivity = this.stats()?.last_activity;
    if (!lastActivity) return 'Never';

    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    }
  }
}