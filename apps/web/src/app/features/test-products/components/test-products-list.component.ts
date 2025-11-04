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

import {
  AegisxNavigationItem,
  AegisxEmptyStateComponent,
  AegisxErrorStateComponent,
  AxDialogService,
  BreadcrumbComponent,
} from '@aegisx/ui';
import {
  ExportOptions,
  ExportService,
  SharedExportComponent,
} from '../../../shared/components/shared-export/shared-export.component';
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
    SharedExportComponent,
    BreadcrumbComponent,
    // Child components
    TestProductsListHeaderComponent,
    TestProductsListFiltersComponent,
    // AegisX UI components
    AegisxEmptyStateComponent,
    AegisxErrorStateComponent,
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
  breadcrumbItems: AegisxNavigationItem[] = [
    {
      id: 'home',
      title: 'Home',
      type: 'basic',
      icon: 'home',
      link: '/',
    },
    {
      id: 'test_products',
      title: 'TestProducts',
      type: 'basic',
      icon: 'menu_book',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'sku',
    'name',
    'barcode',
    'manufacturer',
    'description',
    'long_description',
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
  protected skuInputSignal = signal('');
  protected nameInputSignal = signal('');
  protected barcodeInputSignal = signal('');
  protected manufacturerInputSignal = signal('');
  protected descriptionInputSignal = signal('');
  protected long_descriptionInputSignal = signal('');
  protected specificationsInputSignal = signal('');
  protected statusInputSignal = signal('');
  protected conditionInputSignal = signal('');
  protected availabilityInputSignal = signal('');
  protected created_byInputSignal = signal('');
  protected updated_byInputSignal = signal('');
  protected quantityInputSignal = signal('');
  protected min_quantityInputSignal = signal('');
  protected max_quantityInputSignal = signal('');
  protected priceInputSignal = signal('');
  protected costInputSignal = signal('');
  protected weightInputSignal = signal('');
  protected discount_percentageInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);
  protected is_featuredInputSignal = signal<boolean | undefined>(undefined);
  protected is_taxableInputSignal = signal<boolean | undefined>(undefined);
  protected is_shippableInputSignal = signal<boolean | undefined>(undefined);
  protected allow_backorderInputSignal = signal<boolean | undefined>(undefined);
  protected category_idInputSignal = signal('');
  protected parent_product_idInputSignal = signal('');
  protected supplier_idInputSignal = signal('');

  // Advanced filter ACTIVE signals (sent to API)
  protected skuFilterSignal = signal('');
  protected nameFilterSignal = signal('');
  protected barcodeFilterSignal = signal('');
  protected manufacturerFilterSignal = signal('');
  protected descriptionFilterSignal = signal('');
  protected long_descriptionFilterSignal = signal('');
  protected specificationsFilterSignal = signal('');
  protected statusFilterSignal = signal('');
  protected conditionFilterSignal = signal('');
  protected availabilityFilterSignal = signal('');
  protected created_byFilterSignal = signal('');
  protected updated_byFilterSignal = signal('');
  protected quantityFilterSignal = signal('');
  protected min_quantityFilterSignal = signal('');
  protected max_quantityFilterSignal = signal('');
  protected priceFilterSignal = signal('');
  protected costFilterSignal = signal('');
  protected weightFilterSignal = signal('');
  protected discount_percentageFilterSignal = signal('');
  protected is_activeFilterSignal = signal<boolean | undefined>(undefined);
  protected is_featuredFilterSignal = signal<boolean | undefined>(undefined);
  protected is_taxableFilterSignal = signal<boolean | undefined>(undefined);
  protected is_shippableFilterSignal = signal<boolean | undefined>(undefined);
  protected allow_backorderFilterSignal = signal<boolean | undefined>(
    undefined,
  );
  protected category_idFilterSignal = signal('');
  protected parent_product_idFilterSignal = signal('');
  protected supplier_idFilterSignal = signal('');

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
    sku: this.skuInputSignal(),
    name: this.nameInputSignal(),
    barcode: this.barcodeInputSignal(),
    manufacturer: this.manufacturerInputSignal(),
    description: this.descriptionInputSignal(),
    long_description: this.long_descriptionInputSignal(),
    specifications: this.specificationsInputSignal(),
    status: this.statusInputSignal(),
    condition: this.conditionInputSignal(),
    availability: this.availabilityInputSignal(),
    created_by: this.created_byInputSignal(),
    updated_by: this.updated_byInputSignal(),
    quantity: this.quantityInputSignal(),
    min_quantity: this.min_quantityInputSignal(),
    max_quantity: this.max_quantityInputSignal(),
    price: this.priceInputSignal(),
    cost: this.costInputSignal(),
    weight: this.weightInputSignal(),
    discount_percentage: this.discount_percentageInputSignal(),
    is_active: this.is_activeInputSignal(),
    is_featured: this.is_featuredInputSignal(),
    is_taxable: this.is_taxableInputSignal(),
    is_shippable: this.is_shippableInputSignal(),
    allow_backorder: this.allow_backorderInputSignal(),
    category_id: this.category_idInputSignal(),
    parent_product_id: this.parent_product_idInputSignal(),
    supplier_id: this.supplier_idInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get skuFilter() {
    return this.skuInputSignal();
  }
  set skuFilter(value: string) {
    this.skuInputSignal.set(value);
  }
  get nameFilter() {
    return this.nameInputSignal();
  }
  set nameFilter(value: string) {
    this.nameInputSignal.set(value);
  }
  get barcodeFilter() {
    return this.barcodeInputSignal();
  }
  set barcodeFilter(value: string) {
    this.barcodeInputSignal.set(value);
  }
  get manufacturerFilter() {
    return this.manufacturerInputSignal();
  }
  set manufacturerFilter(value: string) {
    this.manufacturerInputSignal.set(value);
  }
  get descriptionFilter() {
    return this.descriptionInputSignal();
  }
  set descriptionFilter(value: string) {
    this.descriptionInputSignal.set(value);
  }
  get long_descriptionFilter() {
    return this.long_descriptionInputSignal();
  }
  set long_descriptionFilter(value: string) {
    this.long_descriptionInputSignal.set(value);
  }
  get specificationsFilter() {
    return this.specificationsInputSignal();
  }
  set specificationsFilter(value: string) {
    this.specificationsInputSignal.set(value);
  }
  get statusFilter() {
    return this.statusInputSignal();
  }
  set statusFilter(value: string) {
    this.statusInputSignal.set(value);
  }
  get conditionFilter() {
    return this.conditionInputSignal();
  }
  set conditionFilter(value: string) {
    this.conditionInputSignal.set(value);
  }
  get availabilityFilter() {
    return this.availabilityInputSignal();
  }
  set availabilityFilter(value: string) {
    this.availabilityInputSignal.set(value);
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

  get quantityFilter() {
    return this.quantityInputSignal();
  }
  set quantityFilter(value: string) {
    this.quantityInputSignal.set(value);
  }
  get min_quantityFilter() {
    return this.min_quantityInputSignal();
  }
  set min_quantityFilter(value: string) {
    this.min_quantityInputSignal.set(value);
  }
  get max_quantityFilter() {
    return this.max_quantityInputSignal();
  }
  set max_quantityFilter(value: string) {
    this.max_quantityInputSignal.set(value);
  }
  get priceFilter() {
    return this.priceInputSignal();
  }
  set priceFilter(value: string) {
    this.priceInputSignal.set(value);
  }
  get costFilter() {
    return this.costInputSignal();
  }
  set costFilter(value: string) {
    this.costInputSignal.set(value);
  }
  get weightFilter() {
    return this.weightInputSignal();
  }
  set weightFilter(value: string) {
    this.weightInputSignal.set(value);
  }
  get discount_percentageFilter() {
    return this.discount_percentageInputSignal();
  }
  set discount_percentageFilter(value: string) {
    this.discount_percentageInputSignal.set(value);
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
  get is_taxableFilter() {
    return this.is_taxableInputSignal();
  }
  set is_taxableFilter(value: boolean | undefined) {
    this.is_taxableInputSignal.set(value);
  }
  get is_shippableFilter() {
    return this.is_shippableInputSignal();
  }
  set is_shippableFilter(value: boolean | undefined) {
    this.is_shippableInputSignal.set(value);
  }
  get allow_backorderFilter() {
    return this.allow_backorderInputSignal();
  }
  set allow_backorderFilter(value: boolean | undefined) {
    this.allow_backorderInputSignal.set(value);
  }

  get category_idFilter() {
    return this.category_idInputSignal();
  }
  set category_idFilter(value: string) {
    this.category_idInputSignal.set(value);
  }
  get parent_product_idFilter() {
    return this.parent_product_idInputSignal();
  }
  set parent_product_idFilter(value: string) {
    this.parent_product_idInputSignal.set(value);
  }
  get supplier_idFilter() {
    return this.supplier_idInputSignal();
  }
  set supplier_idFilter(value: string) {
    this.supplier_idInputSignal.set(value);
  }

  // Stats from API (should come from dedicated stats endpoint)
  stats = computed(() => ({
    total: this.testProductsService.totalTestProduct(),
    available: 0,
    unavailable: 0,
    recentWeek: 0,
  }));

  // Export configuration
  exportServiceAdapter: ExportService = {
    export: (options: ExportOptions) =>
      this.testProductsService.exportTestProduct(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'sku', label: 'Sku' },
    { key: 'name', label: 'Name' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'description', label: 'Description' },
    { key: 'long_description', label: 'Long Description' },
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

      const sku = this.skuFilterSignal();
      const name = this.nameFilterSignal();
      const barcode = this.barcodeFilterSignal();
      const manufacturer = this.manufacturerFilterSignal();
      const description = this.descriptionFilterSignal();
      const long_description = this.long_descriptionFilterSignal();
      const specifications = this.specificationsFilterSignal();
      const status = this.statusFilterSignal();
      const condition = this.conditionFilterSignal();
      const availability = this.availabilityFilterSignal();
      const created_by = this.created_byFilterSignal();
      const updated_by = this.updated_byFilterSignal();
      const quantity = this.quantityFilterSignal();
      const min_quantity = this.min_quantityFilterSignal();
      const max_quantity = this.max_quantityFilterSignal();
      const price = this.priceFilterSignal();
      const cost = this.costFilterSignal();
      const weight = this.weightFilterSignal();
      const discount_percentage = this.discount_percentageFilterSignal();
      const is_active = this.is_activeFilterSignal();
      const is_featured = this.is_featuredFilterSignal();
      const is_taxable = this.is_taxableFilterSignal();
      const is_shippable = this.is_shippableFilterSignal();
      const allow_backorder = this.allow_backorderFilterSignal();
      const category_id = this.category_idFilterSignal();
      const parent_product_id = this.parent_product_idFilterSignal();
      const supplier_id = this.supplier_idFilterSignal();

      const params: Partial<ListTestProductQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        sku: sku?.trim() || undefined,
        name: name?.trim() || undefined,
        barcode: barcode?.trim() || undefined,
        manufacturer: manufacturer?.trim() || undefined,
        description: description?.trim() || undefined,
        long_description: long_description?.trim() || undefined,
        specifications: specifications?.trim() || undefined,
        status: status?.trim() || undefined,
        condition: condition?.trim() || undefined,
        availability: availability?.trim() || undefined,
        created_by: created_by?.trim() || undefined,
        updated_by: updated_by?.trim() || undefined,
        quantity: quantity?.trim() || undefined,
        min_quantity: min_quantity?.trim() || undefined,
        max_quantity: max_quantity?.trim() || undefined,
        price: price?.trim() || undefined,
        cost: cost?.trim() || undefined,
        weight: weight?.trim() || undefined,
        discount_percentage: discount_percentage?.trim() || undefined,
        is_active: is_active,
        is_featured: is_featured,
        is_taxable: is_taxable,
        is_shippable: is_shippable,
        allow_backorder: allow_backorder,
        category_id: category_id?.trim() || undefined,
        parent_product_id: parent_product_id?.trim() || undefined,
        supplier_id: supplier_id?.trim() || undefined,
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
    this.skuInputSignal.set('');
    this.skuFilterSignal.set('');
    this.nameInputSignal.set('');
    this.nameFilterSignal.set('');
    this.barcodeInputSignal.set('');
    this.barcodeFilterSignal.set('');
    this.manufacturerInputSignal.set('');
    this.manufacturerFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
    this.long_descriptionInputSignal.set('');
    this.long_descriptionFilterSignal.set('');
    this.specificationsInputSignal.set('');
    this.specificationsFilterSignal.set('');
    this.statusInputSignal.set('');
    this.statusFilterSignal.set('');
    this.conditionInputSignal.set('');
    this.conditionFilterSignal.set('');
    this.availabilityInputSignal.set('');
    this.availabilityFilterSignal.set('');
    this.created_byInputSignal.set('');
    this.created_byFilterSignal.set('');
    this.updated_byInputSignal.set('');
    this.updated_byFilterSignal.set('');
    this.quantityInputSignal.set('');
    this.quantityFilterSignal.set('');
    this.min_quantityInputSignal.set('');
    this.min_quantityFilterSignal.set('');
    this.max_quantityInputSignal.set('');
    this.max_quantityFilterSignal.set('');
    this.priceInputSignal.set('');
    this.priceFilterSignal.set('');
    this.costInputSignal.set('');
    this.costFilterSignal.set('');
    this.weightInputSignal.set('');
    this.weightFilterSignal.set('');
    this.discount_percentageInputSignal.set('');
    this.discount_percentageFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.is_featuredInputSignal.set(undefined);
    this.is_featuredFilterSignal.set(undefined);
    this.is_taxableInputSignal.set(undefined);
    this.is_taxableFilterSignal.set(undefined);
    this.is_shippableInputSignal.set(undefined);
    this.is_shippableFilterSignal.set(undefined);
    this.allow_backorderInputSignal.set(undefined);
    this.allow_backorderFilterSignal.set(undefined);
    this.category_idInputSignal.set('');
    this.category_idFilterSignal.set('');
    this.parent_product_idInputSignal.set('');
    this.parent_product_idFilterSignal.set('');
    this.supplier_idInputSignal.set('');
    this.supplier_idFilterSignal.set('');
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.skuFilterSignal.set(this.skuInputSignal().trim());
    this.nameFilterSignal.set(this.nameInputSignal().trim());
    this.barcodeFilterSignal.set(this.barcodeInputSignal().trim());
    this.manufacturerFilterSignal.set(this.manufacturerInputSignal().trim());
    this.descriptionFilterSignal.set(this.descriptionInputSignal().trim());
    this.long_descriptionFilterSignal.set(
      this.long_descriptionInputSignal().trim(),
    );
    this.specificationsFilterSignal.set(
      this.specificationsInputSignal().trim(),
    );
    this.statusFilterSignal.set(this.statusInputSignal().trim());
    this.conditionFilterSignal.set(this.conditionInputSignal().trim());
    this.availabilityFilterSignal.set(this.availabilityInputSignal().trim());
    this.created_byFilterSignal.set(this.created_byInputSignal().trim());
    this.updated_byFilterSignal.set(this.updated_byInputSignal().trim());
    this.quantityFilterSignal.set(this.quantityInputSignal().trim());
    this.min_quantityFilterSignal.set(this.min_quantityInputSignal().trim());
    this.max_quantityFilterSignal.set(this.max_quantityInputSignal().trim());
    this.priceFilterSignal.set(this.priceInputSignal().trim());
    this.costFilterSignal.set(this.costInputSignal().trim());
    this.weightFilterSignal.set(this.weightInputSignal().trim());
    this.discount_percentageFilterSignal.set(
      this.discount_percentageInputSignal().trim(),
    );
    this.is_activeFilterSignal.set(this.is_activeInputSignal());
    this.is_featuredFilterSignal.set(this.is_featuredInputSignal());
    this.is_taxableFilterSignal.set(this.is_taxableInputSignal());
    this.is_shippableFilterSignal.set(this.is_shippableInputSignal());
    this.allow_backorderFilterSignal.set(this.allow_backorderInputSignal());
    this.category_idFilterSignal.set(this.category_idInputSignal().trim());
    this.parent_product_idFilterSignal.set(
      this.parent_product_idInputSignal().trim(),
    );
    this.supplier_idFilterSignal.set(this.supplier_idInputSignal().trim());

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
    this.skuInputSignal.set('');
    this.skuFilterSignal.set('');
    this.nameInputSignal.set('');
    this.nameFilterSignal.set('');
    this.barcodeInputSignal.set('');
    this.barcodeFilterSignal.set('');
    this.manufacturerInputSignal.set('');
    this.manufacturerFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
    this.long_descriptionInputSignal.set('');
    this.long_descriptionFilterSignal.set('');
    this.specificationsInputSignal.set('');
    this.specificationsFilterSignal.set('');
    this.statusInputSignal.set('');
    this.statusFilterSignal.set('');
    this.conditionInputSignal.set('');
    this.conditionFilterSignal.set('');
    this.availabilityInputSignal.set('');
    this.availabilityFilterSignal.set('');
    this.created_byInputSignal.set('');
    this.created_byFilterSignal.set('');
    this.updated_byInputSignal.set('');
    this.updated_byFilterSignal.set('');
    this.quantityInputSignal.set('');
    this.quantityFilterSignal.set('');
    this.min_quantityInputSignal.set('');
    this.min_quantityFilterSignal.set('');
    this.max_quantityInputSignal.set('');
    this.max_quantityFilterSignal.set('');
    this.priceInputSignal.set('');
    this.priceFilterSignal.set('');
    this.costInputSignal.set('');
    this.costFilterSignal.set('');
    this.weightInputSignal.set('');
    this.weightFilterSignal.set('');
    this.discount_percentageInputSignal.set('');
    this.discount_percentageFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.is_featuredInputSignal.set(undefined);
    this.is_featuredFilterSignal.set(undefined);
    this.is_taxableInputSignal.set(undefined);
    this.is_taxableFilterSignal.set(undefined);
    this.is_shippableInputSignal.set(undefined);
    this.is_shippableFilterSignal.set(undefined);
    this.allow_backorderInputSignal.set(undefined);
    this.allow_backorderFilterSignal.set(undefined);
    this.category_idInputSignal.set('');
    this.category_idFilterSignal.set('');
    this.parent_product_idInputSignal.set('');
    this.parent_product_idFilterSignal.set('');
    this.supplier_idInputSignal.set('');
    this.supplier_idFilterSignal.set('');
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.skuFilterSignal().trim() !== '' ||
      this.nameFilterSignal().trim() !== '' ||
      this.barcodeFilterSignal().trim() !== '' ||
      this.manufacturerFilterSignal().trim() !== '' ||
      this.descriptionFilterSignal().trim() !== '' ||
      this.long_descriptionFilterSignal().trim() !== '' ||
      this.specificationsFilterSignal().trim() !== '' ||
      this.statusFilterSignal().trim() !== '' ||
      this.conditionFilterSignal().trim() !== '' ||
      this.availabilityFilterSignal().trim() !== '' ||
      this.created_byFilterSignal().trim() !== '' ||
      this.updated_byFilterSignal().trim() !== '' ||
      this.quantityFilterSignal().trim() !== '' ||
      this.min_quantityFilterSignal().trim() !== '' ||
      this.max_quantityFilterSignal().trim() !== '' ||
      this.priceFilterSignal().trim() !== '' ||
      this.costFilterSignal().trim() !== '' ||
      this.weightFilterSignal().trim() !== '' ||
      this.discount_percentageFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined ||
      this.is_featuredFilterSignal() !== undefined ||
      this.is_taxableFilterSignal() !== undefined ||
      this.is_shippableFilterSignal() !== undefined ||
      this.allow_backorderFilterSignal() !== undefined ||
      (this.category_idFilterSignal()?.trim() || '') !== '' ||
      (this.parent_product_idFilterSignal()?.trim() || '') !== '' ||
      (this.supplier_idFilterSignal()?.trim() || '') !== ''
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.skuFilterSignal().trim()) count++;
    if (this.nameFilterSignal().trim()) count++;
    if (this.barcodeFilterSignal().trim()) count++;
    if (this.manufacturerFilterSignal().trim()) count++;
    if (this.descriptionFilterSignal().trim()) count++;
    if (this.long_descriptionFilterSignal().trim()) count++;
    if (this.specificationsFilterSignal().trim()) count++;
    if (this.statusFilterSignal().trim()) count++;
    if (this.conditionFilterSignal().trim()) count++;
    if (this.availabilityFilterSignal().trim()) count++;
    if (this.created_byFilterSignal().trim()) count++;
    if (this.updated_byFilterSignal().trim()) count++;
    if (this.quantityFilterSignal().trim()) count++;
    if (this.min_quantityFilterSignal().trim()) count++;
    if (this.max_quantityFilterSignal().trim()) count++;
    if (this.priceFilterSignal().trim()) count++;
    if (this.costFilterSignal().trim()) count++;
    if (this.weightFilterSignal().trim()) count++;
    if (this.discount_percentageFilterSignal().trim()) count++;
    if (this.is_activeFilterSignal() !== undefined) count++;
    if (this.is_featuredFilterSignal() !== undefined) count++;
    if (this.is_taxableFilterSignal() !== undefined) count++;
    if (this.is_shippableFilterSignal() !== undefined) count++;
    if (this.allow_backorderFilterSignal() !== undefined) count++;
    if (this.category_idFilterSignal()?.trim()) count++;
    if (this.parent_product_idFilterSignal()?.trim()) count++;
    if (this.supplier_idFilterSignal()?.trim()) count++;
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
      sku: this.skuFilterSignal(),
      name: this.nameFilterSignal(),
      barcode: this.barcodeFilterSignal(),
      manufacturer: this.manufacturerFilterSignal(),
      description: this.descriptionFilterSignal(),
      long_description: this.long_descriptionFilterSignal(),
      specifications: this.specificationsFilterSignal(),
      status: this.statusFilterSignal(),
      condition: this.conditionFilterSignal(),
      availability: this.availabilityFilterSignal(),
      created_by: this.created_byFilterSignal(),
      updated_by: this.updated_byFilterSignal(),
      quantity: this.quantityFilterSignal(),
      min_quantity: this.min_quantityFilterSignal(),
      max_quantity: this.max_quantityFilterSignal(),
      price: this.priceFilterSignal(),
      cost: this.costFilterSignal(),
      weight: this.weightFilterSignal(),
      discount_percentage: this.discount_percentageFilterSignal(),
      is_active: this.is_activeFilterSignal(),
      is_featured: this.is_featuredFilterSignal(),
      is_taxable: this.is_taxableFilterSignal(),
      is_shippable: this.is_shippableFilterSignal(),
      allow_backorder: this.allow_backorderFilterSignal(),
      category_id: this.category_idFilterSignal(),
      parent_product_id: this.parent_product_idFilterSignal(),
      supplier_id: this.supplier_idFilterSignal(),
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
