import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// AegisX UI components
import { AxCardComponent } from '@aegisx/ui';

// Types
import { ImportHistoryItem, ImportJobStatus } from '../../types/system-init.types';

/**
 * Import History Timeline Component
 *
 * Displays a chronological timeline of import operations with filtering
 * and action capabilities. Features include:
 * - Timeline visualization with status indicators
 * - Filter controls (module, status, date range)
 * - Action buttons (view details, rollback, retry)
 * - Load more functionality
 * - Responsive design
 */
@Component({
  selector: 'app-import-history-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    AxCardComponent,
  ],
  templateUrl: './import-history-timeline.component.html',
  styleUrl: './import-history-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportHistoryTimelineComponent {
  /**
   * Input: Array of import history items to display
   */
  @Input() set history(value: ImportHistoryItem[]) {
    this.historySignal.set(value);
  }

  /**
   * Input: Maximum number of items to display before "Load More"
   */
  @Input() maxItems: number = 10;

  /**
   * Output: Emitted when user requests to view details of an import
   */
  @Output() viewDetails = new EventEmitter<ImportHistoryItem>();

  /**
   * Output: Emitted when user requests to rollback a completed import
   */
  @Output() rollback = new EventEmitter<ImportHistoryItem>();

  /**
   * Output: Emitted when user requests to retry a failed import
   */
  @Output() retry = new EventEmitter<ImportHistoryItem>();

  /**
   * Output: Emitted when user clicks "Load More"
   */
  @Output() loadMore = new EventEmitter<void>();

  // Internal signals
  private historySignal = signal<ImportHistoryItem[]>([]);

  // Filter signals
  selectedModuleFilter = signal<string>('all');
  selectedStatusFilter = signal<string>('all');
  selectedDateFilter = signal<string>('all');

  // Computed signals
  uniqueModules = computed(() => {
    const modules = new Set(this.historySignal().map(item => item.module));
    return Array.from(modules).sort();
  });

  filteredHistory = computed(() => {
    let filtered = this.historySignal();

    // Filter by module
    const moduleFilter = this.selectedModuleFilter();
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(item => item.module === moduleFilter);
    }

    // Filter by status
    const statusFilter = this.selectedStatusFilter();
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Filter by date range
    const dateFilter = this.selectedDateFilter();
    if (dateFilter !== 'all') {
      const now = new Date();
      const daysAgo = this.getDaysFromFilter(dateFilter);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.completedAt);
        return itemDate >= cutoffDate;
      });
    }

    return filtered;
  });

  visibleHistory = computed(() => {
    return this.filteredHistory().slice(0, this.maxItems);
  });

  hasMoreItems = computed(() => {
    return this.filteredHistory().length > this.maxItems;
  });

  isEmpty = computed(() => {
    return this.historySignal().length === 0;
  });

  isFiltered = computed(() => {
    return (
      this.selectedModuleFilter() !== 'all' ||
      this.selectedStatusFilter() !== 'all' ||
      this.selectedDateFilter() !== 'all'
    );
  });

  /**
   * Get the display name for an import status with appropriate icon
   */
  getStatusLabel(status: ImportJobStatus): string {
    const statusMap: Record<ImportJobStatus, string> = {
      queued: 'Queued',
      running: 'In Progress',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
    };
    return statusMap[status];
  }

  /**
   * Get the color class for status indicator
   */
  getStatusColorClass(status: ImportJobStatus): string {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'running':
      case 'queued':
        return 'status-in-progress';
      case 'failed':
      case 'cancelled':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  }

  /**
   * Get the Material icon name for a status
   */
  getStatusIcon(status: ImportJobStatus): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'running':
      case 'queued':
        return 'schedule';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  /**
   * Format date to relative time (e.g., "2 hours ago") or absolute time
   */
  formatDate(dateString: string, relative: boolean = true): string {
    const date = new Date(dateString);

    if (relative) {
      return this.getRelativeTime(date);
    } else {
      return date.toLocaleString();
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get the number of days from a filter string
   */
  private getDaysFromFilter(filter: string): number {
    switch (filter) {
      case 'today':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'all':
      default:
        return Infinity;
    }
  }

  /**
   * Determine if rollback button should be visible and enabled
   */
  canRollback(item: ImportHistoryItem): boolean {
    return item.status === 'completed';
  }

  /**
   * Determine if retry button should be visible and enabled
   */
  canRetry(item: ImportHistoryItem): boolean {
    return item.status === 'failed' || item.status === 'cancelled';
  }

  /**
   * Get error message for failed imports
   */
  getErrorMessage(item: ImportHistoryItem): string {
    if (!item.error) {
      return 'Unknown error';
    }
    return item.error;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByJobId(index: number, item: ImportHistoryItem): string {
    return item.jobId;
  }

  /**
   * Handle view details button click
   */
  onViewDetails(item: ImportHistoryItem): void {
    this.viewDetails.emit(item);
  }

  /**
   * Handle rollback button click
   */
  onRollback(item: ImportHistoryItem): void {
    this.rollback.emit(item);
  }

  /**
   * Handle retry button click
   */
  onRetry(item: ImportHistoryItem): void {
    this.retry.emit(item);
  }

  /**
   * Handle load more button click
   */
  onLoadMore(): void {
    this.loadMore.emit();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedModuleFilter.set('all');
    this.selectedStatusFilter.set('all');
    this.selectedDateFilter.set('all');
  }
}
