import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-budget-request-items-list-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  template: `
    <!-- Filters Panel -->
    <div class="filter-panel">
      <!-- Row 1: Quick Filters + Actions -->
      <div class="filter-row-1">
        <mat-button-toggle-group
          [value]="quickFilter"
          (change)="onQuickFilterChange($event.value)"
          class="quick-filter-toggle"
        >
          <mat-button-toggle value="all">All</mat-button-toggle>
          <mat-button-toggle value="active">Available</mat-button-toggle>
          <mat-button-toggle value="unavailable">Unavailable</mat-button-toggle>
        </mat-button-toggle-group>

        <div class="filter-actions">
          <!-- Advanced Filters Toggle -->
          <button
            mat-stroked-button
            (click)="showAdvancedFilters.set(!showAdvancedFilters())"
            [class.active-filter-btn]="showAdvancedFilters()"
          >
            <mat-icon>tune</mat-icon>
            Advanced Filters
            @if (activeFilterCount > 0) {
              <span class="filter-badge">{{ activeFilterCount }}</span>
            }
          </button>

          <!-- Clear All (show when filters active) -->
          @if (activeFilterCount > 0) {
            <button
              mat-stroked-button
              color="warn"
              (click)="clearAllClicked.emit()"
            >
              <mat-icon>clear</mat-icon>
              Clear
            </button>
          }

          <!-- Export Button -->
          <ng-content select="[export]"></ng-content>
        </div>
      </div>

      <!-- Row 2: Search -->
      <div class="filter-row-2">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            [(ngModel)]="searchTerm"
            (keyup.enter)="onSearch()"
            placeholder="Search by ..."
          />
          @if (searchTerm) {
            <button
              matSuffix
              mat-icon-button
              (click)="onClearSearch()"
              aria-label="Clear"
            >
              <mat-icon>close</mat-icon>
            </button>
          }
          @if (loading) {
            <mat-spinner matSuffix [diameter]="20"></mat-spinner>
          }
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="onSearch()">
          <mat-icon>search</mat-icon>
          Search
        </button>
        <button
          mat-icon-button
          (click)="refreshClicked.emit()"
          [disabled]="loading"
          [matTooltip]="loading ? 'Loading...' : 'Refresh'"
        >
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <!-- Active Filter Chips -->
      @if (activeFilterCount > 0) {
        <div class="filter-chips">
          <ng-content select="[filter-chips]"></ng-content>
        </div>
      }

      <!-- Advanced Filters Panel -->
      @if (showAdvancedFilters()) {
        <div class="mt-4 pt-4 border-t border-[var(--ax-border-default)]">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Item Justification Filter -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Item Justification</mat-label>
              <input
                matInput
                [(ngModel)]="item_justificationFilter"
                (ngModelChange)="item_justificationFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter item justification"
              />
            </mat-form-field>
            <!-- Generic Code Filter -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Generic Code</mat-label>
              <input
                matInput
                [(ngModel)]="generic_codeFilter"
                (ngModelChange)="generic_codeFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter generic code"
              />
            </mat-form-field>
            <!-- Generic Name Filter -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Generic Name</mat-label>
              <input
                matInput
                [(ngModel)]="generic_nameFilter"
                (ngModelChange)="generic_nameFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter generic name"
              />
            </mat-form-field>
            <!-- Package Size Filter -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Package Size</mat-label>
              <input
                matInput
                [(ngModel)]="package_sizeFilter"
                (ngModelChange)="package_sizeFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter package size"
              />
            </mat-form-field>
            <!-- Unit Filter -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Unit</mat-label>
              <input
                matInput
                [(ngModel)]="unitFilter"
                (ngModelChange)="unitFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter unit"
              />
            </mat-form-field>
          </div>

          <!-- Apply Filters Button -->
          <div class="mt-4 flex justify-end gap-2">
            <button mat-stroked-button (click)="clearAllClicked.emit()">
              Clear All
            </button>
            <button
              mat-flat-button
              color="primary"
              (click)="applyFiltersClicked.emit()"
              [disabled]="loading"
            >
              Apply Filters
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      /* Filter Panel - no border/padding since parent wrapper provides it */
      .filter-panel {
        background: transparent;
      }

      /* Row 1: Quick Filters + Actions */
      .filter-row-1 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .filter-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Row 2: Search */
      .filter-row-2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .search-field {
        flex: 1;
        max-width: 400px;
      }

      /* Filter Chips */
      .filter-chips {
        margin-top: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      /* Quick Filter Toggle Group */
      .quick-filter-toggle {
        border: 1px solid var(--ax-border-emphasis);
        border-radius: 6px;
        overflow: hidden;
        box-shadow: var(--ax-shadow-xs);
      }

      .quick-filter-toggle .mat-button-toggle {
        border: none !important;
      }

      .quick-filter-toggle .mat-button-toggle-checked {
        background-color: var(--ax-info-faint) !important;
        color: var(--ax-info-emphasis) !important;
      }

      .quick-filter-toggle
        .mat-button-toggle:not(.mat-button-toggle-checked):hover {
        background-color: var(--ax-background-muted);
      }

      /* Active Filter Button */
      .active-filter-btn {
        background-color: var(--ax-info-faint) !important;
        border-color: var(--ax-info-default) !important;
        color: var(--ax-info-emphasis) !important;
      }

      /* Filter Badge */
      .filter-badge {
        margin-left: 0.25rem;
        padding: 0.125rem 0.5rem;
        font-size: 0.75rem;
        background: var(--ax-info-default);
        color: white;
        border-radius: 9999px;
      }

      /* Form Field Compact */
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .filter-row-1 {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-actions {
          justify-content: flex-end;
        }

        .filter-row-2 {
          flex-wrap: wrap;
        }

        .search-field {
          max-width: 100%;
          width: 100%;
        }
      }
    `,
  ],
})
export class BudgetRequestItemsListFiltersComponent {
  @Input({ required: true }) activeFilterCount!: number;
  @Input() loading = false;

