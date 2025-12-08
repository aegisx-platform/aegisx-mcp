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
import { BudgetPlanService } from '../services/budget-plans.service';
import { BudgetPlan, ListBudgetPlanQuery } from '../types/budget-plans.types';
import { BudgetPlanCreateDialogComponent } from './budget-plans-create.dialog';
import {
  BudgetPlanEditDialogComponent,
  BudgetPlanEditDialogData,
} from './budget-plans-edit.dialog';
import {
  BudgetPlanViewDialogComponent,
  BudgetPlanViewDialogData,
} from './budget-plans-view.dialog';
import { BudgetPlanImportDialogComponent } from './budget-plans-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { BudgetPlansListFiltersComponent } from './budget-plans-list-filters.component';
import { BudgetPlansListHeaderComponent } from './budget-plans-list-header.component';

@Component({
  selector: 'app-budget-plans-list',
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
    BudgetPlansListHeaderComponent,
    BudgetPlansListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './budget-plans-list.component.html',
  styleUrl: './budget-plans-list.component.scss',
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
export class BudgetPlansListComponent {
  budgetPlansService = inject(BudgetPlanService);
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
      label: 'Budget Plans',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'fiscal_year',
    'department_id',
    'plan_name',
    'total_planned_amount',
    'status',
    'approved_at',
    'actions',
  ];
  dataSource = new MatTableDataSource<BudgetPlan>([]);
  selection = new SelectionModel<BudgetPlan>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.budgetPlansService
      .budgetPlansList()
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
  protected plan_nameInputSignal = signal('');
  protected approved_byInputSignal = signal('');
  protected fiscal_yearInputSignal = signal('');
  protected total_planned_amountInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected plan_nameFilterSignal = signal('');
  protected approved_byFilterSignal = signal('');
  protected fiscal_yearFilterSignal = signal('');
  protected total_planned_amountFilterSignal = signal('');
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
  protected expandedBudgetPlan = signal<BudgetPlan | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    plan_name: this.plan_nameInputSignal(),
    approved_by: this.approved_byInputSignal(),
    fiscal_year: this.fiscal_yearInputSignal(),
    total_planned_amount: this.total_planned_amountInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get plan_nameFilter() {
    return this.plan_nameInputSignal();
  }
  set plan_nameFilter(value: string) {
    this.plan_nameInputSignal.set(value);
  }
  get approved_byFilter() {
    return this.approved_byInputSignal();
  }
  set approved_byFilter(value: string) {
    this.approved_byInputSignal.set(value);
  }

  get fiscal_yearFilter() {
    return this.fiscal_yearInputSignal();
  }
  set fiscal_yearFilter(value: string) {
    this.fiscal_yearInputSignal.set(value);
  }
  get total_planned_amountFilter() {
    return this.total_planned_amountInputSignal();
  }
  set total_planned_amountFilter(value: string) {
    this.total_planned_amountInputSignal.set(value);
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
    const list = this.budgetPlansService.budgetPlansList();
    const total = this.budgetPlansService.totalBudgetPlan();

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
      this.budgetPlansService.exportBudgetPlan(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'fiscal_year', label: 'Fiscal Year' },
    { key: 'department_id', label: 'Department Id' },
    { key: 'plan_name', label: 'Plan Name' },
    { key: 'total_planned_amount', label: 'Total Planned Amount' },
    { key: 'status', label: 'Status' },
    { key: 'approved_at', label: 'Approved At' },
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

  // --- Effect: reload budget_plans on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.budgetPlansService.loading();

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

      const plan_name = this.plan_nameFilterSignal();
      const approved_by = this.approved_byFilterSignal();
      const fiscal_year = this.fiscal_yearFilterSignal();
      const total_planned_amount = this.total_planned_amountFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListBudgetPlanQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        plan_name: plan_name?.trim() || undefined,
        approved_by: approved_by?.trim() || undefined,
        fiscal_year: fiscal_year?.trim() || undefined,
        total_planned_amount: total_planned_amount?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.budgetPlansService.loadBudgetPlanList(params);
      this.dataSource.data = this.budgetPlansService.budgetPlansList();
      if (this.paginator) {
        this.paginator.length = this.budgetPlansService.totalBudgetPlan();
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
    this.plan_nameInputSignal.set('');
    this.plan_nameFilterSignal.set('');
    this.approved_byInputSignal.set('');
    this.approved_byFilterSignal.set('');
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.total_planned_amountInputSignal.set('');
    this.total_planned_amountFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.plan_nameFilterSignal.set(this.plan_nameInputSignal().trim());
    this.approved_byFilterSignal.set(this.approved_byInputSignal().trim());
    this.fiscal_yearFilterSignal.set(this.fiscal_yearInputSignal().trim());
    this.total_planned_amountFilterSignal.set(
      this.total_planned_amountInputSignal().trim(),
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
    this.plan_nameInputSignal.set('');
    this.plan_nameFilterSignal.set('');
    this.approved_byInputSignal.set('');
    this.approved_byFilterSignal.set('');
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.total_planned_amountInputSignal.set('');
    this.total_planned_amountFilterSignal.set('');
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
      this.plan_nameFilterSignal().trim() !== '' ||
      this.approved_byFilterSignal().trim() !== '' ||
      this.fiscal_yearFilterSignal().trim() !== '' ||
      this.total_planned_amountFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.plan_nameFilterSignal().trim()) count++;
    if (this.approved_byFilterSignal().trim()) count++;
    if (this.fiscal_yearFilterSignal().trim()) count++;
    if (this.total_planned_amountFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(BudgetPlanCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(BudgetPlanImportDialogComponent, {
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

  onViewBudgetPlan(budgetPlan: BudgetPlan) {
    const dialogRef = this.dialog.open(BudgetPlanViewDialogComponent, {
      width: '600px',
      data: { budgetPlans: budgetPlan } as BudgetPlanViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditBudgetPlan(result.data);
      }
    });
  }

  onEditBudgetPlan(budgetPlan: BudgetPlan) {
    const dialogRef = this.dialog.open(BudgetPlanEditDialogComponent, {
      width: '600px',
      data: { budgetPlans: budgetPlan } as BudgetPlanEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteBudgetPlan(budgetPlan: BudgetPlan) {
    const itemName =
      (budgetPlan as any).name || (budgetPlan as any).title || 'budgetplan';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.budgetPlansService.deleteBudgetPlan(budgetPlan.id);
          this.snackBar.open('BudgetPlan deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete budgetplan', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'budget_plans')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((budgetPlan) =>
              this.budgetPlansService.deleteBudgetPlan(budgetPlan.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} budgetplan(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some budget_plans', 'Close', {
              duration: 3000,
            });
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
      plan_name: this.plan_nameFilterSignal(),
      approved_by: this.approved_byFilterSignal(),
      fiscal_year: this.fiscal_yearFilterSignal(),
      total_planned_amount: this.total_planned_amountFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(budgetPlan: BudgetPlan): void {
    const currentExpanded = this.expandedBudgetPlan();
    if (currentExpanded?.id === budgetPlan.id) {
      // Collapse currently expanded row
      this.expandedBudgetPlan.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedBudgetPlan.set(budgetPlan);
    }
  }

  isRowExpanded(budgetPlan: BudgetPlan): boolean {
    return this.expandedBudgetPlan()?.id === budgetPlan.id;
  }
}
