import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant = 'raised' | 'stroked' | 'flat' | 'basic';
export type ButtonColor = 'primary' | 'accent' | 'warn' | '';

/**
 * AegisX Loading Button Component
 *
 * A modern loading button with gradient background, shimmer effect,
 * pulse animation, and CSS-only spinner.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ax-loading-button
 *   [loading]="isLoading"
 *   loadingText="Signing in..."
 *   (buttonClick)="onSubmit()"
 * >
 *   Sign In
 * </ax-loading-button>
 *
 * <!-- With icon -->
 * <ax-loading-button
 *   [loading]="isLoading"
 *   loadingText="Sending..."
 *   icon="send"
 *   iconPosition="end"
 * >
 *   Send Email
 * </ax-loading-button>
 *
 * <!-- Stroked variant -->
 * <ax-loading-button
 *   variant="stroked"
 *   [loading]="isLoading"
 *   loadingText="Resending..."
 * >
 *   Resend Email
 * </ax-loading-button>
 * ```
 */
@Component({
  selector: 'ax-loading-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="buttonClass"
      [class.loading]="loading"
      [class.full-width]="fullWidth"
      [disabled]="disabled || (disableWhenLoading && loading)"
      [type]="type"
      (click)="onClick($event)"
    >
      @if (loading) {
        <div class="loading-content">
          <div
            class="spinner-ring"
            [class.spinner-outlined]="
              variant === 'stroked' || variant === 'basic'
            "
          ></div>
          <span>{{ loadingText }}</span>
        </div>
      } @else {
        @if (icon && iconPosition === 'start') {
          <mat-icon class="button-icon start">{{ icon }}</mat-icon>
        }
        <span class="button-text"><ng-content></ng-content></span>
        @if (icon && iconPosition === 'end') {
          <mat-icon class="button-icon end">{{ icon }}</mat-icon>
        }
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      button {
        height: 48px;
        font-size: 1rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: var(--ax-radius-md, 8px);
        padding: 0 1.5rem;
        min-width: 120px;
      }

      .full-width {
        width: 100%;
      }

      /* Button variants */
      .ax-raised {
        background: var(--ax-brand-default, #4f46e5);
        color: white;
        border: none;
        box-shadow: var(--ax-shadow-sm);

        &:hover:not(:disabled):not(.loading) {
          background: var(--ax-brand-emphasis, #6366f1);
          box-shadow: var(--ax-shadow-md);
        }
      }

      .ax-stroked {
        background: transparent;
        color: var(--ax-brand-default, #4f46e5);
        border: 1px solid var(--ax-brand-default, #4f46e5);

        &:hover:not(:disabled):not(.loading) {
          background: var(--ax-brand-subtle, rgba(79, 70, 229, 0.1));
        }
      }

      .ax-flat {
        background: var(--ax-brand-subtle, rgba(79, 70, 229, 0.1));
        color: var(--ax-brand-default, #4f46e5);
        border: none;

        &:hover:not(:disabled):not(.loading) {
          background: var(--ax-brand-muted, rgba(79, 70, 229, 0.2));
        }
      }

      .ax-basic {
        background: transparent;
        color: var(--ax-brand-default, #4f46e5);
        border: none;

        &:hover:not(:disabled):not(.loading) {
          background: var(--ax-background-muted, rgba(0, 0, 0, 0.04));
        }
      }

      /* Icon styles */
      .button-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        transition: transform 0.2s ease;

        &.start {
          margin-right: 0.25rem;
        }

        &.end {
          margin-left: 0.25rem;
        }
      }

      button:hover:not(:disabled):not(.loading) .button-icon.end {
        transform: translateX(4px);
      }

      /* Loading state for raised/primary buttons */
      .ax-raised.loading {
        background: linear-gradient(
          135deg,
          var(--ax-brand-default, #4f46e5) 0%,
          var(--ax-brand-emphasis, #6366f1) 100%
        ) !important;
        color: white !important;
        pointer-events: none;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .ax-raised.loading::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 100%
        );
        animation: shimmer 1.5s infinite;
      }

      /* Loading state for outlined/stroked buttons */
      .ax-stroked.loading,
      .ax-flat.loading,
      .ax-basic.loading {
        pointer-events: none;
        opacity: 0.8;
      }

      /* Disabled state */
      button:disabled:not(.loading) {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.85;
        }
      }

      @keyframes shimmer {
        0% {
          left: -100%;
        }
        100% {
          left: 100%;
        }
      }

      .loading-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      /* CSS-only spinner ring */
      .spinner-ring {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      /* Spinner for outlined/stroked buttons */
      .spinner-outlined {
        border: 2px solid rgba(79, 70, 229, 0.3);
        border-top-color: var(--ax-brand-default, #4f46e5);
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class AxLoadingButtonComponent {
  /** Button variant style */
  @Input() variant: ButtonVariant = 'raised';

  /** Button color (for Material buttons) */
  @Input() color: ButtonColor = 'primary';

  /** Loading state */
  @Input() loading = false;

  /** Text to show during loading */
  @Input() loadingText = 'Loading...';

  /** Disabled state */
  @Input() disabled = false;

  /** Whether to disable button when loading */
  @Input() disableWhenLoading = true;

  /** Button type attribute */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Icon name (Material icon) */
  @Input() icon = '';

  /** Icon position */
  @Input() iconPosition: 'start' | 'end' = 'end';

  /** Full width button */
  @Input() fullWidth = false;

  /** Click event (only fires when not loading) */
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  get buttonClass(): string {
    const variantClass = `ax-${this.variant}`;
    return `ax-loading-button ${variantClass}`;
  }

  onClick(event: MouseEvent): void {
    if (!this.loading && !this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}
