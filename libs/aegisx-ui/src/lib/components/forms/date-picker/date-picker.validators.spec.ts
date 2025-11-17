import { FormControl } from '@angular/forms';
import {
  AxDatePickerValidators,
  dateValidators,
} from './date-picker.validators';

describe('AxDatePickerValidators', () => {
  describe('required', () => {
    it('should return error when value is null', () => {
      const control = new FormControl(null);
      const validator = dateValidators.required();
      const result = validator(control);

      expect(result).toEqual({ required: true });
    });

    it('should return error when value is not a Date', () => {
      const control = new FormControl('not a date');
      const validator = dateValidators.required();
      const result = validator(control);

      expect(result).toEqual({ required: true });
    });

    it('should return null when value is a valid Date', () => {
      const control = new FormControl(new Date('2024-01-15'));
      const validator = dateValidators.required();
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('minDate', () => {
    const minDate = new Date('2024-01-01');

    it('should return error when date is before minDate', () => {
      const control = new FormControl(new Date('2023-12-31'));
      const validator = dateValidators.minDate(minDate);
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['minDate']).toBeDefined();
    });

    it('should return null when date equals minDate', () => {
      const control = new FormControl(new Date('2024-01-01'));
      const validator = dateValidators.minDate(minDate);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when date is after minDate', () => {
      const control = new FormControl(new Date('2024-01-02'));
      const validator = dateValidators.minDate(minDate);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.minDate(minDate);
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('maxDate', () => {
    const maxDate = new Date('2024-12-31');

    it('should return error when date is after maxDate', () => {
      const control = new FormControl(new Date('2025-01-01'));
      const validator = dateValidators.maxDate(maxDate);
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['maxDate']).toBeDefined();
    });

    it('should return null when date equals maxDate', () => {
      const control = new FormControl(new Date('2024-12-31'));
      const validator = dateValidators.maxDate(maxDate);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when date is before maxDate', () => {
      const control = new FormControl(new Date('2024-12-30'));
      const validator = dateValidators.maxDate(maxDate);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.maxDate(maxDate);
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('dateRange', () => {
    const minDate = new Date('2024-01-01');
    const maxDate = new Date('2024-12-31');

    it('should return error when date is before range', () => {
      const control = new FormControl(new Date('2023-12-31'));
      const validator = dateValidators.dateRange(minDate, maxDate);
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['dateRange']).toBeDefined();
    });

    it('should return error when date is after range', () => {
      const control = new FormControl(new Date('2025-01-01'));
      const validator = dateValidators.dateRange(minDate, maxDate);
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['dateRange']).toBeDefined();
    });

    it('should return null when date is within range', () => {
      const control = new FormControl(new Date('2024-06-15'));
      const validator = dateValidators.dateRange(minDate, maxDate);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when date equals minDate', () => {
      const control = new FormControl(new Date('2024-01-01'));
      const validator = dateValidators.dateRange(minDate, maxDate);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when date equals maxDate', () => {
      const control = new FormControl(new Date('2024-12-31'));
      const validator = dateValidators.dateRange(minDate, maxDate);
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('futureDate', () => {
    it('should return error when date is today', () => {
      const today = new Date();
      const control = new FormControl(today);
      const validator = dateValidators.futureDate();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['futureDate']).toBeDefined();
    });

    it('should return error when date is in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const control = new FormControl(yesterday);
      const validator = dateValidators.futureDate();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['futureDate']).toBeDefined();
    });

    it('should return null when date is in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const control = new FormControl(tomorrow);
      const validator = dateValidators.futureDate();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.futureDate();
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('pastDate', () => {
    it('should return error when date is today', () => {
      const today = new Date();
      const control = new FormControl(today);
      const validator = dateValidators.pastDate();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['pastDate']).toBeDefined();
    });

    it('should return error when date is in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const control = new FormControl(tomorrow);
      const validator = dateValidators.pastDate();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['pastDate']).toBeDefined();
    });

    it('should return null when date is in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const control = new FormControl(yesterday);
      const validator = dateValidators.pastDate();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.pastDate();
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('today', () => {
    it('should return null when date is today', () => {
      const today = new Date();
      const control = new FormControl(today);
      const validator = dateValidators.today();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error when date is yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const control = new FormControl(yesterday);
      const validator = dateValidators.today();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['today']).toBeDefined();
    });

    it('should return error when date is tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const control = new FormControl(tomorrow);
      const validator = dateValidators.today();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['today']).toBeDefined();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.today();
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('dayOfWeek', () => {
    it('should return null when date is on Monday (1)', () => {
      // Find next Monday
      const monday = new Date('2024-01-01'); // This is a Monday
      const control = new FormControl(monday);
      const validator = dateValidators.dayOfWeek(1);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error when date is not on specified day', () => {
      const monday = new Date('2024-01-01'); // Monday
      const control = new FormControl(monday);
      const validator = dateValidators.dayOfWeek(0); // Expecting Sunday
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['dayOfWeek']).toBeDefined();
      expect(result?.['dayOfWeek'].expected).toBe('Sunday');
      expect(result?.['dayOfWeek'].actual).toBe('Monday');
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.dayOfWeek(1);
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('noWeekend', () => {
    it('should return null for weekdays (Monday)', () => {
      const monday = new Date('2024-01-01'); // Monday
      const control = new FormControl(monday);
      const validator = dateValidators.noWeekend();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for weekdays (Friday)', () => {
      const friday = new Date('2024-01-05'); // Friday
      const control = new FormControl(friday);
      const validator = dateValidators.noWeekend();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for Saturday', () => {
      const saturday = new Date('2024-01-06'); // Saturday
      const control = new FormControl(saturday);
      const validator = dateValidators.noWeekend();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['noWeekend']).toBeDefined();
    });

    it('should return error for Sunday', () => {
      const sunday = new Date('2024-01-07'); // Sunday
      const control = new FormControl(sunday);
      const validator = dateValidators.noWeekend();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['noWeekend']).toBeDefined();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.noWeekend();
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('weekendOnly', () => {
    it('should return error for weekdays (Monday)', () => {
      const monday = new Date('2024-01-01'); // Monday
      const control = new FormControl(monday);
      const validator = dateValidators.weekendOnly();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['weekendOnly']).toBeDefined();
    });

    it('should return error for weekdays (Friday)', () => {
      const friday = new Date('2024-01-05'); // Friday
      const control = new FormControl(friday);
      const validator = dateValidators.weekendOnly();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['weekendOnly']).toBeDefined();
    });

    it('should return null for Saturday', () => {
      const saturday = new Date('2024-01-06'); // Saturday
      const control = new FormControl(saturday);
      const validator = dateValidators.weekendOnly();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null for Sunday', () => {
      const sunday = new Date('2024-01-07'); // Sunday
      const control = new FormControl(sunday);
      const validator = dateValidators.weekendOnly();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.weekendOnly();
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('minAge', () => {
    it('should return null when age meets minimum requirement', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 20); // 20 years ago
      const control = new FormControl(birthDate);
      const validator = dateValidators.minAge(18);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error when age is below minimum', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 16); // 16 years ago
      const control = new FormControl(birthDate);
      const validator = dateValidators.minAge(18);
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['minAge']).toBeDefined();
      expect(result?.['minAge'].required).toBe(18);
      expect(result?.['minAge'].actual).toBe(16);
    });

    it('should handle birthday edge case correctly', () => {
      const today = new Date();
      const birthDate = new Date(today);
      birthDate.setFullYear(birthDate.getFullYear() - 18);
      birthDate.setDate(birthDate.getDate() + 1); // Birthday is tomorrow

      const control = new FormControl(birthDate);
      const validator = dateValidators.minAge(18);
      const result = validator(control);

      expect(result).not.toBeNull(); // Should be 17, not 18 yet
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.minAge(18);
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('maxAge', () => {
    it('should return null when age is below maximum', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30); // 30 years ago
      const control = new FormControl(birthDate);
      const validator = dateValidators.maxAge(65);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error when age exceeds maximum', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 70); // 70 years ago
      const control = new FormControl(birthDate);
      const validator = dateValidators.maxAge(65);
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['maxAge']).toBeDefined();
      expect(result?.['maxAge'].required).toBe(65);
      expect(result?.['maxAge'].actual).toBe(70);
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.maxAge(65);
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('businessDays', () => {
    it('should return null for weekdays without holidays', () => {
      const monday = new Date('2024-01-01'); // Monday
      const control = new FormControl(monday);
      const validator = dateValidators.businessDays();
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return error for Saturday', () => {
      const saturday = new Date('2024-01-06'); // Saturday
      const control = new FormControl(saturday);
      const validator = dateValidators.businessDays();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['businessDays']).toBeDefined();
      expect(result?.['businessDays'].reason).toBe('weekend');
    });

    it('should return error for Sunday', () => {
      const sunday = new Date('2024-01-07'); // Sunday
      const control = new FormControl(sunday);
      const validator = dateValidators.businessDays();
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['businessDays']).toBeDefined();
      expect(result?.['businessDays'].reason).toBe('weekend');
    });

    it('should return error for holidays', () => {
      const newYear = new Date('2024-01-01'); // New Year (Monday, but marked as holiday)
      const control = new FormControl(newYear);
      const validator = dateValidators.businessDays([newYear]);
      const result = validator(control);

      expect(result).not.toBeNull();
      expect(result?.['businessDays']).toBeDefined();
      expect(result?.['businessDays'].reason).toBe('holiday');
    });

    it('should return null for weekdays not in holiday list', () => {
      const tuesday = new Date('2024-01-02'); // Tuesday
      const newYear = new Date('2024-01-01'); // Monday (different day)
      const control = new FormControl(tuesday);
      const validator = dateValidators.businessDays([newYear]);
      const result = validator(control);

      expect(result).toBeNull();
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.businessDays();
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  describe('datePattern', () => {
    describe('first-of-month', () => {
      it('should return null for first day of month', () => {
        const firstDay = new Date('2024-01-01');
        const control = new FormControl(firstDay);
        const validator = dateValidators.datePattern('first-of-month');
        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return error for other days', () => {
        const secondDay = new Date('2024-01-02');
        const control = new FormControl(secondDay);
        const validator = dateValidators.datePattern('first-of-month');
        const result = validator(control);

        expect(result).not.toBeNull();
        expect(result?.['datePattern']).toBeDefined();
        expect(result?.['datePattern'].pattern).toBe('first-of-month');
        expect(result?.['datePattern'].actual).toBe(2);
      });
    });

    describe('last-of-month', () => {
      it('should return null for last day of month (31 days)', () => {
        const lastDay = new Date('2024-01-31');
        const control = new FormControl(lastDay);
        const validator = dateValidators.datePattern('last-of-month');
        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return null for last day of February (leap year)', () => {
        const lastDay = new Date('2024-02-29');
        const control = new FormControl(lastDay);
        const validator = dateValidators.datePattern('last-of-month');
        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return error for other days', () => {
        const notLastDay = new Date('2024-01-30');
        const control = new FormControl(notLastDay);
        const validator = dateValidators.datePattern('last-of-month');
        const result = validator(control);

        expect(result).not.toBeNull();
        expect(result?.['datePattern']).toBeDefined();
      });
    });

    describe('middle-of-month', () => {
      it('should return null for 14th', () => {
        const day14 = new Date('2024-01-14');
        const control = new FormControl(day14);
        const validator = dateValidators.datePattern('middle-of-month');
        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return null for 15th', () => {
        const day15 = new Date('2024-01-15');
        const control = new FormControl(day15);
        const validator = dateValidators.datePattern('middle-of-month');
        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return null for 16th', () => {
        const day16 = new Date('2024-01-16');
        const control = new FormControl(day16);
        const validator = dateValidators.datePattern('middle-of-month');
        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return error for 13th', () => {
        const day13 = new Date('2024-01-13');
        const control = new FormControl(day13);
        const validator = dateValidators.datePattern('middle-of-month');
        const result = validator(control);

        expect(result).not.toBeNull();
        expect(result?.['datePattern']).toBeDefined();
      });

      it('should return error for 17th', () => {
        const day17 = new Date('2024-01-17');
        const control = new FormControl(day17);
        const validator = dateValidators.datePattern('middle-of-month');
        const result = validator(control);

        expect(result).not.toBeNull();
        expect(result?.['datePattern']).toBeDefined();
      });
    });

    it('should return null when value is empty', () => {
      const control = new FormControl(null);
      const validator = dateValidators.datePattern('first-of-month');
      const result = validator(control);

      expect(result).toBeNull();
    });
  });

  // Test that the class is exported correctly
  describe('exports', () => {
    it('should export AxDatePickerValidators class', () => {
      expect(AxDatePickerValidators).toBeDefined();
    });

    it('should export dateValidators as alias', () => {
      expect(dateValidators).toBeDefined();
      expect(dateValidators).toBe(AxDatePickerValidators);
    });
  });
});
