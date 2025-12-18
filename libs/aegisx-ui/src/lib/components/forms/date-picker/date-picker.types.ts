/**
 * Date Picker Component Type Definitions
 *
 * Type definitions for the AegisX date picker component.
 * Supports both Gregorian and Buddhist calendars with English and Thai locales.
 */

// ============================================================================
// Date Picker Size & Display
// ============================================================================

/**
 * Date picker component display size
 *
 * Controls the visual size of the date picker:
 * - sm: Small, compact date picker
 * - md: Medium, default size
 */
export type DatePickerSize = 'sm' | 'md';

/**
 * Date picker locale for localization
 *
 * Determines language for month names, day names, and labels:
 * - en: English
 * - th: Thai
 */
export type DatePickerLocale = 'en' | 'th';

/**
 * Date picker calendar system
 *
 * Controls which calendar system is used:
 * - gregorian: Standard Western calendar
 * - buddhist: Thai Buddhist calendar (year + 543)
 */
export type DatePickerCalendar = 'gregorian' | 'buddhist';

/**
 * Month name display format
 *
 * Controls how month names are shown:
 * - full: Full month name (e.g., "January", "มกราคม")
 * - short: Abbreviated month name (e.g., "Jan", "ม.ค.")
 */
export type DatePickerMonthFormat = 'full' | 'short';

/**
 * Date picker display mode
 *
 * Controls how the date picker is presented:
 * - input: Shows as input field with popup calendar
 * - inline: Always-visible inline calendar
 */
export type DatePickerDisplayMode = 'input' | 'inline';

/**
 * Date picker selection mode
 *
 * Controls whether single dates or date ranges can be selected:
 * - single: Select a single date (default)
 * - range: Select a date range (start and end dates)
 */
export type DatePickerMode = 'single' | 'range';

// ============================================================================
// Date Range Data Structure
// ============================================================================

/**
 * Date range value for range mode
 *
 * Represents a selected date range with start and end dates.
 * Used when date picker mode is set to 'range'.
 *
 * @example
 * const range: DateRange = {
 *   start: new Date('2024-03-01'),
 *   end: new Date('2024-03-15')
 * };
 *
 * @see {@link DatePickerMode}
 */
export interface DateRange {
  /** Start date of the range (null if not yet selected) */
  start: Date | null;

  /** End date of the range (null if not yet selected) */
  end: Date | null;
}
