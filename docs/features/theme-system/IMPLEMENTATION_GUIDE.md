# Material UI + TailwindCSS Theme System Implementation Guide

> A comprehensive guide for implementing a unified theme system with Material Design and TailwindCSS in the AegisX platform

**Version:** 1.0
**Last Updated:** 2025-11-08
**Target Audience:** Frontend Developers, UI/UX Engineers, System Architects

---

## Table of Contents

1. [Part 1: Analysis & Architecture](#part-1-analysis--architecture)
2. [Part 2: Implementation Strategy](#part-2-implementation-strategy)
3. [Part 3: Technical Details](#part-3-technical-details)
4. [Part 4: Step-by-Step Implementation](#part-4-step-by-step-implementation)
5. [Part 5: Code Examples](#part-5-code-examples)
6. [Part 6: Potential Issues & Solutions](#part-6-potential-issues--solutions)
7. [Appendix: Quick Reference](#appendix-quick-reference)

---

## Part 1: Analysis & Architecture

### 1.1 Current State Assessment

#### What's Already Working

**Material Design Integration:**

- Angular Material v20 prebuilt themes (`indigo-pink.css`)
- Custom Fuse-based theme system in `libs/aegisx-ui/`
- 6 color theme variants: default (indigo), brand (blue), teal, rose, purple, amber
- Material component typography and density configuration
- Light/dark theme support via CSS class selectors (`.light`, `.dark`)

**TailwindCSS Integration:**

- TailwindCSS v3 configured in all apps (`apps/admin/`, `apps/web/`)
- Dark mode enabled with class strategy: `darkMode: ['selector', '.dark']`
- Custom color palette synchronized with Material Design
- CSS variables integration: `var(--fuse-bg-card)`, `var(--fuse-text-default)`, etc.
- Custom utilities for spacing, typography, and animations

**State Management:**

- `AegisxConfigService` using Angular Signals
- LocalStorage persistence for theme preferences
- Computed signals for theme properties (`isDarkMode`, `isLightMode`, `scheme`)
- Config updates via reactive signals

**File Structure:**

```
libs/aegisx-ui/src/lib/
├── styles/vendor/fuse/
│   ├── themes.scss           # Material theme generator
│   └── user-themes.scss      # Theme color definitions
├── services/config/
│   └── config.service.ts     # Theme state management
└── types/
    ├── config.types.ts       # Configuration interfaces
    └── theme.types.ts        # Theme palette interfaces

apps/admin/src/
├── styles.scss               # App-level styles
└── tailwind.config.js        # TailwindCSS configuration
```

#### Current Limitations

1. **No Server-Side Persistence:**
   - Theme preference stored only in browser localStorage
   - No database field for user theme preference
   - Lost when user switches devices or browsers

2. **Static CSS Loading:**
   - All theme CSS compiled at build time
   - No runtime theme switching mechanism
   - Prebuilt `indigo-pink.css` hardcoded in `styles.scss`

3. **Incomplete Light/Dark Toggle:**
   - `AegisxConfigService` has `toggleScheme()` method
   - No UI component to trigger theme switching
   - CSS classes (`.light`, `.dark`) not automatically applied

4. **CSS Variable Gaps:**
   - Limited CSS variables (only Fuse-specific: `--fuse-bg-card`, etc.)
   - No comprehensive Material Design token variables
   - TailwindCSS relies on hardcoded color values

5. **No Theme Switching UI:**
   - No theme picker component
   - No visual feedback during theme transitions
   - No theme preview capability

### 1.2 Requirements Analysis

**User Requirements:**

1. 2 themes: Light + Dark (Material Design indigo-pink)
2. Server-side storage in user database
3. Runtime theme switching without page reload
4. Unified CSS variables for both Material and Tailwind

**Technical Requirements:**

1. Backward compatibility with existing theme system
2. Minimal performance impact (no layout shifts)
3. Accessible theme switching (ARIA labels, keyboard support)
4. Type-safe theme configuration
5. Extensible for future theme additions

### 1.3 Recommended Architecture

**Layer Structure:**

```
┌─────────────────────────────────────────────────────────┐
│  User Preferences (Database)                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ users table: theme_preference VARCHAR(20)       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  API Layer (Backend)                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ GET /api/profile/preferences                     │   │
│  │ PUT /api/profile/preferences                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Frontend Services (Angular)                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ThemeService (extends AegisxConfigService)      │   │
│  │  - Load theme from server                        │   │
│  │  - Save theme to server                          │   │
│  │  - Apply theme at runtime                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  CSS Variable Injection Layer                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ document.documentElement.style.setProperty()     │   │
│  │  --md-sys-color-primary                          │   │
│  │  --md-sys-color-on-primary                       │   │
│  │  --md-sys-color-surface                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Material Components & TailwindCSS Utilities             │
│  ┌───────────────────────┬─────────────────────────┐   │
│  │ Material Components   │ TailwindCSS Classes     │   │
│  │  background: var(--md-│  bg-[--md-sys-color-    │   │
│  │    sys-color-surface) │    surface]             │   │
│  └───────────────────────┴─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Design Principles:**

1. **Single Source of Truth:** User preference stored in database
2. **Server-First:** Always load theme from server on app initialization
3. **Fallback Strategy:** LocalStorage as temporary cache, server as authority
4. **Unified Variables:** Both Material and Tailwind use same CSS variables
5. **Runtime Flexibility:** Theme changes applied without page reload

---

## Part 2: Implementation Strategy

### 2.1 Layer Structure

**Layer 1: Material Design Token System**

Material Design 3 uses a token-based color system:

```scss
// Material Design System Tokens
--md-sys-color-primary           // Primary brand color
--md-sys-color-on-primary        // Text/icons on primary
--md-sys-color-primary-container // Primary container background
--md-sys-color-on-primary-container

--md-sys-color-surface           // Background surfaces
--md-sys-color-on-surface        // Text on surfaces
--md-sys-color-surface-variant   // Alternative surfaces

--md-sys-color-error            // Error states
--md-sys-color-on-error
```

**Layer 2: CSS Variable Bridge**

Unified variables accessible by both systems:

```scss
:root {
  // Material Design Tokens (authoritative)
  --md-sys-color-primary: #4f46e5; // Indigo 600
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-surface: #ffffff;
  --md-sys-color-on-surface: #1e293b;

  // Tailwind-compatible aliases
  --color-primary: var(--md-sys-color-primary);
  --color-surface: var(--md-sys-color-surface);
  --color-text: var(--md-sys-color-on-surface);

  // Semantic tokens (legacy Fuse compatibility)
  --fuse-bg-card: var(--md-sys-color-surface);
  --fuse-text-default: var(--md-sys-color-on-surface);
}

.dark {
  --md-sys-color-primary: #818cf8; // Lighter indigo for dark mode
  --md-sys-color-surface: #0f172a; // Slate 900
  --md-sys-color-on-surface: #ffffff;
}
```

**Layer 3: TailwindCSS Integration**

Configure Tailwind to use CSS variables:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Material Design tokens
        'md-primary': 'var(--md-sys-color-primary)',
        'md-on-primary': 'var(--md-sys-color-on-primary)',
        'md-surface': 'var(--md-sys-color-surface)',
        'md-on-surface': 'var(--md-sys-color-on-surface)',

        // Semantic aliases
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text)',
      },
    },
  },
};
```

### 2.2 CSS Variable Naming Convention

**Standard:** Use Material Design 3 token naming as the foundation

**Naming Pattern:**

```
--{system}-{role}-{category}-{variant}-{state}
```

**Examples:**

| Variable                         | Usage                   | Light Value | Dark Value |
| -------------------------------- | ----------------------- | ----------- | ---------- |
| `--md-sys-color-primary`         | Primary brand color     | `#4f46e5`   | `#818cf8`  |
| `--md-sys-color-surface`         | Background cards/panels | `#ffffff`   | `#1e293b`  |
| `--md-sys-color-surface-variant` | Alternate backgrounds   | `#f1f5f9`   | `#334155`  |
| `--md-sys-color-on-surface`      | Text on surfaces        | `#1e293b`   | `#ffffff`  |
| `--md-sys-color-outline`         | Borders/dividers        | `#cbd5e1`   | `#475569`  |

**Backward Compatibility Aliases:**

```scss
// Maintain Fuse variable names for existing code
--fuse-bg-default: var(--md-sys-color-background);
--fuse-bg-card: var(--md-sys-color-surface);
--fuse-text-default: var(--md-sys-color-on-surface);
--fuse-text-secondary: var(--md-sys-color-on-surface-variant);
```

### 2.3 Theme Structure Organization

**Directory Structure:**

```
libs/aegisx-ui/src/lib/themes/
├── core/
│   ├── _tokens.scss              # Material Design tokens
│   ├── _variables.scss           # CSS variable definitions
│   └── _mixins.scss              # Theme application mixins
├── presets/
│   ├── light.scss                # Light theme preset
│   ├── dark.scss                 # Dark theme preset
│   └── indigo-pink.scss          # Material prebuilt override
├── _theme.scss                   # Main theme orchestrator
└── README.md                     # Theme system documentation

libs/aegisx-ui/src/lib/services/
└── theme/
    ├── theme.service.ts          # Theme management service
    ├── theme-loader.service.ts   # Dynamic CSS loading
    └── theme.types.ts            # TypeScript interfaces
```

**Theme Configuration Object:**

```typescript
export interface ThemeConfig {
  id: 'light' | 'dark';
  name: string;
  cssVars: Record<string, string>;
  materialClass: string; // '.light' or '.dark'
  tailwindClass: string; // 'light' or 'dark'
}

export const LIGHT_THEME: ThemeConfig = {
  id: 'light',
  name: 'Light Theme',
  materialClass: 'light',
  tailwindClass: 'light',
  cssVars: {
    '--md-sys-color-primary': '#4f46e5',
    '--md-sys-color-on-primary': '#ffffff',
    '--md-sys-color-surface': '#ffffff',
    '--md-sys-color-on-surface': '#1e293b',
    // ... more tokens
  },
};

export const DARK_THEME: ThemeConfig = {
  id: 'dark',
  name: 'Dark Theme',
  materialClass: 'dark',
  tailwindClass: 'dark',
  cssVars: {
    '--md-sys-color-primary': '#818cf8',
    '--md-sys-color-on-primary': '#1e1b4b',
    '--md-sys-color-surface': '#1e293b',
    '--md-sys-color-on-surface': '#ffffff',
    // ... more tokens
  },
};
```

### 2.4 Dark Mode Implementation Approach

**Strategy: Hybrid Class + CSS Variables**

1. **Root Class Selector** (Tailwind dark mode trigger):

```html
<html class="dark"></html>
```

2. **CSS Variable Override**:

```scss
:root {
  --md-sys-color-surface: #ffffff;
}

.dark {
  --md-sys-color-surface: #1e293b;
}
```

3. **Automatic Application**:

```typescript
// ThemeService applies both:
document.documentElement.classList.remove('light', 'dark');
document.documentElement.classList.add(theme.tailwindClass);
```

**Benefits:**

- TailwindCSS utilities automatically react to `.dark` class
- Material components use overridden CSS variables
- Single class change updates entire UI
- No JavaScript theme recalculation needed

---

## Part 3: Technical Details

### 3.1 How Material Prebuilt Themes Work

**Current Implementation:**

```scss
// apps/admin/src/styles.scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

**What This Does:**

1. **Compiles Material Component Styles:**
   - All Material components (buttons, cards, forms, etc.)
   - Indigo primary color (#3f51b5)
   - Pink accent color (#ff4081)
   - Red warn color (#f44336)

2. **Generates CSS Classes:**

   ```scss
   .mat-primary {
     background-color: #3f51b5;
     color: white;
   }

   .mat-accent {
     background-color: #ff4081;
     color: white;
   }
   ```

3. **Sets Component-Specific Styles:**
   - Button ripple effects
   - Form field outlines
   - Card elevations
   - Typography scales

**Limitation:** All values are **static** - compiled at build time, cannot be changed at runtime.

**Custom Theme Alternative:**

Instead of prebuilt themes, use custom theme compilation:

```scss
// libs/aegisx-ui/src/lib/themes/_theme.scss
@use '@angular/material' as mat;

// Define palettes from CSS variables
$primary: mat.m2-define-palette(
  (
    50: var(--md-ref-palette-primary-50),
    100: var(--md-ref-palette-primary-100),
    // ... more shades
    500: var(--md-sys-color-primary),
    // ... contrast colors
  )
);

$theme: mat.m2-define-light-theme(
  (
    color: (
      primary: $primary,
      accent: $accent,
      warn: $warn,
    ),
  )
);

@include mat.all-component-themes($theme);
```

**Problem:** Material's Sass functions don't support CSS variables directly.

**Solution:** Use CSS variable overlays AFTER Material compilation:

```scss
// 1. Include prebuilt theme (base styles)
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// 2. Override specific properties with CSS variables
.mat-mdc-button.mat-primary {
  --mdc-filled-button-container-color: var(--md-sys-color-primary);
  --mdc-filled-button-label-text-color: var(--md-sys-color-on-primary);
}

.mat-mdc-card {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
```

### 3.2 CSS Variable Injection Points

**Timing:** Inject variables BEFORE Angular components render

**Injection Location:**

```typescript
// app.config.ts - APP_INITIALIZER
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: ThemeService) => {
        return () => themeService.initialize();
      },
      deps: [ThemeService],
      multi: true,
    },
  ],
};
```

**Injection Method:**

```typescript
// theme.service.ts
private applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;

  // 1. Apply CSS variables
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // 2. Apply class for Tailwind
  root.classList.remove('light', 'dark');
  root.classList.add(theme.tailwindClass);

  // 3. Apply class for Material (if using custom theme)
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme.materialClass);
}
```

**Variable Scope:**

```scss
// Global scope - accessible everywhere
:root {
  --md-sys-color-primary: #4f46e5;
}

// Component scope - scoped to Material components
.mat-mdc-button {
  --mdc-filled-button-container-color: var(--md-sys-color-primary);
}

// Utility scope - Tailwind utilities
.bg-md-primary {
  background-color: var(--md-sys-color-primary);
}
```

### 3.3 Material Component Customization

**Approach 1: CSS Variable Overlays (Recommended)**

Override Material's internal CSS variables:

```scss
// Override Material Design Component (MDC) variables
.mat-mdc-button {
  // Filled button
  --mdc-filled-button-container-color: var(--md-sys-color-primary);
  --mdc-filled-button-label-text-color: var(--md-sys-color-on-primary);

  // Outlined button
  --mdc-outlined-button-label-text-color: var(--md-sys-color-primary);
  --mdc-outlined-button-outline-color: var(--md-sys-color-outline);
}

.mat-mdc-card {
  --mdc-elevated-card-container-color: var(--md-sys-color-surface);
  --mdc-elevated-card-container-elevation: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mat-mdc-form-field {
  --mdc-outlined-text-field-focus-outline-color: var(--md-sys-color-primary);
  --mdc-outlined-text-field-label-text-color: var(--md-sys-color-on-surface-variant);
}
```

**Approach 2: Direct Property Override**

For properties without CSS variable support:

```scss
.mat-mdc-card {
  background-color: var(--md-sys-color-surface) !important;
  color: var(--md-sys-color-on-surface) !important;
  border: 1px solid var(--md-sys-color-outline);
}

.mat-mdc-dialog-container {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
```

**Critical Components to Override:**

1. **Buttons:** `mat-mdc-button`, `mat-mdc-icon-button`
2. **Cards:** `mat-mdc-card`
3. **Forms:** `mat-mdc-form-field`, `mat-mdc-input`
4. **Dialogs:** `mat-mdc-dialog-container`
5. **Menus:** `mat-mdc-menu-panel`
6. **Navigation:** `mat-sidenav`, `mat-toolbar`
7. **Tables:** `mat-mdc-table`

### 3.4 TailwindCSS Integration with Material

**Challenge:** TailwindCSS and Material have overlapping class names and specificity conflicts.

**Solution: Scoped Tailwind with `important` Strategy**

```javascript
// tailwind.config.js
module.exports = {
  important: true, // Make Tailwind utilities important
  darkMode: ['selector', '.dark'], // Class-based dark mode
  theme: {
    extend: {
      colors: {
        // Use CSS variables instead of static colors
        'md-primary': 'rgb(var(--md-sys-color-primary-rgb) / <alpha-value>)',
        'md-surface': 'rgb(var(--md-sys-color-surface-rgb) / <alpha-value>)',
      },
    },
  },
};
```

**RGB Variable Pattern:**

CSS variables don't support alpha transparency directly. Use RGB values:

```scss
:root {
  --md-sys-color-primary-rgb: 79, 70, 229; // #4f46e5
  --md-sys-color-surface-rgb: 255, 255, 255;
}

.dark {
  --md-sys-color-primary-rgb: 129, 140, 248; // #818cf8
  --md-sys-color-surface-rgb: 30, 41, 59;
}
```

**Usage in Tailwind:**

```html
<!-- Background with opacity -->
<div class="bg-md-surface/50">Semi-transparent surface</div>

<!-- Text color -->
<span class="text-md-on-surface">Text</span>

<!-- Border -->
<div class="border border-md-outline">Card</div>
```

**Avoiding Conflicts:**

```scss
// Prefix Material utilities to avoid conflicts
.md-card {
  @apply bg-md-surface text-md-on-surface rounded-lg shadow;
}

// Use Material components for complex UI
<mat-card> // Material component
  <div class="flex items-center gap-4"> // Tailwind utilities
    <mat-icon>check</mat-icon> // Material icon
    <span class="text-md-on-surface">Text</span> // Tailwind text
  </div>
</mat-card>
```

---

## Part 4: Step-by-Step Implementation

### Phase 1: Database Schema

**Step 1.1: Create Migration**

```bash
# Generate migration file
pnpm run db:migration:create add_theme_preference_to_users
```

**Step 1.2: Write Migration**

```typescript
// migrations/XXXXXX_add_theme_preference_to_users.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('theme_preference', 20).defaultTo('light');
    table.index('theme_preference'); // Optional: for analytics queries
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('theme_preference');
  });
}
```

**Step 1.3: Run Migration**

```bash
pnpm run db:migrate
```

### Phase 2: Backend API

**Step 2.1: Update User Schema**

```typescript
// apps/api/src/modules/users/users.schemas.ts
import { Type, Static } from '@sinclair/typebox';

export const UserPreferencesSchema = Type.Object({
  theme: Type.Union([Type.Literal('light'), Type.Literal('dark')], { default: 'light' }),
  language: Type.Optional(Type.String()),
  notifications: Type.Optional(Type.Boolean()),
});

export type UserPreferences = Static<typeof UserPreferencesSchema>;

export const UpdatePreferencesSchema = Type.Object({
  theme_preference: Type.Union([Type.Literal('light'), Type.Literal('dark')]),
});

export type UpdatePreferences = Static<typeof UpdatePreferencesSchema>;
```

**Step 2.2: Create Preferences Routes**

```typescript
// apps/api/src/modules/profile/profile.routes.ts
import { FastifyInstance } from 'fastify';
import { UpdatePreferencesSchema } from './profile.schemas';

export async function profileRoutes(fastify: FastifyInstance) {
  // GET /api/profile/preferences
  fastify.get('/preferences', {
    preValidation: [fastify.verifyJWT],
    schema: {
      tags: ['Profile'],
      summary: 'Get user preferences',
      response: {
        200: UserPreferencesSchema,
      },
    },
    handler: async (request, reply) => {
      const userId = request.user.id;
      const user = await fastify.db('users').where({ id: userId }).select('theme_preference').first();

      return reply.send({
        theme: user?.theme_preference || 'light',
      });
    },
  });

  // PUT /api/profile/preferences
  fastify.put('/preferences', {
    preValidation: [fastify.verifyJWT],
    schema: {
      tags: ['Profile'],
      summary: 'Update user preferences',
      body: UpdatePreferencesSchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          theme: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const userId = request.user.id;
      const { theme_preference } = request.body;

      await fastify.db('users').where({ id: userId }).update({
        theme_preference,
        updated_at: new Date(),
      });

      return reply.send({
        success: true,
        theme: theme_preference,
      });
    },
  });
}
```

**Step 2.3: Register Routes**

```typescript
// apps/api/src/app.routes.ts
import { profileRoutes } from './modules/profile/profile.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // ... existing routes

  await fastify.register(profileRoutes, { prefix: '/api/profile' });
}
```

### Phase 3: Frontend Theme Service

**Step 3.1: Create Theme Types**

```typescript
// libs/aegisx-ui/src/lib/services/theme/theme.types.ts
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  cssVars: Record<string, string>;
  cssVarsRgb: Record<string, string>;
  materialClass: string;
  tailwindClass: string;
}

