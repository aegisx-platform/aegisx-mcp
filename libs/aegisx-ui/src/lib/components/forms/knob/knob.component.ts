import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { KnobSize, KnobColor } from './knob.types';

/**
 * Knob Component
 *
 * A circular input control for numeric values, controlled by mouse/touch drag.
 * Useful for dashboard gauges, volume controls, and settings.
 *
 * @example
 * // Basic usage
 * <ax-knob [(value)]="volume" [min]="0" [max]="100"></ax-knob>
 *
 * @example
 * // With label and custom color
 * <ax-knob
 *   [(value)]="progress"
 *   [min]="0"
 *   [max]="100"
 *   color="success"
 *   [showValue]="true">
 * </ax-knob>
 *
 * @example
 * // As form control
 * <ax-knob formControlName="brightness" [min]="0" [max]="255"></ax-knob>
 */
@Component({
  selector: 'ax-knob',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxKnobComponent),
      multi: true,
    },
  ],
  template: `
    <div
      #container
      class="ax-knob"
      [class]="'ax-knob--' + size"
      [class.ax-knob--disabled]="disabled"
      [class.ax-knob--readonly]="readonly"
      [class.ax-knob--dragging]="isDragging"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)"
    >
      <svg
        [attr.viewBox]="'0 0 ' + svgSize + ' ' + svgSize"
        class="ax-knob__svg"
      >
        <!-- Background track -->
        <circle
          class="ax-knob__track"
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          fill="none"
          [attr.stroke-width]="strokeWidth"
        />

        <!-- Progress arc -->
        <circle
          class="ax-knob__progress"
          [class]="'ax-knob__progress--' + color"
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          fill="none"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          [attr.transform]="
            'rotate(' + startAngle + ' ' + center + ' ' + center + ')'
          "
        />
      </svg>

      <!-- Center content -->
      <div class="ax-knob__content">
        @if (showValue) {
          <span class="ax-knob__value">{{ displayValue }}</span>
        }
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./knob.component.scss'],
})
export class AxKnobComponent implements ControlValueAccessor {
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  /** Current value */
  @Input() value = 0;

  /** Minimum value */
  @Input() min = 0;

  /** Maximum value */
  @Input() max = 100;

  /** Step increment */
  @Input() step = 1;

  /** Component size */
  @Input() size: KnobSize = 'md';

  /** Progress color */
  @Input() color: KnobColor = 'primary';

  /** Show value in center */
  @Input() showValue = true;

  /** Value suffix (e.g., '%', 'dB') */
  @Input() valueSuffix = '';

  /** Disable interaction */
  @Input() disabled = false;

  /** Read-only mode */
  @Input() readonly = false;

  /** Starting angle (degrees, 0 = top) */
  @Input() startAngle = -135;

  /** Arc angle (degrees) */
  @Input() arcAngle = 270;

  /** Emits when value changes */
  @Output() valueChange = new EventEmitter<number>();

  isDragging = false;
  private centerX = 0;
  private centerY = 0;

  // For ControlValueAccessor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: number) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  // SVG calculations
  get svgSize(): number {
    return this.getSizeValue() + this.strokeWidth;
  }

  get center(): number {
    return this.svgSize / 2;
  }

  get radius(): number {
    return (this.svgSize - this.strokeWidth) / 2;
  }

  get strokeWidth(): number {
    switch (this.size) {
      case 'sm':
        return 6;
      case 'md':
        return 8;
      case 'lg':
        return 10;
      case 'xl':
        return 12;
      default:
        return 8;
    }
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius * (this.arcAngle / 360);
  }

  get dashOffset(): number {
    const progress = (this.value - this.min) / (this.max - this.min);
    return this.circumference * (1 - progress);
  }

  get displayValue(): string {
    return `${Math.round(this.value)}${this.valueSuffix}`;
  }

  private getSizeValue(): number {
    switch (this.size) {
      case 'sm':
        return 60;
      case 'md':
        return 80;
      case 'lg':
        return 100;
      case 'xl':
        return 140;
      default:
        return 80;
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled || this.readonly) return;
    event.preventDefault();
    this.startDrag(event.clientX, event.clientY);
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled || this.readonly) return;
    const touch = event.touches[0];
    this.startDrag(touch.clientX, touch.clientY);
    this.addTouchListeners();
  }

  private startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
    this.updateValue(clientX, clientY);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.updateValue(event.clientX, event.clientY);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.onTouched();
    }
  }

  private onTouchMove = (event: TouchEvent): void => {
    if (!this.isDragging) return;
    event.preventDefault();
    const touch = event.touches[0];
    this.updateValue(touch.clientX, touch.clientY);
  };

  private onTouchEnd = (): void => {
    this.isDragging = false;
    this.onTouched();
    this.removeTouchListeners();
  };

  private updateValue(clientX: number, clientY: number): void {
    const dx = clientX - this.centerX;
    const dy = clientY - this.centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Normalize angle relative to start position
    angle = angle - this.startAngle - 90;
    if (angle < 0) angle += 360;
    if (angle > 360) angle -= 360;

    // Clamp to arc range
    if (angle > this.arcAngle) {
      angle =
        angle < this.arcAngle + (360 - this.arcAngle) / 2 ? this.arcAngle : 0;
    }

    // Calculate value
    const progress = angle / this.arcAngle;
    let newValue = this.min + progress * (this.max - this.min);

    // Apply step
    newValue = Math.round(newValue / this.step) * this.step;

    // Clamp to min/max
    newValue = Math.max(this.min, Math.min(this.max, newValue));

    if (newValue !== this.value) {
      this.value = newValue;
      this.valueChange.emit(this.value);
      this.onChange(this.value);
    }
  }

  private addTouchListeners(): void {
    document.addEventListener('touchmove', this.onTouchMove, {
      passive: false,
    });
    document.addEventListener('touchend', this.onTouchEnd);
  }

  private removeTouchListeners(): void {
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this.value = value ?? this.min;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
