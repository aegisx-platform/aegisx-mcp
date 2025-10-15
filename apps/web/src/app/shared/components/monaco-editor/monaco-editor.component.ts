import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

/**
 * Monaco Editor Component
 *
 * A reusable code editor component with JSON validation,
 * syntax highlighting, and format capabilities.
 */
@Component({
  selector: 'app-monaco-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MonacoEditorModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonacoEditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MonacoEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="monaco-editor-wrapper">
      <!-- Editor Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <span class="editor-label">{{ label }}</span>
          @if (allowHandlebars) {
            <span class="mode-badge handlebars-mode">
              <mat-icon>code</mat-icon>
              Handlebars
            </span>
          }
          @if (hasError()) {
            <span class="error-badge">
              <mat-icon>error</mat-icon>
              {{ errorMessage() }}
            </span>
          }
        </div>
        <div class="toolbar-right">
          <button
            mat-icon-button
            type="button"
            (click)="formatCode()"
            matTooltip="Format JSON (Alt+Shift+F)"
            [disabled]="disabled || allowHandlebars"
          >
            <mat-icon>format_align_left</mat-icon>
          </button>
          <button
            mat-icon-button
            type="button"
            (click)="validateJson()"
            matTooltip="Validate JSON"
            [disabled]="disabled"
          >
            <mat-icon>check_circle</mat-icon>
          </button>
        </div>
      </div>

      <!-- Monaco Editor -->
      <div class="monaco-editor-container" [style.height]="height">
        <ngx-monaco-editor
          #monacoEditor
          [options]="editorOptions"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          (onInit)="onEditorInit($event)"
          [style.height]="height"
          [style.width]="'100%'"
          class="monaco-editor"
          [ngClass]="{ 'has-error': hasError() }"
        ></ngx-monaco-editor>
      </div>

      <!-- Hint Text -->
      @if (hint && !hasError()) {
        <div class="editor-hint">{{ hint }}</div>
      }
    </div>
  `,
  styles: [
    `
      .monaco-editor-wrapper {
        display: flex;
        flex-direction: column;
        border: 1px solid #3c3c3c;
        border-radius: 4px;
        overflow: hidden;
        background: #1e1e1e;
      }

      .editor-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #2d2d30;
        border-bottom: 1px solid #3c3c3c;
      }

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .toolbar-right {
        display: flex;
        gap: 4px;
      }

      .editor-label {
        font-size: 14px;
        font-weight: 500;
        color: #cccccc;
      }

      .error-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #f48771;
        font-size: 12px;
      }

      .error-badge mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .monaco-editor-container {
        flex: 1;
        min-height: 200px;
        position: relative;
        overflow: hidden;
      }

      .monaco-editor {
        width: 100%;
        height: 100%;
      }

      .monaco-editor.has-error {
        border-left: 3px solid #f48771;
      }

      .editor-hint {
        padding: 8px 12px;
        font-size: 12px;
        color: #858585;
        background: #252526;
        border-top: 1px solid #3c3c3c;
      }

      /* Dark theme icon buttons */
      .toolbar-right button {
        color: #cccccc;
      }

      .toolbar-right button:hover:not(:disabled) {
        background-color: rgba(90, 93, 94, 0.31);
      }

      .toolbar-right button mat-icon {
        color: #cccccc;
      }

      .toolbar-right button:disabled {
        opacity: 0.4;
      }

      /* Deep styles for Monaco internals */
      :host ::ng-deep .monaco-editor-container ngx-monaco-editor {
        display: block;
        width: 100%;
        height: 100%;
      }

      :host ::ng-deep .monaco-editor-container .editor-container {
        width: 100% !important;
        height: 100% !important;
      }

      :host ::ng-deep .monaco-editor {
        border: none !important;
      }

      :host ::ng-deep .monaco-editor .monaco-scrollable-element {
        border: none !important;
      }

      :host ::ng-deep .monaco-editor .overflow-guard {
        border: none !important;
      }
    `,
  ],
})
export class MonacoEditorComponent
  implements ControlValueAccessor, Validator, OnInit, AfterViewInit, OnDestroy
{
  @Input() label = 'JSON Editor';
  @Input() hint = '';
  @Input() height = '300px';
  @Input() language = 'json';
  @Input() disabled = false;
  @Input() required = false;
  @Input() skipValidation = false; // Skip validation entirely (for special cases)
  @Input() allowHandlebars = false; // Allow Handlebars syntax (smart validation)

  @Output() valueChange = new EventEmitter<string>();
  @Output() validationError = new EventEmitter<string | null>();

  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  value = '';
  private editorInstance: editor.IStandaloneCodeEditor | null = null;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  editorOptions = {
    theme: 'vs-dark',
    language: this.language,
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    wrappingIndent: 'indent',
    lineNumbers: 'on',
    folding: true,
    bracketPairColorization: { enabled: true },
    suggest: {
      showWords: true,
      showSnippets: true,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    padding: {
      top: 12,
      bottom: 12,
    },
  };

  ngOnInit() {
    console.log('[Monaco Editor] OnInit', {
      height: this.height,
      language: this.language,
      value: this.value?.substring(0, 50),
    });

    // Update editor height
    if (this.height) {
      this.editorOptions = {
        ...this.editorOptions,
      };
    }

    // Update language
    if (this.language) {
      this.editorOptions = {
        ...this.editorOptions,
        language: this.language,
      };
    }
  }

  ngAfterViewInit() {
    console.log('[Monaco Editor] AfterViewInit', {
      value: this.value?.substring(0, 50),
    });
  }

  ngOnDestroy() {
    // Cleanup editor instance
    if (this.editorInstance) {
      this.editorInstance.dispose();
      this.editorInstance = null;
    }
  }

  /**
   * Handle editor initialization
   */
  onEditorInit(editorInstance: editor.IStandaloneCodeEditor): void {
    this.editorInstance = editorInstance;
    console.log('[Monaco Editor] Editor initialized');

    // Disable Monaco's built-in JSON validation when Handlebars is allowed
    if (this.allowHandlebars && this.language === 'json') {
      // Get Monaco instance
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const monaco = (window as any).monaco;
      if (monaco && monaco.languages && monaco.languages.json) {
        // Configure JSON language to disable validation
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: false,
          allowComments: true,
          schemas: [],
          enableSchemaRequest: false,
        });
      }
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.validateJson();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Validator implementation
  validate(): ValidationErrors | null {
    // 1. Check required field
    if (!this.value || this.value.trim() === '') {
      if (this.required) {
        return { required: true };
      }
      return null;
    }

    // 2. Skip JSON validation if skipValidation is true
    if (this.skipValidation) {
      return null;
    }

    // 3. If allowHandlebars is true, check for Handlebars syntax
    if (this.allowHandlebars) {
      const hasHandlebars = this.detectHandlebars(this.value);
      if (hasHandlebars) {
        // Has Handlebars - valid
        return null;
      }
    }

    // 4. Validate JSON syntax
    try {
      JSON.parse(this.value);
      return null;
    } catch (error: unknown) {
      return {
        invalidJson: true,
        message: this.getReadableJsonError(error),
      };
    }
  }

  onValueChange(newValue: string): void {
    this.value = newValue;
    this.onChange(newValue);
    this.onTouched();
    this.valueChange.emit(newValue);
    this.validateJson();
  }

  /**
   * Validate JSON syntax for UI display
   * Syncs with the validate() method for form validation
   */
  validateJson(): void {
    const errors = this.validate();

    if (errors) {
      this.hasError.set(true);
      if (errors['required']) {
        this.errorMessage.set('This field is required');
        this.validationError.emit('Required field');
      } else if (errors['invalidJson']) {
        this.errorMessage.set(errors['message'] as string);
        this.validationError.emit(errors['message'] as string);
      }
    } else {
      this.hasError.set(false);
      this.errorMessage.set('');
      this.validationError.emit(null);
    }
  }

  /**
   * Detect if content contains Handlebars syntax
   */
  private detectHandlebars(content: string): boolean {
    // Check for common Handlebars patterns
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

  /**
   * Format JSON code
   */
  formatCode(): void {
    if (!this.value || this.value.trim() === '') return;

    try {
      const parsed = JSON.parse(this.value);
      const formatted = JSON.stringify(parsed, null, 2);
      this.value = formatted;
      this.onChange(formatted);
      this.valueChange.emit(formatted);
      this.hasError.set(false);
      this.errorMessage.set('');
      this.validationError.emit(null);
    } catch (error: unknown) {
      // Keep original value if formatting fails
      console.warn('Cannot format invalid JSON:', error);
    }
  }

  /**
   * Insert text at the current cursor position
   * @param text - The text to insert
   * @param selectInserted - Whether to select the inserted text (default: false)
   */
  insertTextAtCursor(text: string, selectInserted = false): void {
    if (!this.editorInstance) {
      console.warn('[Monaco Editor] Editor instance not available');
      return;
    }

    // Get current cursor position
    const selection = this.editorInstance.getSelection();
    if (!selection) {
      console.warn('[Monaco Editor] No selection available');
      return;
    }

    // Create edit operation
    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn,
    };

    // Execute the edit
    this.editorInstance.executeEdits('insert-text', [
      {
        range: range,
        text: text,
        forceMoveMarkers: true,
      },
    ]);

    // Optionally select the inserted text
    if (selectInserted) {
      const lines = text.split('\n');
      const endLineNumber = range.startLineNumber + lines.length - 1;
      const endColumn =
        lines.length === 1
          ? range.startColumn + text.length
          : lines[lines.length - 1].length + 1;

      this.editorInstance.setSelection({
        startLineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        endLineNumber: endLineNumber,
        endColumn: endColumn,
      });
    } else {
      // Move cursor to the end of inserted text
      const lines = text.split('\n');
      const endLineNumber = range.startLineNumber + lines.length - 1;
      const endColumn =
        lines.length === 1
          ? range.startColumn + text.length
          : lines[lines.length - 1].length + 1;

      this.editorInstance.setPosition({
        lineNumber: endLineNumber,
        column: endColumn,
      });
    }

    // Focus the editor
    this.editorInstance.focus();

    // Update the value and trigger validation
    const newValue = this.editorInstance.getValue();
    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
    this.validateJson();
  }

  /**
   * Get readable error message from JSON parse error
   */
  private getReadableJsonError(error: unknown): string {
    const message = error instanceof Error ? error.message : 'Invalid JSON';

    // Extract line and column from error message
    const match = message.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const lines = this.value.substring(0, position).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      return `Syntax error at line ${line}, column ${column}`;
    }

    return message;
  }
}
