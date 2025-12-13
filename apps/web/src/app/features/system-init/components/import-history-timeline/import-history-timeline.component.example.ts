/**
 * EXAMPLE: How to use the Import History Timeline Component
 *
 * This file demonstrates:
 * 1. Component integration in a parent component
 * 2. Loading import history from API
 * 3. Handling user actions (view, rollback, retry)
 * 4. Real-time updates
 * 5. Error handling
 */

import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { ImportHistoryTimelineComponent } from './import-history-timeline.component';
import {
  ImportHistoryItem,
  DashboardResponse,
} from '../../types/system-init.types';

/**
 * Example: System Init Dashboard using Import History Timeline
 *
 * This is a simplified example showing how to:
 * - Load import history from backend
 * - Handle user actions
 * - Display loading/error states
 * - Auto-refresh history
 */
@Component({
  selector: 'app-system-init-dashboard-example',
  standalone: true,
  imports: [CommonModule, ImportHistoryTimelineComponent],
  template: `
    <div class="dashboard">
      <h1>System Initialization Dashboard</h1>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <p>Loading import history...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-state">
        <p>Error: {{ error() }}</p>
        <button (click)="retryLoadingHistory()">Retry</button>
      </div>

      <!-- Import History Timeline -->
      <app-import-history-timeline
        *ngIf="!loading() && !error()"
        [history]="importHistory()"
        [maxItems]="historyPageSize()"
        (viewDetails)="onViewDetails($event)"
        (rollback)="onRollback($event)"
        (retry)="onRetry($event)"
        (loadMore)="onLoadMore()"
      ></app-import-history-timeline>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .loading-state,
      .error-state {
        padding: 2rem;
        text-align: center;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background-color: #f5f5f5;
      }

      .error-state {
        background-color: #ffebee;
        color: #c62828;
      }

      .error-state button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #c62828;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .error-state button:hover {
        background-color: #b71c1c;
      }
    `,
  ],
})
export class SystemInitDashboardExampleComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  // private systemInitService = inject(SystemInitService);

  // State signals
  importHistory = signal<ImportHistoryItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  historyPageSize = signal(10);

  // Computed signals
  hasError = computed(() => this.error() !== null);
  isLoading = computed(() => this.loading());

  ngOnInit() {
    // Load initial data
    this.loadImportHistory();

    // Auto-refresh every 30 seconds
    interval(30000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loadImportHistory();
      });
  }

  ngOnDestroy() {
    // Cleanup is handled by takeUntilDestroyed()
  }

  /**
   * Public method for retry button
   */
  retryLoadingHistory() {
    this.loadImportHistory();
  }

  /**
   * Load import history from API
   */
  private loadImportHistory() {
    this.loading.set(true);
    this.error.set(null);

    // Simulated API call
    // In real implementation:
    // this.systemInitService.getDashboard().subscribe({
    //   next: (dashboard) => this.handleDashboardLoaded(dashboard),
    //   error: (err) => this.handleError(err),
    // });

    // Mock data for demo
    setTimeout(() => {
      const mockHistory: ImportHistoryItem[] = [
        {
          jobId: 'job-001',
          module: 'departments',
          status: 'completed',
          recordsImported: 10,
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          importedBy: { id: 'user-1', name: 'admin@example.com' },
        },
        {
          jobId: 'job-002',
          module: 'users',
          status: 'completed',
          recordsImported: 5,
          completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          importedBy: { id: 'user-1', name: 'admin@example.com' },
        },
        {
          jobId: 'job-003',
          module: 'drug-generics',
          status: 'failed',
          recordsImported: 0,
          completedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
          importedBy: { id: 'user-1', name: 'admin@example.com' },
          error: 'Duplicate codes found in rows 5, 12, 25',
        },
        {
          jobId: 'job-004',
          module: 'locations',
          status: 'running',
          recordsImported: 45,
          completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          importedBy: { id: 'user-1', name: 'admin@example.com' },
        },
      ];

      this.importHistory.set(mockHistory);
      this.loading.set(false);
    }, 1000);
  }

  /**
   * Handle dashboard data loaded
   */
  private handleDashboardLoaded(dashboard: DashboardResponse) {
    this.importHistory.set(dashboard.recentImports);
    this.loading.set(false);
  }

  /**
   * Handle API errors
   */
  private handleError(error: any) {
    const errorMessage = error?.error?.message || 'Failed to load import history';
    this.error.set(errorMessage);
    this.loading.set(false);

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Handle "View Details" action
   */
  onViewDetails(item: ImportHistoryItem) {
    console.log('View details for import:', item);

    // Example: Open a detail dialog
    // this.dialog.open(ImportDetailDialogComponent, {
    //   data: { import: item },
    //   width: '600px',
    // });

    this.snackBar.open(`Viewing details for ${item.module} import`, 'Close', {
      duration: 3000,
    });
  }

  /**
   * Handle "Rollback" action
   */
  onRollback(item: ImportHistoryItem) {
    console.log('Rollback import:', item);

    // Confirm with user
    if (!confirm(`Are you sure you want to rollback the ${item.module} import?`)) {
      return;
    }

    this.loading.set(true);

    // Simulated rollback
    // In real implementation:
    // this.systemInitService.rollbackImport(item.module, item.jobId).subscribe({
    //   next: () => this.handleRollbackSuccess(item),
    //   error: (err) => this.handleRollbackError(err),
    // });

    setTimeout(() => {
      this.snackBar.open(
        `Successfully rolled back ${item.module} import (${item.recordsImported} records removed)`,
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      this.loadImportHistory(); // Refresh list
    }, 1000);
  }

  /**
   * Handle "Retry" action
   */
  onRetry(item: ImportHistoryItem) {
    console.log('Retry import:', item);

    this.snackBar.open(
      `Starting retry for ${item.module} import. This will open the import wizard.`,
      'Close',
      { duration: 3000 }
    );

    // Example: Open import wizard for retry
    // this.dialog.open(ImportWizardDialog, {
    //   data: { module: item.module, retryFrom: item.jobId },
    //   width: '800px',
    // }).afterClosed().subscribe(result => {
    //   if (result?.success) {
    //     this.loadImportHistory();
    //   }
    // });
  }

  /**
   * Handle "Load More" action
   */
  onLoadMore() {
    console.log('Load more history items');

    // Increase page size
    this.historyPageSize.update(size => size + 10);

    // Optional: Fetch more items from server
    // this.systemInitService.getImportHistory(this.nextPageOffset).subscribe({
    //   next: (items) => {
    //     this.importHistory.update(current => [...current, ...items]);
    //   },
    // });

    this.snackBar.open('Loading more history items...', '', {
      duration: 2000,
    });
  }
}

// ===== USAGE IN PARENT COMPONENT =====

/*
// In your main dashboard component:

import { SystemInitDashboardComponent } from './system-init-dashboard/system-init-dashboard.component';

@Component({
  selector: 'app-system-init',
  standalone: true,
  imports: [SystemInitDashboardComponent],
  template: `
    <app-system-init-dashboard></app-system-init-dashboard>
  `,
})
export class SystemInitComponent {}

// In your routing:

const SYSTEM_INIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./system-init-dashboard.component').then(
        m => m.SystemInitDashboardComponent
      ),
  }
];

// In your main app routes:

const APP_ROUTES: Routes = [
  {
    path: 'admin/system-init',
    loadChildren: () =>
      import('./features/system-init/system-init.routes').then(
        m => m.SYSTEM_INIT_ROUTES
      ),
    canActivate: [AdminGuard],
  }
];
*/

// ===== MOCK DATA GENERATOR =====

export function generateMockImportHistory(count: number = 20): ImportHistoryItem[] {
  const modules = ['departments', 'users', 'drug-generics', 'locations', 'hospitals'];
  const statuses = ['completed', 'failed', 'running', 'queued'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const module = modules[Math.floor(Math.random() * modules.length)];

    return {
      jobId: `job-${String(i + 1).padStart(4, '0')}`,
      module,
      status: status as any,
      recordsImported: status === 'completed' ? Math.floor(Math.random() * 100) + 10 : 0,
      completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      importedBy: {
        id: `user-${Math.floor(Math.random() * 5) + 1}`,
        name: `user${Math.floor(Math.random() * 5) + 1}@example.com`,
      },
      error:
        status === 'failed'
          ? 'Validation failed: Duplicate records or invalid data format'
          : undefined,
    };
  });
}
