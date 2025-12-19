# Stock Movement Timeline Component

Visual timeline component for tracking inventory movements with Chart.js visualization, filtering, and export capabilities.

## Features

- **Chart Visualization**: Line chart showing stock balance over time (Chart.js)
- **Movement Types**: Receive, issue, transfer-in, transfer-out, adjust-in, adjust-out
- **Filtering**: Filter by type, date range, user, location
- **Grouping**: Group movements by day, week, or month
- **Real-Time Updates**: WebSocket integration for live movements
- **Export**: PDF and Excel export
- **Virtual Scrolling**: Handle thousands of movements efficiently
- **Responsive**: Optimized for mobile and desktop

## Installation

```typescript
import { AxStockMovementTimelineComponent } from '@aegisx/ui';
```

**Dependencies:**

```bash
pnpm add chart.js jspdf xlsx
```

## Basic Usage

```html
<ax-stock-movement-timeline productId="PROD-001" [movements]="movementHistory" />
```

## API Reference

### Inputs

| Property         | Type                         | Default      | Description                                          |
| ---------------- | ---------------------------- | ------------ | ---------------------------------------------------- |
| `productId`      | `string`                     | **required** | Product ID to track                                  |
| `movements`      | `MovementRecord[]`           | `[]`         | Movement history (optional, loads from API if empty) |
| `filter`         | `MovementFilter`             | `{}`         | Filter criteria                                      |
| `groupBy`        | `'day' \| 'week' \| 'month'` | `'day'`      | Grouping interval                                    |
| `showChart`      | `boolean`                    | `true`       | Display balance chart                                |
| `showExport`     | `boolean`                    | `true`       | Show export buttons                                  |
| `enableRealtime` | `boolean`                    | `false`      | Enable WebSocket updates                             |
| `maxDisplay`     | `number`                     | `50`         | Max movements to display                             |

### Outputs

| Event             | Type               | Description                   |
| ----------------- | ------------------ | ----------------------------- |
| `onMovementClick` | `MovementRecord`   | Emitted when movement clicked |
| `onMovementsLoad` | `MovementRecord[]` | Emitted when loaded from API  |
| `onExport`        | `'pdf' \| 'excel'` | Emitted when export initiated |

### Types

```typescript
export enum MovementType {
  InboundReceipt = 'inbound-receipt',
  OutboundDispatch = 'outbound-dispatch',
  InternalTransfer = 'internal-transfer',
  Adjustment = 'adjustment',
  Return = 'return',
  Damage = 'damage',
  Expiry = 'expiry',
}

export interface MovementRecord {
  id: string;
  type: MovementType;
  quantity: number;
  timestamp: Date;
  referenceNo?: string;
  description?: string;
  performedBy?: string;
  metadata?: Record<string, any>;
}

export interface MovementFilter {
  types?: MovementType[];
  dateRange?: { start: Date; end: Date };
  users?: string[];
  locations?: string[];
}
```

## Examples

### Basic Timeline

```html
<ax-stock-movement-timeline productId="PROD-001" [movements]="movements" />
```

### With Filtering

```html
<ax-stock-movement-timeline
  productId="PROD-001"
  [filter]="{
    types: [MovementType.InboundReceipt, MovementType.OutboundDispatch],
    dateRange: { start: lastMonth, end: today }
  }"
/>
```

### Real-Time Updates

```html
<ax-stock-movement-timeline productId="PROD-001" [enableRealtime]="true" (onMovementClick)="showDetails($event)" />
```

### Export Functionality

```html
<ax-stock-movement-timeline productId="PROD-001" [movements]="movements" [showExport]="true" (onExport)="logExport($event)" />
```

```typescript
logExport(format: 'pdf' | 'excel') {
  console.log(`Exporting movements as ${format}`);
}
```

## Movement Type Icons

| Type                  | Icon | Color  |
| --------------------- | ---- | ------ |
| **Inbound Receipt**   | ⬇️   | Green  |
| **Outbound Dispatch** | ⬆️   | Red    |
| **Internal Transfer** | ↔️   | Blue   |
| **Adjustment**        | ⚙️   | Gray   |
| **Return**            | ↩️   | Orange |
| **Damage**            | ⚠️   | Yellow |
| **Expiry**            | ❌   | Red    |

## Chart Features

- **X-Axis**: Time (auto-scaled)
- **Y-Axis**: Stock balance
- **Tooltip**: Shows date, movement type, quantity change, new balance
- **Zoom**: Pinch-to-zoom on mobile, scroll-wheel on desktop
- **Legend**: Toggle movement types on/off

## Export Formats

### PDF Export

- Includes chart image
- Movement table with all details
- Date range, filters applied
- Generated timestamp

### Excel Export

- One row per movement
- Columns: Date, Type, Quantity, Balance, Reference, User
- Formatted dates and numbers
- Auto-width columns

## Performance

- **Render**: <200ms with 100 movements
- **Chart**: Lazy loaded, ~25KB
- **Virtual Scrolling**: Handles 1000+ movements
- **Bundle Size**: ~22KB gzipped (excl. Chart.js)

## Accessibility

- **Keyboard**: Navigate movements with Tab/Arrow keys
- **Screen Readers**: Announce movement details
- **Chart**: Alt text provided for chart image

## Related Components

- **AxStockLevelComponent**: Current stock display
- **AxStockAlertPanelComponent**: Alerts from movement patterns
- **AxBatchSelectorComponent**: Batch-level movements

## Browser Support

- Chrome/Edge 90+, Firefox 88+, Safari 14+, iOS Safari 14+, Android Chrome 90+
