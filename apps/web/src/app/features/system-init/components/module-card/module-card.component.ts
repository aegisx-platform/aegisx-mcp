import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImportModule, ImportModuleStatus } from '../../types/system-init.types';

/**
 * Extended import module with component-specific properties
 */
export interface ModuleCardData extends ImportModule {
  // For in-progress state
  progress?: {
    totalRows: number;
    importedRows: number;
    percentComplete: number;
  };
  // For failed state
  error?: string;
}

/**
 * Module Card Component
 *
 * Displays import module information with status, progress, and action buttons.
 * Supports multiple visual states: not_started, in_progress, completed, failed.
 *
 * Usage:
 * ```html
 * <app-module-card
 *   [module]="module"
 *   (import)="onImport($event)"
 *   (viewDetails)="onViewDetails($event)"
 *   (rollback)="onRollback($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-module-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './module-card.component.html',
  styleUrls: ['./module-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleCardComponent {
  /**
   * The import module to display
   */
  @Input() module!: ModuleCardData;

  /**
   * Emitted when user clicks "Start Import" button
   */
  @Output() import = new EventEmitter<ModuleCardData>();

  /**
   * Emitted when user clicks "View Progress", "View Details", or "View Errors" button
   */
  @Output() viewDetails = new EventEmitter<ModuleCardData>();

  /**
   * Emitted when user clicks "Rollback" button
   */
  @Output() rollback = new EventEmitter<ModuleCardData>();

  /**
   * Get the display name combining domain and subdomain
   */
  get displayPath(): string {
    if (this.module.subdomain) {
      return `${this.module.domain}/${this.module.subdomain}`;
    }
    return this.module.domain;
  }

  /**
   * Get the status icon based on import status
   */
  get statusIcon(): string {
    switch (this.module.importStatus) {
      case 'completed':
        return 'check_circle';
      case 'in_progress':
        return 'sync';
      case 'failed':
        return 'error';
      case 'not_started':
      default:
        return 'pause_circle';
    }
  }

  /**
   * Get the status badge class for styling
   */
  get statusBadgeClass(): string {
    return `badge badge-${this.module.importStatus}`;
  }

  /**
   * Get the card container class for styling
   */
  get cardContainerClass(): string {
    return `module-card module-card-${this.module.importStatus}`;
  }

  /**
   * Get the status label text
   */
  get statusLabel(): string {
    switch (this.module.importStatus) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'failed':
        return 'Failed';
      case 'not_started':
      default:
        return 'Not Started';
    }
  }

  /**
   * Get the primary action button text and icon based on status
   */
  get primaryActionText(): string {
    switch (this.module.importStatus) {
      case 'in_progress':
        return 'View Progress';
      case 'completed':
        return 'View Details';
      case 'failed':
        return 'View Errors';
      case 'not_started':
      default:
        return 'Start Import';
    }
  }

  /**
   * Get the primary action button icon based on status
   */
  get primaryActionIcon(): string {
    switch (this.module.importStatus) {
      case 'in_progress':
        return 'visibility';
      case 'completed':
        return 'info';
      case 'failed':
        return 'warning';
      case 'not_started':
      default:
        return 'cloud_download';
    }
  }

  /**
   * Check if the primary action is "Start Import"
   */
  get isStartImport(): boolean {
    return this.module.importStatus === 'not_started';
  }

  /**
   * Check if the primary action is "View Progress"
   */
  get isViewProgress(): boolean {
    return this.module.importStatus === 'in_progress';
  }

  /**
   * Check if the primary action is "View Details"
   */
  get isViewDetails(): boolean {
    return this.module.importStatus === 'completed';
  }

  /**
   * Check if the primary action is "View Errors"
   */
  get isViewErrors(): boolean {
    return this.module.importStatus === 'failed';
  }

  /**
   * Check if rollback button should be shown
   */
  get showRollback(): boolean {
    return this.module.importStatus === 'completed';
  }

  /**
   * Get the record count display text based on status
   */
  get recordCountText(): string {
    if (this.module.importStatus === 'in_progress' && this.module.progress) {
      const percent = Math.round(this.module.progress.percentComplete);
      return `${this.module.progress.importedRows} / ${this.module.progress.totalRows} records (${percent}%)`;
    }
    return `${this.module.recordCount} records`;
  }

  /**
   * Get last import datetime
   */
  get lastImportDate(): string {
    if (this.module.lastImport) {
      return new Date(this.module.lastImport.completedAt).toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '';
  }

  /**
   * Get the progress percentage for the progress bar
   */
  get progressPercentage(): number {
    if (this.module.importStatus === 'in_progress' && this.module.progress) {
      return this.module.progress.percentComplete;
    }
    return 0;
  }

  /**
   * Handle primary action button click
   */
  onPrimaryAction(): void {
    if (this.isStartImport || this.isViewErrors) {
      if (this.isStartImport) {
        this.import.emit(this.module);
      } else if (this.isViewErrors) {
        this.viewDetails.emit(this.module);
      }
    } else {
      this.viewDetails.emit(this.module);
    }
  }

  /**
   * Handle import button click
   */
  onImport(): void {
    this.import.emit(this.module);
  }

  /**
   * Handle view details button click
   */
  onViewDetails(): void {
    this.viewDetails.emit(this.module);
  }

  /**
   * Handle rollback button click
   */
  onRollback(): void {
    this.rollback.emit(this.module);
  }
}
