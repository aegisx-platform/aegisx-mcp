import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { fromEventPattern } from 'rxjs';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

// Material imports for table
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatSort,
  MatSortModule,
  Sort,
  SortDirection,
} from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

import {
  AxCardComponent,
  AxEmptyStateComponent,
  AxErrorStateComponent,
  AxDialogService,
  BreadcrumbComponent,
  BreadcrumbItem,
} from '@aegisx/ui';
// Export functionality is available through AxTableComponent or custom implementation
// TODO: Add export button with custom export service if needed
import { BudgetReservationService } from '../services/budget-reservations.service';
import {
  BudgetReservation,
  ListBudgetReservationQuery,
} from '../types/budget-reservations.types';
import { BudgetReservationCreateDialogComponent } from './budget-reservations-create.dialog';
import {
  BudgetReservationEditDialogComponent,
  BudgetReservationEditDialogData,
} from './budget-reservations-edit.dialog';
import {
  BudgetReservationViewDialogComponent,
  BudgetReservationViewDialogData,
} from './budget-reservations-view.dialog';
import { BudgetReservationImportDialogComponent } from './budget-reservations-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { BudgetReservationsListFiltersComponent } from './budget-reservations-list-filters.component';
import { BudgetReservationsListHeaderComponent } from './budget-reservations-list-header.component';

