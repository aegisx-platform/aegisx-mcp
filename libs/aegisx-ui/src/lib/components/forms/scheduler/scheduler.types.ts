/**
 * Scheduler Component Type Definitions
 *
 * Type definitions for the AegisX date and time scheduler component.
 * Combines date picker and time slot selection for appointment booking
 * and event scheduling use cases.
 */

// ============================================================================
// Scheduler Layout & Size
// ============================================================================

/**
 * Scheduler component layout mode
 *
 * Controls the arrangement of date picker and time slots:
 * - horizontal: Date picker and time slots side by side
 * - vertical: Date picker above time slots
 * - stacked: Compact stacked layout for mobile
 */
export type SchedulerLayout = 'horizontal' | 'vertical' | 'stacked';

/**
 * Scheduler component display size
 *
 * Controls the overall size of the scheduler:
 * - sm: Small, compact scheduler
 * - md: Medium, default size
 * - lg: Large, spacious scheduler
 */
export type SchedulerSize = 'sm' | 'md' | 'lg';

// ============================================================================
// Scheduler Data Structures
// ============================================================================

/**
 * Scheduler selected value
 *
 * Represents a complete date and time selection.
 * Both date and time are optional until user completes selection.
 *
 * @example
 * const value: SchedulerValue = {
 *   date: new Date('2024-03-15'),
 *   time: "14:30"
 * };
 */
export interface SchedulerValue {
  /** Selected date (null if not yet selected) */
  date: Date | null;

  /** Selected time in HH:mm format (null if not yet selected) */
  time: string | null;
}

/**
 * Scheduler availability configuration
 *
 * Defines available time slots for each date.
 * Used for appointment booking where availability varies by date.
 *
 * @example
 * const availability: SchedulerAvailability = {
 *   "2024-03-15": ["09:00", "10:00", "14:00", "15:00"],
 *   "2024-03-16": ["09:00", "09:30", "10:00"], // Weekend - limited hours
 *   "2024-03-17": [] // Fully booked or unavailable
 * };
 */
export interface SchedulerAvailability {
  /**
   * Date string to available time slots mapping
   *
   * Key: Date in YYYY-MM-DD format
   * Value: Array of available time slots in HH:mm format
   */
  [dateString: string]: string[];
}
