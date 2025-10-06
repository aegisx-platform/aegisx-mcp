import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BookService } from '../services/books.service';
import { CreateBookRequest } from '../types/books.types';
import { BookFormComponent, BookFormData } from './books-form.component';

@Component({
  selector: 'app-books-create-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, BookFormComponent],
  template: `
    <div class="create-dialog">
      <h2 mat-dialog-title>Create Books</h2>

      <mat-dialog-content>
        <app-books-form
          mode="create"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-books-form>
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
export class BookCreateDialogComponent {
  private booksService = inject(BookService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BookCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: BookFormData) {
    this.loading.set(true);

    try {
      const createRequest = formData as CreateBookRequest;
      const result = await this.booksService.createBook(createRequest);

      if (result) {
        this.snackBar.open('Books created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create Books', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      this.snackBar.open(error.message || 'Failed to create Books', 'Close', {
        duration: 5000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
