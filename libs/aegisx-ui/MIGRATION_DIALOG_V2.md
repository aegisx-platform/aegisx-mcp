# Migration Guide: Dialog Styles v1.0 → v2.0

**Version:** 2.0.0
**Date:** 2025-01-19
**Breaking Changes:** Yes

---

## 📋 Summary of Changes

### What Changed?

1. **Removed:** 80+ utility classes (`.ax-dialog-flex`, `.ax-dialog-gap-*`, `.ax-dialog-mt-*`, etc.)
2. **Updated:** All tokens to use Material Design tokens first (Material-First approach)
3. **Improved:** Dynamic shadows using `color-mix()` instead of hardcoded `rgba()`
4. **Refactored:** `@extend` patterns to `@mixin` for better CSS output

### What Stayed the Same?

✅ **Core structural classes** - All dialog component classes remain:

- `.ax-dialog-container`, `.ax-dialog-container-{sm|md|lg|xl}`
- `.ax-dialog-header`, `.ax-dialog-header-content`, `.ax-dialog-header-main`, `.ax-dialog-header-text`
- `.ax-dialog-icon-{success|warning|error|info|primary}`
- `.ax-dialog-title`, `.ax-dialog-subtitle`
- `.ax-dialog-close`
- `.ax-dialog-content`
- `.ax-dialog-actions`
- `.ax-dialog-section`, `.ax-dialog-section-title`, `.ax-dialog-section-content`
- `.ax-dialog-field-row`, `.ax-dialog-field-label`, `.ax-dialog-field-value`
- `.ax-dialog-status-{success|warning|error|info|neutral}`

---

## 🚨 Breaking Changes

### 1. Removed Utility Classes

**Impact:** ⚠️ HIGH if you used these classes

These classes no longer exist. Use Tailwind CSS instead:

| Old Class (REMOVED)         | Tailwind Replacement                |
| --------------------------- | ----------------------------------- |
| `.ax-dialog-flex`           | `flex`                              |
| `.ax-dialog-flex-column`    | `flex flex-col`                     |
| `.ax-dialog-flex-center`    | `flex items-center justify-center`  |
| `.ax-dialog-gap-sm`         | `gap-2`                             |
| `.ax-dialog-gap-md`         | `gap-4`                             |
| `.ax-dialog-gap-lg`         | `gap-6`                             |
| `.ax-dialog-mt-sm`          | `mt-2`                              |
| `.ax-dialog-mt-md`          | `mt-4`                              |
| `.ax-dialog-mt-lg`          | `mt-6`                              |
| `.ax-dialog-mb-sm`          | `mb-2`                              |
| `.ax-dialog-mb-md`          | `mb-4`                              |
| `.ax-dialog-mb-lg`          | `mb-6`                              |
| `.ax-dialog-text-sm`        | `text-sm`                           |
| `.ax-dialog-text-base`      | `text-base`                         |
| `.ax-dialog-text-lg`        | `text-lg`                           |
| `.ax-dialog-text-secondary` | (use semantic color tokens instead) |
| `.ax-dialog-text-muted`     | (use semantic color tokens instead) |
| `.ax-dialog-font-semibold`  | `font-semibold`                     |
| `.ax-dialog-font-bold`      | `font-bold`                         |

**Example Migration:**

```html
<!-- ❌ Before (v1.0) -->
<div class="ax-dialog-flex ax-dialog-gap-lg ax-dialog-mt-md">
  <span class="ax-dialog-text-sm ax-dialog-font-semibold">Content</span>
</div>

<!-- ✅ After (v2.0) -->
<div class="flex gap-6 mt-4">
  <span class="text-sm font-semibold">Content</span>
</div>
```

### 2. Updated Token Usage

**Impact:** ⚠️ LOW (automatic via CSS variables)

Dialog styles now use Material Design tokens automatically. This should be transparent to your components, but if you override styles, update them:

```scss
// ❌ Before (v1.0)
.my-custom-dialog {
  background: var(--ax-background-default);
  color: var(--ax-text-heading);
  border: 1px solid var(--ax-border-default);
}

// ✅ After (v2.0)
.my-custom-dialog {
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  border: 1px solid var(--mat-sys-outline);
}
```

### 3. Removed Content Variant Classes

**Impact:** ⚠️ LOW (rarely used)

These classes were removed:

- `.ax-dialog-content-no-padding` (use custom styles instead)
- `.ax-dialog-content-compact` (use custom styles instead)
- `.ax-dialog-section-metadata` (use `.ax-dialog-section-content` instead)

---

## ✅ Migration Steps

### Step 1: Check If You Used Removed Classes

Search your codebase for removed utility classes:

```bash
# Search for removed utility classes
grep -r "ax-dialog-flex\|ax-dialog-gap-\|ax-dialog-mt-\|ax-dialog-mb-\|ax-dialog-text-" apps/
```

**If found:** Proceed to Step 2.
**If not found:** Your code is compatible! Skip to Step 4.

### Step 2: Replace Utility Classes with Tailwind

For each file found, replace old classes with Tailwind equivalents:

**Mapping Table:**

