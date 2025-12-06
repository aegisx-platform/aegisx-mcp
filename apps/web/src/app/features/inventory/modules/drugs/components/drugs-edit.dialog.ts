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

import { DrugService } from '../services/drugs.service';
import { Drug, UpdateDrugRequest } from '../types/drugs.types';
import { DrugFormComponent, DrugFormData } from './drugs-form.component';

export interface DrugEditDialogData {
  drugs: Drug;
}

@Component({
  selector: 'app-drugs-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    DrugFormComponent,
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
        <div class="ax-title">Edit Drug</div>
        <div class="ax-subtitle">Update drug information</div>
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
    <app-drugs-form
      mode="edit"
      [initialData]="data.drugs"
      [loading]="loading()"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onCancel()"
    ></app-drugs-form>
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
export class DrugEditDialogComponent implements OnInit {
  private drugsService = inject(DrugService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<DrugEditDialogComponent>);
  public data = inject<DrugEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: DrugFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const updateRequest = formData as unknown as UpdateDrugRequest;
      const result = await this.drugsService.updateDrug(
        this.data.drugs.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Drug updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update drug', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.drugsService.permissionError()
        ? 'You do not have permission to update drug'
        : error?.message || 'Failed to update drug';
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
