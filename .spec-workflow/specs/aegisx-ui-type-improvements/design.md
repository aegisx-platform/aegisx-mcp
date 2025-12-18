# Design Document - AegisX UI Type System Improvements

## Overview

This design document outlines a systematic approach to achieving 100% TypeScript type safety across the @aegisx/ui library. The implementation will eliminate all `any` type usage, centralize type definitions in dedicated files, establish comprehensive JSDoc documentation, and ensure all public types are properly exported through the library's public API.

**Key Objectives:**

- Eliminate 26 occurrences of `any` type
- Extract 196+ inline type definitions to dedicated .types.ts files
- Establish JSDoc documentation standards
- Create comprehensive type export strategy
- Maintain 100% backward compatibility

**Timeline:** Phased implementation across multiple iterations
**Impact:** Improved developer experience, better IDE support, enhanced type safety

## Steering Document Alignment

### Technical Standards (tech.md)

This design follows the project's established technical standards:

- **TypeScript Strict Mode**: Already enabled in tsconfig.json (strict: true, noImplicitOverride, noImplicitReturns, noFallthroughCasesInSwitch)
- **Angular Best Practices**: Using Angular 17+ features including standalone components, signals, and strict template checking
- **Code Organization**: Following the existing barrel export pattern with module-based organization
- **Documentation Standards**: Extending existing JSDoc practices to achieve comprehensive coverage

### Project Structure (structure.md)

Implementation will follow the existing project structure:

```
libs/aegisx-ui/src/lib/
├── types/              # Global/shared types (existing)
├── components/         # Component modules with colocated .types.ts files
├── layouts/            # Layout components with colocated types
├── services/           # Services with colocated types
├── widgets/            # Widget system with type definitions
├── utils/              # Utility functions with proper typing
└── index.ts            # Main public API with type exports
```

## Code Reuse Analysis

### Existing Components to Leverage

- **Type Organization Pattern**: Reuse the existing pattern in `widgets/core/widget.types.ts` as a model for comprehensive type files
  - Well-structured type hierarchies
  - Clear section comments
  - Comprehensive JSDoc documentation
  - Proper const type definitions (e.g., `DASHBOARD_DEFAULTS`)

- **JSDoc Documentation Style**: Extend the pattern used in `types/ax-navigation.types.ts`
  - Interface descriptions
  - Property-level documentation
  - @deprecated tags for legacy properties
  - Usage examples where helpful

- **Export Strategy**: Build upon the existing barrel export system in `lib/components/index.ts`
  - Module-based re-exports
  - Clear categorization by feature area
  - Legacy compatibility comments

### Integration Points

- **TypeScript Compiler**: No changes to tsconfig.json needed - strict mode is already enabled
- **Build System**: Nx build pipeline will automatically validate all type improvements
- **Public API**: All new types will be added to existing export hierarchy through `lib/index.ts`
- **Existing Code**: All changes maintain backward compatibility - no breaking changes to public APIs

## Architecture

### Overall Design Pattern

The type system improvements follow a **colocated, modular architecture** where:

1. **Global/Shared Types** → `lib/types/` directory
   - Theme types, config types, layout types
   - Types used across multiple feature areas

2. **Feature-Specific Types** → Colocated with implementation
   - Component types: `component-name.types.ts` next to component file
   - Service types: `service-name.types.ts` next to service file
   - Widget types: Already following this pattern

3. **Type Exports** → Hierarchical barrel export system
   - Module-level index.ts files re-export local types
   - Top-level index.ts aggregates all public types
   - Consumers can import from `@aegisx/ui` or specific subpaths

### Modular Design Principles

- **Single File Responsibility**: Each .types.ts file contains types for a specific domain or component
- **Component Isolation**: Types are colocated with their implementations for better maintainability
- **Clear Boundaries**: Distinction between internal types (not exported) and public API types
- **Zero Runtime Impact**: All type improvements are compile-time only

```mermaid
graph TD
    A[@aegisx/ui] --> B[lib/index.ts]
    B --> C[types/]
    B --> D[components/]
    B --> E[widgets/]
    B --> F[services/]

    C --> C1[config.types.ts]
    C --> C2[theme.types.ts]
    C --> C3[navigation.types.ts]

    D --> D1[component-a/]
    D1 --> D1a[component-a.component.ts]
    D1 --> D1b[component-a.types.ts]
    D1 --> D1c[index.ts]

    E --> E1[widget.types.ts]
    E --> E2[widget-registry.ts]

    F --> F1[service-a/]
    F1 --> F1a[service-a.service.ts]
    F1 --> F1b[service-a.types.ts]
```

## Components and Interfaces

### Component 1: Type File Extractor

**Purpose:** Extract inline type definitions from component files to dedicated .types.ts files

