# Material Dialog Standard

> **🚨 MANDATORY**: All new Material Dialog components MUST follow this standard to ensure consistent alignment and user experience across the application.

## Quick Reference

### Standard Dialog Header Structure

```html
<div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
  <div class="flex items-center gap-3">
    <mat-icon class="!text-2xl">[icon_name]</mat-icon>
    <h2 class="text-xl font-semibold m-0">[Dialog Title]</h2>
  </div>
  <button mat-icon-button mat-dialog-close>
    <mat-icon>close</mat-icon>
  </button>
</div>
```

### Complete Dialog Template

```html
<div class="[dialog-name]-dialog">
  <!-- Header - MANDATORY Structure -->
  <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
    <div class="flex items-center gap-3">
      <mat-icon class="!text-2xl">[icon_name]</mat-icon>
      <h2 class="text-xl font-semibold m-0">[Dialog Title]</h2>
    </div>
    <button mat-icon-button mat-dialog-close>
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <!-- Content -->
  <mat-dialog-content class="py-6">
    <!-- Your dialog content here -->
  </mat-dialog-content>

  <!-- Actions -->
  <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
    <button mat-button mat-dialog-close [disabled]="isLoading()">Cancel</button>
    <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="isLoading()">
      <mat-icon *ngIf="!isLoading()">check</mat-icon>
      <mat-spinner *ngIf="isLoading()" diameter="20" class="mr-2"></mat-spinner>
      Confirm
    </button>
  </mat-dialog-actions>
</div>
```

## Critical Requirements

### ✅ Header Structure (MANDATORY)

1. **Outer Container**: `<div mat-dialog-title class="flex items-center justify-between pb-4 border-b">`
2. **Left Side**: `<div class="flex items-center gap-3">` containing icon and title
3. **Icon**: `<mat-icon class="!text-2xl">[icon_name]</mat-icon>`
4. **Title**: `<h2 class="text-xl font-semibold m-0">[Dialog Title]</h2>`
5. **Right Side**: `<button mat-icon-button mat-dialog-close><mat-icon>close</mat-icon></button>`

### ✅ Required CSS Classes

| Element            | Required Classes                                  | Purpose                   |
| ------------------ | ------------------------------------------------- | ------------------------- |
| `mat-dialog-title` | `flex items-center justify-between pb-4 border-b` | Main header layout        |
| Left container     | `flex items-center gap-3`                         | Icon + title alignment    |
| Icon               | `!text-2xl`                                       | Standard icon size (24px) |
| Title              | `text-xl font-semibold m-0`                       | Typography and spacing    |
| Close button       | `mat-icon-button mat-dialog-close`                | Standard close button     |

### ✅ Integration with aegisx-ui

This standard works with the global CSS overrides in `/libs/aegisx-ui/src/lib/styles/vendor/fuse/overrides/angular-material.scss`:

- **Automatic alignment** for icons, text, and close buttons
- **Consistent spacing** and layout
- **Responsive design** support
- **Dark mode** compatibility

## Working Examples

### 1. Simple Dialog

```typescript
@Component({
  template: `
    <div class="confirmation-dialog">
      <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-red-600">warning</mat-icon>
          <h2 class="text-xl font-semibold m-0">Confirm Delete</h2>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="py-6">
        <p>Are you sure you want to delete this item?</p>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="warn" (click)="onDelete()">
          <mat-icon>delete</mat-icon>
          Delete
        </button>
      </mat-dialog-actions>
    </div>
  `
})
```

### 2. Form Dialog with Subtitle

```typescript
@Component({
  template: `
    <div class="user-edit-dialog">
      <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-blue-600">person_add</mat-icon>
          <div>
            <h2 class="text-xl font-semibold m-0">Edit User</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 m-0">
              {{ user.email }}
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="py-6">
        <form [formGroup]="userForm">
          <!-- Form fields here -->
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()">
          <mat-icon>save</mat-icon>
          Save Changes
        </button>
      </mat-dialog-actions>
    </div>
  `
})
```

## Icon Guidelines

### ✅ Standard Icons by Dialog Type

| Dialog Type   | Recommended Icon                        | Color Class       |
| ------------- | --------------------------------------- | ----------------- |
| Create/Add    | `add_circle`, `person_add`, `group_add` | `text-green-600`  |
| Edit/Update   | `edit`, `settings`                      | `text-blue-600`   |
| Delete/Remove | `warning`, `delete`                     | `text-red-600`    |
| View/Info     | `info`, `visibility`                    | `text-gray-600`   |
| Security      | `security`, `verified_user`             | `text-purple-600` |
| Schedule/Time | `schedule`, `event_available`           | `text-orange-600` |
| User/Account  | `person`, `account_circle`              | `text-indigo-600` |

