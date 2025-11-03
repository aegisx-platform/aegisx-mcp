import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AegisxCardComponent } from '@aegisx/ui';

export interface ProgressItem {
  label: string;
  value: number;
  max: number;
  color: 'primary' | 'accent' | 'warn' | 'success';
  icon?: string;
  description?: string;
}

@Component({
  selector: 'ax-progress-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
    AegisxCardComponent,
  ],
  template: `
    <ax-card
      [title]="title"
      [subtitle]="subtitle"
      [icon]="'donut_large'"
      [appearance]="'elevated'"
      class="h-full"
    >
      <div class="space-y-4">
        @for (item of items; track item.label) {
          <div class="progress-item">
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center space-x-2">
                @if (item.icon) {
                  <mat-icon
                    class="text-lg"
                    [ngClass]="getColorClass(item.color)"
                  >
                    {{ item.icon }}
                  </mat-icon>
                }
                <span
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ item.label }}
                </span>
              </div>
              <span
                class="text-sm font-semibold"
                [ngClass]="getColorClass(item.color)"
              >
                {{ formatValue(item) }}
              </span>
            </div>

            <mat-progress-bar
              [mode]="'determinate'"
              [value]="getPercentage(item)"
              [color]="item.color"
              class="h-2"
            ></mat-progress-bar>

            @if (item.description) {
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ item.description }}
              </p>
            }
          </div>
        }
      </div>

      @if (showTotal) {
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Progress
            </span>
            <span class="text-lg font-bold text-primary">
              {{ totalPercentage() }}%
            </span>
          </div>
          <mat-progress-bar
            [mode]="'determinate'"
            [value]="totalPercentage()"
            color="primary"
            class="mt-2"
          ></mat-progress-bar>
        </div>
      }

      @if (actionLabel) {
        <div class="mt-4">
          <button
            mat-button
            color="primary"
            class="w-full"
            (click)="onAction()"
          >
            {{ actionLabel }}
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

      .progress-item {
        &:not(:last-child) {
          padding-bottom: 1rem;
        }
      }

      .text-primary {
        color: #1976d2;
      }
      .text-accent {
        color: #ff4081;
      }
      .text-warn {
        color: #ff9800;
      }
      .text-success {
        color: #4caf50;
      }

      ::ng-deep .mat-mdc-progress-bar {
        height: 8px !important;
        border-radius: 4px;
        overflow: hidden;
      }

      ::ng-deep .mat-mdc-progress-bar .mdc-linear-progress__bar-inner {
        border-radius: 4px;
      }
    `,
  ],
})
export class ProgressWidgetComponent {
  @Input() title = 'Progress Overview';
  @Input() subtitle = 'Current status';
  @Input() items: ProgressItem[] = [];
  @Input() showTotal = true;
  @Input() showPercentage = true;
  @Input() actionLabel?: string;

  totalPercentage = computed(() => {
    if (this.items.length === 0) return 0;

    const totalValue = this.items.reduce((sum, item) => sum + item.value, 0);
    const totalMax = this.items.reduce((sum, item) => sum + item.max, 0);

    return totalMax > 0 ? Math.round((totalValue / totalMax) * 100) : 0;
  });

  getPercentage(item: ProgressItem): number {
    return item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
  }

  formatValue(item: ProgressItem): string {
    const percentage = this.getPercentage(item);
    if (this.showPercentage) {
      return `${percentage}%`;
    }
    return `${item.value} / ${item.max}`;
  }

  getColorClass(color: string): string {
    return `text-${color}`;
  }

  onAction(): void {
    console.log('Progress widget action clicked');
  }
}
