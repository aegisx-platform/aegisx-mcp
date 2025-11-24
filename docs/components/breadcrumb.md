# Breadcrumb Component Documentation

> **Navigation made simple** - Display hierarchical navigation paths with style and flexibility

---

## 📋 Overview

The Breadcrumb component (`AxBreadcrumbComponent`) is a navigation component that displays the current page's location within the navigational hierarchy. It helps users understand their location in the application and provides quick access to parent pages.

### Key Features

- 🎨 **Multiple Sizes** - sm, md, lg variants
- 🔤 **Text Separators** - Classic characters (/, ›, >, •, -, |)
- 🎯 **Icon Separators** - Material icons for modern look
- 🖼️ **Item Icons** - Optional icons for each breadcrumb item
- 📱 **Responsive** - Adapts to different screen sizes
- 🌙 **Dark Mode** - Full dark mode support
- ♿ **Accessible** - ARIA attributes and keyboard navigation
- 🎨 **Themeable** - Uses AegisX design tokens

---

## 🚀 Quick Start

### Installation

The Breadcrumb component is part of the `@aegisx/ui` library:

```typescript
import { AxBreadcrumbComponent } from '@aegisx/ui';

@Component({
  standalone: true,
  imports: [AxBreadcrumbComponent],
})
export class MyComponent {}
```

### Basic Usage

```html
<ax-breadcrumb [items]="breadcrumbs" (itemClick)="onBreadcrumbClick($event)"></ax-breadcrumb>
```

```typescript
breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Products', url: '/products' },
  { label: 'Electronics' }
];

onBreadcrumbClick(item: BreadcrumbItem): void {
  if (item.url) {
    this.router.navigate([item.url]);
  }
}
```

---

## 🎨 Size Variants

Control the breadcrumb size with the `size` property:

```html
<!-- Small -->
<ax-breadcrumb [items]="breadcrumbs" size="sm"></ax-breadcrumb>

<!-- Medium (Default) -->
<ax-breadcrumb [items]="breadcrumbs" size="md"></ax-breadcrumb>

<!-- Large -->
<ax-breadcrumb [items]="breadcrumbs" size="lg"></ax-breadcrumb>
```

**Size Specifications:**

- **sm**: 0.875rem (14px) font, 14px icons
- **md**: 1rem (16px) font, 16px icons _(default)_
- **lg**: 1.125rem (18px) font, 18px icons

---

## 🔤 Text Separators

Use classic text characters as separators:

```html
<!-- Default Slash -->
<ax-breadcrumb [items]="breadcrumbs" separator="/"></ax-breadcrumb>

<!-- Arrow -->
<ax-breadcrumb [items]="breadcrumbs" separator="›"></ax-breadcrumb>

<!-- Chevron -->
<ax-breadcrumb [items]="breadcrumbs" separator=">"></ax-breadcrumb>

<!-- Dot -->
<ax-breadcrumb [items]="breadcrumbs" separator="•"></ax-breadcrumb>

<!-- Dash -->
<ax-breadcrumb [items]="breadcrumbs" separator="-"></ax-breadcrumb>

<!-- Pipe -->
<ax-breadcrumb [items]="breadcrumbs" separator="|"></ax-breadcrumb>
```

---

## 🎯 Icon Separators

Use Material icons for a modern look:

```html
<!-- Chevron Right (Recommended) -->
<ax-breadcrumb [items]="breadcrumbs" separatorIcon="chevron_right"></ax-breadcrumb>

<!-- Navigate Next -->
<ax-breadcrumb [items]="breadcrumbs" separatorIcon="navigate_next"></ax-breadcrumb>

<!-- Arrow Forward iOS -->
<ax-breadcrumb [items]="breadcrumbs" separatorIcon="arrow_forward_ios"></ax-breadcrumb>

<!-- Keyboard Arrow Right -->
<ax-breadcrumb [items]="breadcrumbs" separatorIcon="keyboard_arrow_right"></ax-breadcrumb>
```

