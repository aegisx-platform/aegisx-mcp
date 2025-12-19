import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AxBadgeComponent } from '../../data-display/badge/badge.component';
import {
  StockLevelSize,
  StockLevelColorScheme,
  StockLevelWarningEvent,
} from './ax-stock-level.component.types';

/**
 * Stock Level Indicator Component
 *
 * Displays current inventory level with visual progress bar and color-coded zones.
 * Supports traffic-light and gradient color schemes with configurable sizes.
 *
 * Features:
 * - Color-coded zones: green (>75%), yellow (25-75%), red (<25%)
 * - Warning badge when stock <= minimum
 * - Smooth animations and transitions
 * - WCAG 2.1 AA compliant accessibility
 * - Responsive sizing (sm/md/lg)
 * - Customizable units display
 *
 * @example
 * <ax-stock-level
 *   [current]="150"
 *   [minimum]="50"
 *   [maximum]="500"
 *   [unit]="'pieces'"
 *   [size]="'md'"
 *   [showLabel]="true"
 *   [showPercentage]="true"
 *   (onWarningClick)="handleWarning($event)"
 * />
 */
@Component({
  selector: 'ax-stock-level',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, AxBadgeComponent],
  templateUrl: './ax-stock-level.component.html',
  styleUrl: './ax-stock-level.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AxStockLevelComponent {
  // Input signals - values that can be changed from parent component
  current = input.required<number>();
  minimum = input.required<number>();
  maximum = input.required<number>();
  unit = input<string>('pieces');
  size = input<StockLevelSize>('md');
  showLabel = input<boolean>(true);
  showPercentage = input<boolean>(true);
  colorScheme = input<StockLevelColorScheme>('traffic-light');

  // Output - events emitted to parent component
  warningClick = output<StockLevelWarningEvent>();

  /**
   * Computed signal: Percentage of stock filled (0-100)
   * Handles division by zero gracefully
   */
  percentage = computed(() => {
    const max = this.maximum();
    const curr = this.current();
    return max > 0 ? Math.round((curr / max) * 100) : 0;
  });

  /**
   * Computed signal: CSS class for the progress bar fill color
   * Implements traffic-light scheme or gradient based on configuration
   */
  colorClass = computed(() => {
    const pct = this.percentage();
    if (this.colorScheme() === 'traffic-light') {
      // Traffic light scheme: green > yellow > red
      if (pct >= 75) return 'bg-success-500';
      if (pct >= 25) return 'bg-warning-500';
      return 'bg-error-500';
    } else {
      // Gradient scheme: smooth transition from red to green
      return 'bg-gradient-to-r from-error-500 via-warning-500 to-success-500';
    }
  });

  /**
   * Computed signal: Whether to show warning badge
   * Shows when current stock <= minimum threshold
   */
  isWarning = computed(() => {
    return this.current() <= this.minimum();
  });

  /**
   * Computed signal: Tooltip text with current/min/max values
   */
  tooltipText = computed(() => {
    const curr = this.current();
    const min = this.minimum();
    const max = this.maximum();
    const unit = this.unit();
    return `Current: ${curr} ${unit}\nMinimum: ${min} ${unit}\nMaximum: ${max} ${unit}`;
  });

  /**
   * Handle warning badge click event
   * Emits event with current stock level and minimum threshold
   */
  handleWarningClick(): void {
    this.warningClick.emit({
      level: 'low',
      current: this.current(),
      minimum: this.minimum(),
    });
  }
}
