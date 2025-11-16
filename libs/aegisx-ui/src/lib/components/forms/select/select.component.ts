/**
 * AegisX UI - Select Component
 *
 * A flexible dropdown select component with single/multi-select support,
 * search functionality, and validation states.
 *
 * @example
 * ```html
 * <ax-select
 *   [options]="countries"
 *   placeholder="Select country"
 *   [(ngModel)]="selectedCountry">
 * </ax-select>
 * ```
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import type {
  SelectSize,
  SelectState,
  SelectOption,
  SelectOptionGroup,
} from './select.types';

@Component({
  selector: 'ax-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxSelectComponent),
      multi: true,
    },
  ],
})
export class AxSelectComponent<T = any> implements ControlValueAccessor {
  /**
   * Select size
   * @default 'md'
   */
  @Input() size: SelectSize = 'md';

  /**
   * Validation state
   * @default 'default'
   */
  @Input() state: SelectState = 'default';

  /**
   * Placeholder text
   */
  @Input() placeholder = 'Select option';

  /**
   * Label text (optional)
   */
  @Input() label = '';

  /**
   * Helper text (shown below select)
   */
  @Input() helperText = '';

  /**
   * Error message (shown when state is 'error')
   */
  @Input() errorMessage = '';

  /**
   * Disabled state
   * @default false
   */
  @Input() disabled = false;

  /**
   * Readonly state
   * @default false
   */
  @Input() readonly = false;

  /**
   * Required field
   * @default false
   */
  @Input() required = false;

  /**
   * Full width select
   * @default false
   */
  @Input() fullWidth = false;

  /**
   * Multiple selection mode
   * @default false
   */
  @Input() multiple = false;

  /**
   * Searchable dropdown
   * @default false
   */
  @Input() searchable = false;

  /**
   * Show clear button when value selected
   * @default false
   */
  @Input() clearable = false;

  /**
   * Maximum number of tags to show in multiple mode
   * @default 3
   */
  @Input() maxTagCount = 3;

  /**
   * Select options (flat list)
   */
  @Input() options: SelectOption<T>[] = [];

  /**
   * Select option groups
   */
  @Input() optionGroups: SelectOptionGroup<T>[] = [];

  /**
   * Custom compare function
   */
  @Input() compareWith: (o1: T, o2: T) => boolean = (o1, o2) => o1 === o2;

  /**
   * Value change event
   */
  @Output() valueChange = new EventEmitter<T | T[]>();

  /**
   * Focus event
   */
  @Output() axFocus = new EventEmitter<FocusEvent>();

  /**
   * Blur event
   */
  @Output() axBlur = new EventEmitter<FocusEvent>();

  /**
   * Clear button clicked event
   */
  @Output() axClear = new EventEmitter<void>();

  /**
   * Search input element
   */
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  /**
   * Internal value
   */
  private _value: T | T[] | null = null;

  /**
   * Search query
   */
  searchQuery = '';

  /**
   * Dropdown open state
   */
  isOpen = false;

  /**
   * Focus state
   */
  isFocused = false;

  /**
   * ControlValueAccessor callbacks
   */
  private onChange = (_value: unknown) => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private onTouched = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

  /**
   * Host binding for full width
   */
  @HostBinding('class.ax-select-full-width')
  get isFullWidth(): boolean {
    return this.fullWidth;
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  constructor(private elementRef: ElementRef) {}

  /**
   * Get current value
   */
  get value(): T | T[] | null {
    return this._value;
  }

  /**
   * Set value
   */
  set value(val: T | T[] | null) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
      this.valueChange.emit(val as T | T[]);
    }
  }

  /**
   * Get wrapper CSS classes
   */
  get wrapperClasses(): string {
    const classes = [
      'ax-select-wrapper',
      `ax-select-${this.size}`,
      `ax-select-state-${this.state}`,
    ];

    if (this.isOpen) {
      classes.push('ax-select-open');
    }

    if (this.isFocused) {
      classes.push('ax-select-focused');
    }

    if (this.disabled) {
      classes.push('ax-select-disabled');
    }

    if (this.readonly) {
      classes.push('ax-select-readonly');
    }

    return classes.join(' ');
  }

  /**
   * Get all options (flat or from groups)
   */
  get allOptions(): SelectOption<T>[] {
    if (this.optionGroups.length > 0) {
      return this.optionGroups.flatMap((group) => group.options);
    }
    return this.options;
  }

  /**
   * Get filtered options based on search query
   */
  get filteredOptions(): SelectOption<T>[] {
    if (!this.searchQuery) {
      return this.allOptions;
    }

    const query = this.searchQuery.toLowerCase();
    return this.allOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query),
    );
  }

  /**
   * Get filtered option groups
   */
  get filteredOptionGroups(): SelectOptionGroup<T>[] {
    if (!this.searchQuery) {
      return this.optionGroups;
    }

    const query = this.searchQuery.toLowerCase();
    return this.optionGroups
      .map((group) => ({
        ...group,
        options: group.options.filter(
          (option) =>
            option.label.toLowerCase().includes(query) ||
            option.description?.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }

  /**
   * Get selected option(s) label
   */
  get selectedLabel(): string {
    if (!this._value) {
      return '';
    }

    if (this.multiple && Array.isArray(this._value)) {
      const selectedOptions = this.allOptions.filter((opt) =>
        (this._value as T[]).some((v) => this.compareWith(v, opt.value)),
      );
      return selectedOptions.map((opt) => opt.label).join(', ');
    }

    const selectedOption = this.allOptions.find((opt) =>
      this.compareWith(opt.value, this._value as T),
    );
    return selectedOption?.label || '';
  }

  /**
   * Get selected options for multiple mode
   */
  get selectedOptions(): SelectOption<T>[] {
    if (!this.multiple || !Array.isArray(this._value)) {
      return [];
    }

    return this.allOptions.filter((opt) =>
      (this._value as T[]).some((v) => this.compareWith(v, opt.value)),
    );
  }

  /**
   * Get visible tags in multiple mode
   */
  get visibleTags(): SelectOption<T>[] {
    return this.selectedOptions.slice(0, this.maxTagCount);
  }

  /**
   * Get remaining tag count
   */
  get remainingTagCount(): number {
    return Math.max(0, this.selectedOptions.length - this.maxTagCount);
  }

  /**
   * Show clear button condition
   */
  get showClearButton(): boolean {
    return this.clearable && this._value !== null && !this.disabled;
  }

  /**
   * Get message to display (error or helper text)
   */
  get displayMessage(): string {
    if (this.state === 'error' && this.errorMessage) {
      return this.errorMessage;
    }
    return this.helperText;
  }

  /**
   * Check if option is selected
   */
  isOptionSelected(option: SelectOption<T>): boolean {
    if (!this._value) {
      return false;
    }

    if (this.multiple && Array.isArray(this._value)) {
      return this._value.some((v) => this.compareWith(v, option.value));
    }

    return this.compareWith(this._value as T, option.value);
  }

  /**
   * Toggle dropdown
   */
  toggleDropdown(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.isOpen = !this.isOpen;

    if (this.isOpen && this.searchable) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });
    }
  }

  /**
   * Open dropdown
   */
  openDropdown(): void {
    if (!this.disabled && !this.readonly) {
      this.isOpen = true;
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    this.isOpen = false;
    this.searchQuery = '';
  }

  /**
   * Handle option selection
   */
  selectOption(option: SelectOption<T>): void {
    if (option.disabled) {
      return;
    }

    if (this.multiple) {
      const currentValue = (this._value as T[]) || [];
      const isSelected = currentValue.some((v) =>
        this.compareWith(v, option.value),
      );

      if (isSelected) {
        this.value = currentValue.filter(
          (v) => !this.compareWith(v, option.value),
        ) as T[];
      } else {
        this.value = [...currentValue, option.value] as T[];
      }
    } else {
      this.value = option.value;
      this.closeDropdown();
    }

    this.onTouched();
  }

  /**
   * Remove tag in multiple mode
   */
  removeTag(option: SelectOption<T>, event: Event): void {
    event.stopPropagation();

    if (this.disabled || this.readonly) {
      return;
    }

    const currentValue = (this._value as T[]) || [];
    this.value = currentValue.filter(
      (v) => !this.compareWith(v, option.value),
    ) as T[];
    this.onTouched();
  }

  /**
   * Clear selection
   */
  clearValue(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.value = this.multiple ? ([] as T[]) : null;
    this.axClear.emit();
    this.onTouched();
  }

  /**
   * Handle focus
   */
  onFocus(event: FocusEvent): void {
    this.isFocused = true;
    this.axFocus.emit(event);
  }

  /**
   * Handle blur
   */
  onBlur(event: FocusEvent): void {
    this.isFocused = false;
    this.onTouched();
    this.axBlur.emit(event);
  }

  /**
   * Handle search input
   */
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
  }

  // ============================================
  // ControlValueAccessor Implementation
  // ============================================

  /**
   * Write value from form control
   */
  writeValue(value: T | T[] | null): void {
    this._value = value;
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (_value: unknown) => void): void {
    this.onChange = fn;
  }

  /**
   * Register onTouched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
