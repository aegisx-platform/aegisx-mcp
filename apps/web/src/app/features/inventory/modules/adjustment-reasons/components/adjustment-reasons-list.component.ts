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
import { AdjustmentReasonService } from '../services/adjustment-reasons.service';
import {
  AdjustmentReason,
  ListAdjustmentReasonQuery,
} from '../types/adjustment-reasons.types';
import { AdjustmentReasonCreateDialogComponent } from './adjustment-reasons-create.dialog';
import {
  AdjustmentReasonEditDialogComponent,
  AdjustmentReasonEditDialogData,
} from './adjustment-reasons-edit.dialog';
import {
  AdjustmentReasonViewDialogComponent,
  AdjustmentReasonViewDialogData,
} from './adjustment-reasons-view.dialog';
import { AdjustmentReasonImportDialogComponent } from './adjustment-reasons-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { AdjustmentReasonsListFiltersComponent } from './adjustment-reasons-list-filters.component';
import { AdjustmentReasonsListHeaderComponent } from './adjustment-reasons-list-header.component';

@Component({
  selector: 'app-adjustment-reasons-list',
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
    AdjustmentReasonsListHeaderComponent,
    AdjustmentReasonsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './adjustment-reasons-list.component.html',
  styleUrl: './adjustment-reasons-list.component.scss',
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
export class AdjustmentReasonsListComponent {
  adjustmentReasonsService = inject(AdjustmentReasonService);
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
      label: 'Adjustment Reasons',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'reason_code',
    'reason_name',
    'adjustment_type',
    'requires_approval',
    'description',
    'is_active',
    'actions',
  ];
  dataSource = new MatTableDataSource<AdjustmentReason>([]);
  selection = new SelectionModel<AdjustmentReason>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.adjustmentReasonsService
      .adjustmentReasonsList()
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
  protected reason_codeInputSignal = signal('');
  protected reason_nameInputSignal = signal('');
  protected descriptionInputSignal = signal('');
  protected requires_approvalInputSignal = signal<boolean | undefined>(
    undefined,
  );
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected reason_codeFilterSignal = signal('');
  protected reason_nameFilterSignal = signal('');
  protected descriptionFilterSignal = signal('');
  protected requires_approvalFilterSignal = signal<boolean | undefined>(
    undefined,
  );
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
  protected expandedAdjustmentReason = signal<AdjustmentReason | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    reason_code: this.reason_codeInputSignal(),
    reason_name: this.reason_nameInputSignal(),
    description: this.descriptionInputSignal(),
    requires_approval: this.requires_approvalInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get reason_codeFilter() {
    return this.reason_codeInputSignal();
  }
  set reason_codeFilter(value: string) {
    this.reason_codeInputSignal.set(value);
  }
  get reason_nameFilter() {
    return this.reason_nameInputSignal();
  }
  set reason_nameFilter(value: string) {
    this.reason_nameInputSignal.set(value);
  }
  get descriptionFilter() {
    return this.descriptionInputSignal();
  }
  set descriptionFilter(value: string) {
    this.descriptionInputSignal.set(value);
  }

  get requires_approvalFilter() {
    return this.requires_approvalInputSignal();
  }
  set requires_approvalFilter(value: boolean | undefined) {
    this.requires_approvalInputSignal.set(value);
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
    const list = this.adjustmentReasonsService.adjustmentReasonsList();
    const total = this.adjustmentReasonsService.totalAdjustmentReason();

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
      this.adjustmentReasonsService.exportAdjustmentReason(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'reason_code', label: 'Reason Code' },
    { key: 'reason_name', label: 'Reason Name' },
    { key: 'adjustment_type', label: 'Adjustment Type' },
    { key: 'requires_approval', label: 'Requires Approval' },
    { key: 'description', label: 'Description' },
    { key: 'is_active', label: 'Is Active' },
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

  // --- Effect: reload adjustment_reasons on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.adjustmentReasonsService.loading();

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

      const reason_code = this.reason_codeFilterSignal();
      const reason_name = this.reason_nameFilterSignal();
      const description = this.descriptionFilterSignal();
      const requires_approval = this.requires_approvalFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListAdjustmentReasonQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        reason_code: reason_code?.trim() || undefined,
        reason_name: reason_name?.trim() || undefined,
        description: description?.trim() || undefined,
        requires_approval: requires_approval,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.adjustmentReasonsService.loadAdjustmentReasonList(params);
      this.dataSource.data =
        this.adjustmentReasonsService.adjustmentReasonsList();
      if (this.paginator) {
        this.paginator.length =
          this.adjustmentReasonsService.totalAdjustmentReason();
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
    this.reason_codeInputSignal.set('');
    this.reason_codeFilterSignal.set('');
    this.reason_nameInputSignal.set('');
    this.reason_nameFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
    this.requires_approvalInputSignal.set(undefined);
    this.requires_approvalFilterSignal.set(undefined);
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.reason_codeFilterSignal.set(this.reason_codeInputSignal().trim());
    this.reason_nameFilterSignal.set(this.reason_nameInputSignal().trim());
    this.descriptionFilterSignal.set(this.descriptionInputSignal().trim());
    this.requires_approvalFilterSignal.set(this.requires_approvalInputSignal());
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
      this.requires_approvalInputSignal.set(undefined);
      this.requires_approvalFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.requires_approvalInputSignal.set(true);
      this.requires_approvalFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.requires_approvalInputSignal.set(false);
      this.requires_approvalFilterSignal.set(false);
    }
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.reason_codeInputSignal.set('');
    this.reason_codeFilterSignal.set('');
    this.reason_nameInputSignal.set('');
    this.reason_nameFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
    this.requires_approvalInputSignal.set(undefined);
    this.requires_approvalFilterSignal.set(undefined);
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
      this.reason_codeFilterSignal().trim() !== '' ||
      this.reason_nameFilterSignal().trim() !== '' ||
      this.descriptionFilterSignal().trim() !== '' ||
      this.requires_approvalFilterSignal() !== undefined ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.reason_codeFilterSignal().trim()) count++;
    if (this.reason_nameFilterSignal().trim()) count++;
    if (this.descriptionFilterSignal().trim()) count++;
    if (this.requires_approvalFilterSignal() !== undefined) count++;
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
    const dialogRef = this.dialog.open(AdjustmentReasonCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(AdjustmentReasonImportDialogComponent, {
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

  onViewAdjustmentReason(adjustmentReason: AdjustmentReason) {
    const dialogRef = this.dialog.open(AdjustmentReasonViewDialogComponent, {
      width: '600px',
      data: {
        adjustmentReasons: adjustmentReason,
      } as AdjustmentReasonViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditAdjustmentReason(result.data);
      }
    });
  }

  onEditAdjustmentReason(adjustmentReason: AdjustmentReason) {
    const dialogRef = this.dialog.open(AdjustmentReasonEditDialogComponent, {
      width: '600px',
      data: {
        adjustmentReasons: adjustmentReason,
      } as AdjustmentReasonEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteAdjustmentReason(adjustmentReason: AdjustmentReason) {
    const itemName =
      (adjustmentReason as any).name ||
      (adjustmentReason as any).title ||
      'adjustmentreason';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.adjustmentReasonsService.deleteAdjustmentReason(
            adjustmentReason.id,
          );
          this.snackBar.open('AdjustmentReason deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete adjustmentreason', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'adjustment_reasons')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (adjustmentReason) =>
                this.adjustmentReasonsService.deleteAdjustmentReason(
                  adjustmentReason.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} adjustmentreason(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some adjustment_reasons',
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
      reason_code: this.reason_codeFilterSignal(),
      reason_name: this.reason_nameFilterSignal(),
      description: this.descriptionFilterSignal(),
      requires_approval: this.requires_approvalFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(adjustmentReason: AdjustmentReason): void {
    const currentExpanded = this.expandedAdjustmentReason();
    if (currentExpanded?.id === adjustmentReason.id) {
      // Collapse currently expanded row
      this.expandedAdjustmentReason.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedAdjustmentReason.set(adjustmentReason);
    }
  }

  isRowExpanded(adjustmentReason: AdjustmentReason): boolean {
    return this.expandedAdjustmentReason()?.id === adjustmentReason.id;
  }
}
