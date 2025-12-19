# Batch Selector Component

A comprehensive batch/lot selection component with inventory strategy support (FIFO, FEFO, LIFO), expiry tracking, and multi-batch selection.

## Features

- **Inventory Strategies**: FIFO, FEFO, LIFO sorting
- **Expiry Tracking**: Color-coded expiry status with countdown
- **Multi-Batch Selection**: Select multiple batches with quantities
- **Smart Recommendations**: Suggests optimal batch based on strategy
- **Search & Filter**: Find batches by number or lot
- **API Integration**: Load batches from backend
- **Quantity Allocation**: Specify quantity per batch
- **Responsive**: Works on mobile and desktop
- **Accessible**: Full keyboard navigation and ARIA support

## Installation

```typescript
import { AxBatchSelectorComponent } from '@aegisx/ui';
```

## Basic Usage

### Simple Single-Batch Selection

```html
<ax-batch-selector productId="PROD-001" [batches]="availableBatches" (onSelect)="handleBatchSelection($event)" />
```

```typescript
availableBatches: BatchInfo[] = [
  {
    batchNumber: 'BATCH-001',
    expiryDate: new Date('2025-12-31'),
    availableQuantity: 100,
    unit: 'pieces',
    status: 'available'
  }
];

handleBatchSelection(selection: BatchSelection) {
  console.log(`Selected ${selection.totalQuantity} from ${selection.batches.length} batch(es)`);
}
```

### Multi-Batch Selection with Quantity

```html
<ax-batch-selector productId="PROD-001" [batches]="batches" [allowMultiple]="true" [requestedQuantity]="500" [(strategy)]="inventoryStrategy" (onSelect)="allocateBatches($event)" />
```

```typescript
inventoryStrategy: InventoryStrategy = 'fefo';

allocateBatches(selection: BatchSelection) {
  selection.batches.forEach(({ batch, quantity }) => {
    console.log(`Allocate ${quantity} from ${batch.batchNumber}`);
  });
}
```

## API Reference

### Inputs

| Property             | Type                  | Default      | Description                                            |
| -------------------- | --------------------- | ------------ | ------------------------------------------------------ |
| `productId`          | `string`              | **required** | Product ID to load batches for                         |
| `batches`            | `BatchInfo[]`         | `[]`         | Pre-loaded batches (optional, loads from API if empty) |
| `strategy`           | `InventoryStrategy`   | `'fefo'`     | Sorting strategy (supports two-way binding)            |
| `allowMultiple`      | `boolean`             | `false`      | Allow selecting multiple batches                       |
| `requestedQuantity`  | `number \| undefined` | `undefined`  | Target quantity for allocation                         |
| `showExpiry`         | `boolean`             | `true`       | Show expiry date information                           |
| `showManufacturing`  | `boolean`             | `false`      | Show manufacturing date                                |
| `showRecommendation` | `boolean`             | `true`       | Highlight recommended batch                            |
| `expiryWarningDays`  | `number`              | `30`         | Days until expiry to show warning                      |
| `expiryCriticalDays` | `number`              | `7`          | Days until expiry to show critical warning             |

### Outputs

| Event           | Type             | Description                          |
| --------------- | ---------------- | ------------------------------------ |
| `onSelect`      | `BatchSelection` | Emitted when batch selection changes |
| `onBatchesLoad` | `BatchInfo[]`    | Emitted when batches loaded from API |
| `onError`       | `string`         | Emitted when an error occurs         |

### Types

```typescript
export interface BatchInfo {
  batchNumber: string;
  lotNumber?: string;
  expiryDate: Date;
  manufacturingDate?: Date;
  availableQuantity: number;
  unit: string;
  location?: string;
  status: 'available' | 'reserved' | 'expired' | 'quarantine';
  metadata?: Record<string, unknown>;
}

export interface SelectedBatch {
  batch: BatchInfo;
  quantity: number;
}

export interface BatchSelection {
  batches: SelectedBatch[];
  totalQuantity: number;
  strategy: InventoryStrategy;
}

export type InventoryStrategy = 'fifo' | 'fefo' | 'lifo';
export type ExpiryStatus = 'safe' | 'warning' | 'critical' | 'expired';
```

## Examples

### FIFO (First In, First Out)

```html
<ax-batch-selector productId="PROD-001" [batches]="batches" strategy="fifo" />
```

Sorts by **manufacturing date** (oldest first). Best for non-perishable items.

### FEFO (First Expired, First Out)

```html
<ax-batch-selector productId="PROD-001" [batches]="batches" strategy="fefo" />
```

