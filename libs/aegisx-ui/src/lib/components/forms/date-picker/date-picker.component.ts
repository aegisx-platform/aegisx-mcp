import {
  Component,
  ElementRef,
  HostListener,
  Input,
  forwardRef,
  inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerLocale = 'en' | 'th';
export type DatePickerCalendar = 'gregorian' | 'buddhist';
export type DatePickerMonthFormat = 'full' | 'short';
export type DatePickerMode = 'single' | 'range';

/**
 * Date range value structure for range mode
 */
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  // Range mode properties
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  isInRange?: boolean;
  isRangeHover?: boolean;
}

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

const THAI_WEEKDAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ENGLISH_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

@Component({
  selector: 'ax-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxDatePickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AxDatePickerComponent),
      multi: true,
    },
  ],
})
export class AxDatePickerComponent
  implements ControlValueAccessor, Validator, OnChanges
{
  @Input() label = '';
  @Input() placeholder = 'Select date';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() size: DatePickerSize = 'md';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() locale: DatePickerLocale = 'en';
  @Input() calendar: DatePickerCalendar = 'gregorian';
  @Input() monthFormat: DatePickerMonthFormat = 'full';
  @Input() firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0; // 0 = Sunday, 1 = Monday, etc.
  @Input() dateFormat?: string; // Custom date format (e.g., 'DD/MM/YYYY', 'MM-DD-YYYY', 'DD MMM YYYY')
  @Input() showActionButtons = false; // Show Today and Clear buttons in calendar footer
  @Input() mode: DatePickerMode = 'single'; // Single date or date range mode

  value: Date | DateRange | null = null;

  // Range mode state
  rangeSelectionState: 'start' | 'end' = 'start';
  hoverDate: Date | null = null;
  isOpen = false;
  focused = false;
  viewMode: 'day' | 'month' | 'year' = 'day';
  focusedDate: Date | null = null; // Track keyboard navigation focus

  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  years: number[] = [];

  get weekDays(): string[] {
    const days =
      this.locale === 'th'
        ? THAI_WEEKDAYS_SHORT
        : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Rotate array based on firstDayOfWeek
    // e.g., if firstDayOfWeek = 1 (Monday), rotate: ['Su', 'Mo', ...] -> ['Mo', 'Tu', ..., 'Su']
    return [
      ...days.slice(this.firstDayOfWeek),
      ...days.slice(0, this.firstDayOfWeek),
    ];
  }

  get months(): string[] {
    if (this.locale === 'th') {
      return this.monthFormat === 'short' ? THAI_MONTHS_SHORT : THAI_MONTHS;
    } else {
      if (this.monthFormat === 'short') {
        return [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
      } else {
        return [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
      }
    }
  }

  // Helper getters for type-safe value access
  get isRangeMode(): boolean {
    return this.mode === 'range';
  }

  get rangeValue(): DateRange | null {
    if (!this.isRangeMode || !this.value) return null;
    return this.value as DateRange;
  }

  get singleValue(): Date | null {
    if (this.isRangeMode || !this.value) return null;
    return this.value as Date;
  }

  private elementRef = inject(ElementRef);

  private onChange = (_value: unknown) => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private onTouched = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private onValidatorChange = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.generateCalendar();
    this.generateYears();
  }

  toggleViewMode(): void {
    if (this.viewMode === 'day') {
      this.viewMode = 'month';
    } else if (this.viewMode === 'month') {
      this.viewMode = 'year';
    } else {
      this.viewMode = 'day';
    }
  }

  selectMonth(monthIndex: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      monthIndex,
      1,
    );
    this.viewMode = 'day';
    this.generateCalendar();
  }

  selectYear(year: number): void {
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.viewMode = 'month';
    this.generateYears();
  }

  previousYearRange(): void {
    const currentYear = this.currentMonth.getFullYear();
    this.currentMonth = new Date(
      currentYear - 12,
      this.currentMonth.getMonth(),
      1,
    );
    this.generateYears();
  }

  nextYearRange(): void {
    const currentYear = this.currentMonth.getFullYear();
    this.currentMonth = new Date(
      currentYear + 12,
      this.currentMonth.getMonth(),
      1,
    );
    this.generateYears();
  }

  private generateYears(): void {
    const currentYear = this.currentMonth.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    this.years = Array.from({ length: 12 }, (_, i) => startYear + i);
  }

  get containerClasses(): string {
    return 'ax-date-picker-container';
  }

  get wrapperClasses(): string {
    const classes = ['ax-date-picker-wrapper'];
    classes.push(`ax-date-picker-wrapper-${this.size}`);
    if (this.focused) classes.push('ax-date-picker-wrapper-focused');
    if (this.disabled) classes.push('ax-date-picker-wrapper-disabled');
    if (this.readonly) classes.push('ax-date-picker-wrapper-readonly');
    if (this.errorMessage) classes.push('ax-date-picker-wrapper-error');
    return classes.join(' ');
  }

  get displayMessage(): string {
    return this.errorMessage || this.helperText;
  }

  get displayValue(): string {
    if (!this.value) return '';

    if (this.mode === 'single') {
      return this.formatDate(this.value as Date);
    } else {
      // Range mode
      const range = this.value as DateRange;
      if (!range.startDate && !range.endDate) return '';

      if (range.startDate && !range.endDate) {
        // Only start date selected
        return `${this.formatDate(range.startDate)} - ...`;
      }

      if (range.startDate && range.endDate) {
        // Both dates selected
        return `${this.formatDate(range.startDate)} - ${this.formatDate(range.endDate)}`;
      }

      return '';
    }
  }

  get currentMonthYear(): string {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    if (this.locale === 'th') {
      const displayYear = this.calendar === 'buddhist' ? year + 543 : year;
      return `${THAI_MONTHS[month]} ${displayYear}`;
    }

    return this.currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  toggleDropdown(): void {
    if (this.disabled || this.readonly) return;
    const wasOpen = this.isOpen;
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.focused = true;

      // Initialize focused date for keyboard navigation
      if (this.mode === 'single') {
        this.focusedDate = this.singleValue || new Date();
        if (this.singleValue) {
          this.currentMonth = new Date(
            this.singleValue.getFullYear(),
            this.singleValue.getMonth(),
            1,
          );
        }
      } else {
        // Range mode: focus on start date or today
        const range = this.rangeValue;
        this.focusedDate = range?.startDate || new Date();
        if (range?.startDate) {
          this.currentMonth = new Date(
            range.startDate.getFullYear(),
            range.startDate.getMonth(),
            1,
          );
        }

        // ALWAYS reset range selection state when opening dropdown
        // This ensures we always start fresh from selecting the start date
        this.rangeSelectionState = 'start';
        this.hoverDate = null;

        // Clear partial range (only startDate without endDate)
        // This prevents confusion when reopening with incomplete selection
        if (range?.startDate && !range?.endDate) {
          this.value = null;
        }
      }

      this.generateCalendar();
    } else if (wasOpen) {
      // Closing dropdown - mark as touched
      this.focused = false;
      this.onTouched();
    }
  }

  selectDate(day: CalendarDay): void {
    if (day.isDisabled) return;

    if (this.mode === 'single') {
      // Single mode: select date and close
      this.value = day.date;
      this.onChange(this.value);
      this.onTouched();
      this.isOpen = false;
      this.focused = false;
    } else {
      // Range mode: dual-click selection
      this.selectRangeDate(day.date);
    }

    this.generateCalendar();
    this.cdr.detectChanges(); // Force change detection
  }

  private selectRangeDate(date: Date): void {
    // Normalize date to date-only (remove time component)
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const currentRange = this.rangeValue || { startDate: null, endDate: null };

    // First click - select start date
    // Always treat as first click if no start date exists
    if (!currentRange.startDate || this.rangeSelectionState === 'start') {
      this.value = { startDate: normalizedDate, endDate: null };
      this.rangeSelectionState = 'end';
      this.onChange(this.value);
      // Keep dropdown OPEN for second selection
      return;
    }

    // Second click - select end date
    // Only reach here if startDate exists AND state is 'end'
    const normalizedStart = new Date(currentRange.startDate.getTime());
    normalizedStart.setHours(0, 0, 0, 0);

    if (normalizedDate.getTime() < normalizedStart.getTime()) {
      // If end date is before start, swap them
      this.value = { startDate: normalizedDate, endDate: normalizedStart };
    } else {
      this.value = { ...currentRange, endDate: normalizedDate };
    }

    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false; // Close after complete range selection
    this.focused = false;
    this.rangeSelectionState = 'start'; // Reset for next selection
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1,
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1,
    );
    this.generateCalendar();
  }

  clearValue(): void {
    this.value = null;
    this.onChange(null);
    this.onTouched();

    // Reset range selection state
    if (this.isRangeMode) {
      this.rangeSelectionState = 'start';
      this.hoverDate = null;
    }

    this.generateCalendar();
  }

  selectToday(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today is within min/max range
    if (this.isDateDisabled(today)) {
      return; // Don't select if today is disabled
    }

    if (this.mode === 'single') {
      // Single mode: select today
      this.value = today;
      this.onChange(this.value);
      this.onTouched();
      this.isOpen = false;
      this.focused = false;
    } else {
      // Range mode: set both start and end to today (same day range)
      this.value = { startDate: today, endDate: today };
      this.onChange(this.value);
      this.onTouched();
      this.rangeSelectionState = 'start';
      this.isOpen = false;
      this.focused = false;
    }

    this.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.viewMode = 'day';
    this.generateCalendar();
  }

  // Keyboard Navigation Methods
  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
    } else if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.isOpen = false;
      this.focused = false;
      this.onTouched(); // Mark as touched when closing with Escape
    } else if (event.key === 'ArrowDown' && !this.isOpen) {
      event.preventDefault();
      this.toggleDropdown();
    }
  }

  onCalendarKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    const key = event.key;

    // Close calendar
    if (key === 'Escape') {
      event.preventDefault();
      this.isOpen = false;
      this.focused = false;
      this.onTouched(); // Mark as touched when closing with Escape
      return;
    }

    // Handle different view modes
    if (this.viewMode === 'day') {
      this.handleDayViewKeydown(event);
    } else if (this.viewMode === 'month') {
      this.handleMonthViewKeydown(event);
    } else if (this.viewMode === 'year') {
      this.handleYearViewKeydown(event);
    }
  }

  private handleDayViewKeydown(event: KeyboardEvent): void {
    const key = event.key;

    // Initialize focused date if not set
    if (!this.focusedDate) {
      if (this.mode === 'single') {
        this.focusedDate = this.singleValue || new Date();
      } else {
        const range = this.rangeValue;
        this.focusedDate = range?.startDate || new Date();
      }
    }

    const currentDate = new Date(this.focusedDate!);
    let newDate: Date | null = null;

    switch (key) {
      case 'ArrowLeft':
        event.preventDefault();
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        break;

      case 'ArrowRight':
        event.preventDefault();
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        break;

      case 'ArrowDown':
        event.preventDefault();
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        break;

      case 'PageUp':
        event.preventDefault();
        if (event.shiftKey) {
          // Shift+PageUp: Previous year
          newDate = new Date(currentDate);
          newDate.setFullYear(currentDate.getFullYear() - 1);
        } else {
          // PageUp: Previous month
          this.previousMonth();
          newDate = new Date(this.focusedDate!);
        }
        break;

      case 'PageDown':
        event.preventDefault();
        if (event.shiftKey) {
          // Shift+PageDown: Next year
          newDate = new Date(currentDate);
          newDate.setFullYear(currentDate.getFullYear() + 1);
        } else {
          // PageDown: Next month
          this.nextMonth();
          newDate = new Date(this.focusedDate!);
        }
        break;

      case 'Home':
        event.preventDefault();
        newDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        break;

      case 'End':
        event.preventDefault();
        newDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        );
        break;

      case 'Enter':
      case ' ': {
        event.preventDefault();
        const day = this.calendarDays.find(
          (d) =>
            this.focusedDate && d.date.getTime() === this.focusedDate.getTime(),
        );
        if (day && !day.isDisabled) {
          this.selectDate(day);
        }
        return;
      }
    }

    if (newDate) {
      this.focusedDate = newDate;

      // Update current month if focused date is in different month
      if (
        newDate.getMonth() !== this.currentMonth.getMonth() ||
        newDate.getFullYear() !== this.currentMonth.getFullYear()
      ) {
        this.currentMonth = new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          1,
        );
      }

      this.generateCalendar();
    }
  }

  private handleMonthViewKeydown(event: KeyboardEvent): void {
    const key = event.key;
    const currentMonth = this.currentMonth.getMonth();
    let newMonth = currentMonth;

    switch (key) {
      case 'ArrowLeft':
        event.preventDefault();
        newMonth = (currentMonth - 1 + 12) % 12;
        break;

      case 'ArrowRight':
        event.preventDefault();
        newMonth = (currentMonth + 1) % 12;
        break;

      case 'ArrowUp':
        event.preventDefault();
        newMonth = (currentMonth - 3 + 12) % 12;
        break;

      case 'ArrowDown':
        event.preventDefault();
        newMonth = (currentMonth + 3) % 12;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectMonth(currentMonth);
        return;

      case 'PageUp':
        event.preventDefault();
        this.currentMonth = new Date(
          this.currentMonth.getFullYear() - 1,
          this.currentMonth.getMonth(),
          1,
        );
        this.generateCalendar();
        return;

      case 'PageDown':
        event.preventDefault();
        this.currentMonth = new Date(
          this.currentMonth.getFullYear() + 1,
          this.currentMonth.getMonth(),
          1,
        );
        this.generateCalendar();
        return;
    }

    if (newMonth !== currentMonth) {
      this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        newMonth,
        1,
      );
      this.generateCalendar();
    }
  }

  private handleYearViewKeydown(event: KeyboardEvent): void {
    const key = event.key;
    const currentYear = this.currentMonth.getFullYear();
    let newYear = currentYear;

    switch (key) {
      case 'ArrowLeft':
        event.preventDefault();
        newYear = currentYear - 1;
        break;

      case 'ArrowRight':
        event.preventDefault();
        newYear = currentYear + 1;
        break;

      case 'ArrowUp':
        event.preventDefault();
        newYear = currentYear - 3;
        break;

      case 'ArrowDown':
        event.preventDefault();
        newYear = currentYear + 3;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectYear(currentYear);
        return;

      case 'PageUp':
        event.preventDefault();
        this.previousYearRange();
        return;

      case 'PageDown':
        event.preventDefault();
        this.nextYearRange();
        return;
    }

    if (newYear !== currentYear) {
      this.currentMonth = new Date(newYear, this.currentMonth.getMonth(), 1);

      // Update year range if needed
      const startYear = Math.floor(newYear / 12) * 12;
      const currentStartYear = Math.floor(currentYear / 12) * 12;
      if (startYear !== currentStartYear) {
        this.generateYears();
      }
    }
  }

  private generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.calendarDays = [];

    // Calculate offset based on configured first day of week
    // e.g., if month starts on Wednesday (3) and firstDayOfWeek is Monday (1),
    // we need 2 days from previous month (Monday, Tuesday)
    const adjustedOffset = (firstDayOfWeek - this.firstDayOfWeek + 7) % 7;

    // Previous month days
    for (let i = adjustedOffset - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }

    // Next month days
    const remainingDays = 42 - this.calendarDays.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const baseDay: CalendarDay = {
      date: dateOnly,
      day: date.getDate(),
      isCurrentMonth,
      isToday: dateOnly.getTime() === today.getTime(),
      isSelected: false,
      isDisabled: this.isDateDisabled(dateOnly),
      isFocused: this.focusedDate
        ? dateOnly.getTime() === new Date(this.focusedDate).setHours(0, 0, 0, 0)
        : false,
    };

    if (this.mode === 'single') {
      // Single mode: simple selection
      baseDay.isSelected = this.singleValue
        ? dateOnly.getTime() === new Date(this.singleValue).setHours(0, 0, 0, 0)
        : false;
    } else {
      // Range mode: calculate range properties
      const range = this.rangeValue;
      if (range) {
        const startTime = range.startDate
          ? new Date(range.startDate).setHours(0, 0, 0, 0)
          : null;
        const endTime = range.endDate
          ? new Date(range.endDate).setHours(0, 0, 0, 0)
          : null;
        const currentTime = dateOnly.getTime();

        baseDay.isRangeStart = startTime === currentTime;
        baseDay.isRangeEnd = endTime === currentTime;
        baseDay.isInRange =
          startTime && endTime
            ? currentTime >= startTime && currentTime <= endTime
            : false;

        // Hover preview (when start selected but not end)
        if (startTime && !endTime && this.hoverDate) {
          const hoverTime = new Date(this.hoverDate).setHours(0, 0, 0, 0);
          const minTime = Math.min(startTime, hoverTime);
          const maxTime = Math.max(startTime, hoverTime);
          baseDay.isRangeHover =
            currentTime >= minTime && currentTime <= maxTime;
        }
      }
    }

    return baseDay;
  }

  private isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  // Hover preview handlers for range mode
  onDayHover(day: CalendarDay): void {
    if (this.mode === 'range' && this.rangeSelectionState === 'end') {
      this.hoverDate = day.date;
      this.generateCalendar();
    }
  }

  onDayHoverEnd(): void {
    if (this.mode === 'range') {
      this.hoverDate = null;
      this.generateCalendar();
    }
  }

  private formatDate(date: Date): string {
    // If custom format is provided, use it
    if (this.dateFormat) {
      return this.formatWithCustomPattern(date, this.dateFormat);
    }

    // Otherwise, use default locale-based formatting
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (this.locale === 'th') {
      const displayYear = this.calendar === 'buddhist' ? year + 543 : year;
      const monthName = THAI_MONTHS[month];
      return `${day} ${monthName} ${displayYear}`;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format date with custom pattern
   * Supported tokens:
   * - DD: Day with leading zero (01-31)
   * - D: Day without leading zero (1-31)
   * - MM: Month with leading zero (01-12)
   * - M: Month without leading zero (1-12)
   * - MMM: Short month name (Jan, ม.ค., etc.)
   * - MMMM: Full month name (January, มกราคม, etc.)
   * - YYYY: Full year (2024, 2567 for Buddhist)
   * - YY: 2-digit year (24, 67 for Buddhist)
   */
  private formatWithCustomPattern(date: Date, format: string): string {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const displayYear = this.calendar === 'buddhist' ? year + 543 : year;

    const monthNamesShort =
      this.locale === 'th' ? THAI_MONTHS_SHORT : ENGLISH_MONTHS_SHORT;
    const monthNamesFull = this.locale === 'th' ? THAI_MONTHS : ENGLISH_MONTHS;

    // Use a single regex that matches all tokens (longest first) to avoid conflicts
    const tokenMap: Record<string, string> = {
      MMMM: monthNamesFull[month],
      MMM: monthNamesShort[month],
      MM: (month + 1).toString().padStart(2, '0'),
      M: (month + 1).toString(),
      YYYY: displayYear.toString(),
      YY: (displayYear % 100).toString().padStart(2, '0'),
      DD: day.toString().padStart(2, '0'),
      D: day.toString(),
    };

    // Replace all tokens in one pass, matching longest patterns first
    return format.replace(
      /MMMM|MMM|MM|M|YYYY|YY|DD|D/g,
      (match) => tokenMap[match] || match,
    );
  }

  getDateAriaLabel(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (this.locale === 'th') {
      const displayYear = this.calendar === 'buddhist' ? year + 543 : year;
      const monthName = THAI_MONTHS[month];
      return `${day} ${monthName} ${displayYear}`;
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      const wasOpen = this.isOpen;
      this.isOpen = false;
      this.focused = false;

      // Mark as touched when dropdown closes due to outside click
      if (wasOpen) {
        this.onTouched();
      }
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | DateRange | null): void {
    this.value = value;

    if (this.mode === 'single' && value) {
      const date = value as Date;
      this.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    } else if (this.mode === 'range' && value) {
      const range = value as DateRange;
      if (range.startDate) {
        this.currentMonth = new Date(
          range.startDate.getFullYear(),
          range.startDate.getMonth(),
          1,
        );
      }
    }

    // Only regenerate calendar if dropdown is open
    // This prevents unnecessary re-renders during range selection
    if (this.isOpen) {
      this.generateCalendar();
    }
  }

  registerOnChange(fn: (_value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Validator implementation
  validate(_control: AbstractControl): ValidationErrors | null {
    const errors: ValidationErrors = {};

    if (this.mode === 'single') {
      // Single mode validation
      if (this.required && !this.value) {
        errors['required'] = true;
      }

      if (this.value && this.minDate) {
        const valueDate = new Date(this.value as Date);
        const minDate = new Date(this.minDate);
        valueDate.setHours(0, 0, 0, 0);
        minDate.setHours(0, 0, 0, 0);

        if (valueDate < minDate) {
          errors['minDate'] = {
            minDate: this.formatDate(this.minDate),
            actual: this.formatDate(this.value as Date),
          };
        }
      }

      if (this.value && this.maxDate) {
        const valueDate = new Date(this.value as Date);
        const maxDate = new Date(this.maxDate);
        valueDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);

        if (valueDate > maxDate) {
          errors['maxDate'] = {
            maxDate: this.formatDate(this.maxDate),
            actual: this.formatDate(this.value as Date),
          };
        }
      }
    } else {
      // Range mode validation
      const range = this.rangeValue;

      if (this.required && (!range || !range.startDate || !range.endDate)) {
        errors['required'] = true;
      }

      if (range && range.startDate && range.endDate) {
        // Validate start is before or equal to end
        const startTime = new Date(range.startDate).setHours(0, 0, 0, 0);
        const endTime = new Date(range.endDate).setHours(0, 0, 0, 0);

        if (startTime > endTime) {
          errors['invalidRange'] = {
            reason: 'Start date must be before or equal to end date',
          };
        }

        // Validate against min/max dates
        if (this.minDate) {
          const minTime = new Date(this.minDate).setHours(0, 0, 0, 0);
          if (startTime < minTime) {
            errors['minDate'] = {
              minDate: this.formatDate(this.minDate),
              actual: this.formatDate(range.startDate),
            };
          }
        }

        if (this.maxDate) {
          const maxTime = new Date(this.maxDate).setHours(0, 0, 0, 0);
          if (endTime > maxTime) {
            errors['maxDate'] = {
              maxDate: this.formatDate(this.maxDate),
              actual: this.formatDate(range.endDate),
            };
          }
        }
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // OnChanges implementation - trigger validation when constraints change
  ngOnChanges(changes: SimpleChanges): void {
    const constraintChanges = ['required', 'minDate', 'maxDate'];
    const hasConstraintChange = constraintChanges.some(
      (key) => changes[key] && !changes[key].firstChange,
    );

    if (hasConstraintChange) {
      this.onValidatorChange();
    }
  }
}
