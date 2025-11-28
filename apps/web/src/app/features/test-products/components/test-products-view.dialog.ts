import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TestProduct } from '../types/test-products.types';

export interface TestProductViewDialogData {
  testProducts: TestProduct;
}

@Component({
  selector: 'app-test-products-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <!-- Dialog Header -->
    <h2 mat-dialog-title class="ax-header ax-header-neutral">
      <div class="ax-icon-neutral">
        <mat-icon>visibility</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">TestProduct Details</div>
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
            <div class="ax-dialog-field-label">Code</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.code || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Name</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.name || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Slug</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.slug || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Description</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.description || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Is Active</div>
            <div class="ax-dialog-field-value">
              @if (data.testProducts?.is_active) {
                <span class="ax-dialog-status-success">
                  <span class="ax-dialog-status-dot"></span>
                  Yes
                </span>
              } @else {
                <span class="ax-dialog-status-neutral">
                  <span class="ax-dialog-status-dot"></span>
                  No
                </span>
              }
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Is Featured</div>
            <div class="ax-dialog-field-value">
              @if (data.testProducts?.is_featured) {
                <span class="ax-dialog-status-success">
                  <span class="ax-dialog-status-dot"></span>
                  Yes
                </span>
              } @else {
                <span class="ax-dialog-status-neutral">
                  <span class="ax-dialog-status-dot"></span>
                  No
                </span>
              }
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Display Order</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.display_order ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Item Count</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.item_count ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Discount Rate</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.discount_rate ?? '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Metadata</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.metadata || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Settings</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.settings || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Status</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.status || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Created By</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.created_by || '-' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Updated By</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.updated_by | date: 'mediumDate' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Deleted At</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.deleted_at | date: 'mediumDate' }}
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
              <code>{{ data.testProducts?.id }}</code>
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Created At</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.created_at | date: 'medium' }}
            </div>
          </div>
          <div class="ax-dialog-field-row">
            <div class="ax-dialog-field-label">Updated At</div>
            <div class="ax-dialog-field-value">
              {{ data.testProducts?.updated_at | date: 'medium' }}
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
        Edit TestProduct
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
export class TestProductViewDialogComponent {
  private dialogRef = inject(MatDialogRef<TestProductViewDialogComponent>);
  protected data = inject<TestProductViewDialogData>(MAT_DIALOG_DATA);

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', data: this.data.testProducts });
  }
}
