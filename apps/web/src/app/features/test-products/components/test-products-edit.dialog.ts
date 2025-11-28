import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TestProductService } from '../services/test-products.service';
import {
  TestProduct,
  UpdateTestProductRequest,
} from '../types/test-products.types';
import {
  TestProductFormComponent,
  TestProductFormData,
} from './test-products-form.component';

export interface TestProductEditDialogData {
  testProducts: TestProduct;
}

@Component({
  selector: 'app-test-products-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TestProductFormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <!-- Dialog Header -->
    <h2 mat-dialog-title class="ax-header ax-header-warning">
      <div class="ax-icon-warning">
        <mat-icon>edit</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">Edit TestProduct</div>
        <div class="ax-subtitle">Update testproduct information</div>
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

    <!-- Dialog Content - Form component handles mat-dialog-content and mat-dialog-actions -->
    <app-test-products-form
      mode="edit"
      [initialData]="data.testProducts"
      [loading]="loading()"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onCancel()"
    ></app-test-products-form>
  `,
  styles: [
    `
      /* Header text wrapper for flex layout */
      .header-text {
        flex: 1;
        min-width: 0;
      }
    `,
  ],
})
export class TestProductEditDialogComponent implements OnInit {
  private testProductsService = inject(TestProductService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<TestProductEditDialogComponent>);
  public data = inject<TestProductEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: TestProductFormData) {
    this.loading.set(true);

    try {
      const updateRequest = formData as UpdateTestProductRequest;
      const result = await this.testProductsService.updateTestProduct(
        this.data.testProducts.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('TestProduct updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update testproduct', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.testProductsService.permissionError()
        ? 'You do not have permission to update testproduct'
        : error?.message || 'Failed to update testproduct';
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
