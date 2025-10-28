import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
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
import { FileUploadService } from '../../../shared/ui/components/file-upload/file-upload.service';
import { PdfSampleDataGeneratorService } from '../services/pdf-sample-data-generator.service';
import { PdfTemplateGeneratorService } from '../services/pdf-template-generator.service';
import { InsertTemplate } from '../services/pdf-template-insert.service';
import { PdfTemplateValidationService } from '../services/pdf-template-validation.service';
import {
  AssetData,
  AssetInsertEvent,
  AssetsManagerComponent,
} from './assets-manager/assets-manager.component';
import {
  LogoUploadComponent,
  LogoUploadData,
} from './logo-upload/logo-upload.component';
import { TemplateInsertToolbarComponent } from './template-insert-toolbar/template-insert-toolbar.component';

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
    TemplateInsertToolbarComponent,
    LogoUploadComponent,
    AssetsManagerComponent,
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

      <!-- Quick Insert Toolbar -->
      <app-template-insert-toolbar
        [hasLogo]="hasLogoUploaded() || !!pdfTemplatesForm.value.logo_file_id"
        (templateSelected)="insertTemplate($event)"
      ></app-template-insert-toolbar>

      <app-monaco-editor
        #templateDataEditor
        label="Template Data (JSON/Handlebars)"
        hint="Enter your template in JSON format with Handlebars placeholders"
        height="700px"
        [required]="true"
        [allowHandlebars]="true"
        formControlName="template_data_raw"
      ></app-monaco-editor>

      <!-- Sample Data Section with Generate Button -->
      <div class="sample-data-section">
        <div class="sample-data-header">
          <h4 class="sample-data-title">Sample Data (JSON)</h4>
          <button
            mat-button
            color="primary"
            type="button"
            (click)="generateSampleDataFromTemplate()"
            [disabled]="!pdfTemplatesForm.get('template_data_raw')?.value"
            matTooltip="Extract variables from template and generate sample data structure"
            class="generate-sample-btn"
          >
            <mat-icon>auto_fix_high</mat-icon>
            Generate from Template
          </button>
        </div>

        <app-monaco-editor
          label=""
          hint="Sample data for testing the template"
          height="700px"
          formControlName="sample_data_raw"
        ></app-monaco-editor>
      </div>

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

      <!-- Logo Upload -->
      <h3 class="section-title">Logo Settings</h3>

      <app-logo-upload
        [initialLogoId]="pdfTemplatesForm.value.logo_file_id"
        [helperText]="
          'Upload a logo image (PNG, JPG, SVG). Use ' +
          logoHelperExample +
          ' in your template to display it.'
        "
        (logoUploaded)="onLogoUploaded($event)"
        (logoRemoved)="onLogoRemoved()"
        (errorOccurred)="onLogoError($event)"
      ></app-logo-upload>

      <!-- Assets Manager -->
      <h3 class="section-title">Template Assets</h3>

      <app-assets-manager
        [initialAssetIds]="initialAssetIds()"
        [allowDuplicates]="true"
        [maxAssets]="20"
        (assetUploaded)="onAssetUploaded($event)"
        (assetRemoved)="onAssetRemoved($event)"
        (assetInserted)="onAssetInserted($event)"
        (errorOccurred)="onAssetError($event)"
      ></app-assets-manager>

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

      .sample-data-section {
        margin-bottom: 16px;
      }

      .sample-data-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding: 12px 16px;
        background: rgba(33, 150, 243, 0.05);
        border-radius: 8px 8px 0 0;
        border-bottom: 2px solid rgba(33, 150, 243, 0.2);
      }

      .sample-data-title {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .generate-sample-btn {
        min-width: 240px;
      }

      .generate-sample-btn mat-icon {
        margin-right: 4px;
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
  private fileUploadService = inject(FileUploadService);
  private generatorService = inject(PdfTemplateGeneratorService);
  private validationService = inject(PdfTemplateValidationService);
  private sampleDataGenerator = inject(PdfSampleDataGeneratorService);

  @Input() mode: PdfTemplateFormMode = 'create';
  @Input() initialData?: Partial<PdfTemplate>;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<PdfTemplateFormData>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() logoChanged = new EventEmitter<void>();

  // ViewChild for Monaco Editor (template_data editor)
  @ViewChild('templateDataEditor') templateDataEditor?: MonacoEditorComponent;

  private originalFormValue: Record<string, unknown> | null = null;

  // Example text for handlebars helper
  readonly logoHelperExample = '{{logo logo_file_id}}';

  // Track if logo is uploaded (for template insert toolbar)
  hasLogoUploaded = signal(false);

  // JSON validator - delegate to validation service
  private jsonValidator(
    control: AbstractControl,
  ): { [key: string]: unknown } | null {
    return this.validationService.jsonValidator()(control);
  }

  /**
   * Detect if content contains Handlebars syntax
   */
  private detectHandlebars(content: string): boolean {
    if (!content) return false;

    const handlebarsPatterns = [
      /\{\{[^}]+\}\}/, // Variables: {{variable}}
      /\{\{#each\s+[^}]+\}\}/, // Each loop: {{#each items}}
      /\{\{\/each\}\}/, // End each: {{/each}}
      /\{\{#if\s+[^}]+\}\}/, // If statement: {{#if condition}}
      /\{\{\/if\}\}/, // End if: {{/if}}
      /\{\{#unless\s+[^}]+\}\}/, // Unless: {{#unless condition}}
      /\{\{\/unless\}\}/, // End unless: {{/unless}}
      /\{\{else\}\}/, // Else: {{else}}
      /\{\{@[^}]+\}\}/, // Special variables: {{@index}}, {{@first}}, etc.
    ];

    return handlebarsPatterns.some((pattern) => pattern.test(content));
  }

  pdfTemplatesForm: FormGroup = this.fb.group({
    // Required fields
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    display_name: ['', [Validators.required]],
    template_data_raw: [
      '',
      [Validators.required], // ✅ เอา jsonValidator ออก เพราะ Monaco Editor validate แล้ว
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

    // Logo field
    logo_file_id: [''],

    // Asset file IDs (stored as JSON array string)
    asset_file_ids: ['[]'],

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
      // Special handling: if template_data is already a string (Handlebars template), use it directly
      template_data_raw: pdfTemplates.template_data
        ? typeof pdfTemplates.template_data === 'string'
          ? pdfTemplates.template_data // Already a string, don't stringify again
          : JSON.stringify(pdfTemplates.template_data, null, 2) // Object, stringify it
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

      // Logo field
      logo_file_id: pdfTemplates.logo_file_id || '',

      // Asset file IDs - will be populated from metadata if available, otherwise scan template
      asset_file_ids: '[]',

      is_active: pdfTemplates.is_active ?? true,
      is_template_starter: pdfTemplates.is_template_starter ?? false,
    };

    console.log('[PDF Template Form] Form value to patch:', formValue);
    this.pdfTemplatesForm.patchValue(formValue);

    // Set hasLogoUploaded signal if logo exists
    if (pdfTemplates.logo_file_id) {
      this.hasLogoUploaded.set(true);
    }

    // Load asset file IDs from metadata or scan template_data
    let assetIds: string[] = [];

    // First, try to get from metadata (if backend stores it)
    const pdfTemplateWithAssets = pdfTemplates as Partial<
      PdfTemplate & { asset_file_ids: string[] | string }
    >;
    if (pdfTemplateWithAssets.asset_file_ids) {
      assetIds = Array.isArray(pdfTemplateWithAssets.asset_file_ids)
        ? pdfTemplateWithAssets.asset_file_ids
        : JSON.parse(pdfTemplateWithAssets.asset_file_ids || '[]');
    } else {
      // Fallback: Extract asset IDs from template data (scan for {{asset "assetId"}} patterns)
      if (pdfTemplates.template_data) {
        const templateDataStr =
          typeof pdfTemplates.template_data === 'string'
            ? pdfTemplates.template_data
            : JSON.stringify(pdfTemplates.template_data);
        // Match {{asset "uuid"}} or {{asset 'uuid'}} with optional whitespace
        const assetPattern = /\{\{\s*asset\s+["']([a-f0-9-]{36})["']\s*\}\}/gi;
        const assetIdSet = new Set<string>();
        let match;
        while ((match = assetPattern.exec(templateDataStr)) !== null) {
          assetIdSet.add(match[1]);
        }
        assetIds = Array.from(assetIdSet);
      }
    }

    if (assetIds.length > 0) {
      this.initialAssetIds.set(assetIds);
      // Populate uploadedAssetIds set for tracking
      this.uploadedAssetIds.clear();
      assetIds.forEach((id) => this.uploadedAssetIds.add(id));
      // Update form field
      this.pdfTemplatesForm.patchValue({
        asset_file_ids: JSON.stringify(assetIds),
      });
      console.log('[PDF Template Form] Loaded asset IDs:', assetIds);
    }

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
      const formData: Record<string, unknown> = {
        name: rawFormData.name,
        display_name: rawFormData.display_name,
        description: rawFormData.description || undefined,
        category: rawFormData.category || undefined,
        type: rawFormData.type || undefined,
        page_size: rawFormData.page_size || undefined,
        orientation: rawFormData.orientation || undefined,
        version: rawFormData.version || undefined,
        // Allow null to be sent (for deleting logo)
        logo_file_id:
          rawFormData.logo_file_id === null
            ? null
            : rawFormData.logo_file_id || undefined,
        // Convert Set to Array for asset_file_ids
        asset_file_ids: Array.from(this.uploadedAssetIds),
        is_active: rawFormData.is_active,
        is_template_starter: rawFormData.is_template_starter,
      };

      // Parse template_data (required)
      // If it contains Handlebars directives outside strings, send as string
      // Otherwise parse as JSON object
      try {
        const hasHandlebars = this.detectHandlebars(
          rawFormData.template_data_raw,
        );

        if (hasHandlebars) {
          // Has Handlebars - send as string (backend will handle compilation)
          formData['template_data'] = rawFormData.template_data_raw;
        } else {
          // Pure JSON - parse and send as object
          formData['template_data'] = JSON.parse(rawFormData.template_data_raw);
        }
      } catch (_e) {
        console.error('Failed to parse template_data:', _e);
        return;
      }

      // Parse optional JSON fields
      if (rawFormData.sample_data_raw) {
        try {
          formData['sample_data'] = JSON.parse(rawFormData.sample_data_raw);
        } catch (e) {
          console.warn('Failed to parse sample_data:', e);
        }
      }

      if (rawFormData.schema_raw) {
        try {
          formData['schema'] = JSON.parse(rawFormData.schema_raw);
        } catch (e) {
          console.warn('Failed to parse schema:', e);
        }
      }

      if (rawFormData.styles_raw) {
        try {
          formData['styles'] = JSON.parse(rawFormData.styles_raw);
        } catch (e) {
          console.warn('Failed to parse styles:', e);
        }
      }

      if (rawFormData.fonts_raw) {
        try {
          formData['fonts'] = JSON.parse(rawFormData.fonts_raw);
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
   * Generate Sample Data from Template by extracting Handlebars variables
   */
  generateSampleDataFromTemplate() {
    const templateDataRaw =
      this.pdfTemplatesForm.get('template_data_raw')?.value;

    if (!templateDataRaw) {
      console.warn('[Sample Data Generator] No template data provided');
      return;
    }

    const sampleData =
      this.sampleDataGenerator.generateFromTemplate(templateDataRaw);

    if (sampleData) {
      // Update the sample_data field with pretty-printed JSON
      this.pdfTemplatesForm.patchValue({
        sample_data_raw: JSON.stringify(sampleData, null, 2),
      });
    }
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
  private inferSchemaFromData(data: unknown): Record<string, unknown> {
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
        if (typeof data === 'string' && this.isDateString(data)) {
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
        const properties: Record<string, Record<string, unknown>> = {};
        const required: string[] = [];
        const objData = data as Record<string, unknown>;

        for (const key in objData) {
          if (Object.prototype.hasOwnProperty.call(objData, key)) {
            properties[key] = this.inferSchemaFromData(objData[key]);
            // Mark non-null values as required
            if (objData[key] !== null && objData[key] !== undefined) {
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

  /**
   * Handle logo upload from logo-upload component
   */
  onLogoUploaded(logoData: LogoUploadData) {
    this.hasLogoUploaded.set(true);
    this.pdfTemplatesForm.patchValue({
      logo_file_id: logoData.id,
    });
    console.log('Logo uploaded:', logoData);
    // Emit event to trigger preview refresh in dialog
    this.logoChanged.emit();
  }

  /**
   * Handle logo removal from logo-upload component
   */
  onLogoRemoved() {
    this.hasLogoUploaded.set(false);
    this.pdfTemplatesForm.patchValue({
      logo_file_id: null,
    });
    // Emit event to trigger preview refresh in dialog
    this.logoChanged.emit();
  }

  /**
   * Handle logo error from logo-upload component
   */
  onLogoError(error: string) {
    console.error('Logo error:', error);
    // Could show a snackbar or other notification here
  }

  /**
   * Track uploaded asset IDs
   */
  initialAssetIds = signal<string[]>([]);
  private uploadedAssetIds = new Set<string>();

  /**
   * Handle asset upload from assets-manager component
   */
  onAssetUploaded(asset: AssetData) {
    this.uploadedAssetIds.add(asset.id);
    console.log('Asset uploaded:', asset);

    // Update form field with current asset IDs
    const assetIds = Array.from(this.uploadedAssetIds);
    this.pdfTemplatesForm.patchValue({
      asset_file_ids: JSON.stringify(assetIds),
    });
    console.log('Updated asset_file_ids:', assetIds);
  }

  /**
   * Handle asset removal from assets-manager component
   */
  onAssetRemoved(assetId: string) {
    this.uploadedAssetIds.delete(assetId);
    console.log('Asset removed:', assetId);

    // Update form field with current asset IDs
    const assetIds = Array.from(this.uploadedAssetIds);
    this.pdfTemplatesForm.patchValue({
      asset_file_ids: JSON.stringify(assetIds),
    });
    console.log('Updated asset_file_ids:', assetIds);
  }

  /**
   * Handle asset insertion into template editor
   * Inserts Handlebars helper syntax: {{asset "assetId"}}
   */
  onAssetInserted(event: AssetInsertEvent) {
    console.log('[Insert Asset] Button clicked:', event.assetId);

    // Check if editor is available
    if (!this.templateDataEditor) {
      console.error('[Insert Asset] Template data editor not available');
      console.warn('Editor not ready. Please try again.');
      return;
    }

    // Insert asset as image object with proper JSON structure
    // Using single quotes inside Handlebars helper to avoid JSON escape issues
    const assetImageObject = `{
  "image": "{{asset '${event.assetId}'}}",
  "width": 100,
  "height": 100
}`;

    this.templateDataEditor.insertTextAtCursor(assetImageObject);

    console.log(
      '[Insert Asset] Inserted image object for asset:',
      event.assetId,
    );
  }

  /**
   * Handle asset error from assets-manager component
   */
  onAssetError(error: string) {
    console.error('Asset error:', error);
    // Could show a snackbar or other notification here
  }

  /**
   * Insert template structure at cursor position using Monaco Editor API
   */
  insertTemplate(insertTemplate: InsertTemplate) {
    console.log('[Insert Template] Button clicked:', insertTemplate.name);

    // Check if editor is available
    if (!this.templateDataEditor) {
      console.error('[Insert Template] Template data editor not available');
      console.warn('Editor not ready. Please try again.');
      return;
    }

    // Check if logo is required but not uploaded
    const logoTemplateNames = [
      'Logo',
      'Logo (Left)',
      'Logo (Right)',
      'Logo (Center)',
    ];
    if (
      logoTemplateNames.includes(insertTemplate.name) &&
      !this.hasLogoUploaded() &&
      !this.pdfTemplatesForm.value.logo_file_id
    ) {
      console.warn('[Insert Template] Logo required but not uploaded');
      console.warn('Please upload a logo first before inserting logo template');
      return;
    }

    // Get template structure - parse JSON template string
    let templateStructure: Record<string, unknown>;
    try {
      templateStructure = JSON.parse(insertTemplate.template);
    } catch (error) {
      console.error('[Insert Template] Failed to parse template:', error);
      return;
    }

    // Convert template structure to pretty-printed JSON string
    let templateText = JSON.stringify(templateStructure, null, 2);

    // Process special templates with __bodyTemplate
    templateText = this.processHandlebarsBodyTemplate(templateText);

    // Check if this is a starter template (has root-level content/pageSize)
    const isStarterTemplate =
      insertTemplate.name === 'Starter' &&
      (templateStructure['content'] || templateStructure['pageSize']);

    const currentValue =
      this.pdfTemplatesForm.get('template_data_raw')?.value || '';
    let textToInsert = templateText;

    if (!currentValue || currentValue.trim() === '') {
      // Empty editor
      if (isStarterTemplate) {
        // Starter template has complete structure - insert as-is
        textToInsert = templateText;
      } else {
        // Regular template - wrap in content array
        textToInsert = `{\n  "content": [\n${templateText
          .split('\n')
          .map((line) => '    ' + line)
          .join('\n')}\n  ]\n}`;
      }
    } else {
      // Editor has content
      if (isStarterTemplate) {
        // Starter template should replace everything - confirm first
        if (confirm('Starter template will replace all content. Continue?')) {
          // Clear editor and insert starter template
          this.pdfTemplatesForm.patchValue({ template_data_raw: templateText });
          console.log(
            '[Insert Template] Replaced with starter template:',
            insertTemplate.name,
          );
          return;
        } else {
          return;
        }
      } else {
        // Regular template - insert at cursor with comma
        textToInsert = `,\n${templateText}`;
      }
    }

    // Insert at cursor position using Monaco Editor API
    this.templateDataEditor.insertTextAtCursor(textToInsert);

    console.log(
      '[Insert Template] Inserted template at cursor:',
      insertTemplate.name,
    );
  }

  /**
   * Process template with __handlebarsBody placeholder
   * Replaces "body": "__HANDLEBARS_BODY_PLACEHOLDER__" with actual Handlebars template
   */
  private processHandlebarsBodyTemplate(templateText: string): string {
    // Check if we have the placeholder
    if (!templateText.includes('__HANDLEBARS_BODY_PLACEHOLDER__')) {
      return templateText; // No placeholder found, return as-is
    }

    // Find the __handlebarsBody field value
    // Pattern: "__handlebarsBody": "..." where ... can contain escaped quotes
    const handlebarsBodyRegex = /"__handlebarsBody":\s*"((?:[^"\\]|\\.)*)"/s;
    const match = templateText.match(handlebarsBodyRegex);

    if (!match) {
      console.warn(
        '[processHandlebarsBodyTemplate] No __handlebarsBody field found',
      );
      return templateText;
    }

    // Extract and unescape the handlebars body
    let handlebarsBody = match[1];

    // Unescape JSON string escapes
    handlebarsBody = handlebarsBody
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '  ')
      .replace(/\\\\/g, '\\');

    // Replace the placeholder with the actual body (no quotes around it)
    let result = templateText.replace(
      '"__HANDLEBARS_BODY_PLACEHOLDER__"',
      handlebarsBody,
    );

    // Remove the __handlebarsBody field entirely
    // Match: , "__handlebarsBody": "..." or "__handlebarsBody": "..." ,
    result = result.replace(
      /,?\s*"__handlebarsBody":\s*"(?:[^"\\]|\\.)*"\s*,?/s,
      '',
    );

    // Clean up any double commas that might result
    result = result.replace(/,\s*,/g, ',');

    // Clean up trailing commas before closing braces/brackets
    result = result.replace(/,(\s*[}\]])/g, '$1');

    return result;
  }
}
