import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';

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
import { DateRangeFilterComponent } from '../../../shared/components/date-range-filter/date-range-filter.component';

@Component({
  selector: 'app-authors-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatSelectModule,
    MatOptionModule,
    MatChipsModule,
    MatExpansionModule,
    MatBadgeModule,
    DateRangeFilterComponent,
  ],
  template: `
    <div class="authors-list-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="page-header">
        <h1 class="page-title">Authors</h1>
        <span class="spacer"></span>
      </mat-toolbar>

      <!-- Quick Search Section -->
      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-wrapper">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Authors</mat-label>
              <input
                matInput
                placeholder="Search by title, name, description"
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()"
                (keyup.enter)="onSearchButtonClick()"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button
              mat-raised-button
              color="primary"
              (click)="openCreateDialog()"
              [disabled]="authorsService.loading()"
              class="add-btn"
            >
              <mat-icon>add</mat-icon>
              Add Authors
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Quick Filters -->
      <mat-card class="quick-filters-card">
        <mat-card-content>
          <div class="quick-filters">
            <button
              mat-stroked-button
              [class.active]="quickFilter === 'all'"
              (click)="setQuickFilter('all')"
              class="filter-chip"
            >
              All
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Active Filters -->
      @if (getActiveFilterChips().length > 0) {
        <div class="active-filters">
          <span class="active-filters-label">Active Filters:</span>
          <div class="filter-chips">
            <mat-chip
              *ngFor="let chip of getActiveFilterChips()"
              (removed)="removeFilter(chip.key)"
              class="filter-chip"
              removable
            >
              <strong>{{ chip.label }}:</strong> {{ chip.value }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </div>
          <button
            mat-stroked-button
            color="warn"
            (click)="clearAllFilters()"
            class="clear-all-btn"
          >
            <mat-icon>clear_all</mat-icon>
            Clear All
          </button>
        </div>
      }

      <!-- Advanced Filters -->
      <mat-card class="advanced-filters-card">
        <mat-expansion-panel class="filters-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>tune</mat-icon>
              Advanced Filters
            </mat-panel-title>
            <mat-panel-description>
              Filter by specific criteria
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="advanced-filters">
            <!-- Filter Fields -->
            <div class="filter-grid">
              <!-- Fields Filter -->
              <div class="filter-group">
                <label class="filter-label">Fields</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Fields</mat-label>
                  <input
                    matInput
                    type="text"
                    [value]="filters().fields || ''"
                    (input)="onFilterChange('fields', $event)"
                    placeholder="Enter fields"
                  />
                </mat-form-field>
              </div>

              <!-- Active Filter -->
              <div class="filter-group">
                <label class="filter-label">Active</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Active</mat-label>
                  <input
                    matInput
                    type="text"
                    [value]="filters().active || ''"
                    (input)="onFilterChange('active', $event)"
                    placeholder="Enter active"
                  />
                </mat-form-field>
              </div>
            </div>

            <!-- Date Filters Section -->
            <div class="date-filters-section">
              <h4 class="section-header">
                <mat-icon>event</mat-icon>
                Date Filters
              </h4>

              <div class="date-filters-grid">
                <!-- Published Date Filter -->
                <div class="date-filter-group">
                  <label class="filter-label">Published Date</label>
                  <app-date-range-filter
                    fieldName="published_at"
                    label="Published Date"
                    [isDateTime]="true"
                    (filterChange)="onDateFilterChange($event)"
                  ></app-date-range-filter>
                </div>

                <!-- Created Date Filter -->
                <div class="date-filter-group">
                  <label class="filter-label">Created Date</label>
                  <app-date-range-filter
                    fieldName="created_at"
                    label="Created Date"
                    [isDateTime]="true"
                    (filterChange)="onDateFilterChange($event)"
                  ></app-date-range-filter>
                </div>

                <!-- Updated Date Filter -->
                <div class="date-filter-group">
                  <label class="filter-label">Updated Date</label>
                  <app-date-range-filter
                    fieldName="updated_at"
                    label="Updated Date"
                    [isDateTime]="true"
                    (filterChange)="onDateFilterChange($event)"
                  ></app-date-range-filter>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="filter-actions">
              <button
                mat-stroked-button
                (click)="resetFilters()"
                class="reset-btn"
              >
                Reset Filters
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="applyFiltersImmediate()"
                class="apply-btn"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-card>

      <!-- Loading State -->
      @if (authorsService.loading()) {
        <div class="loading-container">
          <mat-progress-spinner
            mode="indeterminate"
            diameter="50"
          ></mat-progress-spinner>
          <p>Loading Authors...</p>
        </div>
      }

      <!-- Error State -->
      @if (authorsService.error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <div class="error-content">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ authorsService.error() }}</p>
              <button mat-button color="primary" (click)="retry()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Data Table -->
      @if (!authorsService.loading() && !authorsService.error()) {
        <mat-card class="table-card">
          <mat-card-content>
            <!-- Bulk Actions -->
            @if (hasSelected()) {
              <div class="bulk-actions">
                <span class="selection-info"
                  >{{ selectedItems().length }} selected</span
                >
                <div class="bulk-buttons">
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="bulkDelete()"
                    [disabled]="authorsService.loading()"
                  >
                    <mat-icon>delete</mat-icon>
                    Delete Selected
                  </button>
                  <button mat-stroked-button (click)="clearSelection()">
                    <mat-icon>clear</mat-icon>
                    Clear Selection
                  </button>
                </div>
              </div>
            }

            <!-- Table -->
            <div class="table-container">
              <table
                mat-table
                [dataSource]="authorsService.authorsList()"
                class="authors-table"
              >
                <!-- Selection Column -->
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox
                      [checked]="isAllSelected()"
                      [indeterminate]="hasSelected() && !isAllSelected()"
                      (change)="toggleSelectAll()"
                    ></mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let authors">
                    <mat-checkbox
                      [checked]="isSelected(authors.id)"
                      (change)="toggleSelect(authors.id)"
                    ></mat-checkbox>
                  </td>
                </ng-container>

                <!-- name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let authors">
                    <span class="text-cell">{{ authors.name || '-' }}</span>
                  </td>
                </ng-container>

                <!-- email Column -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let authors">
                    <span class="text-cell">{{ authors.email || '-' }}</span>
                  </td>
                </ng-container>

                <!-- bio Column -->
                <ng-container matColumnDef="bio">
                  <th mat-header-cell *matHeaderCellDef>Bio</th>
                  <td mat-cell *matCellDef="let authors">
                    <span class="text-cell">{{ authors.bio || '-' }}</span>
                  </td>
                </ng-container>

                <!-- birth_date Column -->
                <ng-container matColumnDef="birth_date">
                  <th mat-header-cell *matHeaderCellDef>Birth_date</th>
                  <td mat-cell *matCellDef="let authors">
                    <span class="text-cell">{{
                      authors.birth_date || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- country Column -->
                <ng-container matColumnDef="country">
                  <th mat-header-cell *matHeaderCellDef>Country</th>
                  <td mat-cell *matCellDef="let authors">
                    <span class="text-cell">{{ authors.country || '-' }}</span>
                  </td>
                </ng-container>

                <!-- active Column -->
                <ng-container matColumnDef="active">
                  <th mat-header-cell *matHeaderCellDef>Active</th>
                  <td mat-cell *matCellDef="let authors">
                    <mat-icon
                      [color]="authors.active ? 'primary' : 'warn'"
                      class="status-icon"
                    >
                      {{ authors.active ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="created_at">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let authors">
                    {{ authors.created_at | date: 'short' }}
                  </td>
                </ng-container>
                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let authors">
                    <button
                      mat-icon-button
                      (click)="openViewDialog(authors)"
                      matTooltip="View Details"
                    >
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (click)="openEditDialog(authors)"
                      matTooltip="Edit"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="deleteAuthor(authors)"
                      matTooltip="Delete"
                      [disabled]="authorsService.loading()"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>
            </div>

            <!-- Empty State -->
            @if (authorsService.authorsList().length === 0) {
              <div class="empty-state">
                <mat-icon class="empty-icon">inbox</mat-icon>
                <h3>No Authors found</h3>
                <p>Create your first Authors to get started</p>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="openCreateDialog()"
                >
                  <mat-icon>add</mat-icon>
                  Add Authors
                </button>
              </div>
            }

            <!-- Pagination -->
            @if (authorsService.authorsList().length > 0) {
              <mat-paginator
                [length]="authorsService.totalAuthor()"
                [pageSize]="authorsService.pageSize()"
                [pageSizeOptions]="[5, 10, 25, 50, 100]"
                [pageIndex]="authorsService.currentPage() - 1"
                (page)="onPageChange($event)"
                showFirstLastButtons
              ></mat-paginator>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .authors-list-container {
        padding: 16px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 16px;
        border-radius: 4px;
      }

      .page-title {
        margin: 0;
        font-weight: 500;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .search-card,
      .quick-filters-card,
      .advanced-filters-card {
        margin-bottom: 16px;
      }

      .search-wrapper {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 300px;
      }

      .add-btn {
        height: 56px;
        padding: 0 24px;
        white-space: nowrap;
        min-width: 140px;
      }

      .quick-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .filter-chip {
        transition: all 0.2s ease;
      }

      .filter-chip.active {
        background-color: #1976d2;
        color: white;
      }

      .active-filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
        padding: 12px 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
        border-left: 4px solid #1976d2;
      }

      .active-filters-label {
        font-weight: 500;
        color: #1976d2;
        margin-right: 8px;
        flex-shrink: 0;
      }

      .filter-chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        flex: 1;
      }

      .filter-chips mat-chip {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .clear-all-btn {
        margin-left: auto;
        flex-shrink: 0;
      }

      .filters-panel {
        box-shadow: none !important;
      }

      .advanced-filters {
        padding: 16px 0;
      }

      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .filter-group.full-width {
        grid-column: 1 / -1;
      }

      .filter-label {
        font-weight: 500;
        color: #424242;
        font-size: 14px;
      }

      .filter-field {
        width: 100%;
      }

      .filter-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        align-items: center;
      }

      .reset-btn {
        min-width: 120px;
      }

      .apply-btn {
        min-width: 140px;
      }

      .search-btn {
        min-width: 100px;
      }

      .clear-search-btn {
        min-width: 80px;
      }

      .checkbox-filter {
        display: flex;
        align-items: center;
        min-width: 120px;
        margin: 8px 0;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
      }

      .loading-container p {
        margin-top: 16px;
        color: #666;
      }

      .error-card {
        margin-bottom: 16px;
      }

      .error-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .error-content mat-icon {
        font-size: 24px;
      }

      .error-content p {
        flex: 1;
        margin: 0;
      }

      .table-card {
        margin-bottom: 16px;
      }

      .bulk-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 16px;
      }

      .selection-info {
        font-weight: 500;
        color: #1976d2;
      }

      .bulk-buttons {
        display: flex;
        gap: 8px;
      }

      .table-container {
        overflow-x: auto;
      }

      .authors-table {
        width: 100%;
        min-width: 600px;
      }

      .empty-state {
        text-align: center;
        padding: 40px;
      }

      .empty-icon {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      .empty-state h3 {
        margin: 0 0 8px 0;
        color: #666;
      }

      .empty-state p {
        margin: 0 0 24px 0;
        color: #999;
      }

      /* Date Filters Styles */
      .date-filters-section {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .section-header mat-icon {
        font-size: 20px;
        color: #1976d2;
      }

      .date-filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }

      .date-filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      @media (max-width: 768px) {
        .authors-list-container {
          padding: 8px;
        }

        .search-container {
          flex-direction: column;
          align-items: stretch;
        }

        .search-group {
          flex-direction: column;
          align-items: stretch;
          min-width: unset;
          gap: 8px;
        }

        .search-field {
          min-width: unset;
        }

        .search-buttons {
          justify-content: center;
        }

        .search-btn,
        .clear-search-btn {
          flex: 1;
          min-width: unset;
        }

        .bulk-actions {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }

        .bulk-buttons {
          justify-content: center;
        }
      }
    `,
  ],
})
export class AuthorListComponent implements OnInit, OnDestroy {
  protected authorsService = inject(AuthorService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Search and filtering
  searchTerm = '';
  private searchTimeout: any;
  private filterTimeout: any;

  private filtersSignal = signal<Partial<ListAuthorQuery>>({});
  readonly filters = this.filtersSignal.asReadonly();

  // Quick filter state
  protected quickFilter = 'all';

  // Validation state
  private validationErrorsSignal = signal<Record<string, string>>({});
  readonly validationErrors = this.validationErrorsSignal.asReadonly();

  // Selection
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() => Array.from(this.selectedIdsSignal()));

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'name',
    'email',
    'bio',
    'birth_date',
    'country',
    'active',
    'created_at',
    'actions',
  ];

  ngOnInit() {
    this.loadAuthors();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
  }

  // ===== DATA LOADING =====

  async loadAuthors() {
    const params: ListAuthorQuery = {
      page: this.authorsService.currentPage(),
      limit: this.authorsService.pageSize(),
      ...this.filters(),
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    await this.authorsService.loadAuthorList(params);
  }

  async retry() {
    this.authorsService.clearError();
    await this.loadAuthors();
  }

  // ===== VALIDATION METHODS =====

  private isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private validateTechnicalFields(): { field: string; message: string }[] {
    const errors: { field: string; message: string }[] = [];
    const filters = this.filters();

    return errors;
  }

  private showFieldErrors(errors: { field: string; message: string }[]) {
    const errorMap: Record<string, string> = {};
    errors.forEach((error) => {
      errorMap[error.field] = error.message;
    });
    this.validationErrorsSignal.set(errorMap);

    // Show snackbar for user feedback
    if (errors.length > 0) {
      this.snackBar.open(
        'Please check your search criteria and try again',
        'Close',
        { duration: 3000, panelClass: ['error-snackbar'] },
      );
    }
  }

  private clearValidationErrors() {
    this.validationErrorsSignal.set({});
  }

  // ===== SEARCH AND FILTERING =====

  onSearchChange() {
    // Debounce search for auto-search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.authorsService.setCurrentPage(1);
      this.loadAuthors();
    }, 300);
  }

  onSearchButtonClick() {
    // Manual search - validate before execution
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Validate technical fields first
    const validationErrors = this.validateTechnicalFields();

    if (validationErrors.length > 0) {
      this.showFieldErrors(validationErrors);
      return; // Don't proceed with search
    }

    // Clear any previous validation errors
    this.clearValidationErrors();

    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  clearSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTerm = '';
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  // ===== DATE FILTERING =====

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    console.log('Date filter change:', dateFilter); // Debug log

    // Update filters with date filter values
    this.filtersSignal.update((filters) => ({
      ...filters,
      ...dateFilter,
    }));

    console.log('Updated filters:', this.filters()); // Debug log

    // Apply filters with debounce
    this.applyFilters();
  }

  // Handle filter field changes
  onFilterChange(field: string, event: any) {
    const value = event.target ? event.target.value : event;

    // Convert string numbers to numbers for numeric fields
    let processedValue = value;
    if (
      field.includes('_min') ||
      field.includes('_max') ||
      field === 'view_count'
    ) {
      processedValue = value === '' ? undefined : Number(value);
    }

    // Convert string booleans for boolean fields
    if (field === 'published') {
      processedValue = value === '' ? undefined : value;
    }

    // Clear quick filter when advance filters are used
    if (this.quickFilter !== 'all') {
      this.quickFilter = 'all';
    }

    this.filtersSignal.update((filters) => ({
      ...filters,
      [field]: processedValue,
    }));

    this.applyFilters();
  }

  applyFilters() {
    // Debounce filter changes to prevent multiple API calls
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      this.authorsService.setCurrentPage(1);
      this.loadAuthors();
    }, 300);
  }

  // Immediate filter application (for button clicks)
  applyFiltersImmediate() {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  clearFilters() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.searchTerm = '';
    this.filtersSignal.set({});
    this.clearValidationErrors();
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.length > 0 || Object.keys(this.filters()).length > 0;
  }

  // ===== PAGINATION =====

  onPageChange(event: PageEvent) {
    this.authorsService.setCurrentPage(event.pageIndex + 1);
    this.authorsService.setPageSize(event.pageSize);
    this.loadAuthors();
  }

  // ===== SELECTION =====

  isSelected(id: string): boolean {
    return this.selectedIdsSignal().has(id);
  }

  hasSelected(): boolean {
    return this.selectedIdsSignal().size > 0;
  }

  isAllSelected(): boolean {
    const total = this.authorsService.authorsList().length;
    return total > 0 && this.selectedIdsSignal().size === total;
  }

  toggleSelect(id: string) {
    this.selectedIdsSignal.update((selected) => {
      const newSet = new Set(selected);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedIdsSignal.set(new Set());
    } else {
      const allIds = this.authorsService.authorsList().map((item) => item.id);
      this.selectedIdsSignal.set(new Set(allIds));
    }
  }

  clearSelection() {
    this.selectedIdsSignal.set(new Set());
  }

  // ===== DIALOG OPERATIONS =====

  openCreateDialog() {
    const dialogRef = this.dialog.open(AuthorCreateDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh the list to show the new item
        this.loadAuthors();
      }
    });
  }

  openEditDialog(authors: Author) {
    const dialogRef = this.dialog.open(AuthorEditDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      data: { authors } as AuthorEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // The service automatically updates the list with optimistic updates
        // No need to refresh unless there was an error
      }
    });
  }

  openViewDialog(authors: Author) {
    const dialogRef = this.dialog.open(AuthorViewDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { authors } as AuthorViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        // User clicked edit from view dialog
        this.openEditDialog(result.data);
      }
    });
  }

  // ===== QUICK FILTERS =====

  protected setQuickFilter(filter: string) {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.quickFilter = filter;

    // Clear all filters first
    this.searchTerm = '';
    this.filtersSignal.set({});
    this.clearValidationErrors();

    switch (filter) {
      case 'all':
      default:
        // Already cleared above
        break;
    }

    // Quick filters should apply immediately
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  // ===== ACTIVE FILTER CHIPS =====

  protected getActiveFilterChips(): Array<{
    key: string;
    label: string;
    value: string;
  }> {
    const chips: Array<{ key: string; label: string; value: string }> = [];
    const filters = this.filters();

    // Add quick filter chip if not 'all'
    if (this.quickFilter !== 'all') {
      const quickFilterLabels: Record<string, string> = {
        published_true: 'Status: Published',
      };
      chips.push({
        key: '_quickFilter',
        label: 'Quick Filter',
        value: quickFilterLabels[this.quickFilter] || this.quickFilter,
      });
    }

    if (this.searchTerm) {
      chips.push({ key: 'search', label: 'Search', value: this.searchTerm });
    }

    // Date field filters - only add if fields exist in schema

    if (filters.created_at) {
      chips.push({
        key: 'created_at',
        label: 'Created Date',
        value: this.formatDate(filters.created_at as string),
      });
    } else if (filters.created_at_min || filters.created_at_max) {
      const from = filters.created_at_min
        ? this.formatDate(filters.created_at_min as string)
        : '...';
      const to = filters.created_at_max
        ? this.formatDate(filters.created_at_max as string)
        : '...';
      chips.push({
        key: 'created_at_range',
        label: 'Created Date Range',
        value: `${from} - ${to}`,
      });
    }

    if (filters.updated_at) {
      chips.push({
        key: 'updated_at',
        label: 'Updated Date',
        value: this.formatDate(filters.updated_at as string),
      });
    } else if (filters.updated_at_min || filters.updated_at_max) {
      const from = filters.updated_at_min
        ? this.formatDate(filters.updated_at_min as string)
        : '...';
      const to = filters.updated_at_max
        ? this.formatDate(filters.updated_at_max as string)
        : '...';
      chips.push({
        key: 'updated_at_range',
        label: 'Updated Date Range',
        value: `${from} - ${to}`,
      });
    }

    // Regular field filters
    if (filters.fields !== undefined && filters.fields.length > 0) {
      chips.push({
        key: 'fields',
        label: 'Fields',
        value: String(filters.fields),
      });
    }

    if (filters.active !== undefined) {
      chips.push({
        key: 'active',
        label: 'Active',
        value: String(filters.active),
      });
    }

    return chips;
  }

  protected removeFilter(key: string) {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    if (key === '_quickFilter') {
      // Reset quick filter to 'all'
      this.setQuickFilter('all');
      return;
    }

    if (key === 'search') {
      this.searchTerm = '';
    } else if (key.includes('_range')) {
      // Handle date range removal
      const fieldName = key.replace('_range', '');
      this.filtersSignal.update((filters) => {
        const updated = { ...filters } as any;
        delete updated[fieldName];
        delete updated[`${fieldName}_min`];
        delete updated[`${fieldName}_max`];
        return updated;
      });
    } else {
      this.filtersSignal.update((filters) => {
        const updated = { ...filters } as any;
        delete updated[key];
        return updated;
      });
    }
    this.clearValidationErrors();
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  protected clearAllFilters() {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.searchTerm = '';
    this.filtersSignal.set({});
    this.quickFilter = 'all';
    this.clearValidationErrors();
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  protected resetFilters() {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filtersSignal.set({});
    this.clearValidationErrors();

    // Reset filters should apply immediately
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  // ===== DATE FILTER HANDLERS =====

  protected updateDateFilter(filterUpdate: any) {
    this.filtersSignal.update((current) => ({ ...current, ...filterUpdate }));
    this.applyFilters();
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // ===== ACTIONS =====

  async deleteAuthor(authors: Author) {
    if (confirm(`Are you sure you want to delete this authors?`)) {
      try {
        await this.authorsService.deleteAuthor(authors.id);
        this.snackBar.open('Authors deleted successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to delete Authors', 'Close', {
          duration: 5000,
        });
      }
    }
  }

  async bulkDelete() {
    const selectedIds = Array.from(this.selectedIdsSignal());
    if (selectedIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedIds.length} Authors?`,
    );
    if (!confirmed) return;

    try {
      await this.authorsService.bulkDeleteAuthor(selectedIds);
      this.clearSelection();
      this.snackBar.open(
        `${selectedIds.length} Authors deleted successfully`,
        'Close',
        {
          duration: 3000,
        },
      );
    } catch (error) {
      this.snackBar.open('Failed to delete Authors', 'Close', {
        duration: 5000,
      });
    }
  }
}