export interface UserThemePreference {
  theme: ThemeMode;
}

export const LIGHT_THEME: ThemeConfig = {
  id: 'light',
  name: 'Light Theme',
  materialClass: 'light',
  tailwindClass: 'light',
  cssVars: {
    '--md-sys-color-primary': '#4f46e5',
    '--md-sys-color-on-primary': '#ffffff',
    '--md-sys-color-primary-container': '#e0e7ff',
    '--md-sys-color-on-primary-container': '#1e1b4b',

    '--md-sys-color-surface': '#ffffff',
    '--md-sys-color-on-surface': '#1e293b',
    '--md-sys-color-surface-variant': '#f1f5f9',
    '--md-sys-color-on-surface-variant': '#64748b',

    '--md-sys-color-background': '#f8fafc',
    '--md-sys-color-on-background': '#0f172a',

    '--md-sys-color-error': '#dc2626',
    '--md-sys-color-on-error': '#ffffff',

    '--md-sys-color-outline': '#cbd5e1',
    '--md-sys-color-outline-variant': '#e2e8f0',
  },
  cssVarsRgb: {
    '--md-sys-color-primary-rgb': '79, 70, 229',
    '--md-sys-color-surface-rgb': '255, 255, 255',
    '--md-sys-color-on-surface-rgb': '30, 41, 59',
  },
};

