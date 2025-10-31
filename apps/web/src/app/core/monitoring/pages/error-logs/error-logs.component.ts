import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreadcrumbComponent, AegisxNavigationItem } from '@aegisx/ui';
import { ErrorLogsService } from '../../services/error-logs.service';
import {
  ErrorLog,
  ErrorLogsQuery,
  ErrorStats,
} from '../../models/monitoring.types';

@Component({
  selector: 'app-error-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatBadgeModule,
    MatDialogModule,
    BreadcrumbComponent,
  ],
  template: `
    <div class="error-logs-page p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Error Logs
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            View and manage application error logs
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            mat-raised-button
            color="accent"
            (click)="exportLogs()"
            [disabled]="loading()"
          >
            <mat-icon>download</mat-icon>
            Export CSV
          </button>
          <button
            mat-raised-button
            color="warn"
            (click)="openCleanupDialog()"
            [disabled]="loading()"
          >
            <mat-icon>delete_sweep</mat-icon>
            Cleanup Old Logs
          </button>
        </div>
      </div>

      <!-- Error Statistics -->
      <div *ngIf="stats()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <mat-card appearance="outlined" class="border-l-4 border-red-500">
          <mat-card-content class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-red-500">error</mat-icon>
              <h3 class="text-sm font-medium text-gray-600">Total Errors</h3>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats()?.totalErrors || 0 }}
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="border-l-4 border-orange-500">
          <mat-card-content class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-orange-500">warning</mat-icon>
              <h3 class="text-sm font-medium text-gray-600">Warnings</h3>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats()?.byLevel?.warn || 0 }}
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="border-l-4 border-blue-500">
          <mat-card-content class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-blue-500">info</mat-icon>
              <h3 class="text-sm font-medium text-gray-600">Info</h3>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats()?.byLevel?.info || 0 }}
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="border-l-4 border-purple-500">
          <mat-card-content class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-purple-500">schedule</mat-icon>
              <h3 class="text-sm font-medium text-gray-600">Recent (24h)</h3>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats()?.recentErrors || 0 }}
            </p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card appearance="outlined">
        <mat-card-content class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Search Message</mat-label>
              <input
                matInput
                placeholder="Search in error messages"
                [formControl]="searchControl"
              />
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Level</mat-label>
              <mat-select [formControl]="levelControl">
                <mat-option [value]="null">All Levels</mat-option>
                <mat-option value="error">Error</mat-option>
                <mat-option value="warn">Warning</mat-option>
                <mat-option value="info">Info</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type</mat-label>
              <mat-select [formControl]="typeControl">
                <mat-option [value]="null">All Types</mat-option>
                <mat-option value="javascript">JavaScript</mat-option>
                <mat-option value="http">HTTP</mat-option>
                <mat-option value="angular">Angular</mat-option>
                <mat-option value="custom">Custom</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex gap-2">
              <button
                mat-raised-button
                color="primary"
                (click)="applyFilters()"
                class="flex-1"
              >
                <mat-icon>filter_list</mat-icon>
                Apply
              </button>
              <button
                mat-stroked-button
                (click)="clearFilters()"
                class="flex-1"
              >
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center py-12">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-4">
        <mat-card appearance="outlined" class="border-l-4 border-red-500">
          <mat-card-content class="flex items-center gap-3">
            <mat-icon class="text-red-500">error</mat-icon>
            <div>
              <h3 class="font-semibold text-red-700">Error Loading Logs</h3>
              <p class="text-sm text-gray-600">{{ error() }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Error Logs Table -->
      <div *ngIf="!loading() && !error()">
        <mat-card appearance="outlined">
          <div class="overflow-x-auto">
            <table
              mat-table
              [dataSource]="paginatedLogs()"
              class="w-full"
              matSort
            >
              <!-- Timestamp Column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Timestamp
                </th>
                <td mat-cell *matCellDef="let log" class="text-sm">
                  {{ log.timestamp | date: 'short' }}
                </td>
              </ng-container>

              <!-- Level Column -->
              <ng-container matColumnDef="level">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Level</th>
                <td mat-cell *matCellDef="let log">
                  <mat-chip
                    [class]="
                      log.level === 'error'
                        ? 'bg-red-100 text-red-700'
                        : log.level === 'warn'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                    "
                  >
                    {{ log.level | uppercase }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let log">
                  <mat-chip class="bg-gray-100 text-gray-700">
                    {{ log.type }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Message Column -->
              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef>Message</th>
                <td mat-cell *matCellDef="let log" class="max-w-md">
                  <div class="truncate" [matTooltip]="log.message">
                    {{ log.message }}
                  </div>
                </td>
              </ng-container>

              <!-- URL Column -->
              <ng-container matColumnDef="url">
                <th mat-header-cell *matHeaderCellDef>URL</th>
                <td mat-cell *matCellDef="let log" class="text-sm">
                  <div class="truncate max-w-xs" [matTooltip]="log.url || ''">
                    {{ log.url || '-' }}
                  </div>
                </td>
              </ng-container>

              <!-- User Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let log" class="text-sm">
                  {{ log.userId || 'Anonymous' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let log">
                  <button
                    mat-icon-button
                    color="primary"
                    (click)="viewLogDetails(log)"
                    matTooltip="View Details"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteLog(log.id)"
                    matTooltip="Delete"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

              <!-- No Data Row -->
              <tr class="mat-row" *matNoDataRow>
                <td
                  class="mat-cell text-center py-8"
                  [attr.colspan]="displayedColumns.length"
                >
                  <div class="flex flex-col items-center gap-2 text-gray-500">
                    <mat-icon class="text-4xl">inbox</mat-icon>
                    <p>No error logs found</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Paginator -->
          <mat-paginator
            [length]="totalLogs()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons
          >
          </mat-paginator>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .error-logs-page {
        max-width: 1400px;
        margin: 0 auto;
      }

      table {
        width: 100%;
      }

      .mat-mdc-cell,
      .mat-mdc-header-cell {
        padding: 12px;
      }

      mat-chip {
        font-size: 0.75rem;
        min-height: 24px;
      }
    `,
  ],
})
export class ErrorLogsComponent implements OnInit {
  private errorLogsService = inject(ErrorLogsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Breadcrumb items
  breadcrumbItems: AegisxNavigationItem[] = [
    { id: 'home', title: 'Home', type: 'basic', link: '/', icon: 'home' },
    {
      id: 'error-logs',
      title: 'Error Logs',
      type: 'basic',
      link: '/monitoring/error-logs',
      icon: 'bug_report',
    },
  ];

  // Table columns
  displayedColumns: string[] = [
    'timestamp',
    'level',
    'type',
    'message',
    'url',
    'user',
    'actions',
  ];

  // Form controls for filters
  searchControl = new FormControl<string>('');
  levelControl = new FormControl<string | null>(null);
  typeControl = new FormControl<string | null>(null);

  // State signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination
  pageIndex = signal<number>(0);
  pageSize = signal<number>(25);

  // Data signals from service
  errorLogs = computed(() => this.errorLogsService.errorLogs());
  stats = computed(() => this.errorLogsService.errorStats());
  totalLogs = computed(() => this.errorLogs().length);

  // Paginated logs
  paginatedLogs = computed(() => {
    const logs = this.errorLogs();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return logs.slice(start, end);
  });

  ngOnInit(): void {
    this.loadErrorLogs();
    this.loadErrorStats();
  }

  loadErrorLogs(query?: ErrorLogsQuery): void {
    this.loading.set(true);
    this.error.set(null);

    this.errorLogsService.getErrorLogs(query).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load error logs');
        console.error('Failed to load error logs:', err);
      },
    });
  }

  loadErrorStats(): void {
    this.errorLogsService.getErrorStats().subscribe({
      error: (err) => {
        console.error('Failed to load error stats:', err);
      },
    });
  }

  applyFilters(): void {
    const query: ErrorLogsQuery = {
      search: this.searchControl.value || undefined,
      level: this.levelControl.value as any,
      type: this.typeControl.value as any,
      limit: 1000, // Load more logs for client-side pagination
    };

    // Remove null/undefined values
    Object.keys(query).forEach((key) => {
      if (
        query[key as keyof ErrorLogsQuery] === undefined ||
        query[key as keyof ErrorLogsQuery] === null
      ) {
        delete query[key as keyof ErrorLogsQuery];
      }
    });

    this.loadErrorLogs(query);
    this.pageIndex.set(0); // Reset to first page
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.levelControl.setValue(null);
    this.typeControl.setValue(null);
    this.loadErrorLogs();
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  viewLogDetails(log: ErrorLog): void {
    // TODO: Open dialog with full error details including stack trace
    this.snackBar.open(`Viewing log: ${log.id}`, 'Close', { duration: 3000 });
    console.log('Log details:', log);
  }

  deleteLog(id: string): void {
    if (!confirm('Are you sure you want to delete this error log?')) {
      return;
    }

    this.errorLogsService.deleteErrorLog(id).subscribe({
      next: () => {
        this.snackBar.open('Error log deleted successfully', 'Close', {
          duration: 3000,
        });
        this.loadErrorStats(); // Refresh stats
      },
      error: (err) => {
        this.snackBar.open(`Failed to delete log: ${err.message}`, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  exportLogs(): void {
    const query: ErrorLogsQuery = {
      search: this.searchControl.value || undefined,
      level: this.levelControl.value as any,
      type: this.typeControl.value as any,
    };

    this.errorLogsService.exportLogs(query).subscribe({
      next: () => {
        this.snackBar.open('Logs exported successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.snackBar.open(`Failed to export logs: ${err.message}`, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  openCleanupDialog(): void {
    // TODO: Open dialog to select cleanup criteria
    const confirmed = confirm(
      'Delete error logs older than 30 days?\n\nThis action cannot be undone.',
    );

    if (confirmed) {
      const olderThan = new Date();
      olderThan.setDate(olderThan.getDate() - 30);

      this.errorLogsService
        .cleanupLogs({ olderThan: olderThan.toISOString() })
        .subscribe({
          next: (result) => {
            this.snackBar.open(
              `Deleted ${result.deleted} old error logs`,
              'Close',
              { duration: 3000 },
            );
            this.loadErrorLogs();
            this.loadErrorStats();
          },
          error: (err) => {
            this.snackBar.open(
              `Failed to cleanup logs: ${err.message}`,
              'Close',
              { duration: 5000 },
            );
          },
        });
    }
  }
}
