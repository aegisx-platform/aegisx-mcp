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
import { DosageFormService } from '../services/dosage-forms.service';
import { DosageForm, ListDosageFormQuery } from '../types/dosage-forms.types';
import { DosageFormCreateDialogComponent } from './dosage-forms-create.dialog';
import {
  DosageFormEditDialogComponent,
  DosageFormEditDialogData,
} from './dosage-forms-edit.dialog';
import {
  DosageFormViewDialogComponent,
  DosageFormViewDialogData,
} from './dosage-forms-view.dialog';

// Import child components
import { DosageFormsListFiltersComponent } from './dosage-forms-list-filters.component';
import { DosageFormsListHeaderComponent } from './dosage-forms-list-header.component';

@Component({
  selector: 'app-dosage-forms-list',
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
    DosageFormsListHeaderComponent,
    DosageFormsListFiltersComponent,
    // AegisX UI components
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
  ],
  templateUrl: './dosage-forms-list.component.html',
  styleUrl: './dosage-forms-list.component.scss',
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
export class DosageFormsListComponent {
  dosageFormsService = inject(DosageFormService);
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
      label: 'DosageForms',
    },
  ];

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'form_code',
    'form_name',
    'form_name_en',
    'description',
    'is_active',
    'actions',
  ];
  dataSource = new MatTableDataSource<DosageForm>([]);
  selection = new SelectionModel<DosageForm>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<number>>(new Set());
  readonly selectedItems = computed(() =>
    this.dosageFormsService
      .dosageFormsList()
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
  protected form_codeInputSignal = signal('');
  protected form_nameInputSignal = signal('');
  protected form_name_enInputSignal = signal('');
  protected descriptionInputSignal = signal('');
  protected is_activeInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected form_codeFilterSignal = signal('');
  protected form_nameFilterSignal = signal('');
  protected form_name_enFilterSignal = signal('');
  protected descriptionFilterSignal = signal('');
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
  protected expandedDosageForm = signal<DosageForm | null>(null);

  // Computed signals
  advancedFilters = computed(() => ({
    form_code: this.form_codeInputSignal(),
    form_name: this.form_nameInputSignal(),
    form_name_en: this.form_name_enInputSignal(),
    description: this.descriptionInputSignal(),
    is_active: this.is_activeInputSignal(),
  }));

  // Two-way binding helpers
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
  }

  get form_codeFilter() {
    return this.form_codeInputSignal();
  }
  set form_codeFilter(value: string) {
    this.form_codeInputSignal.set(value);
  }
  get form_nameFilter() {
    return this.form_nameInputSignal();
  }
  set form_nameFilter(value: string) {
    this.form_nameInputSignal.set(value);
  }
  get form_name_enFilter() {
    return this.form_name_enInputSignal();
  }
  set form_name_enFilter(value: string) {
    this.form_name_enInputSignal.set(value);
  }
  get descriptionFilter() {
    return this.descriptionInputSignal();
  }
  set descriptionFilter(value: string) {
    this.descriptionInputSignal.set(value);
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
    const list = this.dosageFormsService.dosageFormsList();
    const total = this.dosageFormsService.totalDosageForm();

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

  // --- Effect: reload dosage_forms on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Track loading state and delay loading indicator
    effect(() => {
      const loading = this.dosageFormsService.loading();

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

      const form_code = this.form_codeFilterSignal();
      const form_name = this.form_nameFilterSignal();
      const form_name_en = this.form_name_enFilterSignal();
      const description = this.descriptionFilterSignal();
      const is_active = this.is_activeFilterSignal();

      const params: Partial<ListDosageFormQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        form_code: form_code?.trim() || undefined,
        form_name: form_name?.trim() || undefined,
        form_name_en: form_name_en?.trim() || undefined,
        description: description?.trim() || undefined,
        is_active: is_active,
      } as any;

      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      // Always use traditional API for list/search operations
      // WebSocket events are for real-time sync of CUD operations only
      await this.dosageFormsService.loadDosageFormList(params);
      this.dataSource.data = this.dosageFormsService.dosageFormsList();
      if (this.paginator) {
        this.paginator.length = this.dosageFormsService.totalDosageForm();
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
    this.form_codeInputSignal.set('');
    this.form_codeFilterSignal.set('');
    this.form_nameInputSignal.set('');
    this.form_nameFilterSignal.set('');
    this.form_name_enInputSignal.set('');
    this.form_name_enFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
    this.is_activeInputSignal.set(undefined);
    this.is_activeFilterSignal.set(undefined);
    this.quickFilter = 'all';
    if (this.paginator) this.paginator.pageIndex = 0;
    this.reloadTrigger.update((n) => n + 1);
  }

  applyFilterImmediate() {
    // Apply text and selection filters
    this.form_codeFilterSignal.set(this.form_codeInputSignal().trim());
    this.form_nameFilterSignal.set(this.form_nameInputSignal().trim());
    this.form_name_enFilterSignal.set(this.form_name_enInputSignal().trim());
    this.descriptionFilterSignal.set(this.descriptionInputSignal().trim());
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
    this.form_codeInputSignal.set('');
    this.form_codeFilterSignal.set('');
    this.form_nameInputSignal.set('');
    this.form_nameFilterSignal.set('');
    this.form_name_enInputSignal.set('');
    this.form_name_enFilterSignal.set('');
    this.descriptionInputSignal.set('');
    this.descriptionFilterSignal.set('');
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
      this.form_codeFilterSignal().trim() !== '' ||
      this.form_nameFilterSignal().trim() !== '' ||
      this.form_name_enFilterSignal().trim() !== '' ||
      this.descriptionFilterSignal().trim() !== '' ||
      this.is_activeFilterSignal() !== undefined
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.form_codeFilterSignal().trim()) count++;
    if (this.form_nameFilterSignal().trim()) count++;
    if (this.form_name_enFilterSignal().trim()) count++;
    if (this.descriptionFilterSignal().trim()) count++;
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
    const dialogRef = this.dialog.open(DosageFormCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onViewDosageForm(dosageForm: DosageForm) {
    const dialogRef = this.dialog.open(DosageFormViewDialogComponent, {
      width: '600px',
      data: { dosageForms: dosageForm } as DosageFormViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.action === 'edit') {
        this.onEditDosageForm(result.data);
      }
    });
  }

  onEditDosageForm(dosageForm: DosageForm) {
    const dialogRef = this.dialog.open(DosageFormEditDialogComponent, {
      width: '600px',
      data: { dosageForms: dosageForm } as DosageFormEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.reloadTrigger.update((n) => n + 1);
      }
    });
  }

  onDeleteDosageForm(dosageForm: DosageForm) {
    const itemName =
      (dosageForm as any).name || (dosageForm as any).title || 'dosageform';
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.dosageFormsService.deleteDosageForm(dosageForm.id);
          this.snackBar.open('DosageForm deleted successfully', 'Close', {
            duration: 3000,
          });
          this.reloadTrigger.update((n) => n + 1);
        } catch {
          this.snackBar.open('Failed to delete dosageform', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'dosage_forms')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((dosageForm) =>
              this.dosageFormsService.deleteDosageForm(dosageForm.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} dosageform(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            this.reloadTrigger.update((n) => n + 1);
          } catch {
            this.snackBar.open('Failed to delete some dosage_forms', 'Close', {
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
      form_code: this.form_codeFilterSignal(),
      form_name: this.form_nameFilterSignal(),
      form_name_en: this.form_name_enFilterSignal(),
      description: this.descriptionFilterSignal(),
      is_active: this.is_activeFilterSignal(),
    };
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // Expandable Row Methods
  toggleExpandRow(dosageForm: DosageForm): void {
    const currentExpanded = this.expandedDosageForm();
    if (currentExpanded?.id === dosageForm.id) {
      // Collapse currently expanded row
      this.expandedDosageForm.set(null);
    } else {
      // Expand new row (and collapse previous if any)
      this.expandedDosageForm.set(dosageForm);
    }
  }

  isRowExpanded(dosageForm: DosageForm): boolean {
    return this.expandedDosageForm()?.id === dosageForm.id;
  }
}
