import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerLoadingSize, InnerLoadingColor } from './inner-loading.types';

/**
 * Inner Loading Component
 *
 * Displays a loading overlay within a container element.
 * Parent element must have `position: relative` for proper positioning.
 *
 * @example
 * // Basic usage
 * <div class="relative">
 *   <ax-inner-loading [showing]="isLoading"></ax-inner-loading>
 *   <p>Content here</p>
 * </div>
 *
 * @example
 * // With custom label
 * <ax-card class="relative">
 *   <ax-inner-loading [showing]="loading" label="Loading data..."></ax-inner-loading>
 *   <p>Card content</p>
 * </ax-card>
 *
 * @example
 * // Different sizes
 * <ax-inner-loading [showing]="true" size="lg"></ax-inner-loading>
 */
@Component({
  selector: 'ax-inner-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showing) {
      <div
        class="ax-inner-loading"
        [class.ax-inner-loading--dark]="dark"
        [style.background-color]="backgroundColor"
      >
        <div class="ax-inner-loading__content">
          <!-- Spinner -->
          <div
            class="ax-inner-loading__spinner"
            [class]="'ax-inner-loading__spinner--' + size"
            [class.ax-inner-loading__spinner--primary]="color === 'primary'"
            [class.ax-inner-loading__spinner--accent]="color === 'accent'"
            [class.ax-inner-loading__spinner--warn]="color === 'warn'"
            [class.ax-inner-loading__spinner--light]="color === 'light'"
          >
            <svg viewBox="0 0 50 50">
              <circle
                class="ax-inner-loading__circle"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke-width="4"
              />
            </svg>
          </div>

          <!-- Label -->
          @if (label) {
            <div
              class="ax-inner-loading__label"
              [class.ax-inner-loading__label--dark]="dark"
            >
              {{ label }}
            </div>
          }

          <!-- Custom content slot -->
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
  styleUrls: ['./inner-loading.component.scss'],
})
export class AxInnerLoadingComponent {
  /** Show/hide the loading overlay */
  @Input() showing: boolean = false;

  /** Loading spinner size */
  @Input() size: InnerLoadingSize = 'md';

  /** Spinner color */
  @Input() color: InnerLoadingColor = 'primary';

  /** Optional label text */
  @Input() label: string = '';

  /** Use dark overlay (for light content) */
  @Input() dark: boolean = false;

  /** Custom background color (with opacity) */
  @Input() backgroundColor: string = '';
}
