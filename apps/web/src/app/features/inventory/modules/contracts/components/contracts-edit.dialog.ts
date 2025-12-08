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

import { ContractService } from '../services/contracts.service';
import { Contract, UpdateContractRequest } from '../types/contracts.types';
import {
  ContractFormComponent,
  ContractFormData,
} from './contracts-form.component';

export interface ContractEditDialogData {
  contracts: Contract;
}

@Component({
  selector: 'app-contracts-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ContractFormComponent,
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
        <div class="ax-title">Edit Contract</div>
        <div class="ax-subtitle">Update contract information</div>
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
    <app-contracts-form
      mode="edit"
      [initialData]="data.contracts"
      [loading]="loading()"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onCancel()"
    ></app-contracts-form>
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
export class ContractEditDialogComponent implements OnInit {
  private contractsService = inject(ContractService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ContractEditDialogComponent>);
  public data = inject<ContractEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: ContractFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const updateRequest = formData as unknown as UpdateContractRequest;
      const result = await this.contractsService.updateContract(
        this.data.contracts.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Contract updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update contract', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.contractsService.permissionError()
        ? 'You do not have permission to update contract'
        : error?.message || 'Failed to update contract';
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
