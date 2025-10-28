import { Component, output, input, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivityLogFilters, ACTION_TYPES, SEVERITY_CONFIG } from './activity-log.types';

@Component({
  selector: 'ax-activity-log-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  template: `
    <mat-card class="filter-card">
      <mat-card-content class="p-4">
        <form [formGroup]="filterForm" novalidate>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <mat-icon class="mr-2">filter_list</mat-icon>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filters
              </h3>
            </div>
            <div class="flex items-center space-x-2">
              @if (hasActiveFilters()) {
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {{ activeFiltersCount() }} active
                </span>
              }
              <button 
                mat-icon-button
                type="button"
                (click)="toggleExpanded()"
                [matTooltip]="isExpanded() ? 'Collapse filters' : 'Expand filters'"
              >
                <mat-icon>{{ isExpanded() ? 'expand_less' : 'expand_more' }}</mat-icon>
              </button>
            </div>
          </div>

          <!-- Quick Filters (Always Visible) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <!-- Search -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Search</mat-label>
              <input 
                matInput 
                formControlName="search" 
                placeholder="Search activities..."
                autocomplete="off"
              >
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Action Type -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Action Type</mat-label>
              <mat-select formControlName="action">
                <mat-option value="">All Actions</mat-option>
                @for (action of actionTypes; track action) {
                  <mat-option [value]="action">
                    {{ formatActionName(action) }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Severity -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Severity</mat-label>
              <mat-select formControlName="severity">
                <mat-option value="">All Severities</mat-option>
                @for (severity of severityTypes; track severity.value) {
                  <mat-option [value]="severity.value">
                    <div class="flex items-center">
                      <mat-icon [class]="severity.iconClass" class="mr-2 text-sm">
                        {{ severity.icon }}
                      </mat-icon>
                      {{ severity.label }}
                    </div>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Quick Actions -->
            <div class="flex items-end">
              <button 
                mat-raised-button 
                type="button"
                color="primary" 
                (click)="applyFilters()"
                class="mr-2"
              >
                <mat-icon class="mr-1">search</mat-icon>
                Apply
              </button>
              <button 
                mat-button 
                type="button"
                (click)="clearAllFilters()"
                [disabled]="!hasActiveFilters()"
              >
                Clear
              </button>
            </div>
          </div>

          <!-- Advanced Filters (Expandable) -->
          <mat-expansion-panel 
            [expanded]="isExpanded()"
            (expandedChange)="onExpandedChange($event)"
            class="advanced-filters"
            hideToggle
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              <!-- Date From -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>From Date</mat-label>
                <input 
                  matInput 
                  [matDatepicker]="dateFromPicker" 
                  formControlName="dateFrom"
                  placeholder="Start date"
                  readonly
                >
                <mat-datepicker-toggle matSuffix [for]="dateFromPicker"></mat-datepicker-toggle>
                <mat-datepicker #dateFromPicker></mat-datepicker>
              </mat-form-field>

              <!-- Date To -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>To Date</mat-label>
                <input 
                  matInput 
                  [matDatepicker]="dateToPicker" 
                  formControlName="dateTo"
                  placeholder="End date"
                  readonly
                >
                <mat-datepicker-toggle matSuffix [for]="dateToPicker"></mat-datepicker-toggle>
                <mat-datepicker #dateToPicker></mat-datepicker>
              </mat-form-field>

              <!-- Page Size -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Items per page</mat-label>
                <mat-select formControlName="limit">
                  @for (pageSize of pageSizeOptions; track pageSize) {
                    <mat-option [value]="pageSize">
                      {{ pageSize }} items
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Quick Date Filters -->
            <div class="mt-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Quick Date Filters
              </p>
              <div class="flex flex-wrap gap-2">
                @for (quickFilter of quickDateFilters; track quickFilter.label) {
                  <button 
                    mat-stroked-button
                    type="button"
                    size="small"
                    (click)="applyQuickDateFilter(quickFilter)"
                    class="text-xs"
                  >
                    {{ quickFilter.label }}
                  </button>
                }
              </div>
            </div>
          </mat-expansion-panel>

          <!-- Active Filters Display -->
          @if (hasActiveFilters()) {
            <div class="mt-4 pt-4 border-t dark:border-gray-700">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Active Filters
              </p>
              <div class="flex flex-wrap gap-2">
                @for (filter of activeFilters(); track filter.key) {
                  <mat-chip-listbox>
                    <mat-chip-option 
                      [removable]="true"
                      (removed)="removeFilter(filter.key)"
                      class="text-xs"
                    >
                      {{ filter.label }}: {{ filter.value }}
                      <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip-option>
                  </mat-chip-listbox>
                }
              </div>
            </div>
          }
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .filter-card {
      margin-bottom: 24px;
    }

    .advanced-filters {
      box-shadow: none !important;
      margin: 0;
      border: none;
    }

    ::ng-deep .advanced-filters .mat-expansion-panel-header {
      display: none;
    }

    ::ng-deep .advanced-filters .mat-expansion-panel-body {
      padding: 0;
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-chip {
      font-size: 0.75rem;
    }

    .mat-expansion-panel {
      border-radius: 0;
      box-shadow: none;
    }
  `]
})
export class ActivityLogFilterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Inputs and Outputs
  initialFilters = input<ActivityLogFilters>({ page: 1, limit: 20 });
  filtersChange = output<ActivityLogFilters>();

  // Signals
  isExpanded = signal<boolean>(false);

  // Form
  filterForm: FormGroup;

  // Options
  actionTypes = [...ACTION_TYPES];
  severityTypes = Object.entries(SEVERITY_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
    icon: config.icon,
    iconClass: this.getSeverityIconClass(key)
  }));
  
  pageSizeOptions = [10, 20, 50, 100];
  
  quickDateFilters = [
    { label: 'Today', days: 0 },
    { label: 'Last 3 days', days: 3 },
    { label: 'Last week', days: 7 },
    { label: 'Last month', days: 30 },
    { label: 'Last 3 months', days: 90 }
  ];

  // Computed signals
  hasActiveFilters = computed(() => {
    const values = this.filterForm?.getRawValue() || {};
    return Object.entries(values).some(([key, value]) => {
      if (key === 'page' || key === 'limit') return false;
      return value !== null && value !== undefined && value !== '';
    });
  });

  activeFiltersCount = computed(() => {
    const values = this.filterForm?.getRawValue() || {};
    return Object.entries(values).filter(([key, value]) => {
      if (key === 'page' || key === 'limit') return false;
      return value !== null && value !== undefined && value !== '';
    }).length;
  });

  activeFilters = computed(() => {
    const values = this.filterForm?.getRawValue() || {};
    const filters: Array<{ key: string; label: string; value: string }> = [];

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'page' || key === 'limit') return;
      if (value !== null && value !== undefined && value !== '') {
        let displayValue = String(value);
        let displayLabel = this.getFilterLabel(key);

        if (key === 'dateFrom' || key === 'dateTo') {
          displayValue = new Date(value as string | number | Date).toLocaleDateString();
        } else if (key === 'action') {
          displayValue = this.formatActionName(String(value));
        } else if (key === 'severity') {
          displayValue = SEVERITY_CONFIG[value as keyof typeof SEVERITY_CONFIG]?.label || String(value);
        }

        filters.push({
          key,
          label: displayLabel,
          value: displayValue
        });
      }
    });

    return filters;
  });

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      action: [''],
      severity: [''],
      dateFrom: [null],
      dateTo: [null],
      page: [1],
      limit: [20]
    });
  }

  ngOnInit(): void {
    // Initialize form with input values
    const initial = this.initialFilters();
    this.filterForm.patchValue(initial);

    // Set up form value changes with debounce for search
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Set up immediate changes for other fields
    this.filterForm.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((values) => {
        // Only auto-apply for non-search fields
        if (this.shouldAutoApply(values)) {
          this.applyFilters();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private shouldAutoApply(values: any): boolean {
    // Auto-apply for severity, action, and limit changes
    return true; // For now, auto-apply all changes except search (which has its own debounce)
  }

  toggleExpanded(): void {
    this.isExpanded.update(expanded => !expanded);
  }

  onExpandedChange(expanded: boolean): void {
    this.isExpanded.set(expanded);
  }

  applyFilters(): void {
    const formValues = this.filterForm.getRawValue();
    
    // Convert dates to ISO strings
    const filters: ActivityLogFilters = {
      ...formValues,
      dateFrom: formValues.dateFrom ? this.formatDateForApi(formValues.dateFrom) : undefined,
      dateTo: formValues.dateTo ? this.formatDateForApi(formValues.dateTo) : undefined,
      page: 1 // Reset to first page when applying filters
    };

    // Remove empty values
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof ActivityLogFilters];
      if (value === '' || value === null || value === undefined) {
        delete filters[key as keyof ActivityLogFilters];
      }
    });

    this.filtersChange.emit(filters);
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      search: '',
      action: '',
      severity: '',
      dateFrom: null,
      dateTo: null,
      page: 1,
      limit: 20
    });
    this.applyFilters();
  }

  removeFilter(filterKey: string): void {
    if (filterKey === 'dateFrom' || filterKey === 'dateTo') {
      this.filterForm.patchValue({ [filterKey]: null });
    } else {
      this.filterForm.patchValue({ [filterKey]: '' });
    }
    this.applyFilters();
  }

  applyQuickDateFilter(quickFilter: { label: string; days: number }): void {
    const today = new Date();
    const fromDate = new Date();
    
    if (quickFilter.days === 0) {
      // Today only
      fromDate.setHours(0, 0, 0, 0);
      today.setHours(23, 59, 59, 999);
    } else {
      // Last N days
      fromDate.setDate(today.getDate() - quickFilter.days);
      fromDate.setHours(0, 0, 0, 0);
      today.setHours(23, 59, 59, 999);
    }

    this.filterForm.patchValue({
      dateFrom: fromDate,
      dateTo: today
    });
    
    this.applyFilters();
  }

  formatActionName(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getSeverityIconClass(severity: string): string {
    switch (severity) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  private getFilterLabel(key: string): string {
    const labels: Record<string, string> = {
      search: 'Search',
      action: 'Action',
      severity: 'Severity',
      dateFrom: 'From',
      dateTo: 'To'
    };
    return labels[key] || key;
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString();
  }
}