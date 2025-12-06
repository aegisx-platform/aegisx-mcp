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
import { DrugService } from '../services/drugs.service';
import { Drug, ListDrugQuery } from '../types/drugs.types';
import { DrugCreateDialogComponent } from './drugs-create.dialog';
import {
  DrugEditDialogComponent,
  DrugEditDialogData,
} from './drugs-edit.dialog';
import {
  DrugViewDialogComponent,
  DrugViewDialogData,
} from './drugs-view.dialog';

// Import child components
import { DrugsListFiltersComponent } from './drugs-list-filters.component';
import { DrugsListHeaderComponent } from './drugs-list-header.component';

@Component({
  selector: 'app-drugs-list',
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
    DrugsListHeaderComponent,
    DrugsListFiltersComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './drugs-list.component.html',
  styleUrl: './drugs-list.component.scss',
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
export class DrugsListComponent {
  drugsService = inject(DrugService);
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
      label: 'Drugs',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'drug_code',
    'trade_name',
    'generic_id',
    'manufacturer_id',
    'tmt_tpu_id',
    'nlem_status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Drug>([]);
  selection = new SelectionModel<Drug>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.drugsService
      .drugsList()
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
  protected drug_codeInputSignal = signal('');
  protected trade_nameInputSignal = signal('');
  protected package_unitInputSignal = signal('');
  protected unit_priceInputSignal = signal('');
  protected package_sizeInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected drug_codeFilterSignal = signal('');
  protected trade_nameFilterSignal = signal('');
  protected package_unitFilterSignal = signal('');
  protected unit_priceFilterSignal = signal('');
  protected package_sizeFilterSignal = signal('');
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
  protected expandedDrug = signal<Drug | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    drug_code: this.drug_codeInputSignal(),
    trade_name: this.trade_nameInputSignal(),
    package_unit: this.package_unitInputSignal(),
    unit_price: this.unit_priceInputSignal(),
    package_size: this.package_sizeInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get drug_codeFilter() {
    return this.drug_codeInputSignal();
  }
  set drug_codeFilter(value: string) {
    this.drug_codeInputSignal.set(value);
  }
  get trade_nameFilter() {
    return this.trade_nameInputSignal();
  }
  set trade_nameFilter(value: string) {
    this.trade_nameInputSignal.set(value);
  }
  get package_unitFilter() {
    return this.package_unitInputSignal();
  }
  set package_unitFilter(value: string) {
    this.package_unitInputSignal.set(value);
  }

  get unit_priceFilter() {
    return this.unit_priceInputSignal();
  }
  set unit_priceFilter(value: string) {
    this.unit_priceInputSignal.set(value);
  }
  get package_sizeFilter() {
    return this.package_sizeInputSignal();
  }
  set package_sizeFilter(value: string) {
    this.package_sizeInputSignal.set(value);
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
    const list = this.drugsService.drugsList();
    const total = this.drugsService.totalDrug();

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

  // --- Effect: reload drugs on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.drugsService.loading();

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

      const drug_code = this.drug_codeFilterSignal();
      const trade_name = this.trade_nameFilterSignal();
      const package_unit = this.package_unitFilterSignal();
      const unit_price = this.unit_priceFilterSignal();
      const package_size = this.package_sizeFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListDrugQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        drug_code: drug_code?.trim() || undefined,
        trade_name: trade_name?.trim() || undefined,
        package_unit: package_unit?.trim() || undefined,
        unit_price: unit_price?.trim() || undefined,
        package_size: package_size?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.drugsService.loadDrugList(params);
      this.dataSource.data = this.drugsService.drugsList();
      if (this.paginator) {
        this.paginator.length = this.drugsService.totalDrug();
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
    this.drug_codeInputSignal.set('');
    this.drug_codeFilterSignal.set('');
    this.trade_nameInputSignal.set('');
    this.trade_nameFilterSignal.set('');
    this.package_unitInputSignal.set('');
    this.package_unitFilterSignal.set('');
    this.unit_priceInputSignal.set('');
    this.unit_priceFilterSignal.set('');
    this.package_sizeInputSignal.set('');
    this.package_sizeFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.drug_codeFilterSignal.set(this.drug_codeInputSignal().trim());
    this.trade_nameFilterSignal.set(this.trade_nameInputSignal().trim());
    this.package_unitFilterSignal.set(this.package_unitInputSignal().trim());
    this.unit_priceFilterSignal.set(this.unit_priceInputSignal().trim());
    this.package_sizeFilterSignal.set(this.package_sizeInputSignal().trim());
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
    this.drug_codeInputSignal.set('');
    this.drug_codeFilterSignal.set('');
    this.trade_nameInputSignal.set('');
    this.trade_nameFilterSignal.set('');
    this.package_unitInputSignal.set('');
    this.package_unitFilterSignal.set('');
    this.unit_priceInputSignal.set('');
    this.unit_priceFilterSignal.set('');
    this.package_sizeInputSignal.set('');
    this.package_sizeFilterSignal.set('');
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
      this.drug_codeFilterSignal().trim() !== '' ||
      this.trade_nameFilterSignal().trim() !== '' ||
      this.package_unitFilterSignal().trim() !== '' ||
      this.unit_priceFilterSignal().trim() !== '' ||
      this.package_sizeFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.drug_codeFilterSignal().trim()) count++;
    if (this.trade_nameFilterSignal().trim()) count++;
    if (this.package_unitFilterSignal().trim()) count++;
    if (this.unit_priceFilterSignal().trim()) count++;
    if (this.package_sizeFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(DrugCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewDrug(drug: Drug) {
    const dialogRef = this.dialog.open(DrugViewDialogComponent, {
      width: '600px',
      data: { drugs: drug } as DrugViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditDrug(result.data);
      }
    });
  }

  onEditDrug(drug: Drug) {
    const dialogRef = this.dialog.open(DrugEditDialogComponent, {
      width: '600px',
      data: { drugs: drug } as DrugEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteDrug(drug: Drug) {
    const itemName = (drug as any).name || (drug as any).title || 'drug';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.drugsService.deleteDrug(drug.id);
          this.snackBar.open('Drug deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete drug', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'drugs')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((drug) =>
              this.drugsService.deleteDrug(drug.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} drug(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some drugs', 'Close', {
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
      drug_code: this.drug_codeFilterSignal(),
      trade_name: this.trade_nameFilterSignal(),
      package_unit: this.package_unitFilterSignal(),
      unit_price: this.unit_priceFilterSignal(),
      package_size: this.package_sizeFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(drug: Drug): void {
    const currentExpanded = this.expandedDrug();
    if (currentExpanded?.id === drug.id) {
      // Collapse currently expanded row
      this.expandedDrug.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedDrug.set(drug);
    }
  }

  isRowExpanded(drug: Drug): boolean {
    return this.expandedDrug()?.id === drug.id;
  }
}
