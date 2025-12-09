import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BudgetRequestItemService } from '../services/budget-request-items.service';
import { CreateBudgetRequestItemRequest } from '../types/budget-request-items.types';
import {
  BudgetRequestItemFormComponent,
  BudgetRequestItemFormData,
} from './budget-request-items-form.component';

@Component({
  selector: 'app-budget-request-items-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BudgetRequestItemFormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <!-- Dialog Header -->
    <h2 mat-dialog-title class="ax-header ax-header-info">
      <div class="ax-icon-info">
        <mat-icon>add_circle</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">Create New BudgetRequestItem</div>
        <div class="ax-subtitle">
          Add a new budgetrequestitem to your collection
        </div>
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
    <app-budget-request-items-form
      mode="create"
      [loading]="loading()"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onCancel()"
    ></app-budget-request-items-form>
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
export class BudgetRequestItemCreateDialogComponent {
  private budgetRequestItemsService = inject(BudgetRequestItemService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(
    MatDialogRef<BudgetRequestItemCreateDialogComponent>,
  );

  loading = signal<boolean>(false);

  async onFormSubmit(formData: BudgetRequestItemFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const createRequest =
        formData as unknown as CreateBudgetRequestItemRequest;
      const result =
        await this.budgetRequestItemsService.createBudgetRequestItem(
          createRequest,
        );

      if (result) {
        this.snackBar.open('BudgetRequestItem created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create budgetrequestitem', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.budgetRequestItemsService.permissionError()
        ? 'You do not have permission to create budgetrequestitem'
        : error?.message || 'Failed to create budgetrequestitem';
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
