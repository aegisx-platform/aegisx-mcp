/**
 * Field display component types
 * Defines types for displaying data in read-only format
 */

/**
 * Supported field types for automatic formatting
 */
export type FieldType =
  | 'text' // Plain text (default)
  | 'date' // Date format: 25 Dec 2024
  | 'datetime' // DateTime format: 25 Dec 2024, 14:30
  | 'time' // Time format: 14:30
  | 'currency' // Currency format: ฿1,234.56
  | 'number' // Number format: 1,234.56
  | 'percentage' // Percentage format: 45.5%
  | 'email' // Email with mailto link
  | 'phone' // Phone number with tel link
  | 'url' // URL with hyperlink
  | 'boolean'; // Boolean: Yes/No or True/False

/**
 * Field display size variants
 */
export type FieldDisplaySize = 'sm' | 'md' | 'lg';

/**
 * Field display orientation/layout
 */
export type FieldDisplayOrientation = 'horizontal' | 'vertical';

/**
 * How to display empty/null/undefined values
 */
export type EmptyStateDisplay = 'dash' | 'text' | 'placeholder';

/**
 * Currency code for formatting
 */
export type CurrencyCode = 'THB' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY';

/**
 * Date format variants
 */
export type DateFormat =
  | 'short' // 25/12/2024
  | 'medium' // 25 Dec 2024
  | 'long' // 25 December 2024
  | 'full'; // Thursday, 25 December 2024

/**
 * Time format variants
 */
export type TimeFormat =
  | '12h' // 2:30 PM
  | '24h'; // 14:30

/**
 * Boolean display format
 */
export type BooleanFormat =
  | 'yes-no' // Yes/No
  | 'true-false' // True/False
  | 'on-off'; // On/Off

/**
 * Options for field formatting
 */
export interface FieldFormatOptions {
  /** Currency code for currency type */
  currency?: CurrencyCode;

  /** Date format for date/datetime types */
  dateFormat?: DateFormat;

  /** Time format for time/datetime types */
  timeFormat?: TimeFormat;

  /** Boolean display format */
  booleanFormat?: BooleanFormat;

  /** Number of decimal places for number/currency */
  decimals?: number;

  /** Locale for formatting (default: 'th-TH') */
  locale?: string;

  /** Prefix for the value (e.g., '+' for positive numbers) */
  prefix?: string;

  /** Suffix for the value (e.g., 'items' for quantities) */
  suffix?: string;
}

/**
 * Configuration for empty state display
 */
export interface EmptyStateConfig {
  /** How to display empty values */
  display: EmptyStateDisplay;

  /** Custom text for empty values (when display is 'text') */
  text?: string;

  /** Custom CSS class for empty state */
  class?: string;

  /** Whether to show placeholder text */
  showPlaceholder?: boolean;
}
