import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AegisxCardComponent } from '@aegisx/ui';
import { ActivitySession } from '../../user-profile/components/activity-log/sessions.types';
import { SessionsService } from '../../user-profile/components/activity-log/sessions.service';
import { ActivityLogService } from '../../user-profile/components/activity-log/activity-log.service';
import { ActivityLog } from '../../user-profile/components/activity-log/activity-log.types';

@Component({
  selector: 'ax-session-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    AegisxCardComponent,
  ],
  template: `
    <h2 mat-dialog-title class="text-2xl font-bold">Session Details</h2>

    <mat-dialog-content class="session-content">
      <mat-tab-group class="mt-0">
        <!-- Session Info Tab -->
        <mat-tab label="Session Information">
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Session ID -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">
                  Session ID
                </h4>
                <code
                  class="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded block text-gray-700 dark:text-gray-300 break-all"
                >
                  {{ session.session_id }}
                </code>
              </div>

              <!-- Status -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">Status</h4>
                @if (session.is_active) {
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    <span class="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                    Active
                  </span>
                } @else {
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <span class="w-2 h-2 rounded-full bg-gray-600 mr-2"></span>
                    Inactive
                  </span>
                }
              </div>

              <!-- Start Time -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">
                  Started
                </h4>
                <div class="text-gray-800 dark:text-gray-200">
                  {{ formatDate(session.start_time) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ getRelativeTime(session.start_time) }}
                </div>
              </div>

              <!-- End Time -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">Ended</h4>
                @if (session.end_time) {
                  <div class="text-gray-800 dark:text-gray-200">
                    {{ formatDate(session.end_time) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ getRelativeTime(session.end_time) }}
                  </div>
                } @else {
                  <span class="text-gray-400">Ongoing</span>
                }
              </div>

              <!-- Duration -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">
                  Duration
                </h4>
                <div
                  class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                >
                  {{ formatDuration(session.start_time, session.end_time) }}
                </div>
              </div>

              <!-- Activities Count -->
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">
                  Activities
                </h4>
                <mat-chip selected class="text-lg">
                  {{ session.activities_count }}
                </mat-chip>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Device Info Tab -->
        <mat-tab label="Device Information">
          <div class="p-6">
            @if (session.device_info) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Browser -->
                @if (session.device_info.browser) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Browser
                    </h4>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">language</mat-icon>
                      <span class="text-gray-800 dark:text-gray-200">
                        {{ session.device_info.browser }}
                      </span>
                    </div>
                  </div>
                }

                <!-- Operating System -->
                @if (session.device_info.os) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Operating System
                    </h4>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">computer</mat-icon>
                      <span class="text-gray-800 dark:text-gray-200">
                        {{ session.device_info.os }}
                      </span>
                    </div>
                  </div>
                }

                <!-- Device Type -->
                @if (session.device_info.device) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Device Type
                    </h4>
                    <div class="text-gray-800 dark:text-gray-200">
                      {{ session.device_info.device }}
                    </div>
                  </div>
                }

                <!-- Mobile Flag -->
                @if (session.device_info.isMobile !== undefined) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Mobile
                    </h4>
                    @if (session.device_info.isMobile) {
                      <mat-chip selected color="primary">Yes</mat-chip>
                    } @else {
                      <mat-chip>No</mat-chip>
                    }
                  </div>
                }

                <!-- Desktop Flag -->
                @if (session.device_info.isDesktop !== undefined) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Desktop
                    </h4>
                    @if (session.device_info.isDesktop) {
                      <mat-chip selected color="primary">Yes</mat-chip>
                    } @else {
                      <mat-chip>No</mat-chip>
                    }
                  </div>
                }

                <!-- Tablet Flag -->
                @if (session.device_info.isTablet !== undefined) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Tablet
                    </h4>
                    @if (session.device_info.isTablet) {
                      <mat-chip selected color="primary">Yes</mat-chip>
                    } @else {
                      <mat-chip>No</mat-chip>
                    }
                  </div>
                }

                <!-- IP Address -->
                @if (session.ip_address) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      IP Address
                    </h4>
                    <code
                      class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                    >
                      {{ session.ip_address }}
                    </code>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <mat-icon class="text-6xl text-gray-400">info</mat-icon>
                <p class="text-gray-600 dark:text-gray-400 mt-4">
                  No device information available
                </p>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Location Info Tab -->
        <mat-tab label="Location Information">
          <div class="p-6">
            @if (session.location_info) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Country -->
                @if (session.location_info.country) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Country
                    </h4>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">public</mat-icon>
                      <span class="text-gray-800 dark:text-gray-200">
                        {{ session.location_info.country }}
                      </span>
                    </div>
                  </div>
                }

                <!-- City -->
                @if (session.location_info.city) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      City
                    </h4>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">location_city</mat-icon>
                      <span class="text-gray-800 dark:text-gray-200">
                        {{ session.location_info.city }}
                      </span>
                    </div>
                  </div>
                }

                <!-- Timezone -->
                @if (session.location_info.timezone) {
                  <div>
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">
                      Timezone
                    </h4>
                    <div class="flex items-center">
                      <mat-icon class="mr-2">schedule</mat-icon>
                      <span class="text-gray-800 dark:text-gray-200">
                        {{ session.location_info.timezone }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <mat-icon class="text-6xl text-gray-400">info</mat-icon>
                <p class="text-gray-600 dark:text-gray-400 mt-4">
                  No location information available
                </p>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Activities Tab -->
        <mat-tab label="Session Activities">
          <div class="p-6">
            @if (activitiesLoading()) {
              <div class="flex items-center justify-center py-8">
                <mat-spinner [diameter]="40"></mat-spinner>
              </div>
            } @else if (sessionActivities().length > 0) {
              <mat-list>
                @for (activity of sessionActivities(); track activity.id) {
                  <mat-list-item class="mb-4">
                    <div class="w-full">
                      <div class="flex items-center gap-2 mb-2">
                        <strong class="text-gray-900 dark:text-gray-100">
                          {{ activity.action | titlecase }}
                        </strong>
                        @if (activity.severity) {
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            [ngClass]="getSeverityClass(activity.severity)"
                          >
                            {{ activity.severity | titlecase }}
                          </span>
                        }
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ activity.description }}
                      </p>
                      <div
                        class="text-xs text-gray-500 dark:text-gray-500 mt-2"
                      >
                        {{ formatDate(activity.created_at) }}
                        ({{ getRelativeTime(activity.created_at) }})
                      </div>
                    </div>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <div class="text-center py-8">
                <mat-icon class="text-6xl text-gray-400">history</mat-icon>
                <p class="text-gray-600 dark:text-gray-400 mt-4">
                  No activities found for this session
                </p>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content.session-content {
        overflow-y: auto;
        max-height: calc(100vh - 200px);
      }

      ::ng-deep .mat-mdc-tab-list {
        border-bottom: 1px solid #e5e7eb;
      }

      ::ng-deep .mat-mdc-tab-header {
        background: transparent;
      }

      mat-list-item {
        height: auto;
      }
    `,
  ],
})
export class SessionDetailsDialogComponent implements OnInit {
  readonly session: ActivitySession;
  readonly sessionsService = inject(SessionsService);
  readonly activityLogService = inject(ActivityLogService);

  sessionActivities = () => this.activityLogService.activities();
  activitiesLoading = () => this.activityLogService.loading();

  constructor(
    private dialogRef: MatDialogRef<SessionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ActivitySession,
  ) {
    this.session = data;
  }

  ngOnInit() {
    // Load activities for this session if session_id exists
    // Note: This would need a dedicated backend endpoint to fetch activities by session_id
    // For now, we'll show the session details without activities
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

  getSeverityClass(severity: string): string {
    const severityMap: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      warning:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return severityMap[severity] || 'bg-gray-100 text-gray-800';
  }

  onClose() {
    this.dialogRef.close();
  }
}
