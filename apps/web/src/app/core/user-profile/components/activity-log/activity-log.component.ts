import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, timer, switchMap } from 'rxjs';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';

import { ActivityLogService } from './activity-log.service';
import { ActivityLogStatsComponent } from './activity-log-stats.component';
import { ActivityLogFilterComponent } from './activity-log-filter.component';
import { 
  ActivityLog, 
  ActivityLogFilters, 
  ActivityLogStats,
  SEVERITY_CONFIG 
} from './activity-log.types';

@Component({
  selector: 'ax-activity-log',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    AegisxCardComponent,
    AegisxAlertComponent,
    ActivityLogStatsComponent,
    ActivityLogFilterComponent
  ],
  template: `
    <div class="activity-log-container space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Activity Log
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Track your account activities and system events
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            mat-icon-button
            (click)="toggleAutoRefresh()"
            [color]="autoRefresh() ? 'accent' : 'default'"
            [matTooltip]="autoRefresh() ? 'Disable auto refresh' : 'Enable auto refresh'"
          >
            <mat-icon [class.animate-spin]="autoRefresh() && isLoading()">
              {{ autoRefresh() ? 'sync' : 'sync_disabled' }}
            </mat-icon>
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="refresh()"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <mat-icon class="animate-spin mr-2">sync</mat-icon>
            }
            Refresh
          </button>
        </div>
      </div>

      <!-- Statistics Section -->
      @if (showStats()) {
        <ax-activity-log-stats 
          [stats]="stats()"
          [autoRefresh]="autoRefresh()"
        ></ax-activity-log-stats>
      }

      <!-- Filters Section -->
      <ax-activity-log-filter
        [initialFilters]="currentFilters()"
        (filtersChange)="onFiltersChange($event)"
      ></ax-activity-log-filter>

      <!-- Activity Table -->
      <ax-card [appearance]="'elevated'">
        <!-- Table Header -->
        <div class="p-4 border-b dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Activities
              </h2>
              @if (totalActivities() > 0) {
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ totalActivities() | number }} total activities
                </p>
              }
            </div>
            <div class="flex items-center space-x-2">
              @if (isLoading()) {
                <mat-spinner diameter="24"></mat-spinner>
              }
              <button
                mat-icon-button
                (click)="toggleStats()"
                [matTooltip]="showStats() ? 'Hide statistics' : 'Show statistics'"
              >
                <mat-icon>{{ showStats() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        @if (error()) {
          <div class="p-4">
            <ax-alert type="error" title="Error Loading Activities">
              {{ error() }}
              <div class="mt-4">
                <button mat-button color="primary" (click)="refresh()">
                  Try Again
                </button>
              </div>
            </ax-alert>
          </div>
        }

        <!-- Loading State -->
        @else if (isLoading() && !hasActivities()) {
          <div class="flex justify-center items-center p-16">
            <div class="text-center">
              <mat-spinner diameter="48"></mat-spinner>
              <p class="text-gray-600 dark:text-gray-400 mt-4">
                Loading activities...
              </p>
            </div>
          </div>
        }

        <!-- Empty State -->
        @else if (!hasActivities() && !isLoading()) {
          <div class="text-center py-16">
            <mat-icon 
              class="text-gray-400 mb-4" 
              style="font-size: 64px; height: 64px; width: 64px;"
            >
              history
            </mat-icon>
            <h3 class="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              No Activities Found
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              @if (hasActiveFilters()) {
                No activities match your current filters. Try adjusting your search criteria.
              } @else {
                You don't have any recorded activities yet.
              }
            </p>
            @if (hasActiveFilters()) {
              <button mat-raised-button color="primary" (click)="clearFilters()">
                Clear Filters
              </button>
            }
          </div>
        }

        <!-- Data Table -->
        @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="activities()" class="w-full">
              <!-- Timestamp Column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Timestamp
                </th>
                <td mat-cell *matCellDef="let activity" class="py-3">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ formatDate(activity.created_at) }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ getRelativeTime(activity.created_at) }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Action
                </th>
                <td mat-cell *matCellDef="let activity" class="py-3">
                  <div class="flex items-center">
                    <mat-icon class="mr-2 text-gray-600 dark:text-gray-400" style="font-size: 18px;">
                      {{ getActionIcon(activity.action) }}
                    </mat-icon>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ formatActionName(activity.action) }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Description
                </th>
                <td mat-cell *matCellDef="let activity" class="py-3">
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ activity.description }}
                  </span>
                </td>
              </ng-container>

              <!-- Severity Column -->
              <ng-container matColumnDef="severity">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Severity
                </th>
                <td mat-cell *matCellDef="let activity" class="py-3">
                  <mat-chip-listbox>
                    <mat-chip-option 
                      [class]="getSeverityChipClass(activity.severity)"
                      [disabled]="true"
                    >
                      <mat-icon class="mr-1" style="font-size: 14px;">
                        {{ getSeverityIcon(activity.severity) }}
                      </mat-icon>
                      {{ getSeverityLabel(activity.severity) }}
                    </mat-chip-option>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <!-- Device/IP Column -->
              <ng-container matColumnDef="device">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Device / IP
                </th>
                <td mat-cell *matCellDef="let activity" class="py-3">
                  <div class="flex flex-col">
                    @if (activity.device_info?.device) {
                      <div class="flex items-center mb-1">
                        <mat-icon class="mr-1 text-gray-500" style="font-size: 14px;">
                          {{ activity.device_info.isMobile ? 'phone_android' : 'computer' }}
                        </mat-icon>
                        <span class="text-xs text-gray-600 dark:text-gray-400">
                          {{ activity.device_info.device }}
                        </span>
                      </div>
                    }
                    @if (activity.ip_address) {
                      <span class="text-xs font-mono text-gray-500 dark:text-gray-500">
                        {{ activity.ip_address }}
                      </span>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Session Column -->
              <ng-container matColumnDef="session">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Session
                </th>
                <td mat-cell *matCellDef="let activity" class="py-3">
                  @if (activity.session_id) {
                    <span 
                      class="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
                      [matTooltip]="activity.session_id"
                    >
                      {{ activity.session_id.substring(0, 8) }}...
                    </span>
                  } @else {
                    <span class="text-xs text-gray-400">-</span>
                  }
                </td>
              </ng-container>

              <!-- Table Header and Rows -->
              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr 
                mat-row 
                *matRowDef="let activity; columns: displayedColumns;"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                (click)="onRowClick(activity)"
                [matTooltip]="'Click for details'"
              ></tr>
            </table>
          </div>

          <!-- Pagination -->
          @if (pagination()) {
            <div class="border-t dark:border-gray-700 px-4 py-3">
              <mat-paginator
                [length]="pagination()!.total"
                [pageSize]="pagination()!.limit"
                [pageIndex]="pagination()!.page - 1"
                [pageSizeOptions]="pageSizeOptions"
                [showFirstLastButtons]="true"
                (page)="onPageChange($event)"
                aria-label="Select page"
              >
              </mat-paginator>
            </div>
          }
        }
      </ax-card>
    </div>
  `,
  styleUrl: './activity-log.component.scss'
})
export class ActivityLogComponent implements OnInit, OnDestroy {
  private activityLogService = inject(ActivityLogService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Signals
  showStats = signal<boolean>(true);
  autoRefresh = signal<boolean>(false);

  // Service signals
  activities = this.activityLogService.activities;
  stats = this.activityLogService.stats;
  pagination = this.activityLogService.pagination;
  isLoading = this.activityLogService.loading;
  error = this.activityLogService.error;

  // Computed signals
  hasActivities = this.activityLogService.hasActivities;
  totalActivities = this.activityLogService.totalActivities;
  currentFilters = computed(() => this.activityLogService.getCurrentFilters());
  hasActiveFilters = computed(() => {
    const filters = this.currentFilters();
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'page' || key === 'limit') return false;
      return value !== null && value !== undefined && value !== '';
    });
  });

  // Table configuration
  displayedColumns = ['timestamp', 'action', 'description', 'severity', 'device', 'session'];
  pageSizeOptions = [10, 20, 50, 100];

  ngOnInit(): void {
    // Load initial data
    this.loadInitialData();

    // Set up auto-refresh
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    // Load activities and stats in parallel
    this.activityLogService.loadActivities().subscribe({
      error: (error) => {
        this.snackBar.open('Failed to load activities', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });

    this.activityLogService.loadStats().subscribe({
      error: (error) => {
        console.warn('Failed to load activity stats:', error);
      }
    });
  }

  private setupAutoRefresh(): void {
    // Auto-refresh every 30 seconds when enabled
    timer(0, 30000)
      .pipe(
        switchMap(() => this.autoRefresh() ? timer(0) : []),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (!this.isLoading()) {
          this.activityLogService.refresh();
        }
      });
  }

  onFiltersChange(filters: ActivityLogFilters): void {
    this.activityLogService.updateFilters(filters);
  }

  onPageChange(event: PageEvent): void {
    this.activityLogService.updateFilters({
      page: event.pageIndex + 1,
      limit: event.pageSize
    });
  }

  onRowClick(activity: ActivityLog): void {
    // Show activity details in a snackbar or dialog
    const message = `Action: ${this.formatActionName(activity.action)}\nTime: ${this.formatDate(activity.created_at)}`;
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  refresh(): void {
    this.activityLogService.refresh();
    this.activityLogService.loadStats().subscribe();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.update(current => !current);
    
    if (this.autoRefresh()) {
      this.snackBar.open('Auto-refresh enabled', 'Close', { duration: 2000 });
    } else {
      this.snackBar.open('Auto-refresh disabled', 'Close', { duration: 2000 });
    }
  }

  toggleStats(): void {
    this.showStats.update(current => !current);
  }

  clearFilters(): void {
    this.activityLogService.clearFilters();
  }

  // Utility methods for display
  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getRelativeTime(timestamp: string): string {
    return this.activityLogService.getRelativeTime(timestamp);
  }

  formatActionName(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getActionIcon(action: string): string {
    const iconMap: Record<string, string> = {
      profile_view: 'visibility',
      profile_update: 'edit',
      password_change: 'lock',
      login: 'login',
      logout: 'logout',
      api_access: 'api',
      api_error: 'error_outline',
      settings_change: 'settings',
      avatar_update: 'account_circle',
      preferences_update: 'tune',
      security_event: 'security'
    };
    return iconMap[action] || 'help_outline';
  }

  getSeverityLabel(severity: string): string {
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG]?.label || severity;
  }

  getSeverityIcon(severity: string): string {
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG]?.icon || 'help';
  }

  getSeverityChipClass(severity: string): string {
    return `severity-${severity}`;
  }
}