export const DARK_THEME: ThemeConfig = {
  id: 'dark',
  name: 'Dark Theme',
  materialClass: 'dark',
  tailwindClass: 'dark',
  cssVars: {
    '--md-sys-color-primary': '#818cf8',
    '--md-sys-color-on-primary': '#1e1b4b',
    '--md-sys-color-primary-container': '#312e81',
    '--md-sys-color-on-primary-container': '#e0e7ff',

    '--md-sys-color-surface': '#1e293b',
    '--md-sys-color-on-surface': '#ffffff',
    '--md-sys-color-surface-variant': '#334155',
    '--md-sys-color-on-surface-variant': '#94a3b8',

    '--md-sys-color-background': '#0f172a',
    '--md-sys-color-on-background': '#f1f5f9',

    '--md-sys-color-error': '#ef4444',
    '--md-sys-color-on-error': '#450a0a',

    '--md-sys-color-outline': '#475569',
    '--md-sys-color-outline-variant': '#334155',
  },
  cssVarsRgb: {
    '--md-sys-color-primary-rgb': '129, 140, 248',
    '--md-sys-color-surface-rgb': '30, 41, 59',
    '--md-sys-color-on-surface-rgb': '255, 255, 255',
  },
};

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};
```

**Step 3.2: Create Theme Service**

```typescript
// libs/aegisx-ui/src/lib/services/theme/theme.service.ts
import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { THEMES, ThemeConfig, ThemeMode, UserThemePreference } from './theme.types';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private http = inject(HttpClient);

  // State
  private _currentTheme = signal<ThemeMode>('light');
  private _isInitialized = signal(false);

  // Public readonly signals
  readonly currentTheme = this._currentTheme.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isDarkMode = () => this._currentTheme() === 'dark';
  readonly isLightMode = () => this._currentTheme() === 'light';

  constructor() {
    // Apply theme whenever it changes
    effect(() => {
      const theme = this._currentTheme();
      this.applyTheme(THEMES[theme]);
    });
  }

  /**
   * Initialize theme system
   * Called from APP_INITIALIZER
   */
  async initialize(): Promise<void> {
    try {
      // 1. Try to load from server
      const serverTheme = await this.loadFromServer();

      if (serverTheme) {
        this._currentTheme.set(serverTheme);
      } else {
        // 2. Fallback to localStorage
        const cachedTheme = this.loadFromCache();

        if (cachedTheme) {
          this._currentTheme.set(cachedTheme);
        } else {
          // 3. Fallback to system preference
          const systemTheme = this.detectSystemTheme();
          this._currentTheme.set(systemTheme);
        }
      }

      this._isInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      this._currentTheme.set('light'); // Safe fallback
      this._isInitialized.set(true);
    }
  }

  /**
   * Set theme and persist to server
   */
  async setTheme(theme: ThemeMode): Promise<void> {
    this._currentTheme.set(theme);
    this.saveToCache(theme);

    try {
      await this.saveToServer(theme);
    } catch (error) {
      console.error('Failed to save theme to server:', error);
      // Continue anyway - cache will work
    }
  }

  /**
   * Toggle between light and dark
   */
  async toggleTheme(): Promise<void> {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    await this.setTheme(newTheme);
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(config: ThemeConfig): void {
    const root = document.documentElement;
    const body = document.body;

    // 1. Apply CSS variables
    Object.entries(config.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // 2. Apply RGB variables (for Tailwind alpha support)
    Object.entries(config.cssVarsRgb).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // 3. Apply Tailwind dark mode class
    root.classList.remove('light', 'dark');
    root.classList.add(config.tailwindClass);

    // 4. Apply Material theme class
    body.classList.remove('light', 'dark');
    body.classList.add(config.materialClass);

    // 5. Update Fuse compatibility variables
    this.applyFuseCompatibility(config);
  }

  /**
   * Maintain backward compatibility with Fuse variables
   */
  private applyFuseCompatibility(config: ThemeConfig): void {
    const root = document.documentElement;
    const isDark = config.id === 'dark';

    root.style.setProperty('--fuse-bg-default', config.cssVars['--md-sys-color-background']);
    root.style.setProperty('--fuse-bg-card', config.cssVars['--md-sys-color-surface']);
    root.style.setProperty('--fuse-text-default', config.cssVars['--md-sys-color-on-surface']);
    root.style.setProperty('--fuse-text-secondary', config.cssVars['--md-sys-color-on-surface-variant']);
    root.style.setProperty('--fuse-divider', config.cssVars['--md-sys-color-outline-variant']);
    root.style.setProperty('--fuse-border', config.cssVars['--md-sys-color-outline']);
  }

  /**
   * Load theme from server
   */
  private async loadFromServer(): Promise<ThemeMode | null> {
    try {
      const response = await firstValueFrom(this.http.get<UserThemePreference>('/api/profile/preferences'));
      return response.theme;
    } catch (error) {
      // User not logged in or API error
      return null;
    }
  }

  /**
   * Save theme to server
   */
  private async saveToServer(theme: ThemeMode): Promise<void> {
    await firstValueFrom(
      this.http.put('/api/profile/preferences', {
        theme_preference: theme,
      }),
    );
  }

  /**
   * Load theme from localStorage
   */
  private loadFromCache(): ThemeMode | null {
    try {
      const cached = localStorage.getItem('aegisx-theme');
      return cached as ThemeMode | null;
    } catch {
      return null;
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveToCache(theme: ThemeMode): void {
    try {
      localStorage.setItem('aegisx-theme', theme);
    } catch (error) {
      console.error('Failed to save theme to cache:', error);
    }
  }

  /**
   * Detect system theme preference
   */
  private detectSystemTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'light';

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
```

**Step 3.3: Register Theme Service**

```typescript
// apps/admin/src/app/app.config.ts
import { ThemeService } from '@aegisx/ui';

function initializeTheme() {
  return () => {
    const themeService = inject(ThemeService);
    return themeService.initialize();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers

    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      multi: true,
    },

    ThemeService,
  ],
};
```

### Phase 4: Theme Switcher Component

**Step 4.1: Create Component**

```typescript
// libs/aegisx-ui/src/lib/components/theme-switcher/theme-switcher.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'ax-theme-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button mat-icon-button class="theme-switcher" [matTooltip]="tooltipText()" (click)="toggleTheme()" [attr.aria-label]="ariaLabel()">
      <mat-icon>
        {{ isDarkMode() ? 'light_mode' : 'dark_mode' }}
      </mat-icon>
    </button>
  `,
  styles: [
    `
      .theme-switcher {
        transition: transform 200ms ease;

        &:hover {
          transform: rotate(180deg);
        }

        mat-icon {
          transition: color 200ms ease;
        }
      }
    `,
  ],
})
export class ThemeSwitcherComponent {
  private themeService = inject(ThemeService);

  // Signals
  readonly isDarkMode = this.themeService.isDarkMode;
  readonly currentTheme = this.themeService.currentTheme;

  // Computed values
  readonly tooltipText = () => (this.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode');

  readonly ariaLabel = () => (this.isDarkMode() ? 'Activate light mode' : 'Activate dark mode');

  async toggleTheme(): Promise<void> {
    await this.themeService.toggleTheme();
  }
}
```

**Step 4.2: Add to Layout**

```typescript
// libs/aegisx-ui/src/lib/layouts/classic/classic.component.ts
import { ThemeSwitcherComponent } from '../../components/theme-switcher/theme-switcher.component';

@Component({
  // ... existing config
  imports: [
    // ... existing imports
    ThemeSwitcherComponent,
  ],
  template: `
    <mat-toolbar>
      <!-- ... existing toolbar items -->

      <ax-theme-switcher />

      <!-- ... existing toolbar items -->
    </mat-toolbar>
  `,
})
export class ClassicLayoutComponent {}
```

### Phase 5: CSS Variable Styles

**Step 5.1: Create Theme Stylesheet**

```scss
// libs/aegisx-ui/src/lib/themes/_theme.scss

// Material Design Token Defaults
:root {
  // Primary
  --md-sys-color-primary: #4f46e5;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #e0e7ff;
  --md-sys-color-on-primary-container: #1e1b4b;

  // Surface
  --md-sys-color-surface: #ffffff;
  --md-sys-color-on-surface: #1e293b;
  --md-sys-color-surface-variant: #f1f5f9;
  --md-sys-color-on-surface-variant: #64748b;

  // Background
  --md-sys-color-background: #f8fafc;
  --md-sys-color-on-background: #0f172a;

  // Error
  --md-sys-color-error: #dc2626;
  --md-sys-color-on-error: #ffffff;

  // Outline
  --md-sys-color-outline: #cbd5e1;
  --md-sys-color-outline-variant: #e2e8f0;

  // RGB values for Tailwind alpha support
  --md-sys-color-primary-rgb: 79, 70, 229;
  --md-sys-color-surface-rgb: 255, 255, 255;
  --md-sys-color-on-surface-rgb: 30, 41, 59;

  // Fuse compatibility
  --fuse-bg-default: var(--md-sys-color-background);
  --fuse-bg-card: var(--md-sys-color-surface);
  --fuse-text-default: var(--md-sys-color-on-surface);
  --fuse-text-secondary: var(--md-sys-color-on-surface-variant);
  --fuse-divider: var(--md-sys-color-outline-variant);
  --fuse-border: var(--md-sys-color-outline);
  --fuse-hover: rgba(148, 163, 184, 0.12);
}

// Dark theme overrides (applied via .dark class by ThemeService)
.dark {
  --md-sys-color-primary: #818cf8;
  --md-sys-color-on-primary: #1e1b4b;
  --md-sys-color-primary-container: #312e81;
  --md-sys-color-on-primary-container: #e0e7ff;

  --md-sys-color-surface: #1e293b;
  --md-sys-color-on-surface: #ffffff;
  --md-sys-color-surface-variant: #334155;
  --md-sys-color-on-surface-variant: #94a3b8;

  --md-sys-color-background: #0f172a;
  --md-sys-color-on-background: #f1f5f9;

  --md-sys-color-error: #ef4444;
  --md-sys-color-on-error: #450a0a;

  --md-sys-color-outline: #475569;
  --md-sys-color-outline-variant: #334155;

  --md-sys-color-primary-rgb: 129, 140, 248;
  --md-sys-color-surface-rgb: 30, 41, 59;
  --md-sys-color-on-surface-rgb: 255, 255, 255;

  --fuse-hover: rgba(255, 255, 255, 0.05);
}

// Material Component Overrides
.mat-mdc-card {
  background-color: var(--md-sys-color-surface) !important;
  color: var(--md-sys-color-on-surface) !important;
}

.mat-mdc-button.mat-primary {
  --mdc-filled-button-container-color: var(--md-sys-color-primary);
  --mdc-filled-button-label-text-color: var(--md-sys-color-on-primary);
}

.mat-mdc-form-field {
  --mdc-outlined-text-field-focus-outline-color: var(--md-sys-color-primary);
  --mdc-outlined-text-field-label-text-color: var(--md-sys-color-on-surface-variant);
  --mdc-outlined-text-field-input-text-color: var(--md-sys-color-on-surface);
}

.mat-mdc-dialog-container {
  --mdc-dialog-container-color: var(--md-sys-color-surface);
}

// Smooth theme transitions
* {
  transition:
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease;
}
```

**Step 5.2: Import in App Styles**

```scss
// apps/admin/src/styles.scss

// Import Tailwind
@tailwind base;
@tailwind components;
@tailwind utilities;

// Import Material prebuilt theme
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// Import AegisX theme system
@import '@aegisx/ui/themes/theme';

// Existing Fuse styles
@layer base {
  // ... existing base styles
}
```

### Phase 6: Update TailwindCSS Config

```javascript
// apps/admin/tailwind.config.js
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

module.exports = {
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  darkMode: ['selector', '.dark'],
  important: true,
  theme: {
    extend: {
      colors: {
        // Material Design System tokens
        'md-primary': 'rgb(var(--md-sys-color-primary-rgb) / <alpha-value>)',
        'md-on-primary': 'var(--md-sys-color-on-primary)',
        'md-surface': 'rgb(var(--md-sys-color-surface-rgb) / <alpha-value>)',
        'md-on-surface': 'rgb(var(--md-sys-color-on-surface-rgb) / <alpha-value>)',
        'md-background': 'var(--md-sys-color-background)',
        'md-outline': 'var(--md-sys-color-outline)',

        // Semantic aliases (backward compatibility)
        surface: 'var(--md-sys-color-surface)',
        card: 'var(--fuse-bg-card)',
        default: 'var(--fuse-bg-default)',
        border: 'var(--fuse-border)',
        divider: 'var(--fuse-divider)',
      },
    },
  },
  plugins: [],
};
```

---

## Part 5: Code Examples

### Example 1: Using Theme in Components

```typescript
// Feature component using theme
import { Component, inject } from '@angular/core';
import { ThemeService } from '@aegisx/ui';

@Component({
  selector: 'app-dashboard',
  template: `
    <mat-card class="bg-md-surface text-md-on-surface">
      <mat-card-header>
        <mat-card-title> Current Theme: {{ currentTheme() }} </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <p>Dark mode: {{ isDarkMode() ? 'Active' : 'Inactive' }}</p>

        <button mat-raised-button color="primary" (click)="toggleTheme()">Toggle Theme</button>
      </mat-card-content>
    </mat-card>
  `,
})
export class DashboardComponent {
  private themeService = inject(ThemeService);

  readonly currentTheme = this.themeService.currentTheme;
  readonly isDarkMode = this.themeService.isDarkMode;

  async toggleTheme(): Promise<void> {
    await this.themeService.toggleTheme();
  }
}
```

### Example 2: Custom Themed Card Component

```typescript
// libs/aegisx-ui/src/lib/components/themed-card/themed-card.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ax-themed-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card [class]="cardClasses()" [attr.data-theme]="variant()">
      <ng-content />
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        border: 1px solid var(--md-sys-color-outline-variant);
        transition: all 200ms ease;

        &[data-theme='primary'] {
          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        &:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
      }
    `,
  ],
})
export class ThemedCardComponent {
  variant = input<'default' | 'primary'>('default');

