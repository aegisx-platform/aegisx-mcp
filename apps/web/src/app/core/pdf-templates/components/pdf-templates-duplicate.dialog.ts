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
    <h2 mat-dialog-title class="flex items-center gap-3 text-xl font-semibold">
      <mat-icon class="text-brand">content_copy</mat-icon>
      Duplicate Template
    </h2>

    <mat-dialog-content>
      <div class="form-compact">
        <div class="original-info">
          <mat-icon>info</mat-icon>
          <div>
            <p class="label">Duplicating from:</p>
            <p class="value">{{ data.template.display_name }}</p>
          </div>
        </div>

        <form [formGroup]="duplicateForm" class="flex flex-col gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label
              >New Template Name <span class="text-error">*</span></mat-label
            >
            <mat-icon matPrefix>label</mat-icon>
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
      </div>
    </mat-dialog-content>

    <div mat-dialog-actions align="end" class="flex gap-2">
      <button mat-button mat-dialog-close [disabled]="loading()">Cancel</button>
      <button
        mat-flat-button
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
    </div>
  `,
  styles: [
    `
      .original-info {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: var(--mat-sys-surface-container-low);
        border-radius: 8px;
        margin-bottom: 24px;

        mat-icon {
          color: var(--mat-sys-on-surface-variant);
        }

        .label {
          margin: 0 0 4px;
          font-size: 12px;
          color: var(--mat-sys-on-surface-variant);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--mat-sys-on-surface);
        }
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--mat-sys-error-container);
        border-left: 4px solid var(--mat-sys-error);
        border-radius: 4px;
        margin-top: 16px;

        mat-icon {
          color: var(--mat-sys-error);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        span {
          color: var(--mat-sys-on-error-container);
          font-size: 14px;
        }
      }

      .inline-spinner {
        display: inline-block;
        margin-right: 8px;
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
