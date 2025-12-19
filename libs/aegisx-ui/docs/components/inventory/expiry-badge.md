# Expiry Badge Component

A compact, color-coded badge for displaying product expiry dates with countdown and status indicators.

## Features

- **Color-Coded Status**: Visual indication of expiry urgency (safe, warning, critical, expired)
- **Countdown Display**: Shows days/hours until expiry
- **Compact Mode**: Icon-only display for tables
- **Customizable Thresholds**: Configure warning and critical periods
- **Multiple Sizes**: Small, medium, large variants
- **Style Variants**: Soft, outlined, solid
- **Accessible**: Full ARIA support and keyboard navigation
- **Clickable**: Optional click event for detailed info

## Installation

```typescript
import { AxExpiryBadgeComponent } from '@aegisx/ui';
```

## Basic Usage

```html
<ax-expiry-badge [expiryDate]="productExpiryDate" (onClick)="showExpiryDetails()" />
```

## API Reference

### Inputs

| Property       | Type                              | Default      | Description                                |
| -------------- | --------------------------------- | ------------ | ------------------------------------------ |
| `expiryDate`   | `Date`                            | **required** | Product expiry date                        |
| `warningDays`  | `number`                          | `30`         | Days before expiry to show warning status  |
| `criticalDays` | `number`                          | `7`          | Days before expiry to show critical status |
| `size`         | `'sm' \| 'md' \| 'lg'`            | `'md'`       | Badge size                                 |
| `variant`      | `'soft' \| 'outlined' \| 'solid'` | `'soft'`     | Visual style                               |
| `compact`      | `boolean`                         | `false`      | Show icon only (for tables)                |
| `showIcon`     | `boolean`                         | `true`       | Display status icon                        |
| `showText`     | `boolean`                         | `true`       | Display countdown text                     |

### Outputs

| Event     | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| `onClick` | `void` | Emitted when badge is clicked |

### Types

```typescript
export type ExpiryStatus = 'safe' | 'warning' | 'critical' | 'expired';

export interface ExpiryInfo {
  expiryDate: Date;
  daysUntilExpiry: number;
  status: ExpiryStatus;
  message: string;
}
```

## Examples

### Basic Usage

```html
<ax-expiry-badge [expiryDate]="new Date('2025-12-31')" />
```

Displays: `30 days left` (if current date is December 1, 2025)

### Custom Thresholds

```html
<ax-expiry-badge [expiryDate]="medicineExpiry" [warningDays]="60" [criticalDays]="14" />
```

- **Critical**: ≤14 days (red)
- **Warning**: 15-60 days (yellow)
- **Safe**: >60 days (green)

### Compact Mode for Tables

```html
<mat-table [dataSource]="products">
  <ng-container matColumnDef="expiry">
    <mat-header-cell *matHeaderCellDef>Expiry</mat-header-cell>
    <mat-cell *matCellDef="let product">
      <ax-expiry-badge [expiryDate]="product.expiryDate" [compact]="true" size="sm" />
    </mat-cell>
  </ng-container>
</mat-table>
```

Displays icon-only with tooltip.

### Different Sizes

```html
<!-- Small (20px) -->
<ax-expiry-badge [expiryDate]="date" size="sm" />

<!-- Medium (24px) - Default -->
<ax-expiry-badge [expiryDate]="date" size="md" />

<!-- Large (32px) -->
<ax-expiry-badge [expiryDate]="date" size="lg" />
```

### Style Variants

```html
<!-- Soft (default) - Subtle background -->
<ax-expiry-badge [expiryDate]="date" variant="soft" />

<!-- Outlined - Border only -->
<ax-expiry-badge [expiryDate]="date" variant="outlined" />

<!-- Solid - Filled background -->
<ax-expiry-badge [expiryDate]="date" variant="solid" />
```

### With Click Handler

```html
<ax-expiry-badge [expiryDate]="batch.expiryDate" (onClick)="showBatchDetails(batch)" />
```

```typescript
showBatchDetails(batch: BatchInfo) {
  this.dialog.open(BatchDetailsDialog, { data: batch });
}
```

