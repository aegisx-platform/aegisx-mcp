import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators for Date Picker reactive forms
 * These can be used with FormControl to add validation
 *
 * @example
 * ```typescript
 * import { dateValidators } from '@aegisx/ui';
 *
 * this.dateControl = new FormControl(null, [
 *   dateValidators.required(),
 *   dateValidators.minDate(new Date('2024-01-01')),
 *   dateValidators.maxDate(new Date('2024-12-31')),
 *   dateValidators.dateRange(minDate, maxDate)
 * ]);
 * ```
 */
export class AxDatePickerValidators {
  /**
   * Validator that requires a date value to be selected
   * @returns Validation error if no date selected, null otherwise
   */
  static required(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || !(value instanceof Date)) {
        return { required: true };
      }
      return null;
    };
  }

  /**
   * Validator that ensures date is not before the specified minimum date
   * @param minDate - The minimum allowed date
   * @returns Validation error if date is before minDate, null otherwise
   */
  static minDate(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty (use required validator separately)
      }

      const valueDate = new Date(value);
      const minDateTime = new Date(minDate);
      valueDate.setHours(0, 0, 0, 0);
      minDateTime.setHours(0, 0, 0, 0);

      if (valueDate < minDateTime) {
        return {
          minDate: {
            minDate: minDate.toISOString(),
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is not after the specified maximum date
   * @param maxDate - The maximum allowed date
   * @returns Validation error if date is after maxDate, null otherwise
   */
  static maxDate(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty (use required validator separately)
      }

      const valueDate = new Date(value);
      const maxDateTime = new Date(maxDate);
      valueDate.setHours(0, 0, 0, 0);
      maxDateTime.setHours(0, 0, 0, 0);

      if (valueDate > maxDateTime) {
        return {
          maxDate: {
            maxDate: maxDate.toISOString(),
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is within a specified range
   * @param minDate - The minimum allowed date
   * @param maxDate - The maximum allowed date
   * @returns Validation error if date is outside range, null otherwise
   */
  static dateRange(minDate: Date, maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty (use required validator separately)
      }

      const valueDate = new Date(value);
      const minDateTime = new Date(minDate);
      const maxDateTime = new Date(maxDate);
      valueDate.setHours(0, 0, 0, 0);
      minDateTime.setHours(0, 0, 0, 0);
      maxDateTime.setHours(0, 0, 0, 0);

      if (valueDate < minDateTime || valueDate > maxDateTime) {
        return {
          dateRange: {
            minDate: minDate.toISOString(),
            maxDate: maxDate.toISOString(),
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is in the future (after today)
   * @returns Validation error if date is not in the future, null otherwise
   */
  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const valueDate = new Date(value);
      const today = new Date();
      valueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (valueDate <= today) {
        return {
          futureDate: {
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is in the past (before today)
   * @returns Validation error if date is not in the past, null otherwise
   */
  static pastDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const valueDate = new Date(value);
      const today = new Date();
      valueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (valueDate >= today) {
        return {
          pastDate: {
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is today
   * @returns Validation error if date is not today, null otherwise
   */
  static today(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const valueDate = new Date(value);
      const today = new Date();
      valueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (valueDate.getTime() !== today.getTime()) {
        return {
          today: {
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is on a specific day of week
   * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
   * @returns Validation error if date is not on specified day, null otherwise
   */
  static dayOfWeek(dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      if (value.getDay() !== dayOfWeek) {
        const days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        return {
          dayOfWeek: {
            expected: days[dayOfWeek],
            actual: days[value.getDay()],
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is not on weekend (Saturday or Sunday)
   * @returns Validation error if date is on weekend, null otherwise
   */
  static noWeekend(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const day = value.getDay();
      if (day === 0 || day === 6) {
        // Sunday or Saturday
        return {
          noWeekend: {
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is on weekend (Saturday or Sunday)
   * @returns Validation error if date is not on weekend, null otherwise
   */
  static weekendOnly(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const day = value.getDay();
      if (day !== 0 && day !== 6) {
        // Not Sunday or Saturday
        return {
          weekendOnly: {
            actual: value.toISOString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures the date represents a minimum age
   * @param minAge - Minimum age in years
   * @returns Validation error if age is less than minAge, null otherwise
   */
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred yet this year
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < minAge) {
        return {
          minAge: {
            required: minAge,
            actual: age,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures the date represents a maximum age
   * @param maxAge - Maximum age in years
   * @returns Validation error if age is greater than maxAge, null otherwise
   */
  static maxAge(maxAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred yet this year
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age > maxAge) {
        return {
          maxAge: {
            required: maxAge,
            actual: age,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator that ensures date is a business day (excludes weekends and optional holidays)
   * @param holidays - Optional array of holiday dates to exclude
   * @returns Validation error if date is not a business day, null otherwise
   */
  static businessDays(holidays: Date[] = []): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      // Check if it's a weekend
      const day = value.getDay();
      if (day === 0 || day === 6) {
        return {
          businessDays: {
            reason: 'weekend',
            actual: value.toISOString(),
          },
        };
      }

      // Check if it's a holiday
      const valueDate = new Date(value);
      valueDate.setHours(0, 0, 0, 0);

      for (const holiday of holidays) {
        const holidayDate = new Date(holiday);
        holidayDate.setHours(0, 0, 0, 0);

        if (valueDate.getTime() === holidayDate.getTime()) {
          return {
            businessDays: {
              reason: 'holiday',
              actual: value.toISOString(),
            },
          };
        }
      }

      return null;
    };
  }

  /**
   * Validator that ensures date follows a specific pattern (e.g., first day of month, last day of month)
   * @param pattern - Pattern type: 'first-of-month' | 'last-of-month' | 'middle-of-month'
   * @returns Validation error if date doesn't match pattern, null otherwise
   */
  static datePattern(
    pattern: 'first-of-month' | 'last-of-month' | 'middle-of-month',
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || !(value instanceof Date)) {
        return null; // Don't validate if empty
      }

      const date = value.getDate();
      const lastDayOfMonth = new Date(
        value.getFullYear(),
        value.getMonth() + 1,
        0,
      ).getDate();

      let isValid = false;

      switch (pattern) {
        case 'first-of-month':
          isValid = date === 1;
          break;
        case 'last-of-month':
          isValid = date === lastDayOfMonth;
          break;
        case 'middle-of-month':
          isValid = date >= 14 && date <= 16;
          break;
      }

      if (!isValid) {
        return {
          datePattern: {
            pattern,
            actual: date,
          },
        };
      }

      return null;
    };
  }
}

// Export as default for convenience
export const dateValidators = AxDatePickerValidators;
