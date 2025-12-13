import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../../types/system-init.types';

/**
 * Validation Results Component
 *
 * Displays validation errors and warnings from file import validation.
 * Shows a summary card with total rows, valid rows, errors, and warnings.
 * Provides expandable sections for detailed error and warning information.
 * Includes a download button to export the full validation report.
 *
 * Usage:
 * ```html
 * <app-validation-results
 *   [validationResult]="validationResult"
 *   [fileName]="'departments_data.csv'"
 *   [fileSize]="1200000"
 *   (downloadReport)="onDownloadReport()"
 * />
 * ```
 */
@Component({
  selector: 'app-validation-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './validation-results.component.html',
  styleUrls: ['./validation-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationResultsComponent {
  /**
   * The validation result object containing errors, warnings, and statistics
   */
  @Input() validationResult!: ValidationResult;

  /**
   * Optional file name to display in the header
   */
  @Input() fileName?: string;

  /**
   * Optional file size in bytes to display in the header
   */
  @Input() fileSize?: number;

  /**
   * Emitted when user clicks the download report button
   */
  @Output() downloadReport = new EventEmitter<void>();

  /**
   * Track expansion state of error panel
   */
  errorPanelExpanded = signal(false);

  /**
   * Track expansion state of warning panel
   */
  warningPanelExpanded = signal(false);

  /**
   * Check if validation passed (no errors)
   */
  get validationPassed(): boolean {
    return this.validationResult.isValid;
  }

  /**
   * Check if there are any errors
   */
  get hasErrors(): boolean {
    return this.validationResult.errors.length > 0;
  }

  /**
   * Check if there are any warnings
   */
  get hasWarnings(): boolean {
    return this.validationResult.warnings.length > 0;
  }

  /**
   * Get formatted file size string
   */
  get formattedFileSize(): string {
    if (!this.fileSize) return '';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get validation status icon
   */
  get statusIcon(): string {
    return this.validationPassed ? 'check_circle' : 'error';
  }

  /**
   * Get validation status class for styling
   */
  get statusClass(): string {
    return this.validationPassed ? 'validation-passed' : 'validation-failed';
  }

  /**
   * Get validation status label
   */
  get statusLabel(): string {
    return this.validationPassed ? 'Validation Passed' : 'Validation Failed';
  }

  /**
   * Get the summary of statistics
   */
  get summary() {
    return {
      totalRows: this.validationResult.stats.totalRows,
      validRows: this.validationResult.stats.validRows,
      errorRows: this.validationResult.stats.errorRows,
      warningRows: this.validationResult.stats.totalRows -
        this.validationResult.stats.validRows -
        this.validationResult.stats.errorRows || 0,
      errorCount: this.validationResult.errors.length,
      warningCount: this.validationResult.warnings.length,
    };
  }

  /**
   * Format JSON data for display
   */
  formatDataForDisplay(data: any): string {
    if (!data) return 'N/A';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  /**
   * Check if data should be displayed as expandable JSON
   */
  shouldShowData(data: any): boolean {
    return data !== undefined && data !== null;
  }

  /**
   * Handle download report button click
   */
  onDownloadReport(): void {
    this.downloadReport.emit();
  }

  /**
   * Get error severity badge color (always red for errors)
   */
  getErrorSeverityColor(): string {
    return 'warn';
  }

  /**
   * Get warning severity badge color
   */
  getWarningSeverityColor(): string {
    return 'accent';
  }

  /**
   * Track by index for ngFor performance
   */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Track by row and field for error items
   */
  trackByRowField(
    index: number,
    item: ValidationError | ValidationWarning
  ): string {
    return `${item.row}-${item.field}-${index}`;
  }
}
