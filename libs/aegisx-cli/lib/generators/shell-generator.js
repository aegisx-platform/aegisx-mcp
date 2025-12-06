/**
 * Shell Generator
 *
 * Generates App Shell components for the multi-app architecture.
 * Supports 3 shell types:
 * - simple: Uses AxEmptyLayoutComponent (for auth, landing pages)
 * - enterprise: Uses AxEnterpriseLayoutComponent with single navigation
 * - multi-app: Uses AxEnterpriseLayoutComponent with sub-app tabs
 *
 * @version 1.0.0
 */
const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

// ============================================================================
// NAMING UTILITIES
// ============================================================================

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toUpperCase());
}

/**
 * Convert string to camelCase
 */
function toCamelCase(str) {
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to SCREAMING_SNAKE_CASE
 */
function toScreamingSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toUpperCase();
}

/**
 * Convert string to Title Case
 */
function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ============================================================================
// HANDLEBARS HELPERS
// ============================================================================

// Register helpers with underscore prefix to avoid conflicts with context variables
// IMPORTANT: frontend-generator.js uses kebabCase, camelCase, pascalCase as context variables
// Registering them as helpers causes Handlebars to call the helper instead of reading the variable
// Using _kebabCase, _camelCase, etc. to avoid this conflict
Handlebars.registerHelper('_pascalCase', toPascalCase);
Handlebars.registerHelper('_camelCase', toCamelCase);
Handlebars.registerHelper('_kebabCase', toKebabCase);
Handlebars.registerHelper('_screamingSnakeCase', toScreamingSnakeCase);
Handlebars.registerHelper('_titleCase', toTitleCase);

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('or', function (...args) {
  // Support multiple arguments for or helper
  const options = args[args.length - 1];
  const hasOptionsHash =
    options && typeof options === 'object' && options.hash !== undefined;
  const values = hasOptionsHash ? args.slice(0, -1) : args;
  const result = values.some((v) => Boolean(v));

  // If used as block helper
  if (hasOptionsHash && typeof options.fn === 'function') {
    return result
      ? options.fn(this)
      : options.inverse
        ? options.inverse(this)
        : '';
  }

  // If used as subexpression
  return result;
});

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context, null, 2);
});

// ============================================================================
// SHELL TEMPLATES
// ============================================================================

/**
 * Enterprise Shell Component Template
 */
