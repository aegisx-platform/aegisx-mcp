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
import { ContractService } from '../services/contracts.service';
import { Contract, ListContractQuery } from '../types/contracts.types';
import { ContractCreateDialogComponent } from './contracts-create.dialog';
import {
  ContractEditDialogComponent,
  ContractEditDialogData,
} from './contracts-edit.dialog';
import {
  ContractViewDialogComponent,
  ContractViewDialogData,
} from './contracts-view.dialog';
import { ContractImportDialogComponent } from './contracts-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { ContractsListFiltersComponent } from './contracts-list-filters.component';
import { ContractsListHeaderComponent } from './contracts-list-header.component';

@Component({
  selector: 'app-contracts-list',
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
    ContractsListHeaderComponent,
    ContractsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './contracts-list.component.html',
  styleUrl: './contracts-list.component.scss',
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
export class ContractsListComponent {
  contractsService = inject(ContractService);
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
      label: 'Contracts',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'contract_number',
    'contract_type',
    'vendor_id',
    'start_date',
    'end_date',
    'total_value',
    'actions',
  ];
  dataSource = new MatTableDataSource<Contract>([]);
  selection = new SelectionModel<Contract>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.contractsService
      .contractsList()
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
  protected contract_numberInputSignal = signal('');
  protected fiscal_yearInputSignal = signal('');
  protected egp_numberInputSignal = signal('');
  protected project_numberInputSignal = signal('');
  protected total_valueInputSignal = signal('');
  protected remaining_valueInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected contract_numberFilterSignal = signal('');
  protected fiscal_yearFilterSignal = signal('');
  protected egp_numberFilterSignal = signal('');
  protected project_numberFilterSignal = signal('');
  protected total_valueFilterSignal = signal('');
  protected remaining_valueFilterSignal = signal('');
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
  protected expandedContract = signal<Contract | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    contract_number: this.contract_numberInputSignal(),
    fiscal_year: this.fiscal_yearInputSignal(),
    egp_number: this.egp_numberInputSignal(),
    project_number: this.project_numberInputSignal(),
    total_value: this.total_valueInputSignal(),
    remaining_value: this.remaining_valueInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get contract_numberFilter() {
    return this.contract_numberInputSignal();
  }
  set contract_numberFilter(value: string) {
    this.contract_numberInputSignal.set(value);
  }
  get fiscal_yearFilter() {
    return this.fiscal_yearInputSignal();
  }
  set fiscal_yearFilter(value: string) {
    this.fiscal_yearInputSignal.set(value);
  }
  get egp_numberFilter() {
    return this.egp_numberInputSignal();
  }
  set egp_numberFilter(value: string) {
    this.egp_numberInputSignal.set(value);
  }
  get project_numberFilter() {
    return this.project_numberInputSignal();
  }
  set project_numberFilter(value: string) {
    this.project_numberInputSignal.set(value);
  }

  get total_valueFilter() {
    return this.total_valueInputSignal();
  }
  set total_valueFilter(value: string) {
    this.total_valueInputSignal.set(value);
  }
  get remaining_valueFilter() {
    return this.remaining_valueInputSignal();
  }
  set remaining_valueFilter(value: string) {
    this.remaining_valueInputSignal.set(value);
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
    const list = this.contractsService.contractsList();
    const total = this.contractsService.totalContract();

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
      this.contractsService.exportContract(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'contract_number', label: 'Contract Number' },
    { key: 'contract_type', label: 'Contract Type' },
    { key: 'vendor_id', label: 'Vendor Id' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'total_value', label: 'Total Value' },
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

  // --- Effect: reload contracts on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.contractsService.loading();

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

      const contract_number = this.contract_numberFilterSignal();
      const fiscal_year = this.fiscal_yearFilterSignal();
      const egp_number = this.egp_numberFilterSignal();
      const project_number = this.project_numberFilterSignal();
      const total_value = this.total_valueFilterSignal();
      const remaining_value = this.remaining_valueFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListContractQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        contract_number: contract_number?.trim() || undefined,
        fiscal_year: fiscal_year?.trim() || undefined,
        egp_number: egp_number?.trim() || undefined,
        project_number: project_number?.trim() || undefined,
        total_value: total_value?.trim() || undefined,
        remaining_value: remaining_value?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.contractsService.loadContractList(params);
      this.dataSource.data = this.contractsService.contractsList();
      if (this.paginator) {
        this.paginator.length = this.contractsService.totalContract();
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
    this.contract_numberInputSignal.set('');
    this.contract_numberFilterSignal.set('');
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.egp_numberInputSignal.set('');
    this.egp_numberFilterSignal.set('');
    this.project_numberInputSignal.set('');
    this.project_numberFilterSignal.set('');
    this.total_valueInputSignal.set('');
    this.total_valueFilterSignal.set('');
    this.remaining_valueInputSignal.set('');
    this.remaining_valueFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.contract_numberFilterSignal.set(
      this.contract_numberInputSignal().trim(),
    );
    this.fiscal_yearFilterSignal.set(this.fiscal_yearInputSignal().trim());
    this.egp_numberFilterSignal.set(this.egp_numberInputSignal().trim());
    this.project_numberFilterSignal.set(
      this.project_numberInputSignal().trim(),
    );
    this.total_valueFilterSignal.set(this.total_valueInputSignal().trim());
    this.remaining_valueFilterSignal.set(
      this.remaining_valueInputSignal().trim(),
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
    this.contract_numberInputSignal.set('');
    this.contract_numberFilterSignal.set('');
    this.fiscal_yearInputSignal.set('');
    this.fiscal_yearFilterSignal.set('');
    this.egp_numberInputSignal.set('');
    this.egp_numberFilterSignal.set('');
    this.project_numberInputSignal.set('');
    this.project_numberFilterSignal.set('');
    this.total_valueInputSignal.set('');
    this.total_valueFilterSignal.set('');
    this.remaining_valueInputSignal.set('');
    this.remaining_valueFilterSignal.set('');
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
      this.contract_numberFilterSignal().trim() !== '' ||
      this.fiscal_yearFilterSignal().trim() !== '' ||
      this.egp_numberFilterSignal().trim() !== '' ||
      this.project_numberFilterSignal().trim() !== '' ||
      this.total_valueFilterSignal().trim() !== '' ||
      this.remaining_valueFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.contract_numberFilterSignal().trim()) count++;
    if (this.fiscal_yearFilterSignal().trim()) count++;
    if (this.egp_numberFilterSignal().trim()) count++;
    if (this.project_numberFilterSignal().trim()) count++;
    if (this.total_valueFilterSignal().trim()) count++;
    if (this.remaining_valueFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(ContractCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(ContractImportDialogComponent, {
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

  onViewContract(contract: Contract) {
    const dialogRef = this.dialog.open(ContractViewDialogComponent, {
      width: '600px',
      data: { contracts: contract } as ContractViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditContract(result.data);
      }
    });
  }

  onEditContract(contract: Contract) {
    const dialogRef = this.dialog.open(ContractEditDialogComponent, {
      width: '600px',
      data: { contracts: contract } as ContractEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteContract(contract: Contract) {
    const itemName =
      (contract as any).name || (contract as any).title || 'contract';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.contractsService.deleteContract(contract.id);
          this.snackBar.open('Contract deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete contract', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'contracts')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((contract) =>
              this.contractsService.deleteContract(contract.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} contract(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some contracts', 'Close', {
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
      contract_number: this.contract_numberFilterSignal(),
      fiscal_year: this.fiscal_yearFilterSignal(),
      egp_number: this.egp_numberFilterSignal(),
      project_number: this.project_numberFilterSignal(),
      total_value: this.total_valueFilterSignal(),
      remaining_value: this.remaining_valueFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(contract: Contract): void {
    const currentExpanded = this.expandedContract();
    if (currentExpanded?.id === contract.id) {
      // Collapse currently expanded row
      this.expandedContract.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedContract.set(contract);
    }
  }

  isRowExpanded(contract: Contract): boolean {
    return this.expandedContract()?.id === contract.id;
  }
}
