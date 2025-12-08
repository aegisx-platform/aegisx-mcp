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
import { BudgetPlanItemService } from '../services/budget-plan-items.service';
import {
  BudgetPlanItem,
  ListBudgetPlanItemQuery,
} from '../types/budget-plan-items.types';
import { BudgetPlanItemCreateDialogComponent } from './budget-plan-items-create.dialog';
import {
  BudgetPlanItemEditDialogComponent,
  BudgetPlanItemEditDialogData,
} from './budget-plan-items-edit.dialog';
import {
  BudgetPlanItemViewDialogComponent,
  BudgetPlanItemViewDialogData,
} from './budget-plan-items-view.dialog';
import { BudgetPlanItemImportDialogComponent } from './budget-plan-items-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { BudgetPlanItemsListFiltersComponent } from './budget-plan-items-list-filters.component';
import { BudgetPlanItemsListHeaderComponent } from './budget-plan-items-list-header.component';

@Component({
  selector: 'app-budget-plan-items-list',
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
    BudgetPlanItemsListHeaderComponent,
    BudgetPlanItemsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './budget-plan-items-list.component.html',
  styleUrl: './budget-plan-items-list.component.scss',
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
export class BudgetPlanItemsListComponent {
  budgetPlanItemsService = inject(BudgetPlanItemService);
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
      label: 'Budget Plan Items',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'budget_plan_id',
    'generic_id',
    'last_year_qty',
    'two_years_ago_qty',
    'three_years_ago_qty',
    'planned_quantity',
    'actions',
  ];
  dataSource = new MatTableDataSource<BudgetPlanItem>([]);
  selection = new SelectionModel<BudgetPlanItem>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.budgetPlanItemsService
      .budgetPlanItemsList()
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
  protected notesInputSignal = signal('');
  protected last_year_qtyInputSignal = signal('');
  protected two_years_ago_qtyInputSignal = signal('');
  protected three_years_ago_qtyInputSignal = signal('');
  protected planned_quantityInputSignal = signal('');
  protected estimated_unit_priceInputSignal = signal('');
  protected total_planned_valueInputSignal = signal('');
  protected q1_planned_qtyInputSignal = signal('');
  protected q2_planned_qtyInputSignal = signal('');
  protected q3_planned_qtyInputSignal = signal('');
  protected q4_planned_qtyInputSignal = signal('');
  protected q1_purchased_qtyInputSignal = signal('');
  protected q2_purchased_qtyInputSignal = signal('');
  protected q3_purchased_qtyInputSignal = signal('');
  protected q4_purchased_qtyInputSignal = signal('');
  protected total_purchased_qtyInputSignal = signal('');
  protected total_purchased_valueInputSignal = signal('');

  // Advanced filter ACTIVE signals (sent to API)
  protected notesFilterSignal = signal('');
  protected last_year_qtyFilterSignal = signal('');
  protected two_years_ago_qtyFilterSignal = signal('');
  protected three_years_ago_qtyFilterSignal = signal('');
  protected planned_quantityFilterSignal = signal('');
  protected estimated_unit_priceFilterSignal = signal('');
  protected total_planned_valueFilterSignal = signal('');
  protected q1_planned_qtyFilterSignal = signal('');
  protected q2_planned_qtyFilterSignal = signal('');
  protected q3_planned_qtyFilterSignal = signal('');
  protected q4_planned_qtyFilterSignal = signal('');
  protected q1_purchased_qtyFilterSignal = signal('');
  protected q2_purchased_qtyFilterSignal = signal('');
  protected q3_purchased_qtyFilterSignal = signal('');
  protected q4_purchased_qtyFilterSignal = signal('');
  protected total_purchased_qtyFilterSignal = signal('');
  protected total_purchased_valueFilterSignal = signal('');

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
  protected expandedBudgetPlanItem = signal<BudgetPlanItem | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    notes: this.notesInputSignal(),
    last_year_qty: this.last_year_qtyInputSignal(),
    two_years_ago_qty: this.two_years_ago_qtyInputSignal(),
    three_years_ago_qty: this.three_years_ago_qtyInputSignal(),
    planned_quantity: this.planned_quantityInputSignal(),
    estimated_unit_price: this.estimated_unit_priceInputSignal(),
    total_planned_value: this.total_planned_valueInputSignal(),
    q1_planned_qty: this.q1_planned_qtyInputSignal(),
    q2_planned_qty: this.q2_planned_qtyInputSignal(),
    q3_planned_qty: this.q3_planned_qtyInputSignal(),
    q4_planned_qty: this.q4_planned_qtyInputSignal(),
    q1_purchased_qty: this.q1_purchased_qtyInputSignal(),
    q2_purchased_qty: this.q2_purchased_qtyInputSignal(),
    q3_purchased_qty: this.q3_purchased_qtyInputSignal(),
    q4_purchased_qty: this.q4_purchased_qtyInputSignal(),
    total_purchased_qty: this.total_purchased_qtyInputSignal(),
    total_purchased_value: this.total_purchased_valueInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get notesFilter() {
    return this.notesInputSignal();
  }
  set notesFilter(value: string) {
    this.notesInputSignal.set(value);
  }

  get last_year_qtyFilter() {
    return this.last_year_qtyInputSignal();
  }
  set last_year_qtyFilter(value: string) {
    this.last_year_qtyInputSignal.set(value);
  }
  get two_years_ago_qtyFilter() {
    return this.two_years_ago_qtyInputSignal();
  }
  set two_years_ago_qtyFilter(value: string) {
    this.two_years_ago_qtyInputSignal.set(value);
  }
  get three_years_ago_qtyFilter() {
    return this.three_years_ago_qtyInputSignal();
  }
  set three_years_ago_qtyFilter(value: string) {
    this.three_years_ago_qtyInputSignal.set(value);
  }
  get planned_quantityFilter() {
    return this.planned_quantityInputSignal();
  }
  set planned_quantityFilter(value: string) {
    this.planned_quantityInputSignal.set(value);
  }
  get estimated_unit_priceFilter() {
    return this.estimated_unit_priceInputSignal();
  }
  set estimated_unit_priceFilter(value: string) {
    this.estimated_unit_priceInputSignal.set(value);
  }
  get total_planned_valueFilter() {
    return this.total_planned_valueInputSignal();
  }
  set total_planned_valueFilter(value: string) {
    this.total_planned_valueInputSignal.set(value);
  }
  get q1_planned_qtyFilter() {
    return this.q1_planned_qtyInputSignal();
  }
  set q1_planned_qtyFilter(value: string) {
    this.q1_planned_qtyInputSignal.set(value);
  }
  get q2_planned_qtyFilter() {
    return this.q2_planned_qtyInputSignal();
  }
  set q2_planned_qtyFilter(value: string) {
    this.q2_planned_qtyInputSignal.set(value);
  }
  get q3_planned_qtyFilter() {
    return this.q3_planned_qtyInputSignal();
  }
  set q3_planned_qtyFilter(value: string) {
    this.q3_planned_qtyInputSignal.set(value);
  }
  get q4_planned_qtyFilter() {
    return this.q4_planned_qtyInputSignal();
  }
  set q4_planned_qtyFilter(value: string) {
    this.q4_planned_qtyInputSignal.set(value);
  }
  get q1_purchased_qtyFilter() {
    return this.q1_purchased_qtyInputSignal();
  }
  set q1_purchased_qtyFilter(value: string) {
    this.q1_purchased_qtyInputSignal.set(value);
  }
  get q2_purchased_qtyFilter() {
    return this.q2_purchased_qtyInputSignal();
  }
  set q2_purchased_qtyFilter(value: string) {
    this.q2_purchased_qtyInputSignal.set(value);
  }
  get q3_purchased_qtyFilter() {
    return this.q3_purchased_qtyInputSignal();
  }
  set q3_purchased_qtyFilter(value: string) {
    this.q3_purchased_qtyInputSignal.set(value);
  }
  get q4_purchased_qtyFilter() {
    return this.q4_purchased_qtyInputSignal();
  }
  set q4_purchased_qtyFilter(value: string) {
    this.q4_purchased_qtyInputSignal.set(value);
  }
  get total_purchased_qtyFilter() {
    return this.total_purchased_qtyInputSignal();
  }
  set total_purchased_qtyFilter(value: string) {
    this.total_purchased_qtyInputSignal.set(value);
  }
  get total_purchased_valueFilter() {
    return this.total_purchased_valueInputSignal();
  }
  set total_purchased_valueFilter(value: string) {
    this.total_purchased_valueInputSignal.set(value);
  }

  // Stats computed from data
  // Note: For accurate stats, consider implementing a dedicated stats endpoint
  stats = computed(() => {
    const list = this.budgetPlanItemsService.budgetPlanItemsList();
    const total = this.budgetPlanItemsService.totalBudgetPlanItem();

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
      this.budgetPlanItemsService.exportBudgetPlanItem(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'budget_plan_id', label: 'Budget Plan Id' },
    { key: 'generic_id', label: 'Generic Id' },
    { key: 'last_year_qty', label: 'Last Year Qty' },
    { key: 'two_years_ago_qty', label: 'Two Years Ago Qty' },
    { key: 'three_years_ago_qty', label: 'Three Years Ago Qty' },
    { key: 'planned_quantity', label: 'Planned Quantity' },
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

  // --- Effect: reload budget_plan_items on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.budgetPlanItemsService.loading();

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

      const notes = this.notesFilterSignal();
      const last_year_qty = this.last_year_qtyFilterSignal();
      const two_years_ago_qty = this.two_years_ago_qtyFilterSignal();
      const three_years_ago_qty = this.three_years_ago_qtyFilterSignal();
      const planned_quantity = this.planned_quantityFilterSignal();
      const estimated_unit_price = this.estimated_unit_priceFilterSignal();
      const total_planned_value = this.total_planned_valueFilterSignal();
      const q1_planned_qty = this.q1_planned_qtyFilterSignal();
      const q2_planned_qty = this.q2_planned_qtyFilterSignal();
      const q3_planned_qty = this.q3_planned_qtyFilterSignal();
      const q4_planned_qty = this.q4_planned_qtyFilterSignal();
      const q1_purchased_qty = this.q1_purchased_qtyFilterSignal();
      const q2_purchased_qty = this.q2_purchased_qtyFilterSignal();
      const q3_purchased_qty = this.q3_purchased_qtyFilterSignal();
      const q4_purchased_qty = this.q4_purchased_qtyFilterSignal();
      const total_purchased_qty = this.total_purchased_qtyFilterSignal();
      const total_purchased_value = this.total_purchased_valueFilterSignal();

      const params: Partial<ListBudgetPlanItemQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        notes: notes?.trim() || undefined,
        last_year_qty: last_year_qty?.trim() || undefined,
        two_years_ago_qty: two_years_ago_qty?.trim() || undefined,
        three_years_ago_qty: three_years_ago_qty?.trim() || undefined,
        planned_quantity: planned_quantity?.trim() || undefined,
        estimated_unit_price: estimated_unit_price?.trim() || undefined,
        total_planned_value: total_planned_value?.trim() || undefined,
        q1_planned_qty: q1_planned_qty?.trim() || undefined,
        q2_planned_qty: q2_planned_qty?.trim() || undefined,
        q3_planned_qty: q3_planned_qty?.trim() || undefined,
        q4_planned_qty: q4_planned_qty?.trim() || undefined,
        q1_purchased_qty: q1_purchased_qty?.trim() || undefined,
        q2_purchased_qty: q2_purchased_qty?.trim() || undefined,
        q3_purchased_qty: q3_purchased_qty?.trim() || undefined,
        q4_purchased_qty: q4_purchased_qty?.trim() || undefined,
        total_purchased_qty: total_purchased_qty?.trim() || undefined,
        total_purchased_value: total_purchased_value?.trim() || undefined,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.budgetPlanItemsService.loadBudgetPlanItemList(params);
      this.dataSource.data = this.budgetPlanItemsService.budgetPlanItemsList();
      if (this.paginator) {
        this.paginator.length =
          this.budgetPlanItemsService.totalBudgetPlanItem();
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
    this.notesInputSignal.set('');
    this.notesFilterSignal.set('');
    this.last_year_qtyInputSignal.set('');
    this.last_year_qtyFilterSignal.set('');
    this.two_years_ago_qtyInputSignal.set('');
    this.two_years_ago_qtyFilterSignal.set('');
    this.three_years_ago_qtyInputSignal.set('');
    this.three_years_ago_qtyFilterSignal.set('');
    this.planned_quantityInputSignal.set('');
    this.planned_quantityFilterSignal.set('');
    this.estimated_unit_priceInputSignal.set('');
    this.estimated_unit_priceFilterSignal.set('');
    this.total_planned_valueInputSignal.set('');
    this.total_planned_valueFilterSignal.set('');
    this.q1_planned_qtyInputSignal.set('');
    this.q1_planned_qtyFilterSignal.set('');
    this.q2_planned_qtyInputSignal.set('');
    this.q2_planned_qtyFilterSignal.set('');
    this.q3_planned_qtyInputSignal.set('');
    this.q3_planned_qtyFilterSignal.set('');
    this.q4_planned_qtyInputSignal.set('');
    this.q4_planned_qtyFilterSignal.set('');
    this.q1_purchased_qtyInputSignal.set('');
    this.q1_purchased_qtyFilterSignal.set('');
    this.q2_purchased_qtyInputSignal.set('');
    this.q2_purchased_qtyFilterSignal.set('');
    this.q3_purchased_qtyInputSignal.set('');
    this.q3_purchased_qtyFilterSignal.set('');
    this.q4_purchased_qtyInputSignal.set('');
    this.q4_purchased_qtyFilterSignal.set('');
    this.total_purchased_qtyInputSignal.set('');
    this.total_purchased_qtyFilterSignal.set('');
    this.total_purchased_valueInputSignal.set('');
    this.total_purchased_valueFilterSignal.set('');
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.notesFilterSignal.set(this.notesInputSignal().trim());
    this.last_year_qtyFilterSignal.set(this.last_year_qtyInputSignal().trim());
    this.two_years_ago_qtyFilterSignal.set(
      this.two_years_ago_qtyInputSignal().trim(),
    );
    this.three_years_ago_qtyFilterSignal.set(
      this.three_years_ago_qtyInputSignal().trim(),
    );
    this.planned_quantityFilterSignal.set(
      this.planned_quantityInputSignal().trim(),
    );
    this.estimated_unit_priceFilterSignal.set(
      this.estimated_unit_priceInputSignal().trim(),
    );
    this.total_planned_valueFilterSignal.set(
      this.total_planned_valueInputSignal().trim(),
    );
    this.q1_planned_qtyFilterSignal.set(
      this.q1_planned_qtyInputSignal().trim(),
    );
    this.q2_planned_qtyFilterSignal.set(
      this.q2_planned_qtyInputSignal().trim(),
    );
    this.q3_planned_qtyFilterSignal.set(
      this.q3_planned_qtyInputSignal().trim(),
    );
    this.q4_planned_qtyFilterSignal.set(
      this.q4_planned_qtyInputSignal().trim(),
    );
    this.q1_purchased_qtyFilterSignal.set(
      this.q1_purchased_qtyInputSignal().trim(),
    );
    this.q2_purchased_qtyFilterSignal.set(
      this.q2_purchased_qtyInputSignal().trim(),
    );
    this.q3_purchased_qtyFilterSignal.set(
      this.q3_purchased_qtyInputSignal().trim(),
    );
    this.q4_purchased_qtyFilterSignal.set(
      this.q4_purchased_qtyInputSignal().trim(),
    );
    this.total_purchased_qtyFilterSignal.set(
      this.total_purchased_qtyInputSignal().trim(),
    );
    this.total_purchased_valueFilterSignal.set(
      this.total_purchased_valueInputSignal().trim(),
    );

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
    this.notesInputSignal.set('');
    this.notesFilterSignal.set('');
    this.last_year_qtyInputSignal.set('');
    this.last_year_qtyFilterSignal.set('');
    this.two_years_ago_qtyInputSignal.set('');
    this.two_years_ago_qtyFilterSignal.set('');
    this.three_years_ago_qtyInputSignal.set('');
    this.three_years_ago_qtyFilterSignal.set('');
    this.planned_quantityInputSignal.set('');
    this.planned_quantityFilterSignal.set('');
    this.estimated_unit_priceInputSignal.set('');
    this.estimated_unit_priceFilterSignal.set('');
    this.total_planned_valueInputSignal.set('');
    this.total_planned_valueFilterSignal.set('');
    this.q1_planned_qtyInputSignal.set('');
    this.q1_planned_qtyFilterSignal.set('');
    this.q2_planned_qtyInputSignal.set('');
    this.q2_planned_qtyFilterSignal.set('');
    this.q3_planned_qtyInputSignal.set('');
    this.q3_planned_qtyFilterSignal.set('');
    this.q4_planned_qtyInputSignal.set('');
    this.q4_planned_qtyFilterSignal.set('');
    this.q1_purchased_qtyInputSignal.set('');
    this.q1_purchased_qtyFilterSignal.set('');
    this.q2_purchased_qtyInputSignal.set('');
    this.q2_purchased_qtyFilterSignal.set('');
    this.q3_purchased_qtyInputSignal.set('');
    this.q3_purchased_qtyFilterSignal.set('');
    this.q4_purchased_qtyInputSignal.set('');
    this.q4_purchased_qtyFilterSignal.set('');
    this.total_purchased_qtyInputSignal.set('');
    this.total_purchased_qtyFilterSignal.set('');
    this.total_purchased_valueInputSignal.set('');
    this.total_purchased_valueFilterSignal.set('');
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.notesFilterSignal().trim() !== '' ||
      this.last_year_qtyFilterSignal().trim() !== '' ||
      this.two_years_ago_qtyFilterSignal().trim() !== '' ||
      this.three_years_ago_qtyFilterSignal().trim() !== '' ||
      this.planned_quantityFilterSignal().trim() !== '' ||
      this.estimated_unit_priceFilterSignal().trim() !== '' ||
      this.total_planned_valueFilterSignal().trim() !== '' ||
      this.q1_planned_qtyFilterSignal().trim() !== '' ||
      this.q2_planned_qtyFilterSignal().trim() !== '' ||
      this.q3_planned_qtyFilterSignal().trim() !== '' ||
      this.q4_planned_qtyFilterSignal().trim() !== '' ||
      this.q1_purchased_qtyFilterSignal().trim() !== '' ||
      this.q2_purchased_qtyFilterSignal().trim() !== '' ||
      this.q3_purchased_qtyFilterSignal().trim() !== '' ||
      this.q4_purchased_qtyFilterSignal().trim() !== '' ||
      this.total_purchased_qtyFilterSignal().trim() !== '' ||
      this.total_purchased_valueFilterSignal().trim() !== ''
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.notesFilterSignal().trim()) count++;
    if (this.last_year_qtyFilterSignal().trim()) count++;
    if (this.two_years_ago_qtyFilterSignal().trim()) count++;
    if (this.three_years_ago_qtyFilterSignal().trim()) count++;
    if (this.planned_quantityFilterSignal().trim()) count++;
    if (this.estimated_unit_priceFilterSignal().trim()) count++;
    if (this.total_planned_valueFilterSignal().trim()) count++;
    if (this.q1_planned_qtyFilterSignal().trim()) count++;
    if (this.q2_planned_qtyFilterSignal().trim()) count++;
    if (this.q3_planned_qtyFilterSignal().trim()) count++;
    if (this.q4_planned_qtyFilterSignal().trim()) count++;
    if (this.q1_purchased_qtyFilterSignal().trim()) count++;
    if (this.q2_purchased_qtyFilterSignal().trim()) count++;
    if (this.q3_purchased_qtyFilterSignal().trim()) count++;
    if (this.q4_purchased_qtyFilterSignal().trim()) count++;
    if (this.total_purchased_qtyFilterSignal().trim()) count++;
    if (this.total_purchased_valueFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(BudgetPlanItemCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(BudgetPlanItemImportDialogComponent, {
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

  onViewBudgetPlanItem(budgetPlanItem: BudgetPlanItem) {
    const dialogRef = this.dialog.open(BudgetPlanItemViewDialogComponent, {
      width: '600px',
      data: { budgetPlanItems: budgetPlanItem } as BudgetPlanItemViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditBudgetPlanItem(result.data);
      }
    });
  }

  onEditBudgetPlanItem(budgetPlanItem: BudgetPlanItem) {
    const dialogRef = this.dialog.open(BudgetPlanItemEditDialogComponent, {
      width: '600px',
      data: { budgetPlanItems: budgetPlanItem } as BudgetPlanItemEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteBudgetPlanItem(budgetPlanItem: BudgetPlanItem) {
    const itemName =
      (budgetPlanItem as any).name ||
      (budgetPlanItem as any).title ||
      'budgetplanitem';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.budgetPlanItemsService.deleteBudgetPlanItem(
            budgetPlanItem.id,
          );
          this.snackBar.open('BudgetPlanItem deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete budgetplanitem', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'budget_plan_items')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (budgetPlanItem) =>
                this.budgetPlanItemsService.deleteBudgetPlanItem(
                  budgetPlanItem.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} budgetplanitem(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some budget_plan_items',
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
      notes: this.notesFilterSignal(),
      last_year_qty: this.last_year_qtyFilterSignal(),
      two_years_ago_qty: this.two_years_ago_qtyFilterSignal(),
      three_years_ago_qty: this.three_years_ago_qtyFilterSignal(),
      planned_quantity: this.planned_quantityFilterSignal(),
      estimated_unit_price: this.estimated_unit_priceFilterSignal(),
      total_planned_value: this.total_planned_valueFilterSignal(),
      q1_planned_qty: this.q1_planned_qtyFilterSignal(),
      q2_planned_qty: this.q2_planned_qtyFilterSignal(),
      q3_planned_qty: this.q3_planned_qtyFilterSignal(),
      q4_planned_qty: this.q4_planned_qtyFilterSignal(),
      q1_purchased_qty: this.q1_purchased_qtyFilterSignal(),
      q2_purchased_qty: this.q2_purchased_qtyFilterSignal(),
      q3_purchased_qty: this.q3_purchased_qtyFilterSignal(),
      q4_purchased_qty: this.q4_purchased_qtyFilterSignal(),
      total_purchased_qty: this.total_purchased_qtyFilterSignal(),
      total_purchased_value: this.total_purchased_valueFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(budgetPlanItem: BudgetPlanItem): void {
    const currentExpanded = this.expandedBudgetPlanItem();
    if (currentExpanded?.id === budgetPlanItem.id) {
      // Collapse currently expanded row
      this.expandedBudgetPlanItem.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedBudgetPlanItem.set(budgetPlanItem);
    }
  }

  isRowExpanded(budgetPlanItem: BudgetPlanItem): boolean {
    return this.expandedBudgetPlanItem()?.id === budgetPlanItem.id;
  }
}
