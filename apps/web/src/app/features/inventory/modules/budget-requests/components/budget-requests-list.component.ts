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
import { Router, RouterModule } from '@angular/router';
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
import { BudgetRequestService } from '../services/budget-requests.service';
import {
  BudgetRequest,
  ListBudgetRequestQuery,
} from '../types/budget-requests.types';
import { BudgetRequestCreateDialogComponent } from './budget-requests-create.dialog';
import {
  BudgetRequestEditDialogComponent,
  BudgetRequestEditDialogData,
} from './budget-requests-edit.dialog';
import {
  BudgetRequestViewDialogComponent,
  BudgetRequestViewDialogData,
} from './budget-requests-view.dialog';

// Import child components
import { BudgetRequestsListFiltersComponent } from './budget-requests-list-filters.component';
import { BudgetRequestsListHeaderComponent } from './budget-requests-list-header.component';

@Component({
  selector: 'app-budget-requests-list',
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
    BudgetRequestsListHeaderComponent,
    BudgetRequestsListFiltersComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './budget-requests-list.component.html',
  styleUrl: './budget-requests-list.component.scss',
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
export class BudgetRequestsListComponent {
  budgetRequestsService = inject(BudgetRequestService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private axDialog = inject(AxDialogService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

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
      label: 'Budget Requests',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'request_number',
    'fiscal_year',
    'department_id',
    'status',
    'total_requested_amount',
    'justification',
    'actions',
  ];
  dataSource = new MatTableDataSource<BudgetRequest>([]);
  selection = new SelectionModel<BudgetRequest>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.budgetRequestsService
      .budgetRequestsList()
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
  protected request_numberInputSignal = signal('');
  protected justificationInputSignal = signal('');
  protected submitted_byInputSignal = signal('');
  protected dept_reviewed_byInputSignal = signal('');
  protected dept_commentsInputSignal = signal('');
  protected finance_reviewed_byInputSignal = signal('');
  protected finance_commentsInputSignal = signal('');
  protected rejection_reasonInputSignal = signal('');
  protected created_byInputSignal = signal('');
  protected fiscal_yearInputSignal = signal('');
  protected total_requested_amountInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected request_numberFilterSignal = signal('');
  protected justificationFilterSignal = signal('');
  protected submitted_byFilterSignal = signal('');
  protected dept_reviewed_byFilterSignal = signal('');
  protected dept_commentsFilterSignal = signal('');
  protected finance_reviewed_byFilterSignal = signal('');
  protected finance_commentsFilterSignal = signal('');
  protected rejection_reasonFilterSignal = signal('');
  protected created_byFilterSignal = signal('');
  protected fiscal_yearFilterSignal = signal('');
  protected total_requested_amountFilterSignal = signal('');
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
  protected expandedBudgetRequest = signal<BudgetRequest | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    request_number: this.request_numberInputSignal(),
    justification: this.justificationInputSignal(),
    submitted_by: this.submitted_byInputSignal(),
    dept_reviewed_by: this.dept_reviewed_byInputSignal(),
    dept_comments: this.dept_commentsInputSignal(),
    finance_reviewed_by: this.finance_reviewed_byInputSignal(),
    finance_comments: this.finance_commentsInputSignal(),
    rejection_reason: this.rejection_reasonInputSignal(),
    created_by: this.created_byInputSignal(),
    fiscal_year: this.fiscal_yearInputSignal(),
    total_requested_amount: this.total_requested_amountInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get request_numberFilter() {
    return this.request_numberInputSignal();
  }
  set request_numberFilter(value: string) {
    this.request_numberInputSignal.set(value);
  }
  get justificationFilter() {
    return this.justificationInputSignal();
  }
  set justificationFilter(value: string) {
    this.justificationInputSignal.set(value);
  }
  get submitted_byFilter() {
    return this.submitted_byInputSignal();
  }
  set submitted_byFilter(value: string) {
    this.submitted_byInputSignal.set(value);
  }
  get dept_reviewed_byFilter() {
    return this.dept_reviewed_byInputSignal();
  }
  set dept_reviewed_byFilter(value: string) {
    this.dept_reviewed_byInputSignal.set(value);
  }
  get dept_commentsFilter() {
    return this.dept_commentsInputSignal();
  }
  set dept_commentsFilter(value: string) {
    this.dept_commentsInputSignal.set(value);
  }
  get finance_reviewed_byFilter() {
    return this.finance_reviewed_byInputSignal();
  }
  set finance_reviewed_byFilter(value: string) {
    this.finance_reviewed_byInputSignal.set(value);
  }
  get finance_commentsFilter() {
    return this.finance_commentsInputSignal();
  }
  set finance_commentsFilter(value: string) {
    this.finance_commentsInputSignal.set(value);
  }
  get rejection_reasonFilter() {
    return this.rejection_reasonInputSignal();
  }
  set rejection_reasonFilter(value: string) {
    this.rejection_reasonInputSignal.set(value);
  }
  get created_byFilter() {
    return this.created_byInputSignal();
  }
  set created_byFilter(value: string) {
    this.created_byInputSignal.set(value);
  }

  get fiscal_yearFilter() {
    return this.fiscal_yearInputSignal();
  }
  set fiscal_yearFilter(value: string) {
    this.fiscal_yearInputSignal.set(value);
  }
  get total_requested_amountFilter() {
    return this.total_requested_amountInputSignal();
  }
  set total_requested_amountFilter(value: string) {
    this.total_requested_amountInputSignal.set(value);
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
    const list = this.budgetRequestsService.budgetRequestsList();
    const total = this.budgetRequestsService.totalBudgetRequest();

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

  // --- Effect: reload budget_requests on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.budgetRequestsService.loading();

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

      const request_number = this.request_numberFilterSignal();
      const justification = this.justificationFilterSignal();
      const submitted_by = this.submitted_byFilterSignal();
      const dept_reviewed_by = this.dept_reviewed_byFilterSignal();
      const dept_comments = this.dept_commentsFilterSignal();
      const finance_reviewed_by = this.finance_reviewed_byFilterSignal();
      const finance_comments = this.finance_commentsFilterSignal();
      const rejection_reason = this.rejection_reasonFilterSignal();
      const created_by = this.created_byFilterSignal();
      const fiscal_year = this.fiscal_yearFilterSignal();
      const total_requested_amount = this.total_requested_amountFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListBudgetRequestQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        request_number: request_number?.trim() || undefined,
        justification: justification?.trim() || undefined,
        submitted_by: submitted_by?.trim() || undefined,
        dept_reviewed_by: dept_reviewed_by?.trim() || undefined,
        dept_comments: dept_comments?.trim() || undefined,
        finance_reviewed_by: finance_reviewed_by?.trim() || undefined,
        finance_comments: finance_comments?.trim() || undefined,
        rejection_reason: rejection_reason?.trim() || undefined,
        created_by: created_by?.trim() || undefined,
        fiscal_year: fiscal_year?.trim() || undefined,
        total_requested_amount: total_requested_amount?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.budgetRequestsService.loadBudgetRequestList(params);
      this.dataSource.data = this.budgetRequestsService.budgetRequestsList();
      if (this.paginator) {
        this.paginator.length = this.budgetRequestsService.totalBudgetRequest();
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
    this.request_numberInputSignal.set('');
    this.request_numberFilterSignal.set('');
    this.justificationInputSignal.set('');
    this.justificationFilterSignal.set('');
    this.submitted_byInputSignal.set('');
    this.submitted_byFilterSignal.set('');
    this.dept_reviewed_byInputSignal.set('');
    this.dept_reviewed_byFilterSignal.set('');
    this.dept_commentsInputSignal.set('');
    this.dept_commentsFilterSignal.set('');
    this.finance_reviewed_byInputSignal.set('');
    this.finance_reviewed_byFilterSignal.set('');
    this.finance_commentsInputSignal.set('');
    this.finance_commentsFilterSignal.set('');
    this.rejection_reasonInputSignal.set('');
    this.rejection_reasonFilterSignal.set('');
    this.created_byInputSignal.set('');
    this.created_byFilterSignal.set('');
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.total_requested_amountInputSignal.set('');
    this.total_requested_amountFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.request_numberFilterSignal.set(
      this.request_numberInputSignal().trim(),
    );
    this.justificationFilterSignal.set(this.justificationInputSignal().trim());
    this.submitted_byFilterSignal.set(this.submitted_byInputSignal().trim());
    this.dept_reviewed_byFilterSignal.set(
      this.dept_reviewed_byInputSignal().trim(),
    );
    this.dept_commentsFilterSignal.set(this.dept_commentsInputSignal().trim());
    this.finance_reviewed_byFilterSignal.set(
      this.finance_reviewed_byInputSignal().trim(),
    );
    this.finance_commentsFilterSignal.set(
      this.finance_commentsInputSignal().trim(),
    );
    this.rejection_reasonFilterSignal.set(
      this.rejection_reasonInputSignal().trim(),
    );
    this.created_byFilterSignal.set(this.created_byInputSignal().trim());
    this.fiscal_yearFilterSignal.set(this.fiscal_yearInputSignal().trim());
    this.total_requested_amountFilterSignal.set(
      this.total_requested_amountInputSignal().trim(),
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
    this.request_numberInputSignal.set('');
    this.request_numberFilterSignal.set('');
    this.justificationInputSignal.set('');
    this.justificationFilterSignal.set('');
    this.submitted_byInputSignal.set('');
    this.submitted_byFilterSignal.set('');
    this.dept_reviewed_byInputSignal.set('');
    this.dept_reviewed_byFilterSignal.set('');
    this.dept_commentsInputSignal.set('');
    this.dept_commentsFilterSignal.set('');
    this.finance_reviewed_byInputSignal.set('');
    this.finance_reviewed_byFilterSignal.set('');
    this.finance_commentsInputSignal.set('');
    this.finance_commentsFilterSignal.set('');
    this.rejection_reasonInputSignal.set('');
    this.rejection_reasonFilterSignal.set('');
    this.created_byInputSignal.set('');
    this.created_byFilterSignal.set('');
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.total_requested_amountInputSignal.set('');
    this.total_requested_amountFilterSignal.set('');
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
      this.request_numberFilterSignal().trim() !== '' ||
      this.justificationFilterSignal().trim() !== '' ||
      this.submitted_byFilterSignal().trim() !== '' ||
      this.dept_reviewed_byFilterSignal().trim() !== '' ||
      this.dept_commentsFilterSignal().trim() !== '' ||
      this.finance_reviewed_byFilterSignal().trim() !== '' ||
      this.finance_commentsFilterSignal().trim() !== '' ||
      this.rejection_reasonFilterSignal().trim() !== '' ||
      this.created_byFilterSignal().trim() !== '' ||
      this.fiscal_yearFilterSignal().trim() !== '' ||
      this.total_requested_amountFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.request_numberFilterSignal().trim()) count++;
    if (this.justificationFilterSignal().trim()) count++;
    if (this.submitted_byFilterSignal().trim()) count++;
    if (this.dept_reviewed_byFilterSignal().trim()) count++;
    if (this.dept_commentsFilterSignal().trim()) count++;
    if (this.finance_reviewed_byFilterSignal().trim()) count++;
    if (this.finance_commentsFilterSignal().trim()) count++;
    if (this.rejection_reasonFilterSignal().trim()) count++;
    if (this.created_byFilterSignal().trim()) count++;
    if (this.fiscal_yearFilterSignal().trim()) count++;
    if (this.total_requested_amountFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(BudgetRequestCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewBudgetRequest(budgetRequest: BudgetRequest) {
    const dialogRef = this.dialog.open(BudgetRequestViewDialogComponent, {
      width: '600px',
      data: { budgetRequests: budgetRequest } as BudgetRequestViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditBudgetRequest(result.data);
      }
    });
  }

  onEditBudgetRequest(budgetRequest: BudgetRequest) {
    const dialogRef = this.dialog.open(BudgetRequestEditDialogComponent, {
      width: '600px',
      data: { budgetRequests: budgetRequest } as BudgetRequestEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteBudgetRequest(budgetRequest: BudgetRequest) {
    const itemName =
      (budgetRequest as any).name ||
      (budgetRequest as any).title ||
      'budgetrequest';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.budgetRequestsService.deleteBudgetRequest(
            budgetRequest.id,
          );
          this.snackBar.open('BudgetRequest deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete budgetrequest', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'budget_requests')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (budgetRequest) =>
                this.budgetRequestsService.deleteBudgetRequest(
                  budgetRequest.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} budgetrequest(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some budget_requests',
              'Close',
              {
                duration: 3000,
              },
            );
          }
        }
      });
  }

  // Filter Helpers
  getExportFilters(): Record<string, unknown> {
    return {
      searchTerm: this.searchTermSignal(),
      request_number: this.request_numberFilterSignal(),
      justification: this.justificationFilterSignal(),
      submitted_by: this.submitted_byFilterSignal(),
      dept_reviewed_by: this.dept_reviewed_byFilterSignal(),
      dept_comments: this.dept_commentsFilterSignal(),
      finance_reviewed_by: this.finance_reviewed_byFilterSignal(),
      finance_comments: this.finance_commentsFilterSignal(),
      rejection_reason: this.rejection_reasonFilterSignal(),
      created_by: this.created_byFilterSignal(),
      fiscal_year: this.fiscal_yearFilterSignal(),
      total_requested_amount: this.total_requested_amountFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(budgetRequest: BudgetRequest): void {
    const currentExpanded = this.expandedBudgetRequest();
    if (currentExpanded?.id === budgetRequest.id) {
      // Collapse currently expanded row
      this.expandedBudgetRequest.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedBudgetRequest.set(budgetRequest);
    }
  }

  isRowExpanded(budgetRequest: BudgetRequest): boolean {
    return this.expandedBudgetRequest()?.id === budgetRequest.id;
  }

  // Navigate to Budget Request Items page
  onRowClick(budgetRequest: BudgetRequest): void {
    this.router.navigate([
      '/inventory/budget/budget-requests',
      budgetRequest.id,
      'items',
    ]);
  }
}
