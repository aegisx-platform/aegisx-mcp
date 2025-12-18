# JSDoc Documentation Standards for @aegisx/ui

## Overview

This guide establishes consistent JSDoc documentation standards for all TypeScript types, interfaces, enums, and related exports in the @aegisx/ui library. Comprehensive documentation enables better IDE IntelliSense, improves code discoverability, and helps library consumers understand type usage and constraints.

**Table of Contents:**

- [General Principles](#general-principles)
- [File Organization](#file-organization)
- [Interface Documentation](#interface-documentation)
- [Type Documentation](#type-documentation)
- [Enum Documentation](#enum-documentation)
- [Property Documentation](#property-documentation)
- [Advanced JSDoc Tags](#advanced-jsdoc-tags)
- [Best Practices](#best-practices)
- [Examples by Category](#examples-by-category)

---

## General Principles

1. **Clarity First**: Documentation should be understandable to library consumers who may not be familiar with internal implementation
2. **Be Precise**: Describe what the type does, not how it works internally
3. **Include Examples**: For complex types, provide realistic usage examples
4. **Use Section Separators**: Organize long type files with visual separators for readability
5. **Link Related Types**: Cross-reference related types using @see tags
6. **Document Constraints**: Explain any constraints, requirements, or special behaviors
7. **Keep It Current**: Update documentation when type signatures change

---

## File Organization

Type definition files should follow a consistent structure:

```typescript
/**
 * Module Description
 * Brief description of what types this file contains and their purpose
 */

// ============================================================================
// SECTION NAME
// ============================================================================

// Type/Interface definitions with JSDoc

// ============================================================================
// NEXT SECTION NAME
// ============================================================================

// More type definitions
```

### Section Separator Format

Use this exact format for section separators:

```typescript
// ============================================================================
// SECTION NAME (ALL CAPS)
// ============================================================================
```

This provides clear visual breaks in long type files and makes navigation easier.

**Real Example** (`widget.types.ts`):

```typescript
// ============================================================================
// Widget Category & Status
// ============================================================================

export type WidgetCategory = 'display' | 'chart' | 'data' | 'action' | 'custom';

// ============================================================================
// Widget Size
// ============================================================================

export interface WidgetSize {
  cols: number;
  rows: number;
}
```

---

## Interface Documentation

Interfaces should include comprehensive JSDoc comments describing their purpose and usage.

### Format

```typescript
/**
 * Brief description of what this interface represents
 *
 * Longer description if needed, explaining the purpose,
 * relationships to other types, or special considerations.
 *
 * @example
 * const myInterface: InterfaceName = {
 *   property: 'value'
 * };
 */
export interface InterfaceName {
  // properties documented below
}
```

### Property Documentation

Each property should have a single-line JSDoc comment describing its purpose:

```typescript
/**
 * Navigation Item Configuration
 *
 * Represents a single item in the navigation hierarchy.
 * Can be a link, group, divider, or spacer.
 */
export interface AxNavigationItem {
  /** Unique identifier */
  id: string;

  /** Display title */
  title: string;

  /** Optional subtitle (for detailed navigation) */
  subtitle?: string;

  /** Item type - determines rendering behavior */
  type?: 'item' | 'basic' | 'group' | 'collapsible' | 'divider' | 'spacer';

  /** Material icon name */
  icon?: string;

  /** Router link (string or array for complex routes) */
  link?: string | string[];

  /** Child navigation items */
  children?: AxNavigationItem[];
}
```

### Key Rules

- **One-liner for simple properties**: Use a single JSDoc line for basic properties
- **Multi-line for complex properties**: When property type is complex or behavior needs explanation:
  ```typescript
  /**
   * Hidden state - can be static or dynamic
   *
   * If a function, called at runtime to determine visibility.
   * Useful for conditionally hiding items based on user state.
   */
  hidden?: boolean | (() => boolean);
  ```
- **Explain constraints**: If a property has requirements or affects behavior:
  ```typescript
  /**
   * Auto-refresh interval in milliseconds
   *
   * Set to 0 to disable auto-refresh. Minimum value is 1000ms.
   */
  refreshInterval?: number;
  ```

---

## Type Documentation

String literal types and union types should document the available options.

### Union Type Format

```typescript
/**
 * Pastel color theme for app cards
 *
 * Each color corresponds to a specific Tailwind palette:
 * - pink: pink-50 (#fdf2f8)
 * - peach: orange-50 (#fff7ed)
 * - mint: green-50 (#f0fdf4)
 * - blue: blue-50 (#eff6ff)
 * - yellow: yellow-50 (#fefce8)
 * - lavender: purple-50 (#faf5ff)
 * - cyan: cyan-50 (#ecfeff)
 * - rose: rose-50 (#fff1f2)
 * - neutral: zinc-50 (#fafafa)
 * - white: White with border shadow (supports dark mode)
 */
export type LauncherColor = 'pink' | 'peach' | 'mint' | 'blue' | 'yellow' | 'lavender' | 'cyan' | 'rose' | 'neutral' | 'white';
```

### Inline Comments for Options

For types with multiple options that have different meanings:

```typescript
/** App visibility/operational status */
export type LauncherAppStatus =
  | 'active' // App is fully operational
  | 'beta' // App is in beta testing
  | 'new' // Newly released app
  | 'maintenance' // App is under maintenance (visible but not accessible)
  | 'coming_soon' // App is coming soon (visible but not accessible)
  | 'disabled' // App is disabled (hidden from users without admin role)
  | 'hidden'; // App is completely hidden
```

### Simple Type Aliases

```typescript
/** View mode options for launcher display */
export type LauncherViewMode = 'grid' | 'list' | 'compact';

/** Group by options for organizing apps */
export type LauncherGroupBy = 'category' | 'status' | 'none';
```

---

## Enum Documentation

Enums should document their purpose and each member's meaning.

### Standard Enum Format

```typescript
/**
 * Widget Status Enumeration
 *
 * Indicates the maturity and support level of a widget component.
 * Used to communicate to users whether a widget is production-ready.
 */
export enum WidgetStatus {
  /** Stable, production-ready widget with full support */
  STABLE = 'stable',

  /** Widget in beta testing, may have breaking changes */
  BETA = 'beta',

  /** Experimental widget, API may change significantly */
  EXPERIMENTAL = 'experimental',

  /** @deprecated - Widget is no longer maintained */
  DEPRECATED = 'deprecated',
}
```

### Numeric Enum Example

```typescript
/**
 * Priority Levels for Task Management
 *
 * Used to order and categorize tasks by importance.
 * Higher values indicate higher priority.
 */
export enum TaskPriority {
  /** Low priority, handle when time permits */
  LOW = 0,

  /** Normal priority, should be handled in regular workflow */
  MEDIUM = 1,

  /** High priority, handle soon */
  HIGH = 2,

  /** Critical priority, handle immediately */
  CRITICAL = 3,
}
```

---

## Property Documentation

### Optional Properties

Clearly indicate whether properties are optional and document default behavior:

```typescript
interface WidgetConfig {
  /** Unique widget ID - required */
  id: string;

  /** Display name - required */
  name: string;

  /** Widget status - optional, defaults to 'stable' */
  status?: WidgetStatus;

  /** Description shown in palette tooltip - optional */
  description?: string;

  /** Auto-refresh interval in ms - optional, defaults to 0 (disabled) */
  refreshInterval?: number;
}
```

### Function Properties

For properties that are functions, document the parameters and return type:

```typescript
/**
 * Custom permission check function
 *
 * Called at runtime to determine if user can view the navigation item.
 * Can return boolean or Observable for async permission checks.
 *
 * @returns true if user can see this item, false otherwise
 */
canView?: () => boolean | Observable<boolean>;

/**
 * Transform function name
 *
 * Registered in the app and called to transform API response data
 * before passing to widget component.
 */
transform?: string;
```

### Array Properties

Document what the array contains and typical usage:

```typescript
/**
 * Child navigation items
 *
 * Creates a hierarchy of navigation items. Children inherit
 * parent's permissions unless explicitly overridden.
 */
children?: AxNavigationItem[];

/**
 * Tags for filtering and searching
 *
 * Can be used to group related widgets or enable
 * category-based filtering in the widget palette.
 */
tags?: string[];
```

### Object Properties

Document the structure and purpose:

```typescript
/**
 * Custom metadata
 *
 * Arbitrary key-value pairs for storing additional
 * context specific to your application.
 */
meta?: Record<string, unknown>;

/**
 * Query parameters for API request
 *
 * Passed to HttpClient.get() method as-is.
 * Supports both simple values and arrays.
 */
params?: Record<string, unknown>;
```

---

## Advanced JSDoc Tags

### @deprecated

Mark types, interfaces, or properties that are no longer recommended:

```typescript
/**
 * Navigation Item Badge Configuration
 *
 * @deprecated Use the enhanced badge property on AxNavigationItem instead.
 * This interface will be removed in v3.0.0.
 *
 * @see {@link AxNavigationItem}
 */
export interface AxNavigationBadge {
  content?: string;
  title?: string; // @deprecated Use content instead
}
```

Usage in properties:

```typescript
export interface AxNavigationItem {
  /**
   * Legacy permission field
   *
   * @deprecated Use permissions array instead.
   * This field will be removed in v3.0.0.
   *
   * @example
   * // Old way (don't use)
   * permission: 'admin'
   *
   * // New way (preferred)
   * permissions: ['admin']
   */
  permission?: string;

  /** RBAC permissions required (OR logic) */
  permissions?: string[];
}
```

### @example

Provide realistic usage examples for complex types:

```typescript
/**
 * Dashboard Configuration
 *
 * Complete configuration for a dashboard layout.
 *
 * @example
 * const config: DashboardConfig = {
 *   id: 'sales-dashboard',
 *   name: 'Sales Overview',
 *   columns: 4,
 *   rowHeight: 160,
 *   gap: 16,
 *   widgets: [
 *     {
 *       instanceId: 'w1',
 *       widgetId: 'ax-kpi-widget',
 *       position: { x: 0, y: 0, cols: 2, rows: 1 },
 *       config: { metric: 'revenue' }
 *     }
 *   ],
 *   createdAt: '2024-01-15T10:30:00Z',
 *   updatedAt: '2024-01-15T10:30:00Z'
 * };
 */
export interface DashboardConfig {
  // properties...
}
```

### @see

Cross-reference related types:

```typescript
/**
 * Widget Instance in Dashboard
 *
 * Represents a single widget instance with its position and configuration.
 *
 * @see {@link WidgetDefinition} for widget metadata
 * @see {@link WidgetDataSource} for data configuration
 * @see {@link WidgetPosition} for grid positioning
 */
export interface WidgetInstance<TConfig = Record<string, unknown>> {
  // properties...
}
```

### @param and @returns (for types with methods)

If documenting a type with callable signature:

```typescript
/**
 * Permission check function
 *
 * @param userId User ID to check permissions for
 * @param action Action being performed
 * @returns Promise resolving to true if permitted, false otherwise
 */
export type PermissionCheckFn = (userId: string, action: string) => Promise<boolean>;
```

### Generic Type Parameters

Document generic type parameters when the interface uses them:

```typescript
/**
 * Widget Configuration with Type-Safe Config
 *
 * @template TConfig - The type of widget-specific configuration
 *
 * @example
 * interface KpiConfig {
 *   metric: string;
 *   format: 'currency' | 'percent';
 * }
 *
 * const definition: WidgetDefinition<KpiConfig> = {
 *   // config is guaranteed to be KpiConfig
 *   defaultConfig: { metric: 'revenue', format: 'currency' }
 * };
 */
export interface WidgetDefinition<TConfig = unknown> {
  // properties...
}
```

---

## Best Practices

### 1. Use Correct Comment Format

Use `/** */` for documentation comments, not `//` or `/* */`:

```typescript
// ✅ Correct
/**
 * This is a documentation comment
 */
export type MyType = string;

// ❌ Incorrect
// This is not a JSDoc comment
export type MyType = string;

// ❌ Incorrect
/* This is a block comment, not JSDoc */
export type MyType = string;
```

### 2. Provide Context for Complex Types

When a type has multiple related properties or special behavior, provide a summary at the top:

```typescript
/**
 * RBAC Permission Configuration
 *
 * Flexible permission system supporting both role-based (RBAC)
 * and permission-based (PBAC) access control with custom functions.
 *
 * **Logic:**
 * - If viewRoles is set, at least one role is required (OR)
 * - If viewPermissions is set, at least one permission is required (OR)
 * - If canView function is set, it's called for final decision
 * - All checks are AND'd together if multiple are specified
 */
export interface LauncherPermission {
  viewRoles?: string[];
  accessRoles?: string[];
  viewPermissions?: string[];
  accessPermissions?: string[];
  canView?: () => boolean | Observable<boolean>;
  canAccess?: () => boolean | Observable<boolean>;
}
```

### 3. Document Non-Obvious Behavior

```typescript
/**
 * Create time in ISO 8601 format
 *
 * Automatically set by the system. Do not manually set this value
 * as it will be overwritten on save.
 */
createdAt: string;

/**
 * Exact URL matching for active state
 *
 * When true, only exact URL matches mark the item as active.
 * When false, partial matches activate the item (default).
 *
 * Useful for preventing parent items from appearing active
 * when child items are selected.
 */
exactMatch?: boolean;
```

### 4. Link to External Resources When Relevant

```typescript
/**
 * Material icon name
 *
 * Must be a valid Material Design Icon name.
 * See [Material Icons](https://fonts.google.com/icons) for available options.
 */
icon: string;

/**
 * Matrix layout configuration
 *
 * Uses Gridster2 for responsive grid layout.
 * See [Gridster2 Docs](https://tiberiuzuld.github.io/ngx-gridster/) for options.
 *
 * @see LauncherGridsterConfig
 */
gridsterConfig?: LauncherGridsterConfig;
```

### 5. Document Array Element Constraints

```typescript
/**
 * Dashboard widget instances
 *
 * Array of widget instances positioned in the grid.
 * Each widget must have a unique instanceId within the dashboard.
 * Position coordinates must not overlap.
 */
widgets: WidgetInstance[];

/**
 * Badge colors for enterprise layout
 *
 * Available options: 'primary' | 'accent' | 'warn'
 * Defaults to 'primary' if not specified.
 */
badgeColor?: 'primary' | 'accent' | 'warn';
```

### 6. Explain Conditional Behavior

```typescript
/**
 * External URL for the application
 *
 * If set, overrides the route property and opens
 * the URL in a new tab instead of navigating.
 * Mutually exclusive with route.
 */
externalUrl?: string;

/**
 * Gridster2 configuration
 *
 * Only used when enableDraggable is true.
 * Ignored if enableDraggable is false.
 */
gridsterConfig?: LauncherGridsterConfig;
```

### 7. Keep Documentation Maintainable

- Avoid over-documenting obvious code
- Don't duplicate type information that's clear from the signature
- Focus on the "why" not the "what"

```typescript
// ✅ Good: Explains why this property exists
/**
 * Last edited information
 *
 * Displayed to users to show when the app was last modified
 * and by whom. Example: "Last edit by Mark at 7:40 PM"
 */
lastEdited?: string;

// ❌ Over-documented: The signature is self-explanatory
/**
 * String property that contains the last edited information
 * It is optional and may be undefined if not set
 */
lastEdited?: string;
```

### 8. Consistent Formatting

- Use bullet points for lists of related items
- Use code blocks for code examples
- Use bold for emphasis (**text**)
- Use inline code for type names and property names

```typescript
/**
 * Navigation Item with Advanced Features
 *
 * Supports several display modes:
 * - **link**: Direct navigation item
 * - **group**: Container for child items
 * - **divider**: Visual separator
 * - **spacer**: Flexible space
 *
 * Use {@link AxNavigationItem} to configure behavior.
 */
export interface AdvancedNavigationItem {
  // ...
}
```

---

## Examples by Category

### Category: Core Configuration

```typescript
/**
 * Application Configuration
 *
 * Top-level configuration for AegisX UI library.
 * Passed to the initialization function.
 *
 * @example
 * const config: AegisxConfig = {
 *   theme: {
 *     mode: 'dark',
 *     primaryColor: '#3B82F6'
 *   },
 *   navigation: {
 *     layout: 'compact'
 *   }
 * };
 *
 * initializeAegisX(config);
 */
export interface AegisxConfig {
  /** Theme configuration */
  theme?: AegisxThemeConfig;

  /** Navigation configuration */
  navigation?: AegisxNavigationConfig;

  /**
   * Feature flags
   *
   * Enable or disable experimental features.
   */
  features?: AegisxFeatureConfig;
}
```

### Category: Component State

```typescript
/**
 * Component Visibility State
 *
 * Can be static or dynamic based on user permissions.
 *
 * @example
 * // Static visibility
 * visible: true
 *
 * // Dynamic visibility (check at runtime)
 * visible: () => userService.hasRole('admin')
 */
export type VisibilityState = boolean | (() => boolean);
```

### Category: Event Types

```typescript
/**
 * Application Click Event
 *
 * Emitted when user clicks on an app in the launcher.
 * Provides context about which app was clicked.
 */
export interface LauncherAppClickEvent {
  /** The app that was clicked */
  app: LauncherApp;

  /** Whether to open in new tab (Ctrl/Cmd+Click) */
  newTab?: boolean;
}
```

### Category: Data Models

```typescript
/**
 * Widget Definition (Registry Entry)
 *
 * Metadata for a widget type registered in the widget system.
 * Used to display widgets in the palette and instantiate them.
 *
 * @template TConfig - Type of widget-specific configuration
 *
 * @example
 * const kpiWidget: WidgetDefinition<KpiConfig> = {
 *   id: 'ax-kpi-widget',
 *   name: 'KPI Widget',
 *   description: 'Display key performance indicators',
 *   icon: 'trending_up',
 *   category: 'chart',
 *   component: KpiWidgetComponent,
 *   sizes: {
 *     minSize: { cols: 1, rows: 1 },
 *     defaultSize: { cols: 2, rows: 1 },
 *     maxSize: { cols: 4, rows: 4 }
 *   },
 *   defaultConfig: { metric: 'revenue' }
 * };
 */
export interface WidgetDefinition<TConfig = unknown> {
  /** Unique widget ID (e.g., 'ax-kpi-widget') */
  id: string;

  /** Display name */
  name: string;

  /** Description for palette tooltip */
  description: string;

  /** Material icon name */
  icon: string;

  /** Widget category */
  category: WidgetCategory;

  /** Widget status - optional, defaults to 'stable' */
  status?: WidgetStatus;

  /** Angular component class */
  component: Type<unknown>;

  /** Size constraints */
  sizes: WidgetSizeConstraints;

  /** Default configuration - type-safe via generic */
  defaultConfig: TConfig;

  /** JSON Schema for config validation (optional) */
  configSchema?: object;

  /** Preview image URL for palette (optional) */
  thumbnail?: string;

  /** Tags for search/filter */
  tags?: string[];
}
```

---

## Summary

### Key Documentation Rules

1. **File Organization**: Use section separators to organize type files
2. **Interface Docs**: Document the interface purpose, then each property
3. **Type Docs**: Explain union options with inline comments
4. **Property Docs**: One-liner for simple, multi-line for complex
5. **Deprecated Items**: Use @deprecated tag with migration path
6. **Examples**: Include @example for complex types showing realistic usage
7. **Cross-Reference**: Use @see to link related types
8. **Context**: Explain non-obvious behavior and constraints
9. **Consistency**: Use consistent formatting and structure
10. **Maintainability**: Focus on clarifying intent, not restating obvious code

### Documentation Coverage Goals

- All exported interfaces should have JSDoc
- All exported types should have JSDoc
- All exported enums should have JSDoc with member docs
- All non-obvious properties should be documented
- Complex types should include @example tags
- Related types should reference each other with @see

### Validation

Before committing type files:

1. Run TypeScript compiler to verify no syntax errors
2. Check IDE IntelliSense shows your documentation
3. Review examples compile correctly
4. Verify @deprecated items have migration paths
5. Check @see references point to valid types

---

## Version History

- **v1.0.0** (2024-12-18): Initial JSDoc standards guide for @aegisx/ui
