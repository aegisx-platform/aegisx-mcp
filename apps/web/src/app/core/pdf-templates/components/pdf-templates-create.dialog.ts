import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PdfTemplateService } from '../services/pdf-templates.service';
import {
  CreatePdfTemplateRequest,
  PdfTemplate,
} from '../types/pdf-templates.types';
import {
  PdfTemplateFormComponent,
  PdfTemplateFormData,
} from './pdf-templates-form.component';
import { PdfTemplateSelectorComponent } from './pdf-template-selector.component';

@Component({
  selector: 'app-pdf-templates-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PdfTemplateFormComponent,
    PdfTemplateSelectorComponent,
  ],
  template: `
    <div class="create-dialog-container">
      <!-- Header -->
      <h2
        mat-dialog-title
        class="flex items-center gap-3 text-xl font-semibold"
      >
        <mat-icon class="text-brand">
          @if (currentStep() === 1) {
            layers
          } @else {
            add_circle
          }
        </mat-icon>
        @if (currentStep() === 1) {
          Choose Template
        } @else {
          Create New PDF Template
        }
      </h2>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <div
          class="step"
          [class.active]="currentStep() === 1"
          [class.completed]="currentStep() > 1"
        >
          <div class="step-number">1</div>
          <div class="step-label">Select Template</div>
        </div>
        <div class="step-divider"></div>
        <div class="step" [class.active]="currentStep() === 2">
          <div class="step-number">2</div>
          <div class="step-label">Configure Details</div>
        </div>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        @if (currentStep() === 1) {
          <!-- Step 1: Template Selection -->
          <app-pdf-template-selector
            (templateSelected)="onTemplateSelected($event)"
          ></app-pdf-template-selector>

          <div mat-dialog-actions align="end" class="step-actions flex gap-2">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button
              mat-flat-button
              color="primary"
              (click)="proceedToForm()"
              [disabled]="!selectedTemplate() && selectedTemplate() !== null"
            >
              <mat-icon>arrow_forward</mat-icon>
              Next: Configure Template
            </button>
          </div>
        } @else {
          <!-- Step 2: Form Configuration -->
          <div class="back-button-container">
            <button mat-button (click)="backToSelection()">
              <mat-icon>arrow_back</mat-icon>
              Back to Templates
            </button>
          </div>

          <app-pdf-templates-form
            mode="create"
            [loading]="loading()"
            [initialData]="initialFormData()"
            (formSubmit)="onFormSubmit($event)"
            (formCancel)="onCancel()"
          ></app-pdf-templates-form>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .create-dialog-container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--mat-sys-surface-container);
      }

      .step-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--mat-sys-surface);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--mat-sys-outline);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        color: var(--mat-sys-on-surface-variant);
        background: var(--mat-sys-surface);
        transition: all 0.3s ease;
      }

      .step.active .step-number {
        border-color: var(--mat-sys-primary);
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
      }

      .step.completed .step-number {
        border-color: var(--ax-success-500);
        background: var(--ax-success-500);
        color: white;
      }

      .step-label {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        font-weight: 500;
      }

      .step.active .step-label {
        color: var(--mat-sys-primary);
      }

      .step-divider {
        width: 80px;
        height: 2px;
        background: var(--mat-sys-outline-variant);
        margin: 0 16px;
      }

      .dialog-content {
        flex: 1;
        overflow-y: auto;
        background: var(--mat-sys-surface-container);
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      .step-actions {
        padding: 24px;
        background: var(--mat-sys-surface);
        border-top: 1px solid var(--mat-sys-outline-variant);
        position: sticky;
        bottom: 0;
        z-index: 10;
      }

      .back-button-container {
        padding: 16px 24px;
        background: var(--mat-sys-surface);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
    `,
  ],
})
export class PdfTemplateCreateDialogComponent {
  private pdfTemplatesService = inject(PdfTemplateService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<PdfTemplateCreateDialogComponent>);

  loading = signal<boolean>(false);
  currentStep = signal<number>(1);
  selectedTemplate = signal<PdfTemplate | null | undefined>(undefined);
  initialFormData = signal<Partial<PdfTemplate> | undefined>(undefined);

  onTemplateSelected(template: PdfTemplate | null) {
    this.selectedTemplate.set(template);
  }

  proceedToForm() {
    const selected = this.selectedTemplate();
    if (selected !== undefined) {
      // Prepare initial form data based on selected template
      this.initialFormData.set(this.getInitialFormData());
      this.currentStep.set(2);
    }
  }

  backToSelection() {
    this.currentStep.set(1);
  }

  getInitialFormData(): Partial<PdfTemplate> | undefined {
    const template = this.selectedTemplate();

    // If blank template selected (null), return undefined to start with empty form
    if (template === null) {
      return undefined;
    }

    // If starter template selected, pre-fill form with template data
    if (template) {
      return {
        ...template,
        name: `${template.name}_copy`,
        display_name: `${template.display_name} (Copy)`,
      } as Partial<PdfTemplate>;
    }

    return undefined;
  }

  async onFormSubmit(formData: PdfTemplateFormData) {
    this.loading.set(true);

    try {
      const createRequest = formData as CreatePdfTemplateRequest;
      const result =
        await this.pdfTemplatesService.createPdfTemplate(createRequest);

      if (result) {
        this.snackBar.open('PDF Template created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create PDF Template', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMessage = this.pdfTemplatesService.permissionError()
        ? 'You do not have permission to create PDF Templates'
        : error?.message || 'Failed to create PDF Template';
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
