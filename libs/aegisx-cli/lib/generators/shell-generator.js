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
 */
const ENTERPRISE_SHELL_CONFIG_TEMPLATE = `import { AxNavigationItem } from '@aegisx/ui';
import { AppConfig } from '../../shared/multi-app';

/**
 * {{_titleCase shellName}} Navigation Configuration
 *
 * Navigation items for the {{displayName}} app.
 */
const {{_camelCase shellName}}Navigation: AxNavigationItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/{{_kebabCase shellName}}',
  },

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
 */
const ENTERPRISE_SHELL_ROUTES_TEMPLATE = `import { Route } from '@angular/router';
{{#if withAuth}}
import { AuthGuard } from '../../core/auth';
{{/if}}

/**
 * {{_titleCase shellName}} Routes
 *
 * All routes under /{{_kebabCase shellName}} use the {{_pascalCase shellName}}ShellComponent as shell
 * with AxEnterpriseLayoutComponent for navigation.
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
      // Dashboard (default route)
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
        data: {
          title: 'Dashboard',
          description: '{{displayName}} Dashboard',
        },
      },

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
 * Dashboard Page Template
 */
const DASHBOARD_PAGE_TEMPLATE = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * {{_titleCase shellName}} Dashboard Page
 */
@Component({
  selector: 'app-{{_kebabCase shellName}}-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: \`
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>{{displayName}} Dashboard</h1>
        <p class="subtitle">Welcome to the {{displayName}} management system</p>
      </header>

      <div class="dashboard-grid">
        <!-- Quick Stats -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>analytics</mat-icon>
            <mat-card-title>Statistics</mat-card-title>
            <mat-card-subtitle>Overview</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Dashboard content goes here...</p>
          </mat-card-content>
        </mat-card>

        <!-- Recent Activity -->
        <mat-card class="activity-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>history</mat-icon>
            <mat-card-title>Recent Activity</mat-card-title>
            <mat-card-subtitle>Latest updates</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Activity content goes here...</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  \`,
  styles: [\`
    .dashboard-container {
      padding: 1.5rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .dashboard-header .subtitle {
      margin: 0.5rem 0 0;
      color: var(--ax-text-subtle);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .stat-card,
    .activity-card {
      height: 200px;
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

    if (!dryRun) {
      console.log(`\n✅ Shell generated successfully!`);
      console.log(`\n📋 Add to app.routes.ts:\n`);
      console.log(routeSnippet);
    }

    return {
      success: true,
      outputDir,
      files: generatedFiles,
      routeSnippet,
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
