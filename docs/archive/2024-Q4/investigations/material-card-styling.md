# Material Card Styling Investigation Report

## Summary

The project's Material Card styling was previously configured to display cards in three distinct variations (Raised, Outlined, Filled), but this functionality appears to have been lost in recent refactoring. The analysis traces through key commits (d731ed8, 978ec06, 113337a) to identify what changed and what needs to be restored.

---

## Key Commits Analyzed

### 1. **d731ed8** (Nov 9, 2025) - "fix(styles): add !important and box-shadow to ensure Material Design 3 card borders are visible"

**What It Did:**

- Created `/libs/aegisx-ui/src/lib/styles/components/_material-fixes.scss` (507 lines)
- Added Material Design 3 card styling fixes
- **Critical Addition for Cards:**

```scss
/* Apply Material Design 3 outline style to all cards */
.mat-mdc-card,
mat-card,
.mat-card,
.mdc-card {
  border: 1px solid var(--md-sys-color-outline, #79747e) !important;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24) !important;
}
```

- This was an emergency fix to make cards visible (they were disappearing without borders)

### 2. **113337a** (Nov 11, 2025) - "refactor(admin/styles): migrate Material component overrides to official mat.\*-overrides() mixins"

**What It Did:**

- Migrated to Angular Material 20's official theme API
- Created `/apps/admin/src/styles/components/_material-overrides.scss` (293 lines)
- **Card Configuration using mat.card-overrides():**

```scss
@include mat.card-overrides(
  (
    // Elevated/Raised card (default) - Has shadow, no border
    elevated-container-color: var(--tremor-background-default),
    elevated-container-shape: var(--tremor-radius-md),
    elevated-container-elevation: var(--tremor-shadow-sm),
    // Outlined card - Has border, NO shadow
    outlined-container-color: var(--tremor-background-default),
    outlined-container-shape: var(--tremor-radius-md),
    outlined-outline-color: var(--tremor-border-default),
    outlined-outline-width: 1px,
    outlined-container-elevation: var(--tremor-shadow-sm)
  )
);
```

**Key Configuration Difference:**

- `elevated-container-elevation: var(--tremor-shadow-sm)` - Has shadow
- `outlined-container-elevation: var(--tremor-shadow-sm)` - Also has shadow in the override

### 3. **978ec06** (Nov 16, 2025) - "feat(ui): add error color tokens and fix KPI card UI issues"

**What It Did:**

- Added error color tokens
- Created `card-examples.component.html` showcasing card styles
- Cards use simple `<mat-card>` without explicit appearance attribute

---

## Current File Structure

### `/libs/aegisx-ui/src/lib/styles/themes/_material-overrides.scss` (Current - ACTIVE)

**Card Configuration:**

```scss
@include mat.card-overrides(
  (
    // Elevated/Raised card (default) - Has shadow, no border
    elevated-container-color: var(--ax-background-default),
    elevated-container-shape: var(--ax-radius-md),
    elevated-container-elevation: var(--ax-shadow-md),
    // มี shadow
    // Outlined card - Has border, NO shadow
    outlined-container-color: var(--ax-background-default),
    outlined-container-shape: var(--ax-radius-md),
    outlined-outline-color: var(--ax-border-default),
    outlined-outline-width: 1px,
    outlined-container-elevation: none,

    // ไม่มี shadow!
    // Filled card - Has background fill, subtle shadow
    filled-container-color: var(--ax-background-subtle),
    // สีแตกต่าง
    filled-container-shape: var(--ax-radius-md),
    filled-container-elevation: var(--ax-shadow-sm)
  )
);
```

**Status:** PROPERLY CONFIGURED - Card variations ARE defined correctly in current code

### `/libs/aegisx-ui/src/lib/styles/themes/aegisx-light.scss`

**Card Configuration (CSS Custom Properties):**

```scss
/* Material 3 Card Color Overrides - All cards white background */
/* Raised/Elevated Card */
--mat-card-elevated-container-color: var(--ax-background-default);
--mdc-elevated-card-container-color: var(--ax-background-default);

/* Outlined Card */
--mat-card-outlined-container-color: var(--ax-background-default);
--mdc-outlined-card-container-color: var(--ax-background-default);

/* Filled Card */
--mat-card-filled-container-color: var(--ax-background-subtle);
--mdc-filled-card-container-color: var(--ax-background-subtle);

/* Card Border Color - Use AegisX border token */
--mat-card-outlined-outline-color: var(--ax-border-default);
--mdc-outlined-card-outline-color: var(--ax-border-default);
```

**Status:** PROPERLY CONFIGURED - All three card types have distinct color settings

### `/libs/aegisx-ui/src/lib/styles/themes/aegisx-dark.scss`

**Status:** Uses same card color tokens as light theme (via @include aegisx-dark-theme)

---

## Key Differences Between Commits

### Token Naming Evolution

| Commit               | Token Prefix    | Example                            |
| -------------------- | --------------- | ---------------------------------- |
| 113337a (Admin-only) | `--tremor-*`    | `var(--tremor-background-default)` |
| d731ed8              | Material tokens | `var(--md-sys-color-outline)`      |
| Current (aegisx-ui)  | `--ax-*`        | `var(--ax-background-default)`     |

