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

import { DosageFormService } from '../services/dosage-forms.service';
import {
  DosageForm,
  UpdateDosageFormRequest,
} from '../types/dosage-forms.types';
import {
  DosageFormFormComponent,
  DosageFormFormData,
} from './dosage-forms-form.component';

export interface DosageFormEditDialogData {
  dosageForms: DosageForm;
}

@Component({
  selector: 'app-dosage-forms-edit-dialog',
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
    <h2 mat-dialog-title class="ax-header ax-header-warning">
      <div class="ax-icon-warning">
        <mat-icon>edit</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">Edit DosageForm</div>
        <div class="ax-subtitle">Update dosageform information</div>
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
      mode="edit"
      [initialData]="data.dosageForms"
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
export class DosageFormEditDialogComponent implements OnInit {
  private dosageFormsService = inject(DosageFormService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<DosageFormEditDialogComponent>);
  public data = inject<DosageFormEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: DosageFormFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const updateRequest = formData as unknown as UpdateDosageFormRequest;
      const result = await this.dosageFormsService.updateDosageForm(
        this.data.dosageForms.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('DosageForm updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update dosageform', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.dosageFormsService.permissionError()
        ? 'You do not have permission to update dosageform'
        : error?.message || 'Failed to update dosageform';
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
