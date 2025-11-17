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
        @apply bg-white rounded-lg border border-gray-200 p-12 text-center;

        &.ax-error-state-compact {
          @apply p-8;
        }

        &.ax-error-state-warning {
          @apply bg-yellow-50 border-yellow-200;

          .ax-error-state-icon {
            @apply text-yellow-600;
          }

          .ax-error-state-title {
            @apply text-yellow-900;
          }

          .ax-error-state-message {
            @apply text-yellow-700;
          }
        }

        &.ax-error-state-info {
          @apply bg-blue-50 border-blue-200;

          .ax-error-state-icon {
            @apply text-blue-600;
          }

          .ax-error-state-title {
            @apply text-blue-900;
          }

          .ax-error-state-message {
            @apply text-blue-700;
          }
        }
      }

      .ax-error-state-content {
        @apply max-w-md mx-auto;
      }

      .ax-error-state-icon {
        @apply text-red-600 mx-auto;

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
        @apply text-lg font-medium text-gray-900 mt-4;
      }

      .ax-error-state-message {
        @apply text-sm text-gray-600 mt-2;
      }

      .ax-error-state-details {
        @apply mt-4 text-left;
      }

      .ax-error-state-details-toggle {
        @apply text-xs text-gray-500 cursor-pointer hover:text-gray-700;
      }

      .ax-error-state-details-content {
        @apply mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-x-auto;
      }

      .ax-error-state-body {
        @apply mt-3;
      }

      .ax-error-state-actions {
        @apply flex items-center justify-center gap-2 mt-4;
      }

      .ax-error-state-custom-actions {
        @apply mt-4;
      }

      .ax-error-state-action {
        @apply inline-flex items-center gap-2;
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
