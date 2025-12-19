# Quantity Input Component

A specialized numeric input component for inventory quantities with unit conversion, validation, and stepper controls.

## Features

- **Unit Conversion**: Automatic conversion between units (pieces, boxes, kg, etc.)
- **Stepper Controls**: Increment/decrement buttons
- **Preset Multipliers**: Quick ×10, ×100 buttons
- **Smart Validation**: Min/max, decimal places, integer-only validation
- **Angular Forms Integration**: Implements `ControlValueAccessor`
- **Conversion Hints**: Real-time display of converted values
- **Responsive**: Works on mobile and desktop
- **Accessible**: Full keyboard navigation and screen reader support

## Installation

```typescript
import { AxQuantityInputComponent } from '@aegisx/ui';
```

## Basic Usage

### Standalone (Two-Way Binding)

```html
<ax-quantity-input [(value)]="quantity" baseUnit="pieces" [availableUnits]="units" />
```

```typescript
quantity = 100;

units: UnitConfig[] = [
  { code: 'pieces', label: 'Pieces', conversionRate: 1, decimalPlaces: 0 },
  { code: 'box', label: 'Box (12 pcs)', conversionRate: 12, decimalPlaces: 0 },
  { code: 'carton', label: 'Carton (144 pcs)', conversionRate: 144, decimalPlaces: 0 }
];
```

### With Reactive Forms

```html
<form [formGroup]="form">
  <ax-quantity-input formControlName="quantity" baseUnit="kg" [availableUnits]="weightUnits" [min]="0" [max]="1000" />
</form>
```

```typescript
form = this.fb.group({
  quantity: [50, [Validators.required, Validators.min(0)]],
});
```

## API Reference

### Inputs

| Property         | Type           | Default      | Description                                              |
| ---------------- | -------------- | ------------ | -------------------------------------------------------- |
| `value`          | `number`       | **required** | Quantity value (in base unit) - supports two-way binding |
| `baseUnit`       | `string`       | **required** | Base unit code (e.g., 'pieces', 'kg')                    |
| `availableUnits` | `UnitConfig[]` | **required** | Available units for conversion                           |
| `min`            | `number`       | `0`          | Minimum allowed value                                    |
| `max`            | `number`       | `Infinity`   | Maximum allowed value                                    |
| `step`           | `number`       | `1`          | Increment/decrement step size                            |
| `showStepper`    | `boolean`      | `true`       | Show +/- buttons                                         |
| `showPresets`    | `boolean`      | `false`      | Show ×10, ×100 preset buttons                            |
| `decimalPlaces`  | `number`       | `0`          | Maximum decimal places allowed                           |
| `disabled`       | `boolean`      | `false`      | Disable input                                            |

### Outputs

| Event          | Type              | Description                            |
| -------------- | ----------------- | -------------------------------------- |
| `valueChange`  | `number`          | Emitted when value changes (base unit) |
| `unitChange`   | `string`          | Emitted when selected unit changes     |
| `onValidation` | `ValidationState` | Emitted when validation state changes  |

### Types

```typescript
export interface UnitConfig {
  code: string; // Unit identifier
  label: string; // Display name
  conversionRate: number; // Conversion to base unit
  decimalPlaces: number; // Allowed decimal places
  symbol?: string; // Optional unit symbol
}

export interface ValidationError {
  type: 'min' | 'max' | 'decimal' | 'integer';
  message: string;
}

export interface ValidationState {
  valid: boolean;
  errors: ValidationError[];
}
```

## Examples

### Weight with Decimal Places

```typescript
weightUnits: UnitConfig[] = [
  { code: 'g', label: 'Grams', conversionRate: 1, decimalPlaces: 2 },
  { code: 'kg', label: 'Kilograms', conversionRate: 1000, decimalPlaces: 3 },
  { code: 'ton', label: 'Tons', conversionRate: 1000000, decimalPlaces: 3 }
];
```

```html
<ax-quantity-input [(value)]="weight" baseUnit="g" [availableUnits]="weightUnits" [min]="0" [max]="100000" [decimalPlaces]="2" />
```

### With Preset Multipliers (Bulk Entry)

```html
<ax-quantity-input [(value)]="bulkQuantity" baseUnit="pieces" [availableUnits]="units" [showPresets]="true" [step]="10" />
```

User can click ×10 or ×100 to quickly multiply the current value.

### Min/Max Validation

