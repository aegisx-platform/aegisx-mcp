# AegisX UI Token Reference

**Version:** 2.0.0
**Last Updated:** 2025-01-19
**Status:** Official Standard

---

## 📖 Table of Contents

1. [Material Design Tokens](#material-design-tokens)
2. [AegisX Semantic Color Tokens](#aegisx-semantic-color-tokens)
3. [AegisX Spacing Tokens](#aegisx-spacing-tokens)
4. [AegisX Typography Tokens](#aegisx-typography-tokens)
5. [AegisX Radius Tokens](#aegisx-radius-tokens)
6. [AegisX Z-Index Tokens](#aegisx-z-index-tokens)
7. [AegisX Transition Tokens](#aegisx-transition-tokens)
8. [Token Usage Examples](#token-usage-examples)

---

## Material Design Tokens

### Surface Tokens

Material Design provides semantic surface tokens that automatically adapt to themes:

| Token                              | Description         | Light Mode | Dark Mode | Use For                   |
| ---------------------------------- | ------------------- | ---------- | --------- | ------------------------- |
| `--mat-sys-surface`                | Main surface        | `#FFFFFF`  | `#1C1B1F` | Dialogs, Sheets           |
| `--mat-sys-surface-container`      | Elevated surface    | `#F3EDF7`  | `#211F26` | Cards, Dialogs (elevated) |
| `--mat-sys-surface-container-high` | Higher elevation    | `#ECE6F0`  | `#2B2930` | App bars                  |
| `--mat-sys-surface-container-low`  | Subtle surface      | `#F7F2FA`  | `#1D1B20` | Backgrounds               |
| `--mat-sys-surface-variant`        | Alternative surface | `#E7E0EC`  | `#49454F` | Chips, List items         |

**Example:**

```scss
.dialog {
  background: var(--mat-sys-surface);
}

.card {
  background: var(--mat-sys-surface-container);
}
```

### Text/Content Tokens

| Token                          | Description       | Light Mode | Dark Mode | Use For               |
| ------------------------------ | ----------------- | ---------- | --------- | --------------------- |
| `--mat-sys-on-surface`         | Primary text      | `#1C1B1F`  | `#E6E1E5` | Body text, Headings   |
| `--mat-sys-on-surface-variant` | Secondary text    | `#49454F`  | `#CAC4D0` | Labels, Subtitles     |
| `--mat-sys-on-primary`         | Text on primary   | `#FFFFFF`  | `#381E72` | Primary button text   |
| `--mat-sys-on-secondary`       | Text on secondary | `#FFFFFF`  | `#332D41` | Secondary button text |
| `--mat-sys-on-error`           | Text on error     | `#FFFFFF`  | `#601410` | Error button text     |

**Example:**

```scss
.title {
  color: var(--mat-sys-on-surface);
}

.subtitle {
  color: var(--mat-sys-on-surface-variant);
}
```

### Outline/Border Tokens

| Token                       | Description     | Light Mode | Dark Mode | Use For                 |
| --------------------------- | --------------- | ---------- | --------- | ----------------------- |
| `--mat-sys-outline`         | Standard border | `#79747E`  | `#938F99` | Input borders, Dividers |
| `--mat-sys-outline-variant` | Subtle border   | `#CAC4D0`  | `#49454F` | Subtle dividers         |

**Example:**

```scss
.input {
  border: 1px solid var(--mat-sys-outline);
}

.divider {
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}
```

### Primary/Secondary/Error Tokens

| Token                 | Description     | Light Mode | Dark Mode | Use For                |
| --------------------- | --------------- | ---------- | --------- | ---------------------- |
| `--mat-sys-primary`   | Primary color   | `#6750A4`  | `#D0BCFF` | Primary buttons, Links |
| `--mat-sys-secondary` | Secondary color | `#625B71`  | `#CCC2DC` | Secondary buttons      |
| `--mat-sys-tertiary`  | Tertiary color  | `#7D5260`  | `#EFB8C8` | Tertiary actions       |
| `--mat-sys-error`     | Error color     | `#B3261E`  | `#F2B8B5` | Error states           |

**Example:**

```scss
.primary-button {
  background: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}

.error-message {
  color: var(--mat-sys-error);
}
```

### Elevation/Shadow Tokens

| Token              | Description       | Use For       |
| ------------------ | ----------------- | ------------- |
| `--mat-sys-level0` | No elevation      | Flat surfaces |
| `--mat-sys-level1` | Low elevation     | Cards         |
| `--mat-sys-level2` | Medium elevation  | FABs          |
| `--mat-sys-level3` | High elevation    | Dialogs       |
| `--mat-sys-level4` | Higher elevation  | Menus         |
| `--mat-sys-level5` | Highest elevation | Tooltips      |

**Example:**

```scss
.dialog {
  box-shadow: var(--mat-sys-level3);
}

.card {
  box-shadow: var(--mat-sys-level1);
}
```

---

## AegisX Semantic Color Tokens

### Success Tokens

| Token                   | Value (Light)             | Value (Dark)              | Use For                    |
| ----------------------- | ------------------------- | ------------------------- | -------------------------- |
| `--ax-success-faint`    | `rgba(16, 185, 129, 0.1)` | `rgba(52, 211, 153, 0.1)` | Success backgrounds        |
| `--ax-success-default`  | `#10b981`                 | `#34d399`                 | Success icons, borders     |
| `--ax-success-emphasis` | `#059669`                 | `#10b981`                 | Success text               |
| `--ax-success-inverted` | `#ffffff`                 | `#064e3b`                 | Text on success background |

**Example:**

```scss
.success-banner {
  background: var(--ax-success-faint);
  color: var(--ax-success-emphasis);
  border-left: 4px solid var(--ax-success-default);
}

.success-icon {
  background: var(--ax-success-default);
  color: var(--ax-success-inverted);
}
```

### Warning Tokens

| Token                   | Value (Light)             | Value (Dark)              | Use For                    |
| ----------------------- | ------------------------- | ------------------------- | -------------------------- |
| `--ax-warning-faint`    | `rgba(245, 158, 11, 0.1)` | `rgba(251, 191, 36, 0.1)` | Warning backgrounds        |
| `--ax-warning-default`  | `#f59e0b`                 | `#fbbf24`                 | Warning icons, borders     |
| `--ax-warning-emphasis` | `#d97706`                 | `#f59e0b`                 | Warning text               |
| `--ax-warning-inverted` | `#ffffff`                 | `#78350f`                 | Text on warning background |

**Example:**

```scss
.warning-banner {
  background: var(--ax-warning-faint);
  color: var(--ax-warning-emphasis);
  border-left: 4px solid var(--ax-warning-default);
}
```

### Error Tokens

| Token                 | Value (Light)            | Value (Dark)               | Use For                  |
| --------------------- | ------------------------ | -------------------------- | ------------------------ |
| `--ax-error-faint`    | `rgba(239, 68, 68, 0.1)` | `rgba(248, 113, 113, 0.1)` | Error backgrounds        |
| `--ax-error-default`  | `#ef4444`                | `#f87171`                  | Error icons, borders     |
| `--ax-error-emphasis` | `#dc2626`                | `#ef4444`                  | Error text               |
| `--ax-error-inverted` | `#ffffff`                | `#7f1d1d`                  | Text on error background |

**Example:**

```scss
.error-banner {
  background: var(--ax-error-faint);
  color: var(--ax-error-emphasis);
  border-left: 4px solid var(--ax-error-default);
}
```

### Info Tokens

| Token                | Value (Light)             | Value (Dark)              | Use For                 |
| -------------------- | ------------------------- | ------------------------- | ----------------------- |
| `--ax-info-faint`    | `rgba(59, 130, 246, 0.1)` | `rgba(96, 165, 250, 0.1)` | Info backgrounds        |
| `--ax-info-default`  | `#3b82f6`                 | `#60a5fa`                 | Info icons, borders     |
| `--ax-info-emphasis` | `#2563eb`                 | `#3b82f6`                 | Info text               |
| `--ax-info-inverted` | `#ffffff`                 | `#1e3a8a`                 | Text on info background |

**Example:**

```scss
.info-banner {
  background: var(--ax-info-faint);
  color: var(--ax-info-emphasis);
  border-left: 4px solid var(--ax-info-default);
}
```

### Brand Tokens

| Token                 | Value (Light)             | Value (Dark)               | Use For                  |
| --------------------- | ------------------------- | -------------------------- | ------------------------ |
| `--ax-brand-faint`    | `rgba(99, 102, 241, 0.1)` | `rgba(129, 140, 248, 0.1)` | Brand backgrounds        |
| `--ax-brand-default`  | `#6366f1`                 | `#818cf8`                  | Brand elements           |
| `--ax-brand-emphasis` | `#4f46e5`                 | `#6366f1`                  | Brand text               |
| `--ax-brand-inverted` | `#ffffff`                 | `#1e1b4b`                  | Text on brand background |

**Example:**

```scss
.brand-button {
  background: var(--ax-brand-default);
  color: var(--ax-brand-inverted);
}
```

---

## AegisX Spacing Tokens

### Spacing Scale

| Token              | Value     | Pixels | Use For                       |
| ------------------ | --------- | ------ | ----------------------------- |
| `--ax-spacing-xs`  | `0.25rem` | 4px    | Icon gaps, tight spacing      |
| `--ax-spacing-sm`  | `0.5rem`  | 8px    | Button gaps, compact layouts  |
| `--ax-spacing-md`  | `1rem`    | 16px   | Standard spacing              |
| `--ax-spacing-lg`  | `1.5rem`  | 24px   | Card padding, section spacing |
| `--ax-spacing-xl`  | `2rem`    | 32px   | Dialog padding, large gaps    |
| `--ax-spacing-2xl` | `3rem`    | 48px   | Page sections, hero spacing   |

**Example:**

```scss
.card {
  padding: var(--ax-spacing-lg);
  margin-bottom: var(--ax-spacing-xl);
}

.button-group {
  gap: var(--ax-spacing-sm);
}

.hero-section {
  padding: var(--ax-spacing-2xl);
}
```

---

## AegisX Typography Tokens

### Font Sizes

| Token            | Value      | Pixels | Use For                |
| ---------------- | ---------- | ------ | ---------------------- |
| `--ax-text-xs`   | `0.75rem`  | 12px   | Captions, small labels |
| `--ax-text-sm`   | `0.875rem` | 14px   | Body text (small)      |
| `--ax-text-base` | `1rem`     | 16px   | Body text (standard)   |
| `--ax-text-lg`   | `1.125rem` | 18px   | Large body text        |
| `--ax-text-xl`   | `1.25rem`  | 20px   | Headings (small)       |
| `--ax-text-2xl`  | `1.5rem`   | 24px   | Headings (medium)      |
| `--ax-text-3xl`  | `1.875rem` | 30px   | Headings (large)       |
| `--ax-text-4xl`  | `2.25rem`  | 36px   | Hero headings          |

**Example:**

```scss
.heading {
  font-size: var(--ax-text-2xl);
}

.body {
  font-size: var(--ax-text-base);
}

.caption {
  font-size: var(--ax-text-xs);
}
```

### Font Weights

| Token                | Value | Use For          |
| -------------------- | ----- | ---------------- |
| `--ax-font-normal`   | `400` | Body text        |
| `--ax-font-medium`   | `500` | Labels, emphasis |
| `--ax-font-semibold` | `600` | Headings         |
| `--ax-font-bold`     | `700` | Strong emphasis  |

**Example:**

```scss
.heading {
  font-weight: var(--ax-font-semibold);
}

.label {
  font-weight: var(--ax-font-medium);
}
```

### Line Heights

| Token                  | Value  | Use For             |
| ---------------------- | ------ | ------------------- |
| `--ax-leading-none`    | `1`    | Icons, tight text   |
| `--ax-leading-tight`   | `1.25` | Headings            |
| `--ax-leading-normal`  | `1.5`  | Body text           |
| `--ax-leading-relaxed` | `1.75` | Comfortable reading |
| `--ax-leading-loose`   | `2`    | Very spacious       |

**Example:**

```scss
.heading {
  line-height: var(--ax-leading-tight);
}

.body {
  line-height: var(--ax-leading-normal);
}
```

### Font Families

| Token            | Value                        | Use For              |
| ---------------- | ---------------------------- | -------------------- |
| `--ax-font-sans` | Inter, system-ui, sans-serif | UI text              |
| `--ax-font-mono` | 'Roboto Mono', monospace     | Code, technical text |

---

## AegisX Radius Tokens

### Border Radius Scale

| Token              | Value     | Pixels | Use For               |
| ------------------ | --------- | ------ | --------------------- |
| `--ax-radius-sm`   | `0.25rem` | 4px    | Small elements, chips |
| `--ax-radius-md`   | `0.5rem`  | 8px    | Buttons, inputs       |
| `--ax-radius-lg`   | `0.75rem` | 12px   | Cards, containers     |
| `--ax-radius-xl`   | `1rem`    | 16px   | Dialogs, large cards  |
| `--ax-radius-2xl`  | `1.5rem`  | 24px   | Hero sections         |
| `--ax-radius-full` | `50%`     | Circle | Avatars, icon buttons |

**Example:**

```scss
.button {
  border-radius: var(--ax-radius-md);
}

.card {
  border-radius: var(--ax-radius-lg);
}

.avatar {
  border-radius: var(--ax-radius-full);
}
```

---

## AegisX Z-Index Tokens

### Z-Index Layers

| Token                 | Value  | Use For                |
| --------------------- | ------ | ---------------------- |
| `--ax-z-base`         | `0`    | Normal flow            |
| `--ax-z-sticky`       | `100`  | Sticky headers/footers |
| `--ax-z-dropdown`     | `1000` | Dropdown menus         |
| `--ax-z-modal`        | `1300` | Modal dialogs          |
| `--ax-z-popover`      | `1400` | Popovers               |
| `--ax-z-tooltip`      | `1500` | Tooltips               |
| `--ax-z-notification` | `1600` | Toast notifications    |

**Example:**

```scss
.dialog {
  z-index: var(--ax-z-modal);
}

.tooltip {
  z-index: var(--ax-z-tooltip);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: var(--ax-z-sticky);
}
```

---

## AegisX Transition Tokens

### Transition Durations

| Token                  | Value   | Use For                      |
| ---------------------- | ------- | ---------------------------- |
| `--ax-transition-fast` | `150ms` | Hover effects, small changes |
| `--ax-transition-base` | `250ms` | Standard transitions         |
| `--ax-transition-slow` | `350ms` | Complex animations           |

**Example:**

```scss
.button {
  transition: background var(--ax-transition-fast);

  &:hover {
    background: var(--ax-background-subtle);
  }
}
```

---

## Token Usage Examples

### Complete Card Example

```scss
.card {
  // Surface (Material)
  background: var(--mat-sys-surface-container);

  // Border (Material)
  border: 1px solid var(--mat-sys-outline-variant);

  // Elevation (Material)
  box-shadow: var(--mat-sys-level1);

  // Spacing (AegisX)
  padding: var(--ax-spacing-lg);
  margin-bottom: var(--ax-spacing-md);

  // Radius (AegisX)
  border-radius: var(--ax-radius-lg);

  // Transition (AegisX)
  transition: box-shadow var(--ax-transition-base);

  &:hover {
    box-shadow: var(--mat-sys-level2);
  }
}

.card-title {
  // Text color (Material)
  color: var(--mat-sys-on-surface);

  // Typography (AegisX)
  font-size: var(--ax-text-xl);
  font-weight: var(--ax-font-semibold);
  line-height: var(--ax-leading-tight);

  // Spacing (AegisX)
  margin-bottom: var(--ax-spacing-sm);
}

.card-description {
  // Text color (Material)
  color: var(--mat-sys-on-surface-variant);

  // Typography (AegisX)
  font-size: var(--ax-text-sm);
  line-height: var(--ax-leading-normal);
}
```

### Complete Dialog Example

```scss
.dialog {
  // Surface (Material)
  background: var(--mat-sys-surface);

  // Elevation (Material)
  box-shadow: var(--mat-sys-level3);

  // Spacing (AegisX)
  padding: var(--ax-spacing-xl);

  // Radius (AegisX)
  border-radius: var(--ax-radius-lg);

  // Z-index (AegisX)
  z-index: var(--ax-z-modal);
}

.dialog-header {
  // Border (Material)
  border-bottom: 1px solid var(--mat-sys-outline);

  // Spacing (AegisX)
  padding-bottom: var(--ax-spacing-md);
  margin-bottom: var(--ax-spacing-lg);
}

.dialog-title {
  // Text color (Material)
  color: var(--mat-sys-on-surface);

  // Typography (AegisX)
  font-size: var(--ax-text-2xl);
  font-weight: var(--ax-font-semibold);
  line-height: var(--ax-leading-tight);
}
```

### Complete Form Example

```scss
.form-group {
  // Spacing (AegisX)
  margin-bottom: var(--ax-spacing-lg);
}

.form-label {
  // Text color (Material)
  color: var(--mat-sys-on-surface-variant);

  // Typography (AegisX)
  font-size: var(--ax-text-sm);
  font-weight: var(--ax-font-medium);

  // Spacing (AegisX)
  margin-bottom: var(--ax-spacing-xs);
}

.form-input {
  // Surface (Material)
  background: var(--mat-sys-surface);

  // Text color (Material)
  color: var(--mat-sys-on-surface);

  // Border (Material)
  border: 1px solid var(--mat-sys-outline);

  // Spacing (AegisX)
  padding: var(--ax-spacing-sm) var(--ax-spacing-md);

  // Radius (AegisX)
  border-radius: var(--ax-radius-md);

  // Transition (AegisX)
  transition: border-color var(--ax-transition-fast);

  &:focus {
    border-color: var(--mat-sys-primary);
    outline: 2px solid color-mix(in srgb, var(--mat-sys-primary) 20%, transparent);
  }

  &.error {
    border-color: var(--ax-error-default);
  }
}

.form-error {
  // Semantic color (AegisX)
  color: var(--ax-error-default);

  // Typography (AegisX)
  font-size: var(--ax-text-xs);

  // Spacing (AegisX)
  margin-top: var(--ax-spacing-xs);
}
```

---

## Related Documentation

- **[Theming Guide](./THEMING_GUIDE.md)** - Learn when to use which token
- **[Component Usage](../COMPONENT_USAGE.md)** - See tokens in action
- **[Migration Guide](../MIGRATION_DIALOG_V2.md)** - Update from v1.0 to v2.0

---

**Last Updated:** 2025-01-19
**Version:** 2.0.0
**Maintained by:** AegisX UI Team
