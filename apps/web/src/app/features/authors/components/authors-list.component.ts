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
import { AuthorService } from '../services/authors.service';
import { Author, ListAuthorQuery } from '../types/authors.types';
import { AuthorCreateDialogComponent } from './authors-create.dialog';
import {
  AuthorEditDialogComponent,
  AuthorEditDialogData,
} from './authors-edit.dialog';
import {
  AuthorViewDialogComponent,
  AuthorViewDialogData,
} from './authors-view.dialog';

// Import child components
import { AuthorsListFiltersComponent } from './authors-list-filters.component';
import { AuthorsListHeaderComponent } from './authors-list-header.component';

@Component({
  selector: 'app-authors-list',
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
    AuthorsListHeaderComponent,
    AuthorsListFiltersComponent,
    // AegisX UI components
    AegisxEmptyStateComponent,
    AegisxErrorStateComponent,
  ],
  templateUrl: './authors-list.component.html',
  styleUrl: './authors-list.component.scss',
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
export class AuthorsListComponent {
  authorsService = inject(AuthorService);
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
      id: 'authors',
      title: 'Authors',
      type: 'basic',
      icon: 'menu_book',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'name',
    'email',
    'bio',
    'birth_date',
    'country',
    'active',
    'actions',
  ];
  dataSource = new MatTableDataSource<Author>([]);
  selection = new SelectionModel<Author>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() =>
    this.authorsService
      .authorsList()
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
  protected nameInputSignal = signal('');
  protected emailInputSignal = signal('');
  protected countryInputSignal = signal('');
  protected activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected nameFilterSignal = signal('');
  protected emailFilterSignal = signal('');
  protected countryFilterSignal = signal('');
  protected activeFilterSignal = signal<boolean | undefined>(undefined);

  // Date filter INPUT signals (not sent to API until Apply is clicked)
  protected birth_dateInputSignal = signal<string | null>(null);
  protected birth_dateMinInputSignal = signal<string | null>(null);
  protected birth_dateMaxInputSignal = signal<string | null>(null);
  protected updated_atInputSignal = signal<string | null>(null);
  protected updated_atMinInputSignal = signal<string | null>(null);
  protected updated_atMaxInputSignal = signal<string | null>(null);

  // Date filter ACTIVE signals (sent to API)
  protected birth_dateSignal = signal<string | null>(null);
  protected birth_dateMinSignal = signal<string | null>(null);
  protected birth_dateMaxSignal = signal<string | null>(null);
  protected updated_atSignal = signal<string | null>(null);
  protected updated_atMinSignal = signal<string | null>(null);
  protected updated_atMaxSignal = signal<string | null>(null);

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
  protected expandedAuthor = signal<Author | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    name: this.nameInputSignal(),
    email: this.emailInputSignal(),
    country: this.countryInputSignal(),
    active: this.activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get nameFilter() {
    return this.nameInputSignal();
  }
  set nameFilter(value: string) {
    this.nameInputSignal.set(value);
  }
  get emailFilter() {
    return this.emailInputSignal();
  }
  set emailFilter(value: string) {
    this.emailInputSignal.set(value);
  }
  get countryFilter() {
    return this.countryInputSignal();
  }
  set countryFilter(value: string) {
    this.countryInputSignal.set(value);
  }

  get activeFilter() {
    return this.activeInputSignal();
  }
  set activeFilter(value: boolean | undefined) {
    this.activeInputSignal.set(value);
  }

  // Stats from API (should come from dedicated stats endpoint)
  stats = computed(() => ({
    total: this.authorsService.totalAuthor(),
    available: 0,
    unavailable: 0,
    recentWeek: 0,
  }));

  // Export configuration
  exportServiceAdapter: ExportService = {
    export: (options: ExportOptions) =>
      this.authorsService.exportAuthor(options),
  };

  availableExportFields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'bio', label: 'Bio' },
    { key: 'birth_date', label: 'Birth Date' },
    { key: 'country', label: 'Country' },
    { key: 'active', label: 'Active' },
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

  // --- Effect: reload authors on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.authorsService.loading();

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

      const name = this.nameFilterSignal();
      const email = this.emailFilterSignal();
      const country = this.countryFilterSignal();
      const active = this.activeFilterSignal();
      const birth_date = this.birth_dateSignal();
      const birth_dateMin = this.birth_dateMinSignal();
      const birth_dateMax = this.birth_dateMaxSignal();
      const updated_at = this.updated_atSignal();
      const updated_atMin = this.updated_atMinSignal();
      const updated_atMax = this.updated_atMaxSignal();

      const params: Partial<ListAuthorQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        name: name?.trim() || undefined,
        email: email?.trim() || undefined,
        country: country?.trim() || undefined,
        active: active,
        birth_date: birth_date || undefined,
        birth_date_min: birth_dateMin || undefined,
        birth_date_max: birth_dateMax || undefined,
        updated_at: updated_at || undefined,
        updated_at_min: updated_atMin || undefined,
        updated_at_max: updated_atMax || undefined,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      await this.authorsService.loadAuthorList(params);
      this.dataSource.data = this.authorsService.authorsList();
      if (this.paginator) {
        this.paginator.length = this.authorsService.totalAuthor();
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
    this.nameInputSignal.set('');
    this.nameFilterSignal.set('');
    this.emailInputSignal.set('');
    this.emailFilterSignal.set('');
    this.countryInputSignal.set('');
    this.countryFilterSignal.set('');
    this.activeInputSignal.set(undefined);
    this.activeFilterSignal.set(undefined);
    // Clear Birth Date filter INPUT signals
    this.birth_dateInputSignal.set(null);
    this.birth_dateMinInputSignal.set(null);
    this.birth_dateMaxInputSignal.set(null);
    // Clear Birth Date filter ACTIVE signals
    this.birth_dateSignal.set(null);
    this.birth_dateMinSignal.set(null);
    this.birth_dateMaxSignal.set(null);
    // Clear Updated At filter INPUT signals
    this.updated_atInputSignal.set(null);
    this.updated_atMinInputSignal.set(null);
    this.updated_atMaxInputSignal.set(null);
    // Clear Updated At filter ACTIVE signals
    this.updated_atSignal.set(null);
    this.updated_atMinSignal.set(null);
    this.updated_atMaxSignal.set(null);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.nameFilterSignal.set(this.nameInputSignal().trim());
    this.emailFilterSignal.set(this.emailInputSignal().trim());
    this.countryFilterSignal.set(this.countryInputSignal().trim());
    this.activeFilterSignal.set(this.activeInputSignal());

    // Apply date/datetime filters
    this.birth_dateSignal.set(this.birth_dateInputSignal());
    this.birth_dateMinSignal.set(this.birth_dateMinInputSignal());
    this.birth_dateMaxSignal.set(this.birth_dateMaxInputSignal());
    this.updated_atSignal.set(this.updated_atInputSignal());
    this.updated_atMinSignal.set(this.updated_atMinInputSignal());
    this.updated_atMaxSignal.set(this.updated_atMaxInputSignal());

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
      this.activeInputSignal.set(undefined);
      this.activeFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.activeInputSignal.set(true);
      this.activeFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.activeInputSignal.set(false);
      this.activeFilterSignal.set(false);
    }
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
    this.birth_dateInputSignal.set(dateFilter['birth_date'] || null);
    this.birth_dateMinInputSignal.set(dateFilter['birth_date_min'] || null);
    this.birth_dateMaxInputSignal.set(dateFilter['birth_date_max'] || null);
    this.updated_atInputSignal.set(dateFilter['updated_at'] || null);
    this.updated_atMinInputSignal.set(dateFilter['updated_at_min'] || null);
    this.updated_atMaxInputSignal.set(dateFilter['updated_at_max'] || null);
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.nameInputSignal.set('');
    this.nameFilterSignal.set('');
    this.emailInputSignal.set('');
    this.emailFilterSignal.set('');
    this.countryInputSignal.set('');
    this.countryFilterSignal.set('');
    this.activeInputSignal.set(undefined);
    this.activeFilterSignal.set(undefined);
    // Clear Birth Date filter INPUT signals
    this.birth_dateInputSignal.set(null);
    this.birth_dateMinInputSignal.set(null);
    this.birth_dateMaxInputSignal.set(null);
    // Clear Birth Date filter ACTIVE signals
    this.birth_dateSignal.set(null);
    this.birth_dateMinSignal.set(null);
    this.birth_dateMaxSignal.set(null);
    // Clear Updated At filter INPUT signals
    this.updated_atInputSignal.set(null);
    this.updated_atMinInputSignal.set(null);
    this.updated_atMaxInputSignal.set(null);
    // Clear Updated At filter ACTIVE signals
    this.updated_atSignal.set(null);
    this.updated_atMinSignal.set(null);
    this.updated_atMaxSignal.set(null);
    this.quickFilter = 'all';
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.nameFilterSignal().trim() !== '' ||
      this.emailFilterSignal().trim() !== '' ||
      this.countryFilterSignal().trim() !== '' ||
      this.activeFilterSignal() !== undefined ||
      this.birth_dateSignal() !== null ||
      this.birth_dateMinSignal() !== null ||
      this.birth_dateMaxSignal() !== null ||
      this.updated_atSignal() !== null ||
      this.updated_atMinSignal() !== null ||
      this.updated_atMaxSignal() !== null
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.nameFilterSignal().trim()) count++;
    if (this.emailFilterSignal().trim()) count++;
    if (this.countryFilterSignal().trim()) count++;
    if (this.activeFilterSignal() !== undefined) count++;
    // Count Birth Date filter as one if any date field is set
    if (
      this.birth_dateSignal() ||
      this.birth_dateMinSignal() ||
      this.birth_dateMaxSignal()
    )
      count++;
    // Count Updated At filter as one if any datetime field is set
    if (
      this.updated_atSignal() ||
      this.updated_atMinSignal() ||
      this.updated_atMaxSignal()
    )
      count++;
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
    const dialogRef = this.dialog.open(AuthorCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewAuthor(author: Author) {
    const dialogRef = this.dialog.open(AuthorViewDialogComponent, {
      width: '600px',
      data: { authors: author } as AuthorViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditAuthor(result.data);
      }
    });
  }

  onEditAuthor(author: Author) {
    const dialogRef = this.dialog.open(AuthorEditDialogComponent, {
      width: '600px',
      data: { authors: author } as AuthorEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteAuthor(author: Author) {
    const itemName = (author as any).name || (author as any).title || 'author';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.authorsService.deleteAuthor(author.id);
          this.snackBar.open('Author deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete author', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'authors')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((author) =>
              this.authorsService.deleteAuthor(author.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} author(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some authors', 'Close', {
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
      name: this.nameFilterSignal(),
      email: this.emailFilterSignal(),
      country: this.countryFilterSignal(),
      active: this.activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(author: Author): void {
    const currentExpanded = this.expandedAuthor();
    if (currentExpanded?.id === author.id) {
      // Collapse currently expanded row
      this.expandedAuthor.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedAuthor.set(author);
    }
  }

  isRowExpanded(author: Author): boolean {
    return this.expandedAuthor()?.id === author.id;
  }
}
