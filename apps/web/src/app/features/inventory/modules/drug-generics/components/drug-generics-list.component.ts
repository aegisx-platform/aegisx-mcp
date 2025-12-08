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
import { DrugGenericService } from '../services/drug-generics.service';
import {
  DrugGeneric,
  ListDrugGenericQuery,
} from '../types/drug-generics.types';
import { DrugGenericCreateDialogComponent } from './drug-generics-create.dialog';
import {
  DrugGenericEditDialogComponent,
  DrugGenericEditDialogData,
} from './drug-generics-edit.dialog';
import {
  DrugGenericViewDialogComponent,
  DrugGenericViewDialogData,
} from './drug-generics-view.dialog';
import { DrugGenericImportDialogComponent } from './drug-generics-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { DrugGenericsListFiltersComponent } from './drug-generics-list-filters.component';
import { DrugGenericsListHeaderComponent } from './drug-generics-list-header.component';

@Component({
  selector: 'app-drug-generics-list',
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
    DrugGenericsListHeaderComponent,
    DrugGenericsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './drug-generics-list.component.html',
  styleUrl: './drug-generics-list.component.scss',
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
export class DrugGenericsListComponent {
  drugGenericsService = inject(DrugGenericService);
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
      label: 'Drug Generics',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'working_code',
    'generic_name',
    'dosage_form',
    'strength_unit',
    'dosage_form_id',
    'strength_unit_id',
    'actions',
  ];
  dataSource = new MatTableDataSource<DrugGeneric>([]);
  selection = new SelectionModel<DrugGeneric>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.drugGenericsService
      .drugGenericsList()
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
  protected working_codeInputSignal = signal('');
  protected generic_nameInputSignal = signal('');
  protected dosage_formInputSignal = signal('');
  protected strength_unitInputSignal = signal('');
  protected strength_valueInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected working_codeFilterSignal = signal('');
  protected generic_nameFilterSignal = signal('');
  protected dosage_formFilterSignal = signal('');
  protected strength_unitFilterSignal = signal('');
  protected strength_valueFilterSignal = signal('');
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
  protected expandedDrugGeneric = signal<DrugGeneric | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    working_code: this.working_codeInputSignal(),
    generic_name: this.generic_nameInputSignal(),
    dosage_form: this.dosage_formInputSignal(),
    strength_unit: this.strength_unitInputSignal(),
    strength_value: this.strength_valueInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get working_codeFilter() {
    return this.working_codeInputSignal();
  }
  set working_codeFilter(value: string) {
    this.working_codeInputSignal.set(value);
  }
  get generic_nameFilter() {
    return this.generic_nameInputSignal();
  }
  set generic_nameFilter(value: string) {
    this.generic_nameInputSignal.set(value);
  }
  get dosage_formFilter() {
    return this.dosage_formInputSignal();
  }
  set dosage_formFilter(value: string) {
    this.dosage_formInputSignal.set(value);
  }
  get strength_unitFilter() {
    return this.strength_unitInputSignal();
  }
  set strength_unitFilter(value: string) {
    this.strength_unitInputSignal.set(value);
  }

  get strength_valueFilter() {
    return this.strength_valueInputSignal();
  }
  set strength_valueFilter(value: string) {
    this.strength_valueInputSignal.set(value);
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
    const list = this.drugGenericsService.drugGenericsList();
    const total = this.drugGenericsService.totalDrugGeneric();

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
      this.drugGenericsService.exportDrugGeneric(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'working_code', label: 'Working Code' },
    { key: 'generic_name', label: 'Generic Name' },
    { key: 'dosage_form', label: 'Dosage Form' },
    { key: 'strength_unit', label: 'Strength Unit' },
    { key: 'dosage_form_id', label: 'Dosage Form Id' },
    { key: 'strength_unit_id', label: 'Strength Unit Id' },
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

  // --- Effect: reload drug_generics on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.drugGenericsService.loading();

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

      const working_code = this.working_codeFilterSignal();
      const generic_name = this.generic_nameFilterSignal();
      const dosage_form = this.dosage_formFilterSignal();
      const strength_unit = this.strength_unitFilterSignal();
      const strength_value = this.strength_valueFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListDrugGenericQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        working_code: working_code?.trim() || undefined,
        generic_name: generic_name?.trim() || undefined,
        dosage_form: dosage_form?.trim() || undefined,
        strength_unit: strength_unit?.trim() || undefined,
        strength_value: strength_value?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.drugGenericsService.loadDrugGenericList(params);
      this.dataSource.data = this.drugGenericsService.drugGenericsList();
      if (this.paginator) {
        this.paginator.length = this.drugGenericsService.totalDrugGeneric();
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
    this.working_codeInputSignal.set('');
    this.working_codeFilterSignal.set('');
    this.generic_nameInputSignal.set('');
    this.generic_nameFilterSignal.set('');
    this.dosage_formInputSignal.set('');
    this.dosage_formFilterSignal.set('');
    this.strength_unitInputSignal.set('');
    this.strength_unitFilterSignal.set('');
    this.strength_valueInputSignal.set('');
    this.strength_valueFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.working_codeFilterSignal.set(this.working_codeInputSignal().trim());
    this.generic_nameFilterSignal.set(this.generic_nameInputSignal().trim());
    this.dosage_formFilterSignal.set(this.dosage_formInputSignal().trim());
    this.strength_unitFilterSignal.set(this.strength_unitInputSignal().trim());
    this.strength_valueFilterSignal.set(
      this.strength_valueInputSignal().trim(),
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
    this.working_codeInputSignal.set('');
    this.working_codeFilterSignal.set('');
    this.generic_nameInputSignal.set('');
    this.generic_nameFilterSignal.set('');
    this.dosage_formInputSignal.set('');
    this.dosage_formFilterSignal.set('');
    this.strength_unitInputSignal.set('');
    this.strength_unitFilterSignal.set('');
    this.strength_valueInputSignal.set('');
    this.strength_valueFilterSignal.set('');
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
      this.working_codeFilterSignal().trim() !== '' ||
      this.generic_nameFilterSignal().trim() !== '' ||
      this.dosage_formFilterSignal().trim() !== '' ||
      this.strength_unitFilterSignal().trim() !== '' ||
      this.strength_valueFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.working_codeFilterSignal().trim()) count++;
    if (this.generic_nameFilterSignal().trim()) count++;
    if (this.dosage_formFilterSignal().trim()) count++;
    if (this.strength_unitFilterSignal().trim()) count++;
    if (this.strength_valueFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(DrugGenericCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(DrugGenericImportDialogComponent, {
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

  onViewDrugGeneric(drugGeneric: DrugGeneric) {
    const dialogRef = this.dialog.open(DrugGenericViewDialogComponent, {
      width: '600px',
      data: { drugGenerics: drugGeneric } as DrugGenericViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditDrugGeneric(result.data);
      }
    });
  }

  onEditDrugGeneric(drugGeneric: DrugGeneric) {
    const dialogRef = this.dialog.open(DrugGenericEditDialogComponent, {
      width: '600px',
      data: { drugGenerics: drugGeneric } as DrugGenericEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteDrugGeneric(drugGeneric: DrugGeneric) {
    const itemName =
      (drugGeneric as any).name || (drugGeneric as any).title || 'druggeneric';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.drugGenericsService.deleteDrugGeneric(drugGeneric.id);
          this.snackBar.open('DrugGeneric deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete druggeneric', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'drug_generics')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((drugGeneric) =>
              this.drugGenericsService.deleteDrugGeneric(drugGeneric.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} druggeneric(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some drug_generics', 'Close', {
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
      working_code: this.working_codeFilterSignal(),
      generic_name: this.generic_nameFilterSignal(),
      dosage_form: this.dosage_formFilterSignal(),
      strength_unit: this.strength_unitFilterSignal(),
      strength_value: this.strength_valueFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(drugGeneric: DrugGeneric): void {
    const currentExpanded = this.expandedDrugGeneric();
    if (currentExpanded?.id === drugGeneric.id) {
      // Collapse currently expanded row
      this.expandedDrugGeneric.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedDrugGeneric.set(drugGeneric);
    }
  }

  isRowExpanded(drugGeneric: DrugGeneric): boolean {
    return this.expandedDrugGeneric()?.id === drugGeneric.id;
  }
}
