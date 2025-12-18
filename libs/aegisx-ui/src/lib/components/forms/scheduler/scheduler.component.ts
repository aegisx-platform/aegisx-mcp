import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AxDatePickerComponent, DatePickerLocale } from '../date-picker';
import {
  AxTimeSlotsComponent,
  TimeSlot,
  TimeSlotConfig,
  TimeSlotSize,
  TimeSlotFormat,
  TimeSlotLocale,
  TimeSlotLayout,
} from '../time-slots';
import type {
  SchedulerLayout,
  SchedulerSize,
  SchedulerValue,
  SchedulerAvailability,
} from './scheduler.types';

@Component({
  selector: 'ax-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AxDatePickerComponent,
    AxTimeSlotsComponent,
  ],
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxSchedulerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AxSchedulerComponent),
      multi: true,
    },
  ],
})
export class AxSchedulerComponent
  implements ControlValueAccessor, Validator, OnInit, OnChanges
{
  @Input() label = '';
  @Input() dateLabel = '';
  @Input() timeLabel = '';
  @Input() layout: SchedulerLayout = 'horizontal';
  @Input() size: SchedulerSize = 'md';
  @Input() timeFormat: TimeSlotFormat = '12h';
  @Input() locale: TimeSlotLocale = 'en';
  @Input() columns = 4; // Time slots grid columns
  @Input() timeSlotsLayout: TimeSlotLayout = 'grid'; // Time slots layout: 'grid' or 'list'
  @Input() disabled = false;
  @Input() required = false;
  @Input() helperText = '';
  @Input() errorMessage = '';

  // Date picker options
  @Input() minDate?: Date;
  @Input() maxDate?: Date;

  // Time slots config or custom slots
  @Input() timeConfig?: TimeSlotConfig;
  @Input() timeSlots: TimeSlot[] = [];

  // Availability map: date -> available times
  @Input() availability?: SchedulerAvailability;

  // Auto-select first available time when date changes
  @Input() autoSelectFirstTime = false;

  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() timeChange = new EventEmitter<string | null>();
  @Output() valueChange = new EventEmitter<SchedulerValue>();

  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  currentTimeSlots: TimeSlot[] = [];

  private onChange = (_value: SchedulerValue) => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private onTouched = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private onValidatorChange = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

  ngOnInit(): void {
    this.updateTimeSlots();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['timeConfig'] ||
      changes['timeSlots'] ||
      changes['availability']
    ) {
      this.updateTimeSlots();
    }
  }

  private updateTimeSlots(): void {
    // If custom slots provided, use them
    if (this.timeSlots && this.timeSlots.length > 0) {
      this.currentTimeSlots = this.getAvailableSlots(this.timeSlots);
      return;
    }

    // Generate from config
    this.currentTimeSlots = this.generateTimeSlots();
  }

  private generateTimeSlots(): TimeSlot[] {
    const config: TimeSlotConfig = {
      startTime: '09:00',
      endTime: '17:00',
      interval: 30,
      excludeTimes: [],
      disabledTimes: [],
      ...this.timeConfig,
    };

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = config.startTime!.split(':').map(Number);
    const [endHour, endMinute] = config.endTime!.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      if (!config.excludeTimes?.includes(time)) {
        slots.push({
          time,
          disabled: config.disabledTimes?.includes(time) || false,
          available: !config.disabledTimes?.includes(time),
        });
      }

      currentMinutes += config.interval!;
    }

    return this.getAvailableSlots(slots);
  }

  private getAvailableSlots(slots: TimeSlot[]): TimeSlot[] {
    if (!this.availability || !this.selectedDate) {
      return slots;
    }

    const dateKey = this.formatDateKey(this.selectedDate);
    const availableTimes = this.availability[dateKey];

    if (!availableTimes) {
      // No availability data for this date - mark all as unavailable
      return slots.map((slot) => ({
        ...slot,
        available: false,
      }));
    }

    return slots.map((slot) => ({
      ...slot,
      available: availableTimes.includes(slot.time),
    }));
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateSelect(date: Date | null): void {
    this.selectedDate = date;
    this.updateTimeSlots();

    // Reset time if auto-select is disabled
    if (!this.autoSelectFirstTime) {
      this.selectedTime = null;
    } else if (date) {
      // Auto-select first available time
      const firstAvailable = this.currentTimeSlots.find(
        (slot) => slot.available !== false && !slot.disabled,
      );
      this.selectedTime = firstAvailable?.time || null;
    }

    this.emitChanges();
    this.dateChange.emit(date);
  }

  onTimeSelect(time: string | string[]): void {
    this.selectedTime = typeof time === 'string' ? time : time[0] || null;
    this.emitChanges();
    this.timeChange.emit(this.selectedTime);
  }

  private emitChanges(): void {
    const value: SchedulerValue = {
      date: this.selectedDate,
      time: this.selectedTime,
    };

    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  get layoutClasses(): string {
    const classes = ['ax-scheduler'];
    classes.push(`ax-scheduler-${this.layout}`);
    classes.push(`ax-scheduler-${this.size}`);
    if (this.disabled) classes.push('ax-scheduler-disabled');
    return classes.join(' ');
  }

  get datePickerSize(): 'sm' | 'md' {
    return this.size === 'lg' ? 'md' : 'sm';
  }

  get timeSlotsSize(): TimeSlotSize {
    return this.size;
  }

  get datePickerLocale(): DatePickerLocale {
    return this.locale as DatePickerLocale;
  }

  get displayMessage(): string {
    return this.errorMessage || this.helperText;
  }

  get hasSelection(): boolean {
    return this.selectedDate !== null && this.selectedTime !== null;
  }

  get formattedSelection(): string {
    if (!this.hasSelection) return '';

    const dateStr = this.selectedDate!.toLocaleDateString(
      this.locale === 'th' ? 'th-TH' : 'en-US',
      { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
    );

    return `${dateStr}, ${this.formatTimeDisplay(this.selectedTime!)}`;
  }

  private formatTimeDisplay(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    if (this.timeFormat === '24h') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    const period =
      hours >= 12
        ? this.locale === 'th'
          ? 'บ่าย'
          : 'PM'
        : this.locale === 'th'
          ? 'เช้า'
          : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // ControlValueAccessor
  writeValue(value: SchedulerValue | null): void {
    if (value) {
      this.selectedDate = value.date;
      this.selectedTime = value.time;
      this.updateTimeSlots();
    } else {
      this.selectedDate = null;
      this.selectedTime = null;
    }
  }

  registerOnChange(fn: (value: SchedulerValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Validator
  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required) {
      if (!this.selectedDate) {
        return { required: true, missingDate: true };
      }
      if (!this.selectedTime) {
        return { required: true, missingTime: true };
      }
    }
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}
