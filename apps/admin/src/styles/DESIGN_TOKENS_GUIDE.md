# AegisX Design Tokens Usage Guide

> **Complete reference for using AegisX Design System tokens correctly**
>
> Last Updated: 2025-01-14

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Text Color Hierarchy](#text-color-hierarchy)
3. [Background Colors](#background-colors)
4. [Border Colors](#border-colors)
5. [Brand/Primary Colors](#brandprimary-colors)
6. [Semantic Colors](#semantic-colors)
7. [Spacing Scale](#spacing-scale)
8. [Typography Scale](#typography-scale)
9. [Shadows & Elevation](#shadows--elevation)
10. [Border Radius](#border-radius)
11. [Z-Index Layering](#z-index-layering)
12. [Transitions & Motion](#transitions--motion)
13. [Accessibility](#accessibility)
14. [Migration from Legacy Names](#migration-from-legacy-names)
15. [Quick Reference](#quick-reference)

---

## Overview

AegisX Design System provides **100+ CSS custom properties (tokens)** that ensure visual consistency across the application. All tokens are **theme-aware** and automatically adapt when switching between light/dark modes.

### Token Categories

| Category             | Count | Theme-aware       |
| -------------------- | ----- | ----------------- |
| Text Colors          | 6     | ✅                |
| Background Colors    | 4     | ✅                |
| Border Colors        | 3     | ✅                |
| Brand Colors         | 6     | ✅                |
| Success/Warning/Info | 18    | ✅                |
| Spacing              | 8     | ❌ (same in both) |
| Typography           | 20    | ❌                |
| Shadows              | 3     | ✅                |
| Z-Index              | 7     | ❌                |
| Transitions          | 4     | ❌                |

---

## Text Color Hierarchy

Use **semantic names** based on content hierarchy, not appearance.

### Available Tokens

```scss
--aegisx-text-heading      // H1, H2, H3 headings (#1f2937 light, #f3f4f6 dark)
--aegisx-text-primary      // Body text, paragraphs (#374151 light, #d1d5db dark)
--aegisx-text-secondary    // Descriptions, subtitles (#6b7280 light, #9ca3af dark)
--aegisx-text-subtle       // Hints, placeholders (#9ca3af light, #6b7280 dark)
--aegisx-text-disabled     // Disabled states (#d1d5db light, #4b5563 dark)
--aegisx-text-inverted     // Text on colored backgrounds (#ffffff light, #111827 dark)
```

### When to Use Each

| Token                     | Use Case                     | Examples                                 |
| ------------------------- | ---------------------------- | ---------------------------------------- |
| `--aegisx-text-heading`   | Page titles, section headers | `<h1>`, `<h2>`, `.docs-title`            |
| `--aegisx-text-primary`   | Main content text            | `<p>`, body copy, table cells            |
| `--aegisx-text-secondary` | Supporting text              | Descriptions, captions, `.docs-subtitle` |
| `--aegisx-text-subtle`    | Low-priority text            | Timestamps, helper text, placeholders    |
| `--aegisx-text-disabled`  | Inactive elements            | Disabled buttons, inactive tabs          |
| `--aegisx-text-inverted`  | High-contrast text           | White text on brand color buttons        |

### Code Examples

```html
<!-- ✅ CORRECT: Semantic usage -->
<h1 class="docs-title">Dashboard</h1>
<p class="docs-subtitle">Welcome back! Here's what's happening today.</p>

<!-- ❌ WRONG: Inline styles -->
<h1 style="color: var(--aegisx-text-strong)">Dashboard</h1>
<p style="color: var(--aegisx-text-body)">Welcome back!</p>
```

```scss
// ✅ CORRECT: Use in CSS
.page-title {
  color: var(--aegisx-text-heading);
  font-size: var(--aegisx-text-3xl);
  font-weight: var(--aegisx-font-bold);
}

.page-description {
  color: var(--aegisx-text-secondary);
  font-size: var(--aegisx-text-base);
}
```

---

## Background Colors

Four levels of background intensity for creating visual hierarchy.

### Available Tokens

```scss
--aegisx-background-default   // Main content area (#ffffff light, #111827 dark)
--aegisx-background-subtle    // Cards, panels (#f3f4f6 light, #1f2937 dark)
--aegisx-background-muted     // Hover states, secondary (#f9fafb light, #131a2b dark)
--aegisx-background-emphasis  // Active/selected (#374151 light, #d1d5db dark)
```

### Visual Hierarchy

```
Lightest → Darkest (Light Theme)
#ffffff → #f9fafb → #f3f4f6 → #374151

Darkest → Lightest (Dark Theme)
#111827 → #131a2b → #1f2937 → #d1d5db
```

### When to Use Each

| Token                          | Use Case           | Examples                               |
| ------------------------------ | ------------------ | -------------------------------------- |
| `--aegisx-background-default`  | Main content       | Page background, main containers       |
| `--aegisx-background-subtle`   | Elevated content   | Cards, panels, mat-card                |
| `--aegisx-background-muted`    | Interactive states | Hover backgrounds, example boxes       |
| `--aegisx-background-emphasis` | Active states      | Selected rows, active navigation items |

### Code Examples

```scss
// Card with subtle background
.card {
  background: var(--aegisx-background-subtle);
  border: 1px solid var(--aegisx-border-default);
  border-radius: var(--aegisx-radius-lg);
}

// Hover state
.list-item {
  &:hover {
    background: var(--aegisx-background-muted);
  }

  &.active {
    background: var(--aegisx-background-emphasis);
    color: var(--aegisx-text-inverted);
  }
}
```

---

## Border Colors

Three levels of border visibility for different emphasis.

### Available Tokens

```scss
--aegisx-border-muted      // Subtle dividers (#f3f4f6 light, #1f2937 dark)
--aegisx-border-default    // Standard borders (#e5e7eb light, #374151 dark)
--aegisx-border-emphasis   // Strong borders (#d1d5db light, #4b5563 dark)
```

### When to Use Each

| Token                      | Use Case                           |
| -------------------------- | ---------------------------------- |
| `--aegisx-border-muted`    | Subtle dividers, table rows        |
| `--aegisx-border-default`  | Card borders, input borders        |
| `--aegisx-border-emphasis` | Focus states, important boundaries |

---

## Brand/Primary Colors

Six-level scale for brand color usage with Tremor-inspired naming.

### Available Tokens

```scss
--aegisx-brand-faint      // Lightest (#e8eaf6 light, #1a237e dark)
--aegisx-brand-muted      // Light (#9fa8da light, #283593 dark)
--aegisx-brand-subtle     // Medium-light (#5c6bc0 light, #3949ab dark)
--aegisx-brand-default    // Main brand color (#3f51b5 light, #5c6bc0 dark)
--aegisx-brand-emphasis   // Strong (#303f9f light, #9fa8da dark)
--aegisx-brand-inverted   // Contrast (#ffffff light, #1a237e dark)
```

### Visual Scale (Light Theme)

```
Lightest ────────────────────────► Darkest
faint   muted   subtle   default   emphasis   inverted
#e8eaf6 #9fa8da #5c6bc0  #3f51b5  #303f9f   #ffffff
```

### When to Use Each

```scss
// Primary action button
.btn-primary {
  background: var(--aegisx-brand-default);
  color: var(--aegisx-brand-inverted);

  &:hover {
    background: var(--aegisx-brand-emphasis);
  }
}

// Brand accent backgrounds
.info-box {
  background: var(--aegisx-brand-faint);
  border-left: 4px solid var(--aegisx-brand-default);
}

// Brand links
.brand-link {
  color: var(--aegisx-brand-default);

  &:hover {
    color: var(--aegisx-brand-emphasis);
  }
}
```

---

## Semantic Colors

Success, Warning, and Info colors follow the same 6-level scale as Brand colors.

### Success Colors (Green)

```scss
--aegisx-success-faint      // Backgrounds (#d1fae5)
--aegisx-success-muted      // Subtle highlights (#6ee7b7)
--aegisx-success-subtle     // Light text (#34d399)
--aegisx-success-default    // Main success color (#10b981)
--aegisx-success-emphasis   // Strong success (#059669)
--aegisx-success-inverted   // Contrast text (#ffffff)
```

### Warning Colors (Amber)

```scss
--aegisx-warning-faint      // Backgrounds (#fef3c7)
--aegisx-warning-muted      // Subtle highlights (#fcd34d)
--aegisx-warning-subtle     // Light text (#fbbf24)
--aegisx-warning-default    // Main warning color (#f59e0b)
--aegisx-warning-emphasis   // Strong warning (#d97706)
--aegisx-warning-inverted   // Contrast text (#ffffff)
```

### Info Colors (Blue)

```scss
--aegisx-info-faint         // Backgrounds (#dbeafe)
--aegisx-info-muted         // Subtle highlights (#93c5fd)
--aegisx-info-subtle        // Light text (#60a5fa)
--aegisx-info-default       // Main info color (#3b82f6)
--aegisx-info-emphasis      // Strong info (#2563eb)
--aegisx-info-inverted      // Contrast text (#ffffff)
```

### Usage Patterns

```scss
// Success badge
.badge-success {
  background: var(--aegisx-success-faint);
  color: var(--aegisx-success-emphasis);
  border: 1px solid var(--aegisx-success-muted);
}

// Warning alert
.alert-warning {
  background: var(--aegisx-warning-faint);
  border-left: 4px solid var(--aegisx-warning-default);
  color: var(--aegisx-text-primary);
}

// Info notification
.notification-info {
  background: var(--aegisx-info-default);
  color: var(--aegisx-info-inverted);
}
```

---

## Spacing Scale

8-point grid system (4px base unit) for consistent spacing.

### Available Tokens

```scss
--aegisx-spacing-xs    // 4px   - Tight spacing
--aegisx-spacing-sm    // 8px   - Small spacing
--aegisx-spacing-md    // 16px  - Medium spacing (base)
--aegisx-spacing-lg    // 24px  - Large spacing
--aegisx-spacing-xl    // 32px  - Extra large
--aegisx-spacing-2xl   // 40px  - 2x extra large
--aegisx-spacing-3xl   // 48px  - 3x extra large
--aegisx-spacing-4xl   // 64px  - 4x extra large
```

### Usage Guidelines

```scss
// Component spacing
.card {
  padding: var(--aegisx-spacing-lg); // 24px
  margin-bottom: var(--aegisx-spacing-md); // 16px
}

// Form field gaps
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--aegisx-spacing-sm); // 8px between fields
}

// Section spacing
.section {
  margin-bottom: var(--aegisx-spacing-3xl); // 48px
}
```

---

## Typography Scale

Font sizes, weights, and line heights for consistent typography.

### Font Sizes (Tailwind-compatible)

```scss
--aegisx-text-xs     // 12px - Tiny labels
--aegisx-text-sm     // 14px - Small text
--aegisx-text-base   // 16px - Body text
--aegisx-text-lg     // 18px - Large body
--aegisx-text-xl     // 20px - Small headings
--aegisx-text-2xl    // 24px - Medium headings
--aegisx-text-3xl    // 30px - Large headings
--aegisx-text-4xl    // 36px - Page titles
```

### Font Weights

```scss
--aegisx-font-normal     // 400 - Body text
--aegisx-font-medium     // 500 - Emphasized text
--aegisx-font-semibold   // 600 - Subheadings
--aegisx-font-bold       // 700 - Headings
```

### Line Heights

```scss
--aegisx-leading-tight     // 1.25 - Headings
--aegisx-leading-normal    // 1.5  - Body text
--aegisx-leading-relaxed   // 1.75 - Long-form content
```

### Typography Patterns

```scss
// Page title
.docs-title {
  font-size: var(--aegisx-text-3xl);
  font-weight: var(--aegisx-font-bold);
  line-height: var(--aegisx-leading-tight);
  color: var(--aegisx-text-heading);
}

// Section heading
.section-header h2 {
  font-size: var(--aegisx-text-2xl);
  font-weight: var(--aegisx-font-semibold);
  color: var(--aegisx-text-heading);
}

// Body text
.body-text {
  font-size: var(--aegisx-text-base);
  font-weight: var(--aegisx-font-normal);
  line-height: var(--aegisx-leading-normal);
  color: var(--aegisx-text-primary);
}
```

---

## Shadows & Elevation

Three shadow levels for Tremor-style minimal elevation.

### Available Tokens

```scss
--aegisx-shadow-sm   // Subtle shadow for cards
--aegisx-shadow-md   // Medium shadow for hover states
--aegisx-shadow-lg   // Strong shadow for modals
```

### Shadow Values (Light Theme)

```css
--aegisx-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--aegisx-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--aegisx-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

### Usage

```scss
// Card with subtle shadow
.card {
  box-shadow: var(--aegisx-shadow-sm);

  &:hover {
    box-shadow: var(--aegisx-shadow-md);
  }
}

// Modal with strong shadow
.modal {
  box-shadow: var(--aegisx-shadow-lg);
}
```

---

## Border Radius

Six radius values for consistent corner rounding.

### Available Tokens

```scss
--aegisx-radius-sm    // 4px   - Small elements (badges)
--aegisx-radius-md    // 6px   - Standard elements (buttons, inputs)
--aegisx-radius-lg    // 8px   - Large elements (cards)
--aegisx-radius-xl    // 12px  - Extra large cards
--aegisx-radius-2xl   // 16px  - Modals, dialogs
--aegisx-radius-full  // 9999px - Fully rounded (pills, avatars)
```

### Usage Patterns

```scss
// Button
.btn {
  border-radius: var(--aegisx-radius-md);
}

// Card
.card {
  border-radius: var(--aegisx-radius-lg);
}

// Badge
.badge {
  border-radius: var(--aegisx-radius-full);
}

// Avatar
.avatar {
  border-radius: var(--aegisx-radius-full);
}
```

---

## Z-Index Layering

Consistent z-index scale for UI layering.

### Available Tokens

```scss
--aegisx-z-base      // 0    - Normal flow
--aegisx-z-dropdown  // 1000 - Dropdowns, menus
--aegisx-z-sticky    // 1100 - Sticky headers
--aegisx-z-fixed     // 1200 - Fixed positioning
--aegisx-z-overlay   // 1300 - Backdrops
--aegisx-z-modal     // 1400 - Modals, dialogs
--aegisx-z-toast     // 1500 - Toasts, notifications
```

### Layering Hierarchy

```
Toast (1500)       ← Highest (always visible)
  ↓
Modal (1400)
  ↓
Overlay (1300)
  ↓
Fixed (1200)
  ↓
Sticky (1100)
  ↓
Dropdown (1000)
  ↓
Base (0)           ← Normal flow
```

---

## Transitions & Motion

Four transition speeds for consistent animations.

### Available Tokens

```scss
--aegisx-transition-fast    // 150ms ease - Quick interactions
--aegisx-transition-base    // 200ms ease - Standard transitions
--aegisx-transition-slow    // 300ms ease - Deliberate animations
--aegisx-transition-slower  // 400ms ease - Complex animations
```

### Usage

```scss
// Button hover
.btn {
  transition: background-color var(--aegisx-transition-fast);

  &:hover {
    background-color: var(--aegisx-brand-emphasis);
  }
}

// Dropdown menu
.dropdown-menu {
  transition:
    opacity var(--aegisx-transition-base),
    transform var(--aegisx-transition-base);
}

// Page transitions
.page-transition {
  transition: all var(--aegisx-transition-slow);
}
```

---

## Accessibility

WCAG-compliant accessibility tokens.

### Available Tokens

```scss
--aegisx-a11y-focus-indicator-thickness  // 2px  - Focus ring width
--aegisx-a11y-focus-indicator-offset     // 2px  - Focus ring offset
--aegisx-a11y-touch-target-min           // 48px - Minimum touch size
--aegisx-a11y-text-min-contrast          // 4.5  - WCAG AA ratio
--aegisx-a11y-text-enhanced-contrast     // 7.0  - WCAG AAA ratio
```

### Usage

```scss
// Focus ring
.btn:focus-visible {
  outline: var(--aegisx-a11y-focus-indicator-thickness) solid var(--aegisx-brand-default);
  outline-offset: var(--aegisx-a11y-focus-indicator-offset);
}

// Touch target
.touch-button {
  min-height: var(--aegisx-a11y-touch-target-min);
  min-width: var(--aegisx-a11y-touch-target-min);
}
```

---

## Migration from Legacy Names

### Deprecated Tokens (Still Supported)

These tokens still work but are **deprecated**. Migrate to new names:

| ❌ Old (Deprecated)      | ✅ New (Recommended)      | Usage         |
| ------------------------ | ------------------------- | ------------- |
| `--aegisx-text-strong`   | `--aegisx-text-heading`   | Headings only |
| `--aegisx-text-emphasis` | `--aegisx-text-primary`   | Body text     |
| `--aegisx-text-body`     | `--aegisx-text-secondary` | Descriptions  |

### Migration Example

```scss
// ❌ OLD (Still works, but deprecated)
.page-title {
  color: var(--aegisx-text-strong);
}

.page-description {
  color: var(--aegisx-text-body);
}

// ✅ NEW (Recommended)
.page-title {
  color: var(--aegisx-text-heading);
}

.page-description {
  color: var(--aegisx-text-secondary);
}
```

---

## Quick Reference

### Common Patterns Cheat Sheet

```scss
/* ============================================
   PAGE HEADER
   ============================================ */
.docs-header {
  margin-bottom: var(--aegisx-spacing-lg);
}

.docs-title {
  font-size: var(--aegisx-text-3xl);
  font-weight: var(--aegisx-font-bold);
  color: var(--aegisx-text-heading);
  margin: 0;
}

.docs-subtitle {
  font-size: var(--aegisx-text-lg);
  color: var(--aegisx-text-secondary);
  line-height: var(--aegisx-leading-normal);
}

/* ============================================
   CARD
   ============================================ */
.card {
  background: var(--aegisx-background-subtle);
  border: 1px solid var(--aegisx-border-default);
  border-radius: var(--aegisx-radius-lg);
  padding: var(--aegisx-spacing-lg);
  box-shadow: var(--aegisx-shadow-sm);

  &:hover {
    box-shadow: var(--aegisx-shadow-md);
  }
}

/* ============================================
   BUTTON
   ============================================ */
.btn-primary {
  background: var(--aegisx-brand-default);
  color: var(--aegisx-brand-inverted);
  border-radius: var(--aegisx-radius-md);
  padding: var(--aegisx-spacing-sm) var(--aegisx-spacing-md);
  transition: background-color var(--aegisx-transition-fast);

  &:hover {
    background: var(--aegisx-brand-emphasis);
  }

  &:focus-visible {
    outline: var(--aegisx-a11y-focus-indicator-thickness) solid var(--aegisx-brand-default);
    outline-offset: var(--aegisx-a11y-focus-indicator-offset);
  }
}

/* ============================================
   FORM FIELD
   ============================================ */
.form-field {
  margin-bottom: var(--aegisx-spacing-md);
}

.form-label {
  font-size: var(--aegisx-text-sm);
  font-weight: var(--aegisx-font-medium);
  color: var(--aegisx-text-primary);
  margin-bottom: var(--aegisx-spacing-xs);
}

.form-input {
  border: 1px solid var(--aegisx-border-default);
  border-radius: var(--aegisx-radius-md);
  padding: var(--aegisx-spacing-sm);
  font-size: var(--aegisx-text-base);

  &:focus {
    border-color: var(--aegisx-brand-default);
    outline: none;
  }

  &::placeholder {
    color: var(--aegisx-text-subtle);
  }
}

/* ============================================
   ALERT
   ============================================ */
.alert-success {
  background: var(--aegisx-success-faint);
  border-left: 4px solid var(--aegisx-success-default);
  padding: var(--aegisx-spacing-md);
  border-radius: var(--aegisx-radius-md);
  color: var(--aegisx-text-primary);
}

.alert-warning {
  background: var(--aegisx-warning-faint);
  border-left: 4px solid var(--aegisx-warning-default);
  padding: var(--aegisx-spacing-md);
  border-radius: var(--aegisx-radius-md);
  color: var(--aegisx-text-primary);
}

.alert-info {
  background: var(--aegisx-info-faint);
  border-left: 4px solid var(--aegisx-info-default);
  padding: var(--aegisx-spacing-md);
  border-radius: var(--aegisx-radius-md);
  color: var(--aegisx-text-primary);
}
```

---

## Best Practices

### ✅ DO

- Use semantic token names (`--aegisx-text-heading` not `--aegisx-text-strong`)
- Use utility classes instead of inline styles
- Stick to the spacing scale (don't use arbitrary values)
- Test in both light and dark themes
- Use `--aegisx-text-primary` for body text, not `heading`

### ❌ DON'T

- Hardcode colors (`#374151` instead of `var(--aegisx-text-primary)`)
- Use inline styles for token values
- Mix legacy and new token names
- Create custom spacing values outside the scale
- Use heading tokens for body text

---

## Resources

- **Token File**: `/libs/aegisx-ui/src/lib/styles/themes/_aegisx-tokens.scss`
- **Theme Service**: `/apps/admin/src/app/services/tremor-theme.service.ts`
- **Documentation Patterns**: `/apps/admin/src/styles/documentation-patterns.scss`
- **Material Design 3**: https://m3.material.io/
- **Tremor Design**: https://tremor.so/

---

**Questions?** Check the token file for complete definitions and theme-specific values.
