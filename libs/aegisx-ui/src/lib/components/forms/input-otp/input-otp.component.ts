import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import type { OtpLength, OtpPattern, OtpSize } from './input-otp.types';

/**
 * AegisX Input OTP Component
 *
 * Accessible one-time password input with copy/paste support.
 *
 * @example
 * // Basic 6-digit OTP
 * <ax-input-otp [(value)]="otpValue" [length]="6" />
 *
 * @example
 * // With separator and pattern
 * <ax-input-otp
 *   [(value)]="code"
 *   [length]="6"
 *   [separatorAfter]="3"
 *   pattern="alphanumeric"
 *   (completed)="onOtpComplete($event)"
 * />
 *
 * @example
 * // With reactive forms
 * <ax-input-otp formControlName="otp" [length]="4" />
 */
@Component({
  selector: 'ax-input-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxInputOtpComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="ax-input-otp"
      [class.ax-input-otp--disabled]="disabled"
      [class.ax-input-otp--error]="error"
      [class.ax-input-otp--sm]="size === 'sm'"
      [class.ax-input-otp--lg]="size === 'lg'"
      role="group"
      [attr.aria-label]="ariaLabel"
    >
      @for (slot of slots(); track slot.index; let i = $index) {
        @if (showSeparatorBefore(i)) {
          <span class="ax-input-otp__separator" aria-hidden="true">
            {{ separatorChar }}
          </span>
        }
        <input
          #slotInput
          type="text"
          [attr.inputmode]="inputMode"
          [attr.aria-label]="'Digit ' + (i + 1) + ' of ' + length"
          [attr.maxlength]="1"
          [value]="slot.value"
          [disabled]="disabled"
          [readonly]="readonly"
          class="ax-input-otp__slot"
          [class.ax-input-otp__slot--filled]="slot.value"
          [class.ax-input-otp__slot--active]="focusedIndex() === i"
          (input)="onInput($event, i)"
          (keydown)="onKeyDown($event, i)"
          (focus)="onFocus(i)"
          (blur)="onBlur()"
          (paste)="onPaste($event, i)"
          autocomplete="one-time-code"
        />
      }
    </div>
  `,
  styleUrls: ['./input-otp.component.scss'],
})
export class AxInputOtpComponent
  implements ControlValueAccessor, AfterViewInit
{
  @ViewChildren('slotInput') slotInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  /** Number of OTP digits (4-8) */
  @Input() length: OtpLength = 6;

  /** Input pattern restriction */
  @Input() pattern: OtpPattern = 'digits';

  /** Component size */
  @Input() size: OtpSize = 'md';

  /** Show separator after this position (1-indexed) */
  @Input() separatorAfter?: number;

  /** Separator character */
  @Input() separatorChar: string = '-';

  /** Disabled state */
  @Input() disabled: boolean = false;

  /** Readonly state */
  @Input() readonly: boolean = false;

  /** Error state */
  @Input() error: boolean = false;

  /** Auto-focus first input on init */
  @Input() autoFocus: boolean = false;

  /** Auto-submit when complete */
  @Input() autoSubmit: boolean = true;

  /** Aria label for the group */
  @Input() ariaLabel: string = 'One-time password input';

  /** Emits the current OTP value */
  @Output() valueChange = new EventEmitter<string>();

  /** Emits when all slots are filled */
  @Output() completed = new EventEmitter<string>();

  // Internal state
  private values = signal<string[]>([]);
  focusedIndex = signal<number | null>(null);

  // Computed slots for template
  slots = computed(() => {
    const vals = this.values();
    return Array.from({ length: this.length }, (_, i) => ({
      index: i,
      value: vals[i] || '',
    }));
  });

  // Get current OTP value
  get value(): string {
    return this.values().join('');
  }

  // Set OTP value
  @Input()
  set value(val: string) {
    this.writeValue(val);
  }

  // Input mode based on pattern
  get inputMode(): string {
    return this.pattern === 'digits' ? 'numeric' : 'text';
  }

  // Pattern regex
  private get patternRegex(): RegExp {
    switch (this.pattern) {
      case 'digits':
        return /^[0-9]$/;
      case 'alpha':
        return /^[a-zA-Z]$/;
      case 'alphanumeric':
        return /^[a-zA-Z0-9]$/;
      default:
        return /^[0-9]$/;
    }
  }

  // ControlValueAccessor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    if (this.autoFocus && !this.disabled) {
      setTimeout(() => this.focusSlot(0), 0);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    const newValues = Array.from(
      { length: this.length },
      (_, i) => value?.[i] || '',
    );
    this.values.set(newValues);
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

  // Show separator before slot
  showSeparatorBefore(index: number): boolean {
    return this.separatorAfter !== undefined && index === this.separatorAfter;
  }

  // Handle input
  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const char = input.value.slice(-1); // Get last character

    if (char && !this.patternRegex.test(char)) {
      input.value = this.values()[index] || '';
      return;
    }

    const newValues = [...this.values()];
    newValues[index] = char.toUpperCase();
    this.values.set(newValues);

    this.emitChange();

    // Move to next slot if filled
    if (char && index < this.length - 1) {
      this.focusSlot(index + 1);
    }

    // Check if complete
    if (this.isComplete()) {
      this.completed.emit(this.value);
    }
  }

  // Handle keyboard navigation
  onKeyDown(event: KeyboardEvent, index: number): void {
    const { key } = event;

    switch (key) {
      case 'Backspace':
        event.preventDefault();
        this.handleBackspace(index);
        break;

      case 'Delete':
        event.preventDefault();
        this.clearSlot(index);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (index > 0) {
          this.focusSlot(index - 1);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (index < this.length - 1) {
          this.focusSlot(index + 1);
        }
        break;

      case 'Home':
        event.preventDefault();
        this.focusSlot(0);
        break;

      case 'End':
        event.preventDefault();
        this.focusSlot(this.length - 1);
        break;

      default:
        // Allow single character input
        if (key.length === 1 && this.patternRegex.test(key)) {
          event.preventDefault();
          this.setSlotValue(index, key.toUpperCase());
          if (index < this.length - 1) {
            this.focusSlot(index + 1);
          }
        }
        break;
    }
  }

  // Handle backspace
  private handleBackspace(index: number): void {
    const currentValue = this.values()[index];

    if (currentValue) {
      // Clear current slot
      this.clearSlot(index);
    } else if (index > 0) {
      // Move to previous slot and clear it
      this.focusSlot(index - 1);
      this.clearSlot(index - 1);
    }
  }

  // Handle paste
  onPaste(event: ClipboardEvent, startIndex: number): void {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text') || '';
    const filteredData = pastedData
      .split('')
      .filter((char) => this.patternRegex.test(char))
      .map((char) => char.toUpperCase());

    if (filteredData.length === 0) return;

    const newValues = [...this.values()];

    // Fill slots starting from startIndex or from beginning if pasting full OTP
    const pasteStart = filteredData.length >= this.length ? 0 : startIndex;

    for (
      let i = 0;
      i < filteredData.length && pasteStart + i < this.length;
      i++
    ) {
      newValues[pasteStart + i] = filteredData[i];
    }

    this.values.set(newValues);
    this.emitChange();

    // Focus last filled slot or next empty slot
    const lastFilledIndex = Math.min(
      pasteStart + filteredData.length - 1,
      this.length - 1,
    );
    this.focusSlot(lastFilledIndex);

    // Check if complete
    if (this.isComplete()) {
      this.completed.emit(this.value);
    }
  }

  // Focus handlers
  onFocus(index: number): void {
    this.focusedIndex.set(index);
    // Select the input content
    const input = this.slotInputs?.get(index)?.nativeElement;
    if (input) {
      input.select();
    }
  }

  onBlur(): void {
    this.focusedIndex.set(null);
    this.onTouched();
  }

  // Helper methods
  private focusSlot(index: number): void {
    const input = this.slotInputs?.get(index)?.nativeElement;
    if (input) {
      input.focus();
    }
  }

  private setSlotValue(index: number, value: string): void {
    const newValues = [...this.values()];
    newValues[index] = value;
    this.values.set(newValues);
    this.emitChange();

    if (this.isComplete()) {
      this.completed.emit(this.value);
    }
  }

  private clearSlot(index: number): void {
    const newValues = [...this.values()];
    newValues[index] = '';
    this.values.set(newValues);
    this.emitChange();
  }

  private emitChange(): void {
    const val = this.value;
    this.valueChange.emit(val);
    this.onChange(val);
  }

  private isComplete(): boolean {
    return this.values().every((v) => v.length > 0);
  }

  // Public methods
  /** Clear all slots */
  clear(): void {
    this.values.set(Array(this.length).fill(''));
    this.emitChange();
    this.focusSlot(0);
  }

  /** Focus the first empty slot or first slot */
  focus(): void {
    const firstEmptyIndex = this.values().findIndex((v) => !v);
    this.focusSlot(firstEmptyIndex >= 0 ? firstEmptyIndex : 0);
  }
}
