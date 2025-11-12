# How to Add a New Theme

Step-by-step guide for creating a new theme in the AegisX Admin application.

## Prerequisites

- Basic understanding of SCSS
- Familiarity with Angular Material theming
- Understanding of CSS custom properties (variables)

## Quick Start (5 minutes)

```bash
# 1. Copy template
cp apps/admin/src/styles/themes/_template.scss apps/admin/src/styles/themes/my-theme.scss

# 2. Customize colors in my-theme.scss

# 3. Add to build config (project.json)

# 4. Register in service (tremor-theme.service.ts)

# 5. Test!
```

---

## Detailed Step-by-Step Guide

### Step 1: Create Theme File

Copy the template file:

```bash
cd apps/admin/src/styles/themes
cp _template.scss my-custom-theme.scss
```

### Step 2: Configure Material Theme

Open `my-custom-theme.scss` and configure the Material theme:

```scss
@use '@angular/material' as mat;

:root {
  @include mat.theme(
    (
      color: (
        // Choose theme type
        theme-type: light,

        // or 'dark'
        // Choose Material palette
        primary: mat.$teal-palette,
        tertiary: mat.$green-palette,
      ),
      typography: (
        brand-family: 'ui-sans-serif, system-ui, sans-serif',
        plain-family: 'ui-sans-serif, system-ui, sans-serif',
      ),
      density: (
        scale: -1,
        // -1 = compact, 0 = default
      ),
    )
  );
}
```

**Available Material Palettes:**

- `mat.$red-palette`
- `mat.$pink-palette`
- `mat.$purple-palette`
- `mat.$indigo-palette`
- `mat.$blue-palette`
- `mat.$azure-palette`
- `mat.$cyan-palette`
- `mat.$teal-palette`
- `mat.$green-palette`
- `mat.$yellow-palette`
- `mat.$orange-palette`

### Step 3: Define AegisX Design Tokens

**For Light Themes:**

```scss
:root {
  /* Backgrounds - use light colors */
  --aegisx-background-default: #ffffff;
  --aegisx-background-subtle: #f9fafb;
  --aegisx-background-muted: #f3f4f6;
  --aegisx-background-emphasis: #f9fafb;

  /* Borders */
  --aegisx-border-default: #e5e7eb;

  /* Content - use dark text */
  --aegisx-text-strong: #111827; // Darkest
  --aegisx-text-emphasis: #374151;
  --aegisx-text-body: #6b7280;
  --aegisx-text-subtle: #9ca3af; // Lightest
  --aegisx-content-inverted: #ffffff;

  /* Brand - match your Material primary color */
  --aegisx-brand-default: #14b8a6; // Teal
  --aegisx-brand-emphasis: #0d9488;
  --aegisx-brand-subtle: #5eead4;
  --aegisx-brand-muted: #99f6e4;
  --aegisx-brand-faint: #ccfbf1;
  --aegisx-brand-inverted: #ffffff;

  /* Shadows - subtle */
  --aegisx-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --aegisx-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --aegisx-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Status Colors - Success (keep standard) */
  --aegisx-success-default: #10b981;
  --aegisx-success-emphasis: #059669;
  --aegisx-success-faint: #d1fae5;

  /* Status Colors - Warning */
  --aegisx-warning-default: #f59e0b;
  --aegisx-warning-emphasis: #d97706;
  --aegisx-warning-faint: #fef3c7;

  /* Status Colors - Error */
  --aegisx-error-default: #ef4444;
  --aegisx-error-emphasis: #dc2626;
  --aegisx-error-faint: #fee2e2;

  /* Status Colors - Info */
  --aegisx-info-default: #3b82f6;
  --aegisx-info-emphasis: #2563eb;
  --aegisx-info-faint: #dbeafe;
}
```

**For Dark Themes:**

```scss
:root {
  /* Backgrounds - use dark colors */
  --aegisx-background-default: #111827;
  --aegisx-background-subtle: #1f2937;
  --aegisx-background-muted: #131a2b;
  --aegisx-background-emphasis: #1f2937;

  /* Borders - darker */
  --aegisx-border-default: #374151;

  /* Content - use light text */
  --aegisx-text-strong: #f9fafb; // Lightest
  --aegisx-text-emphasis: #e5e7eb;
  --aegisx-text-body: #9ca3af;
  --aegisx-text-subtle: #6b7280; // Darkest
  --aegisx-content-inverted: #111827;

  /* Brand - lighter shades for dark backgrounds */
  --aegisx-brand-default: #5eead4; // Lighter teal
  --aegisx-brand-emphasis: #99f6e4;
  --aegisx-brand-subtle: #14b8a6;
  --aegisx-brand-muted: #0f766e;
  --aegisx-brand-faint: #134e4a;
  --aegisx-brand-inverted: #111827;

  /* Shadows - more pronounced */
  --aegisx-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --aegisx-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --aegisx-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);

  /* Status colors - lighter for dark mode */
  --aegisx-success-default: #10b981;
  --aegisx-success-emphasis: #34d399;
  --aegisx-success-faint: #064e3b;

  --aegisx-warning-default: #f59e0b;
  --aegisx-warning-emphasis: #fbbf24;
  --aegisx-warning-faint: #78350f;

  --aegisx-error-default: #ef4444;
  --aegisx-error-emphasis: #f87171;
  --aegisx-error-faint: #7f1d1d;

  --aegisx-info-default: #3b82f6;
  --aegisx-info-emphasis: #60a5fa;
  --aegisx-info-faint: #1e3a8a;
}
```

