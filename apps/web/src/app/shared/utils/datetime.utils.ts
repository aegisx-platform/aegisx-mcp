/**
 * Datetime utility functions for form handling
 * Handles conversion between ISO strings and HTML5 datetime-local format
 */

/**
 * Converts ISO date string to datetime-local input format (YYYY-MM-DDTHH:mm)
 * Used for populating datetime-local inputs in forms
 *
 * @param isoDateString - ISO 8601 date string (e.g., "2025-09-29T17:00:00.000Z")
 * @returns Formatted string for datetime-local input (e.g., "2025-09-29T17:00")
 */
export function formatDateTimeForInput(isoDateString?: string | null): string {
  if (!isoDateString) return '';

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';

    // Convert to local timezone and format as YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.warn('Failed to format date for input:', isoDateString, error);
    return '';
  }
}

/**
 * Converts datetime-local input format to ISO string for API submission
 * Used when submitting forms with datetime-local inputs
 *
 * @param dateTimeLocalString - datetime-local format (e.g., "2025-09-29T17:00")
 * @returns ISO 8601 date string (e.g., "2025-09-29T17:00:00.000Z")
 */
export function formatDateTimeForSubmission(
  dateTimeLocalString?: string | null,
): string {
  if (!dateTimeLocalString) return '';

  try {
    // Parse the datetime-local format and create Date object
    const date = new Date(dateTimeLocalString);
    if (isNaN(date.getTime())) return '';

    // Convert to ISO string
    return date.toISOString();
  } catch (error) {
    console.warn(
      'Failed to format date for submission:',
      dateTimeLocalString,
      error,
    );
    return '';
  }
}

/**
 * Formats date string to human-readable format for display
 *
 * @param isoDateString - ISO 8601 date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string for display
 */
export function formatDateTimeForDisplay(
  isoDateString?: string | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!isoDateString) return '';

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };

    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.warn('Failed to format date for display:', isoDateString, error);
    return '';
  }
}

/**
 * Formats time-only string for time input fields
 *
 * @param timeString - Time string (e.g., "14:30:00")
 * @returns Formatted time for time input (e.g., "14:30")
 */
export function formatTimeForInput(timeString?: string | null): string {
  if (!timeString) return '';

  try {
    // Extract hours and minutes from time string
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '';
  } catch (error) {
    console.warn('Failed to format time for input:', timeString, error);
    return '';
  }
}

/**
 * Validates if a string is a valid ISO date
 *
 * @param dateString - Date string to validate
 * @returns True if valid ISO date
 */
export function isValidISODate(dateString?: string | null): boolean {
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T');
  } catch {
    return false;
  }
}

/**
 * Converts datetime fields in an object from ISO to datetime-local format
 * Useful for populating forms with multiple datetime fields
 *
 * @param data - Object containing datetime fields
 * @param dateTimeFields - Array of field names that contain datetime values
 * @returns Object with converted datetime fields
 */
export function convertDateTimeFieldsForInput<T extends Record<string, any>>(
  data: T,
  dateTimeFields: (keyof T)[],
): T {
  const converted = { ...data };

  dateTimeFields.forEach((field) => {
    if (converted[field]) {
      converted[field] = formatDateTimeForInput(
        converted[field] as string,
      ) as T[keyof T];
    }
  });

  return converted;
}

/**
 * Converts datetime fields in an object from datetime-local to ISO format
 * Useful for preparing form data for API submission
 *
 * @param data - Object containing datetime-local fields
 * @param dateTimeFields - Array of field names that contain datetime-local values
 * @returns Object with converted datetime fields
 */
export function convertDateTimeFieldsForSubmission<
  T extends Record<string, any>,
>(data: T, dateTimeFields: (keyof T)[]): T {
  const converted = { ...data };

  dateTimeFields.forEach((field) => {
    if (converted[field]) {
      converted[field] = formatDateTimeForSubmission(
        converted[field] as string,
      ) as T[keyof T];
    }
  });

  return converted;
}