```html
<ax-quantity-input [(value)]="orderQty" baseUnit="pieces" [availableUnits]="units" [min]="10" [max]="1000" (onValidation)="handleValidation($event)" />
```

```typescript
handleValidation(state: ValidationState) {
  if (!state.valid) {
    console.error('Validation errors:', state.errors);
  }
}
```

### Integer-Only Quantities

```typescript
units: UnitConfig[] = [
  { code: 'pieces', label: 'Pieces', conversionRate: 1, decimalPlaces: 0 },
  { code: 'box', label: 'Box', conversionRate: 12, decimalPlaces: 0 }
];
```

```html
<ax-quantity-input [(value)]="qty" baseUnit="pieces" [availableUnits]="units" />
```

Component automatically validates that base unit values are integers.

### With Conversion Hint

```html
<ax-quantity-input
  [(value)]="quantity"
  baseUnit="pieces"
  [availableUnits]="[
    { code: 'pieces', label: 'Pieces', conversionRate: 1, decimalPlaces: 0 },
    { code: 'box', label: 'Box', conversionRate: 12, decimalPlaces: 0 }
  ]"
/>
```

When user selects "Box" and enters 5, the component displays:

```
5 Box
= 60 pieces (12 pieces per Box)
```

## Unit Conversion Logic

### How It Works

1. **Internal Storage**: All values stored in **base unit**
2. **Display Conversion**: Converted to selected unit for display
3. **Input Conversion**: User input converted back to base unit
4. **Validation**: Applied to base unit value

### Example Flow

```
Base Unit: pieces
Available Units:
- pieces (rate: 1)
- box (rate: 12)

User selects "box" and enters 5
→ Display: 5 box
→ Internal: 60 pieces (5 × 12)
→ Emitted value: 60
```

### Conversion Formula

```typescript
// Display value = Base value ÷ Conversion rate
displayValue = baseValue / selectedUnit.conversionRate;

// Base value = Display value × Conversion rate
baseValue = displayValue * selectedUnit.conversionRate;
```

## Validation Rules

| Rule        | Description                    | Example                               |
| ----------- | ------------------------------ | ------------------------------------- |
| **Min**     | Value ≥ minimum                | `min="10"` requires qty ≥ 10          |
| **Max**     | Value ≤ maximum                | `max="1000"` requires qty ≤ 1000      |
| **Decimal** | Decimal places ≤ allowed       | `decimalPlaces="2"` allows 10.25      |
| **Integer** | Base unit must be whole number | `decimalPlaces="0"` requires integers |

## Integration with Angular Forms

### Template-Driven Forms

```html
<form #form="ngForm">
  <ax-quantity-input name="quantity" [(ngModel)]="quantity" [baseUnit]="'pieces'" [availableUnits]="units" required />
</form>
```

### Reactive Forms with Validators

```typescript
form = this.fb.group({
  quantity: [100, [Validators.required, Validators.min(10), Validators.max(1000)]],
});
```

```html
<form [formGroup]="form">
  <ax-quantity-input formControlName="quantity" baseUnit="pieces" [availableUnits]="units" />

  @if (form.get('quantity')?.errors) {
  <mat-error> @if (form.get('quantity')?.errors?.['min']) { Minimum quantity is 10 } @if (form.get('quantity')?.errors?.['max']) { Maximum quantity is 1000 } </mat-error>
  }
</form>
```

## Accessibility

- **Keyboard**: Full keyboard navigation (Tab, Arrow keys, Enter)
- **Screen Readers**:
  - Input has proper `aria-label`
  - Value changes announced via `aria-live`
  - Validation errors announced
- **Focus**: Clear focus indicators
- **Labels**: Associated labels for all controls

## Best Practices

1. **Choose Logical Units**: Use units familiar to your users (pieces, boxes, kg)
2. **Set Appropriate Decimal Places**: Match business requirements (0 for countable items, 2-3 for weights)
3. **Configure Min/Max**: Prevent unrealistic quantities
4. **Use Stepper for Small Adjustments**: Enable `showStepper` for fine-tuning
5. **Use Presets for Bulk**: Enable `showPresets` for warehouse operations
6. **Validate on Submit**: Combine with form validators for complete validation

## Performance

- **Render**: <100ms
- **Unit Conversion**: Real-time, no lag
- **Bundle Size**: ~8KB gzipped

## Related Components

- **AxBarcodeScannerComponent**: Scan products before entering quantity
- **AxBatchSelectorComponent**: Select batch after entering quantity
- **AxStockLevelComponent**: Display available stock limits

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+
