import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { AegisxCardComponent } from '@aegisx/ui';

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
  disabled?: boolean;
  badge?: string | number;
}

@Component({
  selector: 'ax-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatRippleModule,
    AegisxCardComponent,
  ],
  template: `
    <ax-card
      [title]="title"
      [subtitle]="subtitle"
      [icon]="'flash_on'"
      [appearance]="'elevated'"
      class="h-full"
    >
      <div
        class="grid gap-3"
        [ngClass]="{
          'grid-cols-2': columns === 2,
          'grid-cols-3': columns === 3,
          'grid-cols-4': columns === 4,
        }"
      >
        @for (action of actions; track action.id) {
          <button
            class="quick-action-button"
            [disabled]="action.disabled"
            [matTooltip]="action.tooltip || action.title"
            matTooltipPosition="above"
            matRipple
            (click)="onActionClick(action)"
          >
            <div
              class="flex flex-col items-center justify-center p-4 space-y-2 h-full"
            >
              <div class="relative">
                <mat-icon
                  class="text-3xl"
                  [color]="action.color || 'primary'"
                  >{{ action.icon }}</mat-icon
                >
                @if (action.badge) {
                  <span
                    class="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full"
                  >
                    {{ action.badge }}
                  </span>
                }
              </div>
              <span
                class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center"
              >
                {{ action.title }}
              </span>
            </div>
          </button>
        }
      </div>

      @if (showAllButton && moreActionsAvailable) {
        <div class="mt-4">
          <button
            mat-button
            color="primary"
            class="w-full"
            (click)="onShowAll()"
          >
            View All Actions
            <mat-icon class="ml-1">arrow_forward</mat-icon>
          </button>
        </div>
      }
    </ax-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .quick-action-button {
        @apply bg-white dark:bg-gray-800;
        @apply border border-gray-200 dark:border-gray-700;
        @apply rounded-lg;
        @apply transition-all duration-200;
        @apply cursor-pointer;
        @apply hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700;
        @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
        @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none;
        min-height: 100px;
      }

      .quick-action-button:hover:not(:disabled) {
        @apply transform -translate-y-0.5;
      }

      .quick-action-button:active:not(:disabled) {
        @apply transform translate-y-0;
      }
    `,
  ],
})
export class QuickActionsComponent {
  @Input() title = 'Quick Actions';
  @Input() subtitle = 'Common tasks';
  @Input() actions: QuickAction[] = [];
  @Input() columns: 2 | 3 | 4 = 2;
  @Input() showAllButton = false;
  @Input() moreActionsAvailable = false;

  @Output() actionClick = new EventEmitter<QuickAction>();
  @Output() showAllClick = new EventEmitter<void>();

  onActionClick(action: QuickAction): void {
    if (!action.disabled) {
      this.actionClick.emit(action);
    }
  }

  onShowAll(): void {
    this.showAllClick.emit();
  }
}
