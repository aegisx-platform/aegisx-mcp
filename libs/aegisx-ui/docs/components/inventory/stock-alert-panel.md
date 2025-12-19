# Stock Alert Panel Component

Real-time stock alert dashboard with filtering, grouping, WebSocket updates, and action buttons.

## Features

- **Real-Time Updates**: WebSocket integration for live alerts
- **Alert Types**: Low stock, out-of-stock, expiring, expired, overstock, reorder
- **Severity Levels**: Critical, warning, info
- **Grouping**: Group by type, priority, or location
- **Filtering**: Filter by type, severity, product, location
- **Action Buttons**: Create PO, adjust stock, view product, dispose, reorder
- **Dismissal**: Dismiss or resolve alerts
- **Sound Notifications**: Optional audio alerts
- **Auto-Refresh**: Configurable polling interval

## Installation

```typescript
import { AxStockAlertPanelComponent } from '@aegisx/ui';
```

## Basic Usage

```html
<ax-stock-alert-panel [groupBy]="'priority'" (onAlertAction)="handleAction($event)" />
```

## API Reference

### Inputs

| Property         | Type                                           | Default      | Description                            |
| ---------------- | ---------------------------------------------- | ------------ | -------------------------------------- |
| `alerts`         | `StockAlert[]`                                 | `[]`         | Pre-loaded alerts (optional)           |
| `groupBy`        | `'type' \| 'priority' \| 'location' \| 'none'` | `'priority'` | Grouping strategy                      |
| `filter`         | `AlertFilter`                                  | `{}`         | Filter criteria                        |
| `maxDisplay`     | `number`                                       | `10`         | Max alerts to display                  |
| `enableRealtime` | `boolean`                                      | `false`      | Enable WebSocket updates               |
| `enableSounds`   | `boolean`                                      | `false`      | Enable notification sounds             |
| `autoRefresh`    | `number`                                       | `0`          | Auto-refresh interval (ms, 0=disabled) |
| `showActions`    | `boolean`                                      | `true`       | Show action buttons                    |

### Outputs

| Event            | Type               | Description                  |
| ---------------- | ------------------ | ---------------------------- |
| `onAlertAction`  | `AlertActionEvent` | Emitted when action clicked  |
| `onAlertDismiss` | `StockAlert`       | Emitted when alert dismissed |
| `onAlertResolve` | `StockAlert`       | Emitted when alert resolved  |

### Types

```typescript
export type AlertType = 'low-stock' | 'out-of-stock' | 'expiring' | 'expired' | 'overstock' | 'reorder';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface StockAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  product: { id: string; name: string; sku: string; imageUrl?: string };
  message: string;
  createdAt: Date;
  metadata?: {
    currentStock?: number;
    minimumStock?: number;
    expiryDate?: Date;
    batchNumber?: string;
  };
  suggestedActions?: string[];
}

export interface AlertActionEvent {
  alert: StockAlert;
  action: 'create-po' | 'adjust-stock' | 'view-product' | 'dispose' | 'reorder' | 'dismiss' | 'resolve';
  data?: any;
}
```

## Examples

### Group by Priority (Default)

```html
<ax-stock-alert-panel [groupBy]="'priority'" />
```

Groups: **Critical** (red), **Warning** (yellow), **Info** (blue)

### Filter Alerts

```html
<ax-stock-alert-panel
  [filter]="{
    types: ['low-stock', 'out-of-stock'],
    severity: ['critical'],
    unresolvedOnly: true
  }"
/>
```

### With Real-Time Updates

```html
<ax-stock-alert-panel [enableRealtime]="true" [enableSounds]="true" (onAlertAction)="handleAction($event)" />
```

New alerts appear instantly via WebSocket.

### Handle Actions

```typescript
handleAction(event: AlertActionEvent) {
  switch (event.action) {
    case 'create-po':
      this.createPurchaseOrder(event.alert.product);
      break;
    case 'adjust-stock':
      this.openStockAdjustment(event.alert.product);
      break;
    case 'reorder':
      this.reorderProduct(event.alert.product);
      break;
  }
}
```

## Alert Types

| Type             | Description         | Severity | Suggested Actions       |
| ---------------- | ------------------- | -------- | ----------------------- |
| **low-stock**    | Stock below minimum | Warning  | Create PO, Reorder      |
| **out-of-stock** | Zero stock          | Critical | Create PO, Adjust stock |
| **expiring**     | Near expiry date    | Warning  | Dispose, Mark down      |
| **expired**      | Past expiry date    | Critical | Dispose, Remove         |
| **overstock**    | Excess inventory    | Info     | Mark down, Transfer     |
| **reorder**      | Below reorder point | Warning  | Create PO, Reorder      |

## WebSocket Integration

### Expected Message Format

```json
{
  "type": "new-alert",
  "data": {
    "id": "ALERT-001",
    "type": "out-of-stock",
    "severity": "critical",
    "product": { "id": "PROD-001", "name": "Product A" },
    "message": "Product A is out of stock"
  },
  "timestamp": "2025-12-19T00:00:00Z"
}
```

### Connection

Component connects to WebSocket endpoint if `enableRealtime="true"`. Expected endpoint: `ws://localhost:3000/inventory/alerts`

## Performance

- **Render**: <150ms with 20 alerts
- **Real-Time**: <50ms alert insertion
- **Bundle Size**: ~14KB gzipped

## Accessibility

- **Keyboard**: Navigate alerts with Tab/Arrow keys
- **Screen Readers**: Announce new alerts via `aria-live`
- **Focus**: Clear focus indicators

## Related Components

- **AxStockLevelComponent**: Trigger alerts based on stock levels
- **AxExpiryBadgeComponent**: Show expiry status in alerts
- **AxStockMovementTimelineComponent**: View movement history from alerts

## Browser Support

- Chrome/Edge 90+, Firefox 88+, Safari 14+, iOS Safari 14+, Android Chrome 90+
