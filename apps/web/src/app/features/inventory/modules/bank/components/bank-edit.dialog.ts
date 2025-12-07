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

import { BankService } from '../services/bank.service';
import { Bank, UpdateBankRequest } from '../types/bank.types';
import { BankFormComponent, BankFormData } from './bank-form.component';

export interface BankEditDialogData {
  bank: Bank;
}

@Component({
  selector: 'app-bank-edit-dialog',
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
    <h2 mat-dialog-title class="ax-header ax-header-warning">
      <div class="ax-icon-warning">
        <mat-icon>edit</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">Edit Bank</div>
        <div class="ax-subtitle">Update bank information</div>
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
      mode="edit"
      [initialData]="data.bank"
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
export class BankEditDialogComponent implements OnInit {
  private bankService = inject(BankService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BankEditDialogComponent>);
  public data = inject<BankEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: BankFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const updateRequest = formData as unknown as UpdateBankRequest;
      const result = await this.bankService.updateBank(
        this.data.bank.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Bank updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update bank', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.bankService.permissionError()
        ? 'You do not have permission to update bank'
        : error?.message || 'Failed to update bank';
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
