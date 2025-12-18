import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProgressSegment,
  SegmentedProgressSize,
  LegendPosition,
} from './segmented-progress.types';

/**
 * AxSegmentedProgressComponent
 *
 * Multi-segment progress bar with legend for displaying distribution metrics.
 *
 * @example
 * ```html
 * <ax-segmented-progress
 *   [segments]="ticketSegments"
 *   legendPosition="bottom"
 *   size="md">
 * </ax-segmented-progress>
 * ```
 */
@Component({
  selector: 'ax-segmented-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './segmented-progress.component.html',
  styleUrls: ['./segmented-progress.component.scss'],
})
export class AxSegmentedProgressComponent {
  /** Progress segments with label, value, percentage, color */
  @Input() segments: ProgressSegment[] = [];

  /** Progress bar size */
  @Input() size: SegmentedProgressSize = 'md';

  /** Legend position */
  @Input() legendPosition: LegendPosition = 'bottom';

  /** Show percentage in legend */
  @Input() showPercentage = true;

  /** Show value in legend */
  @Input() showValue = true;

  /** Gap between segments (px) */
  @Input() gap = 2;

  /** Border radius style */
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'sm';

  /**
   * Get CSS classes for progress bar container
   */
  getProgressClasses(): string {
    const classes = ['ax-segmented-progress__bar'];

    if (this.size) {
      classes.push(`ax-segmented-progress__bar--${this.size}`);
    }

    if (this.rounded) {
      classes.push(`ax-segmented-progress__bar--${this.rounded}`);
    }

    return classes.join(' ');
  }

  /**
   * Get CSS classes for legend
   */
  getLegendClasses(): string {
    const classes = ['ax-segmented-progress__legend'];

    if (this.legendPosition === 'right') {
      classes.push('ax-segmented-progress__legend--right');
    }

    return classes.join(' ');
  }

  /**
   * Get inline style for segment
   */
  getSegmentStyle(segment: ProgressSegment): Record<string, string> {
    return {
      width: `${segment.percentage}%`,
      backgroundColor: segment.color,
    };
  }
}
