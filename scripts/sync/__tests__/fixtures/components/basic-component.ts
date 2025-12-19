/**
 * Basic component fixture for testing component extraction
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * A simple badge component for displaying labels
 *
 * @example
 * ```typescript
 * <ax-badge type="primary" label="Active"></ax-badge>
 * ```
 *
 * @bestPractice Use for short text labels only
 * @note Component is standalone and can be imported directly
 */
@Component({
  selector: 'ax-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="'badge-' + type">{{ label }}</span>
  `,
  styles: [
    `
      .badge {
        padding: 4px 8px;
        border-radius: 4px;
      }
    `,
  ],
})
export class BadgeComponent {
  /**
   * Badge type (color variant)
   */
  @Input() type: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  /**
   * Text to display in badge
   */
  @Input({ required: true }) label!: string;

  /**
   * Emitted when badge is clicked
   */
  @Output() clicked = new EventEmitter<void>();
}
