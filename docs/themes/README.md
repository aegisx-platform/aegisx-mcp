# Tremor Theme System

Complete guide to the theming system in AegisX Admin application.

## Overview

This application uses a hybrid theming approach combining:

- **Angular Material 20** (Material Design 3) - UI components
- **AegisX Design Tokens** - Color palette and design tokens (CSS custom properties)
- **Tailwind CSS** - Layout utilities and spacing

## Architecture

```
Theming Stack:
├─ Angular Material Theme (mat.theme())
│  ├─ Color system (primary, tertiary, error)
│  ├─ Typography
│  └─ Density
│
├─ AegisX Design Tokens (CSS Variables)
│  ├─ --aegisx-background-*
│  ├─ --aegisx-content-*
│  ├─ --aegisx-brand-*
│  ├─ --aegisx-border-*
│  └─ --aegisx-success/warning/error-*
│
└─ Tailwind CSS
   └─ Layout utilities (flex, grid, gap, p-*, m-*)
```

## Available Themes

### Currently Active:

- **Tremor Light** (Default) - Clean, minimal light theme
- **Tremor Dark** - Professional dark theme

### Available (Optional):

Material prebuilt themes can be enabled in `tremor-theme.service.ts`:

- Indigo & Pink
- Deep Purple & Amber
- Pink & Blue Grey
- Purple & Green
- Azure Blue
- Cyan & Orange
- Magenta & Violet
- Rose & Red

> **Note:** Material prebuilt themes require AegisX design tokens to be added.
> See [how-to-add-theme.md](./how-to-add-theme.md) for instructions.

## Key Principles

### 1. Material-First Approach

✅ **DO:** Use Material components directly

```html
<mat-card>
  <mat-card-header>
    <mat-card-title>Title</mat-card-title>
  </mat-card-header>
  <mat-card-content> Content here </mat-card-content>
</mat-card>
```

❌ **DON'T:** Create custom component wrappers

```html
<!-- Don't do this -->
<tremor-card>
  <!-- Unnecessary wrapper -->
  <tremor-card-title>Title</tremor-card-title>
</tremor-card>
```

### 2. Styling with Design Tokens

✅ **DO:** Use Tremor CSS variables for colors

```html
<div style="color: var(--aegisx-text-strong)">Strong text</div>
```

❌ **DON'T:** Use hardcoded colors

```html
<!-- Don't do this -->
<div style="color: #111827">
  <!-- Won't change with theme -->
  Strong text
</div>
```

### 3. Layout with Tailwind

✅ **DO:** Use Tailwind for layout

```html
<div class="flex items-center gap-4 p-6">
  <mat-icon>check</mat-icon>
  <span>Item</span>
</div>
```

## Component Usage Examples

### Stat Cards

```html
<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
  <mat-card class="cursor-pointer hover:shadow-md transition-shadow">
    <mat-card-header class="flex items-center justify-between">
      <mat-card-title class="text-sm" style="color: var(--aegisx-text-body)"> Total Users </mat-card-title>
      <mat-icon color="primary">people</mat-icon>
    </mat-card-header>
    <mat-card-content>
      <div class="text-3xl font-bold" style="color: var(--aegisx-text-strong)">2,543</div>
      <div class="flex items-center gap-1 text-sm">
        <mat-icon class="text-green-600">trending_up</mat-icon>
        <span class="text-green-600">+12.5%</span>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

### Status Badges

```html
<mat-chip class="bg-green-100 text-green-800">
  <mat-icon class="text-base">check_circle</mat-icon>
  Active
</mat-chip>
```

### Data Tables

Material tables automatically styled with Tremor tokens - no additional work needed!

```html
<table mat-table [dataSource]="data">
  <!-- Material table works out of the box -->
</table>
```

## Theme Switching

Themes are switched dynamically at runtime using `TremorThemeService`:

```typescript
// In component
constructor(public themeService: TremorThemeService) {}

changeTheme(themeId: string): void {
  this.themeService.setTheme(themeId);
}
```

User's theme preference is persisted in `localStorage`.

## File Structure

```
apps/admin/src/styles/
├── themes/
│   ├── tremor-light.scss     # Light theme
│   ├── tremor-dark.scss      # Dark theme
│   └── _template.scss        # Template for new themes
│
├── styles.scss               # Global styles (no theme imports)
└── tremor-tokens.scss        # Design token documentation (optional)

apps/admin/src/app/services/
└── tremor-theme.service.ts   # Theme switching service

docs/themes/
├── README.md                 # This file
└── how-to-add-theme.md      # Guide for adding new themes
```

## Design Tokens Reference

### Background Colors

```scss
--aegisx-background-muted      // Subtle background
--aegisx-background-subtle     // Card/panel backgrounds
--aegisx-background-default    // Main background
--aegisx-background-emphasis   // Emphasized sections
```

### Content Colors

```scss
--aegisx-text-subtle        // Muted text (hints)
--aegisx-text-body       // Standard text
--aegisx-text-emphasis      // Important text
--aegisx-text-strong        // Headlines
--aegisx-content-inverted      // Text on dark bg
```

### Brand Colors

```scss
--aegisx-brand-faint          // Very light tint
--aegisx-brand-muted          // Light tint
--aegisx-brand-subtle         // Medium
--aegisx-brand-default        // Primary brand
--aegisx-brand-emphasis       // Darker
--aegisx-brand-inverted       // Text on brand
```

### Status Colors

```scss
// Success (green)
--aegisx-success-{faint,muted,subtle,default,emphasis,inverted}

// Warning (yellow/orange)
--aegisx-warning-{faint,muted,subtle,default,emphasis,inverted}

// Error (red)
--aegisx-error-{faint,muted,subtle,default,emphasis,inverted}

// Info (blue)
--aegisx-info-{faint,muted,subtle,default,emphasis,inverted}
```

## See Also

- **[How to Add a New Theme](./how-to-add-theme.md)** - Step-by-step guide
- **[Components Demo](../../apps/admin/src/app/pages/components-demo/)** - Live examples
- **[Angular Material Documentation](https://material.angular.io/)** - Material components
- **[Tremor Blocks](https://blocks.tremor.so/)** - AegisX design inspiration

## Questions?

For questions or issues:

1. Check [how-to-add-theme.md](./how-to-add-theme.md)
2. Review examples in Components Demo > Tremor Examples tab
3. Consult Angular Material documentation

---

**Last Updated:** 2025-01-10
