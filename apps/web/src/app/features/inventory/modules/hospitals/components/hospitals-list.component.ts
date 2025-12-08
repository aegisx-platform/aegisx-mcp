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
import { HospitalService } from '../services/hospitals.service';
import { Hospital, ListHospitalQuery } from '../types/hospitals.types';
import { HospitalCreateDialogComponent } from './hospitals-create.dialog';
import {
  HospitalEditDialogComponent,
  HospitalEditDialogData,
} from './hospitals-edit.dialog';
import {
  HospitalViewDialogComponent,
  HospitalViewDialogData,
} from './hospitals-view.dialog';
import { HospitalImportDialogComponent } from './hospitals-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { HospitalsListFiltersComponent } from './hospitals-list-filters.component';
import { HospitalsListHeaderComponent } from './hospitals-list-header.component';

@Component({
  selector: 'app-hospitals-list',
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
    HospitalsListHeaderComponent,
    HospitalsListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './hospitals-list.component.html',
  styleUrl: './hospitals-list.component.scss',
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
export class HospitalsListComponent {
  hospitalsService = inject(HospitalService);
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
      label: 'Hospitals',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'hospital_code',
    'hospital_name',
    'hospital_type',
    'province',
    'region',
    'is_active',
    'actions',
  ];
  dataSource = new MatTableDataSource<Hospital>([]);
  selection = new SelectionModel<Hospital>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.hospitalsService
      .hospitalsList()
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
  protected hospital_codeInputSignal = signal('');
  protected hospital_nameInputSignal = signal('');
  protected hospital_typeInputSignal = signal('');
  protected provinceInputSignal = signal('');
  protected regionInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected hospital_codeFilterSignal = signal('');
  protected hospital_nameFilterSignal = signal('');
  protected hospital_typeFilterSignal = signal('');
  protected provinceFilterSignal = signal('');
  protected regionFilterSignal = signal('');
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
  protected expandedHospital = signal<Hospital | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    hospital_code: this.hospital_codeInputSignal(),
    hospital_name: this.hospital_nameInputSignal(),
    hospital_type: this.hospital_typeInputSignal(),
    province: this.provinceInputSignal(),
    region: this.regionInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get hospital_codeFilter() {
    return this.hospital_codeInputSignal();
  }
  set hospital_codeFilter(value: string) {
    this.hospital_codeInputSignal.set(value);
  }
  get hospital_nameFilter() {
    return this.hospital_nameInputSignal();
  }
  set hospital_nameFilter(value: string) {
    this.hospital_nameInputSignal.set(value);
  }
  get hospital_typeFilter() {
    return this.hospital_typeInputSignal();
  }
  set hospital_typeFilter(value: string) {
    this.hospital_typeInputSignal.set(value);
  }
  get provinceFilter() {
    return this.provinceInputSignal();
  }
  set provinceFilter(value: string) {
    this.provinceInputSignal.set(value);
  }
  get regionFilter() {
    return this.regionInputSignal();
  }
  set regionFilter(value: string) {
    this.regionInputSignal.set(value);
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
    const list = this.hospitalsService.hospitalsList();
    const total = this.hospitalsService.totalHospital();

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
      this.hospitalsService.exportHospital(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'hospital_code', label: 'Hospital Code' },
    { key: 'hospital_name', label: 'Hospital Name' },
    { key: 'hospital_type', label: 'Hospital Type' },
    { key: 'province', label: 'Province' },
    { key: 'region', label: 'Region' },
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

  // --- Effect: reload hospitals on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.hospitalsService.loading();

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

      const hospital_code = this.hospital_codeFilterSignal();
      const hospital_name = this.hospital_nameFilterSignal();
      const hospital_type = this.hospital_typeFilterSignal();
      const province = this.provinceFilterSignal();
      const region = this.regionFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListHospitalQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        hospital_code: hospital_code?.trim() || undefined,
        hospital_name: hospital_name?.trim() || undefined,
        hospital_type: hospital_type?.trim() || undefined,
        province: province?.trim() || undefined,
        region: region?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.hospitalsService.loadHospitalList(params);
      this.dataSource.data = this.hospitalsService.hospitalsList();
      if (this.paginator) {
        this.paginator.length = this.hospitalsService.totalHospital();
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
    this.hospital_codeInputSignal.set('');
    this.hospital_codeFilterSignal.set('');
    this.hospital_nameInputSignal.set('');
    this.hospital_nameFilterSignal.set('');
    this.hospital_typeInputSignal.set('');
    this.hospital_typeFilterSignal.set('');
    this.provinceInputSignal.set('');
    this.provinceFilterSignal.set('');
    this.regionInputSignal.set('');
    this.regionFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.hospital_codeFilterSignal.set(this.hospital_codeInputSignal().trim());
    this.hospital_nameFilterSignal.set(this.hospital_nameInputSignal().trim());
    this.hospital_typeFilterSignal.set(this.hospital_typeInputSignal().trim());
    this.provinceFilterSignal.set(this.provinceInputSignal().trim());
    this.regionFilterSignal.set(this.regionInputSignal().trim());
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
    this.hospital_codeInputSignal.set('');
    this.hospital_codeFilterSignal.set('');
    this.hospital_nameInputSignal.set('');
    this.hospital_nameFilterSignal.set('');
    this.hospital_typeInputSignal.set('');
    this.hospital_typeFilterSignal.set('');
    this.provinceInputSignal.set('');
    this.provinceFilterSignal.set('');
    this.regionInputSignal.set('');
    this.regionFilterSignal.set('');
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
      this.hospital_codeFilterSignal().trim() !== '' ||
      this.hospital_nameFilterSignal().trim() !== '' ||
      this.hospital_typeFilterSignal().trim() !== '' ||
      this.provinceFilterSignal().trim() !== '' ||
      this.regionFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.hospital_codeFilterSignal().trim()) count++;
    if (this.hospital_nameFilterSignal().trim()) count++;
    if (this.hospital_typeFilterSignal().trim()) count++;
    if (this.provinceFilterSignal().trim()) count++;
    if (this.regionFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(HospitalCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(HospitalImportDialogComponent, {
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

  onViewHospital(hospital: Hospital) {
    const dialogRef = this.dialog.open(HospitalViewDialogComponent, {
      width: '600px',
      data: { hospitals: hospital } as HospitalViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditHospital(result.data);
      }
    });
  }

  onEditHospital(hospital: Hospital) {
    const dialogRef = this.dialog.open(HospitalEditDialogComponent, {
      width: '600px',
      data: { hospitals: hospital } as HospitalEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteHospital(hospital: Hospital) {
    const itemName =
      (hospital as any).name || (hospital as any).title || 'hospital';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.hospitalsService.deleteHospital(hospital.id);
          this.snackBar.open('Hospital deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete hospital', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'hospitals')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((hospital) =>
              this.hospitalsService.deleteHospital(hospital.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} hospital(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some hospitals', 'Close', {
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
      hospital_code: this.hospital_codeFilterSignal(),
      hospital_name: this.hospital_nameFilterSignal(),
      hospital_type: this.hospital_typeFilterSignal(),
      province: this.provinceFilterSignal(),
      region: this.regionFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(hospital: Hospital): void {
    const currentExpanded = this.expandedHospital();
    if (currentExpanded?.id === hospital.id) {
      // Collapse currently expanded row
      this.expandedHospital.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedHospital.set(hospital);
    }
  }

  isRowExpanded(hospital: Hospital): boolean {
    return this.expandedHospital()?.id === hospital.id;
  }
}