  cardClasses = () => {
    const variant = this.variant();
    return `themed-card themed-card--${variant}`;
  };
}
```

### Example 3: Testing Theme Service

```typescript
// libs/aegisx-ui/src/lib/services/theme/theme.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ThemeService],
    });

    service = TestBed.inject(ThemeService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize with light theme by default', async () => {
    await service.initialize();
    expect(service.currentTheme()).toBe('light');
  });

  it('should load theme from server on initialize', async () => {
    const initPromise = service.initialize();

    const req = httpMock.expectOne('/api/profile/preferences');
    expect(req.request.method).toBe('GET');

    req.flush({ theme: 'dark' });

    await initPromise;

    expect(service.currentTheme()).toBe('dark');
  });

  it('should toggle between light and dark', async () => {
    await service.initialize();

    expect(service.currentTheme()).toBe('light');

    const togglePromise = service.toggleTheme();

    const req = httpMock.expectOne('/api/profile/preferences');
    req.flush({ success: true, theme: 'dark' });

    await togglePromise;

    expect(service.currentTheme()).toBe('dark');
  });

  it('should apply CSS variables to document', async () => {
    await service.initialize();

    const root = document.documentElement;
    const primaryColor = root.style.getPropertyValue('--md-sys-color-primary');

    expect(primaryColor).toBeTruthy();
  });

  it('should save theme to localStorage', async () => {
    await service.setTheme('dark');

    const cached = localStorage.getItem('aegisx-theme');
    expect(cached).toBe('dark');
  });
});
```

### Example 4: Using Tailwind with Theme Variables

```html
<!-- Using Material Design token classes -->
<div class="bg-md-surface text-md-on-surface rounded-lg shadow">
  <h2 class="text-md-primary font-semibold">Themed Card</h2>
  <p class="text-md-on-surface/70">This card adapts to theme changes</p>

  <div class="border-t border-md-outline mt-4 pt-4">
    <button class="bg-md-primary text-md-on-primary px-4 py-2 rounded">Primary Action</button>
  </div>
