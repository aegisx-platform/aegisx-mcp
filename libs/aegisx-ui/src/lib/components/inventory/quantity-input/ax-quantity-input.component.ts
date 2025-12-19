import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  forwardRef,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  ValidationError,
  ValidationState,
  QuantityUnitConfig,
} from './ax-quantity-input.component.types';

/**
 * Quantity Input Component with Unit Conversion
 * ================================================================
 *
 * A sophisticated quantity input component that supports:
 * - Unit conversion (e.g., boxes to pieces)
 * - Increment/decrement stepper controls
 * - Preset multipliers (×10, ×100)
 * - Min/max validation
 * - Decimal places validation
 * - Integer validation for whole-number units
 * - Reactive Forms integration (ControlValueAccessor)
 *
 * @example
 * ```html
 * <ax-quantity-input
 *   [(value)]="quantity"
 *   [baseUnit]="'pieces'"
 *   [availableUnits]="unitConfigs"
 *   [min]="0"
 *   [max]="1000"
 *   [showStepper]="true"
 *   [showPresets]="true"
 *   (valueChange)="onQuantityChange($event)"
 *   (unitChange)="onUnitChange($event)">
 * </ax-quantity-input>
 * ```
 */
@Component({
  selector: 'ax-quantity-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './ax-quantity-input.component.html',
  styleUrl: './ax-quantity-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxQuantityInputComponent),
      multi: true,
    },
  ],
})
export class AxQuantityInputComponent implements OnInit, ControlValueAccessor {
  // =============================================================================
  // INPUTS (using Angular signals)
  // =============================================================================

  /** Two-way binding for value in base unit */
  value = model.required<number>();

  /** Base unit code (e.g., 'pieces') */
  baseUnit = input.required<string>();

  /** Available units for conversion */
  availableUnits = input.required<QuantityUnitConfig[]>();

  /** Minimum value (in base unit) */
  min = input<number>(0);

  /** Maximum value (in base unit) */
  max = input<number>(Infinity);

  /** Step size for increment/decrement */
  step = input<number>(1);

  /** Show stepper buttons */
  showStepper = input<boolean>(true);

  /** Show preset multiplier buttons */
  showPresets = input<boolean>(false);

  /** Maximum decimal places allowed */
  decimalPlaces = input<number>(0);

  /** Disabled state */
  disabled = input<boolean>(false);

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  /** Emits value changes (in base unit) */
  valueChange = output<number>();

  /** Emits unit changes */
  unitChange = output<string>();

  /** Emits validation state */
  onValidation = output<ValidationState>();

  // =============================================================================
  // INTERNAL STATE
  // =============================================================================

  /** Currently selected unit */
  protected selectedUnit = signal<string>('');

  /** Whether the input has been touched */
  protected isTouched = signal<boolean>(false);

  /** Input field value for manual editing */
  protected inputValue = signal<string>('0');

  // =============================================================================
  // COMPUTED SIGNALS
  // =============================================================================

  /** Get selected unit configuration */
  selectedUnitConfig = computed(() => {
    const units = this.availableUnits();
    const selected = this.selectedUnit();

    if (!units || units.length === 0) {
      return null;
    }

    // Find selected unit or default to first unit (base unit)
    return units.find((u) => u.code === selected) || units[0];
  });

  /** Display value in selected unit */
  displayValue = computed(() => {
    const val = this.value();
    const unit = this.selectedUnitConfig();

    if (!unit || unit.conversionRate === 0) return val;

    // Convert from base unit to display unit
    return val / unit.conversionRate;
  });

  /** Conversion hint text */
  conversionHint = computed(() => {
    const val = this.value();
    const baseUnit = this.baseUnit();
    const currentUnit = this.selectedUnit();

    if (currentUnit === baseUnit || !currentUnit) return '';

    const config = this.selectedUnitConfig();
    if (!config) return '';

    return `= ${val} ${baseUnit}  (${config.conversionRate} ${baseUnit} per ${config.label})`;
  });

  /** Validation errors */
  validationErrors = computed(() => {
    const val = this.value();
    const errors: ValidationError[] = [];

    // Min validation
    if (val < this.min()) {
      errors.push({
        type: 'min',
        message: `Minimum value is ${this.min()}`,
      });
    }

    // Max validation
    if (val > this.max()) {
      errors.push({
        type: 'max',
        message: `Maximum value is ${this.max()}`,
      });
    }

    // Decimal places validation
    const dp = this.decimalPlaces();
    const decimals = (val.toString().split('.')[1] || '').length;
    if (decimals > dp) {
      errors.push({
        type: 'decimal',
        message: `Maximum ${dp} decimal places allowed`,
      });
    }

    // Integer validation for whole-number units
    const baseUnitConfig = this.availableUnits().find(
      (u) => u.code === this.baseUnit(),
    );
    if (baseUnitConfig?.decimalPlaces === 0 && !Number.isInteger(val)) {
      errors.push({
        type: 'integer',
        message: `${this.baseUnit()} must be a whole number`,
      });
    }

    return errors;
  });

