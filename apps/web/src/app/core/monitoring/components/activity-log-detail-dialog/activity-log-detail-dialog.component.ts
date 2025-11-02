import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { ActivityLog } from '../../models/monitoring.types';

@Component({
  selector: 'app-activity-log-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatCardModule,
  ],
  template: `
    <!-- Header -->
    <div
      mat-dialog-title
      class="flex items-center justify-between pb-4 border-b border-slate-200"
    >
      <div class="flex items-center gap-2">
        <mat-icon [class]="getSeverityIconClass()" class="!leading-[1]">
          {{ getSeverityIcon() }}
        </mat-icon>
        <h2 class="text-base font-semibold m-0">Activity Log Details</h2>
        <span class="text-xs text-slate-500">{{
          data.created_at | date: 'medium'
        }}</span>
      </div>
      <button mat-icon-button [mat-dialog-close]="null">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Content -->
    <mat-dialog-content class="dialog-content">
      <!-- Activity Info Section -->
      <mat-card
        appearance="outlined"
        class="info-card mb-4 border border-slate-200 rounded-xl"
      >
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !mb-0">
            <mat-icon
              class="text-blue-500 !text-[20px] !w-[20px] !h-[20px] !leading-[1]"
              >info</mat-icon
            >
            <span>Activity Information</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="info-grid">
            <!-- Severity & Action -->
            <div class="info-row">
              <span class="info-label">Severity:</span>
              <mat-chip [class]="getSeverityChipClass()">
                {{ data.severity.toUpperCase() }}
              </mat-chip>
            </div>
            <div class="info-row">
              <span class="info-label">Action:</span>
              <mat-chip class="action-chip">
                {{ data.action }}
              </mat-chip>
            </div>

            <!-- Description -->
            <div class="info-row full-width">
              <span class="info-label">Description:</span>
              <span class="info-value break-words">{{ data.description }}</span>
            </div>

            <!-- User ID -->
            <div class="info-row full-width">
              <span class="info-label">User ID:</span>
              <code class="id-code">{{ data.user_id }}</code>
            </div>

            <!-- Activity ID -->
            <div class="info-row full-width">
              <span class="info-label">Activity ID:</span>
              <code class="id-code">{{ data.id }}</code>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Device Information Section -->
      <mat-card
        *ngIf="hasDeviceInfo()"
        appearance="outlined"
        class="info-card mb-4 border border-slate-200 rounded-xl"
      >
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !mb-0">
            <mat-icon
              class="text-cyan-500 !text-[20px] !w-[20px] !h-[20px] !leading-[1]"
              >devices</mat-icon
            >
            <span>Device Information</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="info-grid">
            <div *ngIf="data.device_info?.browser" class="info-row">
              <span class="info-label">Browser:</span>
              <span class="info-value">{{ data.device_info?.browser }}</span>
            </div>
            <div *ngIf="data.device_info?.os" class="info-row">
              <span class="info-label">Operating System:</span>
              <span class="info-value">{{ data.device_info?.os }}</span>
            </div>
            <div *ngIf="data.device_info?.device" class="info-row full-width">
              <span class="info-label">Device:</span>
              <span class="info-value">{{ data.device_info?.device }}</span>
            </div>
            <div class="info-row full-width">
              <span class="info-label">Device Type:</span>
              <div class="flex gap-2">
                <mat-chip
                  *ngIf="data.device_info?.isMobile"
                  class="device-type-chip"
                >
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]"
                    >smartphone</mat-icon
                  >
                  Mobile
                </mat-chip>
                <mat-chip
                  *ngIf="data.device_info?.isDesktop"
                  class="device-type-chip"
                >
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]"
                    >computer</mat-icon
                  >
                  Desktop
                </mat-chip>
                <mat-chip
                  *ngIf="data.device_info?.isTablet"
                  class="device-type-chip"
                >
                  <mat-icon class="!text-[16px] !w-[16px] !h-[16px]"
                    >tablet</mat-icon
                  >
                  Tablet
                </mat-chip>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Location Information Section -->
      <mat-card
        *ngIf="hasLocationInfo()"
        appearance="outlined"
        class="info-card mb-4 border border-slate-200 rounded-xl"
      >
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !mb-0">
            <mat-icon
              class="text-emerald-500 !text-[20px] !w-[20px] !h-[20px] !leading-[1]"
              >location_on</mat-icon
            >
            <span>Location Information</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="info-grid">
            <div *ngIf="data.location_info?.country" class="info-row">
              <span class="info-label">Country:</span>
              <span class="info-value">{{ data.location_info?.country }}</span>
            </div>
            <div *ngIf="data.location_info?.city" class="info-row">
              <span class="info-label">City:</span>
              <span class="info-value">{{ data.location_info?.city }}</span>
            </div>
            <div *ngIf="data.location_info?.timezone" class="info-row">
              <span class="info-label">Timezone:</span>
              <span class="info-value">{{ data.location_info?.timezone }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Session Context Section -->
      <mat-card
        *ngIf="hasSessionContext()"
        appearance="outlined"
        class="info-card mb-4 border border-slate-200 rounded-xl"
      >
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !mb-0">
            <mat-icon
              class="text-purple-500 !text-[20px] !w-[20px] !h-[20px] !leading-[1]"
              >key</mat-icon
            >
            <span>Session Context</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="info-grid">
            <div *ngIf="data.session_id" class="info-row">
              <span class="info-label">Session ID:</span>
              <code class="id-code">{{ data.session_id }}</code>
            </div>
            <div *ngIf="data.request_id" class="info-row">
              <span class="info-label">Request ID:</span>
              <code class="id-code">{{ data.request_id }}</code>
            </div>
            <div *ngIf="data.ip_address" class="info-row">
              <span class="info-label">IP Address:</span>
              <code class="id-code">{{ data.ip_address }}</code>
            </div>
            <div *ngIf="data.user_agent" class="info-row full-width">
              <span class="info-label">User Agent:</span>
              <span class="info-value text-xs break-words">{{
                data.user_agent
              }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Additional Metadata Section -->
      <mat-card
        *ngIf="data.metadata"
        appearance="outlined"
        class="info-card mb-4 border border-slate-200 rounded-xl"
      >
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !mb-0">
            <mat-icon
              class="text-orange-400 !text-[20px] !w-[20px] !h-[20px] !leading-[1]"
              >data_object</mat-icon
            >
            <span>Additional Metadata</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <pre class="metadata-json">{{ formatMetadata(data.metadata) }}</pre>
        </mat-card-content>
      </mat-card>

      <!-- Timestamp Section -->
      <mat-card
        appearance="outlined"
        class="info-card border border-slate-200 rounded-xl"
      >
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2 !mb-0">
            <mat-icon
              class="text-slate-500 !text-[20px] !w-[20px] !h-[20px] !leading-[1]"
              >schedule</mat-icon
            >
            <span>Timestamp</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Created At:</span>
              <span class="info-value">{{
                data.created_at | date: 'medium'
              }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </mat-dialog-content>

    <!-- Footer -->
    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button [mat-dialog-close]="null">
        <mat-icon>close</mat-icon>
        Close
      </button>
      <button mat-raised-button color="primary" (click)="copyToClipboard()">
        <mat-icon>content_copy</mat-icon>
        Copy Details
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-content {
        max-height: 70vh;
        overflow-y: auto;
        padding: 24px;
      }

      .dialog-footer {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        gap: 12px;
      }

      .info-card {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .info-card mat-card-header {
        padding: 16px 16px 0;
      }

      .info-card mat-card-title {
        font-size: 1rem;
        font-weight: 600;
        color: #374151;
      }

      .info-card mat-card-content {
        padding: 16px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .info-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .info-row.full-width {
        grid-column: 1 / -1;
      }

      .info-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .info-value {
        font-size: 0.875rem;
        color: #1f2937;
        line-height: 1.5;
      }

      .id-code {
        font-family: 'Courier New', monospace;
        font-size: 0.813rem;
        background-color: #f3f4f6;
        padding: 6px 10px;
        border-radius: 4px;
        color: #374151;
        display: inline-block;
      }

      .metadata-json {
        font-family: 'Courier New', monospace;
        font-size: 0.813rem;
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 0;
        line-height: 1.6;
        color: #1f2937;
      }

      mat-chip.severity-critical {
        background-color: #fee2e2 !important;
        color: #991b1b !important;
      }

      mat-chip.severity-error {
        background-color: #fecaca !important;
        color: #b91c1c !important;
      }

      mat-chip.severity-warning {
        background-color: #fef3c7 !important;
        color: #92400e !important;
      }

      mat-chip.severity-info {
        background-color: #d1fae5 !important;
        color: #065f46 !important;
      }

      mat-chip.action-chip {
        background-color: #dbeafe !important;
        color: #1e40af !important;
      }

      mat-chip.device-type-chip {
        background-color: #e0e7ff !important;
        color: #3730a3 !important;
      }

      .icon-critical {
        color: #dc2626;
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      .icon-error {
        color: #ef4444;
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      .icon-warning {
        color: #f59e0b;
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      .icon-info {
        color: #10b981;
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      ::ng-deep .mat-mdc-dialog-surface {
        border-radius: 12px !important;
      }
    `,
  ],
})
export class ActivityLogDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ActivityLogDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActivityLog,
  ) {}

  getSeverityIcon(): string {
    switch (this.data.severity) {
      case 'critical':
        return 'error';
      case 'error':
        return 'report_problem';
      case 'warning':
        return 'warning';
      case 'info':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  getSeverityIconClass(): string {
    switch (this.data.severity) {
      case 'critical':
        return 'icon-critical';
      case 'error':
        return 'icon-error';
      case 'warning':
        return 'icon-warning';
      case 'info':
        return 'icon-info';
      default:
        return 'icon-info';
    }
  }

  getSeverityChipClass(): string {
    switch (this.data.severity) {
      case 'critical':
        return 'severity-critical';
      case 'error':
        return 'severity-error';
      case 'warning':
        return 'severity-warning';
      case 'info':
        return 'severity-info';
      default:
        return 'severity-info';
    }
  }

  hasDeviceInfo(): boolean {
    return !!(
      this.data.device_info?.browser ||
      this.data.device_info?.os ||
      this.data.device_info?.device ||
      this.data.device_info?.isMobile ||
      this.data.device_info?.isDesktop ||
      this.data.device_info?.isTablet
    );
  }

  hasLocationInfo(): boolean {
    return !!(
      this.data.location_info?.country ||
      this.data.location_info?.city ||
      this.data.location_info?.timezone
    );
  }

  hasSessionContext(): boolean {
    return !!(
      this.data.session_id ||
      this.data.request_id ||
      this.data.ip_address ||
      this.data.user_agent
    );
  }

  formatMetadata(metadata: Record<string, any>): string {
    return JSON.stringify(metadata, null, 2);
  }

  copyToClipboard(): void {
    const details = this.formatActivityDetails();
    navigator.clipboard.writeText(details).then(
      () => {
        // Success - close dialog and return true to show success message
        this.dialogRef.close(true);
      },
      (err) => {
        console.error('Failed to copy to clipboard:', err);
        // Don't close dialog on error, user can try again
      },
    );
  }

  private formatActivityDetails(): string {
    let details = `Activity Log Details
==================

Severity: ${this.data.severity.toUpperCase()}
Action: ${this.data.action}
Description: ${this.data.description}
User ID: ${this.data.user_id}
Activity ID: ${this.data.id}

`;

    if (this.hasDeviceInfo()) {
      details += `Device Information:
${this.data.device_info?.browser ? `Browser: ${this.data.device_info.browser}` : ''}
${this.data.device_info?.os ? `OS: ${this.data.device_info.os}` : ''}
${this.data.device_info?.device ? `Device: ${this.data.device_info.device}` : ''}
${this.data.device_info?.isMobile ? `Type: Mobile` : ''}
${this.data.device_info?.isDesktop ? `Type: Desktop` : ''}
${this.data.device_info?.isTablet ? `Type: Tablet` : ''}

`;
    }

    if (this.hasLocationInfo()) {
      details += `Location Information:
${this.data.location_info?.country ? `Country: ${this.data.location_info.country}` : ''}
${this.data.location_info?.city ? `City: ${this.data.location_info.city}` : ''}
${this.data.location_info?.timezone ? `Timezone: ${this.data.location_info.timezone}` : ''}

`;
    }

    if (this.hasSessionContext()) {
      details += `Session Context:
${this.data.session_id ? `Session ID: ${this.data.session_id}` : ''}
${this.data.request_id ? `Request ID: ${this.data.request_id}` : ''}
${this.data.ip_address ? `IP Address: ${this.data.ip_address}` : ''}
${this.data.user_agent ? `User Agent: ${this.data.user_agent}` : ''}

`;
    }

    if (this.data.metadata) {
      details += `Additional Metadata:
${JSON.stringify(this.data.metadata, null, 2)}

`;
    }

    details += `Timestamp:
Created At: ${this.data.created_at}
`;

    return details;
  }
}