</div>

<!-- With opacity support -->
<div class="bg-md-surface/50 backdrop-blur-sm">Semi-transparent surface</div>

<!-- Hover states -->
<button class="bg-md-surface hover:bg-md-surface/80 text-md-on-surface">Hover me</button>
```

### Example 5: Profile Preferences Integration

```typescript
// apps/admin/src/app/features/profile/profile.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemeService } from '@aegisx/ui';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile-preferences',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Appearance Preferences</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="preferencesForm" (ngSubmit)="savePreferences()">
          <mat-radio-group formControlName="theme" class="flex flex-col gap-4">
            <mat-radio-button value="light">
              <div class="flex items-center gap-2">
                <mat-icon>light_mode</mat-icon>
                <span>Light Theme</span>
              </div>
            </mat-radio-button>

            <mat-radio-button value="dark">
              <div class="flex items-center gap-2">
                <mat-icon>dark_mode</mat-icon>
                <span>Dark Theme</span>
              </div>
            </mat-radio-button>
          </mat-radio-group>

          <div class="mt-6">
            <button mat-raised-button color="primary" type="submit" [disabled]="!preferencesForm.dirty">Save Preferences</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
})
export class ProfilePreferencesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);

  preferencesForm: FormGroup;

  constructor() {
    this.preferencesForm = this.fb.group({
      theme: [this.themeService.currentTheme()],
    });
  }

  ngOnInit(): void {
    // Watch for theme changes from service
    this.preferencesForm.patchValue(
      {
        theme: this.themeService.currentTheme(),
      },
      { emitEvent: false },
    );
  }

  async savePreferences(): Promise<void> {
    const theme = this.preferencesForm.value.theme;

    try {
      await this.themeService.setTheme(theme);

      this.snackBar.open('Preferences saved successfully', 'Close', {
        duration: 3000,
      });

      this.preferencesForm.markAsPristine();
    } catch (error) {
      this.snackBar.open('Failed to save preferences', 'Close', {
        duration: 5000,
      });
    }
  }
}
```

---

## Part 6: Potential Issues & Solutions

### Issue 1: Material CSS Specificity Conflicts

**Problem:** Material's compiled CSS has high specificity, making overrides difficult.

**Symptoms:**

```scss
// This doesn't work:
.mat-mdc-card {
  background-color: var(--md-sys-color-surface); // ❌ Ignored
}
```

**Solutions:**

**Option A: Use `!important` (Quick Fix)**

```scss
.mat-mdc-card {
  background-color: var(--md-sys-color-surface) !important; // ✅ Works
}
```

**Option B: Increase Specificity**

```scss
body .mat-mdc-card {
  background-color: var(--md-sys-color-surface); // ✅ Higher specificity
}
```

**Option C: Override Material's Internal Variables (Best)**

```scss
.mat-mdc-card {
  --mdc-elevated-card-container-color: var(--md-sys-color-surface); // ✅ Native
}
```

**Recommendation:** Use Option C when possible, fallback to Option A for properties without CSS variable support.

### Issue 2: Tailwind Utilities Conflicts

**Problem:** Tailwind's reset conflicts with Material's base styles.

**Symptoms:**

- Material buttons lose default padding
- Form fields have incorrect heights
- Typography scales don't match

**Solution: Configure Tailwind `important` Strategy**

```javascript
// tailwind.config.js
module.exports = {
  important: true, // Make all utilities !important

  // OR use a selector to scope Tailwind
  important: '#app', // Only apply to elements inside #app

  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset
  },
};
```

**Then wrap app content:**

```html
<div id="app">
  <!-- Tailwind utilities work here -->
