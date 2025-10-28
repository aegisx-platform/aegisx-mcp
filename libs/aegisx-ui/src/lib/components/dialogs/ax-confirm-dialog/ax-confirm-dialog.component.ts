import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { AxConfirmDialogData } from './ax-confirm-dialog.types';

/**
 * AegisX Confirm Dialog Component
 *
 * A reusable Material Dialog for confirmation actions (delete, save, etc.)
 * Supports dangerous actions with red button styling.
 *
 * Usage:
 * ```typescript
 * const dialogRef = this.dialog.open(AxConfirmDialogComponent, {
 *   data: {
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this?',
 *     confirmText: 'Delete',
 *     isDangerous: true,
 *   }
 * });
 *
 * dialogRef.afterClosed().subscribe(confirmed => {
 *   if (confirmed) {
 *     // Handle confirmation
 *   }
 * });
 * ```
 */
@Component({
  selector: 'ax-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <!-- Dialog Title -->
    <h2 mat-dialog-title>{{ title }}</h2>

    <!-- Dialog Content -->
    <mat-dialog-content>
      <p>{{ message }}</p>
    </mat-dialog-content>

    <!-- Dialog Actions -->
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ cancelText }}</button>
      <button
        mat-raised-button
        [color]="isDangerous ? 'warn' : 'primary'"
        (click)="onConfirm()"
      >
        {{ confirmText }}
      </button>
    </mat-dialog-actions>
  `,
})
export class AxConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<AxConfirmDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as AxConfirmDialogData;

  title = this.data.title;
  message = this.data.message;
  confirmText = this.data.confirmText || 'Confirm';
  cancelText = this.data.cancelText || 'Cancel';
  isDangerous = this.data.isDangerous ?? false;

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
