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
import { BudgetAllocationService } from '../services/budget-allocations.service';
import {
  BudgetAllocation,
  ListBudgetAllocationQuery,
} from '../types/budget-allocations.types';
import { BudgetAllocationCreateDialogComponent } from './budget-allocations-create.dialog';
import {
  BudgetAllocationEditDialogComponent,
  BudgetAllocationEditDialogData,
} from './budget-allocations-edit.dialog';
import {
  BudgetAllocationViewDialogComponent,
  BudgetAllocationViewDialogData,
} from './budget-allocations-view.dialog';
import { BudgetAllocationImportDialogComponent } from './budget-allocations-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { BudgetAllocationsListFiltersComponent } from './budget-allocations-list-filters.component';
import { BudgetAllocationsListHeaderComponent } from './budget-allocations-list-header.component';

@Component({
  selector: 'app-budget-allocations-list',
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
    BudgetAllocationsListHeaderComponent,
    BudgetAllocationsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './budget-allocations-list.component.html',
  styleUrl: './budget-allocations-list.component.scss',
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
export class BudgetAllocationsListComponent {
  budgetAllocationsService = inject(BudgetAllocationService);
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
      label: 'Budget Allocations',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'fiscal_year',
    'budget_id',
    'department_id',
    'total_budget',
    'q1_budget',
    'q2_budget',
    'actions',
  ];
  dataSource = new MatTableDataSource<BudgetAllocation>([]);
  selection = new SelectionModel<BudgetAllocation>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.budgetAllocationsService
      .budgetAllocationsList()
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
  protected fiscal_yearInputSignal = signal('');
  protected total_budgetInputSignal = signal('');
  protected q1_budgetInputSignal = signal('');
  protected q2_budgetInputSignal = signal('');
  protected q3_budgetInputSignal = signal('');
  protected q4_budgetInputSignal = signal('');
  protected q1_spentInputSignal = signal('');
  protected q2_spentInputSignal = signal('');
  protected q3_spentInputSignal = signal('');
  protected q4_spentInputSignal = signal('');
  protected total_spentInputSignal = signal('');
  protected remaining_budgetInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected fiscal_yearFilterSignal = signal('');
  protected total_budgetFilterSignal = signal('');
  protected q1_budgetFilterSignal = signal('');
  protected q2_budgetFilterSignal = signal('');
  protected q3_budgetFilterSignal = signal('');
  protected q4_budgetFilterSignal = signal('');
  protected q1_spentFilterSignal = signal('');
  protected q2_spentFilterSignal = signal('');
  protected q3_spentFilterSignal = signal('');
  protected q4_spentFilterSignal = signal('');
  protected total_spentFilterSignal = signal('');
  protected remaining_budgetFilterSignal = signal('');
  protected is_activeFilterSignal = signal<boolean | undefined>(undefined);

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
  protected expandedBudgetAllocation = signal<BudgetAllocation | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    fiscal_year: this.fiscal_yearInputSignal(),
    total_budget: this.total_budgetInputSignal(),
    q1_budget: this.q1_budgetInputSignal(),
    q2_budget: this.q2_budgetInputSignal(),
    q3_budget: this.q3_budgetInputSignal(),
    q4_budget: this.q4_budgetInputSignal(),
    q1_spent: this.q1_spentInputSignal(),
    q2_spent: this.q2_spentInputSignal(),
    q3_spent: this.q3_spentInputSignal(),
    q4_spent: this.q4_spentInputSignal(),
    total_spent: this.total_spentInputSignal(),
    remaining_budget: this.remaining_budgetInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get fiscal_yearFilter() {
    return this.fiscal_yearInputSignal();
  }
  set fiscal_yearFilter(value: string) {
    this.fiscal_yearInputSignal.set(value);
  }
  get total_budgetFilter() {
    return this.total_budgetInputSignal();
  }
  set total_budgetFilter(value: string) {
    this.total_budgetInputSignal.set(value);
  }
  get q1_budgetFilter() {
    return this.q1_budgetInputSignal();
  }
  set q1_budgetFilter(value: string) {
    this.q1_budgetInputSignal.set(value);
  }
  get q2_budgetFilter() {
    return this.q2_budgetInputSignal();
  }
  set q2_budgetFilter(value: string) {
    this.q2_budgetInputSignal.set(value);
  }
  get q3_budgetFilter() {
    return this.q3_budgetInputSignal();
  }
  set q3_budgetFilter(value: string) {
    this.q3_budgetInputSignal.set(value);
  }
  get q4_budgetFilter() {
    return this.q4_budgetInputSignal();
  }
  set q4_budgetFilter(value: string) {
    this.q4_budgetInputSignal.set(value);
  }
  get q1_spentFilter() {
    return this.q1_spentInputSignal();
  }
  set q1_spentFilter(value: string) {
    this.q1_spentInputSignal.set(value);
  }
  get q2_spentFilter() {
    return this.q2_spentInputSignal();
  }
  set q2_spentFilter(value: string) {
    this.q2_spentInputSignal.set(value);
  }
  get q3_spentFilter() {
    return this.q3_spentInputSignal();
  }
  set q3_spentFilter(value: string) {
    this.q3_spentInputSignal.set(value);
  }
  get q4_spentFilter() {
    return this.q4_spentInputSignal();
  }
  set q4_spentFilter(value: string) {
    this.q4_spentInputSignal.set(value);
  }
  get total_spentFilter() {
    return this.total_spentInputSignal();
  }
  set total_spentFilter(value: string) {
    this.total_spentInputSignal.set(value);
  }
  get remaining_budgetFilter() {
    return this.remaining_budgetInputSignal();
  }
  set remaining_budgetFilter(value: string) {
    this.remaining_budgetInputSignal.set(value);
  }

  get is_activeFilter() {
    return this.is_activeInputSignal();
  }
  set is_activeFilter(value: boolean | undefined) {
    this.is_activeInputSignal.set(value);
  }

  // Stats computed from data
  // Note: For accurate stats, consider implementing a dedicated stats endpoint
  stats = computed(() => {
    const list = this.budgetAllocationsService.budgetAllocationsList();
    const total = this.budgetAllocationsService.totalBudgetAllocation();

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
      this.budgetAllocationsService.exportBudgetAllocation(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'fiscal_year', label: 'Fiscal Year' },
    { key: 'budget_id', label: 'Budget Id' },
    { key: 'department_id', label: 'Department Id' },
    { key: 'total_budget', label: 'Total Budget' },
    { key: 'q1_budget', label: 'Q1 Budget' },
    { key: 'q2_budget', label: 'Q2 Budget' },
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

  // --- Effect: reload budget_allocations on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.budgetAllocationsService.loading();

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

      const fiscal_year = this.fiscal_yearFilterSignal();
      const total_budget = this.total_budgetFilterSignal();
      const q1_budget = this.q1_budgetFilterSignal();
      const q2_budget = this.q2_budgetFilterSignal();
      const q3_budget = this.q3_budgetFilterSignal();
      const q4_budget = this.q4_budgetFilterSignal();
      const q1_spent = this.q1_spentFilterSignal();
      const q2_spent = this.q2_spentFilterSignal();
      const q3_spent = this.q3_spentFilterSignal();
      const q4_spent = this.q4_spentFilterSignal();
      const total_spent = this.total_spentFilterSignal();
      const remaining_budget = this.remaining_budgetFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListBudgetAllocationQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        fiscal_year: fiscal_year?.trim() || undefined,
        total_budget: total_budget?.trim() || undefined,
        q1_budget: q1_budget?.trim() || undefined,
        q2_budget: q2_budget?.trim() || undefined,
        q3_budget: q3_budget?.trim() || undefined,
        q4_budget: q4_budget?.trim() || undefined,
        q1_spent: q1_spent?.trim() || undefined,
        q2_spent: q2_spent?.trim() || undefined,
        q3_spent: q3_spent?.trim() || undefined,
        q4_spent: q4_spent?.trim() || undefined,
        total_spent: total_spent?.trim() || undefined,
        remaining_budget: remaining_budget?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.budgetAllocationsService.loadBudgetAllocationList(params);
      this.dataSource.data =
        this.budgetAllocationsService.budgetAllocationsList();
      if (this.paginator) {
        this.paginator.length =
          this.budgetAllocationsService.totalBudgetAllocation();
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
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.total_budgetInputSignal.set('');
    this.total_budgetFilterSignal.set('');
    this.q1_budgetInputSignal.set('');
    this.q1_budgetFilterSignal.set('');
    this.q2_budgetInputSignal.set('');
    this.q2_budgetFilterSignal.set('');
    this.q3_budgetInputSignal.set('');
    this.q3_budgetFilterSignal.set('');
    this.q4_budgetInputSignal.set('');
    this.q4_budgetFilterSignal.set('');
    this.q1_spentInputSignal.set('');
    this.q1_spentFilterSignal.set('');
    this.q2_spentInputSignal.set('');
    this.q2_spentFilterSignal.set('');
    this.q3_spentInputSignal.set('');
    this.q3_spentFilterSignal.set('');
    this.q4_spentInputSignal.set('');
    this.q4_spentFilterSignal.set('');
    this.total_spentInputSignal.set('');
    this.total_spentFilterSignal.set('');
    this.remaining_budgetInputSignal.set('');
    this.remaining_budgetFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.fiscal_yearFilterSignal.set(this.fiscal_yearInputSignal().trim());
    this.total_budgetFilterSignal.set(this.total_budgetInputSignal().trim());
    this.q1_budgetFilterSignal.set(this.q1_budgetInputSignal().trim());
    this.q2_budgetFilterSignal.set(this.q2_budgetInputSignal().trim());
    this.q3_budgetFilterSignal.set(this.q3_budgetInputSignal().trim());
    this.q4_budgetFilterSignal.set(this.q4_budgetInputSignal().trim());
    this.q1_spentFilterSignal.set(this.q1_spentInputSignal().trim());
    this.q2_spentFilterSignal.set(this.q2_spentInputSignal().trim());
    this.q3_spentFilterSignal.set(this.q3_spentInputSignal().trim());
    this.q4_spentFilterSignal.set(this.q4_spentInputSignal().trim());
    this.total_spentFilterSignal.set(this.total_spentInputSignal().trim());
    this.remaining_budgetFilterSignal.set(
      this.remaining_budgetInputSignal().trim(),
    );
    this.is_activeFilterSignal.set(this.is_activeInputSignal());

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
      this.is_activeInputSignal.set(undefined);
      this.is_activeFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.is_activeInputSignal.set(true);
      this.is_activeFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.is_activeInputSignal.set(false);
      this.is_activeFilterSignal.set(false);
    }
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.total_budgetInputSignal.set('');
    this.total_budgetFilterSignal.set('');
    this.q1_budgetInputSignal.set('');
    this.q1_budgetFilterSignal.set('');
    this.q2_budgetInputSignal.set('');
    this.q2_budgetFilterSignal.set('');
    this.q3_budgetInputSignal.set('');
    this.q3_budgetFilterSignal.set('');
    this.q4_budgetInputSignal.set('');
    this.q4_budgetFilterSignal.set('');
    this.q1_spentInputSignal.set('');
    this.q1_spentFilterSignal.set('');
    this.q2_spentInputSignal.set('');
    this.q2_spentFilterSignal.set('');
    this.q3_spentInputSignal.set('');
    this.q3_spentFilterSignal.set('');
    this.q4_spentInputSignal.set('');
    this.q4_spentFilterSignal.set('');
    this.total_spentInputSignal.set('');
    this.total_spentFilterSignal.set('');
    this.remaining_budgetInputSignal.set('');
    this.remaining_budgetFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.fiscal_yearFilterSignal().trim() !== '' ||
      this.total_budgetFilterSignal().trim() !== '' ||
      this.q1_budgetFilterSignal().trim() !== '' ||
      this.q2_budgetFilterSignal().trim() !== '' ||
      this.q3_budgetFilterSignal().trim() !== '' ||
      this.q4_budgetFilterSignal().trim() !== '' ||
      this.q1_spentFilterSignal().trim() !== '' ||
      this.q2_spentFilterSignal().trim() !== '' ||
      this.q3_spentFilterSignal().trim() !== '' ||
      this.q4_spentFilterSignal().trim() !== '' ||
      this.total_spentFilterSignal().trim() !== '' ||
      this.remaining_budgetFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.fiscal_yearFilterSignal().trim()) count++;
    if (this.total_budgetFilterSignal().trim()) count++;
    if (this.q1_budgetFilterSignal().trim()) count++;
    if (this.q2_budgetFilterSignal().trim()) count++;
    if (this.q3_budgetFilterSignal().trim()) count++;
    if (this.q4_budgetFilterSignal().trim()) count++;
    if (this.q1_spentFilterSignal().trim()) count++;
    if (this.q2_spentFilterSignal().trim()) count++;
    if (this.q3_spentFilterSignal().trim()) count++;
    if (this.q4_spentFilterSignal().trim()) count++;
    if (this.total_spentFilterSignal().trim()) count++;
    if (this.remaining_budgetFilterSignal().trim()) count++;
    if (this.is_activeFilterSignal() !== undefined) count++;
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
    const dialogRef = this.dialog.open(BudgetAllocationCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(BudgetAllocationImportDialogComponent, {
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

  onViewBudgetAllocation(budgetAllocation: BudgetAllocation) {
    const dialogRef = this.dialog.open(BudgetAllocationViewDialogComponent, {
      width: '600px',
      data: {
        budgetAllocations: budgetAllocation,
      } as BudgetAllocationViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditBudgetAllocation(result.data);
      }
    });
  }

  onEditBudgetAllocation(budgetAllocation: BudgetAllocation) {
    const dialogRef = this.dialog.open(BudgetAllocationEditDialogComponent, {
      width: '600px',
      data: {
        budgetAllocations: budgetAllocation,
      } as BudgetAllocationEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteBudgetAllocation(budgetAllocation: BudgetAllocation) {
    const itemName =
      (budgetAllocation as any).name ||
      (budgetAllocation as any).title ||
      'budgetallocation';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.budgetAllocationsService.deleteBudgetAllocation(
            budgetAllocation.id,
          );
          this.snackBar.open('BudgetAllocation deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete budgetallocation', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'budget_allocations')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (budgetAllocation) =>
                this.budgetAllocationsService.deleteBudgetAllocation(
                  budgetAllocation.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} budgetallocation(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some budget_allocations',
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
      fiscal_year: this.fiscal_yearFilterSignal(),
      total_budget: this.total_budgetFilterSignal(),
      q1_budget: this.q1_budgetFilterSignal(),
      q2_budget: this.q2_budgetFilterSignal(),
      q3_budget: this.q3_budgetFilterSignal(),
      q4_budget: this.q4_budgetFilterSignal(),
      q1_spent: this.q1_spentFilterSignal(),
      q2_spent: this.q2_spentFilterSignal(),
      q3_spent: this.q3_spentFilterSignal(),
      q4_spent: this.q4_spentFilterSignal(),
      total_spent: this.total_spentFilterSignal(),
      remaining_budget: this.remaining_budgetFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(budgetAllocation: BudgetAllocation): void {
    const currentExpanded = this.expandedBudgetAllocation();
    if (currentExpanded?.id === budgetAllocation.id) {
      // Collapse currently expanded row
      this.expandedBudgetAllocation.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedBudgetAllocation.set(budgetAllocation);
    }
  }

  isRowExpanded(budgetAllocation: BudgetAllocation): boolean {
    return this.expandedBudgetAllocation()?.id === budgetAllocation.id;
  }
}
