import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PdfTemplate } from '../types/pdf-templates.types';

export interface PdfTemplateDuplicateDialogData {
  template: PdfTemplate;
}

@Component({
  selector: 'app-pdf-templates-duplicate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="duplicate-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>content_copy</mat-icon>
          Duplicate Template
        </h2>
      </div>

      <mat-dialog-content>
        <div class="original-info">
          <mat-icon>info</mat-icon>
          <div>
            <p class="label">Duplicating from:</p>
            <p class="value">{{ data.template.display_name }}</p>
          </div>
        </div>

        <form [formGroup]="duplicateForm" class="duplicate-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Template Name</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="e.g., invoice-template-copy"
              [disabled]="loading()"
            />
            <mat-hint
              >Must be unique, alphanumeric with hyphens/underscores
              only</mat-hint
            >
            @if (duplicateForm.get('name')?.hasError('required')) {
              <mat-error>Template name is required</mat-error>
            }
            @if (duplicateForm.get('name')?.hasError('pattern')) {
              <mat-error
                >Only letters, numbers, hyphens, and underscores
                allowed</mat-error
              >
            }
            @if (duplicateForm.get('name')?.hasError('minlength')) {
              <mat-error>Name must be at least 3 characters</mat-error>
            }
            @if (duplicateForm.get('name')?.hasError('maxlength')) {
              <mat-error>Name cannot exceed 100 characters</mat-error>
            }
          </mat-form-field>
        </form>

        @if (error()) {
          <div class="error-message">
            <mat-icon>error</mat-icon>
            <span>{{ error() }}</span>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()" [disabled]="loading()">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="duplicate()"
          [disabled]="duplicateForm.invalid || loading()"
        >
          @if (loading()) {
            <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
          }
          <mat-icon>content_copy</mat-icon>
          Duplicate
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .duplicate-dialog {
        min-width: 500px;
        max-width: 600px;
      }

      .dialog-header {
        h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }
      }

      mat-dialog-content {
        padding-top: 20px;
      }

      .original-info {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 8px;
        margin-bottom: 24px;

        mat-icon {
          color: rgba(0, 0, 0, 0.54);
        }

        .label {
          margin: 0 0 4px;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }
      }

      .duplicate-form {
        .full-width {
          width: 100%;
        }
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #ffebee;
        border-left: 4px solid #f44336;
        border-radius: 4px;
        margin-top: 16px;

        mat-icon {
          color: #f44336;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        span {
          color: #c62828;
          font-size: 14px;
        }
      }

      .inline-spinner {
        display: inline-block;
        margin-right: 8px;
      }

      mat-dialog-actions {
        padding: 16px 24px;
        margin: 0;
      }
    `,
  ],
})
export class PdfTemplateDuplicateDialog {
  loading = signal(false);
  error = signal<string | null>(null);
  duplicateForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PdfTemplateDuplicateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PdfTemplateDuplicateDialogData,
    private fb: FormBuilder,
  ) {
    // Generate default name
    const baseName = data.template.name;
    const timestamp = Date.now();
    const defaultName = `${baseName}-copy-${timestamp}`;

    this.duplicateForm = this.fb.group({
      name: [
        defaultName,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9_-]+$/),
        ],
      ],
    });
  }

  duplicate() {
    if (this.duplicateForm.valid) {
      const name = this.duplicateForm.value.name;
      this.dialogRef.close({ name });
    }
  }
}
