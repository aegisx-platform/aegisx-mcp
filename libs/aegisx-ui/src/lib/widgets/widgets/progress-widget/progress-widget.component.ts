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
                  <!-- Background arc: center (50,50), radius 40 -->
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="var(--ax-border-default)"
                    stroke-width="8"
                    stroke-linecap="round"
                  />
                  <!-- Progress arc -->
                  <path
                    [attr.d]="gaugePath()"
                    fill="none"
                    [attr.stroke]="strokeColor()"
                    stroke-width="8"
                    stroke-linecap="round"
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

        &__header {
          margin-bottom: 12px;
        }

        &__title {
          font-size: 14px;
          font-weight: 500;
          color: var(--ax-text-secondary);
        }

        &__loading,
        &__error {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 8px;
        }

        &__error {
          color: var(--ax-error-default);
          font-size: 14px;
        }

        &__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Circular */
        &__circular {
          position: relative;
          width: 120px;
          height: 120px;
        }

        &__svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        &__progress-ring {
          transition: stroke-dashoffset 0.5s ease;
        }

        &__center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        &__percent {
          font-size: 24px;
          font-weight: 600;
          color: var(--ax-text-heading);
          display: block;
        }

        &__label {
          font-size: 12px;
          color: var(--ax-text-muted);
        }

        /* Linear */
        &__linear {
          width: 100%;
        }

        &__bar-container {
          height: 8px;
          background: var(--ax-border-default);
          border-radius: 4px;
          overflow: hidden;
        }

        &__bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        &__info {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        &__value {
          font-size: 14px;
          font-weight: 500;
          color: var(--ax-text-heading);
        }

        /* Gauge */
        &__gauge {
          position: relative;
          width: 100%;
          max-width: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        &__gauge &__svg {
          transform: none;
          width: 100%;
          height: auto;
        }

        &__gauge-value {
          margin-top: -20px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        /* Secondary */
        &__secondary {
          margin-top: 12px;
          text-align: center;
        }

        &__secondary-value {
          font-size: 18px;
          font-weight: 500;
          color: var(--ax-text-heading);
        }

        &__secondary-label {
          font-size: 12px;
          color: var(--ax-text-muted);
          margin-left: 4px;
        }
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

  gaugePath = computed(() => {
    const pct = this.percent() / 100;
    if (pct <= 0) return '';

    // Arc goes from left (10, 50) to right (90, 50) following the top half
    // Center at (50, 50), radius 40
    const cx = 50,
      cy = 50,
      r = 40;
    const startX = cx - r; // 10
    const startY = cy; // 50

    // Calculate end point based on percentage (0% = left, 100% = right)
    // Angle goes from 180° (left) to 0° (right) as percentage increases
    const angleRad = Math.PI * (1 - pct); // 180° to 0° in radians
    const endX = cx + r * Math.cos(angleRad);
    const endY = cy - r * Math.sin(angleRad);

    // Use large arc flag when angle > 90° (pct > 50%)
    const largeArc = pct > 0.5 ? 1 : 0;

    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  });

  getDefaultConfig(): ProgressWidgetConfig {
    return PROGRESS_WIDGET_DEFAULTS;
  }
}
