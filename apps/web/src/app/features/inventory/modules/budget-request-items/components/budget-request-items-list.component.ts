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
import { BudgetRequestItemService } from '../services/budget-request-items.service';
import {
  BudgetRequestItem,
  ListBudgetRequestItemQuery,
} from '../types/budget-request-items.types';
import { BudgetRequestItemCreateDialogComponent } from './budget-request-items-create.dialog';
import {
  BudgetRequestItemEditDialogComponent,
  BudgetRequestItemEditDialogData,
} from './budget-request-items-edit.dialog';
import {
  BudgetRequestItemViewDialogComponent,
  BudgetRequestItemViewDialogData,
} from './budget-request-items-view.dialog';

// Import child components
import { BudgetRequestItemsListFiltersComponent } from './budget-request-items-list-filters.component';
import { BudgetRequestItemsListHeaderComponent } from './budget-request-items-list-header.component';

@Component({
  selector: 'app-budget-request-items-list',
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
    BudgetRequestItemsListHeaderComponent,
    BudgetRequestItemsListFiltersComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './budget-request-items-list.component.html',
  styleUrl: './budget-request-items-list.component.scss',
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
export class BudgetRequestItemsListComponent {
  budgetRequestItemsService = inject(BudgetRequestItemService);
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
      label: 'Budget Request Items',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'budget_request_id',
    'budget_id',
    'requested_amount',
    'q1_qty',
    'q2_qty',
    'q3_qty',
    'actions',
  ];
  dataSource = new MatTableDataSource<BudgetRequestItem>([]);
  selection = new SelectionModel<BudgetRequestItem>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.budgetRequestItemsService
      .budgetRequestItemsList()
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
  protected item_justificationInputSignal = signal('');
  protected generic_codeInputSignal = signal('');
  protected generic_nameInputSignal = signal('');
  protected package_sizeInputSignal = signal('');
  protected unitInputSignal = signal('');
  protected requested_amountInputSignal = signal('');
  protected q1_qtyInputSignal = signal('');
  protected q2_qtyInputSignal = signal('');
  protected q3_qtyInputSignal = signal('');
  protected q4_qtyInputSignal = signal('');
  protected line_numberInputSignal = signal('');
  protected avg_usageInputSignal = signal('');
  protected estimated_usage_2569InputSignal = signal('');
  protected current_stockInputSignal = signal('');
  protected estimated_purchaseInputSignal = signal('');
  protected unit_priceInputSignal = signal('');
  protected requested_qtyInputSignal = signal('');

  // Advanced filter ACTIVE signals (sent to API)
  protected item_justificationFilterSignal = signal('');
  protected generic_codeFilterSignal = signal('');
  protected generic_nameFilterSignal = signal('');
  protected package_sizeFilterSignal = signal('');
  protected unitFilterSignal = signal('');
  protected requested_amountFilterSignal = signal('');
  protected q1_qtyFilterSignal = signal('');
  protected q2_qtyFilterSignal = signal('');
  protected q3_qtyFilterSignal = signal('');
  protected q4_qtyFilterSignal = signal('');
  protected line_numberFilterSignal = signal('');
  protected avg_usageFilterSignal = signal('');
  protected estimated_usage_2569FilterSignal = signal('');
  protected current_stockFilterSignal = signal('');
  protected estimated_purchaseFilterSignal = signal('');
  protected unit_priceFilterSignal = signal('');
  protected requested_qtyFilterSignal = signal('');

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
  protected expandedBudgetRequestItem = signal<BudgetRequestItem | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    item_justification: this.item_justificationInputSignal(),
    generic_code: this.generic_codeInputSignal(),
    generic_name: this.generic_nameInputSignal(),
    package_size: this.package_sizeInputSignal(),
    unit: this.unitInputSignal(),
    requested_amount: this.requested_amountInputSignal(),
    q1_qty: this.q1_qtyInputSignal(),
    q2_qty: this.q2_qtyInputSignal(),
    q3_qty: this.q3_qtyInputSignal(),
    q4_qty: this.q4_qtyInputSignal(),
    line_number: this.line_numberInputSignal(),
    avg_usage: this.avg_usageInputSignal(),
    estimated_usage_2569: this.estimated_usage_2569InputSignal(),
    current_stock: this.current_stockInputSignal(),
    estimated_purchase: this.estimated_purchaseInputSignal(),
    unit_price: this.unit_priceInputSignal(),
    requested_qty: this.requested_qtyInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get item_justificationFilter() {
    return this.item_justificationInputSignal();
  }
  set item_justificationFilter(value: string) {
    this.item_justificationInputSignal.set(value);
  }
  get generic_codeFilter() {
    return this.generic_codeInputSignal();
  }
  set generic_codeFilter(value: string) {
    this.generic_codeInputSignal.set(value);
  }
  get generic_nameFilter() {
    return this.generic_nameInputSignal();
  }
  set generic_nameFilter(value: string) {
    this.generic_nameInputSignal.set(value);
  }
  get package_sizeFilter() {
    return this.package_sizeInputSignal();
  }
  set package_sizeFilter(value: string) {
    this.package_sizeInputSignal.set(value);
  }
  get unitFilter() {
    return this.unitInputSignal();
  }
  set unitFilter(value: string) {
    this.unitInputSignal.set(value);
  }

  get requested_amountFilter() {
    return this.requested_amountInputSignal();
  }
  set requested_amountFilter(value: string) {
    this.requested_amountInputSignal.set(value);
  }
  get q1_qtyFilter() {
    return this.q1_qtyInputSignal();
  }
  set q1_qtyFilter(value: string) {
    this.q1_qtyInputSignal.set(value);
  }
  get q2_qtyFilter() {
    return this.q2_qtyInputSignal();
  }
  set q2_qtyFilter(value: string) {
    this.q2_qtyInputSignal.set(value);
  }
  get q3_qtyFilter() {
    return this.q3_qtyInputSignal();
  }
  set q3_qtyFilter(value: string) {
    this.q3_qtyInputSignal.set(value);
  }
  get q4_qtyFilter() {
    return this.q4_qtyInputSignal();
  }
  set q4_qtyFilter(value: string) {
    this.q4_qtyInputSignal.set(value);
  }
  get line_numberFilter() {
    return this.line_numberInputSignal();
  }
  set line_numberFilter(value: string) {
    this.line_numberInputSignal.set(value);
  }
  get avg_usageFilter() {
    return this.avg_usageInputSignal();
  }
  set avg_usageFilter(value: string) {
    this.avg_usageInputSignal.set(value);
  }
  get estimated_usage_2569Filter() {
    return this.estimated_usage_2569InputSignal();
  }
  set estimated_usage_2569Filter(value: string) {
    this.estimated_usage_2569InputSignal.set(value);
  }
  get current_stockFilter() {
    return this.current_stockInputSignal();
  }
  set current_stockFilter(value: string) {
    this.current_stockInputSignal.set(value);
  }
  get estimated_purchaseFilter() {
    return this.estimated_purchaseInputSignal();
  }
  set estimated_purchaseFilter(value: string) {
    this.estimated_purchaseInputSignal.set(value);
  }
  get unit_priceFilter() {
    return this.unit_priceInputSignal();
  }
  set unit_priceFilter(value: string) {
    this.unit_priceInputSignal.set(value);
  }
  get requested_qtyFilter() {
    return this.requested_qtyInputSignal();
  }
  set requested_qtyFilter(value: string) {
    this.requested_qtyInputSignal.set(value);
  }

  // Stats computed from data
  // Note: For accurate stats, consider implementing a dedicated stats endpoint
  stats = computed(() => {
    const list = this.budgetRequestItemsService.budgetRequestItemsList();
    const total = this.budgetRequestItemsService.totalBudgetRequestItem();

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

  // --- Effect: reload budget_request_items on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.budgetRequestItemsService.loading();

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

      const item_justification = this.item_justificationFilterSignal();
      const generic_code = this.generic_codeFilterSignal();
      const generic_name = this.generic_nameFilterSignal();
      const package_size = this.package_sizeFilterSignal();
      const unit = this.unitFilterSignal();
      const requested_amount = this.requested_amountFilterSignal();
      const q1_qty = this.q1_qtyFilterSignal();
      const q2_qty = this.q2_qtyFilterSignal();
      const q3_qty = this.q3_qtyFilterSignal();
      const q4_qty = this.q4_qtyFilterSignal();
      const line_number = this.line_numberFilterSignal();
      const avg_usage = this.avg_usageFilterSignal();
      const estimated_usage_2569 = this.estimated_usage_2569FilterSignal();
      const current_stock = this.current_stockFilterSignal();
      const estimated_purchase = this.estimated_purchaseFilterSignal();
      const unit_price = this.unit_priceFilterSignal();
      const requested_qty = this.requested_qtyFilterSignal();

      const params: Partial<ListBudgetRequestItemQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        item_justification: item_justification?.trim() || undefined,
        generic_code: generic_code?.trim() || undefined,
        generic_name: generic_name?.trim() || undefined,
        package_size: package_size?.trim() || undefined,
        unit: unit?.trim() || undefined,
        requested_amount: requested_amount?.trim() || undefined,
        q1_qty: q1_qty?.trim() || undefined,
        q2_qty: q2_qty?.trim() || undefined,
        q3_qty: q3_qty?.trim() || undefined,
        q4_qty: q4_qty?.trim() || undefined,
        line_number: line_number?.trim() || undefined,
        avg_usage: avg_usage?.trim() || undefined,
        estimated_usage_2569: estimated_usage_2569?.trim() || undefined,
        current_stock: current_stock?.trim() || undefined,
        estimated_purchase: estimated_purchase?.trim() || undefined,
        unit_price: unit_price?.trim() || undefined,
        requested_qty: requested_qty?.trim() || undefined,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.budgetRequestItemsService.loadBudgetRequestItemList(params);
      this.dataSource.data =
        this.budgetRequestItemsService.budgetRequestItemsList();
      if (this.paginator) {
        this.paginator.length =
          this.budgetRequestItemsService.totalBudgetRequestItem();
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
    this.item_justificationInputSignal.set('');
    this.item_justificationFilterSignal.set('');
    this.generic_codeInputSignal.set('');
    this.generic_codeFilterSignal.set('');
    this.generic_nameInputSignal.set('');
    this.generic_nameFilterSignal.set('');
    this.package_sizeInputSignal.set('');
    this.package_sizeFilterSignal.set('');
    this.unitInputSignal.set('');
    this.unitFilterSignal.set('');
    this.requested_amountInputSignal.set('');
    this.requested_amountFilterSignal.set('');
    this.q1_qtyInputSignal.set('');
    this.q1_qtyFilterSignal.set('');
    this.q2_qtyInputSignal.set('');
    this.q2_qtyFilterSignal.set('');
    this.q3_qtyInputSignal.set('');
    this.q3_qtyFilterSignal.set('');
    this.q4_qtyInputSignal.set('');
    this.q4_qtyFilterSignal.set('');
    this.line_numberInputSignal.set('');
    this.line_numberFilterSignal.set('');
    this.avg_usageInputSignal.set('');
    this.avg_usageFilterSignal.set('');
    this.estimated_usage_2569InputSignal.set('');
    this.estimated_usage_2569FilterSignal.set('');
    this.current_stockInputSignal.set('');
    this.current_stockFilterSignal.set('');
    this.estimated_purchaseInputSignal.set('');
    this.estimated_purchaseFilterSignal.set('');
    this.unit_priceInputSignal.set('');
    this.unit_priceFilterSignal.set('');
    this.requested_qtyInputSignal.set('');
    this.requested_qtyFilterSignal.set('');
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.item_justificationFilterSignal.set(
      this.item_justificationInputSignal().trim(),
    );
    this.generic_codeFilterSignal.set(this.generic_codeInputSignal().trim());
    this.generic_nameFilterSignal.set(this.generic_nameInputSignal().trim());
    this.package_sizeFilterSignal.set(this.package_sizeInputSignal().trim());
    this.unitFilterSignal.set(this.unitInputSignal().trim());
    this.requested_amountFilterSignal.set(
      this.requested_amountInputSignal().trim(),
    );
    this.q1_qtyFilterSignal.set(this.q1_qtyInputSignal().trim());
    this.q2_qtyFilterSignal.set(this.q2_qtyInputSignal().trim());
    this.q3_qtyFilterSignal.set(this.q3_qtyInputSignal().trim());
    this.q4_qtyFilterSignal.set(this.q4_qtyInputSignal().trim());
    this.line_numberFilterSignal.set(this.line_numberInputSignal().trim());
    this.avg_usageFilterSignal.set(this.avg_usageInputSignal().trim());
    this.estimated_usage_2569FilterSignal.set(
      this.estimated_usage_2569InputSignal().trim(),
    );
    this.current_stockFilterSignal.set(this.current_stockInputSignal().trim());
    this.estimated_purchaseFilterSignal.set(
      this.estimated_purchaseInputSignal().trim(),
    );
    this.unit_priceFilterSignal.set(this.unit_priceInputSignal().trim());
    this.requested_qtyFilterSignal.set(this.requested_qtyInputSignal().trim());

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
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.item_justificationInputSignal.set('');
    this.item_justificationFilterSignal.set('');
    this.generic_codeInputSignal.set('');
    this.generic_codeFilterSignal.set('');
    this.generic_nameInputSignal.set('');
    this.generic_nameFilterSignal.set('');
    this.package_sizeInputSignal.set('');
    this.package_sizeFilterSignal.set('');
    this.unitInputSignal.set('');
    this.unitFilterSignal.set('');
    this.requested_amountInputSignal.set('');
    this.requested_amountFilterSignal.set('');
    this.q1_qtyInputSignal.set('');
    this.q1_qtyFilterSignal.set('');
    this.q2_qtyInputSignal.set('');
    this.q2_qtyFilterSignal.set('');
    this.q3_qtyInputSignal.set('');
    this.q3_qtyFilterSignal.set('');
    this.q4_qtyInputSignal.set('');
    this.q4_qtyFilterSignal.set('');
    this.line_numberInputSignal.set('');
    this.line_numberFilterSignal.set('');
    this.avg_usageInputSignal.set('');
    this.avg_usageFilterSignal.set('');
    this.estimated_usage_2569InputSignal.set('');
    this.estimated_usage_2569FilterSignal.set('');
    this.current_stockInputSignal.set('');
    this.current_stockFilterSignal.set('');
    this.estimated_purchaseInputSignal.set('');
    this.estimated_purchaseFilterSignal.set('');
    this.unit_priceInputSignal.set('');
    this.unit_priceFilterSignal.set('');
    this.requested_qtyInputSignal.set('');
    this.requested_qtyFilterSignal.set('');
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.item_justificationFilterSignal().trim() !== '' ||
      this.generic_codeFilterSignal().trim() !== '' ||
      this.generic_nameFilterSignal().trim() !== '' ||
      this.package_sizeFilterSignal().trim() !== '' ||
      this.unitFilterSignal().trim() !== '' ||
      this.requested_amountFilterSignal().trim() !== '' ||
      this.q1_qtyFilterSignal().trim() !== '' ||
      this.q2_qtyFilterSignal().trim() !== '' ||
      this.q3_qtyFilterSignal().trim() !== '' ||
      this.q4_qtyFilterSignal().trim() !== '' ||
      this.line_numberFilterSignal().trim() !== '' ||
      this.avg_usageFilterSignal().trim() !== '' ||
      this.estimated_usage_2569FilterSignal().trim() !== '' ||
      this.current_stockFilterSignal().trim() !== '' ||
      this.estimated_purchaseFilterSignal().trim() !== '' ||
      this.unit_priceFilterSignal().trim() !== '' ||
      this.requested_qtyFilterSignal().trim() !== ''
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.item_justificationFilterSignal().trim()) count++;
    if (this.generic_codeFilterSignal().trim()) count++;
    if (this.generic_nameFilterSignal().trim()) count++;
    if (this.package_sizeFilterSignal().trim()) count++;
    if (this.unitFilterSignal().trim()) count++;
    if (this.requested_amountFilterSignal().trim()) count++;
    if (this.q1_qtyFilterSignal().trim()) count++;
    if (this.q2_qtyFilterSignal().trim()) count++;
    if (this.q3_qtyFilterSignal().trim()) count++;
    if (this.q4_qtyFilterSignal().trim()) count++;
    if (this.line_numberFilterSignal().trim()) count++;
    if (this.avg_usageFilterSignal().trim()) count++;
    if (this.estimated_usage_2569FilterSignal().trim()) count++;
    if (this.current_stockFilterSignal().trim()) count++;
    if (this.estimated_purchaseFilterSignal().trim()) count++;
    if (this.unit_priceFilterSignal().trim()) count++;
    if (this.requested_qtyFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(BudgetRequestItemCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewBudgetRequestItem(budgetRequestItem: BudgetRequestItem) {
    const dialogRef = this.dialog.open(BudgetRequestItemViewDialogComponent, {
      width: '600px',
      data: {
        budgetRequestItems: budgetRequestItem,
      } as BudgetRequestItemViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditBudgetRequestItem(result.data);
      }
    });
  }

  onEditBudgetRequestItem(budgetRequestItem: BudgetRequestItem) {
    const dialogRef = this.dialog.open(BudgetRequestItemEditDialogComponent, {
      width: '600px',
      data: {
        budgetRequestItems: budgetRequestItem,
      } as BudgetRequestItemEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteBudgetRequestItem(budgetRequestItem: BudgetRequestItem) {
    const itemName =
      (budgetRequestItem as any).name ||
      (budgetRequestItem as any).title ||
      'budgetrequestitem';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.budgetRequestItemsService.deleteBudgetRequestItem(
            budgetRequestItem.id,
          );
          this.snackBar.open(
            'BudgetRequestItem deleted successfully',
            'Close',
            {
              duration: 3000,
            },
          );
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete budgetrequestitem', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'budget_request_items')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (budgetRequestItem) =>
                this.budgetRequestItemsService.deleteBudgetRequestItem(
                  budgetRequestItem.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} budgetrequestitem(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some budget_request_items',
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
      item_justification: this.item_justificationFilterSignal(),
      generic_code: this.generic_codeFilterSignal(),
      generic_name: this.generic_nameFilterSignal(),
      package_size: this.package_sizeFilterSignal(),
      unit: this.unitFilterSignal(),
      requested_amount: this.requested_amountFilterSignal(),
      q1_qty: this.q1_qtyFilterSignal(),
      q2_qty: this.q2_qtyFilterSignal(),
      q3_qty: this.q3_qtyFilterSignal(),
      q4_qty: this.q4_qtyFilterSignal(),
      line_number: this.line_numberFilterSignal(),
      avg_usage: this.avg_usageFilterSignal(),
      estimated_usage_2569: this.estimated_usage_2569FilterSignal(),
      current_stock: this.current_stockFilterSignal(),
      estimated_purchase: this.estimated_purchaseFilterSignal(),
      unit_price: this.unit_priceFilterSignal(),
      requested_qty: this.requested_qtyFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(budgetRequestItem: BudgetRequestItem): void {
    const currentExpanded = this.expandedBudgetRequestItem();
    if (currentExpanded?.id === budgetRequestItem.id) {
      // Collapse currently expanded row
      this.expandedBudgetRequestItem.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedBudgetRequestItem.set(budgetRequestItem);
    }
  }

  isRowExpanded(budgetRequestItem: BudgetRequestItem): boolean {
    return this.expandedBudgetRequestItem()?.id === budgetRequestItem.id;
  }
}
