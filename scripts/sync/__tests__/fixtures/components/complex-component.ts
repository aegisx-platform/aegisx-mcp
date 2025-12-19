/**
 * Complex component fixture with multiple inputs/outputs and documentation
 */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Advanced form input component with validation and custom error handling
 *
 * This component provides a comprehensive form field with:
 * - Real-time validation
 * - Custom error messages
 * - Accessibility features
 * - Theme support
 *
 * @example
 * ```typescript
 * <ax-form-input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   [(ngModel)]="emailValue"
 *   (valueChange)="onEmailChange($event)"
 *   (focusChange)="onFocus($event)">
 * </ax-form-input>
 * ```
 *
 * @example
 * ```typescript
 * // With validation
 * <ax-form-input
 *   [control]="emailControl"
 *   [required]="true"
 *   [minLength]="5"
 *   errorMessage="Invalid email address">
 * </ax-form-input>
 * ```
 *
 * @bestPractice Always provide a label for accessibility
 * @bestPractice Use clearIcon for searchable fields
 * @note The component is fully type-safe and supports complex validations
 * @see FormValidator, ErrorHandler
 * @related InputGroup, FormField
 */
@Component({
  selector: 'ax-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group" [class.disabled]="disabled">
      <label *ngIf="label" [attr.for]="id">{{ label }}</label>
      <div class="input-wrapper">
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [attr.aria-label]="label"
          [attr.aria-required]="required"
          (input)="onInput($event)"
          (focus)="onFocus($event)"
          (blur)="onBlur($event)"
        />
        <span *ngIf="clearIcon && value" class="clear-icon" (click)="clear()"
          >×</span
        >
      </div>
      <small *ngIf="errorMessage" class="error-message">{{
        errorMessage
      }}</small>
    </div>
  `,
  styles: [
    `
      .form-group {
        margin-bottom: 16px;
      }
      .disabled {
        opacity: 0.6;
        pointer-events: none;
      }
    `,
  ],
})
export class FormInputComponent implements OnInit {
  // Basic properties
  @Input() id: string = 'input-' + Math.random().toString(36).substr(2, 9);
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';

  // State properties
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;

  // Configuration properties
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() pattern?: string;
  @Input() clearIcon: boolean = false;
  @Input({ required: true }) control!: FormControl;

  // Error handling
  @Input() errorMessage?: string;
  @Input() customErrorMessages?: Record<string, string>;

  // Theme and styling
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'outlined' | 'filled' = 'default';
  @Input() classList: string[] = [];

  // Output events
  @Output() valueChange = new EventEmitter<string>();
  @Output() focusChange = new EventEmitter<boolean>();
  @Output() blurEvent = new EventEmitter<FocusEvent>();
  @Output() inputEvent = new EventEmitter<InputEvent>();

  ngOnInit() {
    // Initialize component
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.inputEvent.emit(event as InputEvent);
  }

  onFocus(event: FocusEvent) {
    this.focusChange.emit(true);
  }

  onBlur(event: FocusEvent) {
    this.focusChange.emit(false);
    this.blurEvent.emit(event);
  }

  clear() {
    this.value = '';
    this.valueChange.emit('');
  }
}