```typescript
// Quick reference for replacements
const classMap = {
  'ax-dialog-flex': 'flex',
  'ax-dialog-flex-column': 'flex flex-col',
  'ax-dialog-flex-center': 'flex items-center justify-center',
  'ax-dialog-gap-sm': 'gap-2',
  'ax-dialog-gap-md': 'gap-4',
  'ax-dialog-gap-lg': 'gap-6',
  'ax-dialog-mt-sm': 'mt-2',
  'ax-dialog-mt-md': 'mt-4',
  'ax-dialog-mt-lg': 'mt-6',
  'ax-dialog-mb-sm': 'mb-2',
  'ax-dialog-mb-md': 'mb-4',
  'ax-dialog-mb-lg': 'mb-6',
  'ax-dialog-text-sm': 'text-sm',
  'ax-dialog-text-base': 'text-base',
  'ax-dialog-text-lg': 'text-lg',
  'ax-dialog-font-semibold': 'font-semibold',
  'ax-dialog-font-bold': 'font-bold',
};
```

### Step 3: Update Custom Styles (If Any)

If you have custom SCSS overriding dialog styles, update to use Material tokens:

```scss
// ❌ Before
::ng-deep .my-dialog {
  background: var(--ax-background-default);
}

// ✅ After
::ng-deep .my-dialog {
  background: var(--mat-sys-surface);
}
```

### Step 4: Test Your Dialogs

1. **Visual test:** Open each dialog in your app
2. **Theme test:** Switch between light and dark themes
3. **Responsive test:** Test on mobile/tablet/desktop

### Step 5: Build and Deploy

```bash
# Build the project
pnpm run build

# If successful, commit changes
git add libs/aegisx-ui/
git commit -m "refactor(ui): migrate to dialog styles v2.0 (Material-First)"
```

---

## 📚 Examples

### Example 1: Simple Dialog Migration

**Before (v1.0):**

```typescript
template: `
  <div class="ax-dialog-container-md">
    <div class="ax-dialog-header">
      <div class="ax-dialog-flex ax-dialog-gap-md">
        <h3 class="ax-dialog-title">My Dialog</h3>
      </div>
    </div>
    <div class="ax-dialog-content ax-dialog-mt-lg">
      <p class="ax-dialog-text-sm">Content here</p>
    </div>
  </div>
`;
```

**After (v2.0):**

```typescript
template: `
  <div class="ax-dialog-container-md">
    <div class="ax-dialog-header">
      <div class="flex gap-4">
        <h3 class="ax-dialog-title">My Dialog</h3>
      </div>
    </div>
    <div class="ax-dialog-content mt-6">
      <p class="text-sm">Content here</p>
    </div>
  </div>
`;
```

### Example 2: Form Dialog Migration

**Before (v1.0):**

```typescript
template: `
  <div class="ax-dialog-container-lg">
    <div class="ax-dialog-content">
      <div class="ax-dialog-flex-column ax-dialog-gap-lg">
        <div class="ax-dialog-flex-column ax-dialog-gap-sm">
          <label class="ax-dialog-text-sm ax-dialog-font-semibold">Name</label>
          <input type="text">
        </div>
        <button class="ax-dialog-mt-md">Submit</button>
      </div>
    </div>
  </div>
`;
```

**After (v2.0):**

```typescript
template: `
  <div class="ax-dialog-container-lg">
    <div class="ax-dialog-content">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold">Name</label>
          <input type="text">
        </div>
        <button class="mt-4">Submit</button>
      </div>
    </div>
  </div>
`;
```

---

## ❓ FAQ

### Q: Do I need to update existing dialog components?

**A:** Only if you used the removed utility classes (`.ax-dialog-flex`, `.ax-dialog-gap-*`, etc.). Core structural classes remain unchanged.

### Q: Will my dialogs look different after upgrading?

**A:** Visually identical in most cases. Material Design tokens ensure themes work correctly.

### Q: Can I still use component-specific styles?

**A:** Yes! You can still override styles using `::ng-deep` or component styles as before.

### Q: What about backwards compatibility?

**A:** Not provided for removed utility classes. We recommend using Tailwind CSS for all utility styling going forward.

### Q: How do I update custom dialog components?

**A:** Follow Step 2-3 above. Replace utility classes with Tailwind and update custom tokens to Material tokens.

---

## 🆘 Need Help?

- **Theming Guide:** [docs/THEMING_GUIDE.md](./docs/THEMING_GUIDE.md)
- **Token Reference:** [docs/TOKEN_REFERENCE.md](./docs/TOKEN_REFERENCE.md)
- **Component Usage:** [COMPONENT_USAGE.md](./COMPONENT_USAGE.md)

---

**Migration Checklist:**

- [ ] Search codebase for removed classes
- [ ] Replace utility classes with Tailwind
- [ ] Update custom styles to use Material tokens
- [ ] Test dialogs visually
- [ ] Test light/dark themes
- [ ] Test responsive behavior
- [ ] Build successfully
- [ ] Commit changes

---

**Last Updated:** 2025-01-19
**Version:** 2.0.0