</div>
```

### Issue 3: Dark Mode Selector Conflicts

**Problem:** Multiple systems trying to control dark mode class.

**Symptoms:**

- `.dark` class added/removed unexpectedly
- Theme flickers between light/dark
- TailwindCSS dark utilities don't work

**Solution: Single Source of Truth**

```typescript
// ThemeService is the ONLY place that modifies .dark class
private applyTheme(config: ThemeConfig): void {
  const root = document.documentElement;

  // Remove all theme classes first
  root.classList.remove('light', 'dark');

  // Add new theme class
  root.classList.add(config.tailwindClass);
}
```

**Prevent conflicts:**

```typescript
// ❌ DON'T do this in other services/components
document.documentElement.classList.toggle('dark');

// ✅ Always use ThemeService
await themeService.setTheme('dark');
```

### Issue 4: CSS Variables Not Updating in Material Components

**Problem:** Material components don't react to CSS variable changes.

**Symptoms:**

- Theme changes don't affect Material buttons/cards
- Colors remain static after theme switch

**Root Cause:** Material components use Sass variables at build time, not runtime CSS variables.

**Solution: Hybrid Approach**

```scss
// 1. Define CSS variables
:root {
  --md-sys-color-primary: #4f46e5;
}

// 2. Override Material's compiled CSS
.mat-mdc-button.mat-primary {
  // Use Material's internal CSS variables (Material v15+)
  --mdc-filled-button-container-color: var(--md-sys-color-primary);

  // OR use direct property override
  background-color: var(--md-sys-color-primary) !important;
}
```

**For components without CSS variable support:**

```scss
.mat-mdc-card {
  // Force property override
  background-color: var(--md-sys-color-surface) !important;
  color: var(--md-sys-color-on-surface) !important;
}
```

### Issue 5: Theme Flash on Initial Load

**Problem:** Wrong theme briefly visible before correct theme loads.

**Symptoms:**

- White flash when dark theme should load
- Jarring visual transition on app start

**Solution: Inline Critical CSS**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>AegisX Platform</title>

    <!-- Critical inline styles to prevent flash -->
    <style>
      /* Prevent flash by setting default theme immediately */
      :root {
        --md-sys-color-surface: #ffffff;
        --md-sys-color-on-surface: #1e293b;
      }

      /* If user prefers dark, apply immediately */
      @media (prefers-color-scheme: dark) {
        :root {
          --md-sys-color-surface: #1e293b;
          --md-sys-color-on-surface: #ffffff;
        }

        html {
          background-color: #0f172a;
        }
      }

      body {
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        margin: 0;
        transition: none; /* No transition on initial load */
      }
    </style>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

**Alternative: Script-based Detection**

```html
<!-- index.html - before body -->
<script>
  // Detect theme preference before Angular loads
  (function () {
    const cached = localStorage.getItem('aegisx-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = cached || (prefersDark ? 'dark' : 'light');

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### Issue 6: Performance Degradation with CSS Variable Updates

**Problem:** Setting hundreds of CSS variables on every theme change is slow.

**Symptoms:**

- Noticeable lag when switching themes
- Janky animations during theme transition

**Solution: Batch Variable Updates**

```typescript
// ❌ Slow - causes multiple reflows
Object.entries(config.cssVars).forEach(([key, value]) => {
  root.style.setProperty(key, value);
});

// ✅ Fast - single reflow
const cssText = Object.entries(config.cssVars)
  .map(([key, value]) => `${key}: ${value};`)
  .join(' ');

root.style.cssText = cssText;
```

**Alternative: CSS Class Swapping**

```scss
// Define all variables per theme class
.theme-light {
  --md-sys-color-primary: #4f46e5;
  --md-sys-color-surface: #ffffff;
  /* ... all variables */
}

.theme-dark {
  --md-sys-color-primary: #818cf8;
  --md-sys-color-surface: #1e293b;
  /* ... all variables */
}
```

```typescript
// Just swap classes - super fast
root.classList.remove('theme-light', 'theme-dark');
root.classList.add(`theme-${theme}`);
```

### Issue 7: Server-Side Rendering (SSR) Compatibility

**Problem:** `localStorage` and `document` not available in SSR.

**Symptoms:**

- "localStorage is not defined" errors
- "document is not defined" errors

**Solution: Platform Checks**

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private loadFromCache(): ThemeMode | null {
    if (!this.isBrowser) return null;

    try {
      return localStorage.getItem('aegisx-theme') as ThemeMode;
    } catch {
      return null;
    }
  }

  private applyTheme(config: ThemeConfig): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    // ... apply theme
  }
}
```

### Issue 8: Browser Compatibility

**Problem:** CSS variables not supported in older browsers (IE11).

**Symptoms:**

- Theme doesn't apply in legacy browsers
- Fallback colors not working

**Solution: CSS Variable Fallbacks**

```scss
.mat-mdc-card {
  /* Fallback for browsers without CSS variable support */
  background-color: #ffffff;
  background-color: var(--md-sys-color-surface, #ffffff);

  color: #1e293b;
  color: var(--md-sys-color-on-surface, #1e293b);
}
```

**Feature Detection:**

```typescript
// Detect CSS variable support
const supportsCssVars = CSS.supports('(--test: 0)');

if (!supportsCssVars) {
  console.warn('CSS variables not supported - using fallback theme');
  // Apply static theme via class instead
  document.body.classList.add('legacy-theme');
}
```

---

## Appendix: Quick Reference

### Key Files to Modify

| File                                                     | Purpose          | Changes                       |
| -------------------------------------------------------- | ---------------- | ----------------------------- |
| `apps/api/migrations/*.ts`                               | Database         | Add `theme_preference` column |
| `apps/api/src/modules/profile/profile.routes.ts`         | Backend API      | GET/PUT preferences endpoints |
| `libs/aegisx-ui/src/lib/services/theme/theme.service.ts` | Theme Logic      | Load/save/apply themes        |
| `libs/aegisx-ui/src/lib/services/theme/theme.types.ts`   | Type Definitions | Theme config interfaces       |
| `libs/aegisx-ui/src/lib/themes/_theme.scss`              | CSS Variables    | Material Design tokens        |
| `libs/aegisx-ui/src/lib/components/theme-switcher/`      | UI Component     | Theme toggle button           |
| `apps/admin/src/app/app.config.ts`                       | App Bootstrap    | APP_INITIALIZER for theme     |
| `apps/admin/tailwind.config.js`                          | Tailwind Config  | CSS variable integration      |
| `apps/admin/src/styles.scss`                             | Global Styles    | Import theme stylesheet       |

### CSS Variable Reference

```scss
// Primary Colors
--md-sys-color-primary              // Brand color
--md-sys-color-on-primary           // Text on primary
--md-sys-color-primary-container    // Primary bg variant
--md-sys-color-on-primary-container // Text on variant

// Surface Colors
--md-sys-color-surface              // Card/panel background
--md-sys-color-on-surface           // Text on cards
--md-sys-color-surface-variant      // Alternative surface
--md-sys-color-on-surface-variant   // Text on alt surface

// Background
--md-sys-color-background           // Page background
--md-sys-color-on-background        // Page text

// Functional
--md-sys-color-error                // Error state
--md-sys-color-on-error             // Text on error
--md-sys-color-outline              // Borders
--md-sys-color-outline-variant      // Subtle borders

// RGB Variants (for alpha transparency)
--md-sys-color-primary-rgb          // "79, 70, 229"
--md-sys-color-surface-rgb          // "255, 255, 255"
--md-sys-color-on-surface-rgb       // "30, 41, 59"
```

### API Endpoints

```typescript
// Get user theme preference
GET /api/profile/preferences
Response: { theme: 'light' | 'dark' }

// Update user theme preference
PUT /api/profile/preferences
Body: { theme_preference: 'light' | 'dark' }
Response: { success: true, theme: 'light' | 'dark' }
```

### Theme Service API

```typescript
// Initialization
await themeService.initialize();

// Get current theme
const theme = themeService.currentTheme(); // 'light' | 'dark'

// Check mode
const isDark = themeService.isDarkMode();
const isLight = themeService.isLightMode();

// Set theme
await themeService.setTheme('dark');

// Toggle theme
await themeService.toggleTheme();
```

### Testing Checklist

- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] Theme persists to database
- [ ] Theme loads from database on login
- [ ] Theme switcher component works
- [ ] Theme persists across page refreshes
- [ ] Material components adopt theme colors
- [ ] Tailwind utilities respect theme
- [ ] No flash of wrong theme on load
- [ ] Theme transitions are smooth (200ms)
- [ ] Keyboard navigation works on switcher
- [ ] Screen readers announce theme changes
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Works on mobile devices
- [ ] No console errors or warnings

---

**End of Implementation Guide**

For questions or issues, consult:

- [Material Design 3 Documentation](https://m3.material.io/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Angular Material Theming Guide](https://material.angular.io/guide/theming)
- Project CLAUDE.md for development standards
