# Stock Level Indicator Component

A visual indicator component for displaying inventory stock levels with color-coded warnings and progress bars.

## Features

- **Visual Progress Bar**: Animated progress indicator showing current stock vs maximum
- **Color-Coded Status**: Traffic light or gradient color schemes
- **Warning Thresholds**: Configurable minimum/maximum thresholds with visual alerts
- **Size Variants**: Small, medium, and large sizes
- **Responsive**: Works across all screen sizes
- **Accessible**: Full ARIA support and keyboard navigation

## Installation

```typescript
import { AxStockLevelComponent } from '@aegisx/ui';
```

## Basic Usage

```html
<ax-stock-level [current]="150" [minimum]="50" [maximum]="500" [unit]="'pieces'" />
```

## API Reference

### Inputs

| Property         | Type                            | Default           | Description                                |
| ---------------- | ------------------------------- | ----------------- | ------------------------------------------ |
| `current`        | `number`                        | **required**      | Current stock quantity                     |
| `minimum`        | `number`                        | **required**      | Minimum stock threshold (triggers warning) |
| `maximum`        | `number`                        | **required**      | Maximum stock capacity                     |
| `unit`           | `string`                        | `'pieces'`        | Unit of measurement display label          |
| `size`           | `'sm' \| 'md' \| 'lg'`          | `'md'`            | Component size variant                     |
| `showLabel`      | `boolean`                       | `true`            | Show stock quantity label                  |
| `showPercentage` | `boolean`                       | `true`            | Show percentage indicator                  |
| `colorScheme`    | `'traffic-light' \| 'gradient'` | `'traffic-light'` | Color coding scheme                        |

### Outputs

| Event            | Type                     | Description                                     |
| ---------------- | ------------------------ | ----------------------------------------------- |
| `onWarningClick` | `StockLevelWarningEvent` | Emitted when low stock warning badge is clicked |

### Types

```typescript
export type StockLevelSize = 'sm' | 'md' | 'lg';
export type StockLevelColorScheme = 'traffic-light' | 'gradient';

export interface StockLevelWarningEvent {
  level: 'low' | 'critical';
  current: number;
  minimum: number;
}
```

## Examples

### Traffic Light Color Scheme (Default)

```html
<ax-stock-level [current]="400" [minimum]="100" [maximum]="500" [unit]="'units'" colorScheme="traffic-light" />
```

**Color Logic:**

- **Green (≥75%)**: Stock is optimal
- **Yellow (25-74%)**: Stock is moderate
- **Red (<25%)**: Stock is low

### Gradient Color Scheme

```html
<ax-stock-level [current]="250" [minimum]="50" [maximum]="500" colorScheme="gradient" />
```

Displays a smooth gradient from red (low) → yellow (medium) → green (high).

### Compact Size for Tables

```html
<ax-stock-level [current]="75" [minimum]="20" [maximum]="100" [unit]="'kg'" size="sm" [showLabel]="false" />
```

### Handling Low Stock Warnings

```html
<ax-stock-level [current]="30" [minimum]="50" [maximum]="500" (onWarningClick)="handleLowStock($event)" />
```

```typescript
handleLowStock(event: StockLevelWarningEvent) {
  console.log(`Low stock alert: ${event.current}/${event.minimum}`);
  // Trigger reorder workflow, send notification, etc.
}
```

## Accessibility

- **ARIA Labels**: Proper `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Role**: Progress bar uses `role="progressbar"`
- **Keyboard**: Warning badge is keyboard accessible (Tab + Enter)
- **Screen Readers**: Announces stock levels and warnings

## Styling

The component uses CSS variables for theming:

```scss
.ax-stock-level {
  --stock-level-height-sm: 8px;
  --stock-level-height-md: 12px;
  --stock-level-height-lg: 16px;
  --stock-level-success: var(--color-success-500);
  --stock-level-warning: var(--color-warning-500);
  --stock-level-error: var(--color-error-500);
}
```

## Best Practices

1. **Set Meaningful Thresholds**: Configure `minimum` based on lead time and demand
2. **Use Appropriate Units**: Choose clear, business-relevant units (pieces, boxes, kg, etc.)
3. **Handle Warning Events**: Implement `onWarningClick` to trigger reorder workflows
4. **Choose Right Size**: Use `sm` for dense tables, `md` for cards, `lg` for dashboards
5. **Accessibility**: Ensure sufficient color contrast for colorblind users

## Related Components

- **AxQuantityInputComponent**: For entering stock quantities
- **AxBatchSelectorComponent**: For batch-level stock tracking
- **AxStockAlertPanelComponent**: For system-wide stock alerts

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+