const ENTERPRISE_SHELL_COMPONENT_TEMPLATE = `import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import {
  AxEnterpriseLayoutComponent,
  AxNavigationItem,
{{#if withThemeSwitcher}}
  AxThemeSwitcherComponent,
{{/if}}
  EnterprisePresetTheme,
} from '@aegisx/ui';
import { {{_screamingSnakeCase shellName}}_APP_CONFIG } from './{{_kebabCase shellName}}.config';
{{#if withAuth}}
import { AuthService } from '../../core/auth';
{{/if}}
import { MultiAppService, HeaderAction } from '../../shared/multi-app';

/**
 * {{_titleCase shellName}} Shell Component
 *
 * Main shell component for the {{displayName}} app.
 * Uses AxEnterpriseLayoutComponent with navigation managed by MultiAppService.
 *
 * Features:
 * - Registers app with MultiAppService on init
 * - Uses centralized context from MultiAppService
 * - Dynamic navigation based on active context
 * - App-specific header actions
 *
 * Routes:
 * - /{{_kebabCase shellName}}          → Dashboard
 */
@Component({
  selector: 'app-{{_kebabCase shellName}}-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    AxEnterpriseLayoutComponent,
{{#if withThemeSwitcher}}
    AxThemeSwitcherComponent,
{{/if}}
  ],
  template: \`
    <ax-enterprise-layout
      [appName]="appName"
      [appTheme]="appTheme"
      [navigation]="currentNavigation()"
{{#if isMultiApp}}
      [subNavigation]="subAppNavigation()"
{{/if}}
      [showFooter]="config.showFooter ?? true"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
{{#if withThemeSwitcher}}
        <!-- Theme Switcher -->
        <ax-theme-switcher mode="dropdown"></ax-theme-switcher>

{{/if}}
        <!-- Dynamic Header Actions from MultiAppService -->
        @for (action of appHeaderActions(); track action.id) {
          <button
            mat-icon-button
            [matTooltip]="action.tooltip"
            (click)="handleAction(action)"
          >
            @if (action.badge) {
              <mat-icon
                [matBadge]="action.badge"
                matBadgeColor="warn"
                matBadgeSize="small"
              >
                \\{{ action.icon }}
              </mat-icon>
            } @else {
              <mat-icon>\\{{ action.icon }}</mat-icon>
            }
          </button>
        }
      </ng-template>

      <!-- Router Outlet for Pages -->
      <router-outlet></router-outlet>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>\\{{ config.footerContent }}</span>
        <span class="footer-version">v1.0</span>
      </ng-template>
    </ax-enterprise-layout>
  \`,
  styles: [
    \`
      :host {
        display: block;
        height: 100vh;
      }

      .footer-version {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
        margin-left: 0.5rem;
      }
    \`,
  ],
})
export class {{_pascalCase shellName}}ShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
{{#if withAuth}}
  private readonly authService = inject(AuthService);
{{/if}}
  private readonly multiAppService = inject(MultiAppService);

  // App configuration
  readonly config = {{_screamingSnakeCase shellName}}_APP_CONFIG;
  readonly appName = this.config.name;
  readonly appTheme = this.config.theme as EnterprisePresetTheme;

  // Get navigation from MultiAppService (centralized)
  readonly currentNavigation = computed<AxNavigationItem[]>(() => {
    return this.multiAppService.currentNavigation();
  });

{{#if isMultiApp}}
  // Sub-app tabs navigation
  readonly subAppNavigation = computed<AxNavigationItem[]>(() => {
    const app = this.multiAppService.activeApp();
    if (!app) return [];
    return app.subApps.map((subApp) => ({
      id: subApp.id,
      title: subApp.name,
      icon: subApp.icon,
      link: subApp.route,
    }));
  });

{{/if}}
  // Header actions from MultiAppService
  readonly appHeaderActions = computed<HeaderAction[]>(() => {
    return this.multiAppService.currentHeaderActions();
  });

{{#if withAuth}}
  // User info
  readonly currentUser = computed(() => {
    const user = this.authService.currentUser();
    if (user) {
      return {
        name: this.authService.userDisplayName(),
        email: user.email,
        avatar: user.avatar || null,
      };
    }
    return null;
  });

{{/if}}
  ngOnInit(): void {
    // Register this app with MultiAppService
    this.multiAppService.registerApp(this.config, {{order}}, true);
  }

  ngOnDestroy(): void {
    // Optionally unregister when shell is destroyed
    // this.multiAppService.unregisterApp(this.config.id);
  }

  /**
   * Handle header action click
   */
  handleAction(action: HeaderAction): void {
    switch (action.action) {
      case 'onNotifications':
        this.onNotifications();
        break;
      case 'onSettings':
        this.onSettings();
        break;
    }
  }

  /**
   * Notifications action
   */
  onNotifications(): void {
    console.log('Notifications clicked');
    // TODO: Open notifications panel
  }

  /**
   * Settings action
   */
  onSettings(): void {
    this.router.navigate(['/{{_kebabCase shellName}}/settings']);
  }

  /**
   * Logout action
   */
  onLogout(): void {
{{#if withAuth}}
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.router.navigate(['/login']);
      },
    });
{{else}}
    console.log('Logout clicked');
    this.router.navigate(['/login']);
{{/if}}
  }
}
`;

/**
 * Enterprise Shell Config Template
 * Navigation: Dashboard link only (main page is ax-launcher landing)
 */