**Process:**

1. Scan component files for exported `interface`, `type`, and `enum` declarations
2. Create corresponding `.types.ts` file if it doesn't exist
3. Move type definitions to the types file with proper JSDoc comments
4. Update component import statements
5. Update module index.ts to re-export types

**File Patterns:**

- Input: `component-name.component.ts` (with inline types)
- Output: `component-name.types.ts` (extracted types) + updated component

**Reuses:** Existing type extraction patterns from `drawer.component.ts` (which defines types inline but could be extracted)

### Component 2: Any Type Eliminator

**Purpose:** Replace all `any` type usage with proper TypeScript types

**Categories of `any` Usage:**

1. **Generic Object Types** (e.g., `Record<string, any>`)
   - Replace with: `Record<string, unknown>` or specific interfaces
   - Example: `datetime.utils.ts` functions

2. **Type Assertions** (e.g., `key as any`)
   - Replace with: Proper type guards or refined types
   - Example: `theme-builder.component.ts` theme key types

3. **Timer/Interval Types** (e.g., `progressInterval: any`)
   - Replace with: `ReturnType<typeof setInterval>` or `NodeJS.Timeout`
   - Example: `loading-bar.service.ts`

4. **HTTP Params** (e.g., `params as any`)
   - Replace with: Proper HttpParams types or specific interfaces
   - Example: `data.provider.ts`

**Reuses:** TypeScript's built-in utility types (ReturnType, Record, etc.)

### Component 3: JSDoc Documentation Generator

**Purpose:** Add comprehensive JSDoc comments to all exported types

**Documentation Standards:**

````typescript
/**
 * [Brief one-line description]
 *
 * [Detailed description with usage context]
 *
 * @example
 * ```typescript
 * const config: TypeName = {
 *   property: 'value'
 * };
 * ```
 *
 * @see RelatedType - [when relevant]
 * @deprecated Use NewType instead - [for deprecated types]
 */
export interface TypeName {
  /**
   * [Property description]
   * @default defaultValue - [when applicable]
   */
  property: string;
}
````

**Key Elements:**

- Interface/type description
- Property descriptions for non-obvious fields
- Usage examples for complex types
- Default value documentation
- Deprecation notices with migration guidance

**Reuses:** Existing JSDoc patterns from `widget.types.ts` and `ax-navigation.types.ts`

### Component 4: Public API Type Export Manager

**Purpose:** Ensure all public types are properly exported through the library's public API

**Export Hierarchy:**

```typescript
// libs/aegisx-ui/src/lib/index.ts
export * from './types'; // Global types
export * from './components'; // Component types (via barrel)
export * from './widgets'; // Widget types
export * from './services'; // Service types

// libs/aegisx-ui/src/lib/components/index.ts
export * from './drawer'; // Re-exports drawer.types.ts
export * from './launcher'; // Re-exports launcher.types.ts
// ... etc

// libs/aegisx-ui/src/lib/components/drawer/index.ts
export * from './drawer.component';
export * from './drawer.types'; // Explicit type export
```

**Benefits:**

- Consumers can import: `import { DrawerPosition, DrawerSize } from '@aegisx/ui'`
- Tree-shaking friendly
- Discoverable via IDE autocomplete

**Reuses:** Existing barrel export pattern

## Data Models

### Type File Structure Model

```typescript
// component-name.types.ts

// ============================================================================
// Section: Core Types
// ============================================================================

/**
 * [Description]
 */
export interface ComponentConfig {
  // properties with JSDoc as needed
}

/**
 * [Description]
 */
export type ComponentVariant = 'default' | 'compact' | 'expanded';

// ============================================================================
// Section: Event Types
// ============================================================================

/**
 * [Description]
 */
export interface ComponentEvent {
  // event properties
}

// ============================================================================
// Section: Constants
// ============================================================================

/**
 * Default configuration
 */
export const COMPONENT_DEFAULTS = {
  variant: 'default' as ComponentVariant,
  // ...
} as const;
```

**Key Principles:**

- Clear section headers with comment blocks
- Logical grouping of related types
- Const assertions for literal types
- Export everything that might be needed by consumers

### Type Replacement Model

**Before:**

```typescript
// component.ts
export interface ComponentOptions {
  data: any; // ❌ any type
  callback: any; // ❌ any type
}
```

**After:**

```typescript
// component.types.ts
/**
 * Component options configuration
 */
export interface ComponentOptions<TData = unknown> {
  /**
   * Component data
   * @template TData - Type of data being passed
   */
  data: TData;

  /**
   * Callback function invoked on data change
   */
  callback: (data: TData) => void;
}
```

## Error Handling

### Error Scenarios

