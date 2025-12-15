# AegisX UI Theme System Standard

**Version:** 2.0.0
**Last Updated:** 2025-01-20
**Status:** Official Standard

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Token Hierarchy](#token-hierarchy)
4. [File Organization](#file-organization)
5. [Usage Patterns](#usage-patterns)
6. [Component Guidelines](#component-guidelines)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## Overview

The AegisX UI theme system follows a **Material-First** approach, leveraging Angular Material's Design 3 tokens while extending with custom AegisX tokens only where necessary. This creates a maintainable, scalable, and theme-aware component library.

### Key Principles

1. **Material First** - Use Material Design 3 tokens for all Material components
2. **Custom Second** - Use AegisX tokens only for features Material doesn't provide
3. **Tailwind Third** - Use utility classes for one-off layout/spacing
4. **No Overengineering** - Don't create abstractions that Tailwind/Material already provide

### Benefits

- ✅ **83% less CSS** - Dialog redesign: 484 lines → 80 lines
- ✅ **Auto theme support** - Light/dark modes work automatically
- ✅ **Type-safe** - Material override mixins provide validation
- ✅ **Maintainable** - Single source of truth for tokens
- ✅ **Scalable** - Easy to add new themes or variants

---

## Design Philosophy

### Material-First Approach

```
Priority 1: Material Design 3 Tokens
├─ --mat-sys-* (System tokens: colors, elevation, shape)
├─ --mdc-* (Component tokens: button, card, form-field)
└─ mat.*-overrides() (Official configuration API)

Priority 2: AegisX Custom Tokens
├─ --ax-spacing-* (Spacing scale)
├─ --ax-radius-* (Border radius scale)
├─ --ax-success-*, --ax-error-* (Semantic colors)
└─ --ax-z-* (Z-index layers)

Priority 3: Tailwind Utilities
├─ flex, grid, gap-* (Layout)
├─ text-*, font-* (Typography)
└─ p-*, m-* (One-off spacing)

Priority 4: Custom SCSS
└─ Only for features no other layer provides
```

### Decision Tree

```
Need to style a component?
│
├─ Is it a Material component?
│  │
│  ├─ Yes → Does Material provide tokens/override mixin?
│  │  │
│  │  ├─ Yes → Use mat.*-overrides() with AegisX token values
│  │  │         Example: @include mat.button-overrides((
│  │  │           filled-container-shape: var(--ax-radius-md)
│  │  │         ));
│  │  │
│  │  └─ No  → File Material issue OR create minimal custom CSS
│  │
│  └─ No → Creating custom AegisX component?
│     │
│     ├─ Layout/spacing → Use Tailwind classes in template
│     │                   Example: <div class="flex gap-3 p-4">
│     │
│     ├─ Theming → Use --ax-* tokens
│     │            Example: background-color: var(--ax-background-default);
│     │
│     └─ Neither → Create new --ax-* token if reusable
│                   Example: --ax-feature-new: value;
```

---

## Token Hierarchy

### 1. Material System Tokens (`--mat-sys-*`)

High-level semantic tokens from Material Design 3.

```scss
// Colors
--mat-sys-primary               // Primary brand color
--mat-sys-on-primary            // Text on primary
--mat-sys-surface               // Default surface
--mat-sys-on-surface            // Text on surface
--mat-sys-outline               // Border/outline color

// Elevation & Shape
--mat-sys-level1                // Elevation level 1
--mat-sys-level3                // Elevation level 3
```

**When to use:** Never directly override. These are set by Material themes.

### 2. Material Component Tokens (`--mdc-*`, `--mat-*`)

Component-specific tokens configured via official mixins.

```scss
// Dialog
--mat-dialog-headline-padding
--mat-dialog-supporting-text-padding
--mat-dialog-actions-padding

// Buttons
--mdc-filled-button-container-shape
--mdc-outlined-button-outline-color

// Cards
--mat-card-elevated-container-shape
--mat-card-outlined-outline-color
```

**When to use:** Configure via `mat.*-overrides()` mixins using AegisX token values.

### 3. AegisX Custom Tokens (`--ax-*`)

Custom tokens for features Material doesn't provide.

#### Spacing Scale

```scss
--ax-spacing-xs: 0.25rem; // 4px
--ax-spacing-sm: 0.5rem; // 8px
--ax-spacing-md: 1rem; // 16px
--ax-spacing-lg: 1.5rem; // 24px
--ax-spacing-xl: 2rem; // 32px
```

#### Border Radius

```scss
--ax-radius-sm: 0.25rem; // 4px
--ax-radius-md: 0.5rem; // 8px
--ax-radius-lg: 0.75rem; // 12px
--ax-radius-xl: 1rem; // 16px
```

#### Semantic Colors

```scss
--ax-success-default
--ax-success-emphasis
--ax-success-faint
--ax-error-default
--ax-warning-default
--ax-info-default
```

#### Z-Index Layers

```scss
--ax-z-dropdown: 1000;
--ax-z-sticky: 1020;
--ax-z-modal: 1050;
--ax-z-tooltip: 1070;
```

**When to use:** For custom AegisX components and features Material doesn't provide.

---

## File Organization

### Directory Structure

```
libs/aegisx-ui/src/lib/styles/
├── themes/
│   ├── aegisx-light.scss                    # Light theme entry
│   ├── aegisx-dark.scss                     # Dark theme entry
│   ├── tokens/
│   │   ├── _aegisx-tokens.scss              # AegisX custom token definitions
│   │   └── _material-token-overrides.scss   # Material token customizations
│   └── components/
│       └── _material-component-configs.scss # Material override mixins
│
├── components/
│   ├── _dialog.config.scss                  # Dialog-specific tokens
│   ├── _card.config.scss                    # Card-specific tokens
│   ├── _button.config.scss                  # Button-specific tokens
│   └── TEMPLATE.config.scss                 # Template for new components
│
└── utilities/
    ├── _kpi-cards.scss                      # Special utility styles
    └── _tremor-compat.scss                  # Tremor-style compatibility
```

### Naming Conventions

```scss
// Theme files
aegisx-[variant].scss          // e.g., aegisx-light.scss

// Token files
_[scope]-tokens.scss           // e.g., _aegisx-tokens.scss

// Component configs
_[component].config.scss       // e.g., _dialog.config.scss

// Utilities
_[purpose].scss                // e.g., _kpi-cards.scss
```

---

## Usage Patterns

### Pattern 1: Material Components (Recommended)

Use official `mat.*-overrides()` mixins with AegisX token values.

```scss
// _material-component-configs.scss

@use '@angular/material' as mat;

@include mat.button-overrides(
  (
    filled-container-shape: var(--ax-radius-md),
    outlined-outline-color: var(--ax-border-default),
  )
);

@include mat.card-overrides(
  (
    elevated-container-shape: var(--ax-radius-lg),
    outlined-outline-color: var(--ax-border-default),
  )
);

@include mat.dialog-overrides(
  (
    container-shape: var(--ax-radius-lg),
  )
);
```

**Benefits:**

- Type-safe (Material validates tokens)
- Future-proof (follows official API)
- Automatic theme support

### Pattern 2: Component Token Configuration

Set Material component tokens directly for fine-grained control.

```scss
// _dialog.config.scss

.mat-mdc-dialog-container {
  // Container sizing
  --mdc-dialog-container-min-width: 400px;
  --mdc-dialog-container-max-width: 900px;
  --mdc-dialog-container-shape: 12px;

  // Padding (format: top left/right bottom)
  --mat-dialog-headline-padding: 16px 24px 16px;
  --mat-dialog-supporting-text-padding: 24px;
  --mat-dialog-actions-padding: 16px 24px 16px;

  // Alignment
  --mat-dialog-actions-alignment: end;
}
```

**Use when:**

- Material provides the token
- Fine-grained control needed
- Override mixin doesn't expose the property

### Pattern 3: Custom AegisX Components

Use `--ax-*` tokens with minimal custom CSS.

```scss
// custom-component.scss

.ax-alert {
  // Structure (minimal)
  display: flex;
  align-items: center;
  gap: var(--ax-spacing-sm);

  // Theming (use tokens)
  background-color: var(--ax-background-default);
  border: 1px solid var(--ax-border-default);
  border-radius: var(--ax-radius-md);
  padding: var(--ax-spacing-md);

  // Interactions
  transition: all var(--ax-transition-base);

  // Variants
  &.ax-alert-success {
    border-color: var(--ax-success-default);
    background-color: var(--ax-success-faint);
  }
}
```

**Best practices:**

- Use Tailwind for layout when possible
- Use `--ax-*` tokens for ALL theming
- Keep variants minimal
- No hardcoded values

### Pattern 4: Template-Level Tailwind

Use Tailwind classes directly in templates for one-off styling.

```html
<!-- Dialog Header -->
<h2 mat-dialog-title class="flex items-center gap-3 text-xl font-semibold">
  <mat-icon class="text-blue-500">folder_open</mat-icon>
  Dialog Title
</h2>

<!-- Dialog Content -->
<mat-dialog-content class="space-y-4">
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium">Name</label>
    <input class="w-full" />
  </div>
</mat-dialog-content>

<!-- Dialog Actions -->
<div mat-dialog-actions align="end" class="flex gap-2">
  <button mat-button>Cancel</button>
  <button mat-flat-button color="primary">Save</button>
</div>
```

**Benefits:**

- No CSS files needed
- Co-located with template
- Easy to modify
- Uses established utility system

---

## Component Guidelines

### Creating New Components

**Step 1: Determine Component Type**

```typescript
// Is this a Material component extension?
if (extendsMaterialComponent) {
  // Use mat.*-overrides() mixin
  // Example: Custom button variant
}

// Is this a custom AegisX component?
else if (customComponent) {
  // Use --ax-* tokens
  // Example: Alert, Stats Card
}
```

**Step 2: Choose Styling Approach**

```typescript
// Can Tailwind handle layout?
if (needsOnlyLayout) {
  // Use Tailwind classes in template
  // NO CSS FILE NEEDED
  return 'Tailwind only';
}

// Does Material provide tokens?
else if (materialTokensExist) {
  // Create .config.scss file
  // Set component tokens only
  return 'Token configuration';
}

// Need custom behavior?
else {
  // Create component.scss file
  // Use --ax-* tokens for theming
  return 'Custom SCSS';
}
```

**Step 3: Follow Template**

See `TEMPLATE.config.scss` for standardized component structure.

### Modifying Existing Components

**Checklist:**

1. [ ] Identify current approach (Material/custom)
2. [ ] Check if Material tokens exist for this component
3. [ ] Replace hardcoded values with tokens
4. [ ] Move layout CSS to Tailwind classes if possible
5. [ ] Test light theme
6. [ ] Test dark theme
7. [ ] Test responsive breakpoints
8. [ ] Document usage examples

---

## Best Practices

### DO ✅

```scss
// Use Material tokens via override mixins
@include mat.card-overrides((
  elevated-container-shape: var(--ax-radius-lg)
));

// Use AegisX tokens for theming
.ax-component {
  background-color: var(--ax-background-default);
  padding: var(--ax-spacing-md);
}

// Use Tailwind for layout
<div class="flex gap-3 items-center">

// Create tokens for reusable values
--ax-feature-spacing: 1.5rem;

// Document usage in component file
/* Usage: <ax-alert type="success">Message</ax-alert> */
```

### DON'T ❌

```scss
// Don't use hardcoded values
.component {
  background: #ffffff;  // ❌
  padding: 16px;        // ❌
}

// Don't create utility classes Tailwind provides
.flex-center {         // ❌ Use Tailwind instead
  display: flex;
  align-items: center;
  justify-content: center;
}

// Don't bypass Material's official API
.mat-mdc-button {      // ❌ Use mat.button-overrides() instead
  border-radius: 4px !important;
}

// Don't create component-specific tokens for one-off values
--ax-button-this-specific-padding: 12px;  // ❌

// Don't create wrapper components for Material components
<ax-material-button>  // ❌ Just use <button mat-button>
```

---

## Examples

### Example 1: Dialog Configuration

```scss
// _dialog.config.scss
/* ============================================================
   Component: Dialog
   Material-First token configuration only
   ============================================================ */

.mat-mdc-dialog-container {
  // Container
  --mdc-dialog-container-min-width: 400px;
  --mdc-dialog-container-max-width: 900px;
  --mdc-dialog-container-shape: var(--ax-radius-lg);

  // Padding (format: top left/right bottom)
  --mat-dialog-headline-padding: 16px 24px 16px;
  --mat-dialog-supporting-text-padding: 24px;
  --mat-dialog-actions-padding: 16px 24px 16px;

  @media (max-width: 768px) {
    --mdc-dialog-container-min-width: 90vw;
    --mat-dialog-headline-padding: 12px 16px 12px;
  }
}

// Content scrolling
.mat-mdc-dialog-content {
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}
```

**Usage in template:**

```html
<h2 mat-dialog-title class="flex items-center gap-3 text-xl font-semibold">
  <mat-icon class="text-blue-500">folder_open</mat-icon>
  Dialog Title
</h2>

<mat-dialog-content>
  <!-- Content -->
</mat-dialog-content>

<div mat-dialog-actions align="end" class="flex gap-2">
  <button mat-button>Cancel</button>
  <button mat-flat-button color="primary">Save</button>
</div>
```

### Example 2: Custom Alert Component

```scss
// alert.component.scss
.ax-alert {
  // Structure
  display: flex;
  align-items: center;
  gap: var(--ax-spacing-sm);

  // Theming
  background-color: var(--ax-background-default);
  border: 1px solid var(--ax-border-default);
  border-radius: var(--ax-radius-md);
  padding: var(--ax-spacing-md);

  // Icon
  .ax-alert-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  // Variants
  &.ax-alert-success {
    border-color: var(--ax-success-default);
    background-color: var(--ax-success-faint);
    color: var(--ax-success-emphasis);
  }

  &.ax-alert-error {
    border-color: var(--ax-error-default);
    background-color: var(--ax-error-faint);
    color: var(--ax-error-emphasis);
  }
}
```

**Usage:**

```html
<div class="ax-alert ax-alert-success">
  <mat-icon class="ax-alert-icon">check_circle</mat-icon>
  <span>Operation completed successfully</span>
</div>
```

### Example 3: Material Component Override

```scss
// _material-component-configs.scss
@use '@angular/material' as mat;

// Cards
@include mat.card-overrides(
  (
    elevated-container-color: var(--ax-background-default),
    elevated-container-shape: var(--ax-radius-lg),
    elevated-container-elevation: var(--ax-shadow-md),
    outlined-outline-color: var(--ax-border-default),
    outlined-outline-width: 1px,
  )
);

// Buttons
@include mat.button-overrides(
  (
    filled-container-shape: var(--ax-radius-md),
    outlined-container-shape: var(--ax-radius-md),
    outlined-outline-color: var(--ax-border-default),
  )
);
```

**Usage:**

```html
<!-- Material components just work -->
<mat-card appearance="outlined">
  <mat-card-header>
    <mat-card-title>Card Title</mat-card-title>
  </mat-card-header>
  <mat-card-content> Card content </mat-card-content>
</mat-card>

<button mat-flat-button color="primary">Primary Button</button>
<button mat-outlined-button>Outlined Button</button>
```

---

## Related Documentation

- [Token Reference](./TOKEN_REFERENCE.md) - Complete catalog of all tokens
- [Component Styling Guide](./COMPONENT_STYLING_GUIDE.md) - Detailed component patterns
- [Migration Guide](./MIGRATION_GUIDE.md) - How to migrate existing components

---

**Questions or Issues?**

- Check [Material Design 3 Documentation](https://m3.material.io/)
- Check [Angular Material Theming](https://material.angular.io/guide/theming)
- See component examples in `/libs/aegisx-ui/src/lib/styles/components/`