Sorts by **expiry date** (earliest first). Best for perishable items (food, pharma).

### LIFO (Last In, First Out)

```html
<ax-batch-selector productId="PROD-001" [batches]="batches" strategy="lifo" />
```

Sorts by **manufacturing date** (newest first). Rarely used, specific accounting purposes.

### Allocate Requested Quantity Across Batches

```html
<ax-batch-selector productId="PROD-001" [batches]="batches" [allowMultiple]="true" [requestedQuantity]="500" strategy="fefo" (onSelect)="handleAllocation($event)" />
```

```typescript
handleAllocation(selection: BatchSelection) {
  console.log(`Total allocated: ${selection.totalQuantity} / 500`);

  selection.batches.forEach(({ batch, quantity }) => {
    console.log(`- ${batch.batchNumber}: ${quantity} (expires ${batch.expiryDate})`);
  });

  if (selection.totalQuantity < 500) {
    alert('Insufficient stock across all batches');
  }
}
```

### Custom Expiry Thresholds

```html
<ax-batch-selector productId="PROD-001" [batches]="batches" [expiryWarningDays]="60" [expiryCriticalDays]="14" />
```

- **Critical**: Expires in ≤14 days (red badge)
- **Warning**: Expires in ≤60 days (yellow badge)
- **Safe**: Expires in >60 days (green badge)

### Load Batches from API

```html
<ax-batch-selector productId="PROD-001" (onBatchesLoad)="batchesLoaded($event)" (onError)="handleError($event)" />
```

Component automatically fetches batches from `/api/inventory/products/:productId/batches`.

```typescript
batchesLoaded(batches: BatchInfo[]) {
  console.log(`Loaded ${batches.length} batches`);
}

handleError(error: string) {
  console.error('Failed to load batches:', error);
}
```

## Inventory Strategy Comparison

| Strategy | Sorts By                          | Best For                        | Example                   |
| -------- | --------------------------------- | ------------------------------- | ------------------------- |
| **FIFO** | Manufacturing Date (oldest first) | Non-perishable goods, hardware  | Electronics, tools        |
| **FEFO** | Expiry Date (earliest first)      | Perishable goods                | Food, medicine, chemicals |
| **LIFO** | Manufacturing Date (newest first) | Accounting, specific industries | Rare use cases            |

## Expiry Status Logic

```typescript
const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

if (daysUntilExpiry < 0) return 'expired';
if (daysUntilExpiry <= expiryCriticalDays) return 'critical';
if (daysUntilExpiry <= expiryWarningDays) return 'warning';
return 'safe';
```

## Batch Selection Flow

### Single-Select Mode

1. User clicks batch card
2. Previous selection cleared
3. New batch selected
4. `onSelect` event emitted

### Multi-Select Mode

1. User clicks batch card
2. Batch added to selection
3. Quantity defaults to available or remaining requested
4. User can adjust quantity per batch
5. Total quantity calculated
6. `onSelect` event emitted on each change

## API Integration

### Expected Endpoint

```
GET /api/inventory/products/:productId/batches?status=available
```

### Expected Response

```json
{
  "batches": [
    {
      "batchNumber": "BATCH-001",
      "expiryDate": "2025-12-31T00:00:00Z",
      "availableQuantity": 100,
      "unit": "pieces",
      "status": "available"
    }
  ],
  "strategy": "fefo"
}
```

## Accessibility

- **Keyboard Navigation**: Tab through batches, Enter to select
- **Screen Readers**:
  - Batch information announced
  - Expiry status announced
  - Selection changes announced
- **ARIA**: Proper roles, labels, and live regions
- **Focus Management**: Clear focus indicators

## Best Practices

1. **Choose Right Strategy**:
   - Use FEFO for perishables
   - Use FIFO for general inventory
   - Avoid LIFO unless required for accounting

2. **Set Expiry Thresholds**: Match your lead times and shelf life requirements

3. **Multi-Batch for Allocation**: Enable when requested quantity may span multiple batches

4. **Show Recommendations**: Help users pick optimal batches

5. **Handle Unavailable Batches**: Filter or disable expired/quarantine batches

6. **Pre-load Batches**: If you have batch data, pass it in `batches` input to avoid API call

## Performance

- **Render**: <300ms with 50 batches
- **Sorting**: Real-time, no lag
- **Search**: Debounced, instant feedback
- **Bundle Size**: ~15KB gzipped

## Related Components

- **AxQuantityInputComponent**: Enter total quantity before batch selection
- **AxExpiryBadgeComponent**: Display expiry status
- **AxStockLevelComponent**: Show total stock across all batches

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+
