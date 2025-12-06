import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DrugService } from '../services/drugs.service';
import { CreateDrugRequest } from '../types/drugs.types';
import { DrugFormComponent, DrugFormData } from './drugs-form.component';

@Component({
  selector: 'app-drugs-create-dialog',
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
    <h2 mat-dialog-title class="ax-header ax-header-info">
      <div class="ax-icon-info">
        <mat-icon>add_circle</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">Create New Drug</div>
        <div class="ax-subtitle">Add a new drug to your collection</div>
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
      mode="create"
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
export class DrugCreateDialogComponent {
  private drugsService = inject(DrugService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<DrugCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: DrugFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const createRequest = formData as unknown as CreateDrugRequest;
      const result = await this.drugsService.createDrug(createRequest);

      if (result) {
        this.snackBar.open('Drug created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create drug', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.drugsService.permissionError()
        ? 'You do not have permission to create drug'
        : error?.message || 'Failed to create drug';
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
