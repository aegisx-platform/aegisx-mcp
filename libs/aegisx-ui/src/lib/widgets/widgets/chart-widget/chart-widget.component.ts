import { Component, computed, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseWidgetComponent } from '../../core/base-widget.component';
import {
  ChartWidgetConfig,
  ChartWidgetData,
  CHART_WIDGET_DEFAULTS,
  CHART_DEFAULT_COLORS,
} from './chart-widget.types';

@Component({
  selector: 'ax-chart-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="ax-chart-widget">
      <!-- Header -->
      <div class="ax-chart-widget__header">
        <span class="ax-chart-widget__title">{{ mergedConfig().title }}</span>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="ax-chart-widget__loading">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="ax-chart-widget__error">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Chart -->
      @if (!loading() && !error() && data()) {
        <div class="ax-chart-widget__chart" #chartContainer>
          @switch (mergedConfig().type) {
            @case ('line') {
              <svg [attr.viewBox]="viewBox()" class="ax-chart-widget__svg">
                <!-- Grid -->
                @if (mergedConfig().showGrid) {
                  <g class="ax-chart-widget__grid">
                    @for (y of gridLines(); track y) {
                      <line
                        [attr.x1]="padding"
                        [attr.y1]="y"
                        [attr.x2]="chartWidth()"
                        [attr.y2]="y"
                      />
                    }
                  </g>
                }
                <!-- Lines -->
                @for (
                  series of data()!.series;
                  track series.name;
                  let i = $index
                ) {
                  <path
                    [attr.d]="linePath(series.data)"
                    [attr.stroke]="getColor(i)"
                    class="ax-chart-widget__line"
                    [class.ax-chart-widget__line--smooth]="
                      mergedConfig().smooth
                    "
                  />
                }
                <!-- X-axis labels -->
                <g class="ax-chart-widget__labels">
                  @for (label of data()!.labels; track label; let i = $index) {
                    <text
                      [attr.x]="xPosition(i)"
                      [attr.y]="chartHeight() + 16"
                      text-anchor="middle"
                    >
                      {{ label }}
                    </text>
                  }
                </g>
              </svg>
            }
            @case ('bar') {
              <svg [attr.viewBox]="viewBox()" class="ax-chart-widget__svg">
                <!-- Grid -->
                @if (mergedConfig().showGrid) {
                  <g class="ax-chart-widget__grid">
                    @for (y of gridLines(); track y) {
                      <line
                        [attr.x1]="padding"
                        [attr.y1]="y"
                        [attr.x2]="chartWidth()"
                        [attr.y2]="y"
                      />
                    }
                  </g>
                }
                <!-- Bars -->
                @for (
                  series of data()!.series;
                  track series.name;
                  let si = $index
                ) {
                  @for (value of series.data; track $index; let i = $index) {
                    <rect
                      [attr.x]="barX(i, si)"
                      [attr.y]="barY(value)"
                      [attr.width]="barWidth()"
                      [attr.height]="barHeight(value)"
                      [attr.fill]="getColor(si)"
                      [attr.rx]="2"
                      class="ax-chart-widget__bar"
                    />
                  }
                }
                <!-- X-axis labels -->
                <g class="ax-chart-widget__labels">
                  @for (label of data()!.labels; track label; let i = $index) {
                    <text
                      [attr.x]="xPosition(i)"
                      [attr.y]="chartHeight() + 16"
                      text-anchor="middle"
                    >
                      {{ label }}
                    </text>
                  }
                </g>
              </svg>
            }
            @case ('donut') {
              <svg
                [attr.viewBox]="donutViewBox()"
                class="ax-chart-widget__svg ax-chart-widget__svg--donut"
              >
                @for (
                  segment of donutSegments();
                  track segment.name;
                  let i = $index
                ) {
                  <path
                    [attr.d]="segment.path"
                    [attr.fill]="getColor(i)"
                    class="ax-chart-widget__donut-segment"
                  />
                }
                <!-- Center text -->
                <text
                  x="100"
                  y="100"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="ax-chart-widget__donut-total"
                >
                  {{ donutTotal() }}
                </text>
              </svg>
            }
          }
        </div>

        <!-- Legend -->
        @if (mergedConfig().showLegend && data()!.series.length > 1) {
          <div
            class="ax-chart-widget__legend"
            [attr.data-position]="mergedConfig().legendPosition"
          >
            @for (series of data()!.series; track series.name; let i = $index) {
              <div class="ax-chart-widget__legend-item">
                <span
                  class="ax-chart-widget__legend-color"
                  [style.background]="getColor(i)"
                ></span>
                <span class="ax-chart-widget__legend-label">{{
                  series.name
                }}</span>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .ax-chart-widget {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 16px;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
      }

      .ax-chart-widget__header {
        margin-bottom: 12px;
      }

      .ax-chart-widget__title {
        font-size: 14px;
        font-weight: 500;
        color: var(--ax-text-secondary);
      }

      .ax-chart-widget__loading,
      .ax-chart-widget__error {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        gap: 8px;
      }

      .ax-chart-widget__error {
        color: var(--ax-error-default);
        font-size: 14px;
      }

      .ax-chart-widget__chart {
        flex: 1;
        min-height: 0;
      }

      .ax-chart-widget__svg {
        width: 100%;
        height: 100%;
      }

      .ax-chart-widget__svg--donut {
        max-height: 200px;
      }

      .ax-chart-widget__grid line {
        stroke: var(--ax-border-default);
        stroke-dasharray: 2 2;
      }

      .ax-chart-widget__line {
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .ax-chart-widget__bar {
        transition: opacity 0.2s;
      }

      .ax-chart-widget__bar:hover {
        opacity: 0.8;
      }

      .ax-chart-widget__donut-segment {
        transition: opacity 0.2s;
      }

      .ax-chart-widget__donut-segment:hover {
        opacity: 0.8;
      }

      .ax-chart-widget__donut-total {
        font-size: 24px;
        font-weight: 600;
        fill: var(--ax-text-heading);
      }

      .ax-chart-widget__labels text {
        font-size: 10px;
        fill: var(--ax-text-muted);
      }

      .ax-chart-widget__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 12px;
        justify-content: center;
      }

      .ax-chart-widget__legend[data-position='left'],
      .ax-chart-widget__legend[data-position='right'] {
        flex-direction: column;
      }

      .ax-chart-widget__legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .ax-chart-widget__legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }

      .ax-chart-widget__legend-label {
        font-size: 12px;
        color: var(--ax-text-secondary);
      }
    `,
  ],
})
export class ChartWidgetComponent extends BaseWidgetComponent<
  ChartWidgetConfig,
  ChartWidgetData
> {
  chartContainer = viewChild<ElementRef>('chartContainer');

  padding = 20;
  svgWidth = 300;
  svgHeight = 150;

  mergedConfig = computed(() => ({
    ...CHART_WIDGET_DEFAULTS,
    ...this.config(),
  }));

  chartWidth = computed(() => this.svgWidth - this.padding);
  chartHeight = computed(() => this.svgHeight - this.padding);

  viewBox = computed(() => `0 0 ${this.svgWidth} ${this.svgHeight + 20}`);
  donutViewBox = computed(() => '0 0 200 200');

  maxValue = computed(() => {
    const data = this.data();
    if (!data) return 100;
    const allValues = data.series.flatMap((s) => s.data);
    return Math.max(...allValues) * 1.1; // 10% padding
  });

  gridLines = computed(() => {
    const lines: number[] = [];
    for (let i = 0; i <= 4; i++) {
      lines.push(this.padding + (this.chartHeight() - this.padding) * (i / 4));
    }
    return lines;
  });

  donutTotal = computed(() => {
    const data = this.data();
    if (!data || data.series.length === 0) return 0;
    const total = data.series[0].data.reduce((a, b) => a + b, 0);
    return this.formatCompact(total);
  });

  donutSegments = computed(() => {
    const data = this.data();
    if (!data || data.series.length === 0) return [];

    const values = data.series[0].data;
    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    const segments: Array<{ name: string; path: string }> = [];
    let startAngle = -90;
    const cx = 100,
      cy = 100,
      r1 = 60,
      r2 = 85;

    values.forEach((value, i) => {
      const angle = (value / total) * 360;
      const endAngle = startAngle + angle;

      const path = this.createDonutPath(cx, cy, r1, r2, startAngle, endAngle);
      segments.push({ name: data.labels[i] || `Segment ${i}`, path });

      startAngle = endAngle;
    });

    return segments;
  });

  getDefaultConfig(): ChartWidgetConfig {
    return CHART_WIDGET_DEFAULTS;
  }

  getColor(index: number): string {
    const colors = this.mergedConfig().colors || CHART_DEFAULT_COLORS;
    return colors[index % colors.length];
  }

  xPosition(index: number): number {
    const data = this.data();
    if (!data) return 0;
    const step =
      (this.chartWidth() - this.padding * 2) / (data.labels.length - 1 || 1);
    return this.padding + step * index;
  }

  yPosition(value: number): number {
    const max = this.maxValue();
    const h = this.chartHeight() - this.padding;
    return this.padding + h - (value / max) * h;
  }

  linePath(values: number[]): string {
    if (!values.length) return '';

    const points = values.map(
      (v, i) => `${this.xPosition(i)},${this.yPosition(v)}`,
    );

    if (this.mergedConfig().smooth && values.length > 2) {
      return this.smoothPath(values);
    }

    return `M ${points.join(' L ')}`;
  }

  smoothPath(values: number[]): string {
    const points = values.map((v, i) => ({
      x: this.xPosition(i),
      y: this.yPosition(v),
    }));
    let d = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
    }

    return d;
  }

  barX(index: number, seriesIndex: number): number {
    const data = this.data();
    if (!data) return 0;

    const groupWidth =
      (this.chartWidth() - this.padding * 2) / data.labels.length;
    const barW = this.barWidth();
    const seriesCount = data.series.length;
    const groupStart = this.padding + groupWidth * index;
    const offset = (groupWidth - barW * seriesCount) / 2;

    return groupStart + offset + barW * seriesIndex;
  }

  barY(value: number): number {
    return this.yPosition(value);
  }

  barWidth(): number {
    const data = this.data();
    if (!data) return 20;
    const groupWidth =
      (this.chartWidth() - this.padding * 2) / data.labels.length;
    return Math.min(30, (groupWidth * 0.7) / data.series.length);
  }

  barHeight(value: number): number {
    return this.chartHeight() - this.yPosition(value);
  }

  private createDonutPath(
    cx: number,
    cy: number,
    r1: number,
    r2: number,
    startAngle: number,
    endAngle: number,
  ): string {
    const start1 = this.polarToCartesian(cx, cy, r2, startAngle);
    const end1 = this.polarToCartesian(cx, cy, r2, endAngle);
    const start2 = this.polarToCartesian(cx, cy, r1, endAngle);
    const end2 = this.polarToCartesian(cx, cy, r1, startAngle);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${start1.x} ${start1.y}`,
      `A ${r2} ${r2} 0 ${largeArc} 1 ${end1.x} ${end1.y}`,
      `L ${start2.x} ${start2.y}`,
      `A ${r1} ${r1} 0 ${largeArc} 0 ${end2.x} ${end2.y}`,
      'Z',
    ].join(' ');
  }

  private polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  private formatCompact(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return value.toString();
  }
}
