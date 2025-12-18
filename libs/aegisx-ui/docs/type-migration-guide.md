# Type System Migration Guide

## Overview

Version 0.2.0 of `@aegisx/ui` introduces comprehensive TypeScript type improvements that enhance developer experience through better IDE IntelliSense, compile-time safety, and self-documenting code.

**Key Highlights:**

- Zero `any` types - complete type safety
- 45+ dedicated `.types.ts` files with comprehensive JSDoc documentation
- All types properly exported through public API
- Enhanced generic type support for widget system
- Improved component interface type annotations

**Important: This is a non-breaking release.** All improvements are backward compatible, and your existing code will continue to work without any changes.

## What's New

### Complete Type Export Coverage

All public types are now accessible from the main `@aegisx/ui` package export:

```typescript
// Import types alongside components
import {
  // Components
  DrawerComponent,
  AlertComponent,
  // Types
  DrawerPosition,
  DrawerSize,
  AlertType,
  AlertConfig,
} from '@aegisx/ui';

// Or use subpath exports for organization
import { DrawerPosition, DrawerSize } from '@aegisx/ui/components';
import { WidgetDefinition, WidgetConfig } from '@aegisx/ui/widgets';
import { AegisxConfig, LayoutType } from '@aegisx/ui/core';
```

### Enhanced IDE IntelliSense

All types now have comprehensive JSDoc documentation:

````typescript
import { TimeSlot } from '@aegisx/ui';

// Hover over TimeSlot in your IDE to see:
/**
 * Represents a time slot with start and end times.
 * Used for scheduling and time selection components.
 *
 * @example
 * ```typescript
 * const slot: TimeSlot = {
 *   start: '09:00',
 *   end: '10:00',
 *   available: true
 * };
 * ```
 */
````

### Improved Type Safety

#### Before (v0.1.0)

```typescript
// Unsafe - any types
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// No type safety on component inputs
@Input() config: any;
@Output() changed = new EventEmitter();
```

#### After (v0.2.0)

```typescript
// Type-safe with generics
function processData<T extends { value: unknown }>(data: T[]) {
  return data.map(item => item.value);
}

// Explicit type annotations
@Input() config!: DrawerConfig;
@Output() changed = new EventEmitter<DrawerState>();
```

## Migration Examples

### Generic Type Usage

The widget system now supports full generic type safety:

#### Before

```typescript
// Limited type safety
const widget: WidgetDefinition = {
  type: 'kpi',
  config: {
    data: { value: 42 }, // No type checking
  },
};
```

#### After

```typescript
// Fully typed with generics
interface KpiData {
  value: number;
  trend: 'up' | 'down';
}

const widget: WidgetDefinition<KpiData> = {
  type: 'kpi',
  config: {
    data: {
      value: 42,
      trend: 'up',
    }, // Full autocomplete and type checking
  },
};
```

### Component Type Imports

#### Before

```typescript
// Types were not always exported
import { DrawerComponent } from '@aegisx/ui';

// Had to manually define types
type Position = 'left' | 'right' | 'top' | 'bottom';
```

#### After

```typescript
// Import types directly
import { DrawerComponent, DrawerPosition, DrawerSize } from '@aegisx/ui';

// Use exported types with full documentation
const position: DrawerPosition = 'left'; // Autocomplete works!
const size: DrawerSize = 'md';
```

### Datetime Utilities

#### Before

```typescript
// Generic object types
function convertDates(data: Record<string, any>) {
  // ...
}
```

#### After

```typescript
// Specific generic constraints
function convertDates<T extends Record<string, unknown>>(data: T): T {
  // Full type safety with generics
}

// Or with specific interfaces
interface DateFields {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

function convertDates(data: DateFields): DateFields {
  // Strongly typed
}
```

### Theme System Types

#### Before

```typescript
// Type assertions needed
const key = 'background-default' as any;
themeService.updateTheme(key, value);
```

#### After

```typescript
// String literal types
import { ThemeColorKey } from '@aegisx/ui';

const key: ThemeColorKey = 'background-default';
themeService.updateTheme(key, value); // Type-safe!
```

## Benefits You Get Automatically

Even without changing your code, you'll immediately benefit from:

### 1. Better Autocomplete

Your IDE will now show all available types, interfaces, and their properties with full documentation.

