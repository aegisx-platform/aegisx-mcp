import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-test-products-list-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <!-- Filters Panel -->
    <div class="bg-slate-100 rounded-lg border border-gray-200 p-5 mb-4">
      <!-- Main Filter Row -->
      <div class="flex flex-col md:flex-row gap-3 md:items-center">
        <!-- Search Input with Buttons (single row, no wrap) -->
        <div class="flex flex-row flex-nowrap gap-2 items-center md:w-2/5">
          <div class="relative flex-1 min-w-0">
            <!-- Search icon - hide when loading -->
            @if (!loading) {
              <mat-icon
                class="absolute left-3 top-3 !text-lg !w-5 !h-5 text-gray-400"
                >search</mat-icon
              >
            }
            <!-- Loading spinner - left side when loading -->
            @if (loading) {
              <mat-spinner
                class="absolute left-3 top-1/2 -translate-y-1/2"
                [diameter]="20"
                [strokeWidth]="3"
              >
              </mat-spinner>
            }
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (keyup.enter)="onSearch()"
              placeholder="Search by ... (Press Enter or click Search)"
              aria-label="Search test_products"
              [class.pr-10]="searchTerm"
              class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <!-- Clear button (show when search term exists and not loading) -->
            @if (searchTerm && !loading) {
              <button
                (click)="onClearSearch()"
                aria-label="Clear search"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <mat-icon class="!text-lg !w-5 !h-5">close</mat-icon>
              </button>
            }
            <!-- Clear button with loading (show when both) -->
            @if (searchTerm && loading) {
              <button
                (click)="onClearSearch()"
                aria-label="Clear search"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors opacity-50"
              >
                <mat-icon class="!text-lg !w-5 !h-5">close</mat-icon>
              </button>
            }
          </div>
          <button
            (click)="onSearch()"
            class="flex-shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            aria-label="Search"
            [matTooltip]="
              searchTerm.trim()
                ? 'Search test_products'
                : 'Enter search term to search'
            "
          >
            <mat-icon class="!text-lg !w-5 !h-5">search</mat-icon>
            Search
          </button>
          <button
            (click)="refreshClicked.emit()"
            class="flex-shrink-0 px-3 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
            [class.opacity-50]="loading"
            [class.cursor-wait]="loading"
            aria-label="Refresh"
            [matTooltip]="loading ? 'Loading...' : 'Reload all test_products'"
          >
            <mat-icon class="!text-lg !w-5 !h-5">refresh</mat-icon>
          </button>
        </div>

        <!-- Quick Filters - flex grow -->
        <div class="flex items-center gap-2 flex-wrap flex-1">
          <button
            (click)="onQuickFilterChange('all')"
            [class]="
              quickFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
          >
            All
          </button>
          <button
            (click)="onQuickFilterChange('active')"
            [class]="
              quickFilter === 'active'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
          >
            Available
          </button>
          <button
            (click)="onQuickFilterChange('unavailable')"
            [class]="
              quickFilter === 'unavailable'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
          >
            Unavailable
          </button>

          <!-- Divider -->
          <div class="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

          <!-- Advanced Filters Toggle -->
          <button
            (click)="showAdvancedFilters.set(!showAdvancedFilters())"
            [class]="
              showAdvancedFilters()
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-700 border-gray-300'
            "
            class="px-3 py-2 text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <mat-icon class="!text-base !w-4 !h-4">tune</mat-icon>
            Advanced Filters
            @if (activeFilterCount > 0) {
              <span
                class="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full"
                >{{ activeFilterCount }}</span
              >
            }
          </button>

          <!-- Spacer to push items to right -->
          <div class="flex-1"></div>

          <!-- Export Button -->
          <ng-content select="[export]"></ng-content>

          <!-- Clear All (show when filters active) -->
          @if (activeFilterCount > 0) {
            <button
              (click)="clearAllClicked.emit()"
              class="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
            >
              <mat-icon class="!text-base !w-4 !h-4">clear</mat-icon>
              Clear
            </button>
          }
        </div>
      </div>

      <!-- Active Filter Chips -->
      @if (activeFilterCount > 0) {
        <div class="mt-3 flex flex-wrap gap-2">
          <ng-content select="[filter-chips]"></ng-content>
        </div>
      }

      <!-- Advanced Filters Panel -->
      @if (showAdvancedFilters()) {
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Sku Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Sku</label
              >
              <input
                type="text"
                [(ngModel)]="skuFilter"
                (ngModelChange)="skuFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter sku"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Name Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Name</label
              >
              <input
                type="text"
                [(ngModel)]="nameFilter"
                (ngModelChange)="nameFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter name"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Barcode Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Barcode</label
              >
              <input
                type="text"
                [(ngModel)]="barcodeFilter"
                (ngModelChange)="barcodeFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter barcode"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Manufacturer Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Manufacturer</label
              >
              <input
                type="text"
                [(ngModel)]="manufacturerFilter"
                (ngModelChange)="manufacturerFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter manufacturer"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Description Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Description</label
              >
              <input
                type="text"
                [(ngModel)]="descriptionFilter"
                (ngModelChange)="descriptionFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter description"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Long Description Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Long Description</label
              >
              <input
                type="text"
                [(ngModel)]="long_descriptionFilter"
                (ngModelChange)="long_descriptionFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter long description"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Specifications Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Specifications</label
              >
              <input
                type="text"
                [(ngModel)]="specificationsFilter"
                (ngModelChange)="specificationsFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter specifications"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Status</label
              >
              <input
                type="text"
                [(ngModel)]="statusFilter"
                (ngModelChange)="statusFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Select status"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Condition Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Condition</label
              >
              <input
                type="text"
                [(ngModel)]="conditionFilter"
                (ngModelChange)="conditionFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter condition"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Availability Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Availability</label
              >
              <input
                type="text"
                [(ngModel)]="availabilityFilter"
                (ngModelChange)="availabilityFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter availability"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Created By Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Created By</label
              >
              <input
                type="text"
                [(ngModel)]="created_byFilter"
                (ngModelChange)="created_byFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter created by"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- Updated By Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Updated By</label
              >
              <input
                type="text"
                [(ngModel)]="updated_byFilter"
                (ngModelChange)="updated_byFilterChange.emit($event)"
                (keyup.enter)="applyFiltersClicked.emit()"
                placeholder="Enter updated by"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Is Active Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Is Active</label
              >
              <select
                [(ngModel)]="is_activeFilter"
                (ngModelChange)="is_activeFilterChange.emit($event)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [ngValue]="undefined">All</option>
                <option [ngValue]="true">Yes</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
            <!-- Is Featured Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Is Featured</label
              >
              <select
                [(ngModel)]="is_featuredFilter"
                (ngModelChange)="is_featuredFilterChange.emit($event)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [ngValue]="undefined">All</option>
                <option [ngValue]="true">Yes</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
            <!-- Is Taxable Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Is Taxable</label
              >
              <select
                [(ngModel)]="is_taxableFilter"
                (ngModelChange)="is_taxableFilterChange.emit($event)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [ngValue]="undefined">All</option>
                <option [ngValue]="true">Yes</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
            <!-- Is Shippable Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Is Shippable</label
              >
              <select
                [(ngModel)]="is_shippableFilter"
                (ngModelChange)="is_shippableFilterChange.emit($event)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [ngValue]="undefined">All</option>
                <option [ngValue]="true">Yes</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
            <!-- Allow Backorder Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5"
                >Allow Backorder</label
              >
              <select
                [(ngModel)]="allow_backorderFilter"
                (ngModelChange)="allow_backorderFilterChange.emit($event)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [ngValue]="undefined">All</option>
                <option [ngValue]="true">Yes</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
          </div>

          <!-- Apply Filters Button -->
          <div class="mt-4 flex justify-end gap-2">
            <button
              (click)="clearAllClicked.emit()"
              class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              (click)="applyFiltersClicked.emit()"
              [disabled]="loading"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class TestProductsListFiltersComponent {
  @Input({ required: true }) activeFilterCount!: number;
  @Input() loading = false;

  // Two-way binding properties
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();

  @Input() quickFilter: 'all' | 'active' | 'unavailable' = 'all';
  @Output() quickFilterChange = new EventEmitter<
    'all' | 'active' | 'unavailable'
  >();

  // Sku filter
  @Input() skuFilter = '';
  @Output() skuFilterChange = new EventEmitter<string>();
  // Name filter
  @Input() nameFilter = '';
  @Output() nameFilterChange = new EventEmitter<string>();
  // Barcode filter
  @Input() barcodeFilter = '';
  @Output() barcodeFilterChange = new EventEmitter<string>();
  // Manufacturer filter
  @Input() manufacturerFilter = '';
  @Output() manufacturerFilterChange = new EventEmitter<string>();
  // Description filter
  @Input() descriptionFilter = '';
  @Output() descriptionFilterChange = new EventEmitter<string>();
  // Long Description filter
  @Input() long_descriptionFilter = '';
  @Output() long_descriptionFilterChange = new EventEmitter<string>();
  // Specifications filter
  @Input() specificationsFilter = '';
  @Output() specificationsFilterChange = new EventEmitter<string>();
  // Status filter
  @Input() statusFilter = '';
  @Output() statusFilterChange = new EventEmitter<string>();
  // Condition filter
  @Input() conditionFilter = '';
  @Output() conditionFilterChange = new EventEmitter<string>();
  // Availability filter
  @Input() availabilityFilter = '';
  @Output() availabilityFilterChange = new EventEmitter<string>();
  // Created By filter
  @Input() created_byFilter = '';
  @Output() created_byFilterChange = new EventEmitter<string>();
  // Updated By filter
  @Input() updated_byFilter = '';
  @Output() updated_byFilterChange = new EventEmitter<string>();

  // Is Active filter
  @Input() is_activeFilter: boolean | undefined = undefined;
  @Output() is_activeFilterChange = new EventEmitter<boolean | undefined>();
  // Is Featured filter
  @Input() is_featuredFilter: boolean | undefined = undefined;
  @Output() is_featuredFilterChange = new EventEmitter<boolean | undefined>();
  // Is Taxable filter
  @Input() is_taxableFilter: boolean | undefined = undefined;
  @Output() is_taxableFilterChange = new EventEmitter<boolean | undefined>();
  // Is Shippable filter
  @Input() is_shippableFilter: boolean | undefined = undefined;
  @Output() is_shippableFilterChange = new EventEmitter<boolean | undefined>();
  // Allow Backorder filter
  @Input() allow_backorderFilter: boolean | undefined = undefined;
  @Output() allow_backorderFilterChange = new EventEmitter<
    boolean | undefined
  >();

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
