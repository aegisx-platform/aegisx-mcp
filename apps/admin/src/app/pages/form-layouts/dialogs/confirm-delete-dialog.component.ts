import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div mat-dialog-title class="dialog-title">
        <mat-icon class="dialog-icon warn-icon">warning</mat-icon>
        Confirm Deletion
      </div>

      <mat-dialog-content class="dialog-content">
        <p class="mb-4" style="color: var(--aegisx-text-body)">
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>

        <div class="warning-box">
          <mat-icon class="warning-icon">info</mat-icon>
          <div>
            <p class="warning-title">This will permanently delete:</p>
            <ul class="warning-list">
              <li>All associated data</li>
              <li>Related configurations</li>
              <li>Historical records</li>
            </ul>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button matButton="outlined" (click)="onCancel()">Cancel</button>
        <button matButton="filled" color="warn" (click)="onDelete()">
          Delete
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
        overflow: visible;
      }

      :host ::ng-deep mat-dialog-content {
        padding-top: 2rem !important;
      }

      .dialog-container {
        min-width: 400px;
      }

      .dialog-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--aegisx-text-strong);
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        margin: 0;
        border-bottom: 1px solid var(--aegisx-border-default);
      }

      .dialog-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--aegisx-brand-default);

        &.warn-icon {
          color: var(--aegisx-error-default);
        }
      }

      .dialog-content {
        padding: 2rem 1.5rem 1.5rem 1.5rem;
        margin: 0;
      }

      .dialog-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--aegisx-border-default);
        margin: 0;
      }

      .warning-box {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: var(--aegisx-radius-md);
        background: var(--aegisx-warning-faint);
        border: 1px solid var(--aegisx-warning-muted);
      }

      .warning-icon {
        flex-shrink: 0;
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--aegisx-warning-default);
      }

      .warning-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--aegisx-text-strong);
        margin: 0 0 0.5rem 0;
      }

      .warning-list {
        list-style: disc;
        padding-left: 1.25rem;
        margin: 0;
        font-size: 0.8125rem;
        color: var(--aegisx-text-body);

        li {
          margin-bottom: 0.25rem;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    `,
  ],
})
export class ConfirmDeleteDialogComponent {
  constructor(private dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}
