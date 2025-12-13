import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { ImportStatus } from '../../types/system-init.types';

/**
 * Progress Tracker Component
 *
 * Real-time progress tracking display for import operations.
 * Shows job information, overall progress, batch details, timing information,
 * and actions for cancelling or viewing logs.
 *
 * Usage:
 * ```html
 * <app-progress-tracker
 *   [importStatus]="importStatus"
 *   [moduleName]="'Departments'"
 *   (cancel)="onCancel()"
 *   (viewLogs)="onViewLogs()"
 * />
 * ```
 */
@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressTrackerComponent {
  /**
   * The current import status containing progress information
   */
  @Input() importStatus!: ImportStatus;

  /**
   * Optional module name to display in the header
   */
  @Input() moduleName?: string;

  /**
   * Emitted when user clicks the Cancel button
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Emitted when user clicks the View Logs button
   */
  @Output() viewLogs = new EventEmitter<void>();

  /**
   * Track if cancellation has been initiated
   */
  protected cancellationInitiated = false;

  constructor() {
    // Set up effect to detect when import completes
    effect(() => {
      const status = this.importStatus;
      if (status && (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled')) {
        // Import has finished, no further updates needed
      }
    });
  }

  /**
   * Computed property for percentage complete
   */
  protected percentComplete = computed(() => {
    return this.importStatus.progress.percentComplete ?? 0;
  });

  /**
   * Computed property for elapsed time in a human-readable format
   */
  protected elapsedTime = computed(() => {
    if (!this.importStatus.startedAt) {
      return '0s';
    }

    const startTime = new Date(this.importStatus.startedAt).getTime();
    const now = Date.now();
    const elapsedMs = now - startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    if (elapsedSeconds < 60) {
      return `${elapsedSeconds}s`;
    }

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes}m ${seconds}s`;
  });

  /**
   * Computed property for estimated remaining time
   */
  protected estimatedRemaining = computed(() => {
    const percentComplete = this.percentComplete();
    if (percentComplete === 0 || percentComplete >= 100) {
      return '—';
    }

    const status = this.importStatus;
    if (!status.startedAt) {
      return '—';
    }

    const startTime = new Date(status.startedAt).getTime();
    const now = Date.now();
    const elapsedMs = now - startTime;
    const elapsedSeconds = elapsedMs / 1000;

    // Calculate average speed (records per second)
    const recordsProcessed = status.progress.importedRows;
    const speed = recordsProcessed / elapsedSeconds;

    if (speed === 0) {
      return '—';
    }

    // Calculate remaining records and time
    const remainingRecords = status.progress.totalRows - recordsProcessed;
    const remainingSeconds = Math.ceil(remainingRecords / speed);

    if (remainingSeconds < 60) {
      return `~${remainingSeconds}s`;
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `~${minutes}m ${seconds}s`;
  });

  /**
   * Computed property for import speed (records per second)
   */
  protected speed = computed(() => {
    const status = this.importStatus;
    if (!status.startedAt) {
      return 0;
    }

    const startTime = new Date(status.startedAt).getTime();
    const now = Date.now();
    const elapsedMs = now - startTime;
    const elapsedSeconds = elapsedMs / 1000;

    if (elapsedSeconds === 0) {
      return 0;
    }

    return status.progress.importedRows / elapsedSeconds;
  });

  /**
   * Computed property for formatted started time
   */
  protected startedTimeFormatted = computed(() => {
    if (!this.importStatus.startedAt) {
      return '—';
    }

    return new Date(this.importStatus.startedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });

  /**
   * Computed property for formatted completed time
   */
  protected completedTimeFormatted = computed(() => {
    if (!this.importStatus.completedAt) {
      return '—';
    }

    return new Date(this.importStatus.completedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });

  /**
   * Get the status display text
   */
  protected get statusText(): string {
    const status = this.importStatus?.status;
    switch (status) {
      case 'queued':
        return 'Queued';
      case 'running':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get the status icon
   */
  protected get statusIcon(): string {
    const status = this.importStatus?.status;
    switch (status) {
      case 'queued':
        return 'schedule';
      case 'running':
        return 'sync';
      case 'completed':
        return 'check_circle';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  }

  /**
   * Get the status color class for styling
   */
  protected get statusColorClass(): string {
    const status = this.importStatus?.status;
    return `status-${status}`;
  }

  /**
   * Get the progress bar color
   */
  protected get progressBarColor(): 'primary' | 'accent' | 'warn' {
    const status = this.importStatus?.status;
    switch (status) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'failed':
      case 'cancelled':
        return 'warn';
      case 'queued':
      default:
        return 'primary';
    }
  }

  /**
   * Check if progress bar should be indeterminate (for queued state)
   */
  protected get progressBarIndeterminate(): boolean {
    return this.importStatus?.status === 'queued';
  }

  /**
   * Check if cancel button should be visible
   */
  protected get showCancelButton(): boolean {
    return (
      (this.importStatus?.status === 'queued' ||
        this.importStatus?.status === 'running') &&
      !this.cancellationInitiated
    );
  }

  /**
   * Check if the import is still in progress
   */
  protected get isImporting(): boolean {
    return (
      this.importStatus?.status === 'queued' ||
      this.importStatus?.status === 'running'
    );
  }

  /**
   * Check if the import has completed
   */
  protected get isCompleted(): boolean {
    return this.importStatus?.status === 'completed';
  }

  /**
   * Check if the import has failed
   */
  protected get isFailed(): boolean {
    return this.importStatus?.status === 'failed';
  }

  /**
   * Check if the import has been cancelled
   */
  protected get isCancelled(): boolean {
    return this.importStatus?.status === 'cancelled';
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.cancellationInitiated = true;
    this.cancel.emit();
  }

  /**
   * Handle view logs button click
   */
  onViewLogs(): void {
    this.viewLogs.emit();
  }

  /**
   * Get the card container CSS class
   */
  protected get cardContainerClass(): string {
    return `progress-tracker progress-tracker-${this.importStatus?.status}`;
  }
}
