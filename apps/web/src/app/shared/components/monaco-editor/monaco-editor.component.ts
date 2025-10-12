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
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  ],
  template: `
    <div class="monaco-editor-wrapper">
      <!-- Editor Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <span class="editor-label">{{ label }}</span>
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
            [disabled]="disabled"
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
          [options]="editorOptions"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
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
  implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy
{
  @Input() label = 'JSON Editor';
  @Input() hint = '';
  @Input() height = '300px';
  @Input() language = 'json';
  @Input() disabled = false;
  @Input() required = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() validationError = new EventEmitter<string | null>();

  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  value = '';
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
    // Cleanup if needed
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

  onValueChange(newValue: string): void {
    this.value = newValue;
    this.onChange(newValue);
    this.onTouched();
    this.valueChange.emit(newValue);
    this.validateJson();
  }

  /**
   * Validate JSON syntax
   */
  validateJson(): void {
    if (!this.value || this.value.trim() === '') {
      if (this.required) {
        this.hasError.set(true);
        this.errorMessage.set('This field is required');
        this.validationError.emit('Required field');
      } else {
        this.hasError.set(false);
        this.errorMessage.set('');
        this.validationError.emit(null);
      }
      return;
    }

    try {
      JSON.parse(this.value);
      this.hasError.set(false);
      this.errorMessage.set('');
      this.validationError.emit(null);
    } catch (error: any) {
      this.hasError.set(true);
      const errorMsg = this.getReadableJsonError(error);
      this.errorMessage.set(errorMsg);
      this.validationError.emit(errorMsg);
    }
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
    } catch (error: any) {
      // Keep original value if formatting fails
      console.warn('Cannot format invalid JSON:', error);
    }
  }

  /**
   * Get readable error message from JSON parse error
   */
  private getReadableJsonError(error: any): string {
    const message = error.message || 'Invalid JSON';

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
