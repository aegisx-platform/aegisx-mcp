/**
 * Timeline Component Type Definitions
 *
 * Type definitions for the Timeline component (@aegisx/ui).
 * Displays chronological events with customizable markers and connectors.
 */

/**
 * Timeline Layout Direction
 *
 * Defines the orientation of the timeline:
 * - vertical: Top-to-bottom layout (default) - best for chronological sequences
 * - horizontal: Left-to-right layout - good for process flows
 */
export type TimelineLayout = 'vertical' | 'horizontal';

/**
 * Timeline Content Alignment
 *
 * Defines how timeline items are aligned:
 * - left: All content aligned to the left (vertical) or top (horizontal)
 * - right: All content aligned to the right (vertical) or bottom (horizontal)
 * - alternate: Zigzag pattern - alternates between left/right (vertical) or top/bottom (horizontal)
 */
export type TimelineAlign = 'left' | 'right' | 'alternate';

/**
 * Timeline Marker Size
 *
 * Controls the dimensions of timeline markers (dots/icons):
 * - sm: Small (16px) - compact markers
 * - md: Medium (24px) - default size
 * - lg: Large (32px) - prominent markers
 */
export type TimelineMarkerSize = 'sm' | 'md' | 'lg';

/**
 * Timeline Connector Line Style
 *
 * Defines the style of the connecting line between markers:
 * - solid: Continuous solid line (default)
 * - dashed: Dashed line pattern
 * - dotted: Dotted line pattern
 */
export type TimelineConnectorStyle = 'solid' | 'dashed' | 'dotted';

/**
 * Timeline Item Configuration
 *
 * Defines a single event or milestone in the timeline.
 *
 * @example
 * const item: TimelineItem = {
 *   title: 'Project Started',
 *   description: 'Initial project kickoff meeting',
 *   timestamp: '2024-01-15 10:00 AM',
 *   icon: 'flag',
 *   color: 'var(--ax-success-default)',
 *   opposite: 'Q1 2024',
 *   data: { projectId: 'PRJ-001' }
 * };
 */
export interface TimelineItem {
  /** Event title or heading */
  title: string;

  /** Optional detailed description of the event */
  description?: string;

  /** Optional timestamp or date label */
  timestamp?: string;

  /** Optional Material Icon name for the marker */
  icon?: string;

  /** Optional custom color for the marker (CSS color or design token) */
  color?: string;

  /**
   * Optional content displayed on the opposite side
   * Only visible when align is set to 'alternate'
   */
  opposite?: string;

  /**
   * Optional custom data for template access
   * Can store any additional metadata about the timeline item
   */
  data?: unknown;
}
