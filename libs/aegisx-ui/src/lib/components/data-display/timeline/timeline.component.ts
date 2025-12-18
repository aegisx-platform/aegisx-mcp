import {
  Component,
  Input,
  ContentChild,
  TemplateRef,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  TimelineLayout,
  TimelineAlign,
  TimelineMarkerSize,
  TimelineConnectorStyle,
  TimelineItem,
} from './timeline.types';

@Component({
  selector: 'ax-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class AxTimelineComponent {
  /** Array of timeline items to display */
  @Input() items: TimelineItem[] = [];

  /** Layout direction: vertical (default) or horizontal */
  @Input() layout: TimelineLayout = 'vertical';

  /** Alignment of content: left, right, or alternate (zigzag) */
  @Input() align: TimelineAlign = 'left';

  /** Size of the marker: sm, md (default), or lg */
  @Input() markerSize: TimelineMarkerSize = 'md';

  /** Connector line style */
  @Input() connectorStyle: TimelineConnectorStyle = 'solid';

  /** Dense mode with reduced spacing */
  @Input() dense = false;

  /** Custom template for marker */
  @ContentChild('marker') markerTemplate?: TemplateRef<unknown>;

  /** Custom template for content */
  @ContentChild('content') contentTemplate?: TemplateRef<unknown>;

  /** Custom template for opposite content */
  @ContentChild('opposite') oppositeTemplate?: TemplateRef<unknown>;

  @HostBinding('class')
  get hostClasses(): string {
    return [
      'ax-timeline',
      `ax-timeline--${this.layout}`,
      `ax-timeline--${this.align}`,
      `ax-timeline--marker-${this.markerSize}`,
      `ax-timeline--connector-${this.connectorStyle}`,
      this.dense ? 'ax-timeline--dense' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  trackByIndex(index: number): number {
    return index;
  }

  /** Determine alignment for each item (used in alternate mode) */
  getItemAlign(index: number): 'left' | 'right' {
    if (this.align === 'alternate') {
      return index % 2 === 0 ? 'left' : 'right';
    }
    return this.align === 'right' ? 'right' : 'left';
  }

  /** Check if item should show opposite content */
  shouldShowOpposite(): boolean {
    return this.align === 'alternate' || !!this.oppositeTemplate;
  }
}
