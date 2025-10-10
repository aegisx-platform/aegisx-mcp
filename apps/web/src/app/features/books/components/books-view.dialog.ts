import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { Book } from '../types/books.types';

export interface BookViewDialogData {
  books: Book;
}

@Component({
  selector: 'app-books-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="view-dialog">
      <h2 mat-dialog-title>
        Books Details
        <button 
          mat-icon-button 
          class="close-button"
          (click)="onClose()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </h2>
      
      <mat-dialog-content>
        <div class="details-container">
          <!-- id Field -->
          <div class="detail-row">
            <label class="detail-label">Id</label>
            <div class="detail-value">
              <span>{{ data.books.id || '-' }}</span>
            </div>
          </div>






          <mat-divider></mat-divider>
          <!-- title Field -->
          <div class="detail-row">
            <label class="detail-label">Title</label>
            <div class="detail-value">
              <span>{{ data.books.title || '-' }}</span>
            </div>
          </div>






          <mat-divider></mat-divider>
          <!-- description Field -->
          <div class="detail-row">
            <label class="detail-label">Description</label>
            <div class="detail-value">
              <div class="text-content">
                {{ data.books.description || '-' }}
              </div>
            </div>
          </div>






          <mat-divider></mat-divider>
          <!-- author_id Field -->
          <div class="detail-row">
            <label class="detail-label">Author Id</label>
            <div class="detail-value">
              <span>{{ data.books.author_id || '-' }}</span>
            </div>
          </div>






          <mat-divider></mat-divider>
          <!-- isbn Field -->
          <div class="detail-row">
            <label class="detail-label">Isbn</label>
            <div class="detail-value">
              <span>{{ data.books.isbn || '-' }}</span>
            </div>
          </div>






          <mat-divider></mat-divider>

          <!-- pages Field -->
          <div class="detail-row">
            <label class="detail-label">Pages</label>
            <div class="detail-value">
              <span>{{ data.books.pages ?? '-' }}</span>
            </div>
          </div>





          <mat-divider></mat-divider>



          <!-- published_date Field -->
          <div class="detail-row">
            <label class="detail-label">Published Date</label>
            <div class="detail-value">
              <span>{{ data.books.published_date | date:'medium' }}</span>
            </div>
          </div>



          <mat-divider></mat-divider>

          <!-- price Field -->
          <div class="detail-row">
            <label class="detail-label">Price</label>
            <div class="detail-value">
              <span>{{ data.books.price ?? '-' }}</span>
            </div>
          </div>





          <mat-divider></mat-divider>
          <!-- genre Field -->
          <div class="detail-row">
            <label class="detail-label">Genre</label>
            <div class="detail-value">
              <span>{{ data.books.genre || '-' }}</span>
            </div>
          </div>






          <mat-divider></mat-divider>


          <!-- available Field -->
          <div class="detail-row">
            <label class="detail-label">Available</label>
            <div class="detail-value">
              <mat-chip 
                [color]="data.books.available ? 'primary' : 'warn'"
                selected
              >
                <mat-icon>{{ data.books.available ? 'check' : 'close' }}</mat-icon>
                {{ data.books.available ? 'Yes' : 'No' }}
              </mat-chip>
            </div>
          </div>




          <mat-divider></mat-divider>



          <!-- created_at Field -->
          <div class="detail-row">
            <label class="detail-label">Created At</label>
            <div class="detail-value">
              <span>{{ data.books.created_at | date:'medium' }}</span>
            </div>
          </div>



          <mat-divider></mat-divider>



          <!-- updated_at Field -->
          <div class="detail-row">
            <label class="detail-label">Updated At</label>
            <div class="detail-value">
              <span>{{ data.books.updated_at | date:'medium' }}</span>
            </div>
          </div>




          <!-- Metadata Section -->
          <mat-divider class="metadata-divider"></mat-divider>
          
          <div class="metadata-section">
            <h3 class="metadata-title">Record Information</h3>
            
            <div class="detail-row">
              <label class="detail-label">Created At</label>
              <div class="detail-value">
                <span>{{ data.books.created_at | date:'full' }}</span>
              </div>
            </div>
            
            <div class="detail-row">
              <label class="detail-label">Updated At</label>
              <div class="detail-value">
                <span>{{ data.books.updated_at | date:'full' }}</span>
              </div>
            </div>
            
            <div class="detail-row">
              <label class="detail-label">ID</label>
              <div class="detail-value">
                <code class="id-code">{{ data.books.id }}</code>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button 
          mat-button 
          (click)="onClose()"
        >
          Close
        </button>
        <button 
          mat-raised-button 
          color="primary"
          (click)="onEdit()"
        >
          <mat-icon>edit</mat-icon>
          Edit
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .view-dialog {
      min-width: 600px;
      max-width: 900px;
    }

    .close-button {
      position: absolute;
      right: 8px;
      top: 8px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0;
      padding-right: 40px;
    }

    .details-container {
      padding: 16px 0;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 24px;
      gap: 8px;
    }

    .detail-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 16px;
      line-height: 1.5;
    }

    .text-content {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .url-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #1976d2;
      text-decoration: none;
    }

    .url-link:hover {
      text-decoration: underline;
    }

    .external-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .json-content {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 12px;
      border-left: 4px solid #1976d2;
    }

    .json-content pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      overflow-x: auto;
    }

    .metadata-divider {
      margin: 32px 0 24px 0;
    }

    .metadata-section {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
    }

    .metadata-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
    }

    .metadata-section .detail-row {
      margin-bottom: 16px;
    }

    .metadata-section .detail-row:last-child {
      margin-bottom: 0;
    }

    .id-code {
      background: #e8eaf6;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #3f51b5;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .view-dialog {
        min-width: 90vw;
      }

      .detail-row {
        margin-bottom: 16px;
      }
    }
  `]
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