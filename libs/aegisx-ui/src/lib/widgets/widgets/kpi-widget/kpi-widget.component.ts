import { Component, computed } from '@angular/core';
import {
  CommonModule,
  DecimalPipe,
  CurrencyPipe,
  PercentPipe,
} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseWidgetComponent } from '../../core/base-widget.component';
import {
  KpiWidgetConfig,
  KpiWidgetData,
  KPI_WIDGET_DEFAULTS,
} from './kpi-widget.types';

@Component({
  selector: 'ax-kpi-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DecimalPipe,
    CurrencyPipe,
    PercentPipe,
  ],
  template: `
    <div
      class="ax-kpi-widget"
      [class.ax-kpi-widget--compact]="mergedConfig().compact"
      [attr.data-color]="mergedConfig().color"
    >
      <!-- Loading -->
      @if (loading()) {
        <div class="ax-kpi-widget__loading">
          <mat-spinner diameter="24"></mat-spinner>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="ax-kpi-widget__error">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Content -->
      @if (!loading() && !error()) {
        <div class="ax-kpi-widget__header">
          @if (mergedConfig().icon) {
            <mat-icon class="ax-kpi-widget__icon">{{
              mergedConfig().icon
            }}</mat-icon>
          }
          <div class="ax-kpi-widget__titles">
            <span class="ax-kpi-widget__title">{{ mergedConfig().title }}</span>
            @if (mergedConfig().subtitle) {
              <span class="ax-kpi-widget__subtitle">{{
                mergedConfig().subtitle
              }}</span>
            }
          </div>
        </div>

        <div class="ax-kpi-widget__value">
          {{ formattedValue() }}
        </div>

        @if (mergedConfig().showTrend && data()?.change !== undefined) {
          <div
            class="ax-kpi-widget__trend"
            [attr.data-trend]="data()?.trend || 'neutral'"
          >
            <mat-icon class="ax-kpi-widget__trend-icon">
              {{ trendIcon() }}
            </mat-icon>
            <span class="ax-kpi-widget__trend-value">
              {{ formattedChange() }}
            </span>
            @if (data()?.previousLabel) {
              <span class="ax-kpi-widget__trend-label">{{
                data()?.previousLabel
              }}</span>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .ax-kpi-widget {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        height: 100%;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-default);

        &--compact {
          padding: 12px;
          gap: 4px;
        }

        &__loading,
        &__error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 8px;
        }

        &__error {
          color: var(--ax-error-default);
          font-size: 14px;
        }

        &__header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        &__icon {
          color: var(--ax-text-secondary);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &__titles {
          display: flex;
          flex-direction: column;
        }

        &__title {
          font-size: 14px;
          font-weight: 500;
          color: var(--ax-text-secondary);
        }

        &__subtitle {
          font-size: 12px;
          color: var(--ax-text-muted);
        }

        &__value {
          font-size: 28px;
          font-weight: 600;
          color: var(--ax-text-heading);
          line-height: 1.2;
        }

        &--compact &__value {
          font-size: 24px;
        }

        &__trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;

          &[data-trend='up'] {
            color: var(--ax-success-default);
          }

          &[data-trend='down'] {
            color: var(--ax-error-default);
          }

          &[data-trend='neutral'] {
            color: var(--ax-text-muted);
          }
        }

        &__trend-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &__trend-label {
          color: var(--ax-text-muted);
          margin-left: 4px;
        }

        /* Color variants */
        &[data-color='primary'] {
          border-left: 3px solid var(--ax-primary-default);
        }

        &[data-color='success'] {
          border-left: 3px solid var(--ax-success-default);
        }

        &[data-color='warning'] {
          border-left: 3px solid var(--ax-warning-default);
        }

        &[data-color='error'] {
          border-left: 3px solid var(--ax-error-default);
        }

        &[data-color='info'] {
          border-left: 3px solid var(--ax-info-default);
        }
      }
    `,
  ],
})
export class KpiWidgetComponent extends BaseWidgetComponent<
  KpiWidgetConfig,
  KpiWidgetData
> {
  mergedConfig = computed(() => ({
    ...KPI_WIDGET_DEFAULTS,
    ...this.config(),
  }));

  formattedValue = computed(() => {
    const value = this.data()?.value ?? 0;
    const cfg = this.mergedConfig();

    switch (cfg.format) {
      case 'currency':
        return this.formatCurrency(value, cfg.currency, cfg.decimals);
      case 'percent':
        return this.formatPercent(value, cfg.decimals);
      case 'compact':
        return this.formatCompact(value);
      default:
        return this.formatNumber(value, cfg.decimals);
    }
  });

  formattedChange = computed(() => {
    const change = this.data()?.change;
    if (change === undefined) return '';

    const isPercent = this.data()?.changeIsPercent ?? true;
    const sign = change >= 0 ? '+' : '';

    if (isPercent) {
      return `${sign}${change.toFixed(1)}%`;
    }
    return `${sign}${this.formatCompact(change)}`;
  });

  trendIcon = computed(() => {
    const trend = this.data()?.trend;
    switch (trend) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  });

  getDefaultConfig(): KpiWidgetConfig {
    return KPI_WIDGET_DEFAULTS;
  }

  private formatNumber(value: number, decimals = 0): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  private formatCurrency(
    value: number,
    currency = 'USD',
    decimals = 0,
  ): string {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  private formatPercent(value: number, decimals = 1): string {
    return value.toLocaleString('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  private formatCompact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + 'B';
    }
    if (abs >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M';
    }
    if (abs >= 1_000) {
      return (value / 1_000).toFixed(1) + 'K';
    }
    return value.toString();
  }
}