1. **Breaking Type Changes**
   - **Handling:** Maintain deprecated type aliases for one major version
   - **User Impact:** Deprecation warnings in IDE, but code continues to work
   - **Example:**
     ```typescript
     /** @deprecated Use NewType instead */
     export type OldType = NewType;
     ```

2. **Missing Type Exports**
   - **Handling:** Add types to module index.ts and verify via build
   - **User Impact:** None - types become available
   - **Detection:** Build-time type checking

3. **Generic Type Complexity**
   - **Handling:** Provide sensible defaults and helper types
   - **User Impact:** Can use simple types or opt into advanced generics
   - **Example:**

     ```typescript
     // Simple usage
     const config: WidgetConfig = { ... };

     // Advanced usage with generics
     const config: WidgetConfig<CustomData> = { ... };
     ```

4. **Type Import Path Changes**
   - **Handling:** Maintain backward-compatible exports at old paths
   - **User Impact:** None - both old and new paths work
   - **Migration:** Document new preferred import paths

## Testing Strategy

### Type Testing with tsd

Install and configure [tsd](https://github.com/SamVerschueren/tsd) for compile-time type testing:

```typescript
// types.test-d.ts
import { expectType, expectError } from 'tsd';
import { DrawerPosition, DrawerSize } from '@aegisx/ui';

// Test valid types
expectType<DrawerPosition>('left');
expectType<DrawerSize>('md');

// Test invalid types
expectError<DrawerPosition>('invalid');

// Test generic constraints
import { WidgetConfig } from '@aegisx/ui';
interface CustomData {
  value: number;
}
expectType<WidgetConfig<CustomData>>({
  data: { value: 42 },
});
```

**Coverage Goals:**

- All exported types have at least one positive test
- Invalid type usage is tested with expectError
- Generic type constraints are validated

### Unit Testing

- **No runtime changes** - type improvements are compile-time only
- **Existing unit tests** - should continue to pass without modification
- **Build validation** - `pnpm run build` must succeed with no type errors

### Integration Testing

1. **Type Import Validation**
   - Test that all types can be imported from `@aegisx/ui`
   - Verify subpath imports work (e.g., `@aegisx/ui/types`)

2. **IDE IntelliSense Testing**
   - Manual verification that autocomplete works correctly
   - Type hints show proper JSDoc documentation
   - Deprecated types show deprecation warnings

3. **Consumer Project Testing**
   - Create a test Angular project that consumes @aegisx/ui
   - Verify type safety in component usage
   - Confirm no breaking changes

### Build Validation

```bash
# Must pass with zero type errors
pnpm run build

# Type checking only (faster)
pnpm nx run aegisx-ui:type-check

# Type testing with tsd
pnpm run test:types
```

## Migration Strategy

### Phase 1: Foundation (No Breaking Changes)

1. Create .types.ts files for components missing them
2. Add JSDoc documentation to existing types
3. Export types through public API
4. Set up tsd for type testing

### Phase 2: Type Safety Improvements (No Breaking Changes)

1. Replace `any` with `unknown` or proper types
2. Extract inline types to .types.ts files
3. Add generic type parameters where beneficial
4. Update component @Input/@Output type annotations

### Phase 3: Optimization (Potential Breaking Changes)

1. Rename poorly-named types (with deprecated aliases)
2. Consolidate duplicate type definitions
3. Remove truly deprecated/unused types (after deprecation period)

### Backward Compatibility Guarantees

- **All existing imports continue to work** - no import path changes
- **Deprecated types maintained** - for at least one major version
- **Type widening only** - making types more specific is okay, making them more generic is breaking
- **Optional generics** - new generic parameters have defaults
- **Migration guide** - provided in CHANGELOG.md for any breaking changes

## Documentation Deliverables

1. **Type Catalog** (`docs/type-catalog.md`)
   - Comprehensive list of all exported types
   - Organized by category
   - Usage examples for each type

2. **Migration Guide** (`docs/type-migration.md`)
   - How to migrate from deprecated types
   - Updated import paths (if any)
   - Generic type usage patterns

3. **JSDoc Coverage Report**
   - List of all documented types
   - Validation that 100% coverage achieved

4. **CHANGELOG.md Updates**
   - Document all type improvements
   - Note any deprecated types
   - Highlight new type exports

## Success Criteria

✅ **Zero `any` types** in the codebase (except legacy/deprecated code)
✅ **100% type file coverage** - all components have .types.ts files
✅ **100% JSDoc coverage** - all exported types documented
✅ **Complete public API** - all types importable from `@aegisx/ui`
✅ **Strict mode builds** - library builds with no type errors
✅ **Type tests passing** - tsd tests validate type correctness
✅ **Backward compatible** - existing code continues to work
✅ **Build time** - no more than 10% increase in build duration
