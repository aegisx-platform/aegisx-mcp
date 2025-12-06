import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DosageFormService } from '../services/dosage-forms.service';
import { CreateDosageFormRequest } from '../types/dosage-forms.types';
import {
  DosageFormFormComponent,
  DosageFormFormData,
} from './dosage-forms-form.component';

@Component({
  selector: 'app-dosage-forms-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    DosageFormFormComponent,
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
        <div class="ax-title">Create New DosageForm</div>
        <div class="ax-subtitle">Add a new dosageform to your collection</div>
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
    <app-dosage-forms-form
      mode="create"
      [loading]="loading()"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onCancel()"
    ></app-dosage-forms-form>
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
export class DosageFormCreateDialogComponent {
  private dosageFormsService = inject(DosageFormService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<DosageFormCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: DosageFormFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const createRequest = formData as unknown as CreateDosageFormRequest;
      const result =
        await this.dosageFormsService.createDosageForm(createRequest);

      if (result) {
        this.snackBar.open('DosageForm created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create dosageform', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.dosageFormsService.permissionError()
        ? 'You do not have permission to create dosageform'
        : error?.message || 'Failed to create dosageform';
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
