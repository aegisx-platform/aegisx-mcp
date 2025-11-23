import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Sparkline Variant
 */
export type SparklineVariant = 'line' | 'area';

/**
 * Sparkline Size
 */
export type SparklineSize = 'sm' | 'md' | 'lg';

/**
 * AxSparklineComponent
 *
 * Lightweight SVG-based sparkline charts for showing trends.
 * Perfect for inline metrics and dashboard KPIs.
 *
 * @example
 * ```html
 * <ax-sparkline
 *   [data]="[10, 20, 15, 25, 30]"
 *   variant="area"
 *   color="var(--ax-info-default)">
 * </ax-sparkline>
 * ```
 */
@Component({
  selector: 'ax-sparkline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sparkline.component.html',
  styleUrls: ['./sparkline.component.scss'],
})
export class AxSparklineComponent implements OnInit {
  /** Data points array */
  @Input() data: number[] = [];

  /** Chart variant */
  @Input() variant: SparklineVariant = 'line';

  /** Chart size */
  @Input() size: SparklineSize = 'md';

  /** Line/area color */
  @Input() color = 'var(--ax-info-default)';

  /** Line stroke width */
  @Input() strokeWidth = 2;

  /** Show dots on data points */
  @Input() showDots = false;

  /** Dot radius */
  @Input() dotRadius = 3;

  /** Fill opacity for area variant (0-1) */
  @Input() fillOpacity = 0.2;

  /** Smooth curve (true) or straight lines (false) */
  @Input() smooth = true;

  /** Custom width (e.g., "200px", "50%"). If not set, defaults to 100% */
  @Input() customWidth?: string;

  /** Show value tooltip on hover */
  @Input() showValue = true;

  // SVG properties
  svgWidth = 0;
  svgHeight = 0;
  pathD = '';
  areaPathD = '';
  points: { x: number; y: number; value: number }[] = [];

  // Tooltip properties
  hoveredPoint: { x: number; y: number; value: number } | null = null;

  ngOnInit(): void {
    this.calculateDimensions();
    this.generatePath();
  }

  ngOnChanges(): void {
    this.calculateDimensions();
    this.generatePath();
  }

  /**
   * Calculate SVG dimensions based on size
   */
  private calculateDimensions(): void {
    const sizeMap = {
      sm: { width: 300, height: 24 },
      md: { width: 300, height: 40 },
      lg: { width: 300, height: 60 },
    };

    const config = sizeMap[this.size];
    this.svgWidth = config.width;
    this.svgHeight = config.height;
  }

  /**
   * Generate SVG path from data points
   */
  private generatePath(): void {
    if (!this.data || this.data.length === 0) {
      this.pathD = '';
      this.areaPathD = '';
      this.points = [];
      return;
    }

    // Normalize data to SVG coordinates
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;

    const padding = 4;
    const usableWidth = this.svgWidth - padding * 2;
    const usableHeight = this.svgHeight - padding * 2;

    this.points = this.data.map((value, index) => {
      const x = padding + (index / (this.data.length - 1)) * usableWidth;
      const y = padding + usableHeight - ((value - min) / range) * usableHeight;
      return { x, y, value };
    });

    // Generate line path
    if (this.smooth) {
      this.pathD = this.generateSmoothPath(this.points);
    } else {
      this.pathD = this.generateLinearPath(this.points);
    }

    // Generate area path (same as line but closed at bottom)
    if (this.variant === 'area') {
      this.areaPathD =
        this.pathD +
        ` L ${this.points[this.points.length - 1].x} ${this.svgHeight} L ${this.points[0].x} ${this.svgHeight} Z`;
    }
  }

  /**
   * Generate smooth curve path (Catmull-Rom spline)
   */
  private generateSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Control points for cubic Bezier curve
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  }

  /**
   * Generate linear path (straight lines)
   */
  private generateLinearPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }

  /**
   * Get fill color with opacity
   */
  getFillColor(): string {
    return this.color;
  }

  /**
   * Handle mouse enter on data point
   */
  onPointMouseEnter(point: { x: number; y: number; value: number }): void {
    if (this.showValue) {
      this.hoveredPoint = point;
    }
  }

  /**
   * Handle mouse leave on data point
   */
  onPointMouseLeave(): void {
    this.hoveredPoint = null;
  }

  /**
   * Format value for display
   */
  formatValue(value: number): string {
    // Format with commas for thousands
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Get tooltip X position with boundary detection
   */
  getTooltipX(pointX: number): number {
    const tooltipWidth = 60;
    const tooltipHalfWidth = tooltipWidth / 2;

    // Check if tooltip would overflow left edge
    if (pointX - tooltipHalfWidth < 0) {
      return tooltipHalfWidth;
    }

    // Check if tooltip would overflow right edge
    if (pointX + tooltipHalfWidth > this.svgWidth) {
      return this.svgWidth - tooltipHalfWidth;
    }

    // Center tooltip on point
    return pointX;
  }

  /**
   * Get tooltip rect X position
   */
  getTooltipRectX(pointX: number): number {
    return this.getTooltipX(pointX) - 30;
  }

  /**
   * Get tooltip Y position (always above the point)
   */
  getTooltipY(pointY: number): number {
    const tooltipHeight = 25;

    // If point is too close to top, show below
    if (pointY < tooltipHeight) {
      return pointY + 15; // Below the point
    }

    // Default: show above the point
    return pointY - 25;
  }

  /**
   * Get tooltip rect Y position
   */
  getTooltipRectY(pointY: number): number {
    return this.getTooltipY(pointY);
  }

  /**
   * Get tooltip text Y position (centered in rect)
   */
  getTooltipTextY(pointY: number): number {
    return this.getTooltipY(pointY) + 13;
  }
}
