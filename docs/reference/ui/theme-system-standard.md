---
title: 'Theme System Standard'
description: 'Theme system architecture and standards'
category: reference
tags: [ui, theme, design-system]
---

# AegisX UI Theme System Standard

**Version:** 2.0.0
**Last Updated:** 2025-01-20
**Status:** Official Standard

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

## Related Documentation

- [Token Reference](./TOKEN_REFERENCE.md) - Complete catalog of all tokens
- [Component Styling Guide](./COMPONENT_STYLING_GUIDE.md) - Detailed component patterns
- [Migration Guide](./migration-guide.md) - How to migrate existing components
