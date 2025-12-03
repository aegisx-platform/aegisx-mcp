import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface ErrorStateAction {
  label: string;
  icon?: string;
  primary?: boolean;
  callback: () => void;
}

@Component({
  selector: 'ax-error-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div
      class="ax-error-state"
      [class.ax-error-state-compact]="compact"
      [class.ax-error-state-warning]="type === 'warning'"
      [class.ax-error-state-info]="type === 'info'"
    >
      <div class="ax-error-state-content">
        <!-- Icon -->
        @if (icon || defaultIcon) {
          <mat-icon
            class="ax-error-state-icon"
            [class.ax-error-state-icon-lg]="!compact"
            [class.ax-error-state-icon-md]="compact"
          >
            {{ icon || defaultIcon }}
          </mat-icon>
        }

        <!-- Title -->
        @if (displayTitle) {
          <h3 class="ax-error-state-title">{{ displayTitle }}</h3>
        }

        <!-- Message -->
        @if (message) {
          <p class="ax-error-state-message">{{ message }}</p>
        }

        <!-- Error Details (collapsible) -->
        @if (errorDetails && showDetails) {
          <details class="ax-error-state-details">
            <summary class="ax-error-state-details-toggle">
              Show technical details
            </summary>
            <pre class="ax-error-state-details-content">{{ errorDetails }}</pre>
          </details>
        }

        <!-- Custom Content Slot -->
        <div class="ax-error-state-body">
          <ng-content></ng-content>
        </div>

        <!-- Actions -->
        @if (actions.length > 0) {
          <div class="ax-error-state-actions">
            @for (action of actions; track action.label) {
              <button
                mat-button
                [color]="action.primary ? 'primary' : undefined"
                [class.mat-raised-button]="action.primary"
                (click)="action.callback()"
                class="ax-error-state-action"
              >
                @if (action.icon) {
                  <mat-icon>{{ action.icon }}</mat-icon>
                }
                {{ action.label }}
              </button>
            }
          </div>
        }

        <!-- Action Slot (for custom buttons) -->
        <div class="ax-error-state-custom-actions">
          <ng-content select="[error-state-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ax-error-state {
        background-color: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
        padding: var(--ax-spacing-3xl);
        text-align: center;

        &.ax-error-state-compact {
          padding: var(--ax-spacing-2xl);
        }

        /* Warning variant */
        &.ax-error-state-warning {
          background-color: var(--ax-warning-faint);
          border-color: var(--ax-warning-muted);

          .ax-error-state-icon {
            color: var(--ax-warning-emphasis);
          }

          .ax-error-state-title {
            color: var(--ax-warning-emphasis);
          }

          .ax-error-state-message {
            color: var(--ax-warning-default);
          }
        }

        /* Info variant */
        &.ax-error-state-info {
          background-color: var(--ax-info-faint);
          border-color: var(--ax-info-muted);

          .ax-error-state-icon {
            color: var(--ax-info-emphasis);
          }

          .ax-error-state-title {
            color: var(--ax-info-emphasis);
          }

          .ax-error-state-message {
            color: var(--ax-info-default);
          }
        }
      }

      .ax-error-state-content {
        max-width: 28rem;
        margin-left: auto;
        margin-right: auto;
      }

      .ax-error-state-icon {
        color: var(--ax-error-default);
        margin-left: auto;
        margin-right: auto;
        display: block;

        &.ax-error-state-icon-lg {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }

        &.ax-error-state-icon-md {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
      }

      .ax-error-state-title {
        font-size: var(--ax-text-lg);
        font-weight: var(--ax-font-medium);
        color: var(--ax-text-heading);
        margin-top: var(--ax-spacing-md);
        margin-bottom: 0;
      }

      .ax-error-state-message {
        font-size: var(--ax-text-sm);
        color: var(--ax-text-secondary);
        margin-top: var(--ax-spacing-sm);
        margin-bottom: 0;
        line-height: var(--ax-leading-relaxed);
      }

      .ax-error-state-details {
        margin-top: var(--ax-spacing-md);
        text-align: left;
      }

      .ax-error-state-details-toggle {
        font-size: var(--ax-text-xs);
        color: var(--ax-text-subtle);
        cursor: pointer;
        transition: color var(--ax-transition-fast);
      }

      .ax-error-state-details-toggle:hover {
        color: var(--ax-text-primary);
      }

      .ax-error-state-details-content {
        margin-top: var(--ax-spacing-sm);
        padding: var(--ax-spacing-sm);
        background-color: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md);
        font-size: var(--ax-text-xs);
        color: var(--ax-text-primary);
        overflow-x: auto;
        font-family: var(--ax-font-mono);
      }

      .ax-error-state-body {
        margin-top: var(--ax-spacing-sm);
      }

      .ax-error-state-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--ax-spacing-sm);
        margin-top: var(--ax-spacing-md);
      }

      .ax-error-state-custom-actions {
        margin-top: var(--ax-spacing-md);
      }

      .ax-error-state-action {
        display: inline-flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
      }
    `,
  ],
})
export class AxErrorStateComponent {
  @Input() icon?: string;
  @Input() title?: string;
  @Input() message?: string;
  @Input() errorDetails?: string;
  @Input() compact = false;
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() showDetails = false;
  @Input() actions: ErrorStateAction[] = [];
  @Input() statusCode?: number | null; // HTTP status code for automatic title generation

  get defaultIcon(): string {
    const iconMap = {
      error: 'error_outline',
      warning: 'warning',
      info: 'info',
    };
    return iconMap[this.type];
  }

  get displayTitle(): string {
    // If title is provided, use it directly
    if (this.title) {
      return this.title;
    }

    // If statusCode is provided, generate title with status code
    if (this.statusCode) {
      return this.getErrorTitleFromStatusCode(this.statusCode);
    }

    // Default fallback titles
    const defaultTitles = {
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    };
    return defaultTitles[this.type];
  }

  private getErrorTitleFromStatusCode(status: number): string {
    // Map common HTTP status codes to user-friendly titles
    const statusTitles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Access Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    const statusText = statusTitles[status] || 'Error';
    return `Error ${status}: ${statusText}`;
  }
}
