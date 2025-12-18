import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CircularProgressVariant,
  CircularProgressSize,
} from './circular-progress.types';

/**
 * AxCircularProgressComponent
 *
 * SVG-based circular progress indicator for displaying percentage metrics.
 * Supports ring, donut, and gauge styles with color thresholds.
 *
 * @example
 * ```html
 * <ax-circular-progress
 *   [value]="75"
 *   variant="ring"
 *   size="md"
 *   color="info">
 * </ax-circular-progress>
 * ```
 */
@Component({
  selector: 'ax-circular-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.scss'],
})
export class AxCircularProgressComponent implements OnInit, OnChanges {
  /** Progress value (0-100) */
  @Input() value: number = 0;

  /** Circle variant */
  @Input() variant: CircularProgressVariant = 'ring';

  /** Circle size */
  @Input() size: CircularProgressSize = 'md';

  /** Progress color (design token or CSS color) */
  @Input() color?: string;

  /** Show percentage label in center */
  @Input() showLabel: boolean = true;

  /** Custom label text (overrides percentage) */
  @Input() label?: string;

  /** Track color (background circle) */
  @Input() trackColor: string = 'var(--ax-border-default)';

  /** Stroke width (auto-calculated based on size if not provided) */
  @Input() strokeWidth?: number;

  /** Automatic color based on value thresholds */
  @Input() autoColor: boolean = false;

  /** Success threshold (green above this) */
  @Input() successThreshold: number = 80;

  /** Warning threshold (yellow below this) */
  @Input() warningThreshold: number = 50;

  // SVG properties (calculated)
  svgSize = 0;
  radius = 0;
  circumference = 0;
  strokeDashoffset = 0;
  centerX = 0;
  centerY = 0;
  calculatedStrokeWidth = 0;

  ngOnInit(): void {
    this.calculateDimensions();
    this.calculateProgress();
  }

  ngOnChanges(): void {
    this.calculateDimensions();
    this.calculateProgress();
  }

  /**
   * Calculate SVG dimensions based on size
   */
  private calculateDimensions(): void {
    // Size mappings
    const sizeMap = {
      sm: { svg: 80, stroke: 6 },
      md: { svg: 120, stroke: 8 },
      lg: { svg: 160, stroke: 10 },
      xl: { svg: 200, stroke: 12 },
    };

    const config = sizeMap[this.size];
    this.svgSize = config.svg;
    this.calculatedStrokeWidth = this.strokeWidth || config.stroke;

    // Calculate radius (half of SVG size minus stroke width)
    this.radius = (this.svgSize - this.calculatedStrokeWidth) / 2;
    this.centerX = this.svgSize / 2;
    this.centerY = this.svgSize / 2;

    // Calculate circumference
    this.circumference = 2 * Math.PI * this.radius;
  }

  /**
   * Calculate stroke-dashoffset based on value
   */
  private calculateProgress(): void {
    const clampedValue = Math.min(100, Math.max(0, this.value));
    this.strokeDashoffset =
      this.circumference - (clampedValue / 100) * this.circumference;
  }

  /**
   * Get progress color based on value
   */
  getProgressColor(): string {
    if (this.color) {
      return this.color;
    }

    if (this.autoColor) {
      if (this.value >= this.successThreshold) {
        return 'var(--ax-success-default)';
      } else if (this.value >= this.warningThreshold) {
        return 'var(--ax-warning-default)';
      } else {
        return 'var(--ax-error)';
      }
    }

    return 'var(--ax-info-default)';
  }

  /**
   * Get label text
   */
  getLabelText(): string {
    if (this.label) {
      return this.label;
    }
    return `${Math.round(this.value)}%`;
  }

  /**
   * Get font size based on circle size
   */
  getFontSize(): string {
    const fontSizeMap = {
      sm: 'var(--ax-text-sm)',
      md: 'var(--ax-text-lg)',
      lg: 'var(--ax-text-2xl)',
      xl: 'var(--ax-text-3xl)',
    };
    return fontSizeMap[this.size];
  }
}