**Note**: When `separatorIcon` is provided, it overrides the `separator` text.

---

## 🖼️ Breadcrumb with Icons

Add icons to breadcrumb items for better visual recognition:

```typescript
breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', url: '/', icon: 'home' },
  { label: 'Products', url: '/products', icon: 'inventory_2' },
  { label: 'Electronics', url: '/products/electronics', icon: 'devices' },
  { label: 'Smartphones' }
];
```

```html
<ax-breadcrumb [items]="breadcrumbs" separatorIcon="chevron_right"></ax-breadcrumb>
```

---

## 📖 Real-World Examples

### Dashboard Navigation

```typescript
dashboardBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
  { label: 'Analytics', url: '/dashboard/analytics', icon: 'analytics' },
  { label: 'Reports', url: '/dashboard/analytics/reports', icon: 'assessment' },
  { label: 'Q4 2024 Summary' }
];
```

### E-Commerce Product Path

```typescript
productBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Store', url: '/store', icon: 'store' },
  { label: 'Catalog', url: '/store/catalog', icon: 'category' },
  { label: 'Women', url: '/store/catalog/women', icon: 'person' },
  { label: 'Dresses', url: '/store/catalog/women/dresses', icon: 'checkroom' },
  { label: 'Summer Collection 2024' }
];
```

### Settings Panel

```typescript
settingsBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Settings', url: '/settings', icon: 'settings' },
  { label: 'Account', url: '/settings/account', icon: 'account_circle' },
  { label: 'Security', url: '/settings/account/security', icon: 'security' },
  { label: 'Two-Factor Authentication' }
];
```

---

## 📚 API Reference

### Component Inputs

| Property        | Type                   | Default     | Description                                            |
| --------------- | ---------------------- | ----------- | ------------------------------------------------------ |
| `items`         | `BreadcrumbItem[]`     | `required`  | Array of breadcrumb items to display                   |
| `separator`     | `string`               | `'/'`       | Character to separate breadcrumb items                 |
| `separatorIcon` | `string`               | `undefined` | Material icon name for separator (overrides separator) |
| `size`          | `'sm' \| 'md' \| 'lg'` | `'md'`      | Size of the breadcrumb (font and icon size)            |

### Component Outputs

| Event       | Type             | Description                               |
| ----------- | ---------------- | ----------------------------------------- |
| `itemClick` | `BreadcrumbItem` | Emitted when a breadcrumb item is clicked |

### BreadcrumbItem Interface

```typescript
interface BreadcrumbItem {
  label: string; // Display text for the breadcrumb item
  url?: string; // Optional URL for navigation
  icon?: string; // Optional Material icon name
}
```

### BreadcrumbSize Type

```typescript
type BreadcrumbSize = 'sm' | 'md' | 'lg';
```

---

## ✅ Best Practices

### Do

- ✅ Use breadcrumbs for **multi-level navigation** hierarchies (3+ levels)
- ✅ Keep breadcrumb labels **concise and meaningful** (1-3 words)
- ✅ Make all **intermediate levels clickable** for easy navigation
- ✅ Position breadcrumbs **near the top** of the page
- ✅ Use icons **sparingly** to avoid visual clutter
- ✅ Show the current page as the **last item** (non-clickable)
- ✅ Use **consistent separator style** throughout the application
- ✅ Choose **icon separators** for modern, clean look
- ✅ Use **size="sm"** in compact layouts or dense interfaces

### Don't

- ❌ Don't use breadcrumbs for **single-level navigation**
- ❌ Don't include **very long or technical** labels
- ❌ Don't make the **current page** (last item) clickable
- ❌ Don't use breadcrumbs as the **primary navigation** method
- ❌ Don't show **more than 5-6 levels** (consider truncation)
- ❌ Don't mix **different separator styles** in the same app
- ❌ Don't use **different sizes** inconsistently
- ❌ Don't overuse **icons** - only use when they add value

