/**
 * Time Slots Component Type Definitions
 *
 * Type definitions for the AegisX time slot selection component.
 * Provides interfaces and types for configuring time slot pickers.
 */

// ============================================================================
// Time Slot Size & Layout
// ============================================================================

/**
 * Time slot component display size
 *
 * Controls the visual size of time slot buttons:
 * - sm: Small, compact time slots
 * - md: Medium, default size
 * - lg: Large, prominent time slots
 */
export type TimeSlotSize = 'sm' | 'md' | 'lg';

/**
 * Time slot display layout mode
 *
 * Determines how time slots are arranged:
 * - grid: Multi-column grid layout (default)
 * - list: Single column vertical list
 */
export type TimeSlotLayout = 'grid' | 'list';

/**
 * Time slot selection mode
 *
 * Controls how many time slots can be selected:
 * - single: Only one time slot can be selected
 * - multiple: Multiple time slots can be selected
 */
export type TimeSlotMode = 'single' | 'multiple';

/**
 * Time display format
 *
 * Controls how times are displayed:
 * - 12h: 12-hour format with AM/PM (e.g., "9:00 AM")
 * - 24h: 24-hour format (e.g., "09:00")
 */
export type TimeSlotFormat = '12h' | '24h';

/**
 * Time slot locale for localization
 *
 * Determines language for time labels:
 * - en: English
 * - th: Thai
 */
export type TimeSlotLocale = 'en' | 'th';

// ============================================================================
// Time Slot Data Structures
// ============================================================================

/**
 * Individual time slot configuration
 *
 * Represents a single selectable time slot with optional metadata.
 *
 * @example
 * const slot: TimeSlot = {
 *   time: "09:00",
 *   label: "Morning Session",
 *   available: true,
 *   disabled: false
 * };
 */
export interface TimeSlot {
  /** Time in HH:mm format (e.g., "09:00", "14:30") */
  time: string;

  /** Optional custom label (overrides default time display) */
  label?: string;

  /** Whether the time slot is disabled (shown but not selectable) */
  disabled?: boolean;

  /** Whether the time slot is available for selection */
  available?: boolean;

  /** Optional custom data attached to this time slot */
  data?: unknown;
}

/**
 * Time slot auto-generation configuration
 *
 * Defines parameters for automatically generating time slots
 * at regular intervals within a time range.
 *
 * @example
 * const config: TimeSlotConfig = {
 *   startTime: "09:00",
 *   endTime: "17:00",
 *   interval: 30, // 30-minute intervals
 *   excludeTimes: ["12:00", "12:30"], // Lunch break
 *   disabledTimes: ["16:00", "16:30"] // Late afternoon unavailable
 * };
 */
export interface TimeSlotConfig {
  /** Start time in HH:mm format - default "09:00" */
  startTime?: string;

  /** End time in HH:mm format - default "17:00" */
  endTime?: string;

  /** Interval in minutes between time slots - default 30 */
  interval?: number;

  /** Time slots to completely exclude (won't be shown) */
  excludeTimes?: string[];

  /** Time slots to disable (shown but not selectable) */
  disabledTimes?: string[];
}