### Shadow Configuration

| Appearance | d731ed8 (Fixes)  | 113337a (Admin)           | Current (aegisx-ui)   |
| ---------- | ---------------- | ------------------------- | --------------------- |
| Elevated   | Has `box-shadow` | `var(--tremor-shadow-sm)` | `var(--ax-shadow-md)` |
| Outlined   | Has `box-shadow` | `var(--tremor-shadow-sm)` | `none`                |
| Filled     | N/A              | N/A                       | `var(--ax-shadow-sm)` |

**Critical Discovery:**

- In 113337a (admin-only), both elevated AND outlined had shadows
- In current code, outlined card has NO shadow (`none`)
- This might be intentional (outlined = border only) but differs from admin implementation

---

## File Dependencies & Import Chain

```
aegisx-light.scss
├── @use '@angular/material' as mat;
├── @use './_aegisx-tokens' as *;
├── @use './material-overrides' as *;  ← This imports _material-overrides.scss
├── @use '../components/form-utilities' as *;
└── @use '../components/dialog-shared';

_material-overrides.scss (ACTIVE)
└── @include mat.card-overrides(...)
```

**Key:** The `./material-overrides` (line 9 in aegisx-light.scss) imports `_material-overrides.scss` which contains the card-overrides() mixin.

---

## Components Using Cards

Based on git history, these files were created/updated to demonstrate card styling:

1. `/apps/admin/src/app/pages/card-examples/card-examples.component.html` (978ec06)
   - Showcases KPI cards, analytics metrics, user engagement
   - Uses simple `<mat-card>` tags without appearance attribute

2. `/apps/admin/src/app/pages/components-demo/components-demo.component.html` (113337a)
   - Added comprehensive "Cards" tab
   - Mentions "update all mat-card components to use appearance='outlined'"

---

## What Should Be Restored

### Issue: Missing Card Appearance Attributes

The problem is likely that:

1. **The Configuration exists** - `_material-overrides.scss` properly defines all three card types
2. **But components aren't using it** - Cards may not have explicit `appearance` attributes
3. **Default behavior** - Without `appearance`, Material cards default to "elevated" style

### Solution Steps

1. **Verify in \_material-overrides.scss:**
   - Confirm `elevated-container-elevation: var(--ax-shadow-md)` for raised cards ✓
   - Confirm `outlined-container-elevation: none` for outlined cards ✓
   - Confirm `filled-container-color: var(--ax-background-subtle)` for filled cards ✓

2. **Check if cards need appearance attributes:**
   - If components want outlined cards: `<mat-card appearance="outlined">`
   - If components want filled cards: `<mat-card appearance="filled">`
   - Default (no attribute): raised card with shadow

3. **Verify CSS Custom Properties in theme files:**
   - Light theme should define: `--mat-card-outlined-outline-color` ✓
   - Dark theme should define: `--mat-card-outlined-outline-color` ✓
   - Both themes define container colors for all three variants ✓

---

## Detailed Configuration Reference

### Current \_material-overrides.scss Card Section

**File:** `/libs/aegisx-ui/src/lib/styles/themes/_material-overrides.scss` (Lines 9-41)

```scss
// ===== Cards - Tremor Style (minimal elevation, subtle borders) =====
@include mat.card-overrides(
  (
    // Elevated/Raised card (default) - Has shadow, no border
    elevated-container-color: var(--ax-background-default),
    elevated-container-shape: var(--ax-radius-md),
    elevated-container-elevation: var(--ax-shadow-md),
    // มี shadow
    // Outlined card - Has border, NO shadow
    outlined-container-color: var(--ax-background-default),
    outlined-container-shape: var(--ax-radius-md),
    outlined-outline-color: var(--ax-border-default),
    outlined-outline-width: 1px,
    outlined-container-elevation: none,

    // ไม่มี shadow!
    // Filled card - Has background fill, subtle shadow
    filled-container-color: var(--ax-background-subtle),
    // สีแตกต่าง
    filled-container-shape: var(--ax-radius-md),
    filled-container-elevation: var(--ax-shadow-sm)
  )
);

// Card header border and content padding (using AegisX spacing tokens)
.mat-mdc-card {
  .mat-mdc-card-header {
    border-bottom: 1px solid var(--ax-border-default);
    padding-bottom: var(--ax-spacing-md) !important; // 16px
  }

  .mat-mdc-card-content {
    padding-top: var(--ax-spacing-md) !important; // 16px
  }
}
```

### Theme File Card Properties

**File:** `/libs/aegisx-ui/src/lib/styles/themes/aegisx-light.scss` (Lines 59-77)

