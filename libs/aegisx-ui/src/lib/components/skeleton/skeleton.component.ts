import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton shape variants
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

/**
 * Skeleton animation type
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

/**
 * AegisX Skeleton Loader Component
 *
 * A placeholder component that shows a loading animation while content is being fetched.
 * Supports multiple variants for different content types.
 *
 * @example
 * ```html
 * <!-- Text skeleton -->
 * <ax-skeleton variant="text" width="200px"></ax-skeleton>
 *
 * <!-- Avatar skeleton -->
 * <ax-skeleton variant="circular" width="48px" height="48px"></ax-skeleton>
 *
 * <!-- Card skeleton -->
 * <ax-skeleton variant="rounded" width="100%" height="200px"></ax-skeleton>
 *
 * <!-- Multiple lines -->
 * <ax-skeleton variant="text" [lines]="3"></ax-skeleton>
 * ```
 */
@Component({
  selector: 'ax-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lines > 1) {
      <div class="ax-skeleton-lines">
        @for (line of linesArray; track $index; let last = $last) {
          <div
            class="ax-skeleton"
            [class.ax-skeleton-text]="variant === 'text'"
            [class.ax-skeleton-circular]="variant === 'circular'"
            [class.ax-skeleton-rectangular]="variant === 'rectangular'"
            [class.ax-skeleton-rounded]="variant === 'rounded'"
            [class.ax-skeleton-pulse]="animation === 'pulse'"
            [class.ax-skeleton-wave]="animation === 'wave'"
            [style.width]="last ? lastLineWidth : width"
            [style.height]="height"
          ></div>
        }
      </div>
    } @else {
      <div
        class="ax-skeleton"
        [class.ax-skeleton-text]="variant === 'text'"
        [class.ax-skeleton-circular]="variant === 'circular'"
        [class.ax-skeleton-rectangular]="variant === 'rectangular'"
        [class.ax-skeleton-rounded]="variant === 'rounded'"
        [class.ax-skeleton-pulse]="animation === 'pulse'"
        [class.ax-skeleton-wave]="animation === 'wave'"
        [style.width]="width"
        [style.height]="height"
      ></div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ax-skeleton-lines {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .ax-skeleton {
        background-color: var(--ax-background-subtle, #f4f4f5);
        position: relative;
        overflow: hidden;
      }

      // Variants
      .ax-skeleton-text {
        height: 1em;
        border-radius: var(--ax-radius-sm, 0.25rem);
      }

      .ax-skeleton-circular {
        border-radius: 50%;
      }

      .ax-skeleton-rectangular {
        border-radius: 0;
      }

      .ax-skeleton-rounded {
        border-radius: var(--ax-radius-lg, 0.75rem);
      }

      // Pulse animation
      .ax-skeleton-pulse {
        animation: ax-skeleton-pulse 1.5s ease-in-out infinite;
      }

      @keyframes ax-skeleton-pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
        100% {
          opacity: 1;
        }
      }

      // Wave animation
      .ax-skeleton-wave::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.5),
          transparent
        );
        animation: ax-skeleton-wave 1.5s infinite;
      }

      @keyframes ax-skeleton-wave {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      // Dark mode
      :host-context(.dark),
      :host-context([data-theme='dark']) {
        .ax-skeleton {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .ax-skeleton-wave::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
        }
      }
    `,
  ],
})
export class AxSkeletonComponent {
  /**
   * Shape variant of the skeleton
   * @default 'text'
   */
  @Input() variant: SkeletonVariant = 'text';

  /**
   * Animation type
   * @default 'pulse'
   */
  @Input() animation: SkeletonAnimation = 'pulse';

  /**
   * Width of the skeleton (CSS value)
   * @default '100%'
   */
  @Input() width = '100%';

  /**
   * Height of the skeleton (CSS value)
   * @default undefined (uses variant default)
   */
  @Input() height?: string;

  /**
   * Number of lines (for text variant)
   * @default 1
   */
  @Input() lines = 1;

  /**
   * Width of the last line (when lines > 1)
   * @default '60%'
   */
  @Input() lastLineWidth = '60%';

  /**
   * Generate array for ngFor iteration
   */
  get linesArray(): number[] {
    return Array(this.lines).fill(0);
  }
}
