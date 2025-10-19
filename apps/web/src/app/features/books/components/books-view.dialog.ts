import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Book } from '../types/books.types';

export interface BookViewDialogData {
  books: Book;
}

@Component({
  selector: 'app-books-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Book Details</h2>

    <mat-dialog-content>
      <div class="content-grid">
        <!-- Basic Information -->
        <div class="section">
          <h3 class="section-title">Basic Information</h3>

          <div class="field-row">
            <label>Title</label>
            <div class="field-value">{{ data.books.title || '-' }}</div>
          </div>

          <div class="field-row">
            <label>Description</label>
            <div class="field-value">{{ data.books.description || '-' }}</div>
          </div>

          <div class="field-row">
            <label>ISBN</label>
            <div class="field-value">{{ data.books.isbn || '-' }}</div>
          </div>

          <div class="field-row">
            <label>Genre</label>
            <div class="field-value">
              @if (data.books.genre) {
                <span class="badge badge-purple">{{ data.books.genre }}</span>
              } @else {
                <span>-</span>
              }
            </div>
          </div>
        </div>

        <!-- Publishing Details -->
        <div class="section">
          <h3 class="section-title">Publishing Details</h3>

          <div class="field-row">
            <label>Author ID</label>
            <div class="field-value">{{ data.books.author_id || '-' }}</div>
          </div>

          <div class="field-row">
            <label>Published Date</label>
            <div class="field-value">
              {{ data.books.published_date | date: 'mediumDate' }}
            </div>
          </div>

          <div class="field-row">
            <label>Pages</label>
            <div class="field-value">{{ data.books.pages ?? '-' }}</div>
          </div>

          <div class="field-row">
            <label>Price</label>
            <div class="field-value">
              @if (
                data.books.price !== null && data.books.price !== undefined
              ) {
                <span class="price"
                  >\${{ data.books.price | number: '1.2-2' }}</span
                >
              } @else {
                <span>-</span>
              }
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="section">
          <h3 class="section-title">Status</h3>

          <div class="field-row">
            <label>Availability</label>
            <div class="field-value">
              @if (data.books.available) {
                <span class="status status-success">
                  <span class="status-dot"></span>
                  Available
                </span>
              } @else {
                <span class="status status-gray">
                  <span class="status-dot"></span>
                  Unavailable
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="section section-metadata">
          <h3 class="section-title">Record Information</h3>

          <div class="field-row">
            <label>Record ID</label>
            <div class="field-value">
              <code>{{ data.books.id }}</code>
            </div>
          </div>

          <div class="field-row">
            <label>Created</label>
            <div class="field-value">
              {{ data.books.created_at | date: 'medium' }}
            </div>
          </div>

          <div class="field-row">
            <label>Last Updated</label>
            <div class="field-value">
              {{ data.books.updated_at | date: 'medium' }}
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
      <button mat-raised-button color="primary" (click)="onEdit()">
        <mat-icon>edit</mat-icon>
        Edit Book
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .section {
        margin-bottom: 1.5rem;
      }

      .section:last-child {
        margin-bottom: 0;
      }

      .section-title {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #666;
      }

      .field-row {
        display: flex;
        margin-bottom: 0.75rem;
      }

      .field-row:last-child {
        margin-bottom: 0;
      }

      .field-row label {
        min-width: 140px;
        font-size: 0.875rem;
        color: #666;
      }

      .field-value {
        flex: 1;
        font-size: 0.875rem;
      }

      .badge-purple {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: #f3e8ff;
        color: #7c3aed;
        border-radius: 4px;
        font-size: 0.75rem;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .status-success .status-dot {
        background: #16a34a;
      }

      .status-gray .status-dot {
        background: #9ca3af;
      }

      code {
        padding: 2px 6px;
        background: #f5f5f5;
        border-radius: 3px;
        font-size: 0.85rem;
        font-family: monospace;
      }

      .price {
        font-weight: 600;
        color: #059669;
      }

      .section-metadata {
        background: #fafafa;
        padding: 0.75rem;
        border-radius: 4px;
      }
    `,
  ],
})
export class BookViewDialogComponent {
  private dialogRef = inject(MatDialogRef<BookViewDialogComponent>);
  protected data = inject<BookViewDialogData>(MAT_DIALOG_DATA);

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', data: this.data.books });
  }
}