### ✅ Icon Size and Styling

- **Always use**: `class="!text-2xl"` for consistent 24px size
- **Add color**: Use Tailwind color classes for semantic meaning
- **Material Icons**: Use only Material Icons for consistency

## Content Guidelines

### ✅ Dialog Content

```html
<mat-dialog-content class="py-6">
  <!-- Use py-6 for consistent vertical padding -->
  <!-- Add max-height and overflow for long content -->
  <div class="max-h-96 overflow-y-auto">
    <!-- Your content here -->
  </div>
</mat-dialog-content>
```

### ✅ Dialog Actions

```html
<mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
  <!-- Always include Cancel button with mat-dialog-close -->
  <button mat-button mat-dialog-close [disabled]="isLoading()">Cancel</button>

  <!-- Primary action button -->
  <button mat-raised-button color="primary" (click)="onPrimaryAction()" [disabled]="isLoading() || !isValid()">
    <mat-icon *ngIf="!isLoading()">check</mat-icon>
    <mat-spinner *ngIf="isLoading()" diameter="20" class="mr-2"></mat-spinner>
    {{ isLoading() ? 'Processing...' : 'Confirm' }}
  </button>
</mat-dialog-actions>
```

## Common Mistakes to Avoid

### ❌ Wrong Header Structure

```html
<!-- DON'T DO THIS -->
<div mat-dialog-title>
  <h2>My Dialog</h2>
</div>
```

### ❌ Missing Close Button

```html
<!-- DON'T DO THIS -->
<div mat-dialog-title class="flex items-center gap-3">
  <mat-icon>info</mat-icon>
  <h2>My Dialog</h2>
  <!-- Missing close button -->
</div>
```

### ❌ Wrong Icon Size

```html
<!-- DON'T DO THIS -->
<mat-icon>info</mat-icon>
<!-- Too small -->
<mat-icon class="text-3xl">info</mat-icon>
<!-- Too big -->
```

### ❌ Missing Required Classes

```html
<!-- DON'T DO THIS -->
<div mat-dialog-title class="flex gap-3">
  <!-- Missing: items-center, justify-between, pb-4, border-b -->
</div>
```

## Validation Checklist

Before committing any dialog component, verify:

- [ ] ✅ Header uses exact structure: `flex items-center justify-between pb-4 border-b`
- [ ] ✅ Left side uses: `flex items-center gap-3`
- [ ] ✅ Icon has: `!text-2xl` class
- [ ] ✅ Title has: `text-xl font-semibold m-0` classes
- [ ] ✅ Close button present: `<button mat-icon-button mat-dialog-close>`
- [ ] ✅ Content has: `py-6` class
- [ ] ✅ Actions have: `flex justify-end gap-2 pt-4 border-t` classes
- [ ] ✅ Cancel button has: `mat-dialog-close` directive
- [ ] ✅ Loading states implemented with spinners
- [ ] ✅ Dialog tested in both light and dark modes

## Integration with Development Workflow

### When Creating New Dialogs

1. **Copy the standard template** from this document
2. **Replace placeholders** with your specific content
3. **Choose appropriate icon** from the guidelines
4. **Test alignment** in browser
5. **Run validation checklist** before committing

### When Claude Assists

- **Always reference this standard** when asking Claude to create dialogs
- **Specify**: "Use the Material Dialog Standard from docs/development/material-dialog-standard.md"
- **Claude will apply** this structure automatically for all new dialogs

## Browser Testing

After implementing, verify in browser:

1. **Icon alignment** - should be perfectly aligned with title text
2. **Close button center** - icon should be centered in button
3. **Responsive behavior** - test on different screen sizes
4. **Dark mode** - ensure colors work in dark theme
5. **Keyboard navigation** - Tab should work correctly

## Related Documentation

- [Angular Material Dialog API](https://material.angular.io/components/dialog/api)
- [TailwindCSS Flexbox](https://tailwindcss.com/docs/flex)
- [aegisx-ui Global Styles](/libs/aegisx-ui/src/lib/styles/vendor/fuse/overrides/angular-material.scss)

---

**💡 Remember**: This standard ensures consistent user experience and prevents alignment issues. Following it saves development time and creates a professional, polished interface.
