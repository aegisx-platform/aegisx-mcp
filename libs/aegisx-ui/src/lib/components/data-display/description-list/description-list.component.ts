import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DescriptionListLayout = 'horizontal' | 'vertical' | 'grid';
export type DescriptionListColumns = 1 | 2 | 3;
export type DescriptionListSize = 'sm' | 'md' | 'lg';

/**
 * Description List Component
 *
 * Container for organizing multiple field-display components in structured layouts.
 * Supports grid, horizontal, and vertical layouts with customizable styling.
 *
 * @example
 * ```html
 * <!-- Basic horizontal layout -->
 * <ax-description-list>
 *   <ax-field-display label="Name" [value]="user.name"></ax-field-display>
 *   <ax-field-display label="Email" [value]="user.email"></ax-field-display>
 * </ax-description-list>
 *
 * <!-- Grid layout with 2 columns -->
 * <ax-description-list layout="grid" [columns]="2">
 *   <ax-field-display label="First Name" [value]="user.firstName"></ax-field-display>
 *   <ax-field-display label="Last Name" [value]="user.lastName"></ax-field-display>
 *   <ax-field-display label="Email" [value]="user.email"></ax-field-display>
 *   <ax-field-display label="Phone" [value]="user.phone"></ax-field-display>
 * </ax-description-list>
 *
 * <!-- With dividers -->
 * <ax-description-list [divider]="true">
 *   <ax-field-display label="Order ID" [value]="order.id"></ax-field-display>
 *   <ax-field-display label="Status" [value]="order.status"></ax-field-display>
 * </ax-description-list>
 * ```
 */
@Component({
  selector: 'ax-description-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './description-list.component.html',
  styleUrls: ['./description-list.component.scss'],
})
export class AxDescriptionListComponent {
  /** Layout mode for the description list */
  @Input() layout: DescriptionListLayout = 'horizontal';

  /** Number of columns for grid layout */
  @Input() columns: DescriptionListColumns = 2;

  /** Size variant (cascades to child field-display components via CSS) */
  @Input() size: DescriptionListSize = 'md';

  /** Whether to show dividers between fields */
  @Input() divider = false;

  /** Gap between items (CSS value) */
  @Input() gap?: string;

  /** Optional CSS class for the container */
  @Input() class = '';

  /**
   * Get container CSS classes
   */
  get containerClasses(): string {
    const classes = ['ax-description-list'];

    // Layout class
    classes.push(`ax-description-list-${this.layout}`);

    // Size class
    classes.push(`ax-description-list-${this.size}`);

    // Divider class
    if (this.divider) {
      classes.push('ax-description-list-divider');
    }

    // Grid columns class
    if (this.layout === 'grid') {
      classes.push(`ax-description-list-cols-${this.columns}`);
    }

    // Custom class
    if (this.class) {
      classes.push(this.class);
    }

    return classes.join(' ');
  }

  /**
   * Get container inline styles
   */
  get containerStyles(): Record<string, string> | null {
    const styles: Record<string, string> = {};

    // Custom gap
    if (this.gap) {
      styles['gap'] = this.gap;
    }

    // Grid columns for grid layout
    if (this.layout === 'grid') {
      styles['--columns'] = String(this.columns);
    }

    return Object.keys(styles).length > 0 ? styles : null;
  }
}
