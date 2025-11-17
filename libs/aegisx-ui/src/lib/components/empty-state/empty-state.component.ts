import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface EmptyStateAction {
  label: string;
  icon?: string;
  primary?: boolean;
  callback: () => void;
}

@Component({
  selector: 'ax-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="ax-empty-state" [class.ax-empty-state-compact]="compact">
      <div class="ax-empty-state-content">
        <!-- Icon -->
        @if (icon) {
          <mat-icon
            class="ax-empty-state-icon"
            [class.ax-empty-state-icon-lg]="!compact"
            [class.ax-empty-state-icon-md]="compact"
          >
            {{ icon }}
          </mat-icon>
        }

        <!-- Title -->
        @if (title) {
          <h3 class="ax-empty-state-title">{{ title }}</h3>
        }

        <!-- Message -->
        @if (message) {
          <p class="ax-empty-state-message">{{ message }}</p>
        }

        <!-- Custom Content Slot -->
        <div class="ax-empty-state-body">
          <ng-content></ng-content>
        </div>

        <!-- Actions -->
        @if (actions.length > 0) {
          <div class="ax-empty-state-actions">
            @for (action of actions; track action.label) {
              <button
                mat-button
                [color]="action.primary ? 'primary' : undefined"
                [class.mat-raised-button]="action.primary"
                (click)="action.callback()"
                class="ax-empty-state-action"
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
        <div class="ax-empty-state-custom-actions">
          <ng-content select="[empty-state-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ax-empty-state {
        @apply bg-white rounded-lg border border-gray-200 p-12 text-center;

        &.ax-empty-state-compact {
          @apply p-8;
        }
      }

      .ax-empty-state-content {
        @apply max-w-md mx-auto;
      }

      .ax-empty-state-icon {
        @apply text-gray-400 mx-auto;

        &.ax-empty-state-icon-lg {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }

        &.ax-empty-state-icon-md {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
      }

      .ax-empty-state-title {
        @apply text-lg font-medium text-gray-900 mt-4;
      }

      .ax-empty-state-message {
        @apply text-sm text-gray-600 mt-2;
      }

      .ax-empty-state-body {
        @apply mt-3;
      }

      .ax-empty-state-actions {
        @apply flex items-center justify-center gap-2 mt-4;
      }

      .ax-empty-state-custom-actions {
        @apply mt-4;
      }

      .ax-empty-state-action {
        @apply inline-flex items-center gap-2;
      }
    `,
  ],
})
export class AxEmptyStateComponent {
  @Input() icon?: string;
  @Input() title?: string;
  @Input() message?: string;
  @Input() compact = false;
  @Input() actions: EmptyStateAction[] = [];
}
