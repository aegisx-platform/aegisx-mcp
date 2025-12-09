import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { BudgetRequestItem } from '../types/budget-request-items.types';

export interface BudgetRequestItemViewDialogData {
  budgetRequestItems: BudgetRequestItem;
}

@Component({
  selector: 'app-budget-request-items-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <!-- Dialog Header -->
    <h2 mat-dialog-title class="ax-header ax-header-neutral">
      <div class="ax-icon-neutral">
        <mat-icon>visibility</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">BudgetRequestItem Details</div>
        <div class="ax-subtitle">View complete information</div>
      </div>
      <button
        type="button"
        mat-icon-button
        [mat-dialog-close]="false"
        aria-label="Close dialog"
      >
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <!-- Dialog Content -->
    <mat-dialog-content>
      <!-- Basic Information -->
      <div class="ax-dialog-section">
        <h3 class="ax-dialog-section-title">Basic Information</h3>
        <div class="ax-dialog-section-content">
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Budget Request Id</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.budget_request_id ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Budget Id</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.budget_id ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Requested Amount</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.requested_amount ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Q1 Qty</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.q1_qty ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Q2 Qty</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.q2_qty ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Q3 Qty</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.q3_qty ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Q4 Qty</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.q4_qty ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Item Justification</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.item_justification || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Drug Id</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.drug_id ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Generic Id</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.generic_id ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Generic Code</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.generic_code || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Generic Name</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.generic_name || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Package Size</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.package_size || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Unit</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.unit || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Line Number</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.line_number ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Avg Usage</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.avg_usage ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Estimated Usage 2569</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.estimated_usage_2569 ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Current Stock</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.current_stock ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Estimated Purchase</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.estimated_purchase ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Unit Price</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.unit_price ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Requested Qty</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.requested_qty ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Budget Type Id</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.budget_type_id ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Budget Category Id</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.budget_category_id ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Historical Usage</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.historical_usage || '-' }}
            </div>
          </div>
        </div>
      </div>
      <!-- Record Information -->
      <div class="ax-dialog-section">
        <h3 class="ax-dialog-section-title">Record Information</h3>
        <div class="ax-dialog-section-content ax-dialog-section-metadata">
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Id</div>
            <div class="ax-dialog-field-value">
              <code>{{ data.budgetRequestItems?.id }}</code>
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Created At</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.created_at | date: 'medium' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Updated At</div>
            <div class="ax-dialog-field-value">
              {{ data.budgetRequestItems?.updated_at | date: 'medium' }}
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <!-- Dialog Actions -->
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
      <button mat-flat-button color="primary" (click)="onEdit()">
        <mat-icon>edit</mat-icon>
        Edit BudgetRequestItem
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Header text wrapper for flex layout */
      .header-text {
        flex: 1;
        min-width: 0;
      }

      /* Badge Styles */
      .badge-purple {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: var(--ax-info-faint, #f3e8ff);
        color: var(--ax-info-emphasis, #7c3aed);
        border-radius: var(--ax-radius-sm, 4px);
        font-size: var(--ax-text-xs, 0.75rem);
      }

      /* Code Display */
      code {
        padding: 2px 6px;
        background: var(--ax-background-subtle, #f5f5f5);
        border-radius: var(--ax-radius-sm, 3px);
        font-size: 0.85rem;
        font-family: monospace;
      }

      /* Price Display */
      .price {
        font-weight: var(--ax-font-semibold, 600);
        color: var(--ax-success-emphasis, #059669);
      }
    `,
  ],
})
export class BudgetRequestItemViewDialogComponent {
  private dialogRef = inject(
    MatDialogRef<BudgetRequestItemViewDialogComponent>,
  );
  protected data = inject<BudgetRequestItemViewDialogData>(MAT_DIALOG_DATA);

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({
      action: 'edit',
      data: this.data.budgetRequestItems,
    });
  }
}
