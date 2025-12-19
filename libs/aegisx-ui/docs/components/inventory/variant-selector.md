# Product Variant Selector Component

A comprehensive component for selecting product variants (size, color, style) with multiple layout modes, stock availability, and filtering.

## Features

- **Multiple Layouts**: Grid (cards), List (table), Compact (selection list)
- **Attribute Filtering**: Filter by size, color, style, or custom attributes
- **Stock Availability**: Visual indicators for in-stock, low-stock, out-of-stock
- **Search**: Find variants by name, SKU, or attributes
- **Single/Multi-Select**: Choose one or multiple variants with quantities
- **Image Thumbnails**: Display variant images
- **Price Display**: Show variant pricing
- **Quick View**: Modal for detailed variant information
- **Responsive**: Optimized for mobile and desktop

## Installation

```typescript
import { AxVariantSelectorComponent } from '@aegisx/ui';
```

## Basic Usage

```html
<ax-variant-selector productId="PROD-001" [variants]="productVariants" [(layout)]="selectedLayout" (onVariantSelect)="handleSelection($event)" />
```

## API Reference

### Inputs

| Property        | Type                            | Default      | Description                                    |
| --------------- | ------------------------------- | ------------ | ---------------------------------------------- |
| `productId`     | `string`                        | **required** | Base product ID                                |
| `variants`      | `ProductVariant[]`              | **required** | Available variants                             |
| `attributes`    | `string[]`                      | `[]`         | Attribute dimensions (e.g., ['size', 'color']) |
| `layout`        | `'grid' \| 'list' \| 'compact'` | `'grid'`     | Display layout (two-way binding)               |
| `allowMultiple` | `boolean`                       | `false`      | Allow multi-select with quantities             |
| `showStock`     | `boolean`                       | `true`       | Display stock availability                     |
| `showPrice`     | `boolean`                       | `true`       | Display variant prices                         |
| `showImages`    | `boolean`                       | `true`       | Display variant images                         |
| `showSearch`    | `boolean`                       | `true`       | Show search input                              |
| `showFilters`   | `boolean`                       | `true`       | Show attribute filters                         |

### Outputs

| Event               | Type                   | Description                       |
| ------------------- | ---------------------- | --------------------------------- |
| `onVariantSelect`   | `VariantSelection`     | Emitted when selection changes    |
| `onAttributeFilter` | `AttributeFilterEvent` | Emitted when filter applied       |
| `onQuickView`       | `ProductVariant`       | Emitted when quick view requested |

### Types

```typescript
export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  attributes?: Record<string, string>; // { size: 'L', color: 'Blue' }
  price?: number;
  stock?: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface VariantSelection {
  variants: Array<{
    variant: ProductVariant;
    quantity: number;
  }>;
}

export type StockBadgeType = 'in-stock' | 'low-stock' | 'out-of-stock';
```

## Examples

### Grid Layout (Default)

```html
<ax-variant-selector productId="SHIRT-001" [variants]="shirtVariants" layout="grid" />
```

Displays variants as cards in a responsive grid (3-4 columns on desktop).

### List Layout (Table View)

```html
<ax-variant-selector productId="PROD-001" [variants]="variants" layout="list" [showImages]="false" />
```

Displays variants in a sortable Material table.

### Compact Layout (Dropdown-style)

```html
<ax-variant-selector productId="PROD-001" [variants]="variants" layout="compact" />
```

Space-efficient list view with thumbnails.

### Multi-Select with Quantities

```html
<ax-variant-selector productId="PROD-001" [variants]="variants" [allowMultiple]="true" (onVariantSelect)="handleBulkOrder($event)" />
```

```typescript
handleBulkOrder(selection: VariantSelection) {
  selection.variants.forEach(({ variant, quantity }) => {
    this.cart.add(variant, quantity);
  });
}
```

### With Attribute Filters

```html
<ax-variant-selector productId="SHIRT-001" [variants]="shirtVariants" [attributes]="['size', 'color', 'fit']" [showFilters]="true" (onAttributeFilter)="logFilter($event)" />
```

Shows chips for filtering: `Size: L`, `Color: Blue`, `Fit: Slim`

### Quick View Modal

```html
<ax-variant-selector productId="PROD-001" [variants]="variants" (onQuickView)="openQuickView($event)" />
```

```typescript
openQuickView(variant: ProductVariant) {
  this.dialog.open(VariantDetailsDialog, { data: variant });
}
```

## Stock Badge Logic

```typescript
const stockBadge = computed(() => {
  if (stock === 0 || !isAvailable) return 'out-of-stock';
  if (stock <= 10) return 'low-stock';
  return 'in-stock';
});
```

| Badge            | Color  | Condition                |
| ---------------- | ------ | ------------------------ |
| **In Stock**     | Green  | stock > 10               |
| **Low Stock**    | Yellow | stock ≤ 10               |
| **Out of Stock** | Red    | stock = 0 or unavailable |

## Layout Comparison

| Layout      | Best For              | Features                            |
| ----------- | --------------------- | ----------------------------------- |
| **Grid**    | E-commerce, catalogs  | Images, prices, add-to-cart buttons |
| **List**    | Inventory management  | Sortable table, bulk actions        |
| **Compact** | Product configurators | Space-efficient, dropdown-style     |

## Accessibility

- **Keyboard Navigation**: Tab through variants, Enter to select
- **Screen Readers**: Variant details announced
- **ARIA**: Proper roles and labels
- **Focus Management**: Clear focus indicators

## Performance

- **Render**: <150ms with 100 variants
- **Search**: Debounced, instant results
- **Bundle Size**: ~18KB gzipped

## Related Components

- **AxQuantityInputComponent**: Adjust quantities per variant
- **AxStockLevelComponent**: Display variant stock levels
- **AxExpiryBadgeComponent**: Show expiry for perishable variants

## Browser Support

- Chrome/Edge 90+, Firefox 88+, Safari 14+, iOS Safari 14+, Android Chrome 90+