### Step 4: Add to Build Configuration

Edit `apps/admin/project.json`:

```json
{
  "targets": {
    "build": {
      "options": {
        "styles": [
          "apps/admin/src/styles.scss",
          {
            "input": "apps/admin/src/styles/themes/tremor-light.scss",
            "bundleName": "tremor-light",
            "inject": false
          },
          {
            "input": "apps/admin/src/styles/themes/tremor-dark.scss",
            "bundleName": "tremor-dark",
            "inject": false
          },
          // ADD YOUR THEME HERE
          {
            "input": "apps/admin/src/styles/themes/my-custom-theme.scss",
            "bundleName": "my-custom-theme", // ← Must match filename
            "inject": false // ← Don't auto-inject
          }
        ]
      }
    }
  }
}
```

**Important:**

- `bundleName` must match your filename (without `.scss`)
- `inject: false` prevents auto-injection (themes are loaded dynamically)

### Step 5: Register in Theme Service

Edit `apps/admin/src/app/services/tremor-theme.service.ts`:

```typescript
readonly themes: ThemeOption[] = [
  { id: 'tremor-light', name: 'Tremor Light', path: 'tremor-light.css' },
  { id: 'tremor-dark', name: 'Tremor Dark', path: 'tremor-dark.css' },

  // ADD YOUR THEME HERE
  {
    id: 'my-custom-theme',           // ← Must match bundleName
    name: 'My Custom Theme',         // ← Display name
    path: 'my-custom-theme.css'      // ← bundleName + '.css'
  },
];
```

### Step 6: Test Your Theme

1. **Restart development server:**

```bash
pnpm nx serve admin
```

2. **Open application:**

```
http://localhost:4201
```

3. **Switch to your theme:**
   - Click the palette icon in toolbar
   - Select "My Custom Theme"
   - Verify all components update correctly

4. **Test theme switching:**
   - Switch between themes
   - Check localStorage persistence (refresh page)
   - Verify Material components update
   - Check custom Tremor variables work

---

## Advanced: Creating Custom Palettes

If Material palettes don't match your brand:

```scss
// Define custom palette
$my-custom-palette: (
  0: #000000,
  // Black
  10: #1a0033,
  20: #330066,
  30: #4d0099,
  40: #6600cc,
  // ← Used in light theme (tone 40)
  50: #7f33d6,
  60: #9966e0,
  70: #b299eb,
  80: #ccccf5,
  // ← Used in dark theme (tone 80)
  90: #e6e6fa,
  100: #ffffff, // White
);

:root {
  @include mat.theme(
    (
      color: (
        theme-type: light,
        primary: $my-custom-palette,
        // ← Use custom palette
      ),
    )
  );
}
```

**Palette Guidelines:**

- Tones 0-100 create a gradient from black to white
- Light themes use tone 40 (darker for contrast)
- Dark themes use tone 80 (lighter for contrast)
- Material automatically generates variants

---

## Checklist

Before marking your theme as complete:

- [ ] Material theme configured (`theme-type`, `primary`, `tertiary`)
- [ ] All Tremor background variables defined
- [ ] All Tremor content variables defined
- [ ] All Tremor brand variables defined (match Material primary)
- [ ] All Tremor status variables defined (success, warning, error, info)
- [ ] Theme added to `project.json` styles array
- [ ] Theme registered in `TremorThemeService`
- [ ] Development server restarted
- [ ] Theme appears in palette menu
- [ ] All Material components styled correctly
- [ ] Tremor examples work in Components Demo
- [ ] Theme persists after page refresh
- [ ] Switching between themes works smoothly

---

## Troubleshooting

### Theme doesn't appear in menu

- Check `TremorThemeService` registration
- Verify `id` matches `bundleName` in project.json
- Restart development server

### Colors not updating

- Verify CSS variable names (must start with `--aegisx-`)
- Check browser DevTools for variable values
- Ensure variables defined in `:root` block

### Material components look wrong

- Check `mat.theme()` configuration
- Verify palette name is correct
- Review Material theme documentation

### Build errors

- Check SCSS syntax in theme file
- Verify `@use '@angular/material' as mat;` import
- Ensure project.json JSON is valid

---

## Examples

See existing themes for reference:

- `tremor-light.scss` - Clean light theme (recommended starting point)
- `tremor-dark.scss` - Professional dark theme
- `_template.scss` - Annotated template with all options

---

## Need Help?

1. Review [README.md](./README.md) for architecture overview
2. Check Components Demo > Tremor Examples tab for live examples
3. Consult [Angular Material Theming Guide](https://material.angular.io/guide/theming)
4. Review [Tremor Blocks](https://blocks.tremor.so/) for design inspiration

---

**Last Updated:** 2025-01-10