### 2. Enhanced Error Messages

TypeScript will provide more specific error messages when types don't match:

```typescript
// Before: "Type 'string' is not assignable to type 'any'"
// After: "Type 'invalid' is not assignable to type 'DrawerPosition'. Did you mean 'left' | 'right' | 'top' | 'bottom'?"
```

### 3. Safer Refactoring

IDE refactoring tools work better with explicit types, making it safer to rename properties and interfaces.

### 4. Self-Documenting Code

Type definitions serve as living documentation, reducing the need to check external docs.

## Common Type Patterns

### Component Configuration

```typescript
import { AlertConfig, AlertType, DrawerConfig, DrawerPosition } from '@aegisx/ui';

// Alert configuration
const alertConfig: AlertConfig = {
  type: 'success',
  message: 'Operation completed',
  dismissible: true,
  duration: 5000,
};

// Drawer configuration
const drawerConfig: DrawerConfig = {
  position: 'right',
  size: 'md',
  overlay: true,
  closeOnOverlayClick: true,
};
```

### Event Handling

```typescript
import { DrawerStateChange } from '@aegisx/ui';

// Type-safe event handling
@Output() stateChanged = new EventEmitter<DrawerStateChange>();

// In your component
handleDrawerChange(change: DrawerStateChange) {
  console.log('Drawer is now', change.isOpen ? 'open' : 'closed');
}
```

### Widget Data Types

```typescript
import { WidgetDefinition, ChartWidgetData, KpiWidgetData, TableWidgetData } from '@aegisx/ui';

// Strongly typed widget data
const chartWidget: WidgetDefinition<ChartWidgetData> = {
  id: 'sales-chart',
  type: 'chart',
  config: {
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        {
          label: 'Sales',
          data: [100, 200, 150],
        },
      ],
    },
  },
};
```

### Form Types

```typescript
import { DatePickerConfig, TimeSlot, SchedulerEvent, KnobConfig } from '@aegisx/ui';

// Date picker with type safety
const dateConfig: DatePickerConfig = {
  format: 'yyyy-MM-dd',
  minDate: new Date(),
  maxDate: new Date(2025, 11, 31),
};

// Time slots
const slots: TimeSlot[] = [
  { start: '09:00', end: '10:00', available: true },
  { start: '10:00', end: '11:00', available: false },
];
```

### Navigation Types

```typescript
import { AxNavigationItem, BreadcrumbItem, NavbarConfig } from '@aegisx/ui';

// Navigation structure
const navItems: AxNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'basic',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    id: 'settings',
    title: 'Settings',
    type: 'collapsible',
    icon: 'settings',
    children: [
      {
        id: 'profile',
        title: 'Profile',
        type: 'basic',
        link: '/settings/profile',
      },
    ],
  },
];
```

## Type Testing

Version 0.2.0 includes type tests to ensure type correctness. You can run them:

```bash
pnpm run test:types
```

This validates all type definitions at compile time using `tsd`.

## Frequently Asked Questions

### Do I need to update my code?

**No.** All improvements are backward compatible. Your existing code will work without changes.

### Will this affect bundle size?

**No.** Types are compile-time only and have zero runtime impact. Bundle size remains the same.

### Can I still use the old import patterns?

**Yes.** All existing import paths continue to work. New type exports are additions, not replacements.

### How do I enable strict type checking in my project?

Enable strict mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Where can I find all available types?

Check the Type Catalog documentation at `docs/type-catalog.md` for a complete list of all exported types organized by category.

## Getting Help

If you encounter any type-related issues:

1. Check the [Type Catalog](./type-catalog.md) for available types
2. Review the [Type Documentation Standards](./type-documentation-standards.md)
3. Look at JSDoc comments in your IDE (hover over types)
4. Check the [CHANGELOG](../CHANGELOG.md) for detailed changes

## Next Steps

To take full advantage of the improved type system:

1. **Enable strict mode** in your TypeScript configuration
2. **Update imports** to use explicit type imports for better code readability
3. **Use generics** with widget configurations for type-safe data handling
4. **Leverage IntelliSense** - hover over types to see documentation
5. **Run type tests** in your CI/CD pipeline for compile-time validation

Enjoy the improved developer experience with @aegisx/ui v0.2.0!
