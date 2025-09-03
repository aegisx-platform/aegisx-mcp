import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AegisxCardComponent } from '@aegisx/ui';

export interface StatsCardData {
  title: string;
  value: string | number;
  icon: string;
  change?: number;
  changeLabel?: string;
  color: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  trend?: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'ax-stats-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AegisxCardComponent,
  ],
  template: `
    <ax-card [appearance]="'elevated'" class="relative overflow-hidden h-full">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ data.title }}
          </p>
          <p class="text-2xl font-bold mt-2" [ngClass]="valueColorClass()">
            {{ formattedValue() }}
          </p>
          @if (data.change !== undefined) {
            <div
              class="flex items-center mt-2 text-sm"
              [ngClass]="changeColorClass()"
            >
              <mat-icon class="text-lg mr-1">{{ trendIcon() }}</mat-icon>
              <span class="font-medium">{{ Math.abs(data.change) }}%</span>
              @if (data.changeLabel) {
                <span class="ml-1 text-gray-600 dark:text-gray-400">{{
                  data.changeLabel
                }}</span>
              }
            </div>
          }
        </div>
        <div class="flex items-center justify-center w-16 h-16">
          <div
            class="absolute -right-2 -top-2 w-24 h-24 rounded-full opacity-10"
            [ngClass]="backgroundColorClass()"
          ></div>
          <mat-icon
            class="text-4xl relative z-10"
            [ngClass]="iconColorClass()"
            >{{ data.icon }}</mat-icon
          >
        </div>
      </div>

      @if (showSparkline && sparklineData()) {
        <div class="mt-4 h-16 flex items-end space-x-1">
          @for (point of sparklineData(); track $index) {
            <div
              class="flex-1 rounded-t transition-all duration-300 hover:opacity-80"
              [style.height.%]="point"
              [ngClass]="backgroundColorClass()"
            ></div>
          }
        </div>
      }

      @if (actionLabel) {
        <button
          mat-button
          color="primary"
          class="mt-3 -ml-2"
          (click)="onAction()"
        >
          {{ actionLabel }}
          <mat-icon class="ml-1 text-lg">arrow_forward</mat-icon>
        </button>
      }
    </ax-card>
  `,
  styles: [
    `
      :host {
        display: block;
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
      .text-info {
        color: #2196f3;
      }

      .bg-primary {
        background-color: #1976d2;
      }
      .bg-accent {
        background-color: #ff4081;
      }
      .bg-warn {
        background-color: #ff9800;
      }
      .bg-success {
        background-color: #4caf50;
      }
      .bg-info {
        background-color: #2196f3;
      }
    `,
  ],
})
export class StatsCardComponent {
  @Input({ required: true }) data!: StatsCardData;
  @Input() showSparkline = false;
  @Input() actionLabel?: string;

  Math = Math;
  sparklineData = signal<number[]>([]);

  ngOnInit() {
    if (this.showSparkline) {
      this.generateSparklineData();
    }
  }

  formattedValue = computed(() => {
    const value = this.data.value;
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    }
    return value;
  });

  trendIcon(): string {
    if (
      this.data.trend === 'up' ||
      (this.data.change && this.data.change > 0)
    ) {
      return 'trending_up';
    } else if (
      this.data.trend === 'down' ||
      (this.data.change && this.data.change < 0)
    ) {
      return 'trending_down';
    }
    return 'trending_flat';
  }

  changeColorClass(): string {
    const change = this.data.change || 0;
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  valueColorClass(): string {
    return `text-${this.data.color}`;
  }

  iconColorClass(): string {
    return `text-${this.data.color}`;
  }

  backgroundColorClass(): string {
    return `bg-${this.data.color}`;
  }

  private generateSparklineData(): void {
    const data = Array.from(
      { length: 12 },
      () => Math.floor(Math.random() * 80) + 20,
    );
    this.sparklineData.set(data);
  }

  onAction(): void {
    console.log('Stats card action clicked');
  }
}
