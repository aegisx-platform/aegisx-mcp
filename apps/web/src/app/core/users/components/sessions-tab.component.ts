import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { AxCardComponent } from '@aegisx/ui';
import { SessionsService } from '../../user-profile/components/activity-log/sessions.service';
import {
  ActivitySession,
  SessionFilters,
} from '../../user-profile/components/activity-log/sessions.types';
import { SessionDetailsDialogComponent } from './session-details.dialog';
import { SessionFilterComponent } from './session-filter.component';

@Component({
  selector: 'ax-sessions-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    AxCardComponent,
    SessionFilterComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Statistics Panel -->
      @if (sessionsService.stats() && !statsLoading()) {
        <ax-card
          class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Total Sessions -->
            <div class="text-center p-4">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {{ sessionsService.stats()?.total_sessions || 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Sessions
              </div>
            </div>

            <!-- Active Sessions -->
            <div class="text-center p-4">
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-300"
              >
                {{ sessionsService.stats()?.active_sessions || 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Sessions
              </div>
            </div>

            <!-- Unique Devices -->
            <div class="text-center p-4">
              <div
                class="text-2xl font-bold text-purple-600 dark:text-purple-300"
              >
                {{ sessionsService.stats()?.unique_devices || 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Unique Devices
              </div>
            </div>

            <!-- Last Session -->
            <div class="text-center p-4">
              <div
                class="text-lg font-semibold text-orange-600 dark:text-orange-300"
              >
                {{ getRelativeTime(sessionsService.stats()?.last_session) }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Last Session
              </div>
            </div>
          </div>
        </ax-card>
      }

      <!-- Filters -->
      <ax-session-filter
        (filtersChange)="onFilterApplied($event)"
      ></ax-session-filter>

      <!-- Sessions Table -->
      <ax-card>
        <h3 class="text-lg font-semibold mb-4">Session History</h3>

        @if (sessionsService.loading()) {
          <div class="flex items-center justify-center h-64">
            <mat-spinner [diameter]="40"></mat-spinner>
          </div>
        } @else if (sessionsService.error()) {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-red-400 mb-4"
              >error_outline</mat-icon
            >
            <p class="text-red-600 dark:text-red-400">
              {{ sessionsService.error() }}
            </p>
          </div>
        } @else if (sessionsService.hasSessions()) {
          <div class="overflow-x-auto">
            <table
              mat-table
              [dataSource]="sessionsService.sessions()"
              class="w-full"
            >
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Status
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.is_active) {
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      <span
                        class="w-2 h-2 rounded-full bg-green-600 mr-2"
                      ></span>
                      Active
                    </span>
                  } @else {
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      <span
                        class="w-2 h-2 rounded-full bg-gray-600 mr-2"
                      ></span>
                      Inactive
                    </span>
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

              <!-- Location Column -->
              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Location
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.location_info?.city) {
                    <span
                      [matTooltip]="formatLocationInfo(element.location_info)"
                      class="text-gray-700 dark:text-gray-300"
                    >
                      {{ element.location_info.city }}
                      @if (element.location_info.country) {
                        , {{ element.location_info.country }}
                      }
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

              <!-- Activities Count Column -->
              <ng-container matColumnDef="activities_count">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Activities
                </th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip selected class="bg-blue-50 dark:bg-blue-900">
                    {{ element.activities_count }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Duration Column -->
              <ng-container matColumnDef="duration">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Duration
                </th>
                <td mat-cell *matCellDef="let element">
                  <span class="text-gray-700 dark:text-gray-300">
                    {{ formatDuration(element.start_time, element.end_time) }}
                  </span>
                </td>
              </ng-container>

              <!-- Start Time Column -->
              <ng-container matColumnDef="start_time">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Started
                </th>
                <td mat-cell *matCellDef="let element">
                  <div class="text-sm">
                    <div class="text-gray-900 dark:text-gray-100">
                      {{ formatDate(element.start_time) }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ getRelativeTime(element.start_time) }}
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
                    [matTooltip]="'View session details'"
                    (click)="viewSessionDetails(element)"
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
        } @else {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-gray-400 mb-4">devices</mat-icon>
            <p class="text-gray-600 dark:text-gray-400">No sessions found</p>
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

      code {
        padding: 2px 6px;
        background: #f5f5f5;
        border-radius: 3px;
        font-family: monospace;
      }
    `,
  ],
})
export class SessionsTabComponent implements OnInit, OnDestroy {
  @Input() userId!: string;

  readonly sessionsService = inject(SessionsService);
  readonly dialog = inject(MatDialog);

  // Table columns - plain array (not signal) for mat-table compatibility
  readonly displayedColumns = [
    'status',
    'device',
    'location',
    'ip_address',
    'activities_count',
    'duration',
    'start_time',
    'actions',
  ];

  readonly statsLoading = signal(false);

  ngOnInit() {
    if (this.userId) {
      this.loadSessions();
      this.loadStats();
    }
  }

  ngOnDestroy() {
    // Clean up
  }

  private loadSessions() {
    this.sessionsService
      .loadSessions({
        userId: this.userId,
        page: 1,
        limit: 10,
      })
      .subscribe();
  }

  private loadStats() {
    this.statsLoading.set(true);
    this.sessionsService.loadStats(true, this.userId).subscribe({
      next: () => {
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      },
    });
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
    return this.sessionsService.getRelativeTime(timestamp);
  }

  formatDuration(startTime: string, endTime?: string): string {
    return this.sessionsService.formatDuration(startTime, endTime);
  }

  formatDeviceInfo(deviceInfo: Record<string, string | boolean>): string {
    const parts: string[] = [];
    if (deviceInfo['device']) parts.push(`Device: ${deviceInfo['device']}`);
    if (deviceInfo['browser']) parts.push(`Browser: ${deviceInfo['browser']}`);
    if (deviceInfo['os']) parts.push(`OS: ${deviceInfo['os']}`);
    if (deviceInfo['isMobile'] !== undefined)
      parts.push(`Mobile: ${deviceInfo['isMobile']}`);
    if (deviceInfo['isDesktop'] !== undefined)
      parts.push(`Desktop: ${deviceInfo['isDesktop']}`);
    if (deviceInfo['isTablet'] !== undefined)
      parts.push(`Tablet: ${deviceInfo['isTablet']}`);
    return parts.join('\n');
  }

  formatLocationInfo(locationInfo: Record<string, string>): string {
    const parts: string[] = [];
    if (locationInfo['city']) parts.push(`City: ${locationInfo['city']}`);
    if (locationInfo['country'])
      parts.push(`Country: ${locationInfo['country']}`);
    if (locationInfo['timezone'])
      parts.push(`Timezone: ${locationInfo['timezone']}`);
    return parts.join('\n');
  }

  viewSessionDetails(session: ActivitySession) {
    this.dialog.open(SessionDetailsDialogComponent, {
      width: '100%',
      maxWidth: '900px',
      disableClose: false,
      data: session,
    });
  }

  onFilterApplied(filters: SessionFilters) {
    this.sessionsService
      .loadSessions({
        ...filters,
        userId: this.userId,
        page: 1,
      })
      .subscribe();
  }
}
