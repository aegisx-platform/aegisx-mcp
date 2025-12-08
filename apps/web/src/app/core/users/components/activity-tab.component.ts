import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { AxCardComponent } from '@aegisx/ui';
import { ActivityLogService } from '../../user-profile/components/activity-log/activity-log.service';
import {
  ActivityLog,
  ActivityLogFilters,
  SEVERITY_CONFIG,
} from '../../user-profile/components/activity-log/activity-log.types';
import { ActivityLogFilterComponent } from '../../user-profile/components/activity-log/activity-log-filter.component';

@Component({
  selector: 'ax-activity-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    AxCardComponent,
    ActivityLogFilterComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Statistics Panel -->
      @if (activityLogService.stats() && !statsLoading()) {
        <ax-card
          class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Total Activities -->
            <div class="text-center p-4">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {{ activityLogService.stats()?.total_activities || 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Activities
              </div>
            </div>

            <!-- Activities This Week -->
            <div class="text-center p-4">
              <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-300">
                {{
                  activityLogService.stats()?.recent_activities_count
                    ?.this_week || 0
                }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This Week
              </div>
            </div>

            <!-- Activities Today -->
            <div class="text-center p-4">
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-300"
              >
                {{
                  activityLogService.stats()?.recent_activities_count?.today ||
                    0
                }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Today
              </div>
            </div>

            <!-- Last Activity -->
            <div class="text-center p-4">
              <div
                class="text-lg font-semibold text-purple-600 dark:text-purple-300"
              >
                {{ getRelativeTime(activityLogService.stats()?.last_activity) }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Last Activity
              </div>
            </div>
          </div>
        </ax-card>
      }

      <!-- Filters -->
      <ax-activity-log-filter
        (filtersChange)="onFilterApplied($event)"
      ></ax-activity-log-filter>

      <!-- Activity Table -->
      <ax-card>
        <h3 class="text-lg font-semibold mb-4">Activity Log</h3>

        @if (activityLogService.loading()) {
          <div class="flex items-center justify-center h-64">
            <mat-spinner [diameter]="40"></mat-spinner>
          </div>
        } @else if (activityLogService.error()) {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-red-400 mb-4"
              >error_outline</mat-icon
            >
            <p class="text-red-600 dark:text-red-400">
              {{ activityLogService.error() }}
            </p>
            <button
              mat-raised-button
              color="primary"
              (click)="refreshActivities()"
              class="mt-4"
            >
              <mat-icon>refresh</mat-icon>
              <span>Retry</span>
            </button>
          </div>
        } @else if (activityLogService.hasActivities()) {
          <div class="overflow-x-auto">
            <table
              mat-table
              [dataSource]="displayedActivities()"
              class="w-full"
            >
              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Action
                </th>
                <td mat-cell *matCellDef="let element">
                  <span class="font-medium text-gray-900 dark:text-gray-100">
                    {{ element.action | titlecase }}
                  </span>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Description
                </th>
                <td mat-cell *matCellDef="let element">
                  <div
                    class="max-w-xs truncate text-gray-700 dark:text-gray-300"
                  >
                    {{ element.description }}
                  </div>
                </td>
              </ng-container>

              <!-- Severity Column -->
              <ng-container matColumnDef="severity">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Severity
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.severity) {
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="getSeverityClass(element.severity)"
                    >
                      <mat-icon
                        class="mr-1"
                        [attr.aria-label]="element.severity"
                      >
                        {{ getSeverityIcon(element.severity) }}
                      </mat-icon>
                      {{ element.severity | titlecase }}
                    </span>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
              </ng-container>

              <!-- Device Info Column -->
              <ng-container matColumnDef="device">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Device
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.device_info?.device) {
                    <span
                      [matTooltip]="formatDeviceInfo(element.device_info)"
                      class="text-gray-700 dark:text-gray-300"
                    >
                      {{ element.device_info.device }}
                    </span>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
              </ng-container>

              <!-- IP Address Column -->
              <ng-container matColumnDef="ip_address">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  IP Address
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.ip_address) {
                    <code
                      class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                    >
                      {{ element.ip_address }}
                    </code>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
              </ng-container>

              <!-- User Agent Column -->
              <ng-container matColumnDef="user_agent">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  User Agent
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.user_agent) {
                    <span
                      [matTooltip]="element.user_agent"
                      class="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs block"
                    >
                      {{ truncateString(element.user_agent, 30) }}
                    </span>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
              </ng-container>

              <!-- Timestamp Column -->
              <ng-container matColumnDef="created_at">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Timestamp
                </th>
                <td mat-cell *matCellDef="let element">
                  <div class="text-sm">
                    <div class="text-gray-900 dark:text-gray-100">
                      {{ formatDate(element.created_at) }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ getRelativeTime(element.created_at) }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  class="font-semibold text-right"
                >
                  Actions
                </th>
                <td mat-cell *matCellDef="let element" class="text-right">
                  <button
                    mat-icon-button
                    [matTooltip]="'View details'"
                    (click)="viewDetails(element)"
                  >
                    <mat-icon>info</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr
                mat-header-row
                *matHeaderRowDef="displayedColumns; sticky: true"
                class="bg-gray-50 dark:bg-gray-800"
              ></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              ></tr>
            </table>
          </div>

          <!-- Paginator -->
          <mat-paginator
            [length]="activityLogService.totalActivities()"
            [pageSize]="activityLogService.pagination()?.limit || 10"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            class="mt-4"
            showFirstLastButtons
          ></mat-paginator>
        } @else {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-gray-400 mb-4">history</mat-icon>
            <p class="text-gray-600 dark:text-gray-400">No activities found</p>
          </div>
        }
      </ax-card>
    </div>
  `,
  styles: [
    `
      table {
        width: 100%;
      }

      th {
        font-weight: 600;
        color: #666;
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
      }

      tr:last-child td {
        border-bottom: none;
      }

      ::ng-deep .mat-mdc-paginator {
        background: transparent;
      }

      :host ::ng-deep .mat-mdc-table {
        background: transparent;
      }
    `,
  ],
})
export class ActivityTabComponent implements OnInit, OnDestroy {
  @Input() userId!: string;

  private destroy = new Map<string, () => void>();

  readonly activityLogService = inject(ActivityLogService);

  // Table columns - plain array (not signal) for mat-table compatibility
  readonly displayedColumns = [
    'action',
    'description',
    'severity',
    'device',
    'ip_address',
    'created_at',
    'actions',
  ];

  readonly displayedActivities = computed(
    () => this.activityLogService.activities() || [],
  );

  readonly statsLoading = signal(false);

  constructor() {
    // DISABLED - Causing loop in API calls
    // Load activities and stats when userId changes
    /*
    effect(
      () => {
        if (this.userId) {
          // Reset service state for new user
          this.activityLogService.reset();
          // Load data for this user
          this.loadActivities();
          this.loadStats();
        }
      },
      { allowSignalWrites: true },
    );
    */
  }

  ngOnInit() {
    if (this.userId) {
      this.loadActivities();
      this.loadStats();
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.destroy.forEach((unsubscribe) => unsubscribe());
    this.destroy.clear();
  }

  loadActivities() {
    this.activityLogService
      .loadActivities({
        userId: this.userId,
        page: 1,
        limit: 10,
      })
      .subscribe();
  }

  loadStats() {
    this.statsLoading.set(true);
    this.activityLogService.loadStats(true, this.userId).subscribe({
      next: () => {
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      },
    });
  }

  refreshActivities() {
    this.loadActivities();
  }

  onPageChange(event: PageEvent) {
    const currentFilters = this.activityLogService.getCurrentFilters();
    this.activityLogService
      .loadActivities({
        ...currentFilters,
        userId: this.userId,
        page: event.pageIndex + 1,
        limit: event.pageSize,
      })
      .subscribe();
  }

  onFilterApplied(filters: ActivityLogFilters) {
    this.activityLogService
      .loadActivities({
        ...filters,
        userId: this.userId,
        page: 1,
      })
      .subscribe();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRelativeTime(timestamp: string | undefined): string {
    if (!timestamp) return '-';
    return this.activityLogService.getRelativeTime(timestamp);
  }

  getSeverityClass(severity: string): string {
    const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
    return config?.badgeClass || 'bg-gray-100 text-gray-800';
  }

  getSeverityIcon(severity: string): string {
    const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
    return config?.icon || 'info';
  }

  formatDeviceInfo(deviceInfo: Record<string, string | boolean>): string {
    const parts: string[] = [];
    if (deviceInfo['device']) parts.push(`Device: ${deviceInfo['device']}`);
    if (deviceInfo['isMobile'] !== undefined)
      parts.push(`Mobile: ${deviceInfo['isMobile']}`);
    if (deviceInfo['isDesktop'] !== undefined)
      parts.push(`Desktop: ${deviceInfo['isDesktop']}`);
    if (deviceInfo['isTablet'] !== undefined)
      parts.push(`Tablet: ${deviceInfo['isTablet']}`);
    return parts.join('\n');
  }

  truncateString(str: string, length: number): string {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  viewDetails(activity: ActivityLog) {
    // This can be extended to open a dialog with full activity details
    console.log('View activity details:', activity);
  }
}
