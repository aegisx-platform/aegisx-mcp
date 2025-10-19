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
    <div class="tremor-dialog-container">
      <!-- Header with Icon -->
      <div class="tremor-dialog-header bg-slate-100">
        <div class="flex items-center gap-3">
          <div class="tremor-icon-wrapper tremor-icon-orange">
            <mat-icon>edit</mat-icon>
          </div>
          <div>
            <h2 class="tremor-dialog-title">Edit Book</h2>
            <p class="tremor-dialog-subtitle">Update book information</p>
          </div>
        </div>
        <button
          type="button"
          mat-icon-button
          class="tremor-close-button"
          [mat-dialog-close]="false"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <mat-dialog-content class="tremor-dialog-content">
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
      /* Tremor-inspired Dialog Styles */
      .tremor-dialog-container {
        display: flex;
        flex-direction: column;
        min-width: 600px;
        max-width: 900px;
        max-height: 90vh;
      }

      /* Header */
      .tremor-dialog-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(to bottom, #ffffff, #f9fafb);
      }

      .tremor-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
      }

      .tremor-icon-orange {
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: white;
        box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
      }

      .tremor-dialog-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
        line-height: 1.4;
      }

      .tremor-dialog-subtitle {
        margin: 0.25rem 0 0 0;
        font-size: 0.875rem;
        color: #6b7280;
      }

      .tremor-close-button {
        color: #6b7280;
      }

      .tremor-close-button:hover {
        color: #111827;
        background: #f3f4f6;
      }

      /* Content */
      .tremor-dialog-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
      }

      .bg-slate-100 {
        background-color: #f1f5f9;
      }

      /* Utility Classes */
      .flex {
        display: flex;
      }
      .items-center {
        align-items: center;
      }
      .gap-3 {
        gap: 0.75rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .tremor-dialog-container {
          min-width: 90vw;
        }

        .tremor-dialog-header {
          padding: 1rem;
        }

        .tremor-dialog-content {
          padding: 1rem;
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
