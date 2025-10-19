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
import { BookService } from '../services/books.service';
import { Book, ListBookQuery } from '../types/books.types';
import { BookCreateDialogComponent } from './books-create.dialog';
import {
  BookEditDialogComponent,
  BookEditDialogData,
} from './books-edit.dialog';
import {
  BookViewDialogComponent,
  BookViewDialogData,
} from './books-view.dialog';

// Import child components
import { BooksListFiltersComponent } from './books-list-filters.component';
import { BooksListHeaderComponent } from './books-list-header.component';

@Component({
  selector: 'app-books-list',
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
    BooksListHeaderComponent,
    BooksListFiltersComponent,
    // AegisX UI components
    AegisxEmptyStateComponent,
    AegisxErrorStateComponent,
  ],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.scss',
})
export class BooksListComponent {
  booksService = inject(BookService);
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
      id: 'books',
      title: 'Books',
      type: 'basic',
      icon: 'menu_book',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'title',
    'isbn',
    'genre',
    'pages',
    'available',
    'actions',
  ];
  dataSource = new MatTableDataSource<Book>([]);
  selection = new SelectionModel<Book>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() =>
    this.booksService
      .booksList()
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
  protected genreInputSignal = signal('');
  protected authorIdInputSignal = signal('');
  protected availableInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected genreFilterSignal = signal('');
  protected authorIdFilterSignal = signal('');
  protected availableFilterSignal = signal<boolean | undefined>(undefined);

  // Date filter INPUT signals (not sent to API until Apply is clicked)
  protected publishedDateInputSignal = signal<string | null>(null);
  protected publishedDateMinInputSignal = signal<string | null>(null);
  protected publishedDateMaxInputSignal = signal<string | null>(null);

  // Date filter ACTIVE signals (sent to API)
  protected publishedDateSignal = signal<string | null>(null);
  protected publishedDateMinSignal = signal<string | null>(null);
  protected publishedDateMaxSignal = signal<string | null>(null);

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

  // Computed signals
  advancedFilters = computed(() => ({
    available: this.availableInputSignal(),
    genre: this.genreInputSignal(),
    author_id: this.authorIdInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }
  get genreFilter() {
    return this.genreInputSignal();
  }
  set genreFilter(value: string) {
    this.genreInputSignal.set(value);
  }

  get authorIdFilter() {
    return this.authorIdInputSignal();
  }
  set authorIdFilter(value: string) {
    this.authorIdInputSignal.set(value);
  }

  get availableFilter() {
    return this.availableInputSignal();
  }
  set availableFilter(value: boolean | undefined) {
    this.availableInputSignal.set(value);
  }

  // Stats from API (should come from dedicated stats endpoint)
  stats = computed(() => ({
    total: this.booksService.totalBook(),
    available: this.booksService.availableCount(),
    unavailable: this.booksService.unavailableCount(),
    recentWeek: this.booksService.thisWeekCount(),
  }));

  // Export configuration
  exportServiceAdapter: ExportService = {
    export: (options: ExportOptions) => this.booksService.exportBook(options),
  };

  availableExportFields = [
    { key: 'id', label: 'Id' },
    { key: 'title', label: 'Title' },
    { key: 'author_id', label: 'Author ID' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'genre', label: 'Genre' },
    { key: 'pages', label: 'Pages' },
    { key: 'available', label: 'Available' },
    { key: 'created_at', label: 'Created at' },
    { key: 'updated_at', label: 'Updated at' },
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

  // --- Effect: reload books on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.booksService.loading();

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
      const available = this.availableFilterSignal();
      const genre = this.genreFilterSignal();
      const authorId = this.authorIdFilterSignal();
      const publishedDate = this.publishedDateSignal();
      const publishedDateMin = this.publishedDateMinSignal();
      const publishedDateMax = this.publishedDateMaxSignal();

      const params: Partial<ListBookQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        available: available,
        genre: genre?.trim() || undefined,
        author_id: authorId?.trim() || undefined,
        published_date: publishedDate || undefined,
        published_date_min: publishedDateMin || undefined,
        published_date_max: publishedDateMax || undefined,
      };

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      await this.booksService.loadBookList(params);
      this.dataSource.data = this.booksService.booksList();
      if (this.paginator) {
        this.paginator.length = this.booksService.totalBook();
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
    this.genreInputSignal.set('');
    this.authorIdInputSignal.set('');
    this.availableInputSignal.set(undefined);
    this.quickFilter = 'all';
    this.availableFilterSignal.set(undefined);
    this.genreFilterSignal.set('');
    this.authorIdFilterSignal.set('');
    // Clear date filter INPUT signals
    this.publishedDateInputSignal.set(null);
    this.publishedDateMinInputSignal.set(null);
    this.publishedDateMaxInputSignal.set(null);
    // Clear date filter ACTIVE signals
    this.publishedDateSignal.set(null);
    this.publishedDateMinSignal.set(null);
    this.publishedDateMaxSignal.set(null);
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.genreFilterSignal.set(this.genreInputSignal().trim());
    this.authorIdFilterSignal.set(this.authorIdInputSignal().trim());
    this.availableFilterSignal.set(this.availableInputSignal());

    // Apply date filters
    this.publishedDateSignal.set(this.publishedDateInputSignal());
    this.publishedDateMinSignal.set(this.publishedDateMinInputSignal());
    this.publishedDateMaxSignal.set(this.publishedDateMaxInputSignal());

    if (this.paginator) this.paginator.pageIndex = 0;
  }

  clearSearch() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  setQuickFilter(filter: 'all' | 'active' | 'unavailable') {
    this.quickFilter = filter;
    if (filter === 'all') {
      this.availableInputSignal.set(undefined);
      this.availableFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.availableInputSignal.set(true);
      this.availableFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.availableInputSignal.set(false);
      this.availableFilterSignal.set(false);
    }
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    // Update INPUT signals only (not sent to API until Apply Filters is clicked)
    this.publishedDateInputSignal.set(dateFilter['published_date'] || null);
    this.publishedDateMinInputSignal.set(
      dateFilter['published_date_min'] || null,
    );
    this.publishedDateMaxInputSignal.set(
      dateFilter['published_date_max'] || null,
    );
  }

  clearAllFilters() {
    this.searchInputSignal.set('');
    this.genreInputSignal.set('');
    this.authorIdInputSignal.set('');
    this.availableInputSignal.set(undefined);
    this.searchTermSignal.set('');
    this.quickFilter = 'all';
    this.availableFilterSignal.set(undefined);
    this.genreFilterSignal.set('');
    this.authorIdFilterSignal.set('');
    // Clear date filter INPUT signals
    this.publishedDateInputSignal.set(null);
    this.publishedDateMinInputSignal.set(null);
    this.publishedDateMaxInputSignal.set(null);
    // Clear date filter ACTIVE signals
    this.publishedDateSignal.set(null);
    this.publishedDateMinSignal.set(null);
    this.publishedDateMaxSignal.set(null);
    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return (
      this.searchTermSignal().trim() !== '' ||
      this.availableFilterSignal() !== undefined ||
      this.genreFilterSignal().trim() !== '' ||
      (this.authorIdFilterSignal()?.trim() || '') !== '' ||
      this.publishedDateSignal() !== null ||
      this.publishedDateMinSignal() !== null ||
      this.publishedDateMaxSignal() !== null
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.availableFilterSignal() !== undefined) count++;
    if (this.genreFilterSignal().trim()) count++;
    if (this.authorIdFilterSignal()?.trim()) count++;
    // Count date filter as one if any date field is set
    if (
      this.publishedDateSignal() ||
      this.publishedDateMinSignal() ||
      this.publishedDateMaxSignal()
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
    const dialogRef = this.dialog.open(BookCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewBook(book: Book) {
    const dialogRef = this.dialog.open(BookViewDialogComponent, {
      width: '600px',
      data: { books: book } as BookViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditBook(result.data);
      }
    });
  }

  onEditBook(book: Book) {
    const dialogRef = this.dialog.open(BookEditDialogComponent, {
      width: '600px',
      data: { books: book } as BookEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteBook(book: Book) {
    this.axDialog.confirmDelete(book.title).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.booksService.deleteBook(book.id);
          this.snackBar.open('Book deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete book', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'books')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((book) =>
              this.booksService.deleteBook(book.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} book(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some books', 'Close', {
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
      available: this.availableFilterSignal(),
      genre: this.genreFilterSignal(),
      author_id: this.authorIdFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }
}
