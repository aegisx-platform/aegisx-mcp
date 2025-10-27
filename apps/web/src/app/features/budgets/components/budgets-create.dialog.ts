import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BudgetService } from '../services/budgets.service';
import { CreateBudgetRequest } from '../types/budgets.types';
import { BudgetFormComponent, BudgetFormData } from './budgets-form.component';

@Component({
  selector: 'app-budgets-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BudgetFormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="tremor-dialog-container">
      <!-- Header with Icon -->
      <div class="tremor-dialog-header bg-slate-100">
        <div class="flex items-center gap-3">
          <div class="tremor-icon-wrapper tremor-icon-green">
            <mat-icon>add_circle</mat-icon>
          </div>
          <div>
            <h2 class="tremor-dialog-title">Create New Budget</h2>
            <p class="tremor-dialog-subtitle">
              Add a new budget to your collection
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

      <!-- Content -->
      <mat-dialog-content class="tremor-dialog-content">
        <app-budgets-form
          mode="create"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-budgets-form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      /* Tremor-inspired Dialog Styles */
      .tremor-dialog-container {
        display: flex;
        flex-direction: column;
        min-width: 600px;
        max-width: 900px;
        max-height: 90vh;
      }

      /* Header */
      .tremor-dialog-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(to bottom, #ffffff, #f9fafb);
      }

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

      .tremor-close-button {
        color: #6b7280;
      }

      .tremor-close-button:hover {
        color: #111827;
        background: #f3f4f6;
      }

      /* Content */
      .tremor-dialog-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
      }

      .bg-slate-100 {
        background-color: #f1f5f9;
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
        .tremor-dialog-container {
          min-width: 90vw;
        }

        .tremor-dialog-header {
          padding: 1rem;
        }

        .tremor-dialog-content {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class BudgetCreateDialogComponent {
  private budgetsService = inject(BudgetService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BudgetCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: BudgetFormData) {
    this.loading.set(true);

    try {
      const createRequest = formData as CreateBudgetRequest;
      const result = await this.budgetsService.createBudget(createRequest);

      if (result) {
        this.snackBar.open('Budget created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create budget', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.budgetsService.permissionError()
        ? 'You do not have permission to create budget'
        : error?.message || 'Failed to create budget';
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
