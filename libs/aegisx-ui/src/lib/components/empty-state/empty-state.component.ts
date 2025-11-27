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
        background-color: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
        padding: var(--ax-spacing-3xl);
        text-align: center;

        &.ax-empty-state-compact {
          padding: var(--ax-spacing-2xl);
        }
      }

      .ax-empty-state-content {
        max-width: 28rem; /* 448px - md */
        margin-left: auto;
        margin-right: auto;
      }

      .ax-empty-state-icon {
        color: var(--ax-text-disabled);
        margin-left: auto;
        margin-right: auto;
        display: block;

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
        font-size: var(--ax-text-lg);
        font-weight: var(--ax-font-medium);
        color: var(--ax-text-heading);
        margin-top: var(--ax-spacing-md);
        margin-bottom: 0;
      }

      .ax-empty-state-message {
        font-size: var(--ax-text-sm);
        color: var(--ax-text-secondary);
        margin-top: var(--ax-spacing-sm);
        margin-bottom: 0;
        line-height: var(--ax-leading-relaxed);
      }

      .ax-empty-state-body {
        margin-top: var(--ax-spacing-sm);
      }

      .ax-empty-state-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--ax-spacing-sm);
        margin-top: var(--ax-spacing-md);
      }

      .ax-empty-state-custom-actions {
        margin-top: var(--ax-spacing-md);
      }

      .ax-empty-state-action {
        display: inline-flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
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
