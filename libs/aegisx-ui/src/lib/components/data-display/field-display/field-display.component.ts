import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxFieldFormatPipe } from './field-format.pipe';
import {
  FieldType,
  FieldDisplaySize,
  FieldDisplayOrientation,
  EmptyStateDisplay,
  FieldFormatOptions,
} from './field-display.types';

/**
 * Field Display Component
 *
 * Displays a single field in read-only format with label and value.
 * Supports automatic type-based formatting and customizable empty states.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ax-field-display label="Name" [value]="user.name"></ax-field-display>
 *
 * <!-- With type formatting -->
 * <ax-field-display
 *   label="Birth Date"
 *   [value]="user.birthDate"
 *   type="date">
 * </ax-field-display>
 *
 * <!-- With format options -->
 * <ax-field-display
 *   label="Salary"
 *   [value]="employee.salary"
 *   type="currency"
 *   [formatOptions]="{ currency: 'THB', decimals: 2 }">
 * </ax-field-display>
 *
 * <!-- Vertical orientation -->
 * <ax-field-display
 *   label="Description"
 *   [value]="product.description"
 *   orientation="vertical">
 * </ax-field-display>
 * ```
 */
@Component({
  selector: 'ax-field-display',
  standalone: true,
  imports: [CommonModule, AxFieldFormatPipe],
  templateUrl: './field-display.component.html',
  styleUrls: ['./field-display.component.scss'],
})
export class AxFieldDisplayComponent {
  /** Label text for the field */
  @Input() label = '';

  /** Value to display */
  @Input() value: unknown = null;

  /** Field type for automatic formatting */
  @Input() type: FieldType = 'text';

  /** Display size variant */
  @Input() size: FieldDisplaySize = 'md';

  /** Layout orientation */
  @Input() orientation: FieldDisplayOrientation = 'horizontal';

  /** Label width for horizontal layout (CSS value) */
  @Input() labelWidth?: string;

  /** Text to show when value is empty/null/undefined */
  @Input() emptyText = '—'; // Em dash

  /** How to display empty values */
  @Input() emptyDisplay: EmptyStateDisplay = 'dash';

  /** CSS class for empty state */
  @Input() emptyClass = 'ax-field-empty';

  /** Format options for the formatter pipe */
  @Input() formatOptions?: FieldFormatOptions;

  /** Whether to make email/phone/url clickable */
  @Input() clickable = true;

  /** Optional CSS class for the container */
  @Input() class = '';

  /** Optional CSS class for the label */
  @Input() labelClass = '';

  /** Optional CSS class for the value */
  @Input() valueClass = '';

  /**
   * Get container CSS classes
   */
  get containerClasses(): string {
    const classes = ['ax-field-display'];
    classes.push(`ax-field-display-${this.orientation}`);
    classes.push(`ax-field-display-${this.size}`);

    if (this.class) {
      classes.push(this.class);
    }

    return classes.join(' ');
  }

  /**
   * Get label CSS classes
   */
  get labelClasses(): string {
    const classes = ['ax-field-display-label'];

    if (this.labelClass) {
      classes.push(this.labelClass);
    }

    return classes.join(' ');
  }

  /**
   * Get value CSS classes
   */
  get valueClasses(): string {
    const classes = ['ax-field-display-value'];

    if (this.isEmpty) {
      classes.push(this.emptyClass);
    }

    if (this.valueClass) {
      classes.push(this.valueClass);
    }

    return classes.join(' ');
  }

  /**
   * Get label width style for horizontal layout
   */
  get labelStyle(): Record<string, string> | null {
    if (this.orientation === 'horizontal' && this.labelWidth) {
      return {
        'min-width': this.labelWidth,
        'max-width': this.labelWidth,
      };
    }
    return null;
  }

  /**
   * Check if value is empty
   */
  get isEmpty(): boolean {
    return (
      this.value === null ||
      this.value === undefined ||
      this.value === '' ||
      (typeof this.value === 'string' && this.value.trim() === '')
    );
  }

  /**
   * Get display text for empty values
   */
  get emptyDisplayText(): string {
    switch (this.emptyDisplay) {
      case 'dash':
        return this.emptyText;
      case 'text':
        return this.emptyText;
      case 'placeholder':
        return this.label ? `No ${this.label.toLowerCase()}` : 'Not specified';
      default:
        return this.emptyText;
    }
  }

  /**
   * Check if the field type is a clickable link type
   */
  get isLinkType(): boolean {
    return (
      this.clickable &&
      !this.isEmpty &&
      (this.type === 'email' || this.type === 'phone' || this.type === 'url')
    );
  }

  /**
   * Get href for link types
   */
  get linkHref(): string | null {
    if (!this.isLinkType || this.isEmpty) return null;

    const stringValue = String(this.value);

    switch (this.type) {
      case 'email':
        return `mailto:${stringValue}`;
      case 'phone': {
        // Remove all non-digit characters for tel link
        const phoneNumber = stringValue.replace(/\D/g, '');
        return `tel:${phoneNumber}`;
      }
      case 'url':
        // Add https:// if no protocol specified
        return stringValue.startsWith('http')
          ? stringValue
          : `https://${stringValue}`;
      default:
        return null;
    }
  }

  /**
   * Apply CSS custom properties to host element
   */
  @HostBinding('style.--label-width')
  get cssLabelWidth(): string | null {
    return this.labelWidth || null;
  }
}
