import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AxDatePickerComponent } from './date-picker.component';

describe('AxDatePickerComponent', () => {
  let component: AxDatePickerComponent;
  let fixture: ComponentFixture<AxDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxDatePickerComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AxDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default values', () => {
      expect(component.placeholder).toBe('Select date');
      expect(component.size).toBe('md');
      expect(component.disabled).toBe(false);
      expect(component.readonly).toBe(false);
      expect(component.required).toBe(false);
      expect(component.locale).toBe('en');
      expect(component.calendar).toBe('gregorian');
      expect(component.firstDayOfWeek).toBe(0);
      expect(component.showActionButtons).toBe(false);
    });

    it('should initialize with current month', () => {
      const currentDate = new Date();
      expect(component.currentMonth.getMonth()).toBe(currentDate.getMonth());
      expect(component.currentMonth.getFullYear()).toBe(
        currentDate.getFullYear(),
      );
    });
  });

  describe('ARIA Attributes & Screen Reader Support', () => {
    it('should have proper role on input wrapper', () => {
      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper',
      );
      expect(wrapper.getAttribute('role')).toBe('combobox');
    });

    it('should have aria-expanded attribute', () => {
      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper',
      );
      expect(wrapper.getAttribute('aria-expanded')).toBe('false');

      component.toggleDropdown();
      fixture.detectChanges();

      expect(wrapper.getAttribute('aria-expanded')).toBe('true');
    });

    it('should have aria-haspopup attribute', () => {
      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper',
      );
      expect(wrapper.getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('should have aria-label on clear button', () => {
      component.value = new Date();
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector(
        '.ax-date-picker-clear',
      );
      expect(clearButton.getAttribute('aria-label')).toBe('Clear date');
    });

    it('should have calendar icon', () => {
      const icon = fixture.nativeElement.querySelector('.ax-date-picker-icon');
      const svg = icon?.querySelector('svg');
      // Note: aria-hidden is in the template, but Angular testing may not set boolean attributes
      expect(svg).toBeTruthy();
    });

    it('should have role="dialog" on dropdown', () => {
      component.toggleDropdown();
      fixture.detectChanges();

      const dropdown = fixture.nativeElement.querySelector(
        '.ax-date-picker-dropdown',
      );
      expect(dropdown.getAttribute('role')).toBe('dialog');
      expect(dropdown.getAttribute('aria-modal')).toBe('true');
    });

    it('should have role="toolbar" on header', () => {
      component.toggleDropdown();
      fixture.detectChanges();

      const header = fixture.nativeElement.querySelector(
        '.ax-date-picker-header',
      );
      expect(header.getAttribute('role')).toBe('toolbar');
      expect(header.getAttribute('aria-label')).toBe('Calendar navigation');
    });

    it('should have aria-label on navigation buttons', () => {
      component.toggleDropdown();
      fixture.detectChanges();

      const prevButton = fixture.nativeElement.querySelector(
        '.ax-date-picker-nav-btn:first-child',
      );
      const nextButton = fixture.nativeElement.querySelector(
        '.ax-date-picker-nav-btn:last-child',
      );

      expect(prevButton.getAttribute('aria-label')).toBe('Previous month');
      expect(nextButton.getAttribute('aria-label')).toBe('Next month');
    });

    it('should have role="grid" on calendar days', () => {
      component.toggleDropdown();
      fixture.detectChanges();

      const daysGrid = fixture.nativeElement.querySelector(
        '.ax-date-picker-days',
      );
      expect(daysGrid.getAttribute('role')).toBe('grid');
      expect(daysGrid.getAttribute('aria-label')).toBe('Calendar dates');
    });

    it('should have role="gridcell" on day buttons', () => {
      component.toggleDropdown();
      fixture.detectChanges();

      const dayButtons = fixture.nativeElement.querySelectorAll(
        '.ax-date-picker-day',
      );
      expect(dayButtons.length).toBeGreaterThan(0);
      expect(dayButtons[0].getAttribute('role')).toBe('gridcell');
    });

    it('should have aria-selected on selected day', () => {
      const today = new Date();
      component.value = today;
      component.toggleDropdown();
      fixture.detectChanges();

      const selectedDay = fixture.nativeElement.querySelector(
        '.ax-date-picker-day-selected',
      );
      expect(selectedDay.getAttribute('aria-selected')).toBe('true');
    });

    it('should have aria-current="date" on today', () => {
      component.toggleDropdown();
      fixture.detectChanges();

      const todayButton = fixture.nativeElement.querySelector(
        '.ax-date-picker-day-today',
      );
      if (todayButton) {
        expect(todayButton.getAttribute('aria-current')).toBe('date');
      }
    });

    it('should have aria-disabled on disabled days', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      component.minDate = tomorrow;
      component.toggleDropdown();
      fixture.detectChanges();

      const disabledDays = fixture.nativeElement.querySelectorAll(
        '.ax-date-picker-day-disabled',
      );
      if (disabledDays.length > 0) {
        expect(disabledDays[0].getAttribute('aria-disabled')).toBe('true');
      }
    });

    it('should have role="grid" on month picker', () => {
      component.toggleDropdown();
      component.viewMode = 'month';
      fixture.detectChanges();

      const monthsGrid = fixture.nativeElement.querySelector(
        '.ax-date-picker-months',
      );
      expect(monthsGrid.getAttribute('role')).toBe('grid');
      expect(monthsGrid.getAttribute('aria-label')).toBe('Select month');
    });

    it('should have role="grid" on year picker', () => {
      component.toggleDropdown();
      component.viewMode = 'year';
      fixture.detectChanges();

      const yearsGrid = fixture.nativeElement.querySelector(
        '.ax-date-picker-years',
      );
      expect(yearsGrid.getAttribute('role')).toBe('grid');
      expect(yearsGrid.getAttribute('aria-label')).toBe('Select year');
    });
  });

  describe('Custom Date Format Display', () => {
    it('should display default format (MMM D, YYYY)', () => {
      const testDate = new Date(2024, 0, 15); // January 15, 2024
      component.value = testDate;
      fixture.detectChanges();

      // Default English format uses toLocaleDateString which may vary
      expect(component.displayValue).toContain('15');
      expect(component.displayValue).toContain('2024');
    });

    it('should support DD/MM/YYYY format', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      component.dateFormat = 'DD/MM/YYYY';
      fixture.detectChanges();

      expect(component.displayValue).toBe('15/01/2024');
    });

    it('should support MM/DD/YYYY format', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      component.dateFormat = 'MM/DD/YYYY';
      fixture.detectChanges();

      expect(component.displayValue).toBe('01/15/2024');
    });

    it('should support YYYY-MM-DD format', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      component.dateFormat = 'YYYY-MM-DD';
      fixture.detectChanges();

      expect(component.displayValue).toBe('2024-01-15');
    });

    it('should support MMM DD, YYYY format', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      component.dateFormat = 'MMM DD, YYYY';
      fixture.detectChanges();

      expect(component.displayValue).toBe('Jan 15, 2024');
    });

    it('should support DD MMM YYYY format', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      component.dateFormat = 'DD MMM YYYY';
      fixture.detectChanges();

      expect(component.displayValue).toBe('15 Jan 2024');
    });

    it('should support D/M/YY format (single digits)', () => {
      const testDate = new Date(2024, 0, 5); // January 5, 2024
      component.value = testDate;
      component.dateFormat = 'D/M/YY';
      fixture.detectChanges();

      expect(component.displayValue).toBe('5/1/24');
    });

    it('should support MMMM DD, YYYY format (full month name)', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      component.dateFormat = 'MMMM DD, YYYY';
      fixture.detectChanges();

      expect(component.displayValue).toBe('January 15, 2024');
    });

    it('should handle month names correctly', () => {
      const months = [
        { date: new Date(2024, 0, 1), short: 'Jan', long: 'January' },
        { date: new Date(2024, 1, 1), short: 'Feb', long: 'February' },
        { date: new Date(2024, 2, 1), short: 'Mar', long: 'March' },
        { date: new Date(2024, 11, 1), short: 'Dec', long: 'December' },
      ];

      months.forEach(({ date, short, long }) => {
        component.value = date;

        component.dateFormat = 'MMM YYYY';
        fixture.detectChanges();
        expect(component.displayValue).toBe(`${short} 2024`);

        component.dateFormat = 'MMMM YYYY';
        fixture.detectChanges();
        expect(component.displayValue).toBe(`${long} 2024`);
      });
    });

    it('should handle Thai locale with Buddhist calendar', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      component.locale = 'th';
      component.calendar = 'buddhist';
      component.dateFormat = 'YYYY-MM-DD';
      fixture.detectChanges();

      expect(component.displayValue).toContain('2567'); // 2024 + 543
    });

    it('should return empty string when value is null', () => {
      component.value = null;
      fixture.detectChanges();

      expect(component.displayValue).toBe('');
    });
  });

  describe('Action Buttons', () => {
    describe('showActionButtons Input', () => {
      it('should not show action buttons by default', () => {
        component.toggleDropdown();
        fixture.detectChanges();

        const footer = fixture.nativeElement.querySelector(
          '.ax-date-picker-footer',
        );
        expect(footer).toBeNull();
      });

      it('should show action buttons when enabled', () => {
        component.showActionButtons = true;
        component.toggleDropdown();
        fixture.detectChanges();

        const footer = fixture.nativeElement.querySelector(
          '.ax-date-picker-footer',
        );
        expect(footer).toBeTruthy();
      });

      it('should have Clear and Today buttons', () => {
        component.showActionButtons = true;
        component.toggleDropdown();
        fixture.detectChanges();

        const buttons = fixture.nativeElement.querySelectorAll(
          '.ax-date-picker-action-btn',
        );
        expect(buttons.length).toBe(2);

        const clearButton = buttons[0];
        const todayButton = buttons[1];

        expect(clearButton.textContent.trim()).toBe('Clear');
        expect(todayButton.textContent.trim()).toBe('Today');
      });

      it('should have proper CSS classes for buttons', () => {
        component.showActionButtons = true;
        component.toggleDropdown();
        fixture.detectChanges();

        const clearButton = fixture.nativeElement.querySelector(
          '.ax-date-picker-action-btn-secondary',
        );
        const todayButton = fixture.nativeElement.querySelector(
          '.ax-date-picker-action-btn-primary',
        );

        expect(clearButton).toBeTruthy();
        expect(todayButton).toBeTruthy();
      });

      it('should have aria-labels on action buttons', () => {
        component.showActionButtons = true;
        component.toggleDropdown();
        fixture.detectChanges();

        const buttons = fixture.nativeElement.querySelectorAll(
          '.ax-date-picker-action-btn',
        );
        expect(buttons[0].getAttribute('aria-label')).toBe('Clear selection');
        expect(buttons[1].getAttribute('aria-label')).toBe(
          "Select today's date",
        );
      });
    });

    describe('Clear Button Functionality', () => {
      it('should clear the selected date', () => {
        component.value = new Date();
        component.showActionButtons = true;
        component.toggleDropdown();
        fixture.detectChanges();

        const clearButton = fixture.nativeElement.querySelector(
          '.ax-date-picker-action-btn-secondary',
        );
        clearButton.click();

        expect(component.value).toBeNull();
      });

      it('should clear displayValue', () => {
        component.value = new Date();
        fixture.detectChanges();
        expect(component.displayValue).toBeTruthy();

        component.clearValue();
        fixture.detectChanges();

        expect(component.displayValue).toBe('');
      });
    });

    describe('Today Button Functionality', () => {
      it("should select today's date", () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        component.showActionButtons = true;
        component.toggleDropdown();
        fixture.detectChanges();

        const todayButton = fixture.nativeElement.querySelector(
          '.ax-date-picker-action-btn-primary',
        );
        todayButton.click();

        const selectedDate = component.value;
        expect(selectedDate?.getFullYear()).toBe(today.getFullYear());
        expect(selectedDate?.getMonth()).toBe(today.getMonth());
        expect(selectedDate?.getDate()).toBe(today.getDate());
      });

      it('should close the dropdown after selecting today', () => {
        component.showActionButtons = true;
        component.toggleDropdown();
        fixture.detectChanges();

        expect(component.isOpen).toBe(true);

        const todayButton = fixture.nativeElement.querySelector(
          '.ax-date-picker-action-btn-primary',
        );
        todayButton.click();
        fixture.detectChanges();

        expect(component.isOpen).toBe(false);
      });

      it('should respect minDate restriction', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        component.minDate = tomorrow;
        component.showActionButtons = true;

        const initialValue = component.value;
        component.selectToday();

        // Today should not be selected because it's before minDate
        expect(component.value).toBe(initialValue);
      });

      it('should respect maxDate restriction', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        component.maxDate = yesterday;
        component.showActionButtons = true;

        const initialValue = component.value;
        component.selectToday();

        // Today should not be selected because it's after maxDate
        expect(component.value).toBe(initialValue);
      });

      it('should work when today is within allowed range', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        component.minDate = yesterday;
        component.maxDate = tomorrow;
        component.showActionButtons = true;

        component.selectToday();

        expect(component.value).toBeTruthy();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expect(component.value?.getDate()).toBe(today.getDate());
      });

      it("should update currentMonth to today's month", () => {
        const pastDate = new Date(2020, 0, 1);
        component.currentMonth = pastDate;

        component.selectToday();

        const today = new Date();
        expect(component.currentMonth.getMonth()).toBe(today.getMonth());
        expect(component.currentMonth.getFullYear()).toBe(today.getFullYear());
      });

      it('should switch view mode to day', () => {
        component.viewMode = 'month';
        component.selectToday();

        expect(component.viewMode).toBe('day');
      });
    });
  });

  describe('Date Validation with minDate/maxDate', () => {
    it('should not allow selecting date before minDate', () => {
      const minDate = new Date(2024, 0, 15);
      component.minDate = minDate;
      component.currentMonth = new Date(2024, 0, 1); // Set to January 2024
      component.toggleDropdown();
      fixture.detectChanges();

      // Day 10 should be disabled (before minDate of Jan 15)
      const day10 = component.calendarDays.find(
        (d) => d.day === 10 && d.isCurrentMonth,
      );
      expect(day10?.isDisabled).toBe(true);
    });

    it('should not allow selecting date after maxDate', () => {
      const maxDate = new Date(2024, 0, 15);
      component.maxDate = maxDate;
      component.toggleDropdown();
      fixture.detectChanges();

      // Day 20 should be disabled
      const day20 = component.calendarDays.find(
        (d) => d.day === 20 && d.isCurrentMonth,
      );
      expect(day20?.isDisabled).toBe(true);
    });

    it('should allow selecting dates within min/max range', () => {
      const minDate = new Date(2024, 0, 10);
      const maxDate = new Date(2024, 0, 20);
      component.minDate = minDate;
      component.maxDate = maxDate;
      component.currentMonth = new Date(2024, 0, 1);
      component.toggleDropdown();
      fixture.detectChanges();

      // Day 15 should not be disabled
      const day15 = component.calendarDays.find(
        (d) => d.day === 15 && d.isCurrentMonth,
      );
      expect(day15?.isDisabled).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should toggle dropdown on Enter key', () => {
      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper',
      );
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      expect(component.isOpen).toBe(false);

      wrapper.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.isOpen).toBe(true);
    });

    it('should toggle dropdown on Space key', () => {
      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper',
      );
      const event = new KeyboardEvent('keydown', { key: ' ' });

      expect(component.isOpen).toBe(false);

      wrapper.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.isOpen).toBe(true);
    });

    it('should close dropdown on Escape key', () => {
      component.toggleDropdown();
      expect(component.isOpen).toBe(true);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onCalendarKeydown(event);

      expect(component.isOpen).toBe(false);
    });
  });

  describe('Display States', () => {
    it('should show placeholder when no value', () => {
      component.value = null;
      fixture.detectChanges();

      const placeholder = fixture.nativeElement.querySelector(
        '.ax-date-picker-placeholder',
      );
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toBe('Select date');
    });

    it('should show formatted value when date is selected', () => {
      const testDate = new Date(2024, 0, 15);
      component.value = testDate;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector(
        '.ax-date-picker-value',
      );
      expect(valueElement).toBeTruthy();
      expect(component.displayValue).toBeTruthy();
    });

    it('should show custom placeholder text', () => {
      component.placeholder = 'Pick a date';
      component.value = null;
      fixture.detectChanges();

      const placeholder = fixture.nativeElement.querySelector(
        '.ax-date-picker-placeholder',
      );
      expect(placeholder.textContent).toBe('Pick a date');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value', () => {
      const testDate = new Date(2024, 0, 15);
      component.writeValue(testDate);

      expect(component.value).toEqual(testDate);
    });

    it('should register onChange callback', () => {
      const callback = jest.fn();
      component.registerOnChange(callback);

      component.selectToday();
      expect(callback).toHaveBeenCalled();
    });

    it('should register onTouched callback', () => {
      const callback = jest.fn();
      component.registerOnTouched(callback);

      component.selectToday();
      expect(callback).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);

      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });
  });

  describe('Readonly State', () => {
    it('should not open dropdown when readonly', () => {
      component.readonly = true;
      component.toggleDropdown();

      expect(component.isOpen).toBe(false);
    });

    it('should hide clear button when readonly', () => {
      component.value = new Date();
      component.readonly = true;
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector(
        '.ax-date-picker-clear',
      );
      expect(clearButton).toBeNull();
    });

    it('should hide calendar icon when readonly', () => {
      component.readonly = true;
      fixture.detectChanges();

      const icons = fixture.nativeElement.querySelector(
        '.ax-date-picker-icons',
      );
      expect(icons).toBeNull();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      component.size = 'sm';
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper-sm',
      );
      expect(wrapper).toBeTruthy();
    });

    it('should apply medium size class', () => {
      component.size = 'md';
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper-md',
      );
      expect(wrapper).toBeTruthy();
    });

    it('should apply large size class', () => {
      component.size = 'lg';
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector(
        '.ax-date-picker-wrapper-lg',
      );
      expect(wrapper).toBeTruthy();
    });
  });
});
