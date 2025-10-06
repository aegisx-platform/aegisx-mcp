import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ComprehensiveTestService } from '../services/comprehensive-tests.service';
import { CreateComprehensiveTestRequest } from '../types/comprehensive-tests.types';
import {
  ComprehensiveTestFormComponent,
  ComprehensiveTestFormData,
} from './comprehensive-tests-form.component';

@Component({
  selector: 'app-comprehensive-tests-create-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ComprehensiveTestFormComponent],
  template: `
    <div class="create-dialog">
      <h2 mat-dialog-title>Create Comprehensive Tests</h2>

      <mat-dialog-content>
        <app-comprehensive-tests-form
          mode="create"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-comprehensive-tests-form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .create-dialog {
        min-width: 500px;
        max-width: 800px;
      }

      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .create-dialog {
          min-width: 90vw;
        }
      }
    `,
  ],
})
export class ComprehensiveTestCreateDialogComponent {
  private comprehensiveTestsService = inject(ComprehensiveTestService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(
    MatDialogRef<ComprehensiveTestCreateDialogComponent>,
  );

  loading = signal<boolean>(false);

  async onFormSubmit(formData: ComprehensiveTestFormData) {
    this.loading.set(true);

    try {
      const createRequest = formData as CreateComprehensiveTestRequest;
      const result =
        await this.comprehensiveTestsService.createComprehensiveTest(
          createRequest,
        );

      if (result) {
        this.snackBar.open(
          'Comprehensive Tests created successfully',
          'Close',
          {
            duration: 3000,
          },
        );
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create Comprehensive Tests', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to create Comprehensive Tests',
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
