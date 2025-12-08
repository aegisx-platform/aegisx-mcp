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
import { DrugPackRatioService } from '../services/drug-pack-ratios.service';
import {
  DrugPackRatio,
  ListDrugPackRatioQuery,
} from '../types/drug-pack-ratios.types';
import { DrugPackRatioCreateDialogComponent } from './drug-pack-ratios-create.dialog';
import {
  DrugPackRatioEditDialogComponent,
  DrugPackRatioEditDialogData,
} from './drug-pack-ratios-edit.dialog';
import {
  DrugPackRatioViewDialogComponent,
  DrugPackRatioViewDialogData,
} from './drug-pack-ratios-view.dialog';
import { DrugPackRatioImportDialogComponent } from './drug-pack-ratios-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { DrugPackRatiosListFiltersComponent } from './drug-pack-ratios-list-filters.component';
import { DrugPackRatiosListHeaderComponent } from './drug-pack-ratios-list-header.component';

@Component({
  selector: 'app-drug-pack-ratios-list',
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
    DrugPackRatiosListHeaderComponent,
    DrugPackRatiosListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './drug-pack-ratios-list.component.html',
  styleUrl: './drug-pack-ratios-list.component.scss',
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
export class DrugPackRatiosListComponent {
  drugPackRatiosService = inject(DrugPackRatioService);
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
      label: 'Master Data',
      url: '/inventory/master-data',
    },
    {
      label: 'Drug Pack Ratios',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'drug_id',
    'company_id',
    'pack_size',
    'pack_unit',
    'unit_per_pack',
    'pack_price',
    'actions',
  ];
  dataSource = new MatTableDataSource<DrugPackRatio>([]);
  selection = new SelectionModel<DrugPackRatio>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.drugPackRatiosService
      .drugPackRatiosList()
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
  protected pack_unitInputSignal = signal('');
  protected pack_sizeInputSignal = signal('');
  protected unit_per_packInputSignal = signal('');
  protected pack_priceInputSignal = signal('');
  protected is_defaultInputSignal = signal<boolean | undefined>(undefined);
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected pack_unitFilterSignal = signal('');
  protected pack_sizeFilterSignal = signal('');
  protected unit_per_packFilterSignal = signal('');
  protected pack_priceFilterSignal = signal('');
  protected is_defaultFilterSignal = signal<boolean | undefined>(undefined);
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
  protected expandedDrugPackRatio = signal<DrugPackRatio | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    pack_unit: this.pack_unitInputSignal(),
    pack_size: this.pack_sizeInputSignal(),
    unit_per_pack: this.unit_per_packInputSignal(),
    pack_price: this.pack_priceInputSignal(),
    is_default: this.is_defaultInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get pack_unitFilter() {
    return this.pack_unitInputSignal();
  }
  set pack_unitFilter(value: string) {
    this.pack_unitInputSignal.set(value);
  }

  get pack_sizeFilter() {
    return this.pack_sizeInputSignal();
  }
  set pack_sizeFilter(value: string) {
    this.pack_sizeInputSignal.set(value);
  }
  get unit_per_packFilter() {
    return this.unit_per_packInputSignal();
  }
  set unit_per_packFilter(value: string) {
    this.unit_per_packInputSignal.set(value);
  }
  get pack_priceFilter() {
    return this.pack_priceInputSignal();
  }
  set pack_priceFilter(value: string) {
    this.pack_priceInputSignal.set(value);
  }

  get is_defaultFilter() {
    return this.is_defaultInputSignal();
  }
  set is_defaultFilter(value: boolean | undefined) {
    this.is_defaultInputSignal.set(value);
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
    const list = this.drugPackRatiosService.drugPackRatiosList();
    const total = this.drugPackRatiosService.totalDrugPackRatio();

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
      this.drugPackRatiosService.exportDrugPackRatio(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'drug_id', label: 'Drug Id' },
    { key: 'company_id', label: 'Company Id' },
    { key: 'pack_size', label: 'Pack Size' },
    { key: 'pack_unit', label: 'Pack Unit' },
    { key: 'unit_per_pack', label: 'Unit Per Pack' },
    { key: 'pack_price', label: 'Pack Price' },
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

  // --- Effect: reload drug_pack_ratios on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.drugPackRatiosService.loading();

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

      const pack_unit = this.pack_unitFilterSignal();
      const pack_size = this.pack_sizeFilterSignal();
      const unit_per_pack = this.unit_per_packFilterSignal();
      const pack_price = this.pack_priceFilterSignal();
      const is_default = this.is_defaultFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListDrugPackRatioQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        pack_unit: pack_unit?.trim() || undefined,
        pack_size: pack_size?.trim() || undefined,
        unit_per_pack: unit_per_pack?.trim() || undefined,
        pack_price: pack_price?.trim() || undefined,
        is_default: is_default,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.drugPackRatiosService.loadDrugPackRatioList(params);
      this.dataSource.data = this.drugPackRatiosService.drugPackRatiosList();
      if (this.paginator) {
        this.paginator.length = this.drugPackRatiosService.totalDrugPackRatio();
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
    this.pack_unitInputSignal.set('');
    this.pack_unitFilterSignal.set('');
    this.pack_sizeInputSignal.set('');
    this.pack_sizeFilterSignal.set('');
    this.unit_per_packInputSignal.set('');
    this.unit_per_packFilterSignal.set('');
    this.pack_priceInputSignal.set('');
    this.pack_priceFilterSignal.set('');
    this.is_defaultInputSignal.set(undefined);
    this.is_defaultFilterSignal.set(undefined);
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.pack_unitFilterSignal.set(this.pack_unitInputSignal().trim());
    this.pack_sizeFilterSignal.set(this.pack_sizeInputSignal().trim());
    this.unit_per_packFilterSignal.set(this.unit_per_packInputSignal().trim());
    this.pack_priceFilterSignal.set(this.pack_priceInputSignal().trim());
    this.is_defaultFilterSignal.set(this.is_defaultInputSignal());
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
      this.is_defaultInputSignal.set(undefined);
      this.is_defaultFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.is_defaultInputSignal.set(true);
      this.is_defaultFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.is_defaultInputSignal.set(false);
      this.is_defaultFilterSignal.set(false);
    }
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.pack_unitInputSignal.set('');
    this.pack_unitFilterSignal.set('');
    this.pack_sizeInputSignal.set('');
    this.pack_sizeFilterSignal.set('');
    this.unit_per_packInputSignal.set('');
    this.unit_per_packFilterSignal.set('');
    this.pack_priceInputSignal.set('');
    this.pack_priceFilterSignal.set('');
    this.is_defaultInputSignal.set(undefined);
    this.is_defaultFilterSignal.set(undefined);
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
      this.pack_unitFilterSignal().trim() !== '' ||
      this.pack_sizeFilterSignal().trim() !== '' ||
      this.unit_per_packFilterSignal().trim() !== '' ||
      this.pack_priceFilterSignal().trim() !== '' ||
      this.is_defaultFilterSignal() !== undefined ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.pack_unitFilterSignal().trim()) count++;
    if (this.pack_sizeFilterSignal().trim()) count++;
    if (this.unit_per_packFilterSignal().trim()) count++;
    if (this.pack_priceFilterSignal().trim()) count++;
    if (this.is_defaultFilterSignal() !== undefined) count++;
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
    const dialogRef = this.dialog.open(DrugPackRatioCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(DrugPackRatioImportDialogComponent, {
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

  onViewDrugPackRatio(drugPackRatio: DrugPackRatio) {
    const dialogRef = this.dialog.open(DrugPackRatioViewDialogComponent, {
      width: '600px',
      data: { drugPackRatios: drugPackRatio } as DrugPackRatioViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditDrugPackRatio(result.data);
      }
    });
  }

  onEditDrugPackRatio(drugPackRatio: DrugPackRatio) {
    const dialogRef = this.dialog.open(DrugPackRatioEditDialogComponent, {
      width: '600px',
      data: { drugPackRatios: drugPackRatio } as DrugPackRatioEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteDrugPackRatio(drugPackRatio: DrugPackRatio) {
    const itemName =
      (drugPackRatio as any).name ||
      (drugPackRatio as any).title ||
      'drugpackratio';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.drugPackRatiosService.deleteDrugPackRatio(
            drugPackRatio.id,
          );
          this.snackBar.open('DrugPackRatio deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete drugpackratio', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'drug_pack_ratios')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (drugPackRatio) =>
                this.drugPackRatiosService.deleteDrugPackRatio(
                  drugPackRatio.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} drugpackratio(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some drug_pack_ratios',
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
      pack_unit: this.pack_unitFilterSignal(),
      pack_size: this.pack_sizeFilterSignal(),
      unit_per_pack: this.unit_per_packFilterSignal(),
      pack_price: this.pack_priceFilterSignal(),
      is_default: this.is_defaultFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(drugPackRatio: DrugPackRatio): void {
    const currentExpanded = this.expandedDrugPackRatio();
    if (currentExpanded?.id === drugPackRatio.id) {
      // Collapse currently expanded row
      this.expandedDrugPackRatio.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedDrugPackRatio.set(drugPackRatio);
    }
  }

  isRowExpanded(drugPackRatio: DrugPackRatio): boolean {
    return this.expandedDrugPackRatio()?.id === drugPackRatio.id;
  }
}
