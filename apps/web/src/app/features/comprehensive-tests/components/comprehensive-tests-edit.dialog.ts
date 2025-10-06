import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ComprehensiveTestService } from '../services/comprehensive-tests.service';
import {
  ComprehensiveTest,
  UpdateComprehensiveTestRequest,
} from '../types/comprehensive-tests.types';
import {
  ComprehensiveTestFormComponent,
  ComprehensiveTestFormData,
} from './comprehensive-tests-form.component';

export interface ComprehensiveTestEditDialogData {
  comprehensiveTests: ComprehensiveTest;
}

@Component({
  selector: 'app-comprehensive-tests-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ComprehensiveTestFormComponent],
  template: `
    <div class="edit-dialog">
      <h2 mat-dialog-title>Edit Comprehensive Tests</h2>

      <mat-dialog-content>
        <app-comprehensive-tests-form
          mode="edit"
          [initialData]="data.comprehensiveTests"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-comprehensive-tests-form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .edit-dialog {
        min-width: 500px;
        max-width: 800px;
      }

      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .edit-dialog {
          min-width: 90vw;
        }
      }
    `,
  ],
})
export class ComprehensiveTestEditDialogComponent implements OnInit {
  private comprehensiveTestsService = inject(ComprehensiveTestService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(
    MatDialogRef<ComprehensiveTestEditDialogComponent>,
  );
  public data = inject<ComprehensiveTestEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: ComprehensiveTestFormData) {
    this.loading.set(true);

    try {
      const updateRequest = formData as UpdateComprehensiveTestRequest;
      const result =
        await this.comprehensiveTestsService.updateComprehensiveTest(
          this.data.comprehensiveTests.id,
          updateRequest,
        );

      if (result) {
        this.snackBar.open(
          'Comprehensive Tests updated successfully',
          'Close',
          {
            duration: 3000,
          },
        );
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update Comprehensive Tests', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to update Comprehensive Tests',
        'Close',
        { duration: 5000 },
      );
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