```scss
/* Material 3 Card Color Overrides - All cards white background */
/* Raised/Elevated Card */
--mat-card-elevated-container-color: var(--ax-background-default);
--mdc-elevated-card-container-color: var(--ax-background-default);

/* Outlined Card */
--mat-card-outlined-container-color: var(--ax-background-default);
--mdc-outlined-card-container-color: var(--ax-background-default);

/* Filled Card */
--mat-card-filled-container-color: var(--ax-background-subtle);
--mdc-filled-card-container-color: var(--ax-background-subtle);

/* Generic card container */
--mat-card-container-color: var(--ax-background-default);

/* Card Border Color - Use AegisX border token */
--mat-card-outlined-outline-color: var(--ax-border-default);
--mdc-outlined-card-outline-color: var(--ax-border-default);
```

---

## Comparison: What Was in Admin vs. What's in aegisx-ui Now

### Admin Implementation (113337a) - LIMITED TO ADMIN APP

```scss
// Only in apps/admin/src/styles/components/_material-overrides.scss
@include mat.card-overrides(
  (
    elevated-container-color: var(--tremor-background-default),
    outlined-container-elevation: var(--tremor-shadow-sm),
    // Had shadow
  )
);
```

### Current Implementation (aegisx-ui) - SHARED ACROSS ALL APPS

```scss
// In libs/aegisx-ui/src/lib/styles/themes/_material-overrides.scss
@include mat.card-overrides(
  (
    elevated-container-color: var(--ax-background-default),
    outlined-container-elevation: none,
    // No shadow (intentional?)
  )
);
```

**Key Difference:** Admin had `outlined-container-elevation` set to shadow value, but current shared implementation has it set to `none`. This is likely intentional (outlined = border-only style), but if users want shadows on outlined cards, this would need to change.

---

## Import Chain Verification

```
./libs/aegisx-ui/src/lib/styles/themes/aegisx-light.scss
├── Line 7: @use '@angular/material' as mat;
├── Line 8: @use './_aegisx-tokens' as *;
├── Line 9: @use './material-overrides' as *;  ← CRITICAL: Imports _material-overrides.scss
├── Line 10: @use '../components/form-utilities' as *;
└── Line 11: @use '../components/dialog-shared';
```

**Status:** Import chain is correct and active. The \_material-overrides.scss IS being included.

---

## Recommendations for Investigation

### 1. Test Current Implementation

```bash
# Check if cards display correctly with the current configuration
# Look at: apps/admin/src/app/pages/card-examples/
# Screenshots or browser inspection would confirm if cards show:
# - Raised cards: White background + shadow
# - Outlined cards: White background + border + NO shadow
# - Filled cards: Subtle gray background + shadow
```

### 2. If Cards Are Not Displaying Correctly

- Check if Material Design 3 theme is being applied to root
- Verify @include aegisx-light-theme; and @include aegisx-dark-theme; are in theme files
- Look for CSS custom property values in browser DevTools

### 3. If Admin Cards Looked Better

- Consider changing `outlined-container-elevation: var(--ax-shadow-sm)` instead of `none`
- This would add subtle shadow to outlined cards (matching admin behavior)

### 4. Check Component Usage

- Verify components are using appearance attribute when needed:
  - `<mat-card appearance="outlined">` for outlined style
  - `<mat-card appearance="filled">` for filled style
  - Default (no attribute) for raised/elevated style

---

## Technical Details: Material Design 3 Card Styles

### What Each Appearance Does

1. **Raised (Default, no attribute)**
   - Elevated with shadow (provides depth)
   - No border
   - Configured by: `elevated-container-*` properties

2. **Outlined** (`appearance="outlined"`)
   - Border (no elevation)
   - No shadow (or minimal shadow)
   - Configured by: `outlined-container-*` and `outlined-outline-*` properties

3. **Filled** (`appearance="filled"`)
   - Filled background (distinct from surface)
   - Subtle shadow
   - Configured by: `filled-container-*` properties

---

## Files That Need Investigation

### Critical Files to Check

1. `/libs/aegisx-ui/src/lib/styles/themes/_material-overrides.scss` - Card mixin definition ✓
2. `/libs/aegisx-ui/src/lib/styles/themes/aegisx-light.scss` - Theme configuration ✓
3. `/libs/aegisx-ui/src/lib/styles/themes/aegisx-dark.scss` - Dark theme configuration ✓
4. `/libs/aegisx-ui/src/lib/styles/themes/_aegisx-tokens.scss` - Token values

### Components Using Cards

1. `/apps/admin/src/app/pages/card-examples/card-examples.component.html` - KPI cards
2. `/apps/admin/src/app/pages/components-demo/components-demo.component.html` - Component showcase
3. Any custom card components in apps

---

## Conclusion

**The card styling configuration IS properly set up in the current codebase.** The three card appearances (Raised, Outlined, Filled) are fully configured in:

- `_material-overrides.scss` with mat.card-overrides() mixin
- Theme files with CSS custom properties
- Token definitions with appropriate values

If cards are not displaying differently, the issue is likely:

1. Components not using the `appearance` attribute
2. Components expecting different visual treatments
3. CSS custom properties not being applied correctly to Material components
4. Browser rendering issue or Material Design 3 theme not loading

The configuration matches Angular Material 20's official API and follows best practices for Material Design 3 theming.
