# Location/Warehouse Picker Component

Hierarchical location picker with tree navigation, search, favorites, and recent locations.

## Features

- **Hierarchical Tree**: Warehouse → Zone → Aisle → Shelf → Bin
- **Tree Navigation**: Expand/collapse with keyboard or mouse
- **Search**: Filter tree by location name or code
- **Recent Locations**: Last 5 selected locations (localStorage)
- **Favorite Locations**: Star/unstar locations (localStorage)
- **Type Filtering**: Filter by location type (warehouse, zone, etc.)
- **Stock Count Display**: Optional stock count per location
- **Path Calculation**: Full path from root to selected location
- **Responsive**: Mobile-friendly tree view

## Installation

```typescript
import { AxLocationPickerComponent } from '@aegisx/ui';
```

## Basic Usage

```html
<ax-location-picker [locations]="locationTree" (onSelect)="handleLocationSelect($event)" />
```

## API Reference

### Inputs

| Property            | Type             | Default      | Description                      |
| ------------------- | ---------------- | ------------ | -------------------------------- |
| `locations`         | `LocationNode[]` | **required** | Location tree hierarchy          |
| `allowedTypes`      | `LocationType[]` | `[]`         | Allowed types (empty = all)      |
| `disabledLocations` | `string[]`       | `[]`         | Location IDs to disable          |
| `showStock`         | `boolean`        | `false`      | Display stock count per location |
| `showCapacity`      | `boolean`        | `false`      | Display location capacity        |
| `showRecent`        | `boolean`        | `true`       | Show recent locations tab        |
| `showFavorites`     | `boolean`        | `true`       | Show favorites tab               |
| `maxRecent`         | `number`         | `5`          | Max recent locations to remember |

### Outputs

| Event              | Type                | Description                    |
| ------------------ | ------------------- | ------------------------------ |
| `onSelect`         | `LocationSelection` | Emitted when location selected |
| `onFavoriteToggle` | `LocationNode`      | Emitted when favorite toggled  |

### Types

```typescript
export enum LocationType {
  Warehouse = 'warehouse',
  Section = 'section',
  Shelf = 'shelf',
  Bin = 'bin',
}

export interface LocationNode {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  parentId?: string;
  children?: LocationNode[];
  stockCount?: number;
  capacity?: number;
  disabled?: boolean;
}

export interface LocationSelection {
  location: LocationNode;
  path: LocationNode[];
  pathString: string; // e.g., "Warehouse A / Zone 1 / Aisle A"
}
```

## Examples

### Basic Tree

```html
<ax-location-picker [locations]="warehouseTree" (onSelect)="moveToLocation($event)" />
```

```typescript
warehouseTree: LocationNode[] = [
  {
    id: 'WH-001',
    code: 'WH-001',
    name: 'Warehouse A',
    type: LocationType.Warehouse,
    children: [
      {
        id: 'ZONE-001',
        code: 'Z1',
        name: 'Zone 1',
        type: LocationType.Section,
        parentId: 'WH-001',
        children: [...]
      }
    ]
  }
];
```

### With Type Filtering

```html
<ax-location-picker [locations]="locations" [allowedTypes]="[LocationType.Warehouse, LocationType.Section]" />
```

Only warehouse and section levels are selectable.

### Disable Specific Locations

```html
<ax-location-picker [locations]="locations" [disabledLocations]="['WH-002', 'ZONE-005']" />
```

Disabled locations shown grayed out, not selectable.

### With Stock Counts

```html
<ax-location-picker [locations]="locationsWithStock" [showStock]="true" [showCapacity]="true" />
```

Displays: `Warehouse A (250/500 items)`

### Recent & Favorites

```html
<ax-location-picker [locations]="locations" [showRecent]="true" [showFavorites]="true" (onFavoriteToggle)="logFavorite($event)" />
```

**Recent Tab**: Last 5 selected locations (auto-saved to localStorage)

**Favorites Tab**: Starred locations (click star icon to toggle)

### Handle Selection

```typescript
handleLocationSelect(selection: LocationSelection) {
  console.log('Selected:', selection.location.name);
  console.log('Full path:', selection.pathString);
  // Example: "Warehouse A / Zone 1 / Aisle A / Shelf 3"

  this.selectedLocation = selection.location;
}
```

## Tree Navigation

### Mouse

- **Click**: Select location
- **Arrow Icon**: Expand/collapse children
- **Star Icon**: Toggle favorite

### Keyboard

- **Tab**: Navigate between locations
- **Enter/Space**: Select location
- **Arrow Right**: Expand node
- **Arrow Left**: Collapse node
- **Arrow Up/Down**: Navigate siblings

## Search Functionality

```html
<ax-location-picker [locations]="locations" />
```

Search input auto-filters tree:

- Searches by `code` and `name`
- Auto-expands matching nodes
- Highlights matches
- Clears on "×" button

## Location Icons

| Type          | Icon | Color  |
| ------------- | ---- | ------ |
| **Warehouse** | 🏢   | Blue   |
| **Section**   | 📦   | Green  |
| **Shelf**     | 🗄️   | Orange |
| **Bin**       | 📥   | Gray   |

## Path Calculation

When a location is selected, the component calculates the full path:

```typescript
// Example selection:
{
  location: { id: 'SHELF-003', name: 'Shelf 3', ... },
  path: [
    { id: 'WH-001', name: 'Warehouse A', ... },
    { id: 'ZONE-001', name: 'Zone 1', ... },
    { id: 'AISLE-001', name: 'Aisle A', ... },
    { id: 'SHELF-003', name: 'Shelf 3', ... }
  ],
  pathString: 'Warehouse A / Zone 1 / Aisle A / Shelf 3'
}
```

## Local Storage

### Recent Locations

Automatically stores last 5 selections:

```json
{
  "ax-location-picker-recent": [
    { "id": "SHELF-003", "name": "Shelf 3", ... },
    { "id": "BIN-042", "name": "Bin 42", ... }
  ]
}
```

### Favorites

Stores user-starred locations:

```json
{
  "ax-location-picker-favorites": [
    { "id": "WH-001", "name": "Warehouse A", ... },
    { "id": "ZONE-005", "name": "Zone 5", ... }
  ]
}
```

## Accessibility

- **Keyboard**: Full keyboard navigation
- **Screen Readers**: Tree structure announced
- **ARIA**: Proper tree roles (`role="tree"`, `role="treeitem"`)
- **Focus**: Clear focus indicators
- **Expandable**: `aria-expanded` state

## Performance

- **Render**: <200ms with 1000+ nodes
- **Tree Flattening**: Optimized for large hierarchies
- **Search**: Debounced, instant results
- **Bundle Size**: ~16KB gzipped

## Best Practices

1. **Load On-Demand**: For huge trees, load children on expand
2. **Pre-Select**: Highlight current location if known
3. **Disable Invalid**: Disable locations based on business rules
4. **Show Stock**: Help users choose locations with capacity
5. **Use Favorites**: Speed up frequent location selections

## Related Components

- **AxTransferWizardComponent**: Select transfer destinations
- **AxStockLevelComponent**: Display location stock levels
- **AxStockAlertPanelComponent**: Alerts per location

## Browser Support

- Chrome/Edge 90+, Firefox 88+, Safari 14+, iOS Safari 14+, Android Chrome 90+
