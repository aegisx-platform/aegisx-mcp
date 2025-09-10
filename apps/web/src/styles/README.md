# AegisX Styles Documentation

This directory contains organized SCSS files for the AegisX Platform.

## 📂 Structure

```
styles/
├── components/
│   ├── _form-utilities.scss    # Form & Button utility classes
│   └── _material-fixes.scss    # Material Design component fixes
└── README.md                   # This file
```

## 🎯 Form Utilities

### Available Classes

| Class            | Form Fields | Buttons | Icon Buttons     | Use Case          |
| ---------------- | ----------- | ------- | ---------------- | ----------------- |
| `.form-xs`       | 40px        | 32px    | 32px (icon 20px) | Extra small forms |
| `.form-compact`  | 48px        | 40px    | 40px             | Compact toolbars  |
| `.form-standard` | 56px        | 48px    | 48px             | Material standard |
| `.form-lg`       | 64px        | 56px    | 56px (icon 28px) | Large forms       |

### Usage Examples

```html
<!-- Compact toolbar -->
<div class="form-compact">
  <mat-form-field appearance="outline">
    <input matInput placeholder="Search" />
  </mat-form-field>
  <button mat-stroked-button>Filter</button>
  <button mat-raised-button color="primary">Add</button>
</div>

<!-- Standard form -->
<div class="form-standard">
  <mat-form-field appearance="outline">
    <input matInput placeholder="Username" />
  </mat-form-field>
  <button mat-raised-button color="primary">Save</button>
</div>
```

### Layout Utilities

```html
<!-- Flex layout -->
<div class="form-compact flex">
  <!-- Elements will be in a flex row with gap -->
</div>

<!-- Grid layout -->
<div class="form-compact grid">
  <!-- Elements will be in a responsive grid -->
</div>

<!-- Responsive grid -->
<div class="form-compact grid-responsive">
  <!-- 1 col on mobile, 2-4 cols on larger screens -->
</div>
```

## 🔧 Material Design Fixes

The `_material-fixes.scss` file contains fixes for common Angular Material issues:

- Form field appearance fixes
- Border and outline corrections
- Dark mode support
- Input element styling
- Select and datepicker fixes

## 🎨 Design System

All utility classes follow a consistent design system:

### Sizing Scale

- **xs**: 32-40px (extra small)
- **compact**: 40-48px (compact)
- **standard**: 48-56px (Material standard)
- **lg**: 56-64px (large)

### Spacing Scale

- Gap between elements: 0.75rem (12px)
- Padding: Proportional to component size
- Margins: Minimal, using flexbox/grid gaps instead

## 🚀 Best Practices

1. **Consistent Sizing**: Use utility classes instead of custom CSS
2. **Layout Classes**: Combine sizing with layout utilities (.flex, .grid)
3. **Responsive Design**: Use .grid-responsive for mobile-first design
4. **Accessibility**: All sizes maintain proper touch targets (min 40px)

## 📱 Responsive Behavior

### Grid Responsive Breakpoints

- **Mobile** (< 640px): 1 column
- **Tablet** (640px+): 2 columns
- **Desktop** (768px+): 3 columns
- **Large** (1024px+): 4 columns

### Form Field Behavior

- All form utilities maintain proper label positioning
- Focus states work correctly across all sizes
- Icons and prefixes/suffixes scale appropriately

## 🔄 Migration Guide

### From Global Styles to Utility Classes

**Before:**

```scss
.my-form .mat-mdc-form-field {
  height: 48px !important;
}
```

**After:**

```html
<div class="form-compact">
  <mat-form-field>...</mat-form-field>
</div>
```

### Benefits of New Approach

- ✅ Consistent sizing across the app
- ✅ Better maintainability
- ✅ Reusable components
- ✅ Less CSS specificity issues
- ✅ Built-in responsive behavior
