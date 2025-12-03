import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseWidgetComponent } from '../../core/base-widget.component';
import {
  ProgressWidgetConfig,
  ProgressWidgetData,
  ProgressColor,
  PROGRESS_WIDGET_DEFAULTS,
} from './progress-widget.types';

@Component({
  selector: 'ax-progress-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="ax-progress-widget" [attr.data-type]="mergedConfig().type">
      <!-- Header -->
      <div class="ax-progress-widget__header">
        <span class="ax-progress-widget__title">{{
          mergedConfig().title
        }}</span>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="ax-progress-widget__loading">
          <mat-spinner diameter="24"></mat-spinner>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="ax-progress-widget__error">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Content -->
      @if (!loading() && !error()) {
        <div class="ax-progress-widget__content">
          @switch (mergedConfig().type) {
            @case ('circular') {
              <div class="ax-progress-widget__circular">
                <svg viewBox="0 0 100 100" class="ax-progress-widget__svg">
                  <!-- Background circle -->
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--ax-border-default)"
                    stroke-width="8"
                  />
                  <!-- Progress circle -->
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    [attr.stroke]="strokeColor()"
                    stroke-width="8"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="circumference"
                    [attr.stroke-dashoffset]="dashOffset()"
                    class="ax-progress-widget__progress-ring"
                  />
                </svg>
                <div class="ax-progress-widget__center">
                  @if (mergedConfig().showPercent) {
                    <span class="ax-progress-widget__percent"
                      >{{ percent() }}%</span
                    >
                  }
                  @if (data()?.label) {
                    <span class="ax-progress-widget__label">{{
                      data()?.label
                    }}</span>
                  }
                </div>
              </div>
            }
            @case ('linear') {
              <div class="ax-progress-widget__linear">
                <div class="ax-progress-widget__bar-container">
                  <div
                    class="ax-progress-widget__bar"
                    [style.width.%]="percent()"
                    [style.background]="strokeColor()"
                  ></div>
                </div>
                <div class="ax-progress-widget__info">
                  @if (mergedConfig().showLabel && data()?.label) {
                    <span class="ax-progress-widget__label">{{
                      data()?.label
                    }}</span>
                  }
                  @if (mergedConfig().showPercent) {
                    <span class="ax-progress-widget__value"
                      >{{ percent() }}%</span
                    >
                  }
                </div>
              </div>
            }
            @case ('gauge') {
              <div class="ax-progress-widget__gauge">
                <svg viewBox="0 0 100 54" class="ax-progress-widget__svg">
                  <!-- Background arc -->
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="var(--ax-border-default)"
                    stroke-width="8"
                    stroke-linecap="round"
                  />
                  <!-- Progress arc: same path, controlled by stroke-dasharray -->
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    [attr.stroke]="strokeColor()"
                    stroke-width="8"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="gaugeArcLength"
                    [attr.stroke-dashoffset]="gaugeDashOffset()"
                    class="ax-progress-widget__gauge-progress"
                  />
                </svg>
                <div class="ax-progress-widget__gauge-value">
                  @if (mergedConfig().showPercent) {
                    <span class="ax-progress-widget__percent"
                      >{{ percent() }}%</span
                    >
                  }
                </div>
              </div>
            }
          }

          <!-- Secondary info -->
          @if (data()?.secondaryValue !== undefined) {
            <div class="ax-progress-widget__secondary">
              <span class="ax-progress-widget__secondary-value">{{
                data()?.secondaryValue
              }}</span>
              @if (data()?.secondaryLabel) {
                <span class="ax-progress-widget__secondary-label">{{
                  data()?.secondaryLabel
                }}</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ax-progress-widget {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 16px;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);
      }

      .ax-progress-widget__header {
        margin-bottom: 12px;
      }

      .ax-progress-widget__title {
        font-size: 14px;
        font-weight: 500;
        color: var(--ax-text-secondary);
      }

      .ax-progress-widget__loading,
      .ax-progress-widget__error {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        gap: 8px;
      }

      .ax-progress-widget__error {
        color: var(--ax-error-default);
        font-size: 14px;
      }

      .ax-progress-widget__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      /* Circular */
      .ax-progress-widget__circular {
        position: relative;
        width: 120px;
        height: 120px;
      }

      .ax-progress-widget__svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .ax-progress-widget__progress-ring {
        transition: stroke-dashoffset 0.5s ease;
      }

      .ax-progress-widget__center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }

      .ax-progress-widget__percent {
        font-size: 24px;
        font-weight: 600;
        color: var(--ax-text-heading);
        display: block;
      }

      .ax-progress-widget__label {
        font-size: 12px;
        color: var(--ax-text-muted);
      }

      /* Linear */
      .ax-progress-widget__linear {
        width: 100%;
      }

      .ax-progress-widget__bar-container {
        height: 8px;
        background: var(--ax-border-default);
        border-radius: 4px;
        overflow: hidden;
      }

      .ax-progress-widget__bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      .ax-progress-widget__info {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
      }

      .ax-progress-widget__value {
        font-size: 14px;
        font-weight: 500;
        color: var(--ax-text-heading);
      }

      /* Gauge */
      .ax-progress-widget__gauge {
        position: relative;
        width: 100%;
        max-width: 180px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .ax-progress-widget__gauge .ax-progress-widget__svg {
        transform: none;
        width: 100%;
        height: auto;
      }

      .ax-progress-widget__gauge-value {
        margin-top: -20px;
        text-align: center;
        position: relative;
        z-index: 1;
      }

      .ax-progress-widget__gauge-progress {
        transition: stroke-dashoffset 0.5s ease;
      }

      /* Secondary */
      .ax-progress-widget__secondary {
        margin-top: 12px;
        text-align: center;
      }

      .ax-progress-widget__secondary-value {
        font-size: 18px;
        font-weight: 500;
        color: var(--ax-text-heading);
      }

      .ax-progress-widget__secondary-label {
        font-size: 12px;
        color: var(--ax-text-muted);
        margin-left: 4px;
      }
    `,
  ],
})
export class ProgressWidgetComponent extends BaseWidgetComponent<
  ProgressWidgetConfig,
  ProgressWidgetData
> {
  readonly circumference = 2 * Math.PI * 42; // r = 42

  mergedConfig = computed(() => ({
    ...PROGRESS_WIDGET_DEFAULTS,
    ...this.config(),
  }));

  percent = computed(() => {
    const value = this.data()?.value ?? 0;
    const max = this.mergedConfig().max || 100;
    return Math.min(100, Math.round((value / max) * 100));
  });

  dashOffset = computed(() => {
    const pct = this.percent() / 100;
    return this.circumference * (1 - pct);
  });

  computedColor = computed((): ProgressColor => {
    const cfg = this.mergedConfig();
    if (!cfg.autoColor) return cfg.color || 'primary';

    const pct = this.percent();
    const thresholds = cfg.thresholds || { warning: 70, error: 90 };

    if (pct >= thresholds.error) return 'error';
    if (pct >= thresholds.warning) return 'warning';
    return 'success';
  });

  strokeColor = computed(() => {
    const color = this.computedColor();
    const colorMap: Record<ProgressColor, string> = {
      primary: 'var(--ax-primary-default)',
      success: 'var(--ax-success-default)',
      warning: 'var(--ax-warning-default)',
      error: 'var(--ax-error-default)',
      info: 'var(--ax-info-default)',
    };
    return colorMap[color];
  });

  // Gauge arc length: half circle with radius 40 = π * 40 ≈ 125.66
  readonly gaugeArcLength = Math.PI * 40;

  // Calculate dash offset for gauge progress
  gaugeDashOffset = computed(() => {
    const pct = this.percent() / 100;
    // At 0%: offset = full length (nothing visible)
    // At 100%: offset = 0 (full arc visible)
    return this.gaugeArcLength * (1 - pct);
  });

  getDefaultConfig(): ProgressWidgetConfig {
    return PROGRESS_WIDGET_DEFAULTS;
  }
}
