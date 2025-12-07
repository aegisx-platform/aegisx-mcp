import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BankService } from '../services/bank.service';
import { CreateBankRequest } from '../types/bank.types';
import { BankFormComponent, BankFormData } from './bank-form.component';

@Component({
  selector: 'app-bank-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BankFormComponent,
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
        <div class="ax-title">Create New Bank</div>
        <div class="ax-subtitle">Add a new bank to your collection</div>
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
    <app-bank-form
      mode="create"
      [loading]="loading()"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onCancel()"
    ></app-bank-form>
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
export class BankCreateDialogComponent {
  private bankService = inject(BankService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BankCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: BankFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const createRequest = formData as unknown as CreateBankRequest;
      const result = await this.bankService.createBank(createRequest);

      if (result) {
        this.snackBar.open('Bank created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create bank', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.bankService.permissionError()
        ? 'You do not have permission to create bank'
        : error?.message || 'Failed to create bank';
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