const ENTERPRISE_SHELL_CONFIG_TEMPLATE = `import { AxNavigationItem } from '@aegisx/ui';
import { AppConfig } from '../../shared/multi-app';

/**
 * {{_titleCase shellName}} Navigation Configuration
 *
 * Navigation items for the {{displayName}} app.
 * Note: Main page (/) is ax-launcher, Dashboard is for analytics/KPIs.
 */
const {{_camelCase shellName}}Navigation: AxNavigationItem[] = [
  // Portal (back to main portal)
  {
    id: 'portal',
    title: 'Portal',
    icon: 'home',
    link: '/',
    exactMatch: true,
  },
  // App Home (main page with ax-launcher)
  {
    id: '{{_kebabCase shellName}}',
    title: '{{displayName}}',
    icon: '{{icon}}',
    link: '/{{_kebabCase shellName}}',
    exactMatch: true,
  },
{{#if withDashboard}}
  // Dashboard (analytics, KPIs)
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/{{_kebabCase shellName}}/dashboard',
    exactMatch: true,
  },
{{/if}}
{{#if withSettings}}
  // Settings
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    link: '/{{_kebabCase shellName}}/settings',
  },
{{/if}}
];

/**
 * {{_titleCase shellName}} App Configuration
 *
 * Configuration following AppConfig interface for MultiAppService integration.
 */
export const {{_screamingSnakeCase shellName}}_APP_CONFIG: AppConfig = {
  id: '{{_kebabCase shellName}}',
  name: '{{displayName}}',
  description: '{{description}}',
  theme: '{{theme}}',
  baseRoute: '/{{_kebabCase shellName}}',
  defaultRoute: '/{{_kebabCase shellName}}',
  showFooter: true,
  footerContent: 'AegisX Platform',

  // Header actions
  headerActions: [
    {
      id: 'notifications',
      icon: 'notifications',
      tooltip: 'Notifications',
      badge: 0,
      action: 'onNotifications',
    },
    {
      id: 'settings',
      icon: 'settings',
      tooltip: 'Settings',
      action: 'onSettings',
    },
  ],

{{#if isMultiApp}}
  // Sub-apps configuration
  subApps: [
    {
      id: 'main',
      name: 'Main',
      icon: 'home',
      route: '/{{_kebabCase shellName}}',
      navigation: {{_camelCase shellName}}Navigation,
      isDefault: true,
      description: 'Main dashboard',
    },
    // Add more sub-apps here
  ],
{{else}}
  // Single sub-app containing all navigation
  subApps: [
    {
      id: 'main',
      name: '{{displayName}}',
      icon: '{{icon}}',
      route: '/{{_kebabCase shellName}}',
      navigation: {{_camelCase shellName}}Navigation,
      isDefault: true,
      description: '{{description}}',
      roles: ['admin'],
    },
  ],
{{/if}}
};

/**
 * @deprecated Use {{_screamingSnakeCase shellName}}_APP_CONFIG instead
 * Kept for backward compatibility
 */
export const {{_screamingSnakeCase shellName}}_NAVIGATION = {{_camelCase shellName}}Navigation;
`;

/**
 * Enterprise Shell Routes Template
 * Main page = ax-launcher, Dashboard = child route
 */
const ENTERPRISE_SHELL_ROUTES_TEMPLATE = `import { Route } from '@angular/router';
{{#if withAuth}}
import { AuthGuard } from '../../core/auth';
{{/if}}

/**
 * {{_titleCase shellName}} Routes
 *
 * Route structure:
 * /{{_kebabCase shellName}}           -> Main page (ax-launcher with all modules)
 * /{{_kebabCase shellName}}/dashboard -> Dashboard (analytics, KPIs)
 *
 * CRUD modules are auto-registered at the marked section below.
 */
export const {{_screamingSnakeCase shellName}}_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./{{_kebabCase shellName}}-shell.component').then((m) => m.{{_pascalCase shellName}}ShellComponent),
{{#if withAuth}}
    canActivate: [AuthGuard],
{{/if}}
    children: [
      // Main page - ax-launcher with all modules
      {
        path: '',
        loadComponent: () =>
          import('./pages/main/main.page').then((m) => m.MainPage),
        data: {
          title: '{{displayName}}',
          description: '{{displayName}} modules',
        },
      },

{{#if withDashboard}}
      // Dashboard page
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
        data: {
          title: 'Dashboard',
          description: '{{displayName}} Dashboard',
        },
      },

{{/if}}
{{#if withSettings}}
      // Settings
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.page').then((m) => m.SettingsPage),
        data: {
          title: 'Settings',
          description: '{{displayName}} Settings',
        },
      },

{{/if}}
      // === AUTO-GENERATED ROUTES START ===
      // CRUD modules will be auto-registered here by the generator
      // === AUTO-GENERATED ROUTES END ===
    ],
  },
];
`;

