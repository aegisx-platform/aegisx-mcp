import { Component, Input, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AegisxCardComponent } from '@aegisx/ui';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

@Component({
  selector: 'ax-chart-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    AegisxCardComponent,
  ],
  template: `
    <ax-card
      [title]="title"
      [subtitle]="subtitle"
      [icon]="chartIcon"
      [appearance]="'elevated'"
      class="h-full"
    >
      <div card-header-actions>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            <span>Refresh</span>
          </button>
          <button mat-menu-item (click)="exportData()">
            <mat-icon>download</mat-icon>
            <span>Export</span>
          </button>
          <button mat-menu-item (click)="viewDetails()">
            <mat-icon>open_in_new</mat-icon>
            <span>View Details</span>
          </button>
        </mat-menu>
      </div>

      <div class="chart-container" [style.height.px]="height">
        @if (loading()) {
          <div class="h-full flex items-center justify-center">
            <mat-spinner [diameter]="40"></mat-spinner>
          </div>
        } @else {
          <div
            class="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <div class="text-center">
              <mat-icon class="text-6xl text-gray-400 dark:text-gray-600">{{
                chartIcon
              }}</mat-icon>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {{ chartType | titlecase }} Chart
              </p>
            </div>
          </div>
        }
      </div>

      @if (showLegend && data) {
        <div class="mt-4 flex flex-wrap gap-4">
          @for (dataset of data.datasets; track dataset.label) {
            <div class="flex items-center space-x-2">
              <div
                class="w-3 h-3 rounded-full"
                [style.backgroundColor]="dataset.backgroundColor || '#1976d2'"
              ></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                dataset.label
              }}</span>
            </div>
          }
        </div>
      }
    </ax-card>
  `,
  styles: [
    `
      .chart-container {
        min-height: 200px;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .animation-delay-200 {
        animation-delay: 200ms;
      }

      .animation-delay-400 {
        animation-delay: 400ms;
      }
    `,
  ],
})
export class ChartWidgetComponent {
  @Input() title = 'Chart';
  @Input() subtitle = '';
  @Input() data: ChartData | null = null;
  @Input() chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' = 'line';
  @Input() height = 300;
  @Input() showLegend = true;

  loading = signal(false);

  get chartIcon(): string {
    const icons = {
      line: 'show_chart',
      bar: 'bar_chart',
      pie: 'pie_chart',
      doughnut: 'donut_large',
      area: 'area_chart',
    };
    return icons[this.chartType] || 'analytics';
  }

  refreshData(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1500);
  }

  exportData(): void {
    console.log('Exporting chart data...');
  }

  viewDetails(): void {
    console.log('Viewing chart details...');
  }
}
