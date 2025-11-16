import { Component, input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Property definition for API documentation
 */
export interface PropDefinition {
  /** Property name */
  name: string;

  /** Property type (e.g., "string", "number", "boolean", "string[]") */
  type: string;

  /** Default value (optional) */
  default?: string;

  /** Property description */
  description: string;

  /** Whether property is required */
  required?: boolean;

  /** Possible values (for enums or union types) */
  values?: string[];
}

/**
 * PropsTableComponent - Displays component/API properties in a table format
 *
 * @example
 * <ax-props-table
 *   [properties]="buttonProps"
 *   title="Button Properties"
 * />
 */
@Component({
  selector: 'ax-props-table',
  imports: [CommonModule],
  templateUrl: './props-table.component.html',
  styleUrl: './props-table.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PropsTableComponent {
  /** Array of property definitions to display */
  properties = input.required<PropDefinition[]>();

  /** Table title (optional) */
  title = input<string | undefined>();

  /** Show default values column */
  showDefaults = input<boolean>(true);

  /** Show required badge */
  showRequired = input<boolean>(true);

  /**
   * Get type badge class based on type
   */
  protected getTypeBadgeClass(type: string): string {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('string')) return 'type-string';
    if (lowerType.includes('number')) return 'type-number';
    if (lowerType.includes('boolean')) return 'type-boolean';
    if (lowerType.includes('array') || lowerType.includes('[]'))
      return 'type-array';
    if (lowerType.includes('object')) return 'type-object';
    if (lowerType.includes('function')) return 'type-function';

    return 'type-default';
  }

  /**
   * Format type for display (handle long union types)
   */
  protected formatType(type: string): string {
    // If type is too long, truncate and add tooltip
    if (type.length > 30) {
      return type.substring(0, 27) + '...';
    }
    return type;
  }

  /**
   * Get full type for tooltip
   */
  protected getFullType(type: string): string {
    return type;
  }
}
