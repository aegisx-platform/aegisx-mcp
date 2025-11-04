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
    <div class="dialog-container">
      <!-- Fixed Header (mat-dialog-title) -->
      <h2 mat-dialog-title class="dialog-header">TestProduct Details</h2>

      <!-- Scrollable Content -->
      <mat-dialog-content class="dialog-content">
        <div class="content-grid">
          <!-- Basic Information -->
          <div class="section">
            <h3 class="section-title">Basic Information</h3>

            <div class="field-row">
              <label>Sku</label>
              <div class="field-value">
                {{ data.testProducts?.sku || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Name</label>
              <div class="field-value">
                {{ data.testProducts?.name || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Barcode</label>
              <div class="field-value">
                {{ data.testProducts?.barcode || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Manufacturer</label>
              <div class="field-value">
                {{ data.testProducts?.manufacturer || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Description</label>
              <div class="field-value">
                {{ data.testProducts?.description || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Long Description</label>
              <div class="field-value">
                {{ data.testProducts?.long_description || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Specifications</label>
              <div class="field-value">
                {{ data.testProducts?.specifications || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Quantity</label>
              <div class="field-value">
                {{ data.testProducts?.quantity ?? '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Min Quantity</label>
              <div class="field-value">
                {{ data.testProducts?.min_quantity ?? '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Max Quantity</label>
              <div class="field-value">
                {{ data.testProducts?.max_quantity ?? '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Price</label>
              <div class="field-value">
                {{ data.testProducts?.price ?? '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Cost</label>
              <div class="field-value">
                {{ data.testProducts?.cost ?? '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Weight</label>
              <div class="field-value">
                {{ data.testProducts?.weight ?? '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Discount Percentage</label>
              <div class="field-value">
                {{ data.testProducts?.discount_percentage ?? '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Is Active</label>
              <div class="field-value">
                @if (data.testProducts?.is_active) {
                  <span class="status status-success">
                    <span class="status-dot"></span>
                    Yes
                  </span>
                } @else {
                  <span class="status status-gray">
                    <span class="status-dot"></span>
                    No
                  </span>
                }
              </div>
            </div>
            <div class="field-row">
              <label>Is Featured</label>
              <div class="field-value">
                @if (data.testProducts?.is_featured) {
                  <span class="status status-success">
                    <span class="status-dot"></span>
                    Yes
                  </span>
                } @else {
                  <span class="status status-gray">
                    <span class="status-dot"></span>
                    No
                  </span>
                }
              </div>
            </div>
            <div class="field-row">
              <label>Is Taxable</label>
              <div class="field-value">
                @if (data.testProducts?.is_taxable) {
                  <span class="status status-success">
                    <span class="status-dot"></span>
                    Yes
                  </span>
                } @else {
                  <span class="status status-gray">
                    <span class="status-dot"></span>
                    No
                  </span>
                }
              </div>
            </div>
            <div class="field-row">
              <label>Is Shippable</label>
              <div class="field-value">
                @if (data.testProducts?.is_shippable) {
                  <span class="status status-success">
                    <span class="status-dot"></span>
                    Yes
                  </span>
                } @else {
                  <span class="status status-gray">
                    <span class="status-dot"></span>
                    No
                  </span>
                }
              </div>
            </div>
            <div class="field-row">
              <label>Allow Backorder</label>
              <div class="field-value">
                @if (data.testProducts?.allow_backorder) {
                  <span class="status status-success">
                    <span class="status-dot"></span>
                    Yes
                  </span>
                } @else {
                  <span class="status status-gray">
                    <span class="status-dot"></span>
                    No
                  </span>
                }
              </div>
            </div>
            <div class="field-row">
              <label>Status</label>
              <div class="field-value">
                {{ data.testProducts?.status || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Condition</label>
              <div class="field-value">
                {{ data.testProducts?.condition || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Availability</label>
              <div class="field-value">
                {{ data.testProducts?.availability || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Launch Date</label>
              <div class="field-value">
                {{ data.testProducts?.launch_date | date: 'mediumDate' }}
              </div>
            </div>
            <div class="field-row">
              <label>Discontinued Date</label>
              <div class="field-value">
                {{ data.testProducts?.discontinued_date | date: 'mediumDate' }}
              </div>
            </div>
            <div class="field-row">
              <label>Last Stock Check</label>
              <div class="field-value">
                {{ data.testProducts?.last_stock_check || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Next Restock Date</label>
              <div class="field-value">
                {{ data.testProducts?.next_restock_date | date: 'mediumDate' }}
              </div>
            </div>
            <div class="field-row">
              <label>Attributes</label>
              <div class="field-value">
                {{ data.testProducts?.attributes || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Tags</label>
              <div class="field-value">
                {{ data.testProducts?.tags || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Images</label>
              <div class="field-value">
                {{ data.testProducts?.images || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Pricing Tiers</label>
              <div class="field-value">
                {{ data.testProducts?.pricing_tiers || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Dimensions</label>
              <div class="field-value">
                {{ data.testProducts?.dimensions || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Seo Metadata</label>
              <div class="field-value">
                {{ data.testProducts?.seo_metadata || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Category Id</label>
              <div class="field-value">
                {{ data.testProducts?.category_id || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Parent Product Id</label>
              <div class="field-value">
                {{ data.testProducts?.parent_product_id || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Supplier Id</label>
              <div class="field-value">
                {{ data.testProducts?.supplier_id || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Created By</label>
              <div class="field-value">
                {{ data.testProducts?.created_by || '-' }}
              </div>
            </div>
            <div class="field-row">
              <label>Updated By</label>
              <div class="field-value">
                {{ data.testProducts?.updated_by | date: 'mediumDate' }}
              </div>
            </div>
            <div class="field-row">
              <label>Deleted At</label>
              <div class="field-value">
                {{ data.testProducts?.deleted_at | date: 'mediumDate' }}
              </div>
            </div>
          </div>
          <!-- Record Information -->
          <div class="section section-metadata">
            <h3 class="section-title">Record Information</h3>

            <div class="field-row">
              <label>Id</label>
              <div class="field-value">
                <code>{{ data.testProducts?.id }}</code>
              </div>
            </div>
            <div class="field-row">
              <label>Created At</label>
              <div class="field-value">
                {{ data.testProducts?.created_at | date: 'medium' }}
              </div>
            </div>
            <div class="field-row">
              <label>Updated At</label>
              <div class="field-value">
                {{ data.testProducts?.updated_at | date: 'medium' }}
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <!-- Fixed Footer (mat-dialog-actions) -->
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onClose()">Close</button>
        <button mat-raised-button color="primary" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Edit TestProduct
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      /* Material Dialog Container */
      .dialog-container {
        display: flex;
        flex-direction: column;
        min-width: 600px;
        max-width: 900px;
      }

      /* Fixed Header (mat-dialog-title) */
      .dialog-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #ffffff;
        border-bottom: 1px solid #e5e7eb;
        padding: 1.5rem !important;
        margin: 0 !important;
      }

      /* Scrollable Content */
      .dialog-content {
        max-height: 60vh;
        overflow-y: auto;
        padding: 1.5rem;
      }

      /* Fixed Footer (mat-dialog-actions) */
      .dialog-actions {
        position: sticky;
        bottom: 0;
        z-index: 10;
        background: #ffffff;
        border-top: 1px solid #e5e7eb;
        padding: 1rem 1.5rem !important;
        margin: 0 !important;
      }

      /* Field Sections */
      .section {
        margin-bottom: 1.5rem;
      }

      .section:last-child {
        margin-bottom: 0;
      }

      .section-title {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #666;
      }

      .field-row {
        display: flex;
        margin-bottom: 0.75rem;
      }

      .field-row:last-child {
        margin-bottom: 0;
      }

      .field-row label {
        min-width: 140px;
        font-size: 0.875rem;
        color: #666;
      }

      .field-value {
        flex: 1;
        font-size: 0.875rem;
      }

      /* Badge Styles */
      .badge-purple {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: #f3e8ff;
        color: #7c3aed;
        border-radius: 4px;
        font-size: 0.75rem;
      }

      /* Status Indicators */
      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .status-success .status-dot {
        background: #16a34a;
      }

      .status-gray .status-dot {
        background: #9ca3af;
      }

      /* Code Display */
      code {
        padding: 2px 6px;
        background: #f5f5f5;
        border-radius: 3px;
        font-size: 0.85rem;
        font-family: monospace;
      }

      /* Price Display */
      .price {
        font-weight: 600;
        color: #059669;
      }

      /* Metadata Section */
      .section-metadata {
        background: #fafafa;
        padding: 0.75rem;
        border-radius: 4px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .dialog-container {
          min-width: 90vw;
        }

        .dialog-header {
          padding: 1rem !important;
        }

        .dialog-content {
          padding: 1rem;
        }

        .dialog-actions {
          padding: 0.75rem 1rem !important;
        }
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
