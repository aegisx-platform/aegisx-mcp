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
import { SharedExportComponent } from '../../../shared/components/shared-export/shared-export.component';
import { TestProductService } from '../services/test-products.service';
import {
  TestProduct,
  ListTestProductQuery,
} from '../types/test-products.types';
import { TestProductCreateDialogComponent } from './test-products-create.dialog';
import {
  TestProductEditDialogComponent,
  TestProductEditDialogData,
} from './test-products-edit.dialog';
import {
  TestProductViewDialogComponent,
  TestProductViewDialogData,
} from './test-products-view.dialog';

// Import child components
import { TestProductsListFiltersComponent } from './test-products-list-filters.component';
import { TestProductsListHeaderComponent } from './test-products-list-header.component';

@Component({
  selector: 'app-test-products-list',
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
    SharedExportComponent,
    BreadcrumbComponent,
    // Child components
    TestProductsListHeaderComponent,
    TestProductsListFiltersComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './test-products-list.component.html',
  styleUrl: './test-products-list.component.scss',
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
export class TestProductsListComponent {
  testProductsService = inject(TestProductService);
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
      label: 'TestProducts',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'code',
    'name',
    'slug',
    'description',
    'is_active',
    'is_featured',
    'actions',
  ];
  dataSource = new MatTableDataSource<TestProduct>([]);
  selection = new SelectionModel<TestProduct>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() =>
    this.testProductsService
      .testProductsList()
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
  protected codeInputSignal = signal('');
  protected nameInputSignal = signal('');
  protected slugInputSignal = signal('');
  protected descriptionInputSignal = signal('');
  protected statusInputSignal = signal('');
  protected created_byInputSignal = signal('');
  protected updated_byInputSignal = signal('');
  protected display_orderInputSignal = signal('');
  protected item_countInputSignal = signal('');
  protected discount_rateInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);
  protected is_featuredInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected codeFilterSignal = signal('');
  protected nameFilterSignal = signal('');
  protected slugFilterSignal = signal('');
  protected descriptionFilterSignal = signal('');
  protected statusFilterSignal = signal('');
  protected created_byFilterSignal = signal('');
  protected updated_byFilterSignal = signal('');
  protected display_orderFilterSignal = signal('');
  protected item_countFilterSignal = signal('');
  protected discount_rateFilterSignal = signal('');
  protected is_activeFilterSignal = signal<boolean | undefined>(undefined);
  protected is_featuredFilterSignal = signal<boolean | undefined>(undefined);

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
  protected expandedTestProduct = signal<TestProduct | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    code: this.codeInputSignal(),
    name: this.nameInputSignal(),
    slug: this.slugInputSignal(),
    description: this.descriptionInputSignal(),
    status: this.statusInputSignal(),
    created_by: this.created_byInputSignal(),
    updated_by: this.updated_byInputSignal(),
    display_order: this.display_orderInputSignal(),
    item_count: this.item_countInputSignal(),
    discount_rate: this.discount_rateInputSignal(),
    is_active: this.is_activeInputSignal(),
    is_featured: this.is_featuredInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get codeFilter() {
    return this.codeInputSignal();
  }
  set codeFilter(value: string) {
    this.codeInputSignal.set(value);
  }
  get nameFilter() {
    return this.nameInputSignal();
  }
  set nameFilter(value: string) {
    this.nameInputSignal.set(value);
  }
  get slugFilter() {
    return this.slugInputSignal();
  }
  set slugFilter(value: string) {
    this.slugInputSignal.set(value);
  }
  get descriptionFilter() {
    return this.descriptionInputSignal();
  }
  set descriptionFilter(value: string) {
    this.descriptionInputSignal.set(value);
  }
  get statusFilter() {
    return this.statusInputSignal();
  }
  set statusFilter(value: string) {
    this.statusInputSignal.set(value);
  }
  get created_byFilter() {
    return this.created_byInputSignal();
  }
  set created_byFilter(value: string) {
    this.created_byInputSignal.set(value);
  }
  get updated_byFilter() {
    return this.updated_byInputSignal();
  }
  set updated_byFilter(value: string) {
    this.updated_byInputSignal.set(value);
  }

  get display_orderFilter() {
    return this.display_orderInputSignal();
  }
  set display_orderFilter(value: string) {
    this.display_orderInputSignal.set(value);
  }
  get item_countFilter() {
    return this.item_countInputSignal();
  }
  set item_countFilter(value: string) {
    this.item_countInputSignal.set(value);
  }
  get discount_rateFilter() {
    return this.discount_rateInputSignal();
  }
  set discount_rateFilter(value: string) {
    this.discount_rateInputSignal.set(value);
  }

  get is_activeFilter() {
    return this.is_activeInputSignal();
  }
  set is_activeFilter(value: boolean | undefined) {
    this.is_activeInputSignal.set(value);
  }
  get is_featuredFilter() {
    return this.is_featuredInputSignal();
  }
  set is_featuredFilter(value: boolean | undefined) {
    this.is_featuredInputSignal.set(value);
  }

  // Stats computed from data
  // Note: For accurate stats, consider implementing a dedicated stats endpoint
  stats = computed(() => {
    const list = this.testProductsService.testProductsList();
    const total = this.testProductsService.totalTestProduct();

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

  // --- Effect: reload test_products on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.testProductsService.loading();

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

      const code = this.codeFilterSignal();
      const name = this.nameFilterSignal();
      const slug = this.slugFilterSignal();
      const description = this.descriptionFilterSignal();
      const status = this.statusFilterSignal();
      const created_by = this.created_byFilterSignal();
      const updated_by = this.updated_byFilterSignal();
      const display_order = this.display_orderFilterSignal();
      const item_count = this.item_countFilterSignal();
      const discount_rate = this.discount_rateFilterSignal();
      const is_active = this.is_activeFilterSignal();
      const is_featured = this.is_featuredFilterSignal();

      const params: Partial<ListTestProductQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        code: code?.trim() || undefined,
        name: name?.trim() || undefined,
        slug: slug?.trim() || undefined,
        description: description?.trim() || undefined,
        status: status?.trim() || undefined,
        created_by: created_by?.trim() || undefined,
        updated_by: updated_by?.trim() || undefined,
        display_order: display_order?.trim() || undefined,
        item_count: item_count?.trim() || undefined,
        discount_rate: discount_rate?.trim() || undefined,
        is_active: is_active,
        is_featured: is_featured,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.testProductsService.loadTestProductList(params);
      this.dataSource.data = this.testProductsService.testProductsList();
      if (this.paginator) {
        this.paginator.length = this.testProductsService.totalTestProduct();
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
    this.codeInputSignal.set('');
    this.codeFilterSignal.set('');
    this.nameInputSignal.set('');
    this.nameFilterSignal.set('');
    this.slugInputSignal.set('');
    this.slugFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
    this.statusInputSignal.set('');
    this.statusFilterSignal.set('');
    this.created_byInputSignal.set('');
    this.created_byFilterSignal.set('');
    this.updated_byInputSignal.set('');
    this.updated_byFilterSignal.set('');
    this.display_orderInputSignal.set('');
    this.display_orderFilterSignal.set('');
    this.item_countInputSignal.set('');
    this.item_countFilterSignal.set('');
    this.discount_rateInputSignal.set('');
    this.discount_rateFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.is_featuredInputSignal.set(undefined);
    this.is_featuredFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.codeFilterSignal.set(this.codeInputSignal().trim());
    this.nameFilterSignal.set(this.nameInputSignal().trim());
    this.slugFilterSignal.set(this.slugInputSignal().trim());
    this.descriptionFilterSignal.set(this.descriptionInputSignal().trim());
    this.statusFilterSignal.set(this.statusInputSignal().trim());
    this.created_byFilterSignal.set(this.created_byInputSignal().trim());
    this.updated_byFilterSignal.set(this.updated_byInputSignal().trim());
    this.display_orderFilterSignal.set(this.display_orderInputSignal().trim());
    this.item_countFilterSignal.set(this.item_countInputSignal().trim());
    this.discount_rateFilterSignal.set(this.discount_rateInputSignal().trim());
    this.is_activeFilterSignal.set(this.is_activeInputSignal());
    this.is_featuredFilterSignal.set(this.is_featuredInputSignal());

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
    this.codeInputSignal.set('');
    this.codeFilterSignal.set('');
    this.nameInputSignal.set('');
    this.nameFilterSignal.set('');
    this.slugInputSignal.set('');
    this.slugFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
    this.statusInputSignal.set('');
    this.statusFilterSignal.set('');
    this.created_byInputSignal.set('');
    this.created_byFilterSignal.set('');
    this.updated_byInputSignal.set('');
    this.updated_byFilterSignal.set('');
    this.display_orderInputSignal.set('');
    this.display_orderFilterSignal.set('');
    this.item_countInputSignal.set('');
    this.item_countFilterSignal.set('');
    this.discount_rateInputSignal.set('');
    this.discount_rateFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.is_featuredInputSignal.set(undefined);
    this.is_featuredFilterSignal.set(undefined);
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.codeFilterSignal().trim() !== '' ||
      this.nameFilterSignal().trim() !== '' ||
      this.slugFilterSignal().trim() !== '' ||
      this.descriptionFilterSignal().trim() !== '' ||
      this.statusFilterSignal().trim() !== '' ||
      this.created_byFilterSignal().trim() !== '' ||
      this.updated_byFilterSignal().trim() !== '' ||
      this.display_orderFilterSignal().trim() !== '' ||
      this.item_countFilterSignal().trim() !== '' ||
      this.discount_rateFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined ||
      this.is_featuredFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.codeFilterSignal().trim()) count++;
    if (this.nameFilterSignal().trim()) count++;
    if (this.slugFilterSignal().trim()) count++;
    if (this.descriptionFilterSignal().trim()) count++;
    if (this.statusFilterSignal().trim()) count++;
    if (this.created_byFilterSignal().trim()) count++;
    if (this.updated_byFilterSignal().trim()) count++;
    if (this.display_orderFilterSignal().trim()) count++;
    if (this.item_countFilterSignal().trim()) count++;
    if (this.discount_rateFilterSignal().trim()) count++;
    if (this.is_activeFilterSignal() !== undefined) count++;
    if (this.is_featuredFilterSignal() !== undefined) count++;
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
    const dialogRef = this.dialog.open(TestProductCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewTestProduct(testProduct: TestProduct) {
    const dialogRef = this.dialog.open(TestProductViewDialogComponent, {
      width: '600px',
      data: { testProducts: testProduct } as TestProductViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditTestProduct(result.data);
      }
    });
  }

  onEditTestProduct(testProduct: TestProduct) {
    const dialogRef = this.dialog.open(TestProductEditDialogComponent, {
      width: '600px',
      data: { testProducts: testProduct } as TestProductEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteTestProduct(testProduct: TestProduct) {
    const itemName =
      (testProduct as any).name || (testProduct as any).title || 'testproduct';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.testProductsService.deleteTestProduct(testProduct.id);
          this.snackBar.open('TestProduct deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete testproduct', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'test_products')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((testProduct) =>
              this.testProductsService.deleteTestProduct(testProduct.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} testproduct(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some test_products', 'Close', {
              duration: 3000,
            });
          }
        }
      });
  }

  // Filter Helpers
  getExportFilters(): Record<string, unknown> {
    return {
      searchTerm: this.searchTermSignal(),
      code: this.codeFilterSignal(),
      name: this.nameFilterSignal(),
      slug: this.slugFilterSignal(),
      description: this.descriptionFilterSignal(),
      status: this.statusFilterSignal(),
      created_by: this.created_byFilterSignal(),
      updated_by: this.updated_byFilterSignal(),
      display_order: this.display_orderFilterSignal(),
      item_count: this.item_countFilterSignal(),
      discount_rate: this.discount_rateFilterSignal(),
      is_active: this.is_activeFilterSignal(),
      is_featured: this.is_featuredFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(testProduct: TestProduct): void {
    const currentExpanded = this.expandedTestProduct();
    if (currentExpanded?.id === testProduct.id) {
      // Collapse currently expanded row
      this.expandedTestProduct.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedTestProduct.set(testProduct);
    }
  }

  isRowExpanded(testProduct: TestProduct): boolean {
    return this.expandedTestProduct()?.id === testProduct.id;
  }
}
