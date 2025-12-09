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

import { BudgetRequestItemService } from '../services/budget-request-items.service';
import {
  BudgetRequestItem,
  UpdateBudgetRequestItemRequest,
} from '../types/budget-request-items.types';
import {
  BudgetRequestItemFormComponent,
  BudgetRequestItemFormData,
} from './budget-request-items-form.component';

export interface BudgetRequestItemEditDialogData {
  budgetRequestItems: BudgetRequestItem;
}

@Component({
  selector: 'app-budget-request-items-edit-dialog',
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
    <h2 mat-dialog-title class="ax-header ax-header-warning">
      <div class="ax-icon-warning">
        <mat-icon>edit</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">Edit BudgetRequestItem</div>
        <div class="ax-subtitle">Update budgetrequestitem information</div>
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
      mode="edit"
      [initialData]="data.budgetRequestItems"
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
export class BudgetRequestItemEditDialogComponent implements OnInit {
  private budgetRequestItemsService = inject(BudgetRequestItemService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(
    MatDialogRef<BudgetRequestItemEditDialogComponent>,
  );
  public data = inject<BudgetRequestItemEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: BudgetRequestItemFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const updateRequest =
        formData as unknown as UpdateBudgetRequestItemRequest;
      const result =
        await this.budgetRequestItemsService.updateBudgetRequestItem(
          this.data.budgetRequestItems.id,
          updateRequest,
        );

      if (result) {
        this.snackBar.open('BudgetRequestItem updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update budgetrequestitem', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.budgetRequestItemsService.permissionError()
        ? 'You do not have permission to update budgetrequestitem'
        : error?.message || 'Failed to update budgetrequestitem';
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
