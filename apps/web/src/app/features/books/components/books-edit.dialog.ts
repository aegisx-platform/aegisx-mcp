import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BookService } from '../services/books.service';
import { Book, UpdateBookRequest } from '../types/books.types';
import { BookFormComponent, BookFormData } from './books-form.component';

export interface BookEditDialogData {
  books: Book;
}

@Component({
  selector: 'app-books-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, BookFormComponent],
  template: `
    <div class="edit-dialog">
      <h2 mat-dialog-title>Edit Books</h2>

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
        this.snackBar.open('Books updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update Books', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      this.snackBar.open(error.message || 'Failed to update Books', 'Close', {
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