### Icon and Text Control

```html
<!-- Icon only -->
<ax-expiry-badge [expiryDate]="date" [showText]="false" />

<!-- Text only -->
<ax-expiry-badge [expiryDate]="date" [showIcon]="false" />

<!-- Both (default) -->
<ax-expiry-badge [expiryDate]="date" />
```

## Expiry Status Logic

```typescript
const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

if (daysUntilExpiry < 0) return 'expired';
if (daysUntilExpiry <= criticalDays) return 'critical';
if (daysUntilExpiry <= warningDays) return 'warning';
return 'safe';
```

## Display Text Logic

| Status       | Days Remaining | Display Text            |
| ------------ | -------------- | ----------------------- |
| **Safe**     | >30            | `Expires in 45 days`    |
| **Warning**  | 8-30           | `20 days left`          |
| **Critical** | 1-7            | `3 days left` ⚠️        |
| **Critical** | 0 (today)      | `Expires Today` 🔴      |
| **Critical** | -1 (yesterday) | `Expires Tomorrow` 🔴   |
| **Expired**  | <0             | `Expired 5 days ago` ❌ |

## Color Coding

| Status       | Soft            | Outlined      | Solid                |
| ------------ | --------------- | ------------- | -------------------- |
| **Safe**     | Light green bg  | Green border  | Green bg, white text |
| **Warning**  | Light yellow bg | Yellow border | Yellow bg, dark text |
| **Critical** | Light red bg    | Red border    | Red bg, white text   |
| **Expired**  | Light gray bg   | Gray border   | Gray bg, white text  |

## Accessibility

- **ARIA Labels**: Proper `aria-label` with full expiry information
- **Keyboard**: Clickable badges are keyboard accessible (Tab + Enter)
- **Screen Readers**: Announces expiry status and countdown
- **Tooltips**: Hover/focus shows full expiry date and time
- **Color Contrast**: Meets WCAG 2.1 AA standards

## Best Practices

1. **Set Appropriate Thresholds**: Match your product shelf life and lead times
2. **Use Compact Mode in Tables**: Saves space, shows tooltip on hover
3. **Handle Click Events**: Show detailed batch/product information
4. **Combine with Batch Selector**: Visually indicate batch expiry status
5. **Update Real-Time**: Recalculate on component init and date changes

## Integration with Other Components

### With Batch Selector

```html
<ax-batch-selector productId="PROD-001" [batches]="batches">
  <ng-template #batchCard let-batch>
    <div class="batch-card">
      <h4>{{ batch.batchNumber }}</h4>
      <ax-expiry-badge [expiryDate]="batch.expiryDate" size="sm" />
    </div>
  </ng-template>
</ax-batch-selector>
```

### With Table

```html
<mat-table [dataSource]="inventory">
  <ng-container matColumnDef="batch">
    <mat-header-cell *matHeaderCellDef>Batch</mat-header-cell>
    <mat-cell *matCellDef="let item"> {{ item.batchNumber }} </mat-cell>
  </ng-container>

  <ng-container matColumnDef="expiry">
    <mat-header-cell *matHeaderCellDef>Expiry</mat-header-cell>
    <mat-cell *matCellDef="let item">
      <ax-expiry-badge [expiryDate]="item.expiryDate" [compact]="true" size="sm" />
    </mat-cell>
  </ng-container>
</mat-table>
```

## Performance

- **Render**: <50ms
- **Countdown Calculation**: Real-time, cached
- **Bundle Size**: ~3KB gzipped

## Styling

The component uses CSS variables for theming:

```scss
.ax-expiry-badge {
  --expiry-safe: var(--color-success-500);
  --expiry-warning: var(--color-warning-500);
  --expiry-critical: var(--color-error-500);
  --expiry-expired: var(--color-neutral-500);
}
```

## Related Components

- **AxBatchSelectorComponent**: Select batches with expiry badges
- **AxStockAlertPanelComponent**: Show expiry-related alerts
- **AxStockMovementTimelineComponent**: Track expiry events

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+