/**
 * Shell Index Template
 */
const SHELL_INDEX_TEMPLATE = `// {{_titleCase shellName}} Shell Module
export * from './{{_kebabCase shellName}}-shell.component';
export * from './{{_kebabCase shellName}}.config';
export * from './{{_kebabCase shellName}}.routes';
`;

/**
 * Dashboard Page Template (simple mat-card outlined placeholder)
 */
const DASHBOARD_PAGE_TEMPLATE = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * {{_titleCase shellName}} Dashboard Page
 *
 * Simple placeholder dashboard with mat-card outlined.
 * Add your analytics, charts, and KPIs here.
 */
@Component({
  selector: 'app-{{_kebabCase shellName}}-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: \`
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">{{displayName}} analytics and overview</p>
      </header>

      <mat-card appearance="outlined" class="placeholder-card">
        <mat-card-content>
          <mat-icon class="placeholder-icon">analytics</mat-icon>
          <h2>Dashboard Coming Soon</h2>
          <p>Add your analytics, charts, and KPIs here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  \`,
  styles: [\`
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ax-text-default);
    }

    .dashboard-header .subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--ax-text-subtle);
    }

    .placeholder-card {
      text-align: center;
      padding: 3rem 2rem;
    }

    .placeholder-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--ax-text-subtle);
      margin-bottom: 1rem;
    }

    .placeholder-card h2 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--ax-text-default);
    }

    .placeholder-card p {
      margin: 0;
      color: var(--ax-text-subtle);
    }
  \`],
})
export class DashboardPage {}
`;

/**
 * Settings Page Template
 */
const SETTINGS_PAGE_TEMPLATE = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

/**
 * {{_titleCase shellName}} Settings Page
 */
@Component({
  selector: 'app-{{_kebabCase shellName}}-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  template: \`
    <div class="settings-container">
      <header class="settings-header">
        <h1>Settings</h1>
        <p class="subtitle">Configure {{displayName}} preferences</p>
      </header>

      <mat-card class="settings-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>tune</mat-icon>
          <mat-card-title>General Settings</mat-card-title>
          <mat-card-subtitle>Basic configuration options</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="setting-item">
            <mat-slide-toggle>Enable notifications</mat-slide-toggle>
          </div>
          <div class="setting-item">
            <mat-slide-toggle>Dark mode</mat-slide-toggle>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  \`,
  styles: [\`
    .settings-container {
      padding: 1.5rem;
    }

    .settings-header {
      margin-bottom: 2rem;
    }

    .settings-header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .settings-header .subtitle {
      margin: 0.5rem 0 0;
      color: var(--ax-text-subtle);
    }

    .settings-card {
      max-width: 600px;
    }

    .setting-item {
      margin: 1rem 0;
    }
  \`],
})
export class SettingsPage {}
`;

// ============================================================================
// MAIN PAGE TEMPLATES (ax-launcher as main landing page)
// ============================================================================

/**
 * Main Page Component Template (uses ax-launcher)
 * This is the main landing page showing all CRUD modules
 */
const MAIN_PAGE_COMPONENT_TEMPLATE = `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AxLauncherComponent,
  LauncherApp,
  LauncherAppClickEvent,
} from '@aegisx/ui';
import { MODULE_ITEMS } from './main.config';

/**
 * {{_titleCase shellName}} Main Page
 *
 * Main landing page displaying all available modules.
 * Uses ax-launcher component for card-based navigation.
 *
 * Modules are configured in main.config.ts and can be
 * auto-registered by CRUD generator when using --shell option.
 */
@Component({
  selector: 'app-{{_kebabCase shellName}}-main',
  standalone: true,
  imports: [CommonModule, AxLauncherComponent],
  template: \`
    <div class="main-container">
      <!-- Launcher Grid -->
      <ax-launcher
        [apps]="moduleItems"
        title="{{displayName}}"
        subtitle="Select a module to manage"
        (appClick)="onModuleSelect($event)"
      />
    </div>
  \`,
  styles: [
    \`
      .main-container {
        padding: var(--ax-spacing-lg, 24px);
        max-width: 1400px;
        margin: 0 auto;
      }
    \`,
  ],
})
export class MainPage {
  private readonly router = inject(Router);

  readonly moduleItems: LauncherApp[] = MODULE_ITEMS;

  /**
   * Handle module selection from launcher
   */
  onModuleSelect(event: LauncherAppClickEvent): void {
    const app = event.app;
    if (app.route) {
      if (event.newTab) {
        window.open(app.route, '_blank');
      } else {
        this.router.navigate([app.route]);
      }
    } else if (app.externalUrl) {
      window.open(app.externalUrl, '_blank');
    }
  }
}
`;

/**
 * Main Page Config Template (with auto-registration markers)
 */
const MAIN_PAGE_CONFIG_TEMPLATE = `import { LauncherApp } from '@aegisx/ui';

/**
 * {{_titleCase shellName}} Module Configuration
 *
 * This file contains the configuration for modules
 * displayed in the ax-launcher component on the main page.
 *
 * NOTE: CRUD generator will auto-register new modules here when using --shell option.
 * Generator looks for the MODULE_ITEMS array and appends new entries.
 */

/**
 * Module Items
 *
 * Each item represents a CRUD module accessible from the launcher.
 * Generator will auto-add entries when using: --shell {{_kebabCase shellName}}
 *
 * Available colors: 'pink', 'peach', 'mint', 'blue', 'yellow', 'purple', 'teal', 'red', 'indigo', 'gray'
 */
export const MODULE_ITEMS: LauncherApp[] = [
  // === AUTO-GENERATED ENTRIES START ===
  // CRUD modules will be auto-registered here by the generator
  // === AUTO-GENERATED ENTRIES END ===
];
`;

// ============================================================================
// SECTION PAGE TEMPLATES (optional sub-sections with ax-launcher)
// ============================================================================

/**
 * Section Page Component Template (uses ax-launcher)
 * Used for optional sub-sections like master-data, budget-planning, etc.
 */
const SECTION_PAGE_COMPONENT_TEMPLATE = `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AxLauncherComponent,
  LauncherApp,
  LauncherAppClickEvent,
} from '@aegisx/ui';
import { SECTION_ITEMS } from './{{sectionKebab}}.config';

/**
 * {{sectionTitle}} Section Page
 *
 * Displays modules for the {{sectionTitle}} section.
 * Uses ax-launcher component for card-based navigation.
 */
@Component({
  selector: 'app-{{sectionKebab}}',
  standalone: true,
  imports: [CommonModule, AxLauncherComponent],
  template: \`
    <div class="section-container">
      <!-- Launcher Grid -->
      <ax-launcher
        [apps]="sectionItems"
        title="{{sectionTitle}}"
        subtitle="Select a module to manage"
        (appClick)="onModuleSelect($event)"
      />
    </div>
  \`,
  styles: [
    \`
      .section-container {
        padding: var(--ax-spacing-lg, 24px);
        max-width: 1400px;
        margin: 0 auto;
      }
    \`,
  ],
})
export class {{sectionPascal}}Page {
  private readonly router = inject(Router);

  readonly sectionItems: LauncherApp[] = SECTION_ITEMS;

  /**
   * Handle module selection from launcher
   */
  onModuleSelect(event: LauncherAppClickEvent): void {
    const app = event.app;
    if (app.route) {
      if (event.newTab) {
        window.open(app.route, '_blank');
      } else {
        this.router.navigate([app.route]);
      }
    } else if (app.externalUrl) {
      window.open(app.externalUrl, '_blank');
    }
  }
}
`;

/**
 * Section Config Template (with auto-registration markers)
 */
const SECTION_CONFIG_TEMPLATE = `import { LauncherApp } from '@aegisx/ui';

/**
 * {{sectionTitle}} Section Configuration
 *
 * This file contains the configuration for {{sectionTitle}} modules
 * displayed in the ax-launcher component.
 *
 * NOTE: CRUD generator will auto-register new modules here when using --section {{sectionKebab}}
 */

/**
 * Section Items
 *
 * Each item represents a CRUD module accessible from the launcher.
 * Generator will auto-add entries when using: --shell {{_kebabCase shellName}} --section {{sectionKebab}}
 *
 * Available colors: 'pink', 'peach', 'mint', 'blue', 'yellow', 'purple', 'teal', 'red', 'indigo', 'gray'
 */
export const SECTION_ITEMS: LauncherApp[] = [
  // === AUTO-GENERATED ENTRIES START ===
  // CRUD modules will be auto-registered here by the generator
  // === AUTO-GENERATED ENTRIES END ===
];
`;

// ============================================================================
// SIMPLE SHELL TEMPLATES
// ============================================================================

/**
 * Simple Shell Component Template (uses AxEmptyLayoutComponent)
 */
const SIMPLE_SHELL_COMPONENT_TEMPLATE = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AxEmptyLayoutComponent } from '@aegisx/ui';

/**
 * {{_titleCase shellName}} Shell Component
 *
 * Simple shell using AxEmptyLayoutComponent.
 * Suitable for auth pages, landing pages, or minimal layouts.
 */
@Component({
  selector: 'app-{{_kebabCase shellName}}-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AxEmptyLayoutComponent,
  ],
  template: \`
    <ax-empty-layout>
      <router-outlet></router-outlet>
    </ax-empty-layout>
  \`,
  styles: [
    \`
      :host {
        display: block;
        height: 100vh;
      }
    \`,
  ],
})
export class {{_pascalCase shellName}}ShellComponent {}
`;

/**
 * Simple Shell Routes Template
 */
const SIMPLE_SHELL_ROUTES_TEMPLATE = `import { Route } from '@angular/router';

/**
 * {{_titleCase shellName}} Routes
 *
 * Routes using simple shell layout.
 */
export const {{_screamingSnakeCase shellName}}_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./{{_kebabCase shellName}}-shell.component').then((m) => m.{{_pascalCase shellName}}ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/main/main.page').then((m) => m.MainPage),
        data: {
          title: '{{displayName}}',
        },
      },
    ],
  },
];
`;

/**
 * Simple Main Page Template
 */
const SIMPLE_MAIN_PAGE_TEMPLATE = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

/**
 * {{_titleCase shellName}} Main Page
 */
@Component({
  selector: 'app-{{_kebabCase shellName}}-main',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
  template: \`
    <div class="main-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{displayName}}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Main content goes here...</p>
        </mat-card-content>
      </mat-card>
    </div>
  \`,
  styles: [\`
    .main-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      padding: 1rem;
    }

    mat-card {
      max-width: 400px;
      width: 100%;
    }
  \`],
})
export class MainPage {}
`;

// ============================================================================
// SHELL GENERATOR CLASS
// ============================================================================

/**
 * Shell Generator
 *
 * Generates App Shell components for the multi-app architecture.
 */
class ShellGenerator {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      force: false,
      type: 'enterprise', // simple, enterprise, multi-app
      app: 'web', // web, admin
      theme: 'default',
      order: 0,
      withDashboard: true,
      withSettings: false,
      withAuth: true,
      withThemeSwitcher: false,
      ...options,
    };
  }

  /**
   * Generate shell files
   */
  async generate(shellName, displayName = null) {
    const {
      dryRun,
      force,
      type,
      app,
      theme,
      order,
      withDashboard,
      withSettings,
      withAuth,
      withThemeSwitcher,
    } = this.options;

    // Prepare context
    const context = {
      shellName,
      displayName: displayName || toTitleCase(shellName),
      description: `${displayName || toTitleCase(shellName)} management system`,
      icon: 'apps',
      theme,
      order,
      withDashboard,
      withSettings,
      withAuth,
      withThemeSwitcher,
      isMultiApp: type === 'multi-app',
      isSimple: type === 'simple',
      timestamp: new Date().toISOString(),
    };

    console.log(`\n🐚 Generating ${type} shell: ${shellName}`);
    console.log(`   📂 Target app: ${app}`);
    console.log(`   🎨 Theme: ${theme}`);
    console.log(`   🔢 Order: ${order}`);

    // Determine output directory (find project root from .env.local or package.json with workspaces)
    const cwd = process.cwd();
    const shellKebab = toKebabCase(shellName);

    // Find project root by looking for package.json with workspaces or apps directory
    let projectRoot = cwd;
    let searchDir = cwd;
    while (searchDir !== path.dirname(searchDir)) {
      const appsDir = path.join(searchDir, 'apps');
      try {
        require('fs').accessSync(appsDir);
        projectRoot = searchDir;
        break;
      } catch {
        // Try parent
        searchDir = path.dirname(searchDir);
      }
    }

    const outputDir = path.resolve(
      projectRoot,
      `apps/${app}/src/app/features/${shellKebab}`,
    );

    console.log(`   📁 Output: ${outputDir}`);

    // Check if directory exists
    try {
      await fs.access(outputDir);
      if (!force) {
        console.log(`\n⚠️  Shell directory already exists: ${outputDir}`);
        console.log(`   Use --force to overwrite`);
        return { success: false, reason: 'exists' };
      }
      console.log(`   ⚠️  Overwriting existing shell (--force)`);
    } catch {
      // Directory doesn't exist, will create
    }

    // Generate files based on shell type
    const files = [];

    if (type === 'simple') {
      files.push(
        {
          path: `${shellKebab}-shell.component.ts`,
          template: SIMPLE_SHELL_COMPONENT_TEMPLATE,
        },
        {
          path: `${shellKebab}.routes.ts`,
          template: SIMPLE_SHELL_ROUTES_TEMPLATE,
        },
        { path: 'index.ts', template: SHELL_INDEX_TEMPLATE },
        {
          path: 'pages/main/main.page.ts',
          template: SIMPLE_MAIN_PAGE_TEMPLATE,
        },
      );
    } else {
      // Enterprise or Multi-App
      files.push(
        {
          path: `${shellKebab}-shell.component.ts`,
          template: ENTERPRISE_SHELL_COMPONENT_TEMPLATE,
        },
        {
          path: `${shellKebab}.config.ts`,
          template: ENTERPRISE_SHELL_CONFIG_TEMPLATE,
        },
        {
          path: `${shellKebab}.routes.ts`,
          template: ENTERPRISE_SHELL_ROUTES_TEMPLATE,
        },
        { path: 'index.ts', template: SHELL_INDEX_TEMPLATE },
      );

      // Main page with ax-launcher (always generated for enterprise shell)
      files.push(
        {
          path: 'pages/main/main.page.ts',
          template: MAIN_PAGE_COMPONENT_TEMPLATE,
        },
        {
          path: 'pages/main/main.config.ts',
          template: MAIN_PAGE_CONFIG_TEMPLATE,
        },
      );

      // Create modules folder for CRUD modules
      files.push({
        path: 'modules/.gitkeep',
        template: '# CRUD modules will be generated here\n',
      });

      if (withDashboard) {
        files.push({
          path: 'pages/dashboard/dashboard.page.ts',
          template: DASHBOARD_PAGE_TEMPLATE,
        });
      }

      if (withSettings) {
        files.push({
          path: 'pages/settings/settings.page.ts',
          template: SETTINGS_PAGE_TEMPLATE,
        });
      }
    }

    // Process and write files
    const generatedFiles = [];

    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      const template = Handlebars.compile(file.template);
      const content = template(context);

      if (dryRun) {
        console.log(`\n📄 Would generate: ${file.path}`);
        console.log('─'.repeat(60));
        console.log(
          content.substring(0, 500) + (content.length > 500 ? '\n...' : ''),
        );
      } else {
        // Create directory if needed
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`   ✅ Generated: ${file.path}`);
        generatedFiles.push(filePath);
      }
    }

    // Generate route registration snippet
    const routeSnippet = this.generateRouteSnippet(context);

    // Auto-register route in app.routes.ts
    const routeResult = await this.registerShellRoute(
      context,
      projectRoot,
      app,
    );

    if (!dryRun) {
      console.log(`\n✅ Shell generated successfully!`);

      if (!routeResult.success) {
        console.log(`\n📋 Add to app.routes.ts manually:\n`);
        console.log(routeSnippet);
      }
    }

    return {
      success: true,
      outputDir,
      files: generatedFiles,
      routeSnippet,
      routeRegistered: routeResult.success,
      context,
    };
  }

  /**
   * Generate route registration snippet
   */
  generateRouteSnippet(context) {
    const shellKebab = toKebabCase(context.shellName);
    const routesName = `${toScreamingSnakeCase(context.shellName)}_ROUTES`;

    return `// ${context.displayName}
{
  path: '${shellKebab}',
  loadChildren: () =>
    import('./features/${shellKebab}/${shellKebab}.routes').then((m) => m.${routesName}),
},`;
  }

  /**
   * Auto-register shell route in app.routes.ts
   */
  async registerShellRoute(context, projectRoot, targetApp) {
    const shellKebab = toKebabCase(context.shellName);
    const routesName = `${toScreamingSnakeCase(context.shellName)}_ROUTES`;
    const appRoutesPath = path.join(
      projectRoot,
      `apps/${targetApp}/src/app/app.routes.ts`,
    );

    try {
      const content = await fs.readFile(appRoutesPath, 'utf8');

      // Check if route already exists
      if (content.includes(`path: '${shellKebab}'`)) {
        console.log(
          `   ℹ️  Route '${shellKebab}' already registered in app.routes.ts`,
        );
        return { success: true, alreadyExists: true };
      }

      // Find the Error Pages section marker to insert before it
      const errorPagesMarker =
        '// ============================================\n  // Error Pages';
      const featureAppsMarker = '// Feature Apps (Enterprise Shell)';

      let newContent;

      if (content.includes(errorPagesMarker)) {
        // Insert before Error Pages section
        const routeEntry = `
  // ${context.displayName}
  {
    path: '${shellKebab}',
    loadChildren: () =>
      import('./features/${shellKebab}/${shellKebab}.routes').then(
        (m) => m.${routesName},
      ),
  },

  `;
        newContent = content.replace(
          errorPagesMarker,
          routeEntry + errorPagesMarker,
        );
      } else if (content.includes(featureAppsMarker)) {
        // Find end of Feature Apps section and insert there
        const featureAppsIndex = content.indexOf(featureAppsMarker);
        const afterMarker = content.substring(featureAppsIndex);

        // Find the next section marker after Feature Apps
        const nextSectionMatch = afterMarker.match(
          /\n {2}\/\/ =+\n {2}\/\/ (?!Feature Apps)/,
        );

        if (nextSectionMatch) {
          const insertPosition = featureAppsIndex + nextSectionMatch.index;
          const routeEntry = `
  // ${context.displayName}
  {
    path: '${shellKebab}',
    loadChildren: () =>
      import('./features/${shellKebab}/${shellKebab}.routes').then(
        (m) => m.${routesName},
      ),
  },
`;
          newContent =
            content.substring(0, insertPosition) +
            routeEntry +
            content.substring(insertPosition);
        } else {
          console.log(`   ⚠️  Could not find insertion point in app.routes.ts`);
          return { success: false, reason: 'no-marker' };
        }
      } else {
        console.log(
          `   ⚠️  Could not find Feature Apps or Error Pages section in app.routes.ts`,
        );
        return { success: false, reason: 'no-marker' };
      }

      // Write updated content
      if (this.options.dryRun) {
        console.log(
          `   📋 Would register route '${shellKebab}' in app.routes.ts`,
        );
      } else {
        await fs.writeFile(appRoutesPath, newContent, 'utf8');
        console.log(
          `   ✅ Auto-registered route '${shellKebab}' in app.routes.ts`,
        );
      }

      return { success: true };
    } catch (error) {
      console.log(`   ⚠️  Could not auto-register route: ${error.message}`);
      return { success: false, reason: error.message };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  ShellGenerator,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toScreamingSnakeCase,
  toTitleCase,
};
