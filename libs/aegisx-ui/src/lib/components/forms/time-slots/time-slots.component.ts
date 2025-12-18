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
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import type {
  TimeSlotSize,
  TimeSlotLayout,
  TimeSlotMode,
  TimeSlotFormat,
  TimeSlotLocale,
  TimeSlot,
  TimeSlotConfig,
} from './time-slots.types';

@Component({
  selector: 'ax-time-slots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-slots.component.html',
  styleUrls: ['./time-slots.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxTimeSlotsComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AxTimeSlotsComponent),
      multi: true,
    },
  ],
})
export class AxTimeSlotsComponent
  implements ControlValueAccessor, Validator, OnInit, OnChanges
{
  @Input() label = '';
  @Input() size: TimeSlotSize = 'md';
  @Input() layout: TimeSlotLayout = 'grid';
  @Input() mode: TimeSlotMode = 'single';
  @Input() timeFormat: TimeSlotFormat = '12h';
  @Input() locale: TimeSlotLocale = 'en';
  @Input() columns = 4; // Grid columns
  @Input() disabled = false;
  @Input() required = false;
  @Input() helperText = '';
  @Input() errorMessage = '';

  // Custom slots (overrides config-generated slots)
  @Input() slots: TimeSlot[] = [];

  // Auto-generate slots from config
  @Input() config?: TimeSlotConfig;

  @Output() slotSelect = new EventEmitter<TimeSlot>();
  @Output() valueChange = new EventEmitter<string | string[]>();

  generatedSlots: TimeSlot[] = [];
  selectedValue: string | string[] | null = null;

  private onChange = (_value: unknown) => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private onTouched = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  private onValidatorChange = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

  ngOnInit(): void {
    this.generateSlots();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] || changes['slots']) {
      this.generateSlots();
    }
  }

  private generateSlots(): void {
    // If custom slots provided, use them
    if (this.slots && this.slots.length > 0) {
      this.generatedSlots = this.slots.map((slot) => ({
        ...slot,
        label: slot.label || this.formatTime(slot.time),
      }));
      return;
    }

    // Generate slots from config
    const config: TimeSlotConfig = {
      startTime: '09:00',
      endTime: '17:00',
      interval: 30,
      excludeTimes: [],
      disabledTimes: [],
      ...this.config,
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
          label: this.formatTime(time),
          disabled: config.disabledTimes?.includes(time) || false,
          available: !config.disabledTimes?.includes(time),
        });
      }

      currentMinutes += config.interval!;
    }

    this.generatedSlots = slots;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    if (this.timeFormat === '24h') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // 12-hour format
    const period =
      hours >= 12
        ? this.locale === 'th'
          ? 'บ่าย'
          : 'PM'
        : this.locale === 'th'
          ? 'เช้า'
          : 'AM';
    const displayHours = hours % 12 || 12;

    if (this.locale === 'th') {
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  selectSlot(slot: TimeSlot): void {
    if (this.disabled || slot.disabled) return;

    if (this.mode === 'single') {
      this.selectedValue = slot.time;
    } else {
      // Multiple selection
      const currentValues = Array.isArray(this.selectedValue)
        ? [...this.selectedValue]
        : [];
      const index = currentValues.indexOf(slot.time);

      if (index === -1) {
        currentValues.push(slot.time);
      } else {
        currentValues.splice(index, 1);
      }

      this.selectedValue = currentValues;
    }

    this.onChange(this.selectedValue);
    this.onTouched();
    this.slotSelect.emit(slot);
    this.valueChange.emit(this.selectedValue as string | string[]);
  }

  isSelected(slot: TimeSlot): boolean {
    if (!this.selectedValue) return false;

    if (this.mode === 'single') {
      return this.selectedValue === slot.time;
    }

    return (
      Array.isArray(this.selectedValue) &&
      this.selectedValue.includes(slot.time)
    );
  }

  getSlotClasses(slot: TimeSlot): string {
    const classes = ['ax-time-slot'];

    classes.push(`ax-time-slot-${this.size}`);

    if (this.isSelected(slot)) {
      classes.push('ax-time-slot-selected');
    }

    if (slot.disabled) {
      classes.push('ax-time-slot-disabled');
    }

    if (slot.available === false) {
      classes.push('ax-time-slot-unavailable');
    }

    return classes.join(' ');
  }

  get containerClasses(): string {
    const classes = ['ax-time-slots-container'];
    classes.push(`ax-time-slots-${this.layout}`);
    if (this.disabled) classes.push('ax-time-slots-disabled');
    return classes.join(' ');
  }

  get gridStyle(): { [key: string]: string } {
    if (this.layout === 'grid') {
      return {
        'grid-template-columns': `repeat(${this.columns}, 1fr)`,
      };
    }
    return {};
  }

  get displayMessage(): string {
    return this.errorMessage || this.helperText;
  }

  // ControlValueAccessor
  writeValue(value: string | string[] | null): void {
    this.selectedValue = value;
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

  // Validator
  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required) {
      if (this.mode === 'single' && !this.selectedValue) {
        return { required: true };
      }
      if (
        this.mode === 'multiple' &&
        (!Array.isArray(this.selectedValue) || this.selectedValue.length === 0)
      ) {
        return { required: true };
      }
    }
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}
