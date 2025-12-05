# AegisX CLI - Shell Generation Guide

> Create complete Angular app shells with a single command

---

## Overview

App shells provide the foundational layout structure for Angular applications. The `aegisx shell` command generates complete, ready-to-use shell modules with navigation, routing, and theming support.

---

## Quick Start

```bash
# Generate enterprise shell (most common)
aegisx shell reports --force

# Generate simple shell (for auth pages)
aegisx shell auth --type simple --force

# Generate multi-app shell (for complex modules)
aegisx shell inventory --type multi-app --force
```

---

## Shell Types

### Simple Shell

```bash
aegisx shell auth --type simple --force
```

**Uses:** `AxEmptyLayoutComponent`

**Features:**

- Minimal layout without navigation
- Clean, distraction-free design
- Centered content area

**Best for:**

- Login/Register pages
- Landing pages
- Error pages (404, 500)
- Single-page wizards

**Generated Structure:**

```
features/auth/
├── auth.component.ts        # Shell component
├── auth.config.ts           # Shell configuration
├── auth.routes.ts           # Lazy-loaded routes
└── index.ts                 # Public exports
```

---

### Enterprise Shell (Default)

```bash
aegisx shell system --force
# or
aegisx shell system --type enterprise --force
```

**Uses:** `AxEnterpriseLayoutComponent`

**Features:**

- Full navigation sidebar
- Header with user actions
- Footer with version info
- Breadcrumb navigation
- Responsive design

**Best for:**

- Admin panels
- Management systems
- Dashboard applications
- Business applications

**Generated Structure:**

```
features/system/
├── system.component.ts      # Shell component
├── system.config.ts         # Navigation config
├── system.routes.ts         # Lazy-loaded routes
├── pages/
│   ├── dashboard/           # Default dashboard page
│   └── settings/            # Settings page (optional)
└── index.ts
```

---

### Multi-App Shell

```bash
aegisx shell inventory --type multi-app --force
```

**Uses:** `AxEnterpriseLayoutComponent` with sub-app tabs

**Features:**

- All enterprise features, plus:
- Sub-application tabs in header
- Dynamic navigation per sub-app
- Shared services across sub-apps

**Best for:**

- Complex modules with multiple sections
- ERP-style applications
- Multi-function modules

**Example Use Cases:**

- Inventory: Warehouse, Receiving, Shipping
- HR: Employees, Payroll, Leave
- Finance: Accounting, Billing, Reports

**Generated Structure:**

```
features/inventory/
├── inventory.component.ts   # Shell with tabs
├── inventory.config.ts      # Sub-app configuration
├── inventory.routes.ts      # Sub-app routing
├── apps/
│   ├── warehouse/           # Sub-app 1
│   ├── receiving/           # Sub-app 2
│   └── shipping/            # Sub-app 3
└── index.ts
```

---

## Command Options

```bash
aegisx shell <name> [options]
```

| Option                  | Default      | Description                                       |
| ----------------------- | ------------ | ------------------------------------------------- |
| `-t, --type <type>`     | `enterprise` | Shell type: `simple`, `enterprise`, `multi-app`   |
| `-a, --app <app>`       | `web`        | Target Angular app: `web`, `admin`                |
| `-n, --name <name>`     | -            | Display name (default: capitalized shell name)    |
| `--theme <theme>`       | `default`    | Theme preset: `default`, `indigo`, `teal`, `rose` |
| `--order <number>`      | `0`          | Order in app launcher                             |
| `--with-dashboard`      | `true`       | Include dashboard page                            |
| `--with-settings`       | `false`      | Include settings page                             |
| `--with-auth`           | `true`       | Include AuthGuard protection                      |
| `--with-theme-switcher` | `false`      | Include theme switcher component                  |
| `-f, --force`           | `false`      | Overwrite existing files                          |
| `-d, --dry-run`         | `false`      | Preview without creating files                    |

---

## Examples

### Basic Enterprise Shell

```bash
aegisx shell reports --force
```

### Shell with Settings Page

```bash
aegisx shell admin --with-settings --force
```

### Shell with Theme Switcher

```bash
aegisx shell dashboard --with-theme-switcher --force
```

### Shell for Admin App

```bash
aegisx shell system --app admin --force
```

### Preview Before Creating

```bash
aegisx shell analytics --dry-run
```

### Custom Display Name

```bash
aegisx shell hr --name "Human Resources" --force
```

---

## Integration with Generate Command

After creating a shell, you can generate CRUD modules directly into it:

```bash
# Step 1: Create shell
aegisx shell inventory --force

# Step 2: Generate module into shell
aegisx generate products --target frontend --shell inventory --force
```

The `--shell` option automatically:

- Registers routes in the shell's routes file
- Adds navigation item to shell config
- Maintains proper lazy loading

---

## Generated Files Explained

### shell.component.ts

```typescript
@Component({
  selector: 'app-reports-shell',
  standalone: true,
  imports: [AxEnterpriseLayoutComponent],
  template: `
    <ax-enterprise-layout [config]="config">
      <router-outlet />
    </ax-enterprise-layout>
  `,
})
export class ReportsShellComponent {
  config = REPORTS_CONFIG;
}
```

### shell.config.ts

```typescript
export const REPORTS_CONFIG: ShellConfig = {
  id: 'reports',
  name: 'Reports',
  icon: 'analytics',
  navigation: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      link: '/reports/dashboard',
    },
    // Add more navigation items here
  ],
};
```

### shell.routes.ts

```typescript
export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: ReportsShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // Generated modules are added here
    ],
  },
];
```

---

## Next Steps After Generation

After running `aegisx shell`, you need to:

### 1. Register Shell Routes

Add to your `app.routes.ts`:

```typescript
{
  path: 'reports',
  loadChildren: () => import('./features/reports/reports.routes')
    .then(m => m.REPORTS_ROUTES),
},
```

### 2. Add to App Launcher (Optional)

Add to your navigation config:

```typescript
{
  id: 'reports',
  name: 'Reports',
  icon: 'analytics',
  route: '/reports',
},
```

### 3. Customize Navigation

Edit `features/reports/reports.config.ts` to add your navigation items.

---

## Theme Presets

| Theme     | Primary Color | Description              |
| --------- | ------------- | ------------------------ |
| `default` | Material Blue | Standard Material Design |
| `indigo`  | Indigo        | Professional, corporate  |
| `teal`    | Teal          | Fresh, modern            |
| `rose`    | Rose          | Warm, friendly           |

```bash
aegisx shell reports --theme indigo --force
```

---

## View Available Shell Types

```bash
aegisx shell-types
```

This displays detailed information about each shell type, including:

- Layout component used
- Features included
- Best use cases
- Example commands

---

## Troubleshooting

### "Shell already exists"

Use `--force` to overwrite:

```bash
aegisx shell reports --force
```

### "Invalid shell type"

Valid types are: `simple`, `enterprise`, `multi-app`

### Routes Not Working

1. Check that routes are registered in `app.routes.ts`
2. Verify lazy loading path is correct
3. Ensure AuthGuard is configured

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