@Component({
  selector: 'app-budget-reservations-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatMenuModule,
    MatCardModule,
    BreadcrumbComponent,
    // Child components
    BudgetReservationsListHeaderComponent,
    BudgetReservationsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './budget-reservations-list.component.html',
  styleUrl: './budget-reservations-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class BudgetReservationsListComponent {
  budgetReservationsService = inject(BudgetReservationService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private axDialog = inject(AxDialogService);
  private cdr = inject(ChangeDetectorRef);

  // Breadcrumb configuration
  breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Home',
      url: '/',
    },
    {
      label: 'Inventory',
      url: '/inventory',
    },
    {
      label: 'Budget',
      url: '/inventory/budget',
    },
    {
      label: 'Budget Reservations',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'allocation_id',
    'pr_id',
    'reserved_amount',
    'quarter',
    'reservation_date',
    'expires_date',
    'actions',
  ];
  dataSource = new MatTableDataSource<BudgetReservation>([]);
  selection = new SelectionModel<BudgetReservation>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.budgetReservationsService
      .budgetReservationsList()
      .filter((item) => this.selectedIdsSignal().has(item.id)),
  );

  // --- Signals for sort, page, search ---
  sortState = signal<{ active: string; direction: SortDirection }>({
    active: '',
    direction: '',
  });
  pageState = signal<{ index: number; size: number }>({ index: 0, size: 25 });

  // Search & Filter Signals
  protected searchTermSignal = signal(''); // Active search term (sent to API)
  protected searchInputSignal = signal(''); // Input field value (not auto-searched)

  // Advanced filter INPUT signals (not sent to API until Apply is clicked)
  protected reserved_amountInputSignal = signal('');
  protected quarterInputSignal = signal('');
  protected is_releasedInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected reserved_amountFilterSignal = signal('');
  protected quarterFilterSignal = signal('');
  protected is_releasedFilterSignal = signal<boolean | undefined>(undefined);

  // Date filter INPUT signals (not sent to API until Apply is clicked)

  // Date filter ACTIVE signals (sent to API)

  // Reload trigger - increment to force data reload even when filters unchanged
  private reloadTrigger = signal(0);

  // Holds current MatSort subscription
  private matSortSubscription?: import('rxjs').Subscription;

  /**
   * Angular Material sort event subscription
   * Ensures only one subscription at a time
   */
  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    this.unsubscribeMatSort();
    if (sort) {
      this.matSortSubscription = this.subscribeMatSort(sort);
    }
  }

  private subscribeMatSort(sort: MatSort): import('rxjs').Subscription {
    return fromEventPattern<Sort>((h) => sort.sortChange.subscribe(h))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => {
        if (this.paginator) this.paginator.pageIndex = 0;
        this.sortState.set({ active: s.active, direction: s.direction });
      });
  }

  /**
   * Unsubscribe previous MatSort subscription if exists
   */
  private unsubscribeMatSort() {
    if (this.matSortSubscription) {
      this.matSortSubscription.unsubscribe();
      this.matSortSubscription = undefined;
    }
  }

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  private destroyRef = inject(DestroyRef);

  // Search & Filter UI State
  quickFilter: 'all' | 'active' | 'unavailable' = 'all';
  showAdvancedFilters = signal(false);

  // Show loading indicator only if loading takes longer than 300ms
  showLoadingIndicator = signal(false);
  private loadingTimeout: any;

  // Expandable rows state
  protected expandedBudgetReservation = signal<BudgetReservation | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    reserved_amount: this.reserved_amountInputSignal(),
    quarter: this.quarterInputSignal(),
    is_released: this.is_releasedInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get reserved_amountFilter() {
    return this.reserved_amountInputSignal();
  }
  set reserved_amountFilter(value: string) {
    this.reserved_amountInputSignal.set(value);
  }
  get quarterFilter() {
    return this.quarterInputSignal();
  }
  set quarterFilter(value: string) {
    this.quarterInputSignal.set(value);
  }

  get is_releasedFilter() {
    return this.is_releasedInputSignal();
  }
  set is_releasedFilter(value: boolean | undefined) {
    this.is_releasedInputSignal.set(value);
  }

  // Stats computed from data
  // Note: For accurate stats, consider implementing a dedicated stats endpoint
  stats = computed(() => {
    const list = this.budgetReservationsService.budgetReservationsList();
    const total = this.budgetReservationsService.totalBudgetReservation();

    // Calculate available/unavailable from first boolean field (typically is_active)
    // This is a client-side approximation - for accurate counts, use a stats API
    const available = list.filter(
      (item: any) => item.is_active === true,
    ).length;
    const unavailable = list.filter(
      (item: any) => item.is_active === false,
    ).length;

    // Calculate items created this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentWeek = list.filter((item: any) => {
      const createdAt = item.created_at ? new Date(item.created_at) : null;
      return createdAt && createdAt >= oneWeekAgo;
    }).length;

    return {
      total,
      available,
      unavailable,
      recentWeek,
    };
  });

  // Export configuration
  exportServiceAdapter: ExportService = {
    export: (options: ExportOptions) =>
      this.budgetReservationsService.exportBudgetReservation(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'allocation_id', label: 'Allocation Id' },
    { key: 'pr_id', label: 'Pr Id' },
    { key: 'reserved_amount', label: 'Reserved Amount' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'reservation_date', label: 'Reservation Date' },
    { key: 'expires_date', label: 'Expires Date' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' },
  ];

  ngAfterViewInit() {
    this.cdr.detectChanges();
    // Subscribe paginator changes to update pageState
    if (this.paginator) {
      fromEventPattern<{ pageIndex: number; pageSize: number }>((h) =>
        this.paginator.page.subscribe(h),
      )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          this.pageState.set({ index: event.pageIndex, size: event.pageSize });
        });
    }
  }

  // --- Effect: reload budget_reservations on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.budgetReservationsService.loading();

      // Clear any existing timeout
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }

      if (loading) {
        // Show loading indicator only after 300ms delay
        this.loadingTimeout = setTimeout(() => {
          this.showLoadingIndicator.set(true);
        }, 300);
      } else {
        // Hide immediately when loading completes
        this.showLoadingIndicator.set(false);
      }
    });

    // Reload data when signals change (no auto-search on typing)
    effect(async () => {
      // Track reload trigger to force refresh even when filters unchanged
      this.reloadTrigger();

      const sort = this.sortState();
      const page = this.pageState();
      const search = this.searchTermSignal();

      const reserved_amount = this.reserved_amountFilterSignal();
      const quarter = this.quarterFilterSignal();
      const is_released = this.is_releasedFilterSignal();

      const params: Partial<ListBudgetReservationQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        reserved_amount: reserved_amount?.trim() || undefined,
        quarter: quarter?.trim() || undefined,
        is_released: is_released,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.budgetReservationsService.loadBudgetReservationList(params);
      this.dataSource.data =
        this.budgetReservationsService.budgetReservationsList();
      if (this.paginator) {
        this.paginator.length =
          this.budgetReservationsService.totalBudgetReservation();
      }
    });
  }

  // Search & Filter Methods
  search() {
    const searchValue = this.searchInputSignal().trim();
    this.searchTermSignal.set(searchValue);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  refresh() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.reserved_amountInputSignal.set('');
    this.reserved_amountFilterSignal.set('');
    this.quarterInputSignal.set('');
    this.quarterFilterSignal.set('');
    this.is_releasedInputSignal.set(undefined);
    this.is_releasedFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.reserved_amountFilterSignal.set(
      this.reserved_amountInputSignal().trim(),
    );
    this.quarterFilterSignal.set(this.quarterInputSignal().trim());
    this.is_releasedFilterSignal.set(this.is_releasedInputSignal());

    // Apply date/datetime filters

    if (this.paginator) this.paginator.pageIndex = 0;
  }

  clearSearch() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  setQuickFilter(filter: 'all' | 'active' | 'unavailable') {
    this.quickFilter = filter;
    // Apply quick filter to first boolean filter field
    if (filter === 'all') {
      this.is_releasedInputSignal.set(undefined);
      this.is_releasedFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.is_releasedInputSignal.set(true);
      this.is_releasedFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.is_releasedInputSignal.set(false);
      this.is_releasedFilterSignal.set(false);
    }
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.reserved_amountInputSignal.set('');
    this.reserved_amountFilterSignal.set('');
    this.quarterInputSignal.set('');
    this.quarterFilterSignal.set('');
    this.is_releasedInputSignal.set(undefined);
    this.is_releasedFilterSignal.set(undefined);
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.reserved_amountFilterSignal().trim() !== '' ||
      this.quarterFilterSignal().trim() !== '' ||
      this.is_releasedFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.reserved_amountFilterSignal().trim()) count++;
    if (this.quarterFilterSignal().trim()) count++;
    if (this.is_releasedFilterSignal() !== undefined) count++;
    return count;
  }

  // Selection Methods
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  // CRUD Operations
  openCreateDialog() {
    const dialogRef = this.dialog.open(BudgetReservationCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(BudgetReservationImportDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.snackBar.open('Import completed successfully', 'Close', {
          duration: 3000,
        });
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewBudgetReservation(budgetReservation: BudgetReservation) {
    const dialogRef = this.dialog.open(BudgetReservationViewDialogComponent, {
      width: '600px',
      data: {
        budgetReservations: budgetReservation,
      } as BudgetReservationViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditBudgetReservation(result.data);
      }
    });
  }

  onEditBudgetReservation(budgetReservation: BudgetReservation) {
    const dialogRef = this.dialog.open(BudgetReservationEditDialogComponent, {
      width: '600px',
      data: {
        budgetReservations: budgetReservation,
      } as BudgetReservationEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteBudgetReservation(budgetReservation: BudgetReservation) {
    const itemName =
      (budgetReservation as any).name ||
      (budgetReservation as any).title ||
      'budgetreservation';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.budgetReservationsService.deleteBudgetReservation(
            budgetReservation.id,
          );
          this.snackBar.open(
            'BudgetReservation deleted successfully',
            'Close',
            {
              duration: 3000,
            },
          );
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete budgetreservation', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'budget_reservations')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (budgetReservation) =>
                this.budgetReservationsService.deleteBudgetReservation(
                  budgetReservation.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} budgetreservation(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some budget_reservations',
              'Close',
              {
                duration: 3000,
              },
            );
          }
        }
      });
  }

  // Export Event Handlers
  onExportStarted(options: ExportOptions) {
    this.snackBar.open(
      `Preparing ${options.format.toUpperCase()} export...`,
      '',
      { duration: 2000 },
    );
  }

  onExportCompleted(result: { success: boolean; format: string }) {
    if (result.success) {
      this.snackBar.open(
        `${result.format.toUpperCase()} export completed successfully!`,
        'Close',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        },
      );
    } else {
      this.snackBar.open(
        `${result.format.toUpperCase()} export failed`,
        'Close',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        },
      );
    }
  }

  // Filter Helpers
  getExportFilters(): Record<string, unknown> {
    return {
      searchTerm: this.searchTermSignal(),
      reserved_amount: this.reserved_amountFilterSignal(),
      quarter: this.quarterFilterSignal(),
      is_released: this.is_releasedFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(budgetReservation: BudgetReservation): void {
    const currentExpanded = this.expandedBudgetReservation();
    if (currentExpanded?.id === budgetReservation.id) {
      // Collapse currently expanded row
      this.expandedBudgetReservation.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedBudgetReservation.set(budgetReservation);
    }
  }

  isRowExpanded(budgetReservation: BudgetReservation): boolean {
    return this.expandedBudgetReservation()?.id === budgetReservation.id;
  }
}
