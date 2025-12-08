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
import { DrugComponentService } from '../services/drug-components.service';
import {
  DrugComponent,
  ListDrugComponentQuery,
} from '../types/drug-components.types';
import { DrugComponentCreateDialogComponent } from './drug-components-create.dialog';
import {
  DrugComponentEditDialogComponent,
  DrugComponentEditDialogData,
} from './drug-components-edit.dialog';
import {
  DrugComponentViewDialogComponent,
  DrugComponentViewDialogData,
} from './drug-components-view.dialog';
import { DrugComponentImportDialogComponent } from './drug-components-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { DrugComponentsListFiltersComponent } from './drug-components-list-filters.component';
import { DrugComponentsListHeaderComponent } from './drug-components-list-header.component';

@Component({
  selector: 'app-drug-components-list',
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
    DrugComponentsListHeaderComponent,
    DrugComponentsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './drug-components-list.component.html',
  styleUrl: './drug-components-list.component.scss',
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
export class DrugComponentsListComponent {
  drugComponentsService = inject(DrugComponentService);
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
      label: 'Drug Components',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'generic_id',
    'component_name',
    'strength',
    'strength_value',
    'strength_unit',
    'is_active',
    'actions',
  ];
  dataSource = new MatTableDataSource<DrugComponent>([]);
  selection = new SelectionModel<DrugComponent>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.drugComponentsService
      .drugComponentsList()
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
  protected component_nameInputSignal = signal('');
  protected strengthInputSignal = signal('');
  protected strength_unitInputSignal = signal('');
  protected strength_valueInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected component_nameFilterSignal = signal('');
  protected strengthFilterSignal = signal('');
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
  protected expandedDrugComponent = signal<DrugComponent | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    component_name: this.component_nameInputSignal(),
    strength: this.strengthInputSignal(),
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

  get component_nameFilter() {
    return this.component_nameInputSignal();
  }
  set component_nameFilter(value: string) {
    this.component_nameInputSignal.set(value);
  }
  get strengthFilter() {
    return this.strengthInputSignal();
  }
  set strengthFilter(value: string) {
    this.strengthInputSignal.set(value);
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
    const list = this.drugComponentsService.drugComponentsList();
    const total = this.drugComponentsService.totalDrugComponent();

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
      this.drugComponentsService.exportDrugComponent(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'generic_id', label: 'Generic Id' },
    { key: 'component_name', label: 'Component Name' },
    { key: 'strength', label: 'Strength' },
    { key: 'strength_value', label: 'Strength Value' },
    { key: 'strength_unit', label: 'Strength Unit' },
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

  // --- Effect: reload drug_components on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.drugComponentsService.loading();

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

      const component_name = this.component_nameFilterSignal();
      const strength = this.strengthFilterSignal();
      const strength_unit = this.strength_unitFilterSignal();
      const strength_value = this.strength_valueFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListDrugComponentQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        component_name: component_name?.trim() || undefined,
        strength: strength?.trim() || undefined,
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
      await this.drugComponentsService.loadDrugComponentList(params);
      this.dataSource.data = this.drugComponentsService.drugComponentsList();
      if (this.paginator) {
        this.paginator.length = this.drugComponentsService.totalDrugComponent();
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
    this.component_nameInputSignal.set('');
    this.component_nameFilterSignal.set('');
    this.strengthInputSignal.set('');
    this.strengthFilterSignal.set('');
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
    this.component_nameFilterSignal.set(
      this.component_nameInputSignal().trim(),
    );
    this.strengthFilterSignal.set(this.strengthInputSignal().trim());
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
    this.component_nameInputSignal.set('');
    this.component_nameFilterSignal.set('');
    this.strengthInputSignal.set('');
    this.strengthFilterSignal.set('');
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
      this.component_nameFilterSignal().trim() !== '' ||
      this.strengthFilterSignal().trim() !== '' ||
      this.strength_unitFilterSignal().trim() !== '' ||
      this.strength_valueFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.component_nameFilterSignal().trim()) count++;
    if (this.strengthFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(DrugComponentCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(DrugComponentImportDialogComponent, {
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

  onViewDrugComponent(drugComponent: DrugComponent) {
    const dialogRef = this.dialog.open(DrugComponentViewDialogComponent, {
      width: '600px',
      data: { drugComponents: drugComponent } as DrugComponentViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditDrugComponent(result.data);
      }
    });
  }

  onEditDrugComponent(drugComponent: DrugComponent) {
    const dialogRef = this.dialog.open(DrugComponentEditDialogComponent, {
      width: '600px',
      data: { drugComponents: drugComponent } as DrugComponentEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteDrugComponent(drugComponent: DrugComponent) {
    const itemName =
      (drugComponent as any).name ||
      (drugComponent as any).title ||
      'drugcomponent';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.drugComponentsService.deleteDrugComponent(
            drugComponent.id,
          );
          this.snackBar.open('DrugComponent deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete drugcomponent', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'drug_components')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map(
              (drugComponent) =>
                this.drugComponentsService.deleteDrugComponent(
                  drugComponent.id,
                ),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} drugcomponent(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open(
              'Failed to delete some drug_components',
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
      component_name: this.component_nameFilterSignal(),
      strength: this.strengthFilterSignal(),
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
  toggleExpandRow(drugComponent: DrugComponent): void {
    const currentExpanded = this.expandedDrugComponent();
    if (currentExpanded?.id === drugComponent.id) {
      // Collapse currently expanded row
      this.expandedDrugComponent.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedDrugComponent.set(drugComponent);
    }
  }

  isRowExpanded(drugComponent: DrugComponent): boolean {
    return this.expandedDrugComponent()?.id === drugComponent.id;
  }
}
