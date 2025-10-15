import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthorService } from '../services/authors.service';
import { Author, UpdateAuthorRequest } from '../types/authors.types';
import { AuthorFormComponent, AuthorFormData } from './authors-form.component';

export interface AuthorEditDialogData {
  authors: Author;
}

@Component({
  selector: 'app-authors-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, AuthorFormComponent],
  template: `
    <div class="edit-dialog">
      <h2 mat-dialog-title>Edit Authors</h2>

      <mat-dialog-content>
        <app-authors-form
          mode="edit"
          [initialData]="data.authors"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-authors-form>
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
export class AuthorEditDialogComponent implements OnInit {
  private authorsService = inject(AuthorService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AuthorEditDialogComponent>);
  public data = inject<AuthorEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: AuthorFormData) {
    this.loading.set(true);

    try {
      const updateRequest = formData as UpdateAuthorRequest;
      const result = await this.authorsService.updateAuthor(
        this.data.authors.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Authors updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update Authors', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.authorsService.permissionError()
        ? 'You do not have permission to update Authors'
        : error?.message || 'Failed to update Authors';
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
