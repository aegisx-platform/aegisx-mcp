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

import { BookService } from '../services/books.service';
import { Book, UpdateBookRequest } from '../types/books.types';
import { BookFormComponent, BookFormData } from './books-form.component';

export interface BookEditDialogData {
  books: Book;
}

@Component({
  selector: 'app-books-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    BookFormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="edit-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Edit Book</h2>

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
          mode="edit"
          [initialData]="data.books"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-books-form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .edit-dialog {
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
        .edit-dialog {
          min-width: 90vw;
        }
      }
    `,
  ],
})
export class BookEditDialogComponent implements OnInit {
  private booksService = inject(BookService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BookEditDialogComponent>);
  public data = inject<BookEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: BookFormData) {
    this.loading.set(true);

    try {
      const updateRequest = formData as UpdateBookRequest;
      const result = await this.booksService.updateBook(
        this.data.books.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Book updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update book', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.booksService.permissionError()
        ? 'You do not have permission to update book'
        : error?.message || 'Failed to update book';
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