---

## 🎯 Usage Patterns

### Pattern 1: Simple Navigation

**When to use**: Basic hierarchical navigation

```html
<ax-breadcrumb [items]="breadcrumbs" separator="/"></ax-breadcrumb>
```

### Pattern 2: Modern with Icons

**When to use**: Contemporary UI with visual hierarchy

```html
<ax-breadcrumb [items]="breadcrumbs" separatorIcon="chevron_right"></ax-breadcrumb>
```

### Pattern 3: Compact Layout

**When to use**: Dense interfaces, tables, or small screens

```html
<ax-breadcrumb [items]="breadcrumbs" size="sm" separatorIcon="chevron_right"></ax-breadcrumb>
```

### Pattern 4: Feature-rich Navigation

**When to use**: Important pages needing strong visual context

```html
<ax-breadcrumb [items]="breadcrumbsWithIcons" size="lg" separatorIcon="navigate_next"></ax-breadcrumb>
```

---

## 🎨 Styling & Theming

The Breadcrumb component uses AegisX design tokens for consistent theming:

### Color Tokens

```scss
--ax-text-primary      // Current page color
--ax-text-secondary    // Link and separator color
--ax-primary           // Hover color
```

### Spacing Tokens

```scss
--ax-spacing-xs        // Gap between items and separators
```

### Typography Tokens

```scss
--ax-font-size-xs      // Small size (14px)
--ax-font-size-sm      // Medium size (16px)
--ax-font-size-base    // Large size (18px)
--ax-line-height-normal
```

### Radius Tokens

```scss
--ax-radius-sm         // Focus outline radius
```

---

## ♿ Accessibility

The breadcrumb component follows accessibility best practices:

- ✅ **ARIA attributes**: `aria-label="Breadcrumb"`, `aria-current="page"`
- ✅ **Semantic HTML**: Uses `<nav>` and `<ol>` elements
- ✅ **Keyboard navigation**: All links are focusable
- ✅ **Focus indicators**: Clear 2px outline on focus
- ✅ **Screen reader friendly**: Proper semantic structure
- ✅ **Color contrast**: Meets WCAG AA standards

---

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Requirements**:

- Angular 17+
- Angular Material 17+

---

## 💡 Interactive Demo

Visit the live demo page to experiment with breadcrumb properties:

**Demo URL**: `/aegisx-ui/breadcrumb`

The interactive demo allows you to:

- Adjust size (sm, md, lg)
- Switch separator types (text/icon)
- Choose different separators
- Toggle item icons
- See generated code in real-time

---

## 📦 Component Location

**Path**: `libs/aegisx-ui/src/lib/components/navigation/breadcrumb/`

**Files**:

- `breadcrumb.component.ts` - Component logic
- `breadcrumb.component.html` - Template
- `breadcrumb.component.scss` - Styles

---

## 🔗 Related Components

- **Navigation Menu** - Main navigation component
- **Tabs** - Alternative navigation pattern
- **Stepper** - Sequential navigation

---

## 📝 Changelog

### v1.2.0 (Latest)

- ✨ Added `size` property with sm, md, lg variants
- ✨ Added `separatorIcon` support for Material icons
- 🎨 Fixed icon separator alignment with text
- 🎨 Improved responsive behavior
- 📚 Added interactive demo page

### v1.1.0

- ✨ Added icon support for breadcrumb items
- 🐛 Fixed focus outline styling

### v1.0.0

- 🎉 Initial release
- Basic breadcrumb functionality
- Text separator support
- Click event handling

---

## 🤝 Contributing

Found an issue or want to contribute? Please visit our [GitHub repository](https://github.com/your-org/aegisx-ui).

---

## 📄 License

This component is part of the AegisX UI library and is available under the MIT License.

---

**Last Updated**: 2025-11-24

**Maintained by**: AegisX Team
