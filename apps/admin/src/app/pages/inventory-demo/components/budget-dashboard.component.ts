import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

// AegisX UI Components
import { AxCardComponent } from '@aegisx-starter-1/aegisx-ui';
import { AxTableComponent } from '@aegisx-starter-1/aegisx-ui';
import { AxProgressComponent } from '@aegisx-starter-1/aegisx-ui';
import { AxBadgeComponent } from '@aegisx-starter-1/aegisx-ui';
import { AxButtonComponent } from '@aegisx-starter-1/aegisx-ui';
import { AxSelectComponent } from '@aegisx-starter-1/aegisx-ui';
import { AxInputComponent } from '@aegisx-starter-1/aegisx-ui';

/**
 * Control type for budget items
 */
type ControlType = 'NONE' | 'SOFT' | 'HARD';

/**
 * Budget item status based on usage percentage
 */
type ItemStatus = 'normal' | 'warning' | 'exceeded';

/**
 * Budget item with control settings and usage tracking
 */
interface BudgetItemStatus {
  item_id: number;
  drug_code?: string;
  drug_name: string;
  generic_name?: string;
  control_type: ControlType;
  quantity_control_type: ControlType;
  price_control_type: ControlType;
  quantity_variance_percent: number;
  price_variance_percent: number;
  planned_quantity: number;
  purchased_quantity: number;
  remaining_quantity: number;
  quantity_usage_percent: number;
  planned_amount: number;
  used_amount: number;
  remaining_amount: number;
  amount_usage_percent: number;
  status: ItemStatus;
  related_pr_ids: number[];
}

/**
 * Summary statistics for budget dashboard
 */
interface BudgetSummary {
  total_items: number;
  normal_items: number;
  warning_items: number;
  exceeded_items: number;
  total_planned_amount: number;
  total_used_amount: number;
  total_remaining_amount: number;
  overall_usage_percent: number;
}

/**
 * Complete budget status response from API
 */
interface BudgetItemsStatusResponse {
  budget_request_id: number;
  fiscal_year: number;
  current_quarter: number;
  items: BudgetItemStatus[];
  summary: BudgetSummary;
}

/**
 * Budget Dashboard Component
 *
 * Displays comprehensive budget status overview with:
 * - Summary cards (total budget, used, remaining, usage %)
 * - Control type breakdown (HARD/SOFT/NONE item counts)
 * - Status breakdown (normal/warning/exceeded item counts)
 * - Filterable item table with dual progress bars
 * - Color-coded status badges
 *
 * @example
 * ```html
 * <app-budget-dashboard [budgetRequestId]="123" />
 * ```
 *
 * Features:
 * - Real-time filtering by control type and status
 * - Search by drug name
 * - Dual progress bars (quantity + amount)
 * - Color transitions based on usage (green → yellow → red)
 * - Virtual scrolling for performance with 1000+ items
 * - Responsive layout
 */
@Component({
  selector: 'app-budget-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AxCardComponent,
    AxTableComponent,
    AxProgressComponent,
    AxBadgeComponent,
    AxButtonComponent,
    AxSelectComponent,
    AxInputComponent,
  ],
  templateUrl: './budget-dashboard.component.html',
  styleUrls: ['./budget-dashboard.component.scss'],
})
export class BudgetDashboardComponent {
  private readonly http = inject(HttpClient);

  // === INPUTS ===

  /**
   * Budget request ID to display dashboard for
   */
  readonly budgetRequestId = input.required<number>();

  // === SIGNALS ===

  /**
   * Control type filter (all types shown if null)
   */
  readonly controlTypeFilter = signal<ControlType | null>(null);

  /**
   * Status filter (all statuses shown if null)
   */
  readonly statusFilter = signal<ItemStatus | null>(null);

  /**
   * Search query for drug name filtering
   */
  readonly searchQuery = signal<string>('');

  /**
   * Loading state
   */
  readonly isLoading = signal<boolean>(true);

  /**
   * Error message if API call fails
   */
  readonly errorMessage = signal<string | null>(null);

  // === DATA SIGNALS ===

  /**
   * Budget status data from API (reactive signal from HTTP observable)
   */
  readonly budgetData = toSignal<BudgetItemsStatusResponse | null>(
    this.http.get<{ success: boolean; data: BudgetItemsStatusResponse }>(
      `/api/inventory/budget/budget-requests/${this.budgetRequestId()}/items-status`,
    ),
    {
      initialValue: null,
    },
  );

