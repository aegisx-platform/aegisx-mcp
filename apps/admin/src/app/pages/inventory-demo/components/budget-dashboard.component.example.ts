import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetDashboardComponent } from './budget-dashboard.component';

/**
 * Example usage of BudgetDashboardComponent
 *
 * This example demonstrates how to use the budget dashboard component
 * to display comprehensive budget status for a budget request.
 */
@Component({
  selector: 'app-budget-dashboard-example',
  standalone: true,
  imports: [CommonModule, BudgetDashboardComponent],
  template: `
    <div class="example-container">
      <h2>Budget Dashboard Example</h2>

      <!-- Example 1: Basic usage -->
      <section class="example-section">
        <h3>Example 1: Basic Dashboard</h3>
        <app-budget-dashboard [budgetRequestId]="123" />
      </section>

      <!-- Example 2: With dynamic budget request ID -->
      <section class="example-section">
        <h3>Example 2: Dynamic Budget Request</h3>
        <div class="controls">
          <label>
            Budget Request ID:
            <input
              type="number"
              [(ngModel)]="selectedBudgetRequestId"
              min="1"
            />
          </label>
        </div>
        <app-budget-dashboard [budgetRequestId]="selectedBudgetRequestId" />
      </section>

      <!-- Example 3: In a card layout -->
      <section class="example-section">
        <h3>Example 3: Card Layout</h3>
        <div class="card-container">
          <app-budget-dashboard [budgetRequestId]="456" />
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .example-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .example-section {
        margin-bottom: 3rem;
        padding: 2rem;
        background: #f9fafb;
        border-radius: 0.5rem;
      }

      .example-section h3 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .controls {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: white;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;
      }

      .controls label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 500;
        color: #374151;
      }

      .controls input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 1rem;
      }

      .card-container {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class BudgetDashboardExampleComponent {
  /**
   * Selected budget request ID for Example 2
   */
  selectedBudgetRequestId = 123;
}

/**
 * Usage Instructions:
 *
 * 1. Import the component:
 *    ```typescript
 *    import { BudgetDashboardComponent } from '@app/pages/inventory-demo/components';
 *    ```
 *
 * 2. Add to your component imports:
 *    ```typescript
 *    @Component({
 *      imports: [BudgetDashboardComponent],
 *      // ...
 *    })
 *    ```
 *
 * 3. Use in template:
 *    ```html
 *    <app-budget-dashboard [budgetRequestId]="123" />
 *    ```
 *
 * Features:
 * - Summary cards: Total budget, used, remaining, usage percentage
 * - Control type breakdown: HARD/SOFT/NONE item counts
 * - Status breakdown: Normal/Warning/Exceeded item counts
 * - Filterable item table with:
 *   - Control type filter (HARD/SOFT/NONE)
 *   - Status filter (normal/warning/exceeded)
 *   - Search by drug name/code
 * - Dual progress bars for each item (quantity + amount)
 * - Color-coded status badges:
 *   - 🔴 Red: Exceeded (≥100% usage)
 *   - 🟡 Yellow: Warning (80-99% usage)
 *   - ✅ Green: Normal (<80% usage)
 * - Export to CSV functionality (placeholder)
 * - View related PRs (placeholder)
 *
 * API Endpoint:
 * - GET `/api/inventory/budget/budget-requests/:id/items-status`
 * - Returns: BudgetItemsStatusResponse with items array and summary
 * - Authentication: Required (budgetRequests:read permission)
 *
 * Data Structure:
 * ```typescript
 * interface BudgetItemsStatusResponse {
 *   budget_request_id: number;
 *   fiscal_year: number;
 *   current_quarter: number; // 1-4
 *   items: BudgetItemStatus[];
 *   summary: {
 *     total_items: number;
 *     normal_items: number;
 *     warning_items: number;
 *     exceeded_items: number;
 *     total_planned_amount: number;
 *     total_used_amount: number;
 *     total_remaining_amount: number;
 *     overall_usage_percent: number;
 *   };
 * }
 * ```
 *
 * Performance:
 * - Uses virtual scrolling for tables with 1000+ items
 * - Computed signals for efficient filtering
 * - Reactive data loading with toSignal()
 * - Optimized re-rendering with OnPush strategy
 *
 * Accessibility:
 * - ARIA labels on interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly
 * - High contrast colors
 */
