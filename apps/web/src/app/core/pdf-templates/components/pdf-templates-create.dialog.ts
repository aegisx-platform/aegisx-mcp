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
      <div class="dialog-header">
        <h2>
          @if (currentStep() === 1) {
            Choose Template
          } @else {
            Create New PDF Template
          }
        </h2>
        <button mat-icon-button (click)="onCancel()" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

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

          <div class="step-actions">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button
              mat-raised-button
              color="primary"
              (click)="proceedToForm()"
              [disabled]="!selectedTemplate() && selectedTemplate() !== null"
            >
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
        background: #fafafa;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background: white;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 10;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .step-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: white;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
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
        border: 2px solid rgba(0, 0, 0, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.38);
        background: white;
        transition: all 0.3s ease;
      }

      .step.active .step-number {
        border-color: #1976d2;
        background: #1976d2;
        color: white;
      }

      .step.completed .step-number {
        border-color: #4caf50;
        background: #4caf50;
        color: white;
      }

      .step-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        font-weight: 500;
      }

      .step.active .step-label {
        color: #1976d2;
      }

      .step-divider {
        width: 80px;
        height: 2px;
        background: rgba(0, 0, 0, 0.12);
        margin: 0 16px;
      }

      .dialog-content {
        flex: 1;
        overflow-y: auto;
        background: #fafafa;
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      .step-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 24px;
        background: white;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        position: sticky;
        bottom: 0;
        z-index: 10;
      }

      .back-button-container {
        padding: 16px 24px;
        background: white;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
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
