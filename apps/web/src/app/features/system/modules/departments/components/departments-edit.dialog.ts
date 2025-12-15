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

import { DepartmentService } from '../services/departments.service';
import {
  Department,
  UpdateDepartmentRequest,
} from '../types/departments.types';
import {
  DepartmentFormComponent,
  DepartmentFormData,
} from './departments-form.component';

export interface DepartmentEditDialogData {
  departments: Department;
}

@Component({
  selector: 'app-departments-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    DepartmentFormComponent,
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
        <div class="ax-title">Edit Department</div>
        <div class="ax-subtitle">Update department information</div>
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
    <app-departments-form
      mode="edit"
      [initialData]="data.departments"
      [loading]="loading()"
      (formSubmit)="onFormSubmit($event)"
      (formCancel)="onCancel()"
    ></app-departments-form>
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
export class DepartmentEditDialogComponent implements OnInit {
  private departmentsService = inject(DepartmentService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<DepartmentEditDialogComponent>);
  public data = inject<DepartmentEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: DepartmentFormData) {
    this.loading.set(true);

    try {
      // Cast through unknown to handle form data type conversion (form values may be strings)
      const updateRequest = formData as unknown as UpdateDepartmentRequest;
      const result = await this.departmentsService.updateDepartment(
        this.data.departments.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Department updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update department', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.departmentsService.permissionError()
        ? 'You do not have permission to update department'
        : error?.message || 'Failed to update department';
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
