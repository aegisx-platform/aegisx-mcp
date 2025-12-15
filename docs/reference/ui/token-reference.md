# AegisX UI Token Reference

**Version:** 2.0.0
**Last Updated:** 2025-01-20

Complete catalog of all design tokens available in the AegisX UI library.

---

## Table of Contents

1. [Material Design 3 Tokens](#material-design-3-tokens)
2. [AegisX Custom Tokens](#aegisx-custom-tokens)
3. [Material Component Tokens](#material-component-tokens)
4. [Usage Guidelines](#usage-guidelines)

---

## Material Design 3 Tokens

These tokens are provided by Angular Material and automatically adjust based on the selected theme (light/dark).

### System Color Tokens

#### Primary Colors

```scss
--mat-sys-primary                // Primary brand color
--mat-sys-on-primary             // Text/icons on primary
--mat-sys-primary-container      // Container using primary color
--mat-sys-on-primary-container   // Text/icons on primary container
```

#### Surface Colors

```scss
--mat-sys-surface                // Default surface background
--mat-sys-on-surface             // Primary text on surface
--mat-sys-surface-variant        // Alternative surface shade
--mat-sys-on-surface-variant     // Secondary text on surface
--mat-sys-surface-container      // Elevated surface
--mat-sys-surface-container-low  // Subtle elevated surface
--mat-sys-surface-container-high // Prominent elevated surface
```

#### Semantic Colors

```scss
--mat-sys-error                  // Error state color
--mat-sys-on-error               // Text/icons on error
--mat-sys-error-container        // Error container background
--mat-sys-on-error-container     // Text/icons on error container
```

#### Border/Outline Colors

```scss
--mat-sys-outline                // Default border/divider
--mat-sys-outline-variant        // Subtle border/divider
```

#### Background Colors

```scss
--mat-sys-background             // Page background
--mat-sys-on-background          // Text on page background
```

### Elevation Tokens

```scss
--mat-sys-level0                 // No elevation (flat)
--mat-sys-level1                 // Subtle elevation
--mat-sys-level2                 // Low elevation
--mat-sys-level3                 // Medium elevation
--mat-sys-level4                 // High elevation
--mat-sys-level5                 // Maximum elevation
```

---

## AegisX Custom Tokens

Custom tokens that extend Material Design for AegisX-specific needs.

### Spacing Scale

```scss
--ax-spacing-xs: 0.25rem; // 4px  - Minimal spacing
--ax-spacing-sm: 0.5rem; // 8px  - Small spacing
--ax-spacing-md: 1rem; // 16px - Medium spacing (base)
--ax-spacing-lg: 1.5rem; // 24px - Large spacing
--ax-spacing-xl: 2rem; // 32px - Extra large spacing
--ax-spacing-2xl: 3rem; // 48px - 2X extra large
--ax-spacing-3xl: 4rem; // 64px - 3X extra large
```

**Usage:**

```scss
padding: var(--ax-spacing-md);
gap: var(--ax-spacing-sm);
margin-bottom: var(--ax-spacing-lg);
```

### Border Radius

```scss
--ax-radius-none: 0; // No rounding
--ax-radius-sm: 0.25rem; // 4px  - Subtle rounding
--ax-radius-md: 0.5rem; // 8px  - Medium rounding
--ax-radius-lg: 0.75rem; // 12px - Large rounding
--ax-radius-xl: 1rem; // 16px - Extra large rounding
--ax-radius-2xl: 1.5rem; // 24px - 2X extra large
--ax-radius-full: 9999px; // Fully rounded (pills/circles)
```

**Usage:**

```scss
border-radius: var(--ax-radius-md);
border-start-start-radius: var(--ax-radius-lg);
```

### Typography Scale

```scss
--ax-text-xs: 0.75rem; // 12px
--ax-text-sm: 0.875rem; // 14px
--ax-text-base: 1rem; // 16px (base)
--ax-text-lg: 1.125rem; // 18px
--ax-text-xl: 1.25rem; // 20px
--ax-text-2xl: 1.5rem; // 24px
--ax-text-3xl: 1.875rem; // 30px
--ax-text-4xl: 2.25rem; // 36px
```

**Font Weights:**

```scss
--ax-font-normal: 400;
--ax-font-medium: 500;
--ax-font-semibold: 600;
--ax-font-bold: 700;
```

**Line Heights:**

```scss
--ax-leading-none: 1;
--ax-leading-tight: 1.25;
--ax-leading-normal: 1.5;
--ax-leading-relaxed: 1.75;
```

**Font Families:**

```scss
--ax-font-sans: system-ui, -apple-system, sans-serif;
--ax-font-mono: 'Courier New', monospace;
```

**Usage:**

```scss
font-size: var(--ax-text-lg);
font-weight: var(--ax-font-semibold);
line-height: var(--ax-leading-tight);
```

### Semantic Color Palette

#### Success (Green)

```scss
--ax-success-faint: #f0fdf4; // Very light background
--ax-success-muted: #d1fae5; // Light background
--ax-success-subtle: #a7f3d0; // Subtle accent
--ax-success-default: #10b981; // Default success color
--ax-success-emphasis: #047857; // Dark success for text
--ax-success-inverted: #ffffff; // White text on success
```

#### Error (Red)

```scss
--ax-error-faint: #fef2f2;
--ax-error-muted: #fee2e2;
--ax-error-subtle: #fca5a5;
--ax-error-default: #ef4444;
--ax-error-emphasis: #b91c1c;
--ax-error-inverted: #ffffff;
```

#### Warning (Amber/Orange)

```scss
--ax-warning-faint: #fffbeb;
--ax-warning-muted: #fef3c7;
--ax-warning-subtle: #fde68a;
--ax-warning-default: #f59e0b;
--ax-warning-emphasis: #d97706;
--ax-warning-inverted: #ffffff;
```

#### Info (Blue)

```scss
--ax-info-faint: #eff6ff;
--ax-info-muted: #dbeafe;
--ax-info-subtle: #93c5fd;
--ax-info-default: #3b82f6;
--ax-info-emphasis: #1d4ed8;
--ax-info-inverted: #ffffff;
```

**Usage Pattern:**

```scss
// Light background
background-color: var(--ax-success-faint);

// Border
border-color: var(--ax-success-default);

// Text/icon
color: var(--ax-success-emphasis);
```

### Brand Colors

```scss
--ax-brand-faint: #eef2ff;
--ax-brand-muted: #e0e7ff;
--ax-brand-subtle: #c7d2fe;
--ax-brand-default: #6366f1; // Primary brand color
--ax-brand-emphasis: #4338ca;
--ax-brand-inverted: #ffffff;
```

### Neutral/Gray Scale

```scss
--ax-gray-50: #f9fafb;
--ax-gray-100: #f3f4f6;
--ax-gray-200: #e5e7eb;
--ax-gray-300: #d1d5db;
--ax-gray-400: #9ca3af;
--ax-gray-500: #6b7280;
--ax-gray-600: #4b5563;
--ax-gray-700: #374151;
--ax-gray-800: #1f2937;
--ax-gray-900: #111827;
```

### Semantic Tokens (Theme-Aware)

These tokens automatically adjust for light/dark themes.

#### Background

```scss
--ax-background-default          // Default page background
--ax-background-subtle           // Subtle background (slightly different)
--ax-background-emphasis         // Emphasized background
--ax-background-inverted         // Inverted background (dark in light, light in dark)
```

#### Text

```scss
--ax-text-primary                // Primary text color
--ax-text-secondary              // Secondary text color
--ax-text-muted                  // Muted/disabled text
--ax-text-heading                // Heading text color
--ax-text-inverted               // Inverted text (light on dark, dark on light)
```

#### Borders

```scss
--ax-border-default              // Default border color
--ax-border-subtle               // Subtle border (less prominent)
--ax-border-emphasis             // Emphasized border (more prominent)
```

### Shadows

```scss
--ax-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--ax-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--ax-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--ax-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Transitions

```scss
--ax-transition-fast: 150ms ease;
--ax-transition-base: 200ms ease;
--ax-transition-slow: 300ms ease;
```

### Z-Index Layers

```scss
--ax-z-base: 0;
--ax-z-dropdown: 1000;
--ax-z-sticky: 1020;
--ax-z-fixed: 1030;
--ax-z-modal-backdrop: 1040;
--ax-z-modal: 1050;
--ax-z-popover: 1060;
--ax-z-tooltip: 1070;
```

**Usage:**

```scss
.modal {
  z-index: var(--ax-z-modal);
}

.dropdown {
  z-index: var(--ax-z-dropdown);
}
```

---

## Material Component Tokens

Component-specific tokens that can be set to customize Material components.

### Dialog Tokens

```scss
// Container
--mdc-dialog-container-min-width
--mdc-dialog-container-max-width
--mdc-dialog-container-shape

// Padding (format: top left/right bottom)
--mat-dialog-headline-padding
--mat-dialog-supporting-text-padding
--mat-dialog-actions-padding

// Alignment
--mat-dialog-actions-alignment       // start | center | end

// Color & elevation (usually don't override)
--mdc-dialog-container-color
--mdc-dialog-container-elevation-shadow
```

**Example:**

```scss
.mat-mdc-dialog-container {
  --mdc-dialog-container-min-width: 400px;
  --mdc-dialog-container-max-width: 900px;
  --mdc-dialog-container-shape: 12px;
  --mat-dialog-headline-padding: 16px 24px 16px;
  --mat-dialog-supporting-text-padding: 24px;
  --mat-dialog-actions-padding: 16px 24px 16px;
  --mat-dialog-actions-alignment: end;
}
```

### Button Tokens

Configure via `mat.button-overrides()` mixin:

```scss
@include mat.button-overrides(
  (
    // Shape
    filled-container-shape,
    outlined-container-shape,
    text-container-shape,
    // Colors
    filled-container-color,
    outlined-outline-color,
    // Typography
    label-text-size,
    label-text-weight
  )
);
```

**Available tokens:** See [Material Button Theming](https://material.angular.io/components/button/api#theming)

### Card Tokens

Configure via `mat.card-overrides()` mixin:

```scss
@include mat.card-overrides(
  (
    // Elevated variant
    elevated-container-color,
    elevated-container-shape,
    elevated-container-elevation,
    // Outlined variant
    outlined-outline-color,
    outlined-outline-width,
    outlined-container-shape,
    // Filled variant (M3)
    filled-container-color
  )
);
```

**Available tokens:** See [Material Card Theming](https://material.angular.io/components/card/api#theming)

### Form Field Tokens

Configure via `mat.form-field-overrides()` mixin:

```scss
@include mat.form-field-overrides(
  (
    // Container
    container-height,
    container-vertical-padding,
    // Label
    outlined-label-text-populated-size,

    // Outline
    outline-color,
    outline-width
  )
);
```

**Available tokens:** See [Material Form Field Theming](https://material.angular.io/components/form-field/api#theming)

### Table Tokens

Configure via `mat.table-overrides()` mixin:

```scss
@include mat.table-overrides(
  (
    // Container
    background-color,

    // Header
    header-headline-color,
    header-headline-weight,
    // Rows
    row-item-label-text-color,
    row-item-outline-color,
    row-item-outline-width
  )
);
```

### Chip Tokens

Configure via `mat.chips-overrides()` mixin:

```scss
@include mat.chips-overrides(
  (
    // Container
    elevated-container-color,
    elevated-container-shape,
    elevated-container-elevation,
    // Outlined variant
    outlined-outline-color,
    outlined-outline-width
  )
);
```

### Menu Tokens

Configure via `mat.menu-overrides()` mixin:

```scss
@include mat.menu-overrides((container-color, container-shape, container-elevation-shadow, item-label-text-color, item-hover-state-layer-color));
```

### Tabs Tokens

Configure via `mat.tabs-overrides()` mixin:

```scss
@include mat.tabs-overrides(
  (
    // Inactive tabs
    inactive-label-text-color,
    inactive-ripple-color,
    // Active tab
    active-label-text-color,
    active-ripple-color,
    active-indicator-color,
    active-indicator-height,
    active-indicator-shape
  )
);
```

---

## Usage Guidelines

### Priority Order

When styling a component, use tokens in this priority order:

1. **Material System Tokens** (`--mat-sys-*`)
   - For Material components
   - Via official override mixins
   - Theme-aware by default

2. **AegisX Semantic Tokens** (`--ax-*`)
   - For custom AegisX components
   - For features Material doesn't provide
   - Use theme-aware variants when possible

3. **Tailwind Classes**
   - For one-off layout/spacing
   - In templates, not SCSS files
   - When no token exists

### Token Selection Decision Tree

```
Need to style a component?
│
├─ Is it a Material component property?
│  └─ Yes → Check if mat.*-overrides() provides it
│     ├─ Yes → Use override mixin with AegisX token value
│     └─ No → Set component token (--mat-*, --mdc-*) directly
│
├─ Is it a semantic color (success, error, etc.)?
│  └─ Yes → Use --ax-{semantic}-{variant}
│     Example: --ax-success-default, --ax-error-emphasis
│
├─ Is it spacing/sizing?
│  └─ Yes → Use --ax-spacing-* or --ax-radius-*
│     Example: --ax-spacing-md, --ax-radius-lg
│
├─ Is it typography?
│  └─ Yes → Use --ax-text-* and --ax-font-*
│     Example: --ax-text-lg, --ax-font-semibold
│
├─ Is it background/text/border?
│  └─ Yes → Use --ax-background-*, --ax-text-*, --ax-border-*
│     (Theme-aware tokens)
│
└─ None of the above?
   └─ Consider:
      - Can Tailwind handle this? → Use Tailwind class
      - Should this be a new token? → Propose to team
      - One-time use? → Hardcode (with comment explaining why)
```

### Common Patterns

**Pattern 1: Material Component with AegisX Values**

```scss
@include mat.card-overrides(
  (
    elevated-container-shape: var(--ax-radius-lg),
    outlined-outline-color: var(--ax-border-default),
  )
);
```

**Pattern 2: Custom Component with Semantic Tokens**

```scss
.ax-alert-success {
  background-color: var(--ax-success-faint);
  border-color: var(--ax-success-default);
  color: var(--ax-success-emphasis);
}
```

**Pattern 3: Layout with Spacing Tokens**

```scss
.ax-card {
  padding: var(--ax-spacing-lg);
  gap: var(--ax-spacing-md);
  border-radius: var(--ax-radius-md);
}
```

**Pattern 4: Theme-Aware Component**

```scss
.ax-component {
  background-color: var(--ax-background-default); // Adapts to theme
  color: var(--ax-text-primary); // Adapts to theme
  border: 1px solid var(--ax-border-default); // Adapts to theme
}
```

---

## Reference Links

- **Material Design 3:** [m3.material.io](https://m3.material.io/)
- **Angular Material Theming:** [material.angular.io/guide/theming](https://material.angular.io/guide/theming)
- **Material Component APIs:** Check each component's API tab for available tokens
- **AegisX Theme System:** [THEME_SYSTEM_STANDARD.md](./THEME_SYSTEM_STANDARD.md)

---

## Token Addition Process

**Adding new AegisX tokens:**

1. Check if Material provides an equivalent token first
2. Propose token in team discussion
3. Add to `_aegisx-tokens.scss` in both light and dark themes
4. Document in this file
5. Update `THEME_SYSTEM_STANDARD.md` if introducing new category

**Token naming convention:**

```scss
--ax-{category}-{variant}
--ax-spacing-md          // category: spacing, variant: md
--ax-success-default     // category: success, variant: default
```