  /** Whether the value is valid */
  isValid = computed(() => this.validationErrors().length === 0);

  /** Whether increment button is disabled */
  canIncrement = computed(() => {
    return !this.disabled() && this.value() < this.max();
  });

  /** Whether decrement button is disabled */
  canDecrement = computed(() => {
    return !this.disabled() && this.value() > this.min();
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  ngOnInit(): void {
    // Initialize selected unit to base unit
    const baseUnit = this.baseUnit();
    if (baseUnit) {
      this.selectedUnit.set(baseUnit);
    }
    // Initialize input display
    this.updateInputDisplay();
  }

  // =============================================================================
  // PUBLIC METHODS
  // =============================================================================

  /** Increment value by step */
  increment(): void {
    if (!this.canIncrement()) return;

    const currentDisplay = this.displayValue();
    const step = this.step();
    const newDisplay = currentDisplay + step;

    const newValue = this.convertToBaseUnit(newDisplay, this.selectedUnit());
    this.updateValue(newValue);
  }

  /** Decrement value by step */
  decrement(): void {
    if (!this.canDecrement()) return;

    const currentDisplay = this.displayValue();
    const step = this.step();
    const min = this.convertFromBaseUnit(this.min(), this.selectedUnit());
    const newDisplay = Math.max(currentDisplay - step, min);

    const newValue = this.convertToBaseUnit(newDisplay, this.selectedUnit());
    this.updateValue(newValue);
  }

  /** Multiply value by preset multiplier */
  multiplyValue(multiplier: number): void {
    if (this.disabled()) return;
    const newValue = this.value() * multiplier;
    this.updateValue(newValue);
  }

  /** Handle unit change from dropdown */
  onUnitChange(newUnit: string): void {
    this.selectedUnit.set(newUnit);
    this.unitChange.emit(newUnit);
    // Update input value display
    this.updateInputDisplay();
  }

  /** Handle manual input change */
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const displayValue = parseFloat(input.value) || 0;
    const baseValue = this.convertToBaseUnit(displayValue, this.selectedUnit());
    this.updateValue(baseValue);
  }

  /** Handle input blur (touch) */
  onBlur(): void {
    this.isTouched.set(true);
    this.onTouched();
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /** Update value with validation and clamping */
  private updateValue(newValue: number): void {
    const min = this.min();
    const max = this.max();

    // Clamp value to min/max
    const clampedValue = Math.max(min, Math.min(max, newValue));

    // Round to decimal places
    const dp = this.decimalPlaces();
    const roundedValue =
      Math.round(clampedValue * Math.pow(10, dp)) / Math.pow(10, dp);

    // Update value
    this.value.set(roundedValue);
    this.valueChange.emit(roundedValue);
    this.onChange(roundedValue);

    // Update input display
    this.updateInputDisplay();

    // Emit validation state
    this.onValidation.emit({
      valid: this.isValid(),
      errors: this.validationErrors(),
    });
  }

  /** Update input field display value */
  private updateInputDisplay(): void {
    const displayVal = this.displayValue();
    const unit = this.selectedUnitConfig();
    const dp = unit?.decimalPlaces ?? 0;

    // Format to correct decimal places
    this.inputValue.set(displayVal.toFixed(dp));
  }

  /** Convert from display unit to base unit */
  private convertToBaseUnit(displayValue: number, fromUnit: string): number {
    const unitConfig = this.availableUnits().find((u) => u.code === fromUnit);
    if (!unitConfig || unitConfig.conversionRate === 0) return displayValue;

    // Multiply by conversion rate to get base unit
    return displayValue * unitConfig.conversionRate;
  }

  /** Convert from base unit to display unit */
  convertFromBaseUnit(baseValue: number, toUnit: string): number {
    const unitConfig = this.availableUnits().find((u) => u.code === toUnit);
    if (!unitConfig || unitConfig.conversionRate === 0) return baseValue;

    // Divide by conversion rate to get display unit
    return baseValue / unitConfig.conversionRate;
  }

  // =============================================================================
  // CONTROLVALUEACCESSOR IMPLEMENTATION
  // =============================================================================

  // Callbacks registered by Angular Forms (set via registerOnChange/registerOnTouched)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: number) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    if (value != null) {
      this.value.set(value);
      this.updateInputDisplay();
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Note: disabled is an input signal, we can't directly set it
    // The parent component should control the disabled state
    // This is handled by the disabled input
  }
}
