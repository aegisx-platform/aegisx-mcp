import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthorService } from '../services/authors.service';
import { CreateAuthorRequest } from '../types/authors.types';
import { AuthorFormComponent, AuthorFormData } from './authors-form.component';

@Component({
  selector: 'app-authors-create-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, AuthorFormComponent],
  template: `
    <div class="create-dialog">
      <h2 mat-dialog-title>Create Authors</h2>

      <mat-dialog-content>
        <app-authors-form
          mode="create"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-authors-form>
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
export class AuthorCreateDialogComponent {
  private authorsService = inject(AuthorService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AuthorCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: AuthorFormData) {
    this.loading.set(true);

    try {
      const createRequest = formData as CreateAuthorRequest;
      const result = await this.authorsService.createAuthor(createRequest);

      if (result) {
        this.snackBar.open('Authors created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create Authors', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.authorsService.permissionError()
        ? 'You do not have permission to create Authors'
        : error?.message || 'Failed to create Authors';
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
