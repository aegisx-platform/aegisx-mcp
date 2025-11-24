# AegisX UI Theming Guide (Material-First Approach)

**Version:** 2.0.0
**Last Updated:** 2025-01-19
**Status:** Official Standard

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Material-First Philosophy](#material-first-philosophy)
3. [Token Hierarchy](#token-hierarchy)
4. [Decision Tree: Which Token to Use?](#decision-tree-which-token-to-use)
5. [Token Categories](#token-categories)
6. [Common Scenarios](#common-scenarios)
7. [Do's and Don'ts](#dos-and-donts)
8. [Migration Guide](#migration-guide)

---

## Introduction

AegisX UI follows a **Material-First Design** approach, meaning we prioritize Angular Material's design tokens before introducing custom tokens. This ensures:

✅ **Automatic theme support** - Components adapt to light/dark mode without extra work
✅ **Consistent UI** - All Material components share the same token system
✅ **Future-proof** - Angular Material updates won't break our custom styles
✅ **Better integration** - Custom components blend seamlessly with Material components

---

## Material-First Philosophy

### Core Principle

> "Use Material Design tokens FIRST for any feature Material provides.
> Only use AegisX tokens for features Material doesn't provide."

### Why This Matters

1. **Material tokens are semantic** - They automatically adapt to theme changes
2. **Material tokens are standardized** - They follow Google's Material Design 3 spec
3. **Material tokens are tested** - Used by millions of apps worldwide
4. **AegisX tokens should extend, not replace** - We fill gaps, not duplicate

---

## Token Hierarchy

```
Priority 1: Material Design Tokens (--mat-sys-*, --mdc-*)
  ├─ Use for: surfaces, text, borders, elevation, states
  ├─ Examples: --mat-sys-surface, --mat-sys-on-surface, --mat-sys-outline
  └─ Documentation: https://m3.material.io/foundations/design-tokens

Priority 2: AegisX Semantic Tokens (--ax-*)
  ├─ Use for: brand colors, semantic colors, custom surfaces
  ├─ Examples: --ax-success-default, --ax-brand-emphasis
  └─ When: Material doesn't provide equivalent token

Priority 3: AegisX Utility Tokens (--ax-spacing-*, --ax-radius-*)
  ├─ Use for: spacing, border radius, z-index, transitions
  ├─ Examples: --ax-spacing-lg, --ax-radius-md, --ax-z-sticky
  └─ When: Design system consistency required

Priority 4: Tailwind CSS (flex, gap, mt-4, etc.)
  ├─ Use for: layout utilities, quick styling
  ├─ Examples: flex, gap-4, mt-4, p-6
  └─ When: Temporary or component-specific styling
```

---

## Decision Tree: Which Token to Use?

### For Background Colors

```mermaid
graph TD
    A[Need background color?] --> B{What type?}
    B -->|Main surface| C[var\(--mat-sys-surface\)]
    B -->|Elevated surface| D[var\(--mat-sys-surface-container\)]
    B -->|Subtle surface| E[var\(--mat-sys-surface-container-low\)]
    B -->|Hover state| F[var\(--ax-background-subtle\)]
    B -->|Success/Error/Warning| G[var\(--ax-success-faint\), etc.]
```

**Quick Reference:**

| Scenario          | Token                              |
| ----------------- | ---------------------------------- |
| Dialog background | `var(--mat-sys-surface)`           |
| Card background   | `var(--mat-sys-surface-container)` |
| Hover background  | `var(--ax-background-subtle)`      |
| Success banner    | `var(--ax-success-faint)`          |
| Page background   | `var(--ax-background-default)`     |

### For Text Colors

```mermaid
graph TD
    A[Need text color?] --> B{What type?}
    B -->|Primary text| C[var\(--mat-sys-on-surface\)]
    B -->|Secondary text| D[var\(--mat-sys-on-surface-variant\)]
    B -->|Heading text| E[var\(--mat-sys-on-surface\)]
    B -->|Disabled text| F[var\(--ax-text-disabled\)]
    B -->|Error/Warning| G[var\(--ax-error-default\), etc.]
```

**Quick Reference:**

| Scenario         | Token                               |
| ---------------- | ----------------------------------- |
| Body text        | `var(--mat-sys-on-surface)`         |
| Label text       | `var(--mat-sys-on-surface-variant)` |
| Heading text     | `var(--mat-sys-on-surface)`         |
| Placeholder text | `var(--ax-text-subtle)`             |
| Disabled text    | `var(--ax-text-disabled)`           |
| Error message    | `var(--ax-error-default)`           |

### For Borders

```mermaid
graph TD
    A[Need border color?] --> B{What type?}
    B -->|Standard border| C[var\(--mat-sys-outline\)]
    B -->|Subtle border| D[var\(--mat-sys-outline-variant\)]
    B -->|Focus border| E[var\(--mat-sys-primary\)]
    B -->|Error border| F[var\(--ax-error-default\)]
```

**Quick Reference:**

| Scenario      | Token                            |
| ------------- | -------------------------------- |
| Input border  | `var(--mat-sys-outline)`         |
| Divider line  | `var(--mat-sys-outline-variant)` |
| Card border   | `var(--mat-sys-outline)`         |
| Focused input | `var(--mat-sys-primary)`         |
| Error input   | `var(--ax-error-default)`        |

---

## Token Categories

### 1. Material Surface Tokens

Use Material tokens for all surface-related styling:

```scss
// ✅ Correct: Material surface tokens
.dialog-container {
  background: var(--mat-sys-surface); // Main surface
}

.card-elevated {
  background: var(--mat-sys-surface-container); // Elevated surface
}

.subtle-background {
  background: var(--mat-sys-surface-container-low); // Subtle surface
}

// ❌ Wrong: Custom surface tokens
.dialog-container {
  background: var(--ax-background-default); // Don't use for dialogs
}
```

**Available Material Surface Tokens:**

- `--mat-sys-surface` - Main surface color
- `--mat-sys-surface-container` - Elevated surface (cards, dialogs)
- `--mat-sys-surface-container-high` - Higher elevation
- `--mat-sys-surface-container-low` - Subtle surface
- `--mat-sys-surface-variant` - Alternative surface

### 2. Material Text Tokens

Use Material tokens for all text colors:

```scss
// ✅ Correct: Material text tokens
.title {
  color: var(--mat-sys-on-surface); // Primary text
}

.subtitle {
  color: var(--mat-sys-on-surface-variant); // Secondary text
}

// ❌ Wrong: Custom text tokens
.title {
  color: var(--ax-text-heading); // Don't use, use Material instead
}
```

**Available Material Text Tokens:**

- `--mat-sys-on-surface` - Primary text on surface
- `--mat-sys-on-surface-variant` - Secondary text on surface
- `--mat-sys-on-primary` - Text on primary color
- `--mat-sys-on-error` - Text on error color

### 3. Material Border Tokens

Use Material tokens for borders and outlines:

```scss
// ✅ Correct: Material outline tokens
.card {
  border: 1px solid var(--mat-sys-outline);
}

.divider {
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

// ❌ Wrong: Custom border tokens
.card {
  border: 1px solid var(--ax-border-default); // Don't use
}
```

**Available Material Border Tokens:**

- `--mat-sys-outline` - Standard border/outline
- `--mat-sys-outline-variant` - Subtle border
- `--mat-sys-primary` - Focus border
- `--mat-sys-error` - Error border

### 4. AegisX Semantic Color Tokens

Use AegisX tokens for semantic colors (success, warning, error, info):

```scss
// ✅ Correct: AegisX semantic colors
.success-banner {
  background: var(--ax-success-faint); // Light success background
  color: var(--ax-success-emphasis); // Dark success text
  border: 1px solid var(--ax-success-default);
}

.icon-success {
  background: var(--ax-success-default);
  color: var(--ax-success-inverted); // White text on colored background
}
```

**Available AegisX Semantic Tokens:**

Each semantic color has these variants:

- `--ax-{color}-faint` - Very light background (10% opacity)
- `--ax-{color}-default` - Standard color (solid)
- `--ax-{color}-emphasis` - Darker variant (text on light background)
- `--ax-{color}-inverted` - Light text (on colored background)

Colors: `success`, `warning`, `error`, `info`, `brand`

### 5. AegisX Spacing Tokens

Use AegisX spacing tokens for consistent spacing:

```scss
// ✅ Correct: AegisX spacing tokens
.card {
  padding: var(--ax-spacing-lg);
  margin-bottom: var(--ax-spacing-xl);
  gap: var(--ax-spacing-md);
}

// ❌ Wrong: Hardcoded values
.card {
  padding: 16px; // Don't hardcode, use tokens
}
```

**Available Spacing Tokens:**

- `--ax-spacing-xs` - 0.25rem (4px)
- `--ax-spacing-sm` - 0.5rem (8px)
- `--ax-spacing-md` - 1rem (16px)
- `--ax-spacing-lg` - 1.5rem (24px)
- `--ax-spacing-xl` - 2rem (32px)
- `--ax-spacing-2xl` - 3rem (48px)

### 6. AegisX Radius Tokens

Use AegisX radius tokens for border-radius:

```scss
// ✅ Correct: AegisX radius tokens
.card {
  border-radius: var(--ax-radius-lg);
}

.button {
  border-radius: var(--ax-radius-md);
}

.avatar {
  border-radius: var(--ax-radius-full); // 50% circle
}
```

**Available Radius Tokens:**

- `--ax-radius-sm` - 0.25rem (4px)
- `--ax-radius-md` - 0.5rem (8px)
- `--ax-radius-lg` - 0.75rem (12px)
- `--ax-radius-xl` - 1rem (16px)
- `--ax-radius-2xl` - 1.5rem (24px)
- `--ax-radius-full` - 50% (circle)

---

## Common Scenarios

### Scenario 1: Creating a Dialog Component

```scss
// ✅ Correct approach
.my-dialog {
  // Use Material for surface
  background: var(--mat-sys-surface);

  // Use Material for border
  border: 1px solid var(--mat-sys-outline);

  // Use AegisX for spacing and radius
  padding: var(--ax-spacing-xl);
  border-radius: var(--ax-radius-lg);

  // Use Material for elevation (if needed)
  box-shadow: var(--mat-sys-level3);
}

.my-dialog-title {
  // Use Material for text
  color: var(--mat-sys-on-surface);

  // Use AegisX for spacing
  margin-bottom: var(--ax-spacing-md);
}
```

### Scenario 2: Creating a Success Banner

```scss
// ✅ Correct approach
.success-banner {
  // Use AegisX semantic colors
  background: var(--ax-success-faint);
  color: var(--ax-success-emphasis);
  border-left: 4px solid var(--ax-success-default);

  // Use AegisX for spacing and radius
  padding: var(--ax-spacing-md) var(--ax-spacing-lg);
  border-radius: var(--ax-radius-md);
}
```

### Scenario 3: Creating a Card Component

```scss
// ✅ Correct approach
.card {
  // Use Material for elevated surface
  background: var(--mat-sys-surface-container);

  // Use Material for border (optional)
  border: 1px solid var(--mat-sys-outline-variant);

  // Use Material for elevation
  box-shadow: var(--mat-sys-level1);

  // Use AegisX for spacing and radius
  padding: var(--ax-spacing-lg);
  border-radius: var(--ax-radius-lg);
}

.card-title {
  color: var(--mat-sys-on-surface);
  margin-bottom: var(--ax-spacing-sm);
}

.card-description {
  color: var(--mat-sys-on-surface-variant);
}
```

### Scenario 4: Creating Form Inputs

```scss
// ✅ Correct approach (usually you'd use Material components, but for custom inputs)
.custom-input {
  background: var(--mat-sys-surface);
  border: 1px solid var(--mat-sys-outline);
  color: var(--mat-sys-on-surface);
  padding: var(--ax-spacing-sm) var(--ax-spacing-md);
  border-radius: var(--ax-radius-md);

  &:focus {
    border-color: var(--mat-sys-primary);
    outline: 2px solid color-mix(in srgb, var(--mat-sys-primary) 20%, transparent);
  }

  &:disabled {
    background: var(--ax-background-subtle);
    color: var(--ax-text-disabled);
  }

  &.error {
    border-color: var(--ax-error-default);
  }
}

.input-label {
  color: var(--mat-sys-on-surface-variant);
  font-size: var(--ax-text-sm);
  margin-bottom: var(--ax-spacing-xs);
}
```

---

## Do's and Don'ts

### ✅ DO

1. **Use Material tokens for surfaces**

   ```scss
   background: var(--mat-sys-surface);
   ```

2. **Use Material tokens for text**

   ```scss
   color: var(--mat-sys-on-surface);
   ```

3. **Use Material tokens for borders**

   ```scss
   border: 1px solid var(--mat-sys-outline);
   ```

4. **Use AegisX tokens for semantic colors**

   ```scss
   background: var(--ax-success-faint);
   color: var(--ax-success-emphasis);
   ```

5. **Use AegisX tokens for spacing**

   ```scss
   padding: var(--ax-spacing-lg);
   gap: var(--ax-spacing-md);
   ```

6. **Use color-mix() for dynamic shadows**
   ```scss
   box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--ax-success-default) 30%, transparent);
   ```

### ❌ DON'T

1. **Don't use custom tokens for surfaces**

   ```scss
   background: var(--ax-background-default); // ❌ Use --mat-sys-surface instead
   ```

2. **Don't use custom tokens for text**

   ```scss
   color: var(--ax-text-heading); // ❌ Use --mat-sys-on-surface instead
   ```

3. **Don't use custom tokens for borders**

   ```scss
   border: 1px solid var(--ax-border-default); // ❌ Use --mat-sys-outline instead
   ```

4. **Don't hardcode RGB values**

   ```scss
   box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3); // ❌ Use color-mix() instead
   ```

5. **Don't hardcode spacing**

   ```scss
   padding: 16px; // ❌ Use var(--ax-spacing-md) instead
   ```

6. **Don't create utility classes**
   ```scss
   .my-flex {
     display: flex;
   } // ❌ Use Tailwind instead
   ```

---

## Migration Guide

### From Old Dialog Styles to Material-First

**Before (v1.0):**

```scss
.my-dialog {
  background: var(--ax-background-default);
  color: var(--ax-text-heading);
  border: 1px solid var(--ax-border-default);
}

.my-dialog-subtitle {
  color: var(--ax-text-secondary);
}
```

**After (v2.0 - Material-First):**

```scss
.my-dialog {
  background: var(--mat-sys-surface); // ✅ Material surface
  color: var(--mat-sys-on-surface); // ✅ Material text
  border: 1px solid var(--mat-sys-outline); // ✅ Material border
}

.my-dialog-subtitle {
  color: var(--mat-sys-on-surface-variant); // ✅ Material secondary text
}
```

### From Utility Classes to Tailwind

**Before (v1.0):**

```html
<div class="ax-dialog-flex ax-dialog-gap-lg ax-dialog-mt-md">
  <span class="ax-dialog-text-sm">Content</span>
</div>
```

**After (v2.0 - Tailwind):**

```html
<div class="flex gap-6 mt-4">
  <span class="text-sm">Content</span>
</div>
```

### From Hardcoded Colors to Tokens

**Before (v1.0):**

```scss
.success-icon {
  background: #10b981;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}
```

**After (v2.0 - Dynamic Tokens):**

```scss
.success-icon {
  background: var(--ax-success-default);
  box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--ax-success-default) 30%, transparent);
}
```

---

## Need Help?

- **Full token reference:** See [TOKEN_REFERENCE.md](./TOKEN_REFERENCE.md)
- **Dialog examples:** See [COMPONENT_USAGE.md](../COMPONENT_USAGE.md)
- **Migration assistance:** See [MIGRATION_DIALOG_V2.md](../MIGRATION_DIALOG_V2.md)

---

**Last Updated:** 2025-01-19
**Version:** 2.0.0
**Maintained by:** AegisX UI Team
