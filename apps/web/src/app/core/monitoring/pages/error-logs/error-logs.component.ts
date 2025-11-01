import { AegisxNavigationItem, BreadcrumbComponent } from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorLogDetailDialogComponent } from '../../components/error-log-detail-dialog/error-log-detail-dialog.component';
import { CleanupDialogComponent } from '../../components/cleanup-dialog/cleanup-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ErrorLog, ErrorLogsQuery } from '../../models/monitoring.types';
import { ErrorLogsService } from '../../services/error-logs.service';

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
          <h1
            class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Error Logs
          </h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">
            View and manage application error logs
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            mat-stroked-button
            (click)="exportLogs()"
            [disabled]="loading()"
            class="border-slate-300 text-slate-700 hover:bg-slate-200"
          >
            <mat-icon>download</mat-icon>
            Export CSV
          </button>
          <button
            mat-stroked-button
            (click)="openCleanupDialog()"
            [disabled]="loading()"
            class="border-slate-300 text-slate-700 hover:bg-slate-200"
          >
            <mat-icon>delete_sweep</mat-icon>
            Cleanup Old Logs
          </button>
        </div>
      </div>

      <!-- Error Statistics -->
      <div *ngIf="stats()" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Total Errors Card -->
        <mat-card
          appearance="outlined"
          class="border border-slate-200 bg-white rounded-xl"
        >
          <mat-card-content class="p-4">
            <div class="flex items-center gap-1.5 !mb-2">
              <span
                class="size-2.5 shrink-0 rounded-sm bg-red-500 dark:bg-red-500"
                aria-hidden="true"
              ></span>
              <h3 class="text-md font-medium text-slate-600 !mb-0">
                Total Errors
              </h3>
            </div>
            <p
              class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1"
            >
              {{ stats()?.totalErrors || 0 }}
            </p>
            <p class="text-xs text-slate-500">
              Critical issues requiring attention
            </p>
          </mat-card-content>
        </mat-card>

        <!-- Warnings Card -->
        <mat-card
          appearance="outlined"
          class="border border-slate-200 bg-white rounded-xl"
        >
          <mat-card-content class="p-4">
            <div class="flex items-center gap-1.5 !mb-2">
              <span
                class="size-2.5 shrink-0 rounded-sm bg-orange-500 dark:bg-orange-500"
                aria-hidden="true"
              ></span>
              <h3 class="text-md font-medium text-slate-600 !mb-0">Warnings</h3>
            </div>
            <p
              class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1"
            >
              {{ stats()?.byLevel?.warn || 0 }}
            </p>
            <p class="text-xs text-slate-500">Potential issues to review</p>
          </mat-card-content>
        </mat-card>

        <!-- Info Card -->
        <mat-card
          appearance="outlined"
          class="border border-slate-200 bg-white rounded-xl"
        >
          <mat-card-content class="p-4">
            <div class="flex items-center gap-1.5 !mb-2">
              <span
                class="size-2.5 shrink-0 rounded-sm bg-blue-500 dark:bg-blue-500"
                aria-hidden="true"
              ></span>
              <h3 class="text-md font-medium text-slate-600 !mb-0">Info</h3>
            </div>
            <p
              class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1"
            >
              {{ stats()?.byLevel?.info || 0 }}
            </p>
            <p class="text-xs text-slate-500">Informational messages</p>
          </mat-card-content>
        </mat-card>

        <!-- Recent (24h) Card -->
        <mat-card
          appearance="outlined"
          class="border border-slate-200 bg-white rounded-xl"
        >
          <mat-card-content class="p-4">
            <div class="flex items-center gap-1.5 !mb-2">
              <span
                class="size-2.5 shrink-0 rounded-sm bg-green-500"
                aria-hidden="true"
              ></span>
              <h3 class="text-md font-medium text-slate-600 !mb-0">
                Recent (24h)
              </h3>
            </div>
            <p
              class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1"
            >
              {{ stats()?.recentErrors || 0 }}
            </p>
            <p class="text-xs text-slate-500">Errors in the last 24 hours</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card
        appearance="outlined"
        class="border border-slate-200 bg-white rounded-xl !mb-0"
      >
        <mat-card-content class="p-6">
          <!-- Filter Header -->
          <div class="flex items-center gap-2 mb-4">
            <mat-icon class="text-blue-600">filter_alt</mat-icon>
            <h3 class="text-base font-semibold text-slate-900 !mb-0">
              Filter Error Logs
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="w-full"
            >
              <mat-label>Search Message</mat-label>
              <input
                matInput
                placeholder="Search in error messages"
                [formControl]="searchControl"
              />
              <mat-icon matPrefix>search</mat-icon>
              <mat-hint>Search by error message text</mat-hint>
            </mat-form-field>

            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="w-full"
            >
              <mat-label>Level</mat-label>
              <mat-select [formControl]="levelControl">
                <mat-option [value]="null">All Levels</mat-option>
                <mat-option value="error">Error</mat-option>
                <mat-option value="warn">Warning</mat-option>
                <mat-option value="info">Info</mat-option>
              </mat-select>
              <mat-hint>Filter by error severity</mat-hint>
            </mat-form-field>

            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="w-full"
            >
              <mat-label>Type</mat-label>
              <mat-select [formControl]="typeControl">
                <mat-option [value]="null">All Types</mat-option>
                <mat-option value="javascript">JavaScript</mat-option>
                <mat-option value="http">HTTP</mat-option>
                <mat-option value="angular">Angular</mat-option>
                <mat-option value="custom">Custom</mat-option>
                <mat-option value="backend">Backend</mat-option>
                <mat-option value="system">System</mat-option>
              </mat-select>
              <mat-hint>Filter by error source type</mat-hint>
            </mat-form-field>

            <div class="flex gap-2 items-start pt-1">
              <button
                mat-flat-button
                (click)="applyFilters()"
                class="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
              >
                <mat-icon>filter_list</mat-icon>
                Apply
              </button>
              <button
                mat-stroked-button
                (click)="clearFilters()"
                class="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </div>

          <!-- Active Filters Preview -->
          <div
            *ngIf="hasActiveFilters()"
            class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div class="flex items-start gap-2">
              <mat-icon class="text-blue-600 text-lg mt-0.5">info</mat-icon>
              <div class="flex-1">
                <div class="text-sm font-medium text-blue-800 mb-1">
                  Active Filters:
                </div>
                <div class="flex flex-wrap gap-2">
                  <mat-chip
                    *ngIf="searchControl.value"
                    class="!bg-blue-100 !text-blue-800"
                  >
                    <mat-icon class="!text-base">search</mat-icon>
                    "{{ searchControl.value }}"
                  </mat-chip>
                  <mat-chip
                    *ngIf="levelControl.value"
                    class="!bg-blue-100 !text-blue-800"
                  >
                    <mat-icon class="!text-base">priority_high</mat-icon>
                    Level: {{ levelControl.value | uppercase }}
                  </mat-chip>
                  <mat-chip
                    *ngIf="typeControl.value"
                    class="!bg-blue-100 !text-blue-800"
                  >
                    <mat-icon class="!text-base">category</mat-icon>
                    Type: {{ typeControl.value }}
                  </mat-chip>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center py-12">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Error State -->
      <div *ngIf="error()">
        <mat-card
          appearance="outlined"
          class="border border-rose-200 bg-rose-50/50 rounded-xl"
        >
          <mat-card-content class="flex items-center gap-3 p-6">
            <div class="bg-rose-100 rounded-lg p-3">
              <mat-icon class="text-rose-600">error</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold text-rose-700">Error Loading Logs</h3>
              <p class="text-sm text-slate-600">{{ error() }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Error Logs Table -->
      <div *ngIf="!loading() && !error()">
        <mat-card
          appearance="outlined"
          class="border border-slate-200 rounded-xl"
        >
          <div class="overflow-x-auto">
            <table
              mat-table
              [dataSource]="paginatedLogs()"
              class="w-full"
              matSort
            >
              <!-- Timestamp Column -->
              <ng-container matColumnDef="timestamp">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  mat-sort-header
                  class="min-w-[180px]"
                >
                  Timestamp
                </th>
                <td
                  mat-cell
                  *matCellDef="let log"
                  class="text-sm min-w-[180px]"
                >
                  {{ log.timestamp | date: 'dd/MM/yyyy HH:mm:ss' }}
                </td>
              </ng-container>

              <!-- Level Column -->
              <ng-container matColumnDef="level">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Level</th>
                <td mat-cell *matCellDef="let log">
                  <span
                    [class]="
                      'inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset gap-2 ' +
                      (log.level === 'error'
                        ? 'bg-rose-50 text-rose-900 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-500 dark:ring-rose-400/20'
                        : log.level === 'warn'
                          ? 'bg-amber-50 text-amber-900 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-500 dark:ring-amber-400/20'
                          : 'bg-blue-50 text-blue-900 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-500 dark:ring-blue-400/20')
                    "
                  >
                    <span
                      [class]="
                        'size-2 rounded-sm ' +
                        (log.level === 'error'
                          ? 'bg-rose-500 dark:bg-rose-500'
                          : log.level === 'warn'
                            ? 'bg-amber-500 dark:bg-amber-500'
                            : 'bg-blue-500 dark:bg-blue-500')
                      "
                      aria-hidden="true"
                    ></span>
                    {{ log.level | uppercase }}
                  </span>
                </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let log">
                  <mat-chip class="bg-slate-50 text-slate-700">
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
                  <div class="flex flex-col items-center gap-2 text-slate-500">
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

      /* Tremor-style Table Styling */
      table {
        width: 100%;
      }

      .mat-mdc-header-cell {
        padding: 14px 16px;
        font-size: 0.75rem;
        font-weight: 600;
        color: rgb(71, 85, 105); /* text-slate-600 */
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background-color: rgb(248, 250, 252); /* bg-slate-50 */
        border-bottom: 1px solid rgb(226, 232, 240); /* border-slate-200 */
      }

      .mat-mdc-cell {
        padding: 14px 16px;
        font-size: 0.875rem;
        color: rgb(51, 65, 85); /* text-slate-700 */
        border-bottom: 1px solid rgb(241, 245, 249); /* border-slate-100 */
      }

      .mat-mdc-row:hover {
        background-color: rgb(248, 250, 252); /* bg-slate-50 */
      }

      /* Chip Styling */
      mat-chip {
        font-size: 0.75rem;
        min-height: 24px;
        font-weight: 500;
        border-radius: 6px;
      }

      /* Table Container */
      .overflow-x-auto {
        border-radius: 8px 8px 0 0;
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

  hasActiveFilters(): boolean {
    return !!(
      this.searchControl.value ||
      this.levelControl.value ||
      this.typeControl.value
    );
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  viewLogDetails(log: ErrorLog): void {
    const dialogRef = this.dialog.open(ErrorLogDetailDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: log,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(
          '✓ Details copied to clipboard successfully',
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          },
        );
      }
    });
  }

  deleteLog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Error Log',
        message:
          'Are you sure you want to delete this error log? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.errorLogsService.deleteErrorLog(id).subscribe({
        next: () => {
          this.snackBar.open('✓ Error log deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
          this.loadErrorLogs(); // Refresh list
          this.loadErrorStats(); // Refresh stats
        },
        error: (err) => {
          this.snackBar.open(
            `✗ Failed to delete log: ${err.message}`,
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            },
          );
        },
      });
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
    const dialogRef = this.dialog.open(CleanupDialogComponent, {
      width: '500px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((days: number | undefined) => {
      if (!days) {
        return;
      }

      this.errorLogsService.cleanupLogs({ olderThan: days }).subscribe({
        next: (result) => {
          this.snackBar.open(
            `✓ Deleted ${result.deletedCount} old error logs`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            },
          );
          this.loadErrorLogs();
          this.loadErrorStats();
        },
        error: (err) => {
          this.snackBar.open(
            `✗ Failed to cleanup logs: ${err.message}`,
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            },
          );
        },
      });
    });
  }
}
