import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="dialog-container">
      <div mat-dialog-title class="dialog-title">
        <mat-icon class="dialog-icon">add_circle</mat-icon>
        Add New Item
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="form-compact">
          <form class="flex flex-col gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label
                >Item Name <span class="required-asterisk">*</span></mat-label
              >
              <input
                matInput
                placeholder="Enter item name"
                [(ngModel)]="itemName"
                name="itemName"
                required
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="category" name="category">
                <mat-option value="electronics">Electronics</mat-option>
                <mat-option value="furniture">Furniture</mat-option>
                <mat-option value="supplies">Office Supplies</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                rows="3"
                placeholder="Optional description"
                [(ngModel)]="description"
                name="description"
              ></textarea>
            </mat-form-field>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button matButton="outlined" (click)="onCancel()">Cancel</button>
        <button matButton="filled" color="primary" (click)="onAdd()">
          Add Item
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

      .required-asterisk {
        color: #dc2626;
        margin-left: 0.125rem;
      }
    `,
  ],
})
export class QuickAddDialogComponent {
  itemName = '';
  category = '';
  description = '';

  constructor(private dialogRef: MatDialogRef<QuickAddDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    this.dialogRef.close({
      itemName: this.itemName,
      category: this.category,
      description: this.description,
    });
  }
}