  // Two-way binding properties
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();

  @Input() quickFilter: 'all' | 'active' | 'unavailable' = 'all';
  @Output() quickFilterChange = new EventEmitter<
    'all' | 'active' | 'unavailable'
  >();

  // Item Justification filter
  @Input() item_justificationFilter = '';
  @Output() item_justificationFilterChange = new EventEmitter<string>();
  // Generic Code filter
  @Input() generic_codeFilter = '';
  @Output() generic_codeFilterChange = new EventEmitter<string>();
  // Generic Name filter
  @Input() generic_nameFilter = '';
  @Output() generic_nameFilterChange = new EventEmitter<string>();
  // Package Size filter
  @Input() package_sizeFilter = '';
  @Output() package_sizeFilterChange = new EventEmitter<string>();
  // Unit filter
  @Input() unitFilter = '';
  @Output() unitFilterChange = new EventEmitter<string>();

  // Event outputs
  @Output() searchClicked = new EventEmitter<void>();
  @Output() refreshClicked = new EventEmitter<void>();
  @Output() clearSearchClicked = new EventEmitter<void>();
  @Output() applyFiltersClicked = new EventEmitter<void>();
  @Output() clearAllClicked = new EventEmitter<void>();
  @Output() dateFilterChange = new EventEmitter<{
    [key: string]: string | null | undefined;
  }>();

  // UI state
  showAdvancedFilters = signal(false);

  onSearch() {
    this.searchTermChange.emit(this.searchTerm);
    this.searchClicked.emit();
  }

  onClearSearch() {
    this.searchTerm = '';
    this.searchTermChange.emit(this.searchTerm);
    this.clearSearchClicked.emit();
  }

  onQuickFilterChange(filter: 'all' | 'active' | 'unavailable') {
    this.quickFilter = filter;
    this.quickFilterChange.emit(filter);
  }

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    this.dateFilterChange.emit(dateFilter);
  }
}
