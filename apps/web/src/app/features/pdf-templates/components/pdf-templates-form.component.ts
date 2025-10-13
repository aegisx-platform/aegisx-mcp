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
import { PdfTemplateGeneratorService } from '../services/pdf-template-generator.service';
import { InsertTemplate } from '../services/pdf-template-insert.service';
import { PdfTemplateValidationService } from '../services/pdf-template-validation.service';
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

      is_active: pdfTemplates.is_active ?? true,
      is_template_starter: pdfTemplates.is_template_starter ?? false,
    };

    console.log('[PDF Template Form] Form value to patch:', formValue);
    this.pdfTemplatesForm.patchValue(formValue);

    // Set hasLogoUploaded signal if logo exists
    if (pdfTemplates.logo_file_id) {
      this.hasLogoUploaded.set(true);
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
        is_active: rawFormData.is_active,
        is_template_starter: rawFormData.is_template_starter,
      };

      // Parse template_data (required)
      // If it contains Handlebars directives outside strings, send as string
      // Otherwise parse as JSON object
      try {
        if (this.detectHandlebars(rawFormData.template_data_raw)) {
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

    try {
      // Extract all Handlebars variables from template
      // Matches: {{variable}}, {{helper arg1}}, {{object.property}}, etc.
      const handlebarsRegex = /\{\{([^}]+)\}\}/g;
      const matches = templateDataRaw.matchAll(handlebarsRegex);

      const variables = new Set<string>();
      const nestedObjects = new Map<string, Set<string>>();
      const helperCalls = new Map<string, string[]>(); // Track helper calls like {{logo logo_file_id}}

      // List of known helpers that take arguments
      const knownHelpers = [
        'add',
        'subtract',
        'multiply',
        'divide',
        'formatDate',
        'formatCurrency',
        'formatNumber',
        'formatPercent',
        'uppercase',
        'lowercase',
        'truncate',
        'eq',
        'gt',
        'lt',
        'gte',
        'lte',
        'ne',
        'or',
        'and',
        'not',
        'logo',
        'default',
        'json',
      ];

      for (const match of matches) {
        const content = match[1].trim();

        // Skip control structures
        if (
          content.startsWith('/') ||
          content.startsWith('else') ||
          content.startsWith('!') ||
          content.startsWith('^')
        ) {
          continue;
        }

        // Handle #each, #if, #unless
        if (content.startsWith('#')) {
          const helperMatch = content.match(/^#(\w+)\s+(.+)/);
          if (helperMatch) {
            const helperName = helperMatch[1]; // each, if, unless
            const variable = helperMatch[2].trim();

            if (helperName === 'each') {
              // Mark as array
              if (!nestedObjects.has(variable)) {
                nestedObjects.set(variable, new Set());
              }
            } else {
              // Conditional - add as boolean variable
              variables.add(variable);
            }
          }
          continue;
        }

        // Check if it's a helper call (e.g., "logo logo_file_id", "add @index 1")
        const parts = content.split(/\s+/);
        if (parts.length >= 2 && knownHelpers.includes(parts[0])) {
          const helperName = parts[0];
          const args = parts.slice(1).filter(
            (arg: string) =>
              !arg.startsWith('@') && // Skip @index, @first, etc.
              !arg.match(/^[\d.]+$/), // Skip numeric literals
          );

          if (!helperCalls.has(helperName)) {
            helperCalls.set(helperName, []);
          }

          for (const arg of args) {
            helperCalls.get(helperName)?.push(arg);
            // Add the argument as a variable
            if (arg.includes('.')) {
              const [obj, prop] = arg.split('.');
              if (!nestedObjects.has(obj)) {
                nestedObjects.set(obj, new Set());
              }
              nestedObjects.get(obj)?.add(prop);
            } else {
              variables.add(arg);
            }
          }
          continue;
        }

        // Handle nested properties (e.g., this.description, row.col1)
        if (content.includes('.')) {
          const parts = content.split('.');
          let rootObject = parts[0];

          // Handle "this.property" in #each loops
          if (rootObject === 'this') {
            // Find the parent array from #each
            const eachMatch = templateDataRaw.match(/\{\{#each\s+(\w+)\}\}/);
            if (eachMatch) {
              rootObject = eachMatch[1];
            } else {
              continue;
            }
          }

          const property = parts.slice(1).join('.');

          if (!nestedObjects.has(rootObject)) {
            nestedObjects.set(rootObject, new Set());
          }
          nestedObjects.get(rootObject)?.add(property);
        } else {
          // Simple variable
          variables.add(content);
        }
      }

      // Build sample data structure
      const sampleData: Record<string, unknown> = {};

      // Add simple variables
      for (const variable of variables) {
        // Skip if this variable is also a nested object
        if (nestedObjects.has(variable)) {
          continue;
        }

        // Skip built-in helpers and special variables
        if (variable.startsWith('@') || knownHelpers.includes(variable)) {
          continue;
        }

        // Skip logo_file_id (injected automatically by template)
        if (variable === 'logo_file_id') {
          continue;
        }

        // Generate sample value based on variable name
        sampleData[variable] = this.generateSampleValue(variable);
      }

      // Add nested objects (arrays with properties)
      for (const [objectName, properties] of nestedObjects.entries()) {
        const objectData: Record<string, unknown> = {};

        for (const property of properties) {
          objectData[property] = this.generateSampleValue(property);
        }

        // Always create array for objects found in nestedObjects
        // (they came from #each or this.property)
        if (Object.keys(objectData).length > 0) {
          sampleData[objectName] = [
            { ...objectData },
            { ...objectData },
            { ...objectData }, // 3 sample items
          ];
        }
      }

      // Update the sample_data field with pretty-printed JSON
      this.pdfTemplatesForm.patchValue({
        sample_data_raw: JSON.stringify(sampleData, null, 2),
      });

      console.log('[Sample Data Generator] Generated sample data:', sampleData);
      console.log('[Sample Data Generator] Variables:', Array.from(variables));
      console.log(
        '[Sample Data Generator] Nested objects:',
        Array.from(nestedObjects.entries()),
      );
      console.log(
        '[Sample Data Generator] Helper calls:',
        Array.from(helperCalls.entries()),
      );
    } catch (error) {
      console.error(
        '[Sample Data Generator] Failed to generate sample data:',
        error,
      );
    }
  }

  /**
   * Generate sample value based on variable name heuristics
   *
   * Note: logo_file_id is NOT generated here - it's injected automatically by the template system
   */
  private generateSampleValue(variableName: string): string {
    const lower = variableName.toLowerCase();

    // Note: We don't generate logo_file_id here - it's handled by the template itself
    // The template's logo_file_id is automatically injected during preview/render

    // File ID patterns (for other file uploads, not logo)
    if (
      lower.includes('file') &&
      lower.includes('id') &&
      !lower.includes('logo')
    ) {
      return 'sample-file-uuid-5678';
    }

    if (lower.includes('logo')) {
      // Fallback base64 image for other logo fields
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    // Date patterns
    if (lower.includes('date') || lower === 'd' || lower === 'dt') {
      return '2024-01-15';
    }

    // Number patterns
    if (
      lower.includes('number') ||
      lower.includes('no') ||
      lower.includes('id') ||
      lower.includes('qty') ||
      lower.includes('quantity') ||
      lower.includes('amount') ||
      lower.includes('price') ||
      lower.includes('total') ||
      lower.includes('subtotal') ||
      lower.includes('tax')
    ) {
      if (
        lower.includes('amount') ||
        lower.includes('price') ||
        lower.includes('total') ||
        lower.includes('tax')
      ) {
        return '1,000.00';
      }
      if (lower.includes('id')) {
        return 'uuid-' + Math.random().toString(36).substring(7);
      }
      return '001';
    }

    // Email pattern
    if (lower.includes('email')) {
      return 'example@email.com';
    }

    // Phone pattern
    if (
      lower.includes('phone') ||
      lower.includes('tel') ||
      lower.includes('mobile')
    ) {
      return '02-123-4567';
    }

    // Name patterns
    if (lower.includes('name')) {
      if (lower.includes('company') || lower.includes('business')) {
        return 'บริษัท ตัวอย่าง จำกัด';
      }
      return 'ชื่อตัวอย่าง';
    }

    // Address pattern
    if (lower.includes('address')) {
      return '123 ถนนตัวอย่าง กรุงเทพฯ 10110';
    }

    // Title pattern
    if (lower.includes('title') || lower.includes('header')) {
      return 'หัวข้อเอกสาร';
    }

    // Description/Content pattern
    if (
      lower.includes('description') ||
      lower.includes('content') ||
      lower.includes('detail') ||
      lower.includes('note') ||
      lower.includes('remark')
    ) {
      return 'ข้อความตัวอย่าง';
    }

    // Reference pattern
    if (lower.includes('ref') || lower.includes('reference')) {
      return 'REF-001';
    }

    // Column/Row/Item patterns (for tables)
    if (lower.includes('col') || lower.includes('item')) {
      return 'รายการ';
    }

    // Default
    return `ค่าตัวอย่าง ${variableName}`;
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
   * Get complete starter template with all basic structures
   */
  private getStarterTemplate(): Record<string, unknown> {
    const hasLogo =
      this.hasLogoUploaded() || this.pdfTemplatesForm.value.logo_file_id;

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],

      // Header (appears on every page)
      header: (_currentPage: number, _pageCount: number) => ({
        text: '{{headerText}}',
        alignment: 'center',
        margin: [0, 20, 0, 0],
        fontSize: 10,
        color: '#666666',
      }),

      // Footer (appears on every page)
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          {
            text: '{{footerLeft}}',
            alignment: 'left',
            fontSize: 10,
            color: '#666666',
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            fontSize: 10,
            color: '#666666',
          },
        ],
        margin: [40, 0, 40, 20],
      }),

      // Main content
      content: [
        // Logo (if uploaded)
        ...(hasLogo
          ? [
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    image: '{{logo logo_file_id}}',
                    width: 80,
                    height: 80,
                    fit: [80, 80],
                  },
                  { width: '*', text: '' },
                ],
                margin: [0, 0, 0, 20],
              },
            ]
          : []),

        // Document Title
        {
          text: '{{documentTitle}}',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        // Metadata section
        {
          columns: [
            {
              width: '*',
              table: {
                widths: ['auto', '*'],
                body: [
                  ['Document No.:', '{{documentNumber}}'],
                  ['Date:', '{{date}}'],
                  ['Reference:', '{{reference}}'],
                ],
              },
              layout: 'noBorders',
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Separator line
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#cccccc',
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Main content area
        {
          text: '{{mainContent}}',
          style: 'body',
          margin: [0, 0, 0, 20],
        },

        // Sample table
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'No.', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Quantity', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader' },
              ],
              [
                '{{row.no}}',
                '{{row.description}}',
                '{{row.qty}}',
                '{{row.amount}}',
              ],
            ],
          },
          layout: {
            hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
            vLineWidth: () => 0,
            hLineColor: () => '#cccccc',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
          margin: [0, 0, 0, 20],
        },

        // Summary section
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                widths: ['auto', 80],
                body: [
                  ['Subtotal:', { text: '{{subtotal}}', alignment: 'right' }],
                  ['Tax (7%):', { text: '{{tax}}', alignment: 'right' }],
                  [
                    { text: 'Total:', bold: true },
                    { text: '{{total}}', bold: true, alignment: 'right' },
                  ],
                ],
              },
              layout: 'noBorders',
            },
          ],
          margin: [0, 0, 0, 40],
        },

        // Signature section
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'Prepared By:', fontSize: 10, margin: [0, 0, 0, 40] },
                { text: '_______________________', alignment: 'center' },
                { text: '({{preparedBy}})', alignment: 'center', fontSize: 10 },
                {
                  text: '{{preparedByTitle}}',
                  alignment: 'center',
                  fontSize: 9,
                  color: '#666666',
                },
              ],
            },
            {
              width: '*',
              stack: [
                { text: 'Approved By:', fontSize: 10, margin: [0, 0, 0, 40] },
                { text: '_______________________', alignment: 'center' },
                { text: '({{approvedBy}})', alignment: 'center', fontSize: 10 },
                {
                  text: '{{approvedByTitle}}',
                  alignment: 'center',
                  fontSize: 9,
                  color: '#666666',
                },
              ],
            },
          ],
          margin: [0, 20, 0, 0],
        },
      ],

      // Styles
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#333333',
        },
        subheader: {
          fontSize: 16,
          bold: true,
          color: '#666666',
        },
        body: {
          fontSize: 12,
          lineHeight: 1.5,
          color: '#333333',
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#333333',
          fillColor: '#f5f5f5',
        },
        footer: {
          fontSize: 10,
          color: '#999999',
        },
      },

      // Default style
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 14,
      },
    };
  }

  /**
   * Get logo template with current logo_file_id
   */
  private getLogoTemplate(): Record<string, unknown> {
    return {
      columns: [
        { width: '*', text: '' },
        {
          image: '{{logo logo_file_id}}',
          width: 80,
          height: 80,
        },
        { width: '*', text: '' },
      ],
      margin: [0, 0, 0, 20],
    };
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