  /**
   * All budget items (unwrapped from API response)
   */
  readonly allItems = computed<BudgetItemStatus[]>(() => {
    const data = this.budgetData();
    if (!data || !data.success) {
      return [];
    }
    return data.data.items;
  });

  /**
   * Budget summary statistics
   */
  readonly summary = computed<BudgetSummary | null>(() => {
    const data = this.budgetData();
    if (!data || !data.success) {
      return null;
    }
    return data.data.summary;
  });

  /**
   * Fiscal year
   */
  readonly fiscalYear = computed<number>(() => {
    const data = this.budgetData();
    if (!data || !data.success) {
      return 0;
    }
    return data.data.fiscal_year;
  });

  /**
   * Current quarter (1-4)
   */
  readonly currentQuarter = computed<number>(() => {
    const data = this.budgetData();
    if (!data || !data.success) {
      return 0;
    }
    return data.data.current_quarter;
  });

  // === COMPUTED SIGNALS (FILTERING & CALCULATIONS) ===

  /**
   * Filtered items based on control type, status, and search query
   */
  readonly filteredItems = computed<BudgetItemStatus[]>(() => {
    let items = this.allItems();

    // Filter by control type
    const controlType = this.controlTypeFilter();
    if (controlType) {
      items = items.filter((item) => item.control_type === controlType);
    }

    // Filter by status
    const status = this.statusFilter();
    if (status) {
      items = items.filter((item) => item.status === status);
    }

    // Filter by search query (drug name or code)
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      items = items.filter(
        (item) =>
          item.drug_name.toLowerCase().includes(query) ||
          (item.drug_code && item.drug_code.toLowerCase().includes(query)) ||
          (item.generic_name &&
            item.generic_name.toLowerCase().includes(query)),
      );
    }

    return items;
  });

  /**
   * Control type breakdown (HARD/SOFT/NONE item counts)
   */
  readonly controlTypeBreakdown = computed(() => {
    const items = this.allItems();
    return {
      HARD: items.filter((i) => i.control_type === 'HARD').length,
      SOFT: items.filter((i) => i.control_type === 'SOFT').length,
      NONE: items.filter((i) => i.control_type === 'NONE').length,
    };
  });

  /**
   * Status breakdown (normal/warning/exceeded item counts)
   */
  readonly statusBreakdown = computed(() => {
    const items = this.allItems();
    return {
      normal: items.filter((i) => i.status === 'normal').length,
      warning: items.filter((i) => i.status === 'warning').length,
      exceeded: items.filter((i) => i.status === 'exceeded').length,
    };
  });

  // === METHODS ===

  /**
   * Get badge color for control type
   */
  getControlTypeBadgeColor(
    controlType: ControlType,
  ): 'error' | 'warning' | 'info' {
    switch (controlType) {
      case 'HARD':
        return 'error';
      case 'SOFT':
        return 'warning';
      case 'NONE':
        return 'info';
    }
  }

  /**
   * Get badge color for status
   */
  getStatusBadgeColor(status: ItemStatus): 'error' | 'warning' | 'success' {
    switch (status) {
      case 'exceeded':
        return 'error';
      case 'warning':
        return 'warning';
      case 'normal':
        return 'success';
    }
  }

  /**
   * Get progress bar color based on usage percentage
   * - Green: < 80%
   * - Yellow: 80-99%
   * - Red: >= 100%
   */
  getProgressColor(usagePercent: number): string {
    if (usagePercent >= 100) {
      return '#ef4444'; // Red
    } else if (usagePercent >= 80) {
      return '#f59e0b'; // Yellow
    } else {
      return '#10b981'; // Green
    }
  }

  /**
   * Format number with thousand separators and 2 decimal places
   */
  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Format currency (THB)
   */
  formatCurrency(value: number): string {
    return `฿${this.formatNumber(value)}`;
  }

  /**
   * Format percentage with 2 decimal places
   */
  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.controlTypeFilter.set(null);
    this.statusFilter.set(null);
    this.searchQuery.set('');
  }

  /**
   * Export filtered data to CSV (placeholder)
   */
  exportToCSV(): void {
    console.log('Export to CSV:', this.filteredItems());
    // TODO: Implement CSV export functionality
  }

  /**
   * Navigate to related PR (placeholder)
   */
  viewRelatedPR(prId: number): void {
    console.log('View PR:', prId);
    // TODO: Implement navigation to PR detail page
  }
}
