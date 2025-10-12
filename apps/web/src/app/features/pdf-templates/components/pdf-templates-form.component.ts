import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MonacoEditorComponent } from '../../../shared/components/monaco-editor/monaco-editor.component';

import { PdfTemplate } from '../types/pdf-templates.types';

export type PdfTemplateFormMode = 'create' | 'edit';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
export interface PdfTemplateFormData {
  // Dynamic form data based on database schema
}

@Component({
  selector: 'app-pdf-templates-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MonacoEditorComponent,
  ],
  template: `
    <form [formGroup]="pdfTemplatesForm" class="pdf-templates-form">
      <!-- Basic Information -->
      <h3 class="section-title">Basic Information</h3>

      <mat-form-field class="full-width">
        <mat-label>Name (Unique Identifier)</mat-label>
        <input
          matInput
          formControlName="name"
          placeholder="e.g., invoice-template"
        />
        <mat-hint
          >Lowercase alphanumeric with hyphens/underscores only</mat-hint
        >
        @if (pdfTemplatesForm.get('name')?.hasError('required')) {
          <mat-error>Name is required</mat-error>
        }
        @if (pdfTemplatesForm.get('name')?.hasError('pattern')) {
          <mat-error
            >Only lowercase letters, numbers, hyphens, and underscores
            allowed</mat-error
          >
        }
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Display Name</mat-label>
        <input
          matInput
          formControlName="display_name"
          placeholder="e.g., Invoice Template"
        />
        @if (pdfTemplatesForm.get('display_name')?.hasError('required')) {
          <mat-error>Display name is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field class="full-width">
        <mat-label>Description</mat-label>
        <textarea
          matInput
          formControlName="description"
          placeholder="Describe the purpose of this template"
          rows="3"
        ></textarea>
      </mat-form-field>

      <!-- Category -->
      <mat-form-field class="full-width">
        <mat-label>Category</mat-label>
        <mat-select formControlName="category">
          <mat-option value="invoice">Invoice</mat-option>
          <mat-option value="receipt">Receipt</mat-option>
          <mat-option value="report">Report</mat-option>
          <mat-option value="letter">Letter</mat-option>
          <mat-option value="certificate">Certificate</mat-option>
          <mat-option value="other">Other</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Page Settings -->
      <h3 class="section-title">Page Settings</h3>

      <div class="form-row">
        <mat-form-field class="half-width">
          <mat-label>Page Size</mat-label>
          <mat-select formControlName="page_size">
            <mat-option value="A4">A4</mat-option>
            <mat-option value="A5">A5</mat-option>
            <mat-option value="Letter">Letter</mat-option>
            <mat-option value="Legal">Legal</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field class="half-width">
          <mat-label>Orientation</mat-label>
          <mat-select formControlName="orientation">
            <mat-option value="portrait">Portrait</mat-option>
            <mat-option value="landscape">Landscape</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field class="full-width">
        <mat-label>Version</mat-label>
        <input matInput formControlName="version" placeholder="e.g., 1.0.0" />
        <mat-hint>Semantic versioning recommended (e.g., 1.0.0)</mat-hint>
      </mat-form-field>

      <!-- Template Data (JSON) -->
      <h3 class="section-title">Template Content</h3>

      <app-monaco-editor
        label="Template Data (JSON/Handlebars)"
        hint="Enter your template in JSON format with Handlebars placeholders"
        height="700px"
        [required]="true"
        formControlName="template_data_raw"
      ></app-monaco-editor>

      <app-monaco-editor
        label="Sample Data (JSON)"
        hint="Sample data for testing the template"
        height="700px"
        formControlName="sample_data_raw"
      ></app-monaco-editor>

      <!-- Schema Section with Generate Button -->
      <div class="schema-section">
        <div class="schema-header">
          <h4 class="schema-title">Schema (JSON)</h4>
          <button
            mat-button
            color="accent"
            type="button"
            (click)="generateSchemaFromSampleData()"
            [disabled]="!pdfTemplatesForm.get('sample_data_raw')?.value"
            matTooltip="Auto-generate JSON Schema from sample data above"
            class="generate-schema-btn"
          >
            <mat-icon>auto_awesome</mat-icon>
            Generate from Sample Data
          </button>
        </div>

        <app-monaco-editor
          label=""
          hint="JSON Schema for template validation"
          height="700px"
          formControlName="schema_raw"
        ></app-monaco-editor>
      </div>

      <!-- Styles & Fonts -->
      <h3 class="section-title">Styling</h3>

      <app-monaco-editor
        label="Custom Styles (JSON)"
        hint="Custom CSS styles in JSON format"
        height="300px"
        formControlName="styles_raw"
      ></app-monaco-editor>

      <app-monaco-editor
        label="Fonts Configuration (JSON)"
        hint="Font configurations for Thai and other languages"
        height="250px"
        formControlName="fonts_raw"
      ></app-monaco-editor>

      <!-- Status & Settings -->
      <h3 class="section-title">Status & Settings</h3>

      <div class="checkbox-group">
        <mat-checkbox formControlName="is_active" class="checkbox-field">
          Active Template
        </mat-checkbox>
        <mat-checkbox
          formControlName="is_template_starter"
          class="checkbox-field"
        >
          Template Starter (Show in template selection when creating new
          templates)
        </mat-checkbox>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          mat-button
          type="button"
          (click)="onCancel()"
          [disabled]="loading"
        >
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          type="button"
          (click)="onSubmit()"
          [disabled]="
            pdfTemplatesForm.invalid ||
            loading ||
            (mode === 'edit' && !hasChanges())
          "
        >
          @if (loading) {
            <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
          }
          {{ mode === 'create' ? 'Create' : 'Update' }} Template
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .pdf-templates-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .section-title {
        margin: 24px 0 12px 0;
        color: rgba(0, 0, 0, 0.87);
        font-size: 16px;
        font-weight: 500;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        padding-bottom: 8px;
      }

      .section-title:first-child {
        margin-top: 0;
      }

      .full-width {
        width: 100%;
      }

      .form-row {
        display: flex;
        gap: 16px;
        width: 100%;
      }

      .half-width {
        flex: 1;
        min-width: 0;
      }

      .checkbox-field {
        margin: 8px 0;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 8px 0;
      }

      app-monaco-editor {
        margin-bottom: 16px;
      }

      .schema-section {
        margin-bottom: 16px;
      }

      .schema-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding: 12px 16px;
        background: rgba(103, 58, 183, 0.05);
        border-radius: 8px 8px 0 0;
        border-bottom: 2px solid rgba(103, 58, 183, 0.2);
      }

      .schema-title {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .generate-schema-btn {
        min-width: 220px;
      }

      .generate-schema-btn mat-icon {
        margin-right: 4px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
        padding: 12px 0;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }

      .inline-spinner {
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
        }

        .half-width {
          width: 100%;
        }

        .form-actions {
          flex-direction: column;
          gap: 8px;
        }
      }
    `,
  ],
})
export class PdfTemplateFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: PdfTemplateFormMode = 'create';
  @Input() initialData?: Partial<PdfTemplate>;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<PdfTemplateFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  // JSON validator
  private jsonValidator(
    control: AbstractControl,
  ): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Allow empty for optional fields
    }

    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  pdfTemplatesForm: FormGroup = this.fb.group({
    // Required fields
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    display_name: ['', [Validators.required]],
    template_data_raw: [
      '',
      [Validators.required, this.jsonValidator.bind(this)],
    ],

    // Optional fields
    description: [''],
    category: ['general'],
    type: ['handlebars'],
    page_size: ['A4'],
    orientation: ['portrait'],
    version: ['1.0.0', [Validators.pattern(/^\d+\.\d+\.\d+$/)]],

    // JSON fields (as raw strings for textarea)
    sample_data_raw: ['', [this.jsonValidator.bind(this)]],
    schema_raw: ['', [this.jsonValidator.bind(this)]],
    styles_raw: ['', [this.jsonValidator.bind(this)]],
    fonts_raw: ['', [this.jsonValidator.bind(this)]],

    // Boolean fields
    is_active: [true],
    is_template_starter: [false],
  });

  ngOnInit() {
    if (this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  private populateForm(pdfTemplates: Partial<PdfTemplate>) {
    console.log('[PDF Template Form] Populating form with data:', pdfTemplates);

    const formValue = {
      name: pdfTemplates.name || '',
      display_name: pdfTemplates.display_name || '',
      description: pdfTemplates.description || '',
      category: pdfTemplates.category || 'general',
      type: pdfTemplates.type || 'handlebars',
      page_size: pdfTemplates.page_size || 'A4',
      orientation: pdfTemplates.orientation || 'portrait',
      version: pdfTemplates.version || '1.0.0',

      // Convert JSON objects to strings for textareas
      template_data_raw: pdfTemplates.template_data
        ? JSON.stringify(pdfTemplates.template_data, null, 2)
        : '',
      sample_data_raw: pdfTemplates.sample_data
        ? JSON.stringify(pdfTemplates.sample_data, null, 2)
        : '',
      schema_raw: pdfTemplates.schema
        ? JSON.stringify(pdfTemplates.schema, null, 2)
        : '',
      styles_raw: pdfTemplates.styles
        ? JSON.stringify(pdfTemplates.styles, null, 2)
        : '',
      fonts_raw: pdfTemplates.fonts
        ? JSON.stringify(pdfTemplates.fonts, null, 2)
        : '',

      is_active: pdfTemplates.is_active ?? true,
      is_template_starter: pdfTemplates.is_template_starter ?? false,
    };

    console.log('[PDF Template Form] Form value to patch:', formValue);
    this.pdfTemplatesForm.patchValue(formValue);
    console.log('[PDF Template Form] Form valid:', this.pdfTemplatesForm.valid);
    console.log(
      '[PDF Template Form] Form errors:',
      this.pdfTemplatesForm.errors,
    );
    this.originalFormValue = this.pdfTemplatesForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.pdfTemplatesForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    console.log('[PDF Template Form] Submit called');
    console.log('[PDF Template Form] Form valid:', this.pdfTemplatesForm.valid);
    console.log('[PDF Template Form] Form value:', this.pdfTemplatesForm.value);

    if (!this.pdfTemplatesForm.valid) {
      console.error('[PDF Template Form] Form is invalid. Field errors:');
      Object.keys(this.pdfTemplatesForm.controls).forEach((key) => {
        const control = this.pdfTemplatesForm.get(key);
        if (control?.errors) {
          console.error(`  ${key}:`, control.errors);
        }
      });
      return;
    }

    if (this.pdfTemplatesForm.valid) {
      const rawFormData = this.pdfTemplatesForm.value;

      // Parse JSON strings back to objects
      const formData: any = {
        name: rawFormData.name,
        display_name: rawFormData.display_name,
        description: rawFormData.description || undefined,
        category: rawFormData.category || undefined,
        type: rawFormData.type || undefined,
        page_size: rawFormData.page_size || undefined,
        orientation: rawFormData.orientation || undefined,
        version: rawFormData.version || undefined,
        is_active: rawFormData.is_active,
        is_template_starter: rawFormData.is_template_starter,
      };

      // Parse template_data (required)
      try {
        formData.template_data = JSON.parse(rawFormData.template_data_raw);
      } catch (e) {
        console.error('Failed to parse template_data:', e);
        return;
      }

      // Parse optional JSON fields
      if (rawFormData.sample_data_raw) {
        try {
          formData.sample_data = JSON.parse(rawFormData.sample_data_raw);
        } catch (e) {
          console.warn('Failed to parse sample_data:', e);
        }
      }

      if (rawFormData.schema_raw) {
        try {
          formData.schema = JSON.parse(rawFormData.schema_raw);
        } catch (e) {
          console.warn('Failed to parse schema:', e);
        }
      }

      if (rawFormData.styles_raw) {
        try {
          formData.styles = JSON.parse(rawFormData.styles_raw);
        } catch (e) {
          console.warn('Failed to parse styles:', e);
        }
      }

      if (rawFormData.fonts_raw) {
        try {
          formData.fonts = JSON.parse(rawFormData.fonts_raw);
        } catch (e) {
          console.warn('Failed to parse fonts:', e);
        }
      }

      console.log('[PDF Template Form] Final form data to emit:', formData);
      this.formSubmit.emit(formData as PdfTemplateFormData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  /**
   * Generate JSON Schema from sample data
   */
  generateSchemaFromSampleData() {
    const sampleDataRaw = this.pdfTemplatesForm.get('sample_data_raw')?.value;

    if (!sampleDataRaw) {
      console.warn('[Schema Generator] No sample data provided');
      return;
    }

    try {
      const sampleData = JSON.parse(sampleDataRaw);
      const schema = this.inferSchemaFromData(sampleData);

      // Update the schema field with pretty-printed JSON
      this.pdfTemplatesForm.patchValue({
        schema_raw: JSON.stringify(schema, null, 2),
      });

      console.log('[Schema Generator] Schema generated successfully:', schema);
    } catch (error) {
      console.error('[Schema Generator] Failed to parse sample data:', error);
    }
  }

  /**
   * Infer JSON Schema from data object
   */
  private inferSchemaFromData(data: any): any {
    if (data === null) {
      return { type: 'null' };
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return {
          type: 'array',
          items: {},
        };
      }
      // Infer schema from first item (assumes homogeneous array)
      return {
        type: 'array',
        items: this.inferSchemaFromData(data[0]),
      };
    }

    const type = typeof data;

    switch (type) {
      case 'string':
        // Check if it's a date string
        if (this.isDateString(data)) {
          return {
            type: 'string',
            format: 'date',
          };
        }
        return { type: 'string' };

      case 'number':
        return {
          type: Number.isInteger(data) ? 'integer' : 'number',
        };

      case 'boolean':
        return { type: 'boolean' };

      case 'object': {
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            properties[key] = this.inferSchemaFromData(data[key]);
            // Mark non-null values as required
            if (data[key] !== null && data[key] !== undefined) {
              required.push(key);
            }
          }
        }

        return {
          type: 'object',
          properties,
          required: required.length > 0 ? required : undefined,
        };
      }

      default:
        return {};
    }
  }

  /**
   * Check if a string is a date format
   */
  private isDateString(value: string): boolean {
    // Match common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY or MM/DD/YYYY
      /^\d{1,2}\s+[ก-๙]+\s+\d{4}$/, // Thai date format (15 มกราคม 2567)
    ];

    return datePatterns.some((pattern) => pattern.test(value));
  }
}
