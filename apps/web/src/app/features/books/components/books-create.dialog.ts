import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BookService } from '../services/books.service';
import { CreateBookRequest } from '../types/books.types';
import { BookFormComponent, BookFormData } from './books-form.component';

@Component({
  selector: 'app-books-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BookFormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="create-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Create Book</h2>

        <button
          mat-icon-button
          [mat-dialog-close]="true"
          class="close-button m-2"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

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

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .dialog-header h2 {
        margin: 0;
        flex: 1;
      }

      .close-button {
        width: 48px;
        height: 48px;
        color: #6b7280;
        transition: color 0.2s ease;
      }

      .close-button:hover {
        color: #374151;
      }

      .close-button mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
        padding: 0 24px 24px 24px;
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
        this.snackBar.open('Book created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create book', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.booksService.permissionError()
        ? 'You do not have permission to create book'
        : error?.message || 'Failed to create book';
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
