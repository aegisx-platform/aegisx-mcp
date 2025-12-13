import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  computed,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, interval } from 'rxjs';
import { finalize, exhaustMap } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';

import { SystemInitService, ImportProgressService } from '../../services';
import type {
  ImportModule,
  DashboardResponse,
  ImportModuleStatus,
  ImportHistoryItem,
} from '../../types/system-init.types';
import { ModuleCardComponent } from '../../components/module-card/module-card.component';
import { ImportHistoryTimelineComponent } from '../../components/import-history-timeline/import-history-timeline.component';
import { ImportWizardDialog } from '../../components/import-wizard/import-wizard.dialog';

/**
 * System Initialization Dashboard Page
 *
 * Main page for managing system initialization and data imports.
 * Features include:
 * - Overview cards with statistics
 * - Filterable module grid
 * - Import history timeline
 * - Auto-refresh every 30 seconds
 *
 * Uses Angular Signals for state management and reactive computations.
 */
@Component({
  selector: 'app-system-init-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    ModuleCardComponent,
    ImportHistoryTimelineComponent,
  ],
  templateUrl: './system-init-dashboard.page.html',
  styleUrl: './system-init-dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemInitDashboardPage implements OnInit {
  // Dependencies
  private systemInitService = inject(SystemInitService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  // Data signals
  modules = signal<ImportModule[]>([]);
  dashboard = signal<DashboardResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filter signals
  selectedDomain = signal<string>('all');
  selectedStatus = signal<ImportModuleStatus | 'all'>('all');
  searchTerm = signal<string>('');

  // Computed signals for filtering
  availableDomains = computed(() => {
    const domains = new Set(this.modules().map((m) => m.domain));
    return Array.from(domains).sort();
  });

  availableStatuses = computed(() => {
    const statuses: (ImportModuleStatus | 'all')[] = [
      'all',
      'not_started',
      'in_progress',
      'completed',
      'failed',
    ];
    return statuses;
  });

  filteredModules = computed(() => {
    let result = this.modules();

    // Filter by domain
    if (this.selectedDomain() !== 'all') {
      result = result.filter((m) => m.domain === this.selectedDomain());
    }

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      result = result.filter((m) => m.importStatus === this.selectedStatus());
    }

    // Filter by search term
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(
        (m) =>
          m.displayName.toLowerCase().includes(term) ||
          m.module.toLowerCase().includes(term) ||
          (m.displayNameThai && m.displayNameThai.includes(term)),
      );
    }

    return result;
  });

  // Computed statistics
  totalModules = computed(() => this.dashboard()?.overview.totalModules ?? 0);
  completedModules = computed(
    () => this.dashboard()?.overview.completedModules ?? 0,
  );
  inProgressModules = computed(
    () => this.dashboard()?.overview.inProgressModules ?? 0,
  );
  pendingModules = computed(
    () => this.dashboard()?.overview.pendingModules ?? 0,
  );
  totalRecordsImported = computed(
    () => this.dashboard()?.overview.totalRecordsImported ?? 0,
  );

  completionPercentage = computed(() => {
    const total = this.totalModules();
    if (total === 0) return 0;
    return Math.round((this.completedModules() / total) * 100);
  });

  recentImports = computed(() => this.dashboard()?.recentImports ?? []);

  // Empty state computed signal
  hasModules = computed(() => this.modules().length > 0);
  hasFilteredModules = computed(() => this.filteredModules().length > 0);

  ngOnInit() {
    this.loadDashboard();
    this.startAutoRefresh();
  }

  /**
   * Load dashboard data and available modules
   */
  private loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      modules: this.systemInitService.getAvailableModules(),
      dashboard: this.systemInitService.getDashboard(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ modules, dashboard }) => {
          this.modules.set(modules.modules);
          this.dashboard.set(dashboard);
          this.error.set(null);
        },
        error: (err) => {
          const errorMessage =
            err.error?.message ||
            err.message ||
            'Failed to load system initialization dashboard';
          this.error.set(errorMessage);
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        },
      });
  }

  /**
   * Start auto-refresh of dashboard data every 30 seconds
   * Uses exhaustMap to ignore new emissions while previous request is pending
   */
  private startAutoRefresh() {
    interval(30000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        exhaustMap(() =>
          forkJoin({
            modules: this.systemInitService.getAvailableModules(),
            dashboard: this.systemInitService.getDashboard(),
          }),
        ),
      )
      .subscribe({
        next: ({ modules, dashboard }) => {
          this.modules.set(modules.modules);
          this.dashboard.set(dashboard);
          this.error.set(null);
        },
        error: (err) => {
          console.error('Auto-refresh failed:', err);
          // Don't show error snackbar for auto-refresh to avoid spamming
        },
      });
  }

  /**
   * Refresh dashboard data manually
   */
  refreshDashboard() {
    this.loadDashboard();
  }

  /**
   * Handle domain filter change
   */
  onDomainFilterChange(domain: string) {
    this.selectedDomain.set(domain);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: ImportModuleStatus | 'all') {
    this.selectedStatus.set(status);
  }

  /**
   * Handle search term change with debounce
   */
  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.selectedDomain.set('all');
    this.selectedStatus.set('all');
    this.searchTerm.set('');
  }

  /**
   * Open import wizard dialog for a module
   */
  openImportWizard(module: ImportModule) {
    const dialogRef = this.dialog.open(ImportWizardDialog, {
      width: '800px',
      maxHeight: '90vh',
      data: { module },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadDashboard();
        this.snackBar.open('Import completed successfully', 'Close', {
          duration: 5000,
        });
      }
    });
  }

  /**
   * Handle module card import button click
   */
  onModuleImport(module: ImportModule) {
    this.openImportWizard(module);
  }

  /**
   * Handle module card view details button click
   */
  onModuleViewDetails(module: ImportModule) {
    this.snackBar.open(
      `View details for ${module.displayName} coming soon`,
      'Close',
      { duration: 3000 },
    );
  }

  /**
   * Handle module card rollback button click
   */
  onModuleRollback(module: ImportModule) {
    if (!module.lastImport) {
      this.snackBar.open('No import job found to rollback', 'Close', {
        duration: 3000,
      });
      return;
    }

    const confirmRollback = window.confirm(
      `Are you sure you want to rollback the import for ${module.displayName}? This will delete ${module.recordCount} records and cannot be undone.`,
    );

    if (confirmRollback) {
      this.systemInitService
        .rollbackImport(module.module, module.lastImport.jobId)
        .subscribe({
          next: () => {
            this.snackBar.open(
              `Rollback for ${module.displayName} completed successfully`,
              'Close',
              { duration: 5000 },
            );
            this.loadDashboard();
          },
          error: (err) => {
            this.snackBar.open(
              err.error?.message || 'Rollback failed',
              'Close',
              { duration: 5000 },
            );
          },
        });
    }
  }

  /**
   * Handle import history view details
   */
  onHistoryViewDetails(item: ImportHistoryItem) {
    const details = `Job: ${item.jobId}\nModule: ${item.module}\nStatus: ${item.status}\nRecords: ${item.recordsImported}\nBy: ${item.importedBy.name}`;
    this.snackBar.open(details, 'Close', { duration: 10000 });
  }

  /**
   * Handle import history rollback
   */
  onHistoryRollback(item: ImportHistoryItem) {
    if (item.status !== 'completed') {
      this.snackBar.open('Can only rollback completed imports', 'Close', {
        duration: 3000,
      });
      return;
    }

    const confirmRollback = window.confirm(
      `Are you sure you want to rollback this import? This action cannot be undone.`,
    );

    if (confirmRollback) {
      this.systemInitService.rollbackImport(item.module, item.jobId).subscribe({
        next: () => {
          this.snackBar.open('Rollback completed successfully', 'Close', {
            duration: 5000,
          });
          this.loadDashboard();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Rollback failed', 'Close', {
            duration: 5000,
          });
        },
      });
    }
  }

  /**
   * Handle import history retry
   */
  onHistoryRetry(item: ImportHistoryItem) {
    const module = this.modules().find((m) => m.module === item.module);
    if (module) {
      this.openImportWizard(module);
    } else {
      this.snackBar.open('Module not found', 'Close', { duration: 3000 });
    }
  }

  /**
   * Handle import history load more
   */
  onHistoryLoadMore() {
    this.snackBar.open('Showing all available history', 'Close', {
      duration: 3000,
    });
  }

  /**
   * Get status count for statistics
   */
  getStatusCount(status: ImportModuleStatus): number {
    return this.modules().filter((m) => m.importStatus === status).length;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByModule(index: number, module: ImportModule): string {
    return module.module;
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: ImportModuleStatus | 'all'): string {
    const statusMap: Record<string, string> = {
      all: 'All Statuses',
      not_started: 'Not Started',
      in_progress: 'In Progress',
      completed: 'Completed',
      failed: 'Failed',
    };
    return statusMap[status] || status;
  }
}
