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
import { ContractItemService } from '../services/contract-items.service';
import {
  ContractItem,
  ListContractItemQuery,
} from '../types/contract-items.types';
import { ContractItemCreateDialogComponent } from './contract-items-create.dialog';
import {
  ContractItemEditDialogComponent,
  ContractItemEditDialogData,
} from './contract-items-edit.dialog';
import {
  ContractItemViewDialogComponent,
  ContractItemViewDialogData,
} from './contract-items-view.dialog';
import { ContractItemImportDialogComponent } from './contract-items-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { ContractItemsListFiltersComponent } from './contract-items-list-filters.component';
import { ContractItemsListHeaderComponent } from './contract-items-list-header.component';

@Component({
  selector: 'app-contract-items-list',
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
    ContractItemsListHeaderComponent,
    ContractItemsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './contract-items-list.component.html',
  styleUrl: './contract-items-list.component.scss',
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
export class ContractItemsListComponent {
  contractItemsService = inject(ContractItemService);
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
      label: 'Contract Items',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'contract_id',
    'generic_id',
    'agreed_unit_price',
    'quantity_limit',
    'quantity_used',
    'notes',
    'actions',
  ];
  dataSource = new MatTableDataSource<ContractItem>([]);
  selection = new SelectionModel<ContractItem>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.contractItemsService
      .contractItemsList()
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
  protected agreed_unit_priceInputSignal = signal('');
  protected quantity_limitInputSignal = signal('');
  protected quantity_usedInputSignal = signal('');

  // Advanced filter ACTIVE signals (sent to API)
  protected notesFilterSignal = signal('');
  protected agreed_unit_priceFilterSignal = signal('');
  protected quantity_limitFilterSignal = signal('');
  protected quantity_usedFilterSignal = signal('');

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
  protected expandedContractItem = signal<ContractItem | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    notes: this.notesInputSignal(),
    agreed_unit_price: this.agreed_unit_priceInputSignal(),
    quantity_limit: this.quantity_limitInputSignal(),
    quantity_used: this.quantity_usedInputSignal(),
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

  get agreed_unit_priceFilter() {
    return this.agreed_unit_priceInputSignal();
  }
  set agreed_unit_priceFilter(value: string) {
    this.agreed_unit_priceInputSignal.set(value);
  }
  get quantity_limitFilter() {
    return this.quantity_limitInputSignal();
  }
  set quantity_limitFilter(value: string) {
    this.quantity_limitInputSignal.set(value);
  }
  get quantity_usedFilter() {
    return this.quantity_usedInputSignal();
  }
  set quantity_usedFilter(value: string) {
    this.quantity_usedInputSignal.set(value);
  }

  // Stats computed from data
  // Note: For accurate stats, consider implementing a dedicated stats endpoint
  stats = computed(() => {
    const list = this.contractItemsService.contractItemsList();
    const total = this.contractItemsService.totalContractItem();

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
      this.contractItemsService.exportContractItem(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'contract_id', label: 'Contract Id' },
    { key: 'generic_id', label: 'Generic Id' },
    { key: 'agreed_unit_price', label: 'Agreed Unit Price' },
    { key: 'quantity_limit', label: 'Quantity Limit' },
    { key: 'quantity_used', label: 'Quantity Used' },
    { key: 'notes', label: 'Notes' },
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

  // --- Effect: reload contract_items on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.contractItemsService.loading();

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
      const agreed_unit_price = this.agreed_unit_priceFilterSignal();
      const quantity_limit = this.quantity_limitFilterSignal();
      const quantity_used = this.quantity_usedFilterSignal();

      const params: Partial<ListContractItemQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        notes: notes?.trim() || undefined,
        agreed_unit_price: agreed_unit_price?.trim() || undefined,
        quantity_limit: quantity_limit?.trim() || undefined,
        quantity_used: quantity_used?.trim() || undefined,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.contractItemsService.loadContractItemList(params);
      this.dataSource.data = this.contractItemsService.contractItemsList();
      if (this.paginator) {
        this.paginator.length = this.contractItemsService.totalContractItem();
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
    this.agreed_unit_priceInputSignal.set('');
    this.agreed_unit_priceFilterSignal.set('');
    this.quantity_limitInputSignal.set('');
    this.quantity_limitFilterSignal.set('');
    this.quantity_usedInputSignal.set('');
    this.quantity_usedFilterSignal.set('');
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.notesFilterSignal.set(this.notesInputSignal().trim());
    this.agreed_unit_priceFilterSignal.set(
      this.agreed_unit_priceInputSignal().trim(),
    );
    this.quantity_limitFilterSignal.set(
      this.quantity_limitInputSignal().trim(),
    );
    this.quantity_usedFilterSignal.set(this.quantity_usedInputSignal().trim());

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
    this.agreed_unit_priceInputSignal.set('');
    this.agreed_unit_priceFilterSignal.set('');
    this.quantity_limitInputSignal.set('');
    this.quantity_limitFilterSignal.set('');
    this.quantity_usedInputSignal.set('');
    this.quantity_usedFilterSignal.set('');
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.notesFilterSignal().trim() !== '' ||
      this.agreed_unit_priceFilterSignal().trim() !== '' ||
      this.quantity_limitFilterSignal().trim() !== '' ||
      this.quantity_usedFilterSignal().trim() !== ''
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.notesFilterSignal().trim()) count++;
    if (this.agreed_unit_priceFilterSignal().trim()) count++;
    if (this.quantity_limitFilterSignal().trim()) count++;
    if (this.quantity_usedFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(ContractItemCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(ContractItemImportDialogComponent, {
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

  onViewContractItem(contractItem: ContractItem) {
    const dialogRef = this.dialog.open(ContractItemViewDialogComponent, {
      width: '600px',
      data: { contractItems: contractItem } as ContractItemViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditContractItem(result.data);
      }
    });
  }

  onEditContractItem(contractItem: ContractItem) {
    const dialogRef = this.dialog.open(ContractItemEditDialogComponent, {
      width: '600px',
      data: { contractItems: contractItem } as ContractItemEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteContractItem(contractItem: ContractItem) {
    const itemName =
      (contractItem as any).name ||
      (contractItem as any).title ||
      'contractitem';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.contractItemsService.deleteContractItem(contractItem.id);
          this.snackBar.open('ContractItem deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete contractitem', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'contract_items')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((contractItem) =>
              this.contractItemsService.deleteContractItem(contractItem.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} contractitem(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some contract_items',
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
      agreed_unit_price: this.agreed_unit_priceFilterSignal(),
      quantity_limit: this.quantity_limitFilterSignal(),
      quantity_used: this.quantity_usedFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(contractItem: ContractItem): void {
    const currentExpanded = this.expandedContractItem();
    if (currentExpanded?.id === contractItem.id) {
      // Collapse currently expanded row
      this.expandedContractItem.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedContractItem.set(contractItem);
    }
  }

  isRowExpanded(contractItem: ContractItem): boolean {
    return this.expandedContractItem()?.id === contractItem.id;
  }
}
