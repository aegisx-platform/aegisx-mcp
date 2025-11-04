import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TestProductService } from '../services/test-products.service';
import { CreateTestProductRequest } from '../types/test-products.types';
import {
  TestProductFormComponent,
  TestProductFormData,
} from './test-products-form.component';

@Component({
  selector: 'app-test-products-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TestProductFormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-container">
      <!-- Fixed Header (mat-dialog-title) -->
      <h2 mat-dialog-title class="dialog-header">
        <div class="header-content">
          <div class="flex items-center gap-3">
            <div class="tremor-icon-wrapper tremor-icon-green">
              <mat-icon>add_circle</mat-icon>
            </div>
            <div>
              <h3 class="tremor-dialog-title">Create New TestProduct</h3>
              <p class="tremor-dialog-subtitle">
                Add a new testproduct to your collection
              </p>
            </div>
          </div>
          <button
            type="button"
            mat-icon-button
            class="tremor-close-button"
            [mat-dialog-close]="false"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </h2>

      <!-- Scrollable Content -->
      <mat-dialog-content class="dialog-content">
        <app-test-products-form
          mode="create"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-test-products-form>
      </mat-dialog-content>
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
        background: linear-gradient(to bottom, #ffffff, #f9fafb);
        border-bottom: 1px solid #e5e7eb;
        padding: 1.5rem !important;
        margin: 0 !important;
      }

      .header-content {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      /* Icon Styles */
      .tremor-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
      }

      .tremor-icon-green {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
      }

      /* Title & Subtitle */
      .tremor-dialog-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
        line-height: 1.4;
      }

      .tremor-dialog-subtitle {
        margin: 0.25rem 0 0 0;
        font-size: 0.875rem;
        color: #6b7280;
      }

      /* Close Button */
      .tremor-close-button {
        color: #6b7280;
      }

      .tremor-close-button:hover {
        color: #111827;
        background: #f3f4f6;
      }

      /* Scrollable Content */
      .dialog-content {
        max-height: 60vh;
        overflow-y: auto;
        padding: 1.5rem;
      }

      /* Utility Classes */
      .flex {
        display: flex;
      }
      .items-center {
        align-items: center;
      }
      .gap-3 {
        gap: 0.75rem;
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
      }
    `,
  ],
})
export class TestProductCreateDialogComponent {
  private testProductsService = inject(TestProductService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<TestProductCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: TestProductFormData) {
    this.loading.set(true);

    try {
      const createRequest = formData as CreateTestProductRequest;
      const result =
        await this.testProductsService.createTestProduct(createRequest);

      if (result) {
        this.snackBar.open('TestProduct created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create testproduct', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.testProductsService.permissionError()
        ? 'You do not have permission to create testproduct'
        : error?.message || 'Failed to create testproduct';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
