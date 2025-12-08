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
import { CompanieService } from '../services/companies.service';
import { Companie, ListCompanieQuery } from '../types/companies.types';
import { CompanieCreateDialogComponent } from './companies-create.dialog';
import {
  CompanieEditDialogComponent,
  CompanieEditDialogData,
} from './companies-edit.dialog';
import {
  CompanieViewDialogComponent,
  CompanieViewDialogData,
} from './companies-view.dialog';
import { CompanieImportDialogComponent } from './companies-import.dialog';
import {
  SharedExportComponent,
  ExportOptions,
  ExportService,
} from '../../../../../shared/components/shared-export/shared-export.component';

// Import child components
import { CompaniesListFiltersComponent } from './companies-list-filters.component';
import { CompaniesListHeaderComponent } from './companies-list-header.component';

@Component({
  selector: 'app-companies-list',
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
    CompaniesListHeaderComponent,
    CompaniesListFiltersComponent,
    SharedExportComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.scss',
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
export class CompaniesListComponent {
  companiesService = inject(CompanieService);
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
      label: 'Companies',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'company_code',
    'company_name',
    'tax_id',
    'bank_id',
    'bank_account_number',
    'bank_account_name',
    'actions',
  ];
  dataSource = new MatTableDataSource<Companie>([]);
  selection = new SelectionModel<Companie>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.companiesService
      .companiesList()
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
  protected company_codeInputSignal = signal('');
  protected company_nameInputSignal = signal('');
  protected bank_account_numberInputSignal = signal('');
  protected bank_account_nameInputSignal = signal('');
  protected contact_personInputSignal = signal('');
  protected phoneInputSignal = signal('');
  protected emailInputSignal = signal('');
  protected addressInputSignal = signal('');
  protected is_vendorInputSignal = signal<boolean | undefined>(undefined);
  protected is_manufacturerInputSignal = signal<boolean | undefined>(undefined);
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);
  protected tax_idInputSignal = signal('');

  // Advanced filter ACTIVE signals (sent to API)
  protected company_codeFilterSignal = signal('');
  protected company_nameFilterSignal = signal('');
  protected bank_account_numberFilterSignal = signal('');
  protected bank_account_nameFilterSignal = signal('');
  protected contact_personFilterSignal = signal('');
  protected phoneFilterSignal = signal('');
  protected emailFilterSignal = signal('');
  protected addressFilterSignal = signal('');
  protected is_vendorFilterSignal = signal<boolean | undefined>(undefined);
  protected is_manufacturerFilterSignal = signal<boolean | undefined>(
    undefined,
  );
  protected is_activeFilterSignal = signal<boolean | undefined>(undefined);
  protected tax_idFilterSignal = signal('');

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
  protected expandedCompanie = signal<Companie | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    company_code: this.company_codeInputSignal(),
    company_name: this.company_nameInputSignal(),
    bank_account_number: this.bank_account_numberInputSignal(),
    bank_account_name: this.bank_account_nameInputSignal(),
    contact_person: this.contact_personInputSignal(),
    phone: this.phoneInputSignal(),
    email: this.emailInputSignal(),
    address: this.addressInputSignal(),
    is_vendor: this.is_vendorInputSignal(),
    is_manufacturer: this.is_manufacturerInputSignal(),
    is_active: this.is_activeInputSignal(),
    tax_id: this.tax_idInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get company_codeFilter() {
    return this.company_codeInputSignal();
  }
  set company_codeFilter(value: string) {
    this.company_codeInputSignal.set(value);
  }
  get company_nameFilter() {
    return this.company_nameInputSignal();
  }
  set company_nameFilter(value: string) {
    this.company_nameInputSignal.set(value);
  }
  get bank_account_numberFilter() {
    return this.bank_account_numberInputSignal();
  }
  set bank_account_numberFilter(value: string) {
    this.bank_account_numberInputSignal.set(value);
  }
  get bank_account_nameFilter() {
    return this.bank_account_nameInputSignal();
  }
  set bank_account_nameFilter(value: string) {
    this.bank_account_nameInputSignal.set(value);
  }
  get contact_personFilter() {
    return this.contact_personInputSignal();
  }
  set contact_personFilter(value: string) {
    this.contact_personInputSignal.set(value);
  }
  get phoneFilter() {
    return this.phoneInputSignal();
  }
  set phoneFilter(value: string) {
    this.phoneInputSignal.set(value);
  }
  get emailFilter() {
    return this.emailInputSignal();
  }
  set emailFilter(value: string) {
    this.emailInputSignal.set(value);
  }
  get addressFilter() {
    return this.addressInputSignal();
  }
  set addressFilter(value: string) {
    this.addressInputSignal.set(value);
  }

  get is_vendorFilter() {
    return this.is_vendorInputSignal();
  }
  set is_vendorFilter(value: boolean | undefined) {
    this.is_vendorInputSignal.set(value);
  }
  get is_manufacturerFilter() {
    return this.is_manufacturerInputSignal();
  }
  set is_manufacturerFilter(value: boolean | undefined) {
    this.is_manufacturerInputSignal.set(value);
  }
  get is_activeFilter() {
    return this.is_activeInputSignal();
  }
  set is_activeFilter(value: boolean | undefined) {
    this.is_activeInputSignal.set(value);
  }

  get tax_idFilter() {
    return this.tax_idInputSignal();
  }
  set tax_idFilter(value: string) {
    this.tax_idInputSignal.set(value);
  }

  // Stats computed from data
  // Note: For accurate stats, consider implementing a dedicated stats endpoint
  stats = computed(() => {
    const list = this.companiesService.companiesList();
    const total = this.companiesService.totalCompanie();

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
      this.companiesService.exportCompanie(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'company_code', label: 'Company Code' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'tax_id', label: 'Tax Id' },
    { key: 'bank_id', label: 'Bank Id' },
    { key: 'bank_account_number', label: 'Bank Account Number' },
    { key: 'bank_account_name', label: 'Bank Account Name' },
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

  // --- Effect: reload companies on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.companiesService.loading();

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

      const company_code = this.company_codeFilterSignal();
      const company_name = this.company_nameFilterSignal();
      const bank_account_number = this.bank_account_numberFilterSignal();
      const bank_account_name = this.bank_account_nameFilterSignal();
      const contact_person = this.contact_personFilterSignal();
      const phone = this.phoneFilterSignal();
      const email = this.emailFilterSignal();
      const address = this.addressFilterSignal();
      const is_vendor = this.is_vendorFilterSignal();
      const is_manufacturer = this.is_manufacturerFilterSignal();
      const is_active = this.is_activeFilterSignal();
      const tax_id = this.tax_idFilterSignal();

      const params: Partial<ListCompanieQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        company_code: company_code?.trim() || undefined,
        company_name: company_name?.trim() || undefined,
        bank_account_number: bank_account_number?.trim() || undefined,
        bank_account_name: bank_account_name?.trim() || undefined,
        contact_person: contact_person?.trim() || undefined,
        phone: phone?.trim() || undefined,
        email: email?.trim() || undefined,
        address: address?.trim() || undefined,
        is_vendor: is_vendor,
        is_manufacturer: is_manufacturer,
        is_active: is_active,
        tax_id: tax_id?.trim() || undefined,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.companiesService.loadCompanieList(params);
      this.dataSource.data = this.companiesService.companiesList();
      if (this.paginator) {
        this.paginator.length = this.companiesService.totalCompanie();
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
    this.company_codeInputSignal.set('');
    this.company_codeFilterSignal.set('');
    this.company_nameInputSignal.set('');
    this.company_nameFilterSignal.set('');
    this.bank_account_numberInputSignal.set('');
    this.bank_account_numberFilterSignal.set('');
    this.bank_account_nameInputSignal.set('');
    this.bank_account_nameFilterSignal.set('');
    this.contact_personInputSignal.set('');
    this.contact_personFilterSignal.set('');
    this.phoneInputSignal.set('');
    this.phoneFilterSignal.set('');
    this.emailInputSignal.set('');
    this.emailFilterSignal.set('');
    this.addressInputSignal.set('');
    this.addressFilterSignal.set('');
    this.is_vendorInputSignal.set(undefined);
    this.is_vendorFilterSignal.set(undefined);
    this.is_manufacturerInputSignal.set(undefined);
    this.is_manufacturerFilterSignal.set(undefined);
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.tax_idInputSignal.set('');
    this.tax_idFilterSignal.set('');
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.company_codeFilterSignal.set(this.company_codeInputSignal().trim());
    this.company_nameFilterSignal.set(this.company_nameInputSignal().trim());
    this.bank_account_numberFilterSignal.set(
      this.bank_account_numberInputSignal().trim(),
    );
    this.bank_account_nameFilterSignal.set(
      this.bank_account_nameInputSignal().trim(),
    );
    this.contact_personFilterSignal.set(
      this.contact_personInputSignal().trim(),
    );
    this.phoneFilterSignal.set(this.phoneInputSignal().trim());
    this.emailFilterSignal.set(this.emailInputSignal().trim());
    this.addressFilterSignal.set(this.addressInputSignal().trim());
    this.is_vendorFilterSignal.set(this.is_vendorInputSignal());
    this.is_manufacturerFilterSignal.set(this.is_manufacturerInputSignal());
    this.is_activeFilterSignal.set(this.is_activeInputSignal());
    this.tax_idFilterSignal.set(this.tax_idInputSignal().trim());

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
      this.is_vendorInputSignal.set(undefined);
      this.is_vendorFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.is_vendorInputSignal.set(true);
      this.is_vendorFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.is_vendorInputSignal.set(false);
      this.is_vendorFilterSignal.set(false);
    }
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.company_codeInputSignal.set('');
    this.company_codeFilterSignal.set('');
    this.company_nameInputSignal.set('');
    this.company_nameFilterSignal.set('');
    this.bank_account_numberInputSignal.set('');
    this.bank_account_numberFilterSignal.set('');
    this.bank_account_nameInputSignal.set('');
    this.bank_account_nameFilterSignal.set('');
    this.contact_personInputSignal.set('');
    this.contact_personFilterSignal.set('');
    this.phoneInputSignal.set('');
    this.phoneFilterSignal.set('');
    this.emailInputSignal.set('');
    this.emailFilterSignal.set('');
    this.addressInputSignal.set('');
    this.addressFilterSignal.set('');
    this.is_vendorInputSignal.set(undefined);
    this.is_vendorFilterSignal.set(undefined);
    this.is_manufacturerInputSignal.set(undefined);
    this.is_manufacturerFilterSignal.set(undefined);
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.tax_idInputSignal.set('');
    this.tax_idFilterSignal.set('');
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.company_codeFilterSignal().trim() !== '' ||
      this.company_nameFilterSignal().trim() !== '' ||
      this.bank_account_numberFilterSignal().trim() !== '' ||
      this.bank_account_nameFilterSignal().trim() !== '' ||
      this.contact_personFilterSignal().trim() !== '' ||
      this.phoneFilterSignal().trim() !== '' ||
      this.emailFilterSignal().trim() !== '' ||
      this.addressFilterSignal().trim() !== '' ||
      this.is_vendorFilterSignal() !== undefined ||
      this.is_manufacturerFilterSignal() !== undefined ||
      this.is_activeFilterSignal() !== undefined ||
      (this.tax_idFilterSignal()?.trim() || '') !== ''
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.company_codeFilterSignal().trim()) count++;
    if (this.company_nameFilterSignal().trim()) count++;
    if (this.bank_account_numberFilterSignal().trim()) count++;
    if (this.bank_account_nameFilterSignal().trim()) count++;
    if (this.contact_personFilterSignal().trim()) count++;
    if (this.phoneFilterSignal().trim()) count++;
    if (this.emailFilterSignal().trim()) count++;
    if (this.addressFilterSignal().trim()) count++;
    if (this.is_vendorFilterSignal() !== undefined) count++;
    if (this.is_manufacturerFilterSignal() !== undefined) count++;
    if (this.is_activeFilterSignal() !== undefined) count++;
    if (this.tax_idFilterSignal()?.trim()) count++;
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
    const dialogRef = this.dialog.open(CompanieCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(CompanieImportDialogComponent, {
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

  onViewCompanie(companie: Companie) {
    const dialogRef = this.dialog.open(CompanieViewDialogComponent, {
      width: '600px',
      data: { companies: companie } as CompanieViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditCompanie(result.data);
      }
    });
  }

  onEditCompanie(companie: Companie) {
    const dialogRef = this.dialog.open(CompanieEditDialogComponent, {
      width: '600px',
      data: { companies: companie } as CompanieEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteCompanie(companie: Companie) {
    const itemName =
      (companie as any).name || (companie as any).title || 'companie';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.companiesService.deleteCompanie(companie.id);
          this.snackBar.open('Companie deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete companie', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'companies')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((companie) =>
              this.companiesService.deleteCompanie(companie.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} companie(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some companies', 'Close', {
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
      company_code: this.company_codeFilterSignal(),
      company_name: this.company_nameFilterSignal(),
      bank_account_number: this.bank_account_numberFilterSignal(),
      bank_account_name: this.bank_account_nameFilterSignal(),
      contact_person: this.contact_personFilterSignal(),
      phone: this.phoneFilterSignal(),
      email: this.emailFilterSignal(),
      address: this.addressFilterSignal(),
      is_vendor: this.is_vendorFilterSignal(),
      is_manufacturer: this.is_manufacturerFilterSignal(),
      is_active: this.is_activeFilterSignal(),
      tax_id: this.tax_idFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(companie: Companie): void {
    const currentExpanded = this.expandedCompanie();
    if (currentExpanded?.id === companie.id) {
      // Collapse currently expanded row
      this.expandedCompanie.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedCompanie.set(companie);
    }
  }

  isRowExpanded(companie: Companie): boolean {
    return this.expandedCompanie()?.id === companie.id;
  }
}